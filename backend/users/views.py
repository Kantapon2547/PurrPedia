from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import UserProfile
from .serializers import serialize_user, serialize_profile
from .services import (
    generate_tokens, register_user, authenticate_user,
    update_profile, toggle_breed_favorite,
)
from breeds.models import Breed
from backend.permissions import get_admin_profile_or_error, get_profile


@api_view(["POST"])
@permission_classes([AllowAny])
def signup(request):
    try:
        user = register_user(
            username=request.data.get("username"),
            email=request.data.get("email", ""),
            password=request.data.get("password"),
        )
    except ValueError as e:
        return Response({"error": str(e)}, status=400)

    tokens = generate_tokens(user)
    return Response({
        "message": "Account created successfully.",
        "user": {"id": user.id, "username": user.username, "email": user.email, "role": "user"},
        **tokens,
    }, status=201)


@api_view(["POST"])
@permission_classes([AllowAny])
def signin(request):
    try:
        user = authenticate_user(
            username=request.data.get("username"),
            password=request.data.get("password"),
        )
    except ValueError as e:
        return Response({"error": str(e)}, status=401)

    profile = get_profile(user)
    tokens = generate_tokens(user)
    return Response({
        "message": "Login successful.",
        "user": {"id": user.id, "username": user.username, "email": user.email, "role": profile.role},
        **tokens,
    })


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def profile(request):
    user_profile = get_profile(request.user)

    if request.method == "GET":
        return Response(serialize_profile(request.user, user_profile))

    update_profile(request.user, user_profile, request.data, request.FILES)
    return Response({"message": "Profile updated."})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_favorite(request, breed_id):
    user_profile = get_profile(request.user)
    breed = get_object_or_404(Breed, id=breed_id)
    favorited = toggle_breed_favorite(user_profile, breed)
    return Response({"favorited": favorited})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_users(request):
    profile, err = get_admin_profile_or_error(request.user)
    if err:
        return err

    users = User.objects.select_related("profile").all()
    data = []
    for u in users:
        p, _ = UserProfile.objects.get_or_create(user=u)
        data.append(serialize_user(u, p))
    return Response(data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_user_role(request, user_id):
    profile, err = get_admin_profile_or_error(request.user)
    if err:
        return err

    target_user = get_object_or_404(User, id=user_id)
    target_profile, _ = UserProfile.objects.get_or_create(user=target_user)

    new_role = request.data.get("role")
    if new_role not in ["user", "admin"]:
        return Response({"error": "Invalid role."}, status=400)

    target_profile.role = new_role
    target_profile.save()
    return Response({"message": f"Role updated to {new_role}."})