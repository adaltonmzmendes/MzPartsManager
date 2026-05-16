from django.db import models

class Contact(models.Model):
    name = models.CharField(max_length=255)
    document = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    is_client = models.BooleanField(default=True)
    is_supplier = models.BooleanField(default=False)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name