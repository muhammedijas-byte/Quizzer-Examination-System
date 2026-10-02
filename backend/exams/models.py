from django.db import models
from accounts.models import User
from subjects.models import Subject
from accounts.models import SchoolClass


class Exam(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('published', 'Published'),
    )

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='exams'
    )
    school_class = models.ForeignKey(
        SchoolClass,
        on_delete=models.SET_NULL,
        related_name='exams',
        null=True,
        blank=True,
    )
    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='exams'
    )
    duration = models.PositiveIntegerField(help_text="Duration in minutes")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
class Question(models.Model):
    exam = models.ForeignKey(
        Exam,
        on_delete=models.CASCADE,
        related_name='questions'
    )
    question_text = models.TextField()
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)

    CORRECT_OPTION_CHOICES = (
        ('A', 'Option A'),
        ('B', 'Option B'),
        ('C', 'Option C'),
        ('D', 'Option D'),
    )

    correct_option = models.CharField(
        max_length=1,
        choices=CORRECT_OPTION_CHOICES
    )
    order = models.PositiveIntegerField(default=1)

    def __str__(self):
        return self.question_text
