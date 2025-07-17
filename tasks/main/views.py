from django.shortcuts import render, redirect
from .models import *
from .forms import TaskForm


def index(request):
    priorities = Priorities.objects.order_by('-id')[:3]
    return render(request, 'main/index.html', {'title': 'Main page', 'priorities': priorities})


def home(request):
    return render(request, 'main/home.html')


def create(request):
    error = ''
    if request.method == 'POST':
        form = TaskForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('index')
        else:
            error = 'Invalidasdfasdfasdf form'

    form = TaskForm()
    context = {
        'form': form,
        'error': error
    }
    return render(request, 'main/create.html', context)