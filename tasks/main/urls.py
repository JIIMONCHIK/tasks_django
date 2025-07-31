"""
URL configuration for tasks project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('tasks', views.tasks_view, name='tasks'),
    path('categories', views.categories_view, name='categories'),
    path('create', views.create, name='create'),
    path('login', views.login_view, name='login'),
    path('logout', views.logout_view, name='logout'),
    path('register', views.register_view, name='register'),
    path('create-category', views.create_category, name='create_category'),
    path('get-task/<int:task_id>/', views.get_task, name='get_task'),
    path('update-task/', views.update_task, name='update_task'),
    path('delete-task/<int:task_id>/', views.delete_task, name='delete_task'),
    path('get-category/<int:category_id>/', views.get_category, name='get_category'),
    path('update-category/', views.update_category, name='update_category'),
    path('delete-category/<int:category_id>/', views.delete_category, name='delete_category'),
    path('search/autocomplete/', views.search_autocomplete, name='search_autocomplete'),
    path('calendar', views.calendar_view, name='calendar'),
    path('calendar/events/', views.calendar_events, name='calendar_events'),
    path('calendar/day-tasks/', views.day_tasks, name='day_tasks'),
    path('profile/', views.profile_view, name='profile'),
    path('favicon.ico', views.favicon_view),
]
