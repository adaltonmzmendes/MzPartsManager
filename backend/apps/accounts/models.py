from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django_rest_passwordreset.signals import reset_password_token_created
from django.dispatch import receiver
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.conf import settings
from apps.multicompany.models import Company


class CustomUserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("O campo Email é obrigatório.")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    username = None
    email = models.EmailField(max_length=200, unique=True)
    birthday = models.DateField(null=True, blank=True)

    company = models.ForeignKey(
        Company,
        on_delete=models.PROTECT,
        related_name="users",
        null=True,
        blank=True
    )

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []


@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, **kwargs):
    sitelink = settings.FRONTEND_URL
    token = reset_password_token.key
    full_link = f"{sitelink}password_reset/{token}"

    context = {
        'full_link': full_link,
        'email_address': reset_password_token.user.email,
    }

    html_message = render_to_string("email/email.html", context=context)
    plain_message = strip_tags(html_message)

    msg = EmailMultiAlternatives(
        subject=f"Solicitação de redefinição de senha para {reset_password_token.user.email}",
        body=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[reset_password_token.user.email],
    )

    msg.attach_alternative(html_message, "text/html")
    msg.send()
