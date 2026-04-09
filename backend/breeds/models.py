from django.db import models
from django.contrib.auth.models import User


class Breed(models.Model):
    TEMPERAMENT_CHOICES = [
        ("calm", "Calm"),
        ("playful", "Playful"),
        ("affectionate", "Affectionate"),
        ("independent", "Independent"),
        ("social", "Social"),
        ("energetic", "Energetic"),
    ]

    name = models.CharField(max_length=100, unique=True)
    origin = models.CharField(max_length=100, blank=True)
    description = models.TextField()
    temperament = models.CharField(max_length=50, choices=TEMPERAMENT_CHOICES, blank=True)
    lifespan = models.CharField(max_length=30, blank=True)
    weight = models.CharField(max_length=30, blank=True)
    coat_length = models.CharField(max_length=30, blank=True)
    hypoallergenic = models.BooleanField(default=False)
    image = models.ImageField(upload_to="breeds/", blank=True, null=True)
    tags = models.JSONField(default=list, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class CareTip(models.Model):
    CATEGORY_CHOICES = [
        ("grooming", "Grooming"),
        ("nutrition", "Nutrition"),
        ("health", "Health"),
        ("behavior", "Behavior"),
        ("exercise", "Exercise"),
    ]

    title = models.CharField(max_length=200)
    content = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    breed = models.ForeignKey(Breed, on_delete=models.SET_NULL, null=True, blank=True, related_name="care_tips")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
