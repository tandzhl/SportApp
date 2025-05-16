from rest_framework.serializers import ModelSerializer, SerializerMethodField
from sports.models import Category, SportClass, Schedule, User, MemberJoinClass, User

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
        fields = ['username', 'password', 'email', 'first_name', 'last_name', 'role']
        extra_kwargs = {'password': {'write_only': True}}

class JoinedStudentSerializer(ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = MemberJoinClass
        fields = ['user', 'joining_date']

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
        return data

    class Meta:
        model = SportClass
        fields = ['id', 'name', 'decription', 'coach', 'image']

class ScheduleSerializer(ModelSerializer):
    sportclass = SportClassSerializer()

    class Meta:
        model = Schedule
        fields = ['id', 'datetime', 'sportclass']

