from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import User, SchoolClass
from exams.models import Exam, Question
from subjects.models import Subject


class ClassBasedExamAccessTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.teacher = User.objects.create_user(username='exam_teacher', email='examteacher@example.com', password='StrongPass123', role='teacher')
        self.other_teacher = User.objects.create_user(username='other_exam_teacher', email='otherexamteacher@example.com', password='StrongPass123', role='teacher')
        self.class_a = SchoolClass.objects.create(name='CSE-A', teacher=self.teacher)
        self.class_b = SchoolClass.objects.create(name='ECE-A', teacher=self.other_teacher)
        self.student_a = User.objects.create_user(username='exam_student_a', email='exama@example.com', password='StrongPass123', role='student', student_class=self.class_a)
        self.student_b = User.objects.create_user(username='exam_student_b', email='examb@example.com', password='StrongPass123', role='student', student_class=self.class_b)
        subject = Subject.objects.create(name='Python', teacher=self.teacher)
        self.exam_a = Exam.objects.create(title='CSE Exam', subject=subject, teacher=self.teacher, school_class=self.class_a, duration=30, status='published')
        self.exam_b = Exam.objects.create(title='Legacy unassigned', subject=subject, teacher=self.teacher, duration=30, status='published')
        self.question = Question.objects.create(exam=self.exam_a, question_text='Question?', option_a='A', option_b='B', option_c='C', option_d='D', correct_option='A')

    def test_student_receives_only_published_exams_for_own_class(self):
        self.client.force_authenticate(self.student_a)
        response = self.client.get('/api/exams/available/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item['id'] for item in response.data], [self.exam_a.id])

    def test_student_cannot_retrieve_exam_questions_or_start_other_class_exam(self):
        self.client.force_authenticate(self.student_b)
        self.assertEqual(self.client.get(f'/api/exams/{self.exam_a.id}/').status_code, 404)
        self.assertEqual(self.client.get(f'/api/exams/{self.exam_a.id}/questions/').status_code, 403)
        self.assertEqual(self.client.post('/api/results/attempts/', {'exam': self.exam_a.id}).status_code, 403)

    def test_teacher_cannot_create_exam_for_other_teachers_class(self):
        self.client.force_authenticate(self.teacher)
        subject = Subject.objects.create(name='Data Structures', teacher=self.teacher)
        response = self.client.post('/api/exams/', {
            'title': 'Unauthorized assignment', 'subject': subject.id,
            'school_class': self.class_b.id, 'duration': 30, 'status': 'draft',
        })
        self.assertEqual(response.status_code, 400)

    def test_student_without_class_sees_no_exams(self):
        student = User.objects.create_user(username='unassigned', email='unassigned@example.com', password='StrongPass123', role='student')
        self.client.force_authenticate(student)
        self.assertEqual(self.client.get('/api/exams/available/').data, [])
