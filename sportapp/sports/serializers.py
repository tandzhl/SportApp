from rest_framework import serializers

from .models import Notification, Schedule, NewFeed, Device, Comment, Like, User, Order


class UserSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        return data

    class Meta:
        model = User
        fields = ['username', 'password', 'first_name', 'last_name']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

    def create(self, validated_data):
        data = validated_data.copy()
        u = User(**data)
        u.set_password(u.password)
        u.save()
        return u


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['subject', 'message', 'created_at']

class DeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Device
        fields = ['token', 'device_type', 'active']

class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['user'] = UserSerializer(instance.user).data
        return data

    class Meta:
        model = Comment
        fields = ['id', 'user', 'content', 'created_at', 'news']
        extra_kwargs = {
            'news': {
                'write_only': True
            }
        }

class NewFeedSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['image'] = instance.image.url if instance.image else ''
        return data

    class Meta:
        model = NewFeed
        fields = ['id', 'title', 'created_by', 'created_at', 'image']

class NewFeedDetailSerializer(NewFeedSerializer):
    liked = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()

    def get_liked(self, news):
        request = self.context.get('request')
        if request.user.is_authenticated:
            return news.like_set.filter(user=request.user, active=True).exists()

    def get_like_count(self, news):
        return news.like_set.filter(active=True).count()

    class Meta:
        model = NewFeedSerializer.Meta.model
        fields = NewFeedSerializer.Meta.fields + ['content', 'liked', 'like_count']

class NewFeedCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewFeed
        fields = ['title', 'content', 'image']

    def create(self, validated_data):
        user = self.context['request'].user
        return NewFeed.objects.create(created_by = user, **validated_data)
