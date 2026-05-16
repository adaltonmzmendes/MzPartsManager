from django.db.models import Q
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Contact
from .serializers import ContactSerializer

class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all().order_by('-created_at')
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        is_client = self.request.query_params.get('is_client')
        is_supplier = self.request.query_params.get('is_supplier')
        search = self.request.query_params.get('search')
        
        if is_client is not None:
            queryset = queryset.filter(is_client=is_client.lower() == 'true')
        if is_supplier is not None:
            queryset = queryset.filter(is_supplier=is_supplier.lower() == 'true')
            
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(document__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search)
            )
            
        return queryset