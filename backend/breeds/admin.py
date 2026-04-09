from django.contrib import admin
from .models import Breed, CareTip

@admin.register(Breed)
class BreedAdmin(admin.ModelAdmin):
    list_display = ["name", "origin", "temperament", "hypoallergenic", "created_at"]
    search_fields = ["name", "origin"]
    list_filter = ["temperament", "hypoallergenic"]

@admin.register(CareTip)
class CareTipAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "breed", "created_at"]
    list_filter = ["category"]