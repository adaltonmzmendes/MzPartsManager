from django.db import models
from django.conf import settings
from apps.multicompany.models import Company
from apps.catalog.models import Item
from apps.crm.models import Contact

class Purchase(models.Model):
    STATUS_CHOICES = [
        ("open", "Aberto"),
        ("closed", "Fechado"),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="purchases")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    supplier = models.ForeignKey(Contact, on_delete=models.SET_NULL, null=True, blank=True, limit_choices_to={'is_supplier': True})
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default="open")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def get_total_value(self):
        return sum((item.unit_cost * item.quantity) for item in self.items.all())


class PurchaseItem(models.Model):
    purchase = models.ForeignKey(Purchase, on_delete=models.CASCADE, related_name="items")
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    class Meta:
        unique_together = ("purchase", "item")
        ordering = ["id"]