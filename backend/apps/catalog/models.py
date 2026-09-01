from django.db import models
from apps.multicompany.models import Company
from .utils import normalize_name


class Conversion(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def save(self, *args, **kwargs):
        if self.name:
            self.name = normalize_name(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def save(self, *args, **kwargs):
        if self.name:
            self.name = normalize_name(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Application(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name


class GlobalItem(models.Model):
    identity = models.CharField(max_length=50, unique=True)
    normalized_description = models.TextField(null=True, blank=True)
    conversions = models.ManyToManyField(Conversion, blank=True)
    tags = models.ManyToManyField(Tag, blank=True)
    applications = models.ManyToManyField(Application, blank=True)

    def __str__(self):
        return self.identity


class Item(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='items')
    global_item = models.ForeignKey(
        GlobalItem, on_delete=models.PROTECT, related_name='items', null=True, blank=True
    )
    description = models.TextField()
    conversions = models.ManyToManyField(Conversion, blank=True)
    tags = models.ManyToManyField(Tag, blank=True)
    applications = models.ManyToManyField(Application, through='ItemApplication', blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.description


class ItemApplication(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    application = models.ForeignKey(Application, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        unique_together = ('item', 'application')


class ItemImage(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='items/%Y/%m/%d/')
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return f"Imagem de {self.item.description}"