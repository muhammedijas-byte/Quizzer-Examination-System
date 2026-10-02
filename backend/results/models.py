from django.db import models
from accounts.models import User
from exams.models import Exam, Question


class ExamAttempt(models.Model):
    STATUS_CHOICES = (
        ('in_progress', 'In Progress'),
        ('submitted', 'Submitted'),
    )

    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='exam_attempts'
    )
    exam = models.ForeignKey(
        Exam,
        on_delete=models.CASCADE,
        related_name='attempts'
    )
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='in_progress'
    )
    score = models.PositiveIntegerField(default=0)
    total_questions = models.PositiveIntegerField(default=0)
    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['student', 'exam'],
                name='unique_student_exam_attempt'
            )
        ]

    def __str__(self):
        return f"{self.student.email} - {self.exam.title}"


class Answer(models.Model):
    attempt = models.ForeignKey(
        ExamAttempt,
        on_delete=models.CASCADE,
        related_name='answers'
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name='answers'
    )
    selected_option = models.CharField(
    max_length=1,
    choices=[
        ("A", "A"),
        ("B", "B"),
        ("C", "C"),
        ("D", "D"),
    ],
    null=True,
    blank=True,
)
    is_correct = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['attempt', 'question'],
                name='unique_attempt_question_answer'
            )
        ]

    def __str__(self):
        return f"{self.attempt} - Question {self.question.id}"