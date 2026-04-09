from django.urls import path
from .views import breeds_list, breed_detail, care_tips_list, care_tip_detail, recommended_breeds

urlpatterns = [
    path("", breeds_list),
    path("<int:pk>/", breed_detail),
    path("care-tips/", care_tips_list),
    path("care-tips/<int:pk>/", care_tip_detail),
    path("recommended/", recommended_breeds),
]