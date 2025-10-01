import uuid

from django.db import models

# Create your models here.

CHOICES_CUSTOMERS_TYPE = [
    ('mecanico', 'Mecanico'),
    ('varejo', 'Varejo'),
    ('cliente_final', 'Cliente Final'),
    ('cliente_vip', 'Cliente VIP'),
]


class Customer(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    name = models.CharField(max_length=100, blank=True)
    type = models.CharField(
        choices=CHOICES_CUSTOMERS_TYPE,
        default='cliente_final',
        max_length=20,
        blank=True
    )
    email = models.EmailField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return self.name


