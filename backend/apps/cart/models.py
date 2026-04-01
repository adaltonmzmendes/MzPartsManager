from django.db import models
from django.conf import settings
from apps.multicompany.models import Company
from apps.catalog.models import Item

class Cart(models.Model):
    STATUS_CHOICES = [
        ("open", "Aberto"),
        ("closed", "Fechado"),
    ]
    PAYMENT_CHOICES = [
        ("dinheiro", "Dinheiro"),
        ("pix", "PIX"),
        ("cartao_credito", "Cartão de Crédito"),
        ("cartao_debito", "Cartão de Débito"),
    ]
    NFE_STATUS_CHOICES = [
        ("none", "Não Emitida"),
        ("processing", "Processando"),
        ("approved", "Aprovada"),
        ("error", "Erro"),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="carts")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="carts")
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default="open")
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default="dinheiro")
    
    nfe_status = models.CharField(max_length=20, choices=NFE_STATUS_CHOICES, default="none")
    nfe_id = models.CharField(max_length=255, blank=True, null=True)
    nfe_url = models.URLField(blank=True, null=True)
    nfe_message = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def get_total_value(self):
        return sum(
            (item.item.inventory.sell_price * item.quantity) 
            for item in self.items.all() 
            if hasattr(item.item, 'inventory') and item.item.inventory.sell_price
        )

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ("cart", "item")
        ordering = ["id"]