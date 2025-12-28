# from django.db import models
#
# class InventoryItem(models.Model):
#     item = models.OneToOneField('catalog.Item', on_delete=models.CASCADE)
#     quantity = models.IntegerField(default=0)
#     cost_price = models.DecimalField(max_digits=10, decimal_places=2)
#     sell_price = models.DecimalField(max_digits=10, decimal_places=2)