from django.urls import path

from .views import StockListCreateAPIView, StockRetrieveUpdateDestroyAPIView

urlpatterns = [
    path('', StockListCreateAPIView.as_view(), name='stock-list-create'),
    path('<uuid:pk>/', StockRetrieveUpdateDestroyAPIView.as_view(), name='stock-detail-update-destroy'),
]