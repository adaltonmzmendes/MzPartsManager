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

    # 1. Cria/Pega a conversão baseada na primeira palavra e associa ao Item
    conversion, _ = Conversion.objects.get_or_create(name=first_token)
    instance.conversions.add(conversion)

    with transaction.atomic():
        target_global = None

        # PASSO 1: Busca por Identity Exata
        # Verifica se já existe um Global com essa identidade
        target_global = GlobalItem.objects.filter(identity=first_token).first()

        # PASSO 2: Busca por Conversão (Sinônimo)
        # Se não achou por identity, verifica se algum Global já possui essa conversão associada.
        # Ex: first_token="Cola", não tem Global "Cola", mas Global "Refrigerante" tem a conversão "Cola".
        if not target_global:
            target_global = GlobalItem.objects.filter(conversions__name=first_token).first()

        # PASSO 3: Criação
        # Se não achou nem por identity nem por conversão, cria um novo Global
        if not target_global:
            target_global = GlobalItem.objects.create(
                identity=first_token,
                normalized_description=instance.description
            )
            # Ao criar um novo global baseado neste token, garantimos que ele tenha essa conversão
            target_global.conversions.add(conversion)

        # Atualiza o Item se o Global for diferente do atual
        if instance.global_item != target_global:
            old_global = instance.global_item 
            instance.global_item = target_global
            instance.save(update_fields=['global_item'])

            # Atualiza agregações (tags, apps, conversions) no Global antigo e no novo
            if old_global:
                refresh_global_aggregations(old_global)
            
            refresh_global_aggregations(target_global)

def refresh_global_aggregations(global_item):
    """
    Recalcula todas as tags, applications e conversions do GlobalItem
    baseando-se em todos os Items conectados a ele.
    """
    if not global_item:
        return

    # Pega todas as tags dos itens vinculados a este global
    all_tags = Tag.objects.filter(item__global_item=global_item).distinct()
    global_item.tags.set(all_tags)

    # Pega todas as applications dos itens vinculados a este global
    all_apps = Application.objects.filter(item__global_item=global_item).distinct()
    global_item.applications.set(all_apps)

    # Pega todas as conversions dos itens vinculados a este global
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

# Nota: Não precisamos de signal para sync_conversions_to_global aqui,
# pois o refresh_global_aggregations já é chamado no manage_item_identity_and_global_link
# logo após adicionar a conversão inicial. Se adicionar conversões manualmente depois,
# seria ideal ter um signal similar aos de tags/apps.