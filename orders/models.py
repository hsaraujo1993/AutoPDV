import uuid
from django.db import models
from django.utils.crypto import get_random_string

from customers.models import Customer

CHOICES_STATUS_ORDER = (
    ('pending', 'Pending'),
    ('paid', 'Paid'),
    ('sending', 'Sending'),
    ('delivered', 'Delivered'),
    ('canceled', 'Canceled'),
    ('error', 'Error'),
)

CHOICES_ORIGIN_ORDER = (
    ('web', 'Web'),
    ('phone', 'Phone'),
    ('in_person', 'In Person'),
)

CHOICES_PAYMENT_METHOD = (
    ('credit_card', 'Credit Card'),
    ('debit_card', 'Debit Card'),
    ('pix', 'Pix'),
    ('cash', 'Cash'),
)

class Order(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name='orders')
    order_status = models.CharField(choices=CHOICES_STATUS_ORDER, max_length=9, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    sales_order = models.CharField(max_length=100, unique=True, blank=True, default='')
    origin = models.CharField(choices=CHOICES_ORIGIN_ORDER, max_length=10, default='web')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    payment_method = models.CharField(choices=CHOICES_PAYMENT_METHOD, blank=True, null=True, max_length=12)

    def save(self, *args, **kwargs):
        if not self.sales_order:
            self.sales_order = self.generate_sales_order()
        super().save(*args, **kwargs)

    def generate_sales_order(self):
        random_part = get_random_string(length=5).upper()
        return f"SO-{self.created_at.strftime('%Y%m%d') if self.created_at else ''}-{random_part}"

    def update_total_amount(self):
        total = sum(item.subtotal for item in self.items.all())
        self.total_amount = total
        self.save()
