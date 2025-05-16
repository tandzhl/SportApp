from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

r = DefaultRouter()
r.register('categories', views.CategoryViewSet)
r.register('sportclasses', views.SportClassViewSet)
r.register('users', views.UserViewSet)
r.register('schedules', views.ScheduleViewSet)
r.register('joined-sportclass', views.JoinedSportClassViewSet)
urlpatterns = [
    path    ('', include(r.urls)),
]
