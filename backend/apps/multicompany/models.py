from django.db import models
import uuid


class Company(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pendente"),
        ("active", "Ativa"),
        ("suspended", "Suspensa"),
    ]

    AMBIENTE_CHOICES = [
        ("homologacao", "Homologação"),
        ("producao", "Produção"),
    ]

    REGIME_CHOICES = [
        ("simples", "Simples Nacional"),
        ("normal", "Regime Normal"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Identidade legal
    razao_social = models.CharField(max_length=255)
    nome_fantasia = models.CharField(max_length=255, blank=True, default="")
    cnpj = models.CharField(max_length=18, unique=True)
    ie = models.CharField("Inscrição Estadual", max_length=32, blank=True, default="")
    regime_tributario = models.CharField(
        max_length=12, choices=REGIME_CHOICES, default="simples"
    )

    # Status no sistema
    status = models.CharField(
        max_length=12, choices=STATUS_CHOICES, default="pending"
    )

    # Endereço
    logradouro = models.CharField(max_length=255, blank=True, default="")
    numero = models.CharField(max_length=32, blank=True, default="")
    complemento = models.CharField(max_length=128, blank=True, default="")
    bairro = models.CharField(max_length=128, blank=True, default="")
    cidade = models.CharField(max_length=128, blank=True, default="")
    uf = models.CharField(max_length=2, blank=True, default="")
    cep = models.CharField(max_length=9, blank=True, default="")
    ibge_municipio = models.CharField(max_length=7, blank=True, default="")

    # País
    codigo_pais = models.CharField(max_length=4, default="1058")
    nome_pais = models.CharField(max_length=50, default="BRASIL")
    pais = models.CharField(max_length=3, default="BRA")

    # Contato
    telefone = models.CharField(max_length=32, blank=True, default="")
    email = models.EmailField(blank=True, default="")

    # Configurações fiscais / integração
    ambiente = models.CharField(
        max_length=12, choices=AMBIENTE_CHOICES, default="homologacao"
    )
    credenciais_api = models.JSONField(
        blank=True, null=True,
        help_text="Credenciais fiscais / API (ex: nfe.io)"
    )
    csc = models.CharField(max_length=64, blank=True, default="")
    csc_id_token = models.CharField(max_length=8, blank=True, default="")

    # Sistema
    moeda = models.CharField(max_length=8, default="BRL")
    timezone_str = models.CharField(max_length=64, default="America/Sao_Paulo")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Empresa"
        verbose_name_plural = "Empresas"
        ordering = ["razao_social"]

    def __str__(self):
        return f"{self.razao_social} ({self.cnpj})"
