from django.db import models
from apps.multicompany.models import Company


class Conversion(models.Model):
    name = models.CharField(max_length=50)


class Tag(models.Model):
    name = models.CharField(max_length=50)


class Application(models.Model):
    name = models.CharField(max_length=255)


class GlobalItem(models.Model):
    normalized_description = models.TextField(unique=True)

    conversions = models.ManyToManyField(Conversion, blank=True)
    tags = models.ManyToManyField(Tag, blank=True)
    applications = models.ManyToManyField(Application, blank=True)


class Item(models.Model):
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='items',
    )

    global_item = models.ForeignKey(
        GlobalItem,
        on_delete=models.PROTECT,
        related_name='items',
        null=True,
        blank=True,
    )

    description = models.TextField()
    conversions = models.ManyToManyField(Conversion, blank=True)
    tags = models.ManyToManyField(Tag, blank=True)
    applications = models.ManyToManyField(Application, blank=True)
