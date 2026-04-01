from rest_framework import serializers
from .models import InventoryItem

class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = ['quantity', 'cost_price', 'sell_price']

class InventoryPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = ['cost_price', 'sell_price']