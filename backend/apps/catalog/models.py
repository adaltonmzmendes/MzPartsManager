from django.db import models
from apps.multicompany.models import Company

class Conversion(models.Model):
    name = models.CharField(max_length=50, unique=True)
    def __str__(self): return self.name

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    def __str__(self): return self.name

class Application(models.Model):
    name = models.CharField(max_length=255, unique=True)
    def __str__(self): return self.name

class GlobalItem(models.Model):
    identity = models.CharField(max_length=50, unique=True) 
    normalized_description = models.TextField(null=True, blank=True)
    conversions = models.ManyToManyField(Conversion, blank=True)
    tags = models.ManyToManyField(Tag, blank=True)
    applications = models.ManyToManyField(Application, blank=True)

    def __str__(self): return self.identity

class Item(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='items')
    global_item = models.ForeignKey(
        GlobalItem, on_delete=models.PROTECT, related_name='items', null=True, blank=True
    )
    description = models.TextField()
    conversions = models.ManyToManyField(Conversion, blank=True)
    tags = models.ManyToManyField(Tag, blank=True)
    applications = models.ManyToManyField(Application, blank=True)
    
    def __str__(self): return self.description