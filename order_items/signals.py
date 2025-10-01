from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import OrderItem
from stocks.models import Stock


@receiver(post_save, sender=OrderItem)
def update_stock_on_orderitem(sender, instance, created, **kwargs):
    if created:
        remaining = instance.quantity
        for stock in instance.product.stocks.all():
            if remaining == 0:
                break
            if stock.quantity >= remaining:
                stock.quantity -= remaining
                stock.save()
                remaining = 0
            else:
                remaining -= stock.quantity
                stock.quantity = 0
                stock.save()
