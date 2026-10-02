from django.urls import path

from .views import (
    ExamAttemptCreateView,
    ExamSubmitView,
    StudentResultListView,
    StudentResultDetailView,
    TeacherResultListView,
)
urlpatterns = [
    path(
    "my-results/<int:pk>/",
    StudentResultDetailView.as_view(),
    name="student-result-detail"
),
    path(
        "attempts/",
        ExamAttemptCreateView.as_view(),
        name="attempt-create"
    ),

    path(
        "attempts/<int:attempt_id>/submit/",
        ExamSubmitView.as_view(),
        name="exam-submit"
    ),

    path(
        "my-results/",
        StudentResultListView.as_view(),
        name="student-results"
    ),

    path(
        "teacher-results/",
        TeacherResultListView.as_view(),
        name="teacher-results"
    ),
]