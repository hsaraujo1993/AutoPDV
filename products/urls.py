from django.urls import path

from .views import ProductListCreateAPIView, ProductRetrieveUpdateDestroyAPIView

urlpatterns = [
    path('', ProductListCreateAPIView.as_view(), name='product-list-create'),
    path('<uuid:product_id>/', ProductRetrieveUpdateDestroyAPIView.as_view(),
         name='product-detail-update-destroy'),
]