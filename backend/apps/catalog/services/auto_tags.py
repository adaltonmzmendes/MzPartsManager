from apps.catalog.models import Tag
from apps.catalog.utils import normalize_description, extract_tokens_from_description


def apply_auto_tags(item) -> None:
    """
    Garante que descrição, conversões e aplicações virem tags.
    Não remove tags existentes.
    Idempotente.
    """

    tags_to_add = set()

    # Descrição → tags
    if item.description:
        normalized = normalize_description(item.description)
        tokens = extract_tokens_from_description(normalized)
        tags_to_add.update(tokens)

    # Conversões → tags
    for conv in item.conversions.all():
        if conv.name:
            tags_to_add.add(conv.name.strip().lower())

    # Aplicações → tags
    for app in item.applications.all():
        if app.name:
            normalized = normalize_description(app.name)
            tokens = extract_tokens_from_description(normalized)
            tags_to_add.update(tokens)

    if not tags_to_add:
        return

    tag_objs = [
        Tag.objects.get_or_create(name=tag)[0]
        for tag in tags_to_add
    ]

    item.tags.add(*tag_objs)
