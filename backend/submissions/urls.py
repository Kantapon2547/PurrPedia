# submissions/urls.py
from django.urls import path
from .views import  create_submission, submissions_list, review_submission

urlpatterns = [
    path("submissions/", submissions_list), # GET all submissions (admin)
    path("submissions/create/", create_submission), # POST new submission (USER)
    path("submissions/<int:pk>/review/", review_submission), # PATCH review submission (admin)
]