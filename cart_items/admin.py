from django.contrib import admin

from cart_items.models import CartItem


# Register your models here.

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'cart', 'quantity')
