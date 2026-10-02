from django.db import models
from accounts.models import User


class Subject(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='subjects'
    )

    def __str__(self):
        return self.name
