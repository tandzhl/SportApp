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
    avatar = models.ImageField(upload_to='user/%Y/%m', blank=True, null=True)
    role = models.CharField(max_length=10, choices=UserRole.choices, default=UserRole.MEMBER)
    notification = models.ManyToManyField('Notification', blank=True)

class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Category(BaseModel):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class SportClass(BaseModel):
    image = models.ImageField(upload_to='sportclass/%Y/%m', blank=True, null=True)
    name = models.CharField(max_length=100)
    decription = RichTextField()
    coach = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class Schedule(BaseModel):
    datetime = models.DateTimeField()
    sportclass = models.ForeignKey(SportClass, on_delete=models.CASCADE)

    def __str__(self):
        return self.datetime.strftime("%Y-%m-%d %H:%M")

class MemberJoinClass(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    sportclass = models.ForeignKey(SportClass, on_delete=models.CASCADE)
    joining_date = models.DateTimeField(auto_now_add=True)

class Order(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    sportclass = models.ForeignKey(SportClass, on_delete=models.CASCADE)
    price = models.FloatField()
    is_paid = models.BooleanField(default=False)
    payment = models.IntegerField(choices=Payment.choices, default=Payment.Cash_payment)

class Discount(BaseModel):
    name = models.CharField(max_length=100)
    percent = models.FloatField()
    order = models.ForeignKey(Order, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class Notification(BaseModel):
    subject = models.CharField(max_length=100)
    message = models.TextField()

    def __str__(self):
        return self.subject

class NewFeed(BaseModel):
    news = TextField()

    def __str__(self):
        return self.news

class Coach_Category(BaseModel):
    coach = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
