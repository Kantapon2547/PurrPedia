from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Submission
from breeds.models import Breed, CareTip
from users.models import UserProfile


# ✅ GET all submissions (admin only)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def submissions_list(request):
    profile = get_object_or_404(UserProfile, user=request.user)

    if profile.role != "admin":
        return Response({"error": "Admin access required."}, status=403)

    submissions = Submission.objects.all().order_by("-created_at")

    data = [
        {
            "[id]": s.id,
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


# ✅ CREATE submission (user)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_submission(request):
    submission = Submission.objects.create(
        title=request.data.get("title"),
        content=request.data.get("content"),
        submission_type=request.data.get("submission_type"),
        related_breed_id=request.data.get("related_breed") or None,
        submitted_by=request.user,
        image=request.FILES.get("image"),
    )

    return Response({"message": "Submitted successfully"}, status=201)


# ✅ REVIEW submission (ADMIN ONLY) 🔥 IMPORTANT
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

    # 🔥🔥🔥 THIS IS THE KEY FIX 🔥🔥🔥
    if status_val == "approved":

        # ✅ CREATE NEW BREED
        if submission.submission_type == "breed":
            if not Breed.objects.filter(name=submission.title).exists():
                Breed.objects.create(
                    name=submission.title,
                    description=submission.content,
                    created_by=submission.submitted_by,
                )

        # ✅ EDIT EXISTING BREED
        elif submission.submission_type == "edit" and submission.related_breed:
            breed = submission.related_breed
            breed.description = submission.content
            breed.save()

        # ✅ CREATE CARE TIP
        elif submission.submission_type == "care_tip":
            CareTip.objects.create(
                title=submission.title,
                content=submission.content,
                breed=submission.related_breed,
                created_by=submission.submitted_by,
            )

    return Response({"message": "Submission reviewed"})