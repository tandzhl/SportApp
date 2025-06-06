from rest_framework import serializers
from rest_framework.serializers import ModelSerializer, SerializerMethodField
from sports.models import *


class UserSerializer(ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['avatar'] = instance.avatar.url if instance.avatar else ''
        return data

    def create(self, validated_data):
        data = validated_data.copy()
        u = User(**data)
        u.set_password(u.password)
        u.save()

        return u

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'first_name', 'last_name', 'role', 'avatar']
        extra_kwargs = {'password': {'write_only': True}}


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['subject', 'message', 'created_at']

class JoinedStudentSerializer(ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = MemberJoinClass
        fields = ['user', 'joining_date']


class DeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Device
        fields = ['token', 'device_type', 'active']

class JoinedSportClassSerializer(ModelSerializer):
    class Meta:
        model = MemberJoinClass
        fields = ['user', 'joining_date', 'sportclass']

class CategorySerializer(ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class SportClassSerializer(ModelSerializer):
    coach = UserSerializer()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['image'] = instance.image.url if instance.image else ''
        data['coach'] = UserSerializer(instance.coach).data
        return data
    class Meta:
        model = SportClass
        fields = ['id', 'name', 'created_at' ,'description', 'coach', 'image', 'category_id', 'price']


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
        fields = ['id', 'title', 'created_by', 'created_at', 'image', 'category']


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
        return NewFeed.objects.create(created_by=user, **validated_data)


class ScheduleSerializer(ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['sportclass'] = SportClassSerializer(instance.sportclass).data
        return data

    class Meta:
        model = Schedule
        fields = ['id', 'datetime', 'sportclass', 'place']

class OrderSerializer(ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['user'] = UserSerializer(instance.user).data
        data['sportclass'] = SportClassSerializer(instance.sportclass).data
        return data

    class Meta:
        model = Order
        fields = ['id', 'user', 'sportclass', 'is_paid', 'payment', 'price']