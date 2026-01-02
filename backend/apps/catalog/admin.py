from django.contrib import admin
from .models import Item, Tag, Application, Conversion, GlobalItem # 1. Adicionado GlobalItem aqui

@admin.register(Conversion)
class ConversionAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(GlobalItem)
class GlobalItemAdmin(admin.ModelAdmin):
    list_display = ("identity", "normalized_description")
    search_fields = ("identity", "normalized_description")
    
    filter_horizontal = (
        "conversions",
        "tags",
        "applications",
    )


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = (
        "description",
        "company",
        "global_item",
    )

    list_filter = (
        "company",
    )

    search_fields = (
        "description",
    )

    filter_horizontal = (
        "conversions",
        "tags",
        "applications",
    )

    fields = (
        "company",
        "global_item", 
        "description",
        "conversions", 
        "tags",
        "applications",
    )