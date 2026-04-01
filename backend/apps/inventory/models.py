from django.db import models

class InventoryItem(models.Model):
    item = models.OneToOneField('catalog.Item', on_delete=models.CASCADE, related_name='inventory')
    quantity = models.IntegerField(default=0)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    sell_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"Estoque: {self.item.description}"