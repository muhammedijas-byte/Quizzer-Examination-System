from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    LoginView,
    StudentCreateView,
    StudentDeleteView,
    StudentListView,
    StudentRegisterView,
    SchoolClassListCreateView,
    SchoolClassDetailView,
    UnassignedStudentListView,
    StudentClassAssignmentView,
)


urlpatterns = [
    path('classes/', SchoolClassListCreateView.as_view(), name='class-list-create'),
    path('classes/<int:pk>/', SchoolClassDetailView.as_view(), name='class-detail'),
    path('students/unassigned/', UnassignedStudentListView.as_view(), name='unassigned-students'),
    path('students/<int:pk>/class/', StudentClassAssignmentView.as_view(), name='student-class-assignment'),
    path('register/', StudentRegisterView.as_view(), name='student-register'),
    path(
        'token/refresh/',
        TokenRefreshView.as_view(),
        name='token-refresh'
    ),
    path(
        'login/',
        LoginView.as_view(),
        name='login'
    ),

    path(
        'students/',
        StudentCreateView.as_view(),
        name='student-create'
    ),

    path(
        'students/list/',
        StudentListView.as_view(),
        name='student-list'
    ),
    path(
        'students/<int:pk>/',
        StudentDeleteView.as_view(),
        name='student-delete'
    ),
]
