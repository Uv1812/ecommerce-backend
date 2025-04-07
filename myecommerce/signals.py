from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from .models import Customer
from django.contrib.auth.hashers import make_password

@receiver(post_save, sender=User)
def create_customer_profile(sender, instance, created, **kwargs):
    if created:
        # Create a customer profile when a new user is created
        Customer.objects.create(user=instance, email=instance.email, name=instance.username)

@receiver(post_save, sender=User)
def save_customer_profile(sender, instance, **kwargs):
    # Ensure the customer profile exists and save it
    try:
        instance.customer.save()
    except Customer.DoesNotExist:
        # Create the Customer profile if it doesn't exist
        Customer.objects.create(user=instance, email=instance.email, name=instance.username)

@receiver(post_save, sender=User)
def set_password(sender, instance, **kwargs):
    if instance.password:
        instance.password = make_password(instance.password)
        instance.save()