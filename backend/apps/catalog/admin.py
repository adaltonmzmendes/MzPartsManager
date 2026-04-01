from django.contrib import admin
from .models import Item, Tag, Application, Conversion, GlobalItem, ItemApplication

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


class ItemApplicationInline(admin.TabularInline):
    model = ItemApplication
    extra = 1


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = (
        "description",
        "company",
        "global_item",
        "is_active",
    )

    list_filter = (
        "company",
        "is_active",
    )

    search_fields = (
        "description",
    )

    filter_horizontal = (
        "conversions",
        "tags",
    )

    fields = (
        "company",
        "global_item",
        "description",
        "conversions",
        "tags",
        "is_active",
    )

    inlines = [ItemApplicationInline]