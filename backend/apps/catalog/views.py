from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Item
from .serializers import ItemSerializer, GlobalItemSuggestionSerializer
from .pagination import StandardResultsSetPagination

from apps.search.normalizers import normalize_query_to_tags
from apps.search.services import search_items_by_tags


class ItemViewSet(viewsets.ModelViewSet):
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user = self.request.user

        qs = Item.objects.filter(company=user.company)

        search = self.request.query_params.get("search", "")
        tags = normalize_query_to_tags(search)

        qs = search_items_by_tags(qs, tags)

        return qs.order_by("description")

    @action(detail=True, methods=["get"])
    def suggestions(self, request, pk=None):
        """
        Retorna os dados do GlobalItem vinculado para sugestões.
        """
        item = self.get_object()

        if not item.global_item:
            return Response(
                {"detail": "Este item ainda não possui vínculo global."},
                status=status.HTTP_204_NO_CONTENT,
            )

        serializer = GlobalItemSuggestionSerializer(item.global_item)
        return Response(serializer.data)
