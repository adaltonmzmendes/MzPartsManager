from apps.catalog.models import Tag
from apps.catalog.utils import normalize_description, extract_tokens_from_description, normalize_name

def apply_auto_tags(item) -> None:
    raw_tags = set()

    if item.description:
        raw_tags.update(extract_tokens_from_description(normalize_description(item.description)))

    for app in item.applications.all():
        if app.name:
            raw_tags.update(extract_tokens_from_description(normalize_description(app.name)))

    raw_tags.update(conv.name for conv in item.conversions.all() if conv.name)

    final_tags = {norm_tag for tag in raw_tags if (norm_tag := normalize_name(tag))}

    if final_tags:
        item.tags.add(*(Tag.objects.get_or_create(name=tag)[0] for tag in final_tags))