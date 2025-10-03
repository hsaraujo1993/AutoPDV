import uuid

from django.db import models

from customers.models import Customer


# Create your models here.

CHOICES_STATUS_CART = (
    ('open', 'Aberto'),
    ('pendent', 'Pendente'),
    ('finalized', 'Finalizado'),
    ('canceled', 'Cancelado'),
)


class Cart(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name='carts')
    status_cart = models.CharField(max_length=9, choices=CHOICES_STATUS_CART, default='open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.id)




