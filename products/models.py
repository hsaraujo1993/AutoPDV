import uuid

from django.db import models

from categories.models import Category
from suppliers.models import Supplier

# Create your models here.

CHOICES_STATUS = (
    (1, 'Active'),
    (2, 'Inactive'),
)


class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, null=False, blank=False)
    sku = models.CharField(max_length=100, null=False, blank=False, unique=True)
    oem_code = models.CharField(max_length=100, null=True, blank=True)
    oem_alternative_code = models.CharField(max_length=100, null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, null=False, blank=False)
    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    status = models.IntegerField(choices=CHOICES_STATUS, null=False, blank=False, default=1)


    def __str__(self):
        return self.name
