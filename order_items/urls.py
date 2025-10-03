from django.urls import path

from .views import OrderItemListCreateViewAPIView, OrderItemRetrieveUpdateDestroyAPIView


urlpatterns = [
    path('', OrderItemListCreateViewAPIView.as_view(), name='orderitem-list-create'),
    path('<int:pk>/', OrderItemRetrieveUpdateDestroyAPIView.as_view(),
         name='orderitem-detail-update-delete'),
]