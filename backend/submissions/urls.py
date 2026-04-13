from django.urls import path
from . import views

urlpatterns = [
    # GET all + POST create
    path("", views.submissions_list),
    path("create/", views.create_submission),

    # DETAIL (GET one submission)
    path("<int:pk>/", views.submission_detail),

    # REVIEW
    path("<int:pk>/review/", views.review_submission),

    # DELETE
    path("<int:pk>/delete/", views.delete_submission),
    path("<int:pk>/edit/", views.edit_submission),
]