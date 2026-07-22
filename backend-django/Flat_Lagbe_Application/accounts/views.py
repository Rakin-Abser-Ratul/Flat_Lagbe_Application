from django.shortcuts import render
from django.http import HttpResponse, StreamingHttpResponse, Http404
import requests
import cloudinary.uploader

from rest_framework import generics, viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, authentication_classes, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from django.http import FileResponse

from .models import CustomUser, FlatPost
from .serializers import RegisterSerializer, FlatPostSerializer


from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser
from .serializers import RegisterSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "username": request.user.username,
            "email": request.user.email,
        })

class RegisterView(generics.CreateAPIView):
    """
    An API endpoint that allows new users to register and immediately returns
    user profile details along with JWT auth tokens.
    """
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens for the newly created user
        refresh = RefreshToken.for_user(user)

        return Response({
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
            "message": "User registered successfully."
        }, status=status.HTTP_201_CREATED)

class FlatPostViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for viewing and editing flat post listings.
    Allows authenticated users to create and update posts, open read-only for public browsing.
    """
    queryset = FlatPost.objects.all().order_by('-created_at')
    serializer_class = FlatPostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        image_file = request.FILES.get('image')
        uploaded_image_url = None

        if image_file:
            try:
                upload_result = cloudinary.uploader.upload(
                    image_file,
                    folder="flat_lagbe_listings"
                )
                uploaded_image_url = upload_result.get('secure_url')
            except Exception as e:
                return Response(
                    {"image": [f"Cloudinary media upload failed: {str(e)}"]},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            return Response(
                {"image": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST
            )

        instance = serializer.save(user=request.user, image=uploaded_image_url)
        
        return_serializer = self.get_serializer(instance)
        headers = self.get_success_headers(return_serializer.data)
        return Response(return_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        """
        Custom PUT handler: Handles updating flat details along with optional Cloudinary re-upload.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # Validate basic text fields with DRF serializer
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        image_file = request.FILES.get('image')
        
        # If a NEW file was uploaded, send it to Cloudinary; otherwise keep existing image URL
        if image_file:
            try:
                upload_result = cloudinary.uploader.upload(
                    image_file,
                    folder="flat_lagbe_listings"
                )
                uploaded_image_url = upload_result.get('secure_url')
            except Exception as e:
                return Response(
                    {"image": [f"Cloudinary media upload failed: {str(e)}"]},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            uploaded_image_url = instance.image

        # Save model instance with updated field values and final image URL
        updated_instance = serializer.save(image=uploaded_image_url)

        return Response(self.get_serializer(updated_instance).data, status=status.HTTP_200_OK)

    def partial_update(self, request, *args, **kwargs):
        """
        Custom PATCH handler delegating directly to update.
        """
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    @authentication_classes([]) 
    def image(self, request, pk=None):
        """
        Custom sub-route: Fetch binary asset from Cloudinary and stream raw bytes.
        """
        instance = self.get_object()
        image_url_string = instance.image
        
        if not image_url_string:
            raise Http404("No image stored for this listing.")

        try:
            response = requests.get(image_url_string, stream=True)
            
            if response.status_code == 200:
                content_type = response.headers.get('Content-Type', 'image/jpeg')
                
                django_response = StreamingHttpResponse(
                    response.iter_content(chunk_size=4096),
                    content_type=content_type
                )
                django_response['Content-Length'] = response.headers.get('Content-Length')
                return django_response
                
            return Response(
                {"error": "Failed to fetch actual image from cloud source."},
                status=status.HTTP_502_BAD_GATEWAY
            )
        except Exception as e:
            return Response(
                {"error": f"Proxy streaming failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_flat_image(request, pk):
    try:
        flat = FlatPost.objects.get(pk=pk)
        if flat.image:
            return FileResponse(flat.image.open(), content_type='image/jpeg')
    except FlatPost.DoesNotExist:
        pass
    return HttpResponse(status=404)