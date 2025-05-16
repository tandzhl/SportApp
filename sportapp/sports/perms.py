from rest_framework import permissions


class IsSportClassOwner(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, sportclass):
        return super().has_permission(request, view) and request.user == sportclass.coach

class IsScheduleOwnedByCoach(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # obj là Schedule
        return request.user.is_authenticated and obj.sportclass.coach == request.user

    def has_permission(self, request, view):
        # Cho phép tạo mới, ta sẽ kiểm tra trong perform_create()
        return request.user.is_authenticated
