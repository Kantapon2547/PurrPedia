def serialize_breed(breed, user=None):
    """Serialize a Breed instance. Includes favorited flag if user is authenticated."""
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


def serialize_care_tip(tip):
    """Serialize a CareTip instance."""
    return {
        "id": tip.id,
        "title": tip.title,
        "content": tip.content,
        "category": tip.category,
        "breed_id": tip.breed_id,
        "created_at": tip.created_at,
    }
