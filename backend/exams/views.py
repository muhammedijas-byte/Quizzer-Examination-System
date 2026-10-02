from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from accounts.permissions import IsTeacherUser, IsStudentUser
from .models import Exam, Question
from .serializers import (
    ExamSerializer,
    QuestionSerializer,
    StudentQuestionSerializer,
)
from subjects.models import Subject
from accounts.models import SchoolClass


class ExamCreateView(generics.CreateAPIView):
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated, IsTeacherUser]

    def perform_create(self, serializer):
        subject_id = self.request.data.get("subject")
        school_class = serializer.validated_data.get('school_class')

        try:
            subject = Subject.objects.get(
                id=subject_id,
                teacher=self.request.user
            )
        except Subject.DoesNotExist:
            raise PermissionDenied(
                "You can only create exams for your own subjects."
            )

        serializer.save(
            teacher=self.request.user,
            subject=subject,
            school_class=school_class,
        )


class ExamListView(generics.ListAPIView):
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get_queryset(self):
        return Exam.objects.filter(
            teacher=self.request.user
        ).order_by("-created_at")


class ExamDetailView(generics.RetrieveAPIView):
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == "teacher":
            return Exam.objects.filter(
                teacher=self.request.user
            )

        if self.request.user.role == "student":
            return Exam.objects.filter(
                status="published",
                school_class_id=self.request.user.student_class_id,
                school_class__isnull=False,
            )

        raise PermissionDenied(
            "Invalid user role."
        )


class ExamUpdateView(generics.UpdateAPIView):
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get_queryset(self):
        return Exam.objects.filter(
            teacher=self.request.user
        )

    def perform_update(self, serializer):
        exam = self.get_object()

        new_status = self.request.data.get(
            "status",
            exam.status
        )

        # Published exams can only be unpublished.
        if exam.status == "published":

            # Allow published -> draft
            if new_status == "draft":
                serializer.save(
                    status="draft",
                    title=exam.title,
                    description=exam.description,
                    subject=exam.subject,
                    school_class=exam.school_class,
                    duration=exam.duration,
                )
                return

            # Prevent modifying published exam content
            raise PermissionDenied(
                "Published exams can only be unpublished."
            )

        # Draft exam
        subject_id = self.request.data.get("subject")
        class_id = self.request.data.get("school_class")

        if subject_id is not None:
            try:
                subject = Subject.objects.get(
                    id=subject_id,
                    teacher=self.request.user
                )
            except Subject.DoesNotExist:
                raise PermissionDenied(
                    "You can only use your own subjects."
                )

        if class_id is not None:
            try:
                school_class = SchoolClass.objects.get(id=class_id, teacher=self.request.user)
            except (SchoolClass.DoesNotExist, TypeError, ValueError):
                raise PermissionDenied("You can only use your own classes.")
        else:
            school_class = exam.school_class
        serializer.save(**({'subject': subject} if subject_id is not None else {}), school_class=school_class)


class QuestionCreateView(generics.CreateAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated, IsTeacherUser]

    def perform_create(self, serializer):
        exam_id = self.request.data.get("exam")

        try:
            exam = Exam.objects.get(
                id=exam_id,
                teacher=self.request.user
            )
        except Exam.DoesNotExist:
            raise PermissionDenied(
                "You can only add questions to your own exams."
            )

        # Do not allow changes to published exams
        if exam.status == "published":
            raise PermissionDenied(
                "Published exams cannot be modified."
            )

        # Automatically assign the next question order
        next_order = exam.questions.count() + 1

        serializer.save(
            exam=exam,
            order=next_order
        )


class QuestionListView(generics.ListAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get_queryset(self):
        exam_id = self.request.query_params.get("exam")

        if not exam_id:
            return Question.objects.none()

        return Question.objects.filter(
            exam__id=exam_id,
            exam__teacher=self.request.user
        ).order_by("order")
class QuestionDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get_queryset(self):
        return Question.objects.filter(
            exam__teacher=self.request.user
        )

    def perform_update(self, serializer):
        if serializer.instance.exam.status == "published":
            raise PermissionDenied(
                "Published exams cannot be modified."
            )

        serializer.save()


class QuestionDeleteView(generics.DestroyAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get_queryset(self):
        return Question.objects.filter(
            exam__teacher=self.request.user
        )

    def perform_destroy(self, instance):
        exam = instance.exam

        # Do not allow deletion from published exams
        if exam.status == "published":
            raise PermissionDenied(
                "Published exams cannot be modified."
            )

        instance.delete()

        # Re-number remaining questions
        remaining_questions = Question.objects.filter(
            exam=exam
        ).order_by("order", "id")

        for index, question in enumerate(
            remaining_questions,
            start=1
        ):
            if question.order != index:
                question.order = index
                question.save(update_fields=["order"])


class AvailableExamListView(generics.ListAPIView):
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated, IsStudentUser]

    def get_queryset(self):
        return Exam.objects.filter(
            status="published",
            school_class_id=self.request.user.student_class_id,
            school_class__isnull=False,
        ).order_by("-created_at")


class StudentQuestionListView(generics.ListAPIView):
    serializer_class = StudentQuestionSerializer
    permission_classes = [IsAuthenticated, IsStudentUser]

    def get_queryset(self):

        exam_id = self.kwargs.get("exam_id")

        try:
            exam = Exam.objects.get(
                id=exam_id,
                status="published",
                school_class_id=self.request.user.student_class_id,
                school_class__isnull=False,
            )
        except Exam.DoesNotExist:
            raise PermissionDenied(
                "This exam is not available."
            )

        return Question.objects.filter(
            exam=exam
        ).order_by("order")
