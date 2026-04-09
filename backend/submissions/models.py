from django.db import models
from django.contrib.auth.models import User
from breeds.models import Breed


class Submission(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]
    TYPE_CHOICES = [
        ("breed", "New Breed"),
        ("edit", "Edit Breed"),
        ("care_tip", "Care Tip"),
    ]

    title = models.CharField(max_length=200)
    content = models.TextField()
    submission_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default="breed")
    related_breed = models.ForeignKey(Breed, on_delete=models.SET_NULL, null=True, blank=True, related_name="submissions")
    image = models.ImageField(upload_to="submissions/", blank=True, null=True)
    submitted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="submissions")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    admin_notes = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="reviewed_submissions")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} [{self.status}]"
