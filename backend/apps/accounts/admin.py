from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser

    list_display = (
        "email",
        "company",
        "is_staff",
        "is_active",
    )

    list_filter = (
        "company",
        "is_staff",
        "is_active",
    )

    search_fields = (
        "email",
        "company__razao_social",
        "company__cnpj",
    )

    ordering = ("email",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Empresa", {"fields": ("company",)}),
        ("Informações pessoais", {"fields": ("birthday",)}),
        (
            "Permissões",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Datas importantes", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "password1",
                    "password2",
                    "company",
                    "is_staff",
                    "is_active",
                ),
            },
        ),
    )

    readonly_fields = ("last_login", "date_joined")

    filter_horizontal = ("groups", "user_permissions")
