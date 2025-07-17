from django.contrib import admin
from .models import *


admin.site.register(Categories)
admin.site.register(Priorities)
admin.site.register(Statuses)
admin.site.register(Tags)
admin.site.register(TaskTags)
admin.site.register(Tasks)
admin.site.register(Users)