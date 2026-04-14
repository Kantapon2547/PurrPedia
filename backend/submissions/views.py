from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Submission
from .serializers import serialize_submission
from .services import create_submission as service_create_submission, apply_approved_submission
from backend.permissions import get_admin_profile_or_error


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def submissions_list(request):
    profile, err = get_admin_profile_or_error(request.user)
    if err:
        return err

    submissions = Submission.objects.all().order_by("-created_at")
    return Response([serialize_submission(s) for s in submissions])


@api_view(["GET", "DELETE"])
@permission_classes([IsAuthenticated])
def submission_detail(request, pk):
    submission = get_object_or_404(Submission, pk=pk)

    profile, err = get_admin_profile_or_error(request.user)
    if err:
        return err

    if request.method == "DELETE":
        submission.delete()
        return Response(status=204)

    return Response(serialize_submission(submission))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_submission(request):
    submission = service_create_submission(request.data, request.FILES, request.user)
    return Response({"message": "Submitted successfully"}, status=201)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def review_submission(request, pk):
    submission = get_object_or_404(Submission, pk=pk)

    profile, err = get_admin_profile_or_error(request.user)
    if err:
        return err

    status_val = request.data.get("status")
    if status_val not in ["approved", "rejected"]:
        return Response({"error": "Invalid status."}, status=400)

    submission.status = status_val
    submission.reviewed_by = request.user
    submission.save()

    if status_val == "approved":
        apply_approved_submission(submission)

    return Response({"message": "Submission reviewed."})


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def edit_submission(request, pk):
    submission = get_object_or_404(Submission, pk=pk)

    # Only the original submitter or an admin can edit
    profile, err = get_admin_profile_or_error(request.user)
    is_owner = submission.submitted_by == request.user
    if err and not is_owner:
        return Response({"error": "Not allowed."}, status=403)

    # Only allow editing while still pending
    if submission.status != "pending":
        return Response({"error": "Cannot edit a submission that has already been reviewed."}, status=400)

    for field in ["title", "content", "origin", "temperament", "lifespan", "weight", "coat_length"]:
        if field in request.data:
            setattr(submission, field, request.data[field])

    if "image" in request.FILES:
        submission.image = request.FILES["image"]

    submission.save()
    return Response({"message": "Submission updated."})


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_submission(request, pk):
    submission = get_object_or_404(Submission, pk=pk)

    profile, err = get_admin_profile_or_error(request.user)
    if err:
        return err

    submission.delete()
    return Response(status=204)