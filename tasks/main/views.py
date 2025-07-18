from django.shortcuts import render, redirect, HttpResponse
from .models import *
from .forms import TaskForm


def index(request):
    priorities = Priorities.objects.order_by('-id')[:3]
    context = {
        'title': 'Main page',
        'priorities': priorities
    }
    return render(request, 'main/index.html', context)


def home(request):
    return render(request, 'main/home.html')


def create(request):
    error = ''
    if request.method == 'POST':
        form = TaskForm(request.POST)
        if form.is_valid():
            task = form.save(commit=False)
            task.user = request.user
            task.save()
            return redirect('index')
        else:
            error = 'Invalidasdfasdfasdf form'

    form = TaskForm()
    context = {
        'title': 'Создать задачу',
        'form': form,
        'error': error
    }
    return render(request, 'main/create.html', context)


def favicon_view(request):
    icon = open('main/static/main/images/favicon.ico', 'rb').read()
    return HttpResponse(icon, content_type="image/x-icon")