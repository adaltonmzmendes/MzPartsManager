from django.db import models, transaction
from apps.multicompany.models import Company
from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver

class Conversion(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Application(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class GlobalItem(models.Model):
    identity = models.CharField(max_length=50, unique=True) 
    
    normalized_description = models.TextField(null=True, blank=True)

    conversions = models.ManyToManyField(Conversion, blank=True)
    tags = models.ManyToManyField(Tag, blank=True)
    applications = models.ManyToManyField(Application, blank=True)

    def __str__(self):
        return self.identity


class Item(models.Model):
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='items',
    )

    global_item = models.ForeignKey(
        GlobalItem,
        on_delete=models.PROTECT,
        related_name='items',
        null=True,
        blank=True,
    )

    description = models.TextField()
    conversions = models.ManyToManyField(Conversion, blank=True)
    tags = models.ManyToManyField(Tag, blank=True)
    applications = models.ManyToManyField(Application, blank=True)
    
    def __str__(self):
        return self.description


@receiver(post_save, sender=Item)
def manage_item_identity_and_global_link(sender, instance, created, **kwargs):
    if not instance.description:
        return

    parts = instance.description.strip().split(" ", 1)
    if not parts:
        return
        
    first_token = parts[0].strip()

    conversion, _ = Conversion.objects.get_or_create(name=first_token)
    instance.conversions.add(conversion)

    with transaction.atomic():
        global_obj, created_global = GlobalItem.objects.get_or_create(identity=first_token)

        if created_global:
            global_obj.normalized_description = instance.description
            global_obj.save()

        if instance.global_item != global_obj:
            old_global = instance.global_item 
            instance.global_item = global_obj
            instance.save(update_fields=['global_item'])

            if old_global:
                refresh_global_aggregations(old_global)
            refresh_global_aggregations(global_obj)

def refresh_global_aggregations(global_item):
    if not global_item:
        return

    all_tags = Tag.objects.filter(item__global_item=global_item).distinct()
    global_item.tags.set(all_tags)

    all_apps = Application.objects.filter(item__global_item=global_item).distinct()
    global_item.applications.set(all_apps)

    all_convs = Conversion.objects.filter(item__global_item=global_item).distinct()
    global_item.conversions.set(all_convs)


@receiver(m2m_changed, sender=Item.tags.through)
def sync_tags_to_global(sender, instance, action, **kwargs):
    if action in ["post_add", "post_remove", "post_clear"] and instance.global_item:
        refresh_global_aggregations(instance.global_item)

@receiver(m2m_changed, sender=Item.applications.through)
def sync_apps_to_global(sender, instance, action, **kwargs):
    if action in ["post_add", "post_remove", "post_clear"] and instance.global_item:
        refresh_global_aggregations(instance.global_item)