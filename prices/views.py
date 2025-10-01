from django.shortcuts import render
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from prices.models import Price
from prices.serializers import PriceSerializer


# Create your views here.


class PriceListCreateAPIView(ListCreateAPIView):
    queryset = Price.objects.all()
    serializer_class = PriceSerializer


class PriceRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    queryset = Price.objects.all()
    serializer_class = PriceSerializer
