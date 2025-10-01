from django.urls import path

from .views import CartItemListCreateAPIView, CartItemRetrieveUpdateDestroyAPIView, CartDetailView

urlpatterns = [
    path('', CartItemListCreateAPIView.as_view(), name='cartitem-list-create'),
    path('<uuid:pk>/', CartItemRetrieveUpdateDestroyAPIView.as_view(), name='cartitem-detail-update-destroy'),
    path('carrinho/<uuid:cart_id>/', CartDetailView.as_view(), name='cart-detail'),
]