from django.shortcuts import render
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from .models import Order
from .serializers import OrderDetailSerializer

# Create your views here.


class OrderListCreateViewAPIView(ListCreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderDetailSerializer


class OrderRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderDetailSerializer
