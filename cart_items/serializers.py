from rest_framework import serializers

from cart_items.models import CartItem

class CartItemSerializer(serializers.ModelSerializer):
    unit_price = serializers.FloatField()
    class Meta:
        model = CartItem
        fields = '__all__'