from django.urls import path

from .views import CustomerListCreateAPIView, CustomerRetrieveUpdateDestroyAPIView

urlpatterns = [
    path('', CustomerListCreateAPIView.as_view(), name='customer-list-create'),
    path('<uuid:pk>/', CustomerRetrieveUpdateDestroyAPIView.as_view(),
         name='customer-detail-update-delete'),
]