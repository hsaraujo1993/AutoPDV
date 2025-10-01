import uuid

from django.db import models

from products.models import Product

# Create your models here.


class Price(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    product = models.OneToOneField(Product, on_delete=models.PROTECT, related_name='price')
    purchase_price_without_tax = models.DecimalField(max_digits=10, decimal_places=2)
    purchase_price_with_tax = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2)
    profit_margin = models.DecimalField(max_digits=5, decimal_places=2)


    def __str__(self):
        return str(self.sale_price)