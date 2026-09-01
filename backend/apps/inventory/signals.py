from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.catalog.models import Item
from .models import InventoryItem

@receiver(post_save, sender=Item)
def create_inventory_for_item(sender, instance, created, **kwargs):
    if created:
        InventoryItem.objects.create(item=instance)