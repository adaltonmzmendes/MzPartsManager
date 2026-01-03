from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Item
from .serializers import ItemSerializer, GlobalItemSuggestionSerializer

class ItemViewSet(viewsets.ModelViewSet):
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Item.objects.filter(company=user.company)

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