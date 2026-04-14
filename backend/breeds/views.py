from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import CareTip, Breed
from .serializers import serialize_breed, serialize_care_tip
from .services import (
    get_filtered_breeds, create_breed, update_breed, get_recommended_breeds,
    get_filtered_care_tips, create_care_tip, update_care_tip,
)
from backend.permissions import get_admin_profile_or_error, get_profile


@api_view(["GET", "POST"])
def breeds_list(request):
    if request.method == "GET":
        breeds = get_filtered_breeds(request.query_params)
        return Response([serialize_breed(b, request.user) for b in breeds])

    profile, err = get_admin_profile_or_error(request.user)
    if err:
        return err

    breed = create_breed(request.data, request.FILES, request.user)
    return Response(serialize_breed(breed), status=201)


@api_view(["GET", "PUT", "DELETE"])
def breed_detail(request, pk):
    breed = get_object_or_404(Breed, pk=pk)

    if request.method == "GET":
        tips = CareTip.objects.filter(breed=breed)
        data = serialize_breed(breed, request.user)
        data["care_tips"] = [serialize_care_tip(t) for t in tips]
        return Response(data)

    profile, err = get_admin_profile_or_error(request.user)
    if err:
        return err

    if request.method == "PUT":
        breed = update_breed(breed, request.data, request.FILES)
        return Response(serialize_breed(breed))

    breed.delete()
    return Response({"message": "Breed deleted."}, status=204)


@api_view(["GET", "POST"])
def care_tips_list(request):
    if request.method == "GET":
        tips = get_filtered_care_tips(request.query_params)
        return Response([serialize_care_tip(t) for t in tips])

    profile, err = get_admin_profile_or_error(request.user)
    if err:
        return err

    tip = create_care_tip(request.data, request.user)
    return Response(serialize_care_tip(tip), status=201)


@api_view(["PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def care_tip_detail(request, pk):
    tip = get_object_or_404(CareTip, pk=pk)

    profile, err = get_admin_profile_or_error(request.user)
    if err:
        return err

    if request.method == "PUT":
        tip = update_care_tip(tip, request.data)
        return Response(serialize_care_tip(tip))

    tip.delete()
    return Response({"message": "Care tip deleted."}, status=204)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recommended_breeds(request):
    profile = get_profile(request.user)
    breeds = get_recommended_breeds(profile)
    return Response([serialize_breed(b, request.user) for b in breeds])