from rest_framework import serializers
from .models import CustomUser, FlatPost

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user


class FlatPostSerializer(serializers.ModelSerializer):
    user_username = serializers.ReadOnlyField(source='user.username')
    
    # 1. Accept file uploads from React multipart form-data
    image = serializers.ImageField(write_only=True, required=False, allow_null=True)
    
    # 2. Return the full Cloudinary or media URL back to React
    image_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = FlatPost
        fields = [
            'id', 
            'user_username', 
            'area', 
            'district', 
            'full_address', 
            'contact_no', 
            'price', 
            'description', 
            'available_from', 
            
            # Layout Attributes
            'bedrooms',
            'bathrooms',
            'balconies',
            'floor',
            
            'image',      # Incoming upload file key (write-only)
            'image_url',  # Outgoing Cloudinary URL string key (read-only)
            'created_at'
        ]
        read_only_fields = ['id', 'user_username', 'created_at', 'image_url']

    def get_image_url(self, obj):
        if not obj.image:
            return None
        
        try:
            # If it's a Django FieldFile instance with a .url property
            if hasattr(obj.image, 'url'):
                return obj.image.url
            # If it's a raw string containing the Cloudinary URL
            return str(obj.image)
        except Exception:
            return None