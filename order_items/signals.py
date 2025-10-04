from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import OrderItem


@receiver(post_save, sender=OrderItem)
def update_stock_on_orderitem(sender, instance, created, **kwargs):
    if created and not instance.stock_discounted:
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
        if remaining > 0:
            raise Exception(f"Estoque insuficiente para o produto {instance.product.name}. Faltam {remaining} unidades.")
        # Marcar como descontado sem disparar o signal novamente
        OrderItem.objects.filter(pk=instance.pk).update(stock_discounted=True)


@receiver(post_delete, sender=OrderItem)
def restore_stock_on_orderitem_delete(sender, instance, **kwargs):
    remaining = instance.quantity
    for stock in instance.product.stocks.all():
        if remaining == 0:
            break
        stock.quantity += remaining
        stock.save()
        remaining = 0
