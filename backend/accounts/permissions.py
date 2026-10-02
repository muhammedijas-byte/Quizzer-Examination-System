from rest_framework.permissions import BasePermission


class IsTeacherUser(BasePermission):
    message = "Only teachers can access this endpoint."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            getattr(request.user, "role", None) == "teacher"
        )


class IsStudentUser(BasePermission):
    message = "Only students can access this endpoint."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            getattr(request.user, "role", None) == "student"
        )
