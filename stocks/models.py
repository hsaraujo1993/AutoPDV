import uuid

from django.db import models

from products.models import Product


# Create your models here.


class Stock(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='stocks')
    quantity = models.PositiveIntegerField()
    min_quantity = models.PositiveIntegerField()
    max_quantity = models.PositiveIntegerField()
    location = models.CharField(max_length=255)
    last_updated = models.DateTimeField(auto_now=True)


    def __str__(self):
        return f"Stock of {self.product.name} at {self.location}"