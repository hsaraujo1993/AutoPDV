from rest_framework import serializers

from carts.models import Cart
from cart_items.models import CartItem
from cart_items.serializers import CartItemSerializer


class CartSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = '__all__'

    def get_items(self, obj):
        cart_items = CartItem.objects.filter(cart=obj)
        return CartItemSerializer(cart_items, many=True).data
