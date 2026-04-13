from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
import json

from .models import Submission
from breeds.models import Breed, CareTip
from users.models import UserProfile


# ✅ GET ALL (ADMIN ONLY)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def submissions_list(request):
    profile = get_object_or_404(UserProfile, user=request.user)

    if profile.role != "admin":
        return Response({"error": "Admin access required."}, status=403)

    submissions = Submission.objects.all().order_by("-created_at")

    data = [
        {
            "id": s.id,
            "title": s.title,
            "content": s.content,
            "submission_type": s.submission_type,
            "status": s.status,
            "submitted_by": s.submitted_by.username,
            "created_at": s.created_at,
        }
        for s in submissions
    ]

    return Response(data)


# ✅ CREATE SUBMISSION
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_submission(request):

    # ✅ FIX: ensure tags is valid JSON list
    raw_tags = request.data.get("tags")
    try:
        parsed_tags = json.loads(raw_tags) if raw_tags else []
    except:
        parsed_tags = []

    submission = Submission.objects.create(
        title=request.data.get("title", ""),
        content=request.data.get("content", ""),
        submission_type=request.data.get("submission_type", "breed"),
        related_breed_id=request.data.get("related_breed") or None,
        submitted_by=request.user,
        image=request.FILES.get("image"),

        # ✅ extra fields
        origin=request.data.get("origin", ""),
        temperament=request.data.get("temperament", ""),
        lifespan=request.data.get("lifespan", ""),
        weight=request.data.get("weight", ""),
        coat_length=request.data.get("coat_length", ""),
        hypoallergenic=str(request.data.get("hypoallergenic")).lower() == "true",
        tags=parsed_tags,
    )

    return Response({"message": "Submitted successfully"}, status=201)


# ✅ REVIEW SUBMISSION (ADMIN)
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def review_submission(request, pk):
    submission = get_object_or_404(Submission, pk=pk)
    profile = get_object_or_404(UserProfile, user=request.user)

    if profile.role != "admin":
        return Response({"error": "Admin only"}, status=403)

    status_val = request.data.get("status")

    if status_val not in ["approved", "rejected"]:
        return Response({"error": "Invalid status"}, status=400)

    submission.status = status_val
    submission.reviewed_by = request.user
    submission.save()

    # ✅ APPLY DATA WHEN APPROVED
    if status_val == "approved":

        # 🔹 CREATE NEW BREED
        if submission.submission_type == "breed":
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

        # 🔹 EDIT BREED
        elif submission.submission_type == "edit" and submission.related_breed:
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

        # 🔹 CARE TIP
        elif submission.submission_type == "care_tip":
            CareTip.objects.create(
                title=submission.title,
                content=submission.content,
                breed=submission.related_breed,
                created_by=submission.submitted_by,
            )

    return Response({"message": "Submission reviewed"})


# ✅ DELETE SUBMISSION
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_submission(request, pk):
    submission = get_object_or_404(Submission, pk=pk)
    profile = get_object_or_404(UserProfile, user=request.user)

    if profile.role != "admin":
        return Response({"error": "Admin only"}, status=403)

    submission.delete()

    # ✅ FIX: 204 should not return body
    return Response(status=204)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def submission_detail(request, pk):
    profile = get_object_or_404(UserProfile, user=request.user)

    if profile.role != "admin":
        return Response({"error": "Admin access required."}, status=403)

    submission = get_object_or_404(Submission, pk=pk)

    data = {
        "id": submission.id,
        "title": submission.title,
        "content": submission.content,
        "submission_type": submission.submission_type,
        "status": submission.status,
        "submitted_by": submission.submitted_by.username,
        "created_at": submission.created_at,
        "origin": submission.origin,
        "temperament": submission.temperament,
        "lifespan": submission.lifespan,
        "weight": submission.weight,
        "coat_length": submission.coat_length,
        "hypoallergenic": submission.hypoallergenic,
        "tags": submission.tags,
        "image": submission.image.url if submission.image else None,
    }

    return Response(data)

@api_view(["PATCH"])
def edit_submission(request, pk):
    submission = get_object_or_404(Submission, pk=pk)

    for field in [
        "title", "content", "submission_type",
        "origin", "temperament", "lifespan",
        "weight", "coat_length", "hypoallergenic", "tags"
    ]:
        if field in request.data:
            setattr(submission, field, request.data[field])

    submission.save()
    return Response({"message": "updated"})