from __future__ import annotations

from django.db.models import QuerySet, Q

from apps.catalog.models import Tag
from apps.search.normalizers import normalize_query_to_tags


def apply_search(queryset: QuerySet, query: str) -> QuerySet:
    if not query:
        return queryset.order_by("description")

    tags_list = normalize_query_to_tags(query)
    
    # Condição base: busca exata na descrição (fallback/OR)
    q_obj = Q(description__icontains=query)

    if tags_list:
        existing_count = (
            Tag.objects.filter(name__in=tags_list)
            .values("name")
            .distinct()
            .count()
        )
        
        # Apenas adiciona a condição de tags se todas existirem no banco
        if existing_count == len(set(tags_list)):
            tag_qs = queryset
            for tag in tags_list:
                tag_qs = tag_qs.filter(tags__name=tag)
            
            # Combina a busca por tags com a busca por descrição
            q_obj |= Q(id__in=tag_qs.values('id'))

    return queryset.filter(q_obj).distinct().order_by("description")