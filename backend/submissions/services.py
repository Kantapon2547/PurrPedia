import json
from .models import Submission
from breeds.models import Breed, CareTip


def parse_tags(raw_tags):
    """Safely parse tags from a raw JSON string."""
    try:
        return json.loads(raw_tags) if raw_tags else []
    except Exception:
        return []


def create_submission(data, files, user):
    """Create and save a new Submission from request data."""
    return Submission.objects.create(
        title=data.get("title", ""),
        content=data.get("content", ""),
        submission_type=data.get("submission_type", "breed"),
        related_breed_id=data.get("related_breed") or None,
        submitted_by=user,
        image=files.get("image"),
        origin=data.get("origin", ""),
        temperament=data.get("temperament", ""),
        lifespan=data.get("lifespan", ""),
        weight=data.get("weight", ""),
        coat_length=data.get("coat_length", ""),
        hypoallergenic=str(data.get("hypoallergenic")).lower() == "true",
        tags=parse_tags(data.get("tags")),
    )


def apply_approved_submission(submission):
    """
    Promote an approved submission into the main content tables.
    Called only when status is set to 'approved'.
    """
    if submission.submission_type == "breed":
        _apply_new_breed(submission)
    elif submission.submission_type == "edit" and submission.related_breed:
        _apply_breed_edit(submission)
    elif submission.submission_type == "care_tip":
        _apply_care_tip(submission)


def _apply_new_breed(submission):
    if not Breed.objects.filter(name=submission.title).exists():
        Breed.objects.create(
            name=submission.title,
            description=submission.content,
            origin=submission.origin,
            temperament=submission.temperament,
            lifespan=submission.lifespan,
            weight=submission.weight,
            coat_length=submission.coat_length,
            hypoallergenic=submission.hypoallergenic,
            tags=submission.tags or [],
            image=submission.image,
            created_by=submission.submitted_by,
        )


def _apply_breed_edit(submission):
    breed = submission.related_breed
    breed.description = submission.content
    breed.origin = submission.origin or breed.origin
    breed.temperament = submission.temperament or breed.temperament
    breed.lifespan = submission.lifespan or breed.lifespan
    breed.weight = submission.weight or breed.weight
    breed.coat_length = submission.coat_length or breed.coat_length
    breed.hypoallergenic = submission.hypoallergenic
    breed.tags = submission.tags or breed.tags
    if submission.image:
        breed.image = submission.image
    breed.save()


def _apply_care_tip(submission):
    CareTip.objects.create(
        title=submission.title,
        content=submission.content,
        breed=submission.related_breed,
        created_by=submission.submitted_by,
    )
