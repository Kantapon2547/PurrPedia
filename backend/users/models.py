from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ("user", "User"),
        ("admin", "Admin"),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="user")
    preferences = models.JSONField(default=list, blank=True)
    favorites = models.ManyToManyField("breeds.Breed", blank=True, related_name="favorited_by")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username
