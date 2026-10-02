from rest_framework import serializers
from .models import Exam, Question
from accounts.models import SchoolClass


class ExamSerializer(serializers.ModelSerializer):

    school_class = serializers.PrimaryKeyRelatedField(queryset=SchoolClass.objects.all(), required=False, allow_null=True)
    class_name = serializers.CharField(source='school_class.name', read_only=True)

    subject_name = serializers.CharField(
        source="subject.name",
        read_only=True
    )

    question_count = serializers.SerializerMethodField()

    class Meta:
        model = Exam

        fields = [
            "id",
            "title",
            "description",
            "subject",
            "subject_name",
            "school_class",
            "class_name",
            "teacher",
            "duration",
            "question_count",
            "status",
            "created_at",
        ]

        read_only_fields = [
            "teacher",
            "created_at",
            "subject_name",
            "question_count",
        ]

    def get_question_count(self, obj):
        return obj.questions.count()

    def validate_title(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Exam title cannot be empty."
            )

        return value

    def validate_duration(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Exam duration must be greater than 0 minutes."
            )

        return value

    def validate_status(self, value):
        if value not in ["draft", "published"]:
            raise serializers.ValidationError(
                "Status must be either draft or published."
            )

        return value

    def validate(self, data):

        exam_status = data.get(
            "status",
            self.instance.status
            if self.instance
            else "draft"
        )

        if exam_status == "published":

            school_class = data.get('school_class', getattr(self.instance, 'school_class', None))
            if school_class is None:
                raise serializers.ValidationError({'school_class': 'Assign this exam to a class before publishing.'})

            if self.instance:
                question_count = (
                    self.instance.questions.count()
                )
            else:
                question_count = 0

            if question_count == 0:
                raise serializers.ValidationError(
                    "An exam must have at least one question before it can be published."
                )

        school_class = data.get('school_class', getattr(self.instance, 'school_class', None))
        request = self.context.get('request')
        if request and getattr(request.user, 'role', None) == 'teacher':
            if (self.instance is None and school_class is None) or (school_class is not None and school_class.teacher_id != request.user.id):
                raise serializers.ValidationError({'school_class': 'Select one of your own classes.'})

        return data


class QuestionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Question

        fields = [
            "id",
            "exam",
            "question_text",
            "option_a",
            "option_b",
            "option_c",
            "option_d",
            "correct_option",
            "order",
        ]

        read_only_fields = [
            "id",
        ]

    def validate_question_text(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Question text cannot be empty."
            )

        return value

    def validate_option_a(self, value):
        return self.validate_option(
            value,
            "Option A"
        )

    def validate_option_b(self, value):
        return self.validate_option(
            value,
            "Option B"
        )

    def validate_option_c(self, value):
        return self.validate_option(
            value,
            "Option C"
        )

    def validate_option_d(self, value):
        return self.validate_option(
            value,
            "Option D"
        )

    def validate_option(self, value, option_name):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                f"{option_name} cannot be empty."
            )

        return value

    def validate_correct_option(self, value):
        value = value.upper()

        if value not in ["A", "B", "C", "D"]:
            raise serializers.ValidationError(
                "Correct option must be A, B, C, or D."
            )

        return value

    def validate_order(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Question order must be greater than 0."
            )

        return value


class StudentQuestionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Question

        fields = [
            "id",
            "question_text",
            "option_a",
            "option_b",
            "option_c",
            "option_d",
            "order",
        ]
