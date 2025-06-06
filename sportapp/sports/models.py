from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.fields import TextField
from cloudinary.models import CloudinaryField
from ckeditor.fields import RichTextField


class UserRole(models.TextChoices):  # (✔ Sửa lại cho đúng chuẩn TextChoices)
    ADMIN = 'admin', 'Admin'
    MEMBER = 'member', 'Member'
    COACH = 'coach', 'Coach'
    EMPLOYEE = 'employee', 'Employee'

class Payment(models.IntegerChoices):
    Cash_payment = 1, 'Cash'
    Momo_payment = 2, 'Momo'
    Banking = 3, 'Banking'

class User(AbstractUser):
    avatar = CloudinaryField('image', null=True, blank=True)
    role = models.CharField(max_length=10, choices=UserRole.choices, default=UserRole.MEMBER)
    notification = models.ManyToManyField('Notification', blank=True)

class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Category(BaseModel):
    name = models.CharField(max_length=100, unique=True) #unique

    def __str__(self):
        return self.name

class SportClass(BaseModel):
    image = CloudinaryField(null=True);
    name = models.CharField(max_length=100)
    description = RichTextField()
    coach = models.ForeignKey(User, on_delete=models.CASCADE)
    price = models.FloatField(null=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, null=True)

    def __str__(self):
        return self.name

class Schedule(BaseModel):
    datetime = models.DateTimeField()
    sportclass = models.ForeignKey(SportClass, on_delete=models.CASCADE)
    place = models.CharField(max_length=100, null=True)

    def __str__(self):
        return self.datetime.strftime("%Y-%m-%d %H:%M")

class MemberJoinClass(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    sportclass = models.ForeignKey(SportClass, on_delete=models.CASCADE)
    joining_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('sportclass', 'user')

class Order(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    sportclass = models.ForeignKey(SportClass, on_delete=models.CASCADE)
    price = models.FloatField(default=0.0) #dam bao khong am
    is_paid = models.BooleanField(default=False)
    payment = models.IntegerField(choices=Payment, default=Payment.Cash_payment)

    class Meta:
        unique_together = ('sportclass', 'user')

class Discount(BaseModel):
    name = models.CharField(max_length=100, unique=True) #unique
    percent = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
    )
    order = models.ForeignKey(Order, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class Notification(BaseModel):
    subject = models.CharField(max_length=100)
    message = models.TextField()
    users = models.ManyToManyField(User, related_name='notifications')

class Device(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=255, unique=True)
    device_type = models.CharField(max_length=10, choices = (('ios', 'iOS'), ('android', 'Android')))
    active = models.BooleanField(default=True)

class NewsCategory(models.TextChoices):
    TRAINING_TIPS = 'training', 'Mẹo Luyện Tập'
    NUTRITION = 'nutrition', 'Chế Độ Dinh Dưỡng'
    EVENTS = 'events', 'Sự Kiện Thể Thao'

    def __str__(self):
        return self.subject

class NewFeed(BaseModel):
    title = RichTextField()
    content = models.TextField()
    category = models.CharField(max_length=20, choices=NewsCategory.choices, default=NewsCategory.TRAINING_TIPS)
    image = CloudinaryField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-id']

class Interaction(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    news = models.ForeignKey(NewFeed, on_delete=models.CASCADE)

    class Meta:
        abstract = True


class Comment(Interaction):
    content = models.CharField(max_length=255)

    def __str__(self):
        return self.content


class Like(Interaction):
    class Meta:
        unique_together = ('news', 'user')
