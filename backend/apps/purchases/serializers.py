from rest_framework import serializers
from .models import Purchase, PurchaseItem

class PurchaseItemSerializer(serializers.ModelSerializer):
    description = serializers.CharField(source='item.description', read_only=True)

    class Meta:
        model = PurchaseItem
        fields = ['id', 'item', 'quantity', 'unit_cost', 'description']

class PurchaseSerializer(serializers.ModelSerializer):
    items = PurchaseItemSerializer(many=True, read_only=True)
    total_value = serializers.DecimalField(source='get_total_value', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Purchase
        fields = ['id', 'company', 'user', 'supplier', 'status', 'items', 'created_at', 'updated_at', 'total_value']