from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import Cart, CartItem
from .serializers import CartSerializer
from apps.multicompany.models import Company
from .services import validar_hmac_nfeio, emitir_nfce_nfeio
from apps.inventory.models import InventoryMovement

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or not user.company:
            return Cart.objects.none()
            
        if self.action in ['retrieve', 'issue_nfce']:
            return Cart.objects.filter(user=user, company=user.company)
            
        return Cart.objects.filter(user=user, company=user.company, status='open')

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        item_id = request.data.get('item_id')
        user = request.user

        if not user.company:
            return Response({"detail": "Usuário não possui empresa vinculada."}, status=status.HTTP_400_BAD_REQUEST)

        cart, _ = Cart.objects.get_or_create(user=user, company=user.company, status='open')
        cart_item, created = CartItem.objects.get_or_create(cart=cart, item_id=item_id, defaults={'quantity': 1})

        if not created:
            cart_item.quantity += 1
            cart_item.save(update_fields=['quantity'])

        return Response(CartSerializer(cart).data)

    @action(detail=False, methods=['post'])
    def set_quantity(self, request):
        item_id = request.data.get('item_id')
        quantity = int(request.data.get('quantity', 0))
        cart_id = request.data.get('cart_id')

        try:
            cart = Cart.objects.get(id=cart_id, user=request.user)
            cart_item = CartItem.objects.get(cart=cart, item_id=item_id)
            
            if quantity <= 0:
                cart_item.delete()
            else:
                cart_item.quantity = quantity
                cart_item.save(update_fields=['quantity'])
            
            return Response(CartSerializer(cart).data)
        except (Cart.DoesNotExist, CartItem.DoesNotExist):
            return Response(status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def checkout(self, request):
        user = request.user
        payment_method = request.data.get('payment_method', 'dinheiro')
        
        cart = Cart.objects.filter(user=user, company=user.company, status='open').first()
        if not cart or not cart.items.exists():
            return Response({"detail": "Carrinho vazio ou não encontrado."}, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            cart.status = 'closed'
            cart.payment_method = payment_method
            cart.save(update_fields=['status', 'payment_method'])

            for cart_item in cart.items.select_related('item__inventory'):
                inventory = cart_item.item.inventory
                inventory.quantity -= cart_item.quantity
                inventory.save(update_fields=['quantity'])
                
                InventoryMovement.objects.create(
                    inventory_item=inventory,
                    movement_type='out',
                    quantity=cart_item.quantity,
                    description=f"Venda - Carrinho #{cart.id}",
                    user=user
                )
                
        return Response({"detail": "Venda finalizada com sucesso.", "cart_id": cart.id})

    @action(detail=False, methods=['get'])
    def history(self, request):
        user = request.user
        if not user.is_authenticated or not user.company:
            return Response([])
        
        carts = Cart.objects.filter(user=user, company=user.company, status='closed').order_by('-updated_at')
        return Response(CartSerializer(carts, many=True).data)

    @action(detail=True, methods=['post'])
    def issue_nfce(self, request, pk=None):
        cart = self.get_object()
        
        if cart.status != 'closed':
            return Response({"detail": "Apenas vendas finalizadas podem emitir NFC-e."}, status=status.HTTP_400_BAD_REQUEST)
            
        if cart.nfe_status in ['approved', 'processing']:
            return Response({"detail": "Nota fiscal já foi processada ou está em processamento."}, status=status.HTTP_400_BAD_REQUEST)

        payment_method = request.data.get('payment_method')
        if payment_method and payment_method != cart.payment_method:
            cart.payment_method = payment_method
            cart.save(update_fields=['payment_method'])

        try:
            emitir_nfce_nfeio(cart)
            cart.nfe_status = "processing"
            cart.save(update_fields=["nfe_status"])
            return Response({"detail": "NFC-e enviada para processamento.", "nfe_status": cart.nfe_status})
        except Exception as e:
            cart.nfe_status = "error"
            cart.nfe_message = str(e)
            cart.save(update_fields=["nfe_status", "nfe_message"])
            return Response({"detail": cart.nfe_message}, status=status.HTTP_400_BAD_REQUEST)


class NfeioWebhookView(APIView):
    authentication_classes = [] 
    permission_classes = []

    def post(self, request, *args, **kwargs):
        payload = request.data
        invoice_data = payload.get("data", payload)
        
        nfe_id = invoice_data.get("id")

        if not nfe_id:
            return Response({"detail": "ID da nota não encontrado no payload."}, status=status.HTTP_400_BAD_REQUEST)

        cart = Cart.objects.filter(nfe_id=nfe_id).first()
        if not cart:
            return Response({"detail": "Nota não encontrada."}, status=status.HTTP_404_NOT_FOUND)

        signature = request.headers.get("X-NfeIo-Signature") or request.headers.get("X-Hub-Signature")
        if signature and not validar_hmac_nfeio(cart.company.credenciais_api or {}, request.body, signature):
            return Response({"detail": "Assinatura HMAC inválida."}, status=status.HTTP_403_FORBIDDEN)

        webhook_type = payload.get("type", "")
        webhook_status = invoice_data.get("status", invoice_data.get("flowStatus", ""))

        if webhook_type in ["consumer_invoice.issued", "consumer_invoice.issued_successfully", "consumerInvoice.issued"] or webhook_status in ["Issued", "Sucesso", "Aprovada"]:
            cart.nfe_status = "approved"
            cart.nfe_url = invoice_data.get("pdfUrl") or invoice_data.get("url")
        elif webhook_type in ["consumer_invoice.issued_error", "consumerInvoice.error"] or webhook_status in ["Error", "Denied", "Falha", "Cancelada"]:
            cart.nfe_status = "error"
            error_data = payload.get("error") or invoice_data.get("error") or {}
            cart.nfe_message = error_data.get("message", "Erro reportado pelo webhook.") if isinstance(error_data, dict) else str(error_data)
            
        cart.save(update_fields=["nfe_status", "nfe_url", "nfe_message"])

        return Response({"status": "received"}, status=status.HTTP_200_OK)