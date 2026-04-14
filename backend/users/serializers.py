def serialize_user(user, profile):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": profile.role,
        "date_joined": user.date_joined,
    }


def serialize_profile(user, profile):
    favorites = [
        {"id": b.id, "name": b.name, "image": b.image.url if b.image else None}
        for b in profile.favorites.all()
    ]
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "bio": profile.bio,
        "role": profile.role,
        "preferences": profile.preferences,
        "favorites": favorites,
        "avatar": profile.avatar.url if profile.avatar else None,
    }
