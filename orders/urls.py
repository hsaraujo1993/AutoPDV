from django.urls import path

from .views import OrderListCreateViewAPIView, OrderRetrieveUpdateDestroyAPIView

urlpatterns = [
    path('', OrderListCreateViewAPIView.as_view(), name='order-list-create'),
    path('<uuid:pk>/', OrderRetrieveUpdateDestroyAPIView.as_view(), name='order-detail-update-delete'),
]