from rest_framework import generics
from .models import InventoryItem
from .serializers import InventoryPriceSerializer

class InventoryPriceUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = InventoryPriceSerializer

    def get_object(self):
        item_id = self.kwargs.get('item_id')
        obj, _ = InventoryItem.objects.get_or_create(item_id=item_id, defaults={'cost_price': 0, 'sell_price': 0, 'quantity': 0})
        return obj