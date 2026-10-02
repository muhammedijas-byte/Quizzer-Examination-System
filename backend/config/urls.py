from django.contrib import admin
from django.urls import path, include


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    path('api/subjects/', include('subjects.urls')),
    path('api/exams/', include('exams.urls')),
    path('api/results/', include('results.urls')),
]