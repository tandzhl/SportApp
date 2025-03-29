from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.fields import TextField


class UserRole(models.Choices):
    Admin = 'admin'
    Member = 'member'
    Employee = 'employee'

class Payment(models.IntegerChoices):
    Cash_payment = 1, 'Cash'
    Momo_payment = 2, 'Momo'
    Banking = 3, 'Banking'

class User(AbstractUser):
    role = models.CharField(max_length=10,choices=UserRole,default=UserRole.Member)
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
    name = models.CharField(max_length=100)
    decription = models.TextField()
    coach = models.ForeignKey(User, on_delete=models.CASCADE)


class Schedule(BaseModel):
    datetime = models.DateTimeField()
    sportclass = models.ForeignKey(SportClass, on_delete=models.CASCADE)

class MemberJoinClass(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    sportclass = models.ForeignKey(SportClass, on_delete=models.CASCADE)
    joining_date = models.DateTimeField(auto_now_add=True)

class Order(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    sportclass = models.ForeignKey(SportClass, on_delete=models.CASCADE)
    price = models.FloatField()
    is_paid = models.BooleanField(default=False)
    payment = models.IntegerField(choices=Payment, default=Payment.Cash_payment)

class Discount(BaseModel):
    name = models.CharField(max_length=100)
    percent = models.FloatField()
    order = models.ForeignKey(Order, on_delete=models.CASCADE)

class Notification(BaseModel):
    subject = models.CharField(max_length=100)
    message = models.TextField()

class NewFeed(BaseModel):
    news = TextField()

class Coach(User):
    category = models.ForeignKey(Category, on_delete=models.CASCADE)