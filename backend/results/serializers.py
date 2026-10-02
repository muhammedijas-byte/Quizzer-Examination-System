from rest_framework import serializers
from .models import ExamAttempt, Answer


class ExamAttemptSerializer(serializers.ModelSerializer):
    exam_name = serializers.CharField(
        source="exam.title",
        read_only=True
    )

    subject_name = serializers.CharField(
        source="exam.subject.name",
        read_only=True
    )

    correct_answers = serializers.SerializerMethodField()
    wrong_answers = serializers.SerializerMethodField()
    unanswered = serializers.SerializerMethodField()

    class Meta:
        model = ExamAttempt

        fields = [
            "id",
            "exam",
            "exam_name",
            "subject_name",
            "started_at",
            "submitted_at",
            "status",
            "score",
            "total_questions",
            "percentage",
            "correct_answers",
            "wrong_answers",
            "unanswered",
        ]

        read_only_fields = [
            "started_at",
            "submitted_at",
            "status",
            "score",
            "total_questions",
            "percentage",
            "correct_answers",
            "wrong_answers",
            "unanswered",
        ]

    def get_correct_answers(self, obj):
        return obj.answers.filter(
            is_correct=True
        ).count()

    def get_wrong_answers(self, obj):
        return obj.answers.filter(
            is_correct=False,
            selected_option__isnull=False
        ).count()

    def get_unanswered(self, obj):
        return obj.answers.filter(
            selected_option__isnull=True
        ).count()


class AnswerSubmissionSerializer(serializers.Serializer):
    question = serializers.IntegerField()

    selected_option = serializers.ChoiceField(
        choices=["A", "B", "C", "D"],
        allow_null=True,
        required=False
    )


class ExamSubmissionSerializer(serializers.Serializer):
    answers = AnswerSubmissionSerializer(
        many=True
    )
class AnswerResultSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(
        source="question.question_text",
        read_only=True
    )

    correct_option = serializers.CharField(
        source="question.correct_option",
        read_only=True
    )

    class Meta:
        model = Answer

        fields = [
            "question",
            "question_text",
            "selected_option",
            "correct_option",
            "is_correct",
        ]
class StudentResultDetailSerializer(serializers.ModelSerializer):
    exam_name = serializers.CharField(
        source="exam.title",
        read_only=True
    )

    subject_name = serializers.CharField(
        source="exam.subject.name",
        read_only=True
    )

    answers = AnswerResultSerializer(
        many=True,
        read_only=True
    )

    correct_answers = serializers.SerializerMethodField()
    wrong_answers = serializers.SerializerMethodField()
    unanswered = serializers.SerializerMethodField()

    class Meta:
        model = ExamAttempt

        fields = [
            "id",
            "exam",
            "exam_name",
            "subject_name",
            "started_at",
            "submitted_at",
            "status",
            "score",
            "total_questions",
            "percentage",
            "correct_answers",
            "wrong_answers",
            "unanswered",
            "answers",
        ]

        read_only_fields = [
    "id",
    "exam",
    "exam_name",
    "subject_name",
    "started_at",
    "submitted_at",
    "status",
    "score",
    "total_questions",
    "percentage",
    "correct_answers",
    "wrong_answers",
    "unanswered",
    "answers",
]

    def get_correct_answers(self, obj):
        return obj.answers.filter(
            is_correct=True
        ).count()

    def get_wrong_answers(self, obj):
        return obj.answers.filter(
            is_correct=False,
            selected_option__isnull=False
        ).count()

    def get_unanswered(self, obj):
        return obj.answers.filter(
            selected_option__isnull=True
        ).count()
