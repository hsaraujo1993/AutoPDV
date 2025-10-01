from django.apps import AppConfig


class OrdemitemsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'order_items'

    def ready(self):
        import order_items.signals
