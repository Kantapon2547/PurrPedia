from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from users.models import UserProfile


def get_admin_profile_or_error(user):
    """
    Returns (profile, None) if the user is an admin.
    Returns (None, 403 Response) if not.
    Usage:
        profile, err = get_admin_profile_or_error(request.user)
        if err:
            return err
    """
    profile = get_object_or_404(UserProfile, user=user)
    if profile.role != "admin":
        return None, Response({"error": "Admin access required."}, status=403)
    return profile, None


def get_profile(user):
    """Shortcut to fetch a UserProfile for any authenticated user."""
    return get_object_or_404(UserProfile, user=user)
