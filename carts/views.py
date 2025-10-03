from django.shortcuts import render
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from cart_items.models import CartItem
from cart_items.serializers import CartItemSerializer
from carts.models import Cart
from carts.serializers import CartSerializer
from order_items.models import OrderItem
from orders.models import Order
from orders.serializers import OrderSerializer
from prices.models import Price
from products.models import Product


# Create your views here.


class CartListCreateView(ListCreateAPIView):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer


class CartRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer


class AddItemToCartView(APIView):
    def post(self, request, cart_id):
        try:
            cart = Cart.objects.get(id=cart_id)
        except Cart.DoesNotExist:
            return Response({"error": "Cart not found"}, status=status.HTTP_404_NOT_FOUND)

        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)

        try:
            quantity = int(quantity)
            if quantity <= 0:
                raise ValueError
        except (ValueError, TypeError):
            return Response({"error": "Quantity must be a positive integer"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        # Buscar preço do produto
        try:
            price_obj = Price.objects.get(product=product)
            unit_price = price_obj.sale_price
        except Price.DoesNotExist:
            return Response({"error": "No price defined for product"}, status=status.HTTP_400_BAD_REQUEST)

        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            cart_item.quantity += quantity
        else:
            cart_item.quantity = quantity
        cart_item.unit_price = unit_price  # Preenche o preço unitário
        cart_item.save()

        serializer = CartItemSerializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RemoveItemFromCartView(APIView):

    def post(self, request, cart_id, item_id):
        try:
            cart = Cart.objects.get(id=cart_id)
        except Cart.DoesNotExist:
            return Response({"error": "Cart not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            cart_item = CartItem.objects.get(cart=cart, id=item_id)
        except CartItem.DoesNotExist:
            return Response({"error": "Item not found in cart"}, status=status.HTTP_404_NOT_FOUND)

        cart_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



class UpdateCartItemQuantityView(APIView):

    def patch(self, request, cart_id, item_id):
        try:
            cart = Cart.objects.get(id=cart_id)
        except Cart.DoesNotExist:
            return Response({"error": "Cart not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            # CORREÇÃO: Busca o CartItem pelo seu próprio ID, não pelo ID do produto.
            cart_item = CartItem.objects.get(cart=cart, id=item_id)
        except CartItem.DoesNotExist:
            return Response({"error": "Item not found in cart"}, status=status.HTTP_404_NOT_FOUND)

        quantity = request.data.get('quantity')

        if quantity is not None and int(quantity) > 0:
            cart_item.quantity = int(quantity)
            cart_item.save()
            serializer = CartItemSerializer(cart_item)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid quantity"}, status=status.HTTP_400_BAD_REQUEST)


class FinalizeCartView(APIView):
    def post(self, request, cart_id):
        try:
            cart = Cart.objects.get(id=cart_id)
        except Cart.DoesNotExist:
            return Response({"error": "Cart not found"}, status=status.HTTP_404_NOT_FOUND)

        cart_items = cart.items.all()
        if not cart_items.exists():
            return Response({"error": "Cannot finalize an empty cart"}, status=status.HTTP_400_BAD_REQUEST)

        if cart.status_cart != 'open':
            return Response({"error": "Only open carts can be finalized"}, status=status.HTTP_400_BAD_REQUEST)

        order = Order.objects.create(
            customer=cart.customer,
            origin=request.data.get('origin', 'web'),
            payment_method=request.data.get('payment_method', 'not_specified')
        )

        total_amount = 0

        for item in cart_items:
            try:
                price_obj = Price.objects.get(product=item.product)
                item_price = price_obj.sale_price
            except Price.DoesNotExist:
                return Response(
                    {"error": f"No price defined for product {item.product.name}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            order_item = OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                unit_price=item_price
            )

            total_amount += item_price * item.quantity

        order.total_amount = total_amount
        order.save()

        cart.status_cart = 'finalized'
        cart.save()

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CartItemsListAPIView(ListAPIView):
    serializer_class = CartItemSerializer

    def get_queryset(self):
        cart_id = self.kwargs['cart_id']
        return CartItem.objects.filter(cart_id=cart_id)
