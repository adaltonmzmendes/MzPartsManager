from rest_framework import serializers
from .models import Cart, CartItem

class CartItemSerializer(serializers.ModelSerializer):
    description = serializers.CharField(source='item.description', read_only=True)
    sell_price = serializers.DecimalField(
        source='item.inventory.sell_price', max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = CartItem
        fields = ['id', 'item', 'quantity', 'description', 'sell_price']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_value = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            'id', 'company', 'user', 'status', 'payment_method', 
            'nfe_status', 'nfe_id', 'nfe_url', 'nfe_message',
            'items', 'created_at', 'updated_at', 'total_value'
        ]

    def get_total_value(self, obj):
        return str(obj.get_total_value())