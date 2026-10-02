from django.urls import path
from .views import (
    ExamCreateView,
    ExamListView,
    ExamDetailView,
    QuestionDetailView,
    ExamUpdateView,
    AvailableExamListView,
    QuestionCreateView,
    QuestionListView,
    QuestionDeleteView,
    StudentQuestionListView,
)

urlpatterns = [
    
    path(
        'available/',
        AvailableExamListView.as_view(),
        name='available-exams'
    ),

    path(
        '<int:pk>/',
        ExamDetailView.as_view(),
        name='exam-detail'
    ),

    path(
        '<int:pk>/update/',
        ExamUpdateView.as_view(),
        name='exam-update'
    ),

    path(
        '',
        ExamCreateView.as_view(),
        name='exam-create'
    ),

    path(
        'list/',
        ExamListView.as_view(),
        name='exam-list'
    ),

    path(
        'questions/',
        QuestionCreateView.as_view(),
        name='question-create'
    ),

    path(
        'questions/list/',
        QuestionListView.as_view(),
        name='question-list'
    ),
    path(
    'questions/<int:pk>/',
    QuestionDetailView.as_view(),
    name='question-detail'
),

    path(
        'questions/<int:pk>/delete/',
        QuestionDeleteView.as_view(),
        name='question-delete'
    ),

    path(
        '<int:exam_id>/questions/',
        StudentQuestionListView.as_view(),
        name='student-question-list'
    ),
]