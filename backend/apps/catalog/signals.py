from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver
from .models import Item
from .services import sync_item_to_global, refresh_global_aggregations

@receiver(post_save, sender=Item)
def on_item_save(sender, instance, created, **kwargs):
    # Chama o serviço. Mantém o signal limpo.
    sync_item_to_global(instance)

@receiver(m2m_changed, sender=Item.tags.through)
def on_item_tags_change(sender, instance, action, **kwargs):
    if action in ["post_add", "post_remove", "post_clear"] and instance.global_item:
        refresh_global_aggregations(instance.global_item)

@receiver(m2m_changed, sender=Item.applications.through)
def on_item_apps_change(sender, instance, action, **kwargs):
    if action in ["post_add", "post_remove", "post_clear"] and instance.global_item:
        refresh_global_aggregations(instance.global_item)