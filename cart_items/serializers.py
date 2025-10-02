from rest_framework import serializers

from cart_items.models import CartItem
from products.models import Product

class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.SerializerMethodField()
    unit_price = serializers.FloatField()

    class Meta:
        model = CartItem
        fields = '__all__'

    def get_product_name(self, obj):
        return obj.product.name if obj.product else None
