from rest_framework import serializers

from .models import Order
from customers.serializers import CustomerSerializer
from order_items.models import OrderItem


class OrderItemDetailSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'subtotal']

    def get_subtotal(self, obj):
        return obj.unit_price * obj.quantity


class OrderDetailSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    items = OrderItemDetailSerializer(many=True, read_only=True, source='order_items')

    class Meta:
        model = Order
        fields = [
            'id', 'order_status', 'created_at', 'updated_at', 'sales_order', 'origin',
            'total_amount', 'payment_method', 'customer', 'items'
        ]

    def update(self, instance, validated_data):
        prev_status = instance.order_status
        instance = super().update(instance, validated_data)
        # Se status mudou para cancelado, devolve itens ao estoque
        if prev_status != 'canceled' and instance.order_status == 'canceled':
            for item in instance.order_items.all():
                remaining = item.quantity
                for stock in item.product.stocks.all():
                    if remaining == 0:
                        break
                    stock.quantity += remaining
                    stock.save()
                    remaining = 0
        return instance


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'