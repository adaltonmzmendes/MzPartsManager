from django.db import transaction
from .models import GlobalItem, Conversion, Tag, Application, Item

def sync_item_to_global(item_instance):
    """
    Analisa a descrição do Item, encontra ou cria o GlobalItem
    e vincula as conversões iniciais.
    """
    if not item_instance.description:
        return

    parts = item_instance.description.strip().split(" ", 1)
    if not parts:
        return
        
    first_token = parts[0].strip()

    # Lógica de conversão
    conversion, _ = Conversion.objects.get_or_create(name=first_token)
    item_instance.conversions.add(conversion)

    with transaction.atomic():
        target_global = GlobalItem.objects.filter(identity=first_token).first()

        if not target_global:
            target_global = GlobalItem.objects.filter(conversions__name=first_token).first()

        if not target_global:
            target_global = GlobalItem.objects.create(
                identity=first_token,
                normalized_description=item_instance.description
            )
            target_global.conversions.add(conversion)

        # Verifica se mudou o vínculo
        if item_instance.global_item != target_global:
            old_global = item_instance.global_item 
            item_instance.global_item = target_global
            # Importante: update_fields evita loop infinito de save() se fosse chamado num save method
            item_instance.save(update_fields=['global_item'])

            if old_global:
                refresh_global_aggregations(old_global)
            
            refresh_global_aggregations(target_global)

def refresh_global_aggregations(global_item):
    """
    Atualiza as tags, apps e conversões do GlobalItem baseando-se
    em todos os Items filhos.
    """
    if not global_item:
        return

    # O uso de set() já lida com a limpeza e adição eficiente
    all_tags = Tag.objects.filter(item__global_item=global_item).distinct()
    global_item.tags.set(all_tags)

    all_apps = Application.objects.filter(item__global_item=global_item).distinct()
    global_item.applications.set(all_apps)

    all_convs = Conversion.objects.filter(item__global_item=global_item).distinct()
    global_item.conversions.set(all_convs)