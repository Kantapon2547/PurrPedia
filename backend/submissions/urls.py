# submissions/urls.py
from django.urls import path
from .views import submissions_list, review_submission

urlpatterns = [
    path("submissions/", submissions_list),
    path("submissions/<int:pk>/review/", review_submission),
    path("<int:pk>/review/", review_submission), # PATCH (admin)
]