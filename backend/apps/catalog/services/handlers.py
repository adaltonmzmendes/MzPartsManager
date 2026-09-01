from django.db import transaction
from apps.catalog.models import GlobalItem, Conversion, Tag, Application, Item

# Melhoria futura: para evitar chamadas redundantes durante o .set() do serializer, envolva a chamada do sync em transaction.on_commit.
def sync_item_to_global(item_instance):
    with transaction.atomic():
        conversions = list(item_instance.conversions.all().order_by('id'))

        if not conversions:
            if item_instance.global_item_id:
                old_global = item_instance.global_item
                item_instance.global_item = None
                item_instance.save(update_fields=['global_item'])
                refresh_global_aggregations(old_global)
            return

        first_conversion = conversions[0]
        conversion_ids = [c.id for c in conversions]

        existing_globals = list(
            GlobalItem.objects.filter(conversions__id__in=conversion_ids)
            .distinct()
            .order_by('id')
        )

        if not existing_globals:
            target_global = GlobalItem.objects.create(
                identity=first_conversion.name,
                normalized_description=item_instance.description
            )
        else:
            target_global = existing_globals[0]
            globals_to_merge = existing_globals[1:]

            for old_global in globals_to_merge:
                Item.objects.filter(global_item=old_global).update(global_item=target_global)
                
                if item_instance.global_item_id == old_global.id:
                    item_instance.global_item_id = target_global.id
                    item_instance.global_item = target_global
                    
                old_global.delete()

        if item_instance.global_item_id != target_global.id:
            old_global = item_instance.global_item if item_instance.global_item_id else None
            
            item_instance.global_item_id = target_global.id
            item_instance.global_item = target_global
            item_instance.save(update_fields=['global_item'])

            if old_global and old_global.id != target_global.id:
                if GlobalItem.objects.filter(id=old_global.id).exists():
                    refresh_global_aggregations(old_global)

        refresh_global_aggregations(target_global)

def refresh_global_aggregations(global_item):
    if not global_item:
        return

    global_item.tags.set(Tag.objects.filter(item__global_item=global_item).distinct())
    global_item.applications.set(Application.objects.filter(item__global_item=global_item).distinct())
    global_item.conversions.set(Conversion.objects.filter(item__global_item=global_item).distinct())