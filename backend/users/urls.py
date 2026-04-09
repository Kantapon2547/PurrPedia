from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import signup, signin, profile, toggle_favorite, list_users, update_user_role

urlpatterns = [
    path("signup/", signup),
    path("login/", signin),
    path("token/refresh/", TokenRefreshView.as_view()),
    path("profile/", profile),
    path("favorite/<int:breed_id>/", toggle_favorite),
    path("", list_users),
    path("<int:user_id>/role/", update_user_role),
]