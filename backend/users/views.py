from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile
from breeds.models import Breed


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


@api_view(["POST"])
@permission_classes([AllowAny])
def signup(request):
    username = request.data.get("username")
    email = request.data.get("email", "")
    password = request.data.get("password")

    if not username or not password:
        return Response({"error": "Username and password are required."}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already taken."}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)
    UserProfile.objects.create(user=user)

    tokens = get_tokens_for_user(user)
    return Response({
        "message": "Account created successfully.",
        "user": {"[id]": user.id, "username": user.username, "email": user.email, "role": "user"},
        **tokens,
    }, status=201)


@api_view(["POST"])
@permission_classes([AllowAny])
def signin(request):
    username = request.data.get("username")
    password = request.data.get("password")

    try:
        user_obj = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "Invalid credentials."}, status=401)

    if not user_obj.check_password(password):
        return Response({"error": "Invalid credentials."}, status=401)

    profile, _ = UserProfile.objects.get_or_create(user=user_obj)
    tokens = get_tokens_for_user(user_obj)
    return Response({
        "message": "Login successful.",
        "user": {
            "[id]": user_obj.id,
            "username": user_obj.username,
            "email": user_obj.email,
            "role": profile.role,
        },
        **tokens,
    })


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def profile(request):
    profile = get_object_or_404(UserProfile, user=request.user)

    if request.method == "GET":
        favorites = [{"[id]": b.id, "name": b.name, "image": b.image.url if b.image else None} for b in profile.favorites.all()]
        return Response({
            "[id]": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "bio": profile.bio,
            "role": profile.role,
            "preferences": profile.preferences,
            "favorites": favorites,
            "avatar": profile.avatar.url if profile.avatar else None,
        })

    if request.method == "PATCH":
        if "bio" in request.data:
            profile.bio = request.data["bio"]
        if "preferences" in request.data:
            profile.preferences = request.data["preferences"]
        if "avatar" in request.FILES:
            profile.avatar = request.FILES["avatar"]
        profile.save()

        if "email" in request.data:
            request.user.email = request.data["email"]
            request.user.save()

        return Response({"message": "Profile updated."})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_favorite(request, breed_id):
    profile = get_object_or_404(UserProfile, user=request.user)
    breed = get_object_or_404(Breed, id=breed_id)

    if breed in profile.favorites.all():
        profile.favorites.remove(breed)
        return Response({"favorited": False})
    else:
        profile.favorites.add(breed)
        return Response({"favorited": True})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_users(request):
    profile = get_object_or_404(UserProfile, user=request.user)
    if profile.role != "admin":
        return Response({"error": "Forbidden"}, status=403)

    users = User.objects.select_related("profile").all()
    data = []
    for u in users:
        p, _ = UserProfile.objects.get_or_create(user=u)
        data.append({
            "[id]": u.id,
            "username": u.username,
            "email": u.email,
            "role": p.role,
            "date_joined": u.date_joined,
        })
    return Response(data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_user_role(request, user_id):
    requester_profile = get_object_or_404(UserProfile, user=request.user)
    if requester_profile.role != "admin":
        return Response({"error": "Forbidden"}, status=403)

    target_user = get_object_or_404(User, id=user_id)
    target_profile, _ = UserProfile.objects.get_or_create(user=target_user)
    new_role = request.data.get("role")
    if new_role not in ["user", "admin"]:
        return Response({"error": "Invalid role."}, status=400)

    target_profile.role = new_role
    target_profile.save()
    return Response({"message": f"Role updated to {new_role}."})