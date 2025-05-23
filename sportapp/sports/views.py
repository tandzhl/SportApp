from datetime import timedelta, date, datetime

import pytz
from django.core.exceptions import ValidationError
from django.db.models import Sum, Count, Q
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from sports import perms, serializers
from sports.models import Device, User, Schedule, Discount, MemberJoinClass, Notification, NewFeed, Comment, Like, Order
from sports.serializers import DeviceSerializer, NotificationSerializer, CommentSerializer, NewFeedSerializer, \
    NewFeedDetailSerializer, ScheduleSerializer, OrderSerializer, UserSerializer
from sports.services.notification_service import NotificationService
from rest_framework import status, viewsets, generics, permissions

class DeviceViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='register')
    def register_device(self, request):
        token = request.data.get('token')
        device_type = request.data.get('device_type')
        if token and device_type == 'android':
            Device.objects.update_or_create(
                user=request.user,
                defaults={'token': token, 'device_type': device_type, 'active': True}
            )
            return Response({"status": "device registered"})
        return Response({"error": "invalid data"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='status')
    def device_status(self, request):
        devices = Device.objects.filter(user=request.user, active=True)
        serializer = DeviceSerializer(devices, many=True)
        return Response({"status": "devices retrieved", "data": serializer.data}, status=status.HTTP_200_OK)


class NotificationViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='test')
    def send_test_notification(self, request):
        response = NotificationService.send_notification(
            users=[request.user],
            title="Test Notification",
            body="This is a test notification from GymApp"
        )
        return Response({"status": "notification sent", "response": response})

    @action(detail=False, methods=['post'], url_path='schedule-reminder')
    def send_schedule_reminder(self, request):
        schedule_id = request.data.get('schedule_id')
        try:
            schedule = Schedule.objects.get(id=schedule_id)
        except Schedule.DoesNotExist:
            return Response({"error": "Schedule không tồn tại."}, status=status.HTTP_400_BAD_REQUEST)

        members = MemberJoinClass.objects.filter(sportclass=schedule.sportclass).select_related('user')
        for member in members:
            NotificationService.send_schedule_reminder(member.user, schedule)
        return Response({"status": "reminder sent"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='promotion')
    def send_promotion_notification(self, request):
        if request.user.role != 'admin' and not request.user.is_superuser:
            return Response({"error": "Only admin can send promotions"}, status=status.HTTP_403_FORBIDDEN)
        discount_id = request.data.get('discount_id')
        try:
            discount = Discount.objects.get(id=discount_id)
        except Discount.DoesNotExist:
            return Response({"error": "Discount does not exist"}, status=status.HTTP_404_NOT_FOUND)
        members = User.objects.filter(role='member')
        response = NotificationService.send_promotion_notification(members, discount)
        return Response({"status": "promotion sent", "response": response})

    @action(detail=False, methods=['post'], url_path='bulk-promotion')
    def bulk_send_promotion(self, request):
        if request.user.role != 'admin' and not request.user.is_superuser:
            return Response({"error": "Only admin can send bulk promotions"}, status=status.HTTP_403_FORBIDDEN)
        discount_ids = request.data.get('discount_ids', [])
        if not discount_ids:
            return Response({"error": "No discount ids"}, status=status.HTTP_400_BAD_REQUEST)
        members = User.objects.filter(role='member')
        for discount_id in discount_ids:
            try:
                discount = Discount.objects.get(id=discount_id)
                NotificationService.send_promotion_notification(members, discount)
            except Discount.DoesNotExist:
                continue
        return Response({"status": "bulk promotion sent"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='history')
    def notification_history(self, request):
        notifications = Notification.objects.filter(users=request.user).order_by('-created_at')[:10]
        serializer = NotificationSerializer(notifications, many=True)
        return Response({"status": "history retrieved", "data": serializer.data}, status=status.HTTP_200_OK)


class NewFeedViewSet(viewsets.ViewSet, generics.RetrieveAPIView):
    queryset = NewFeed.objects.filter(active=True)
    serializer_class = serializers.NewFeedDetailSerializer
    pagination_class = LimitOffsetPagination
    permission_classes = [IsAuthenticated]

    def list(self, request):
        feeds = NewFeed.objects.filter(active=True)
        category = request.query_params.get('category')
        if category:
            feeds = feeds.filter(category=category)
        search = request.query_params.get('search')
        if search:
            feeds = feeds.filter(Q(title__icontains=search)| Q(content__icontains=search))
        feeds = feeds.order_by('-created_at')
        data = serializers.NewFeedSerializer(feeds, many=True, context={'request': request}).data
        return Response(data)

    def retrieve(self, request, pk=None):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def create(self, request):
        s = serializers.NewFeedCreateSerializer(data=request.data, context={'request': request})
        s.is_valid(raise_exception=True)
        s.save() #bỏ created_by = request.user
        return Response(s.data, status=status.HTTP_201_CREATED)

    @action(methods=['get', 'post'], detail=True, url_path='comments')
    def get_comments(self, request, pk):
        if request.method.__eq__('POST'):
            content = request.data.get('content')
            if not content:
                return Response({"error": "Content cannot be empty"}, status=status.HTTP_400_BAD_REQUEST)
            u = serializers.CommentSerializer(data={
                'content': request.data.get('content'),
                'user': request.user.pk,
                'news': pk
            })
            u.is_valid(raise_exception=True)
            c = u.save()
            return Response(serializers.CommentSerializer(c).data, status=status.HTTP_201_CREATED)
        else:
            comments = self.get_object().comment_set.select_related('user').filter(active=True)
            page = self.paginate_queryset(comments)
            if page is not None:
                serializer = serializers.CommentSerializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            return Response(serializers.CommentSerializer(comments, many=True).data, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True, url_path='like')
    def like(self, request, pk):
        li, created = Like.objects.get_or_create(user=request.user, news_id=pk)
        li.active = not li.active
        li.save()

        return Response(serializers.NewFeedDetailSerializer(self.get_object(), context={'request': request}).data)

class CommentViewSet(viewsets.ViewSet, generics.DestroyAPIView, generics.UpdateAPIView):
    queryset = Comment.objects.filter(active=True)
    serializer_class = CommentSerializer
    permission_classes = [perms.IsCommentOwner]


class EmployeePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'employee'
from rest_framework import viewsets, permissions, generics, parsers, status
from rest_framework.decorators import action
from rest_framework.response import Response
from sports import perms, paginator

from sports.models import Category, SportClass, MemberJoinClass, User, Schedule
from sports.serializers import CategorySerializer, SportClassSerializer, ScheduleSerializer, JoinedStudentSerializer, UserSerializer, JoinedSportClassSerializer

class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Category.objects.filter(active=True)
    serializer_class = CategorySerializer

class ScheduleViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, EmployeePermission]

    def list(self, request):
        schedules = Schedule.objects.all()
        serializer = ScheduleSerializer(schedules, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=False, url_path='add')
    def add_schedule(self, request):
        serializer = ScheduleSerializer(data=request.data)
        if serializer.is_valid():
            if serializer.validated_data['datetime'] <= timezone.now().astimezone(pytz.timezone('Asia/Ho_Chi_Minh')):
                return Response({"error": "Schedule cannot be added"}, status=status.HTTP_400_BAD_REQUEST)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['put'], detail=True, url_path='update')
    def update_schedule(self, request, pk=None):
        try:
            schedule = Schedule.objects.get(pk=pk)
            current_datetime = timezone.now().astimezone(pytz.timezone('Asia/Ho_Chi_Minh'))
            if schedule.datetime <= current_datetime:
                return Response({"error": "Can't update a schedule that has already occurred"}, status=status.HTTP_400_BAD_REQUEST)
            serializer = ScheduleSerializer(schedule, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                members = MemberJoinClass.objects.filter(sportclass=schedule.sportclass).values_list('user', flat=True)
                Notification.objects.create(
                    subject="Schedule Updated",
                    message=f"Schedule for {schedule.sportclass.name} has been updated!",
                    users = members,
                )
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Schedule.DoesNotExist:
            return Response({"error": "Schedule does not exist"}, status=status.HTTP_404_NOT_FOUND)

    @action(methods=['delete'], detail=True, url_path='delete')
    def delete_schedule(self, request, pk=None):
        try:
            schedule = Schedule.objects.get(pk=pk)
            current_datetime = timezone.now().astimezone(pytz.timezone('Asia/Ho_Chi_Minh'))
            if schedule.datetime <= current_datetime:
                return Response({"error": "Can't delete a schedule that has already occurred"}, status=status.HTTP_400_BAD_REQUEST)
            members = MemberJoinClass.objects.filter(sportclass=schedule.sportclass).values_list('user', flat=True)
            Notification.objects.create(
                subject="Schedule Canceled",
                message=f"Schedule for {schedule.sportclass.name} has been canceled!",
                users = members,
            )
            schedule.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Schedule.DoesNotExist:
            return Response({"error": "Schedule does not exist"}, status=status.HTTP_404_NOT_FOUND)

class OrdersViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, EmployeePermission]

    @action(methods=['get'], detail=False)
    def list_orders(self, request):
        orders = Order.objects.filter(is_paid=False, active=True).order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AdminPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class AdminStatsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, AdminPermission]

    def _parse_date(self, date_str):
        try:
            return datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            raise ValidationError("Invalid date format. Use YYYY-MM-DD")

    def _get_time_period(self, period_type, start_date):
        if period_type == 'week':
            start = start_date - timedelta(days=start_date.weekday()) # Bắt đầu từ thứ Hai
            end= start + timedelta(days=6)
        elif period_type == 'month':
            start = start_date.replace(day=1)
            if start.month < 12:
                end= start.replace(month=start.month + 1, day=1) - timedelta(days=1)
            else:
                end=start.replace(month=12, day=31)
        elif period_type == 'year':
            start = start_date.replace(month=1, day=1)
            end = start.replace(month=12, day=31)
        else:
            raise ValidationError("Invalid period type")
        return start, end

    def list(self, request):
        date_str = request.query_params.get('date', None)
        period= request.query_params.get('period', 'week')
        # Xác định ngày bắt đầu
        if date_str:
            start_date=self._parse_date(date_str)
        else:
            start_date=timezone.now().date()
        # Tinh khoang tg
        start_date, end_date = self._get_time_period(period, start_date)
        #Thống kê số lượng hội viên
        member_count=User.objects.filter(
            role ='member',
            date_joined__range=[start_date, end_date]
        ).count()

        #Thống kê doanh thu
        revenue = Order.objects.filter(
            is_paid=True,
            created_at__range=[start_date, end_date]
        ).aggregate(total_revenue=Sum('price'))['total_revenue'] or 0.0

        # Thống kê hiệu suất
        schedule_stats = Schedule.objects.filter(
            datetime__range=[start_date, end_date]
        ).values('sportclass__name').annotate(
            scheduled = Count('id', filter=Q(active=True)),
            canceled = Count('id', filter=Q(active=False)),
        ).order_by('sportclass__name')

        performance = MemberJoinClass.objects.filter(
            joining_date__range=[start_date, end_date]
        ).values('sportclass__name').annotate(
            member_count=Count('user', distinct=True),
        ).order_by('sportclass__name')

        return Response({
            'period': period,
            'start_date': start_date,
            'end_date': end_date,
            'member_count': member_count,
            'revenue': revenue,
            'schedule_stats': [
                {
                    'class_name': item['sportclass__name'],
                    'scheduled': item['scheduled'],
                    'canceled': item['canceled']
                } for item in schedule_stats
            ] ,
            'performance': [
                {
                    'class_name': item['sportclass__name'],
                    'member_count': item['member_count'],

                } for item in performance
            ],
        })


class SportClassViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = SportClass.objects.filter(active=True)
    serializer_class = SportClassSerializer
    pagination_class = paginator.Paginator

    def get_queryset(self):
        query = self.queryset

        q = self.request.query_params.get('q')
        if q:
            query = query.filter(name__icontains=q)

        cate_id = self.request.query_params.get('category_id')
        if cate_id:
            query = query.filter(category_id=cate_id)

        return query

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

class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    # permission_classes = [perms.IsScheduleOwnedByCoach]

    @action(detail=False, methods=['get'], url_path='current-user')
    def get_current_user(self, request):
        return Response(serializers.UserSerializer(request.user).data)
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