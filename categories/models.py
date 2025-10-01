import uuid

from django.db import models

# Create your models here.


class Category(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    name = models.CharField(max_length=100, unique=True, null=False)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name