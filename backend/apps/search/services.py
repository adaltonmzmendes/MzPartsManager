# apps/search/services.py
from __future__ import annotations

from typing import Iterable

from django.db.models import QuerySet

from apps.catalog.models import Tag


def search_items_by_tags(queryset: QuerySet, tags: Iterable[str]) -> QuerySet:
    """
    Engine de busca por tags.

    Regras:
    - Recebe um QuerySet (ex: já filtrado por company).
    - Exige AND absoluto: item deve conter TODAS as tags.
    - Se qualquer tag não existir no banco -> retorna queryset.none().
    - Ordena alfabeticamente por description.
    - Não avalia o queryset (não chama list(), etc). Retorna QuerySet.
    """
    tags_list = [t.strip().lower() for t in tags if t and t.strip()]
    if not tags_list:
        return queryset.order_by("description")

    # Se qualquer tag não existir: retorno vazio (regra A)
    existing_count = (
        Tag.objects.filter(name__in=tags_list)
        .values("name")
        .distinct()
        .count()
    )
    if existing_count != len(set(tags_list)):
        return queryset.none()

    qs = queryset
    # AND absoluto: aplica um filtro por tag
    # (Django faz os JOINs necessários; com índices em M2M é ok para seu volume)
    for tag in tags_list:
        qs = qs.filter(tags__name=tag)

    return qs.distinct().order_by("description")
