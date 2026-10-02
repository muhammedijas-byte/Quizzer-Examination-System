from django.urls import path
from .views import SubjectCreateView, SubjectListView

urlpatterns = [
    path('', SubjectCreateView.as_view(), name='subject-create'),
    path('list/', SubjectListView.as_view(), name='subject-list'),
]