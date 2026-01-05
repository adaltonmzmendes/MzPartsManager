from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Item
from .serializers import ItemSerializer, GlobalItemSuggestionSerializer
from .pagination import StandardResultsSetPagination  # Import da paginação criada

class ItemViewSet(viewsets.ModelViewSet):
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    # 🔹 Configuração de Paginação (20 itens por vez)
    pagination_class = StandardResultsSetPagination
    
    # 🔹 Configuração de Busca (?search=termo)
    filter_backends = [filters.SearchFilter]
    # Define quais campos o DRF vai olhar quando chegar um termo de busca
    search_fields = ['description', 'global_item__identity']

    def get_queryset(self):
        user = self.request.user
        # 🔹 É essencial adicionar o .order_by() para garantir que a paginação 
        # não envie itens duplicados ou pule itens entre as páginas.
        return Item.objects.filter(company=user.company).order_by('-id')

    @action(detail=True, methods=['get'])
    def suggestions(self, request, pk=None):
        """
        Retorna os dados do GlobalItem vinculado para sugestões.
        """
        item = self.get_object()
        
        if not item.global_item:
            # Se não houver global item vinculado, retorna vazio ou msg apropriada
            return Response(
                {"detail": "Este item ainda não possui vínculo global."}, 
                status=status.HTTP_204_NO_CONTENT
            )

        serializer = GlobalItemSuggestionSerializer(item.global_item)
        return Response(serializer.data)