from rest_framework import viewsets, permissions, generics, parsers, status
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from sports import perms

from sports.models import Category, SportClass, MemberJoinClass, User, Schedule
from sports.serializers import CategorySerializer, SportClassSerializer, ScheduleSerializer, JoinedStudentSerializer, UserSerializer, JoinedSportClassSerializer

class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Category.objects.filter(active=True)
    serializer_class = CategorySerializer

class SportClassViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = SportClass.objects.filter(active=True)
    serializer_class = SportClassSerializer

    @action(methods=['get'], url_path='schedules' ,detail=True, permission_classes=[permissions.AllowAny])
    def get_schedules(self, request, pk):
        schedules = self.get_object().schedule_set.filter(active=True)

        return Response(ScheduleSerializer(schedules, many=True).data)

    @action(methods=['get'], url_path='coach', detail=True)
    def get_coach(self, request, pk):
        coach = self.get_object().coach

        return Response(UserSerializer(coach).data)

    @action(methods=['get'], url_path='students', detail=True, permission_classes=[perms.IsSportClassOwner])
    def get_students(self, request, pk):
        sport_class = self.get_object()
        joined_students = MemberJoinClass.objects.filter(sportclass=sport_class)

        return Response(JoinedStudentSerializer(joined_students, many=True).data)

class JoinedSportClassViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = MemberJoinClass.objects.filter(active=True)
    serializer_class = JoinedSportClassSerializer
    permission_classes = [permissions.IsAuthenticated]

class ScheduleViewSet(viewsets.ViewSet, generics.UpdateAPIView, generics.DestroyAPIView):
    queryset = Schedule.objects.filter(active=True)
    serializer_class = ScheduleSerializer
    permission_classes = [perms.IsScheduleOwnedByCoach]

class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    parser_classes = [parsers.MultiPartParser]

    @action(methods=['get', 'patch'], url_path="current-user", detail=False,
            permission_classes=[permissions.IsAuthenticated])
    def get_current_user(self, request):
        if request.method.__eq__("PATCH"):
            u = request.user

            for key in request.data:
                if key in ['first_name', 'last_name']:
                    setattr(u, key, request.data[key])
                elif key.__eq__('password'):
                    u.set_password(request.data[key])

            u.save()
            return Response(UserSerializer(u).data)
        else:
            return Response(UserSerializer(request.user).data)