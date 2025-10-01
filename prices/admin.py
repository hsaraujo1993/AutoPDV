from django.contrib import admin

from prices.models import Price


# Register your models here.

@admin.register(Price)
class PriceAdmin(admin.ModelAdmin):
    list_display = ('id',)