from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Breed, CareTip
from users.models import UserProfile


def breed_to_dict(breed, user=None):
    favorited = False
    if user and user.is_authenticated:
        try:
            favorited = breed in user.profile.favorites.all()
        except Exception:
            pass
    return {
        "id": breed.id,
        "name": breed.name,
        "origin": breed.origin,
        "description": breed.description,
        "temperament": breed.temperament,
        "lifespan": breed.lifespan,
        "weight": breed.weight,
        "coat_length": breed.coat_length,
        "hypoallergenic": breed.hypoallergenic,
        "image": breed.image.url if breed.image else None,
        "tags": breed.tags,
        "created_at": breed.created_at,
        "favorited": favorited,
    }


def care_tip_to_dict(tip):
    return {
        "id": tip.id,
        "title": tip.title,
        "content": tip.content,
        "category": tip.category,
        "breed_id": tip.breed_id,
        "created_at": tip.created_at,
    }


@api_view(["GET", "POST"])
def breeds_list(request):
    if request.method == "GET":
        qs = Breed.objects.all().order_by("name")
        search = request.query_params.get("search", "")
        temperament = request.query_params.get("temperament", "")
        hypoallergenic = request.query_params.get("hypoallergenic", "")
        origin = request.query_params.get("origin", "")

        if search:
            qs = qs.filter(name__icontains=search)
        if temperament:
            qs = qs.filter(temperament__icontains=temperament)
        if hypoallergenic:
            qs = qs.filter(hypoallergenic=(hypoallergenic.lower() == "true"))
        if origin:
            qs = qs.filter(origin__icontains=origin)

        return Response([breed_to_dict(b, request.user) for b in qs])

    # POST — admin only
    if not request.user.is_authenticated:
        return Response({"error": "Authentication required."}, status=401)
    profile = get_object_or_404(UserProfile, user=request.user)
    if profile.role != "admin":
        return Response({"error": "Admin access required."}, status=403)

    breed = Breed(
        name=request.data.get("name"),
        origin=request.data.get("origin", ""),
        description=request.data.get("description", ""),
        temperament=request.data.get("temperament", ""),
        lifespan=request.data.get("lifespan", ""),
        weight=request.data.get("weight", ""),
        coat_length=request.data.get("coat_length", ""),
        hypoallergenic=request.data.get("hypoallergenic", False),
        tags=request.data.get("tags", []),
        created_by=request.user,
    )
    if "image" in request.FILES:
        breed.image = request.FILES["image"]
    breed.save()
    return Response(breed_to_dict(breed), status=201)


@api_view(["GET", "PUT", "DELETE"])
def breed_detail(request, pk):
    breed = get_object_or_404(Breed, pk=pk)

    if request.method == "GET":
        tips = CareTip.objects.filter(breed=breed)
        data = breed_to_dict(breed, request.user)
        data["care_tips"] = [care_tip_to_dict(t) for t in tips]
        return Response(data)

    # Mutating — admin only
    if not request.user.is_authenticated:
        return Response({"error": "Authentication required."}, status=401)
    profile = get_object_or_404(UserProfile, user=request.user)
    if profile.role != "admin":
        return Response({"error": "Admin access required."}, status=403)

    if request.method == "PUT":
        for field in ["name", "origin", "description", "temperament", "lifespan", "weight", "coat_length", "hypoallergenic", "tags"]:
            if field in request.data:
                setattr(breed, field, request.data[field])
        if "image" in request.FILES:
            breed.image = request.FILES["image"]
        breed.save()
        return Response(breed_to_dict(breed))

    if request.method == "DELETE":
        breed.delete()
        return Response({"message": "Breed deleted."}, status=204)


@api_view(["GET", "POST"])
def care_tips_list(request):
    if request.method == "GET":
        qs = CareTip.objects.all().order_by("-created_at")
        category = request.query_params.get("category", "")
        breed_id = request.query_params.get("breed_id", "")
        if category:
            qs = qs.filter(category=category)
        if breed_id:
            qs = qs.filter(breed_id=breed_id)
        return Response([care_tip_to_dict(t) for t in qs])

    if not request.user.is_authenticated:
        return Response({"error": "Authentication required."}, status=401)
    profile = get_object_or_404(UserProfile, user=request.user)
    if profile.role != "admin":
        return Response({"error": "Admin access required."}, status=403)

    tip = CareTip(
        title=request.data.get("title"),
        content=request.data.get("content"),
        category=request.data.get("category"),
        breed_id=request.data.get("breed_id"),
        created_by=request.user,
    )
    tip.save()
    return Response(care_tip_to_dict(tip), status=201)


@api_view(["PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def care_tip_detail(request, pk):
    tip = get_object_or_404(CareTip, pk=pk)
    profile = get_object_or_404(UserProfile, user=request.user)
    if profile.role != "admin":
        return Response({"error": "Admin access required."}, status=403)

    if request.method == "PUT":
        for field in ["title", "content", "category", "breed_id"]:
            if field in request.data:
                setattr(tip, field, request.data[field])
        tip.save()
        return Response(care_tip_to_dict(tip))

    if request.method == "DELETE":
        tip.delete()
        return Response({"message": "Care tip deleted."}, status=204)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recommended_breeds(request):
    profile = get_object_or_404(UserProfile, user=request.user)
    prefs = profile.preferences  # list of temperament strings

    if prefs:
        qs = Breed.objects.filter(temperament__in=prefs).order_by("?")[:6]
    else:
        qs = Breed.objects.order_by("?")[:6]

    return Response([breed_to_dict(b, request.user) for b in qs])