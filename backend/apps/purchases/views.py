from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import Purchase, PurchaseItem
from .serializers import PurchaseSerializer
from apps.inventory.models import InventoryMovement

class PurchaseViewSet(viewsets.ModelViewSet):
    serializer_class = PurchaseSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or not user.company:
            return Purchase.objects.none()
            
        if self.action == 'history':
            return Purchase.objects.filter(user=user, company=user.company, status='closed')
            
        return Purchase.objects.filter(user=user, company=user.company, status='open')

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        item_id = request.data.get('item_id')
        user = request.user

        if not user.company:
            return Response({"detail": "Usuário não possui empresa vinculada."}, status=status.HTTP_400_BAD_REQUEST)

        purchase, _ = Purchase.objects.get_or_create(user=user, company=user.company, status='open')
        purchase_item, created = PurchaseItem.objects.get_or_create(
            purchase=purchase, 
            item_id=item_id, 
            defaults={'quantity': 1, 'unit_cost': 0}
        )

        if not created:
            purchase_item.quantity += 1
            purchase_item.save(update_fields=['quantity'])
        elif hasattr(purchase_item.item, 'inventory'):
            purchase_item.unit_cost = purchase_item.item.inventory.cost_price
            purchase_item.save(update_fields=['unit_cost'])

        return Response(PurchaseSerializer(purchase).data)

    @action(detail=False, methods=['post'])
    def update_item(self, request):
        item_id = request.data.get('item_id')
        quantity = int(request.data.get('quantity', 0))
        unit_cost = request.data.get('unit_cost')

        try:
            purchase = Purchase.objects.get(user=request.user, company=request.user.company, status='open')
            purchase_item = PurchaseItem.objects.get(purchase=purchase, item_id=item_id)
            
            if quantity <= 0:
                purchase_item.delete()
            else:
                purchase_item.quantity = quantity
                if unit_cost is not None:
                    purchase_item.unit_cost = unit_cost
                purchase_item.save(update_fields=['quantity', 'unit_cost'])
            
            return Response(PurchaseSerializer(purchase).data)
        except (Purchase.DoesNotExist, PurchaseItem.DoesNotExist):
            return Response(status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def checkout(self, request):
        supplier_id = request.data.get('supplier_id')
        purchase = Purchase.objects.filter(user=request.user, company=request.user.company, status='open').first()
        
        if not purchase or not purchase.items.exists():
            return Response({"detail": "Lista de compras vazia."}, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            purchase.status = 'closed'
            if supplier_id:
                purchase.supplier_id = supplier_id
            purchase.save(update_fields=['status', 'supplier_id'])

            for p_item in purchase.items.select_related('item__inventory'):
                inventory = p_item.item.inventory
                inventory.quantity += p_item.quantity
                inventory.cost_price = p_item.unit_cost
                inventory.save(update_fields=['quantity', 'cost_price'])
                
                InventoryMovement.objects.create(
                    inventory_item=inventory,
                    movement_type='in',
                    quantity=p_item.quantity,
                    unit_cost=p_item.unit_cost,
                    description=f"Entrada por Compra #{purchase.id}",
                    user=request.user
                )
                
        return Response({"detail": "Compra finalizada com sucesso."})