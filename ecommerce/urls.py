from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
# from myecommerce.views import admin_login ,catalog_view
# from myecommerce import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('myecommerce.urls')),
    # path('api/',include('urls.py')),  
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
