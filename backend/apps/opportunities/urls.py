from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LostSaleViewSet

router = DefaultRouter()
router.register(r'lost-sales', LostSaleViewSet, basename='lost-sales')

urlpatterns = [
    path('', include(router.urls)),
]