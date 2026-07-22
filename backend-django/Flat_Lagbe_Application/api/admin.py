from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from accounts.models import CustomUser
from accounts.models import FlatPost # Adjust import path based on your folder structure

# User Admin Config
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['username', 'email', 'is_staff', 'is_active']

admin.site.register(CustomUser, CustomUserAdmin)

# FlatPost Admin Config
@admin.register(FlatPost)
class FlatPostAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'area', 'district', 'price', 'created_at']
    list_filter = ['district', 'area']
    search_fields = ['area', 'district', 'user__email']