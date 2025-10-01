from django.db import models

from carts.models import Cart
from orders.models import Order
from products.models import Product


# Create your models here.


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name='order_items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='items')
    cart = models.ForeignKey(Cart, on_delete=models.SET_NULL, related_name='order_items', blank=True, null=True)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def subtotal(self):
        return self.unit_price * self.quantity

    def __str__(self):
        return f"{self.quantity} x {self.product.name} (Order {self.order.sales_order})"
