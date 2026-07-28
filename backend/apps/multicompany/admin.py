from django.contrib import admin
from .models import Company


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = (
        "razao_social",
        "cnpj",
        "status",
        "ambiente",
        "created_at",
        "total_users",
    )

    list_filter = (
        "status",
        "ambiente",
        "regime_tributario",
        "uf",
    )

    search_fields = (
        "razao_social",
        "nome_fantasia",
        "cnpj",
        "email",
    )

    readonly_fields = (
        "id",
        "created_at",
        "updated_at",
    )

    fieldsets = (
        ("Identidade Legal", {
            "fields": (
                "logo",
                "razao_social",
                "nome_fantasia",
                "cnpj",
                "ie",
                "regime_tributario",
            )
        }),
        ("Status", {
            "fields": ("status",)
        }),
        ("Endereço", {
            "fields": (
                "logradouro",
                "numero",
                "complemento",
                "bairro",
                "cidade",
                "uf",
                "cep",
                "ibge_municipio",
            )
        }),
        ("Contato", {
            "fields": ("telefone", "email")
        }),
        ("Fiscal / Integrações", {
            "fields": (
                "ambiente",
                "credenciais_api",
                "csc",
                "csc_id_token",
            )
        }),
        ("Sistema", {
            "fields": (
                "moeda",
                "timezone_str",
            )
        }),
        ("Controle", {
            "fields": (
                "created_at",
                "updated_at",
            )
        }),
    )

    def total_users(self, obj):
        return obj.users.count()

    total_users.short_description = "Usuários"