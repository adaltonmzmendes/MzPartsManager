from django.urls import path
from .views import InventoryPriceUpdateView

urlpatterns = [
    path('prices/<int:item_id>/', InventoryPriceUpdateView.as_view(), name='inventory-prices-update'),
]