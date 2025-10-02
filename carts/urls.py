from django.urls import path

from .views import CartListCreateView, CartRetrieveUpdateDestroyAPIView, AddItemToCartView, RemoveItemFromCartView, \
    UpdateCartItemQuantityView, FinalizeCartView, CartItemsListAPIView

urlpatterns = [
    path('', CartListCreateView.as_view(), name='cart-list-create'),
    path('<uuid:pk>/', CartRetrieveUpdateDestroyAPIView.as_view(), name='cart-detail-update-delete'),

    path('<uuid:cart_id>/add-item/', AddItemToCartView.as_view(), name='cart-add-item'),
    path('<uuid:cart_id>/remove-item/<int:item_id>/', RemoveItemFromCartView.as_view(), name='cart-remove-item'),
    path('<uuid:cart_id>/update-item/<int:item_id>/', UpdateCartItemQuantityView.as_view(), name='cart-update-item'),
    path('<uuid:cart_id>/finalize/', FinalizeCartView.as_view(), name='cart-finalize'),
    path('<uuid:cart_id>/items/', CartItemsListAPIView.as_view(), name='cart-items-list'),
]
