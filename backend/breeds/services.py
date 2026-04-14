from .models import Breed, CareTip


BREED_FIELDS = [
    "name", "origin", "description", "temperament",
    "lifespan", "weight", "coat_length", "hypoallergenic", "tags",
]


def get_filtered_breeds(params):
    """Apply search/filter query params to the Breed queryset."""
    qs = Breed.objects.all().order_by("name")
    if params.get("search"):
        qs = qs.filter(name__icontains=params["search"])
    if params.get("temperament"):
        qs = qs.filter(temperament__icontains=params["temperament"])
    if params.get("hypoallergenic"):
        qs = qs.filter(hypoallergenic=(params["hypoallergenic"].lower() == "true"))
    if params.get("origin"):
        qs = qs.filter(origin__icontains=params["origin"])
    return qs


def create_breed(data, files, user):
    """Create and save a new Breed from request data."""
    breed = Breed(
        name=data.get("name"),
        origin=data.get("origin", ""),
        description=data.get("description", ""),
        temperament=data.get("temperament", ""),
        lifespan=data.get("lifespan", ""),
        weight=data.get("weight", ""),
        coat_length=data.get("coat_length", ""),
        hypoallergenic=data.get("hypoallergenic", False),
        tags=data.get("tags", []),
        created_by=user,
    )
    if "image" in files:
        breed.image = files["image"]
    breed.save()
    return breed


def update_breed(breed, data, files):
    """Update an existing Breed from request data."""
    for field in BREED_FIELDS:
        if field in data:
            setattr(breed, field, data[field])
    if "image" in files:
        breed.image = files["image"]
    breed.save()
    return breed


def get_recommended_breeds(profile):
    """Return up to 6 breeds matching user preferences, or 6 random ones."""
    prefs = profile.preferences
    if prefs:
        return Breed.objects.filter(temperament__in=prefs).order_by("?")[:6]
    return Breed.objects.order_by("?")[:6]


def get_filtered_care_tips(params):
    """Apply category/breed_id filters to the CareTip queryset."""
    qs = CareTip.objects.all().order_by("-created_at")
    if params.get("category"):
        qs = qs.filter(category=params["category"])
    if params.get("breed_id"):
        qs = qs.filter(breed_id=params["breed_id"])
    return qs


def create_care_tip(data, user):
    """Create and save a new CareTip from request data."""
    tip = CareTip(
        title=data.get("title"),
        content=data.get("content"),
        category=data.get("category"),
        breed_id=data.get("breed_id"),
        created_by=user,
    )
    tip.save()
    return tip


def update_care_tip(tip, data):
    """Update an existing CareTip from request data."""
    for field in ["title", "content", "category", "breed_id"]:
        if field in data:
            setattr(tip, field, data[field])
    tip.save()
    return tip
