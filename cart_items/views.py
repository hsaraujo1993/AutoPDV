from django.shortcuts import render, get_object_or_404
from django.views import View
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework import status

from cart_items.models import CartItem
from cart_items.serializers import CartItemSerializer
from carts.models import Cart
from products.models import Product
from stocks.models import Stock


# Create your views here.


class CartItemListCreateAPIView(ListCreateAPIView):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer


class CartItemRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer


class CartDetailView(View):
    def get(self, request, cart_id):
        cart = get_object_or_404(Cart, id=cart_id)
        return render(request, 'carrinho/cart_detail.html', {'cart_id': cart_id, 'cart': cart})
