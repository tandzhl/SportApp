from rest_framework import permissions
from sports.models import SportClass


class IsSportClassOwner(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, sportclass):
        return super().has_permission(request, view) and request.user == sportclass.coach

class IsCoachOfScheduleSportClass(permissions.BasePermission):
    """
    Chỉ cho phép nếu user là coach của sportclass liên kết với schedule (obj).
    Dùng cho các thao tác object-level như update, delete Schedule.
    """

    def has_object_permission(self, request, view, obj):
        # obj là một instance của Schedule
        return request.user.is_authenticated and obj.sportclass.coach == request.user

class IsCommentOwner(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, comment):
        return super().has_permission(request, view) and request.user == comment.user

class IsOrderOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

class IsCoachUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'coach'

class IsSuperUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsSportClassOwnedByCoach(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        sportclass_id = request.data.get("sportclass")
        if not sportclass_id:
            return False  # sportclass ID không có trong body

        try:
            sportclass = SportClass.objects.get(id=sportclass_id)
            return sportclass.coach == request.user
        except SportClass.DoesNotExist:
            return False