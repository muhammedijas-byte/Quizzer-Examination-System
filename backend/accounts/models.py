from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    ROLE_CHOICES = (
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    )

    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'role']

    student_class = models.ForeignKey(
        'accounts.SchoolClass',
        on_delete=models.SET_NULL,
        related_name='students',
        null=True,
        blank=True,
    )


class SchoolClass(models.Model):
    name = models.CharField(max_length=100)
    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='classes',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name', 'id']
        constraints = [
            models.UniqueConstraint(
                fields=['teacher', 'name'],
                name='unique_class_name_per_teacher',
            ),
        ]

    def __str__(self):
        return self.name
