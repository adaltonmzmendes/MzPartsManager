from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartViewSet, NfeioWebhookView

router = DefaultRouter()
router.register(r'', CartViewSet, basename='cart')

urlpatterns = [
    path('webhooks/nfeio/<uuid:company_id>/', NfeioWebhookView.as_view(), name='nfeio-webhook'),
    path('', include(router.urls)),
]