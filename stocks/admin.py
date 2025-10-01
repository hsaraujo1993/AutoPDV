from django.contrib import admin

from stocks.models import Stock


# Register your models here.

@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ('quantity', )