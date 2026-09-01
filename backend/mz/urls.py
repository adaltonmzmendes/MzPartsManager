from django.contrib import admin
from django.urls import path, include
from knox import views as knox_views

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/auth/', include('knox.urls')),
    path('logout/', knox_views.LogoutView.as_view(), name='knox_logout'),
    path('logoutall/', knox_views.LogoutAllView.as_view(), name='knox_logoutall'),

    path(
        'api/password_reset/',
        include('django_rest_passwordreset.urls', namespace='password_reset')
    ),

    path('api/accounts/', include('apps.accounts.urls')),
    path('api/catalog/', include('apps.catalog.urls')),
    path('api/inventory/', include('apps.inventory.urls')),
    path('api/cart/', include('apps.cart.urls')),
    path('api/opportunities/', include('apps.opportunities.urls')),
    path('api/crm/', include('apps.crm.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
    path('api/purchases/', include('apps.purchases.urls')),
]