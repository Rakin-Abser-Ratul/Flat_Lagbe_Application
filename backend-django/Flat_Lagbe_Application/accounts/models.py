from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    # Custom user implementation keeping email as the primary login field
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email' 
    REQUIRED_FIELDS = ['username']  

    def __str__(self):
        return self.email


class FlatPost(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='flat_posts'
    )
    
    area = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    full_address = models.TextField()
    contact_no = models.CharField(max_length=15)
    
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    available_from = models.DateField()
    
    # 🆕 NEW ADDITIONS: Structural Specifications
    bedrooms = models.PositiveSmallIntegerField(default=1)
    bathrooms = models.PositiveSmallIntegerField(default=1)
    balconies = models.PositiveSmallIntegerField(default=0)
    floor = models.IntegerField(default=1) # Standard Integer allows for ground floor (0) or basements (-1) if needed

    # Direct Image Storage Reference
   # Change max_length to 500 to accommodate long Cloudinary asset links easily
    image = models.URLField(max_length=500, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.bedrooms} BHK in {self.area}, {self.district} - BDT {self.price}"