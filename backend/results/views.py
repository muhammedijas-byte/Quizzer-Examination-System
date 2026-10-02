from django.utils import timezone

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from accounts.permissions import IsTeacherUser, IsStudentUser
from .models import ExamAttempt, Answer
from .serializers import (
    ExamAttemptSerializer,
    ExamSubmissionSerializer,
    StudentResultDetailSerializer,
)

from exams.models import Exam, Question


class ExamAttemptCreateView(generics.CreateAPIView):
    serializer_class = ExamAttemptSerializer
    permission_classes = [IsAuthenticated, IsStudentUser]

    def create(self, request, *args, **kwargs):

        exam_id = request.data.get("exam")

        try:
            exam = Exam.objects.get(
                id=exam_id,
                status="published",
                school_class_id=request.user.student_class_id,
                school_class__isnull=False,
            )
        except Exam.DoesNotExist:
            raise PermissionDenied(
                "Exam not found or not available."
            )

        existing_attempt = ExamAttempt.objects.filter(
            student=request.user,
            exam=exam
        ).first()

        if existing_attempt:

            # Already submitted
            if existing_attempt.status == "submitted":
                raise PermissionDenied(
                    "You have already submitted this exam."
                )

            # Check whether unfinished attempt has expired
            elapsed_seconds = (
                timezone.now() - existing_attempt.started_at
            ).total_seconds()

            allowed_seconds = exam.duration * 60

            if elapsed_seconds > allowed_seconds:
                raise PermissionDenied(
                    "The time for this exam has expired."
                )

            # Resume unfinished attempt
            return Response(
                ExamAttemptSerializer(
                    existing_attempt
                ).data,
                status=status.HTTP_200_OK
            )

        total_questions = exam.questions.count()

        if total_questions == 0:
            raise PermissionDenied(
                "This exam has no questions."
            )

        attempt = ExamAttempt.objects.create(
            student=request.user,
            exam=exam,
            total_questions=total_questions
        )

        return Response(
            ExamAttemptSerializer(attempt).data,
            status=status.HTTP_201_CREATED
        )


class ExamSubmitView(generics.GenericAPIView):

    serializer_class = ExamSubmissionSerializer
    permission_classes = [IsAuthenticated, IsStudentUser]

    def post(self, request, attempt_id):

        try:
            attempt = ExamAttempt.objects.select_related(
                "exam"
            ).get(
                id=attempt_id,
                student=request.user
            )

        except ExamAttempt.DoesNotExist:
            raise PermissionDenied(
                "Exam attempt not found."
            )

        # Prevent duplicate submission
        if attempt.status == "submitted":
            raise PermissionDenied(
                "This exam has already been submitted."
            )

        if (
            request.user.student_class_id is None
            or attempt.exam.school_class_id != request.user.student_class_id
            or attempt.exam.status != 'published'
        ):
            raise PermissionDenied("This exam is not available to your class.")

        # Validate request first
        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        answers = serializer.validated_data["answers"]

        # Prevent duplicate question IDs
        question_ids = [
            answer["question"]
            for answer in answers
        ]

        if len(question_ids) != len(set(question_ids)):
            return Response(
                {
                    "detail":
                    "Duplicate question answers are not allowed."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        exam = attempt.exam

        # Only questions belonging to this exam are valid
        exam_question_ids = set(
            exam.questions.values_list(
                "id",
                flat=True
            )
        )

        submitted_question_ids = set(question_ids)

        invalid_question_ids = (
            submitted_question_ids -
            exam_question_ids
        )

        if invalid_question_ids:
            return Response(
                {
                    "detail":
                    "One or more questions do not belong to this exam."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check backend timer
        now = timezone.now()

        elapsed_seconds = (
            now - attempt.started_at
        ).total_seconds()

        allowed_seconds = (
            exam.duration * 60
        )

        if elapsed_seconds > allowed_seconds:

            return self._submit_exam(
                request,
                attempt,
                answers,
                timed_out=True
            )

        return self._submit_exam(
            request,
            attempt,
            answers
        )

    def _submit_exam(
        self,
        request,
        attempt,
        answers=None,
        timed_out=False
    ):

        exam = attempt.exam

        if answers is None:
            answers = []

        score = 0
        wrong_answers = 0
        unanswered = 0

        for answer_data in answers:

            try:
                question = exam.questions.get(
                    id=answer_data["question"]
                )
            except Question.DoesNotExist:
                continue

            selected_option = answer_data.get(
                "selected_option"
            )

            if selected_option is None:
                is_correct = False
                unanswered += 1
            else:
                is_correct = (
                    selected_option
                    == question.correct_option
                )

                if is_correct:
                    score += 1
                else:
                    wrong_answers += 1

            Answer.objects.update_or_create(
                attempt=attempt,
                question=question,
                defaults={
                    "selected_option": selected_option,
                    "is_correct": is_correct,
                }
            )

        total_questions = exam.questions.count()

        # Questions not included in the submission
        # are also considered unanswered.
        submitted_question_ids = {
            answer_data["question"]
            for answer_data in answers
        }

        unanswered += Question.objects.filter(
            exam=exam
        ).exclude(
            id__in=submitted_question_ids
        ).count()

        for question in exam.questions.exclude(
            id__in=submitted_question_ids
        ):
            Answer.objects.update_or_create(
                attempt=attempt,
                question=question,
                defaults={
                    "selected_option": None,
                    "is_correct": False,
                }
            )

        percentage = (
            (score / total_questions) * 100
            if total_questions > 0
            else 0
        )

        attempt.score = score
        attempt.total_questions = total_questions
        attempt.percentage = percentage
        attempt.status = "submitted"
        attempt.submitted_at = timezone.now()

        attempt.save()

        return Response(
            {
                "message":
                    (
                        "Time expired. Exam submitted automatically."
                        if timed_out
                        else
                        "Exam submitted successfully."
                    ),

                "attempt_id": attempt.id,

                "score": score,

                "total_questions":
                    total_questions,

                "percentage":
                    round(percentage, 2),

                "correct_answers": score,

                "wrong_answers": wrong_answers,

                "unanswered": unanswered,

                "status":
                    attempt.status,
            },
            status=status.HTTP_200_OK
        )


class StudentResultListView(generics.ListAPIView):

    serializer_class = ExamAttemptSerializer
    permission_classes = [IsAuthenticated, IsStudentUser]

    def get_queryset(self):
        return (
            ExamAttempt.objects
            .filter(
                student=self.request.user,
                status="submitted"
            )
            .select_related("exam")
            .order_by("-submitted_at")
        )
class StudentResultDetailView(generics.RetrieveAPIView):
    serializer_class = StudentResultDetailSerializer
    permission_classes = [IsAuthenticated, IsStudentUser]

    def get_queryset(self):
        return (
            ExamAttempt.objects
            .filter(
                student=self.request.user,
                status="submitted"
            )
            .select_related(
                "exam",
                "exam__subject"
            )
            .prefetch_related(
                "answers__question"
            )
        )
class TeacherResultListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get(self, request, *args, **kwargs):

        attempts = (
            ExamAttempt.objects
            .filter(
                exam__teacher=request.user,
                status="submitted"
            )
            .select_related(
                "student",
                "exam",
                "exam__subject"
            )
            .order_by("-submitted_at")
        )

        data = []

        for attempt in attempts:
            correct = attempt.answers.filter(
                is_correct=True
            ).count()

            wrong = attempt.answers.filter(
                is_correct=False,
                selected_option__isnull=False
            ).count()

            unanswered = attempt.answers.filter(
                selected_option__isnull=True
            ).count()

            data.append({
                "attempt_id": attempt.id,
                "student_id": attempt.student.id,
                "student_name": attempt.student.username,
                "student_email": attempt.student.email,
                "exam_id": attempt.exam.id,
                "exam_name": attempt.exam.title,
                "subject_name": attempt.exam.subject.name,
                "score": attempt.score,
                "total_questions": attempt.total_questions,
                "percentage": float(attempt.percentage),
                "correct_answers": correct,
                "wrong_answers": wrong,
                "unanswered": unanswered,
                "submitted_at": attempt.submitted_at,
            })

        return Response(data)
