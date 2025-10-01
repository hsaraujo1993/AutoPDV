from django.urls import path

from .views import PriceListCreateAPIView, PriceRetrieveUpdateDestroyAPIView

urlpatterns = [
    path('', PriceListCreateAPIView.as_view(), name='price-list-create'),
    path('<uuid:pk>/', PriceRetrieveUpdateDestroyAPIView.as_view(), name='price-detail-update-destroy'),

]