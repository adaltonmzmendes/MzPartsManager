from django.contrib import admin
from .models import Item, Tag, Application


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = (
        "description",
        "company",
    )

    list_filter = (
        "company",
    )

    search_fields = (
        "description",
    )

    filter_horizontal = (
        "tags",
        "applications",
    )

    fields = (
        "company",
        "description",
        "tags",
        "applications",
    )
