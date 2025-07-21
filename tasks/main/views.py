from django.shortcuts import render, redirect, HttpResponse
from .models import *
from .forms import TaskForm, UserRegistrationForm, UserLoginForm
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required


def register_view(request):
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('index')
    else:
        form = UserRegistrationForm()

    return render(request, 'main/register.html', {'form': form})


def login_view(request):
    if request.method == 'POST':
        # Используем email как username
        email = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, email=email, password=password)

        if user is not None:
            login(request, user)
            return redirect('index')
        else:
            form = UserLoginForm()
            error = "Invalid email or password"
            return render(request, 'main/login.html', {'form': form, 'error': error})

    form = UserLoginForm()
    return render(request, 'main/login.html', {'form': form})


def logout_view(request):
    logout(request)
    return redirect('index')


@login_required
def create(request):
    error = ''
    if request.method == 'POST':
        form = TaskForm(request.POST, user=request.user)
        if form.is_valid():
            task = form.save(commit=False)
            task.user = request.user  # Теперь request.user - это ваша модель Users
            task.save()
            return redirect('index')
        else:
            error = 'Ошибка в форме'
    else:
        form = TaskForm(user=request.user)

    context = {
        'title': 'Создать задачу',
        'form': form,
        'error': error
    }
    return render(request, 'main/create.html', context)


def index(request):
    priorities = Priorities.objects.order_by('-id')[:3]
    context = {
        'title': 'Main page',
        'priorities': priorities
    }
    return render(request, 'main/index.html', context)


@login_required
def home(request):
    return render(request, 'main/home.html')


@login_required
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