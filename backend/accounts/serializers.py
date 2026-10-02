from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, SchoolClass


class SchoolClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolClass
        fields = ['id', 'name', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Class name cannot be empty.')
        teacher = self.context['request'].user
        if SchoolClass.objects.filter(teacher=teacher, name__iexact=value).exclude(
            pk=getattr(self.instance, 'pk', None)
        ).exists():
            raise serializers.ValidationError('You already have a class with this name.')
        return value


class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True
    )
    role = serializers.ChoiceField(
        choices=User.ROLE_CHOICES
    )

    def validate(self, data):

        email = data.get('email')
        password = data.get('password')
        role = data.get('role')

        user = authenticate(
            username=email,
            password=password
        )

        if user is None:
            raise serializers.ValidationError(
                "Invalid email or password."
            )

        if user.role != role:
            raise serializers.ValidationError(
                "Selected designation does not match your account."
            )

        data['user'] = user

        return data

class StudentCreateSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=6
    )
    student_class = serializers.PrimaryKeyRelatedField(queryset=SchoolClass.objects.all())
    class_name = serializers.CharField(source='student_class.name', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'password', 'student_class', 'class_name']

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get('request')
        if request and getattr(request.user, 'role', None) == 'teacher':
            fields['student_class'].queryset = SchoolClass.objects.filter(teacher=request.user)
        return fields

    def create(self, validated_data):
        password = validated_data.pop('password')

        user = User.objects.create_user(
            password=password,
            role='student',
            **validated_data
        )

        return user
class StudentRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)
    student_class = serializers.PrimaryKeyRelatedField(queryset=SchoolClass.objects.all())

    class Meta:
        model = User
        fields = [
            'username',
            'first_name',
            'last_name',
            'email',
            'password',
            'confirm_password',
            'student_class',
        ]

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'Passwords do not match.'
            })

        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            password=password,
            role='student',
            **validated_data
        )

        return user


class UnassignedStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']
        read_only_fields = fields


class StudentClassAssignmentSerializer(serializers.ModelSerializer):
    student_class = serializers.PrimaryKeyRelatedField(queryset=SchoolClass.objects.all())

    class Meta:
        model = User
        fields = ['student_class']

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get('request')
        if request and getattr(request.user, 'role', None) == 'teacher':
            fields['student_class'].queryset = SchoolClass.objects.filter(teacher=request.user)
        return fields
