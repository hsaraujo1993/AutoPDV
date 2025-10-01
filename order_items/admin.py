from django.contrib import admin

from order_items.models import OrderItem


# Register your models here.

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'product', 'quantity')
