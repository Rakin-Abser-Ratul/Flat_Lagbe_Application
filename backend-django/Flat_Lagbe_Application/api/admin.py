from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from accounts.models import CustomUser

# This class handles how your CustomUser model acts and looks in the dashboard
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    # For now, we display the standard fields in the list view
    list_display = ['username', 'email','password', 'is_staff', 'is_active']

# Register your model so it shows up on the admin homepage
admin.site.register(CustomUser, CustomUserAdmin)