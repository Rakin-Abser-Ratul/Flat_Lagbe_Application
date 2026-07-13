from django.shortcuts import render
from .serializers import RegisterSerializer
from rest_framework import generics
from .models import CustomUser
from rest_framework.permissions import AllowAny

# Create your views here.
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]  # Allow anyone to access this view 