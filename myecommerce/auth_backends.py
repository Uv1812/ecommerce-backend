from django.contrib.auth.backends import ModelBackend
# from django.contrib.auth.models import User
from django.contrib.auth import get_user_model

User = get_user_model()
# print(User.objects.filter(email="hello@gmail.com").exists()) 

class EmailAuthBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        User = get_user_model()
        try:
            user = User.objects.get(email=username)  # Use email for authentication
            if user.check_password(password):  # Check if password matches    
                return user
        except User.DoesNotExist:
            return None
        return None
