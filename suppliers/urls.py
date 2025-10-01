from django.urls import path

from .views import SupplierListCreateAPIView, SupplierRetrieveUpdateDestroyAPIView

urlpatterns = [
    path('', SupplierListCreateAPIView.as_view(), name='supplier-list-create'),
    path('<uuid:pk>/', SupplierRetrieveUpdateDestroyAPIView.as_view(),
         name='supplier-detail-update-destroy'),
]