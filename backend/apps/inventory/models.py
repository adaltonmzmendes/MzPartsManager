from django.db import models
from django.conf import settings

class InventoryItem(models.Model):
    item = models.OneToOneField('catalog.Item', on_delete=models.CASCADE, related_name='inventory')
    quantity = models.IntegerField(default=0)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    sell_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"Estoque: {self.item.description}"

class InventoryMovement(models.Model):
    MOVEMENT_CHOICES = [
        ('in', 'Entrada'),
        ('out', 'Saída'),
    ]
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name='movements')
    movement_type = models.CharField(max_length=3, choices=MOVEMENT_CHOICES)
    quantity = models.IntegerField()
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    description = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_movement_type_display()} - {self.quantity} - {self.inventory_item.item.description}"