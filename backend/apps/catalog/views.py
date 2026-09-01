from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Item, ItemImage
from .serializers import ItemSerializer, GlobalItemSuggestionSerializer
from .pagination import StandardResultsSetPagination

from apps.search.services import apply_search


class ItemViewSet(viewsets.ModelViewSet):
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user = self.request.user
        show_archived = self.request.query_params.get('archived') == 'true'
        
        qs = Item.objects.filter(company=user.company, is_active=not show_archived)

        search = self.request.query_params.get("search", "")
        if search:
            qs = apply_search(qs, search)

        return qs.order_by("description")

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()

    @action(detail=True, methods=["post"])
    def restore(self, request, pk=None):
        item = get_object_or_404(Item, pk=pk, company=request.user.company)
        
        if item.is_active:
             return Response({"detail": "Item já está ativo."}, status=status.HTTP_400_BAD_REQUEST)

        item.is_active = True
        item.save()
        return Response(status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"])
    def suggestions(self, request, pk=None):
        item = self.get_object()

        if not item.global_item:
            return Response(
                {"detail": "Este item ainda não possui vínculo global."},
                status=status.HTTP_204_NO_CONTENT,
            )

        serializer = GlobalItemSuggestionSerializer(item.global_item)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def upload_images(self, request, pk=None):
        item = self.get_object()
        images = request.FILES.getlist('images')
        
        for index, img in enumerate(images):
            ItemImage.objects.create(item=item, image=img, order=index)
            
        return Response(status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["delete"], url_path=r'images/(?P<image_id>\d+)')
    def delete_image(self, request, pk=None, image_id=None):
        item = self.get_object()
        image = get_object_or_404(ItemImage, pk=image_id, item=item)
        image.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)