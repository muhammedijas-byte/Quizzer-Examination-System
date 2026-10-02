from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, SchoolClass
from .serializers import LoginSerializer, StudentCreateSerializer, SchoolClassSerializer, UnassignedStudentSerializer, StudentClassAssignmentSerializer

from .serializers import (
    LoginSerializer,
    StudentCreateSerializer,
    StudentRegisterSerializer,
)

class StudentRegisterView(generics.CreateAPIView):
    serializer_class = StudentRegisterSerializer
    permission_classes = []
class LoginView(APIView):

    def post(self, request):

        serializer = LoginSerializer(
            data=request.data
        )

        if serializer.is_valid():

            user = serializer.validated_data['user']

            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    'message': 'Login successful',
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': {
                        'id': user.id,
                        'name': user.get_full_name(),
                        'email': user.email,
                        'role': user.role,
                    }
                },
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class StudentCreateView(generics.CreateAPIView):
    serializer_class = StudentCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.role != 'teacher':
            raise PermissionDenied("Only teachers can create students.")

        serializer.save()


class StudentListView(generics.ListAPIView):
    serializer_class = StudentCreateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'teacher':
            raise PermissionDenied("Only teachers can view students.")

        return User.objects.filter(role='student', student_class__teacher=self.request.user).select_related('student_class').order_by('last_name', 'first_name', 'id')

    serializer_class = StudentCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):

        if self.request.user.role != 'teacher':
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied(
                "Only teachers can create students."
            )

        serializer.save()


class StudentDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'teacher':
            raise PermissionDenied("Only teachers can remove students.")

        return User.objects.filter(role='student', student_class__teacher=self.request.user)


class UnassignedStudentListView(generics.ListAPIView):
    serializer_class = UnassignedStudentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'teacher':
            raise PermissionDenied('Only teachers can view unassigned students.')
        return User.objects.filter(role='student', student_class__isnull=True).order_by('last_name', 'first_name', 'id')


class StudentClassAssignmentView(generics.UpdateAPIView):
    serializer_class = StudentClassAssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'teacher':
            raise PermissionDenied('Only teachers can assign students to classes.')
        return User.objects.filter(role='student', student_class__isnull=True)


class SchoolClassListCreateView(generics.ListCreateAPIView):
    serializer_class = SchoolClassSerializer

    def get_permissions(self):
        return [AllowAny()] if self.request.method == 'GET' else [IsAuthenticated()]

    def get_queryset(self):
        if getattr(self.request.user, 'role', None) == 'teacher':
            return SchoolClass.objects.filter(teacher=self.request.user).order_by('name', 'id')
        if self.request.method == 'GET':
            return SchoolClass.objects.all().order_by('name', 'id')
        raise PermissionDenied('Only teachers can manage classes.')

    def perform_create(self, serializer):
        if self.request.user.role != 'teacher':
            raise PermissionDenied('Only teachers can create classes.')
        serializer.save(teacher=self.request.user)


class SchoolClassDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SchoolClassSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'teacher':
            raise PermissionDenied('Only teachers can manage classes.')
        return SchoolClass.objects.filter(teacher=self.request.user)
