from django.db import models
from django.conf import settings
from apps.multicompany.models import Company
from apps.catalog.models import Item

class LostSale(models.Model):
    REASON_CHOICES = [
        ("falta_estoque", "Falta de estoque"),
        ("nao_trabalhado", "Produto não trabalhado"),
        ("preco_elevado", "Preço elevado"),
        ("prazo_entrega", "Prazo de entrega"),
        ("marca_qualidade", "Marca/Qualidade"),
        ("outro", "Outro"),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="lost_sales")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="lost_sales")
    
    item = models.ForeignKey(Item, on_delete=models.SET_NULL, null=True, blank=True, related_name="lost_sales")
    product_name = models.CharField(max_length=255, blank=True, default="")
    
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    quantity = models.PositiveIntegerField(default=1)
    observation = models.TextField(blank=True, default="")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        nome = self.item.description if self.item else self.product_name
        return f"{nome} - {self.get_reason_display()}"