from rest_framework import serializers

from prices.models import Price


class PriceSerializer(serializers.ModelSerializer):
    sku = serializers.CharField(source='product.sku', read_only=True)
    oem_code = serializers.CharField(source='product.oem_code', read_only=True)
    oem_alternative_code = serializers.CharField(source='product.oem_alternative_code', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = Price
        fields = '__all__'
        extra_fields = ['sku', 'oem_code', 'oem_alternative_code', 'product_name']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['sku'] = instance.product.sku
        data['oem_code'] = instance.product.oem_code
        data['oem_alternative_code'] = instance.product.oem_alternative_code
        data['product_name'] = instance.product.name
        return data
