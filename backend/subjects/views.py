from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsTeacherUser
from .models import Subject
from .serializers import SubjectSerializer


class SubjectCreateView(generics.CreateAPIView):
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated, IsTeacherUser]

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)


class SubjectListView(generics.ListAPIView):
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get_queryset(self):
        return Subject.objects.filter(teacher=self.request.user)