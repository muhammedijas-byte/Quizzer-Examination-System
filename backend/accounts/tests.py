from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import User, SchoolClass
from exams.models import Exam, Question
from results.models import ExamAttempt
from subjects.models import Subject


class AuthenticationSecurityTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def get_auth_header(self, user):
        refresh = RefreshToken.for_user(user)
        return {"HTTP_AUTHORIZATION": f"Bearer {refresh.access_token}"}

    def test_login_rejects_role_mismatch(self):
        user = User.objects.create_user(
            username="student1",
            email="student1@example.com",
            password="StrongPass123",
            role="student",
        )

        response = self.client.post(
            "/api/login/",
            {
                "email": user.email,
                "password": "StrongPass123",
                "role": "teacher",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Selected designation does not match your account.", str(response.data))

    def test_student_registration_always_creates_student_role(self):
        teacher = User.objects.create_user(
            username="registrationteacher",
            email="registrationteacher@example.com",
            password="StrongPass123",
            role="teacher",
        )
        school_class = SchoolClass.objects.create(name="Registration", teacher=teacher)
        response = self.client.post(
            "/api/register/",
            {
                "username": "newstudent",
                "first_name": "New",
                "last_name": "Student",
                "email": "newstudent@example.com",
                "password": "StrongPass123",
                "confirm_password": "StrongPass123",
                "student_class": school_class.id,
                "role": "teacher",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(User.objects.get(email="newstudent@example.com").role, "student")
        self.assertEqual(User.objects.get(email="newstudent@example.com").student_class, school_class)

    def test_student_cannot_access_teacher_exam_listing(self):
        student = User.objects.create_user(
            username="studentuser",
            email="studentuser@example.com",
            password="StrongPass123",
            role="student",
        )

        self.client.credentials(**self.get_auth_header(student))
        response = self.client.get("/api/exams/list/")

        self.assertEqual(response.status_code, 403)

    def test_teacher_cannot_access_student_result_detail(self):
        teacher = User.objects.create_user(
            username="teacheruser",
            email="teacheruser@example.com",
            password="StrongPass123",
            role="teacher",
        )
        student = User.objects.create_user(
            username="studentuser",
            email="studentuser@example.com",
            password="StrongPass123",
            role="student",
        )
        subject = Subject.objects.create(name="Math", teacher=teacher)
        exam = Exam.objects.create(
            title="Test Exam",
            description="Test",
            subject=subject,
            teacher=teacher,
            duration=30,
            status="published",
        )
        question = Question.objects.create(
            exam=exam,
            question_text="2 + 2?",
            option_a="3",
            option_b="4",
            option_c="5",
            option_d="6",
            correct_option="B",
            order=1,
        )
        attempt = ExamAttempt.objects.create(
            student=student,
            exam=exam,
            score=1,
            total_questions=1,
            percentage=100,
            status="submitted",
        )

        self.client.credentials(**self.get_auth_header(teacher))
        response = self.client.get(
            reverse("student-result-detail", kwargs={"pk": attempt.pk})
        )

        self.assertIn(response.status_code, [403, 404])


class ClassManagementSecurityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.teacher_a = User.objects.create_user(username='class_teacher_a', email='classa@example.com', password='StrongPass123', role='teacher')
        self.teacher_b = User.objects.create_user(username='class_teacher_b', email='classb@example.com', password='StrongPass123', role='teacher')
        self.class_a = SchoolClass.objects.create(name='CSE-A', teacher=self.teacher_a)
        self.class_b = SchoolClass.objects.create(name='ECE-A', teacher=self.teacher_b)

    def authenticate(self, user):
        self.client.force_authenticate(user)

    def get_auth_header(self, user):
        refresh = RefreshToken.for_user(user)
        return {"HTTP_AUTHORIZATION": f"Bearer {refresh.access_token}"}

    def test_teacher_manages_only_owned_classes(self):
        self.authenticate(self.teacher_a)
        self.assertEqual([item['name'] for item in self.client.get('/api/classes/').data], ['CSE-A'])
        self.assertEqual(self.client.get(f'/api/classes/{self.class_b.id}/').status_code, 404)
        self.assertEqual(self.client.patch(f'/api/classes/{self.class_b.id}/', {'name': 'Changed'}).status_code, 404)
        self.assertEqual(self.client.delete(f'/api/classes/{self.class_b.id}/').status_code, 404)

    def test_teacher_can_create_class_and_public_dropdown_lists_all_classes(self):
        self.authenticate(self.teacher_a)
        created = self.client.post('/api/classes/', {'name': 'CSE-B'})
        self.assertEqual(created.status_code, 201)
        self.client.force_authenticate(user=None)
        public_classes = self.client.get('/api/classes/')
        self.assertEqual(public_classes.status_code, 200)
        self.assertEqual({item['name'] for item in public_classes.data}, {'CSE-A', 'CSE-B', 'ECE-A'})

    def test_student_cannot_manage_classes(self):
        student = User.objects.create_user(username='class_student', email='classstudent@example.com', password='StrongPass123', role='student', student_class=self.class_a)
        self.authenticate(student)
        self.assertEqual(self.client.post('/api/classes/', {'name': 'Nope'}).status_code, 403)
        self.assertEqual(self.client.patch(f'/api/classes/{self.class_a.id}/', {'name': 'Nope'}).status_code, 403)
        self.assertEqual(self.client.delete(f'/api/classes/{self.class_a.id}/').status_code, 403)

    def test_teacher_cannot_assign_student_to_another_teachers_class(self):
        self.authenticate(self.teacher_a)
        response = self.client.post('/api/students/', {
            'username': 'createdstudent', 'first_name': 'Test', 'last_name': 'Student',
            'email': 'createdstudent@example.com', 'password': 'StrongPass123',
            'student_class': self.class_b.id,
        })
        self.assertEqual(response.status_code, 400)
        self.assertFalse(User.objects.filter(email='createdstudent@example.com').exists())

    def test_teacher_can_assign_only_unassigned_students_to_owned_class(self):
        unassigned = User.objects.create_user(username='legacy_unassigned', email='legacyunassigned@example.com', password='StrongPass123', role='student')
        assigned_elsewhere = User.objects.create_user(username='already_assigned', email='alreadyassigned@example.com', password='StrongPass123', role='student', student_class=self.class_b)
        self.authenticate(self.teacher_a)
        self.assertEqual([item['id'] for item in self.client.get('/api/students/unassigned/').data], [unassigned.id])
        self.assertEqual(self.client.patch(f'/api/students/{unassigned.id}/class/', {'student_class': self.class_a.id}).status_code, 200)
        self.assertEqual(self.client.patch(f'/api/students/{unassigned.id}/class/', {'student_class': self.class_b.id}).status_code, 404)
        self.assertEqual(self.client.patch(f'/api/students/{assigned_elsewhere.id}/class/', {'student_class': self.class_a.id}).status_code, 404)

    def test_public_registration_requires_valid_class_and_forces_student_role(self):
        response = self.client.post('/api/register/', {
            'username': 'registeredstudent', 'first_name': 'Reg', 'last_name': 'Student',
            'email': 'registeredstudent@example.com', 'password': 'StrongPass123',
            'confirm_password': 'StrongPass123', 'student_class': self.class_a.id, 'role': 'teacher',
        })
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(email='registeredstudent@example.com')
        self.assertEqual(user.role, 'student')
        self.assertEqual(user.student_class, self.class_a)
        bad = self.client.post('/api/register/', {
            'username': 'invalidclassstudent', 'first_name': 'Bad', 'last_name': 'Class',
            'email': 'invalidclass@example.com', 'password': 'StrongPass123',
            'confirm_password': 'StrongPass123', 'student_class': 999999,
        })
        self.assertEqual(bad.status_code, 400)

    def test_class_delete_preserves_students_and_exams_as_unassigned(self):
        student = User.objects.create_user(username='preservedstudent', email='preserved@example.com', password='StrongPass123', role='student', student_class=self.class_a)
        subject = Subject.objects.create(name='Math', teacher=self.teacher_a)
        exam = Exam.objects.create(title='Preserved exam', subject=subject, teacher=self.teacher_a, duration=20, school_class=self.class_a)
        self.authenticate(self.teacher_a)
        self.assertEqual(self.client.delete(f'/api/classes/{self.class_a.id}/').status_code, 204)
        student.refresh_from_db(); exam.refresh_from_db()
        self.assertIsNone(student.student_class_id)
        self.assertIsNone(exam.school_class_id)

    def test_student_cannot_view_another_students_result_detail(self):
        teacher = User.objects.create_user(
            username="teacheruser2",
            email="teacheruser2@example.com",
            password="StrongPass123",
            role="teacher",
        )
        student_a = User.objects.create_user(
            username="studenta",
            email="studenta@example.com",
            password="StrongPass123",
            role="student",
        )
        student_b = User.objects.create_user(
            username="studentb",
            email="studentb@example.com",
            password="StrongPass123",
            role="student",
        )
        subject = Subject.objects.create(name="Science", teacher=teacher)
        exam = Exam.objects.create(
            title="Science Test",
            description="Test",
            subject=subject,
            teacher=teacher,
            duration=30,
            status="published",
        )
        Question.objects.create(
            exam=exam,
            question_text="Capital of France?",
            option_a="Berlin",
            option_b="Paris",
            option_c="Rome",
            option_d="Madrid",
            correct_option="B",
            order=1,
        )
        attempt = ExamAttempt.objects.create(
            student=student_b,
            exam=exam,
            score=1,
            total_questions=1,
            percentage=100,
            status="submitted",
        )

        self.client.credentials(**self.get_auth_header(student_a))
        response = self.client.get(
            reverse("student-result-detail", kwargs={"pk": attempt.pk})
        )

        self.assertIn(response.status_code, [403, 404])

    def test_teacher_cannot_view_another_teachers_exam(self):
        teacher_a = User.objects.create_user(
            username="teachera",
            email="teachera@example.com",
            password="StrongPass123",
            role="teacher",
        )
        teacher_b = User.objects.create_user(
            username="teacherb",
            email="teacherb@example.com",
            password="StrongPass123",
            role="teacher",
        )
        subject = Subject.objects.create(name="History", teacher=teacher_b)
        exam = Exam.objects.create(
            title="Other Teacher's Exam",
            description="Test",
            subject=subject,
            teacher=teacher_b,
            duration=30,
            status="published",
        )

        self.client.credentials(**self.get_auth_header(teacher_a))
        response = self.client.get(f"/api/exams/{exam.pk}/")

        self.assertIn(response.status_code, [403, 404])
