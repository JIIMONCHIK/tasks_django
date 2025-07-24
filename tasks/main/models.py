import datetime

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UsersManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username, email, password, **extra_fields)


class Users(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(unique=True, max_length=50)
    email = models.CharField(unique=True, max_length=100)
    password = models.TextField(null=False)
    created_at = models.DateTimeField(blank=True, null=True, default=datetime.datetime.now())
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    objects = UsersManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

    class Meta:
        db_table = 'users'


class Categories(models.Model):
    user = models.ForeignKey(Users, models.DO_NOTHING, blank=True, null=True)
    name = models.CharField(max_length=50)
    color_code = models.CharField(max_length=7, blank=True, null=True)

    def __str__(self):
        return self.name

    @property
    def tasks_count(self):
        return self.tasks_set.count()

    class Meta:
        db_table = 'categories'
        unique_together = (('user', 'name'),)


class Priorities(models.Model):
    name = models.CharField(unique=True, max_length=20)
    weight = models.IntegerField(unique=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'priorities'


class Statuses(models.Model):
    name = models.CharField(unique=True, max_length=20)
    is_completed = models.BooleanField(blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'statuses'


class Tasks(models.Model):
    user = models.ForeignKey(Users, models.DO_NOTHING)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    due_date = models.DateField(blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    priority = models.ForeignKey(Priorities, models.DO_NOTHING, blank=True, null=True)
    status = models.ForeignKey(Statuses, models.DO_NOTHING, blank=True, null=True)
    category = models.ForeignKey(Categories, models.DO_NOTHING, blank=True, null=True)

    def __str__(self):
        return self.title

    @property
    def is_completed(self):
        return self.status.is_completed if self.status else False

    class Meta:
        db_table = 'tasks'
