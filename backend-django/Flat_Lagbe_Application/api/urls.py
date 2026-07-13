from django.urls import path ,include
from accounts.views import RegisterView

urlpatterns = [
   
    path('register/', RegisterView.as_view()),  # Include the  app URLs
]