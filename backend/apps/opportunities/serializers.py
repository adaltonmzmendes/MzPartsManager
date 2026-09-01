from rest_framework import serializers
from .models import LostSale

class LostSaleSerializer(serializers.ModelSerializer):
    reason_display = serializers.CharField(source='get_reason_display', read_only=True)
    item_description = serializers.CharField(source='item.description', read_only=True)

    class Meta:
        model = LostSale
        fields = [
            'id', 'company', 'user', 'item', 'item_description', 
            'product_name', 'reason', 'reason_display', 'quantity', 
            'observation', 'created_at', 'updated_at'
        ]
        read_only_fields = ['company', 'user']

    def validate(self, attrs):
        item = attrs.get('item')
        product_name = attrs.get('product_name')
        
        if not item and not product_name:
            raise serializers.ValidationError("É necessário informar um item do catálogo ou o nome do produto buscado.")
        
        return attrs