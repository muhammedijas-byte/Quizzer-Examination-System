# Quizzer – Examination System

Quizzer is a full-stack online examination system designed for teachers and students. It provides a complete platform for creating, managing, conducting, and evaluating MCQ-based examinations.

## Features

- Teacher and Student login
- Student self-registration
- Role-based access control
- Class management
- Student management
- Subject management
- Examination creation and management
- MCQ question creation and management
- Automatic question numbering
- Class-based examination assignment
- Online examination interface
- Countdown timer
- Automatic submission when time expires
- Answer persistence during examination
- Duplicate attempt prevention
- Automatic evaluation and scoring
- Student result history
- Detailed student result review
- Teacher result management
- Secure backend authorization and validation
- Responsive user interface

## Technologies Used

### Frontend
- React
- Vite
- JavaScript
- Axios
- React Router
- CSS

### Backend
- Python
- Django
- Django REST Framework
- Simple JWT
- django-cors-headers

### Database
- SQLite

## Project Architecture

```text
Quizzer
│
├── Frontend
│   └── React + Vite
│
└── Backend
    └── Django REST Framework
        │
        └── SQLite Database
