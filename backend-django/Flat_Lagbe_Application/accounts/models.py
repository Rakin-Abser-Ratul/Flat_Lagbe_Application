from django.db import models

from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    # Empty for now! We can add custom fields here later without breaking the database.
    email = models.EmailField(unique=True)
    pass
