from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile


def generate_tokens(user):
    """Return a dict with access and refresh JWT tokens for a user."""
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


def register_user(username, email, password):
    """
    Create a new User + UserProfile.
    Raises ValueError if username is taken or fields are missing.
    """
    if not username or not password:
        raise ValueError("Username and password are required.")
    if User.objects.filter(username=username).exists():
        raise ValueError("Username already taken.")
    user = User.objects.create_user(username=username, email=email, password=password)
    UserProfile.objects.create(user=user)
    return user


def authenticate_user(username, password):
    """
    Validate credentials and return the User.
    Raises ValueError on bad credentials.
    """
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        raise ValueError("Invalid credentials.")
    if not user.check_password(password):
        raise ValueError("Invalid credentials.")
    UserProfile.objects.get_or_create(user=user)
    return user


def update_profile(user, profile, data, files):
    """Apply PATCH data to a UserProfile and User email."""
    if "bio" in data:
        profile.bio = data["bio"]
    if "preferences" in data:
        profile.preferences = data["preferences"]
    if "avatar" in files:
        profile.avatar = files["avatar"]
    profile.save()
    if "email" in data:
        user.email = data["email"]
        user.save()


def toggle_breed_favorite(profile, breed):
    """Add or remove a breed from a user's favorites. Returns the new state."""
    if breed in profile.favorites.all():
        profile.favorites.remove(breed)
        return False
    profile.favorites.add(breed)
    return True
