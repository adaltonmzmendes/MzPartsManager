from rest_framework import viewsets, permissions
from django.db.models import Q
from .models import LostSale
from .serializers import LostSaleSerializer

class LostSaleViewSet(viewsets.ModelViewSet):
    serializer_class = LostSaleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or not user.company:
            return LostSale.objects.none()
        
        qs = LostSale.objects.filter(company=user.company)
        
        search = self.request.query_params.get('search', '')
        if search:
            qs = qs.filter(
                Q(product_name__icontains=search) | 
                Q(item__description__icontains=search)
            )
        
        return qs

    def perform_create(self, serializer):
        serializer.save(
            company=self.request.user.company,
            user=self.request.user
        )