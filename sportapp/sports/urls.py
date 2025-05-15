from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import DefaultRouter
from .views import (
    DeviceViewSet, NotificationViewSet, NewFeedViewSet, CommentViewSet,
    ScheduleViewSet, OrdersViewSet, AdminStatsViewSet
)

router = DefaultRouter()
router.register('newfeed', NewFeedViewSet, basename='newfeed')
router.register('comments', CommentViewSet, basename='comments')
router.register('schedules', ScheduleViewSet, basename='schedules')
router.register('devices', DeviceViewSet, basename='devices')
router.register('notifications', NotificationViewSet, basename='notifications')
router.register('orders', OrdersViewSet, basename='orders')
router.register('admin_stats', AdminStatsViewSet, basename='admin_stats')

auth_patterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

urlpatterns = [
    path('auth/', include(auth_patterns)),
    path('', include(router.urls)),
]