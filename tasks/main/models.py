from django.db import models


class Categories(models.Model):
    user = models.ForeignKey('Users', models.DO_NOTHING, blank=True, null=True)
    name = models.CharField(max_length=50)
    color_code = models.CharField(max_length=7, blank=True, null=True)

    def __str__(self):
        return self.name

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
    user = models.ForeignKey('Users', models.DO_NOTHING)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    due_date = models.DateTimeField(blank=True, null=True)
    start_date = models.DateTimeField(blank=True, null=True)
    priority = models.ForeignKey(Priorities, models.DO_NOTHING, blank=True, null=True)
    status = models.ForeignKey(Statuses, models.DO_NOTHING, blank=True, null=True)
    category = models.ForeignKey(Categories, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        db_table = 'tasks'


class Users(models.Model):
    username = models.CharField(unique=True, max_length=50)
    email = models.CharField(unique=True, max_length=100)
    password_hash = models.TextField()
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'users'
