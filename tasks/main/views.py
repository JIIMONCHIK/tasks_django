from django.shortcuts import render, redirect, HttpResponse
from .models import *
from .forms import TaskForm, UserRegistrationForm, UserLoginForm
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required


def register_view(request):
    next_url = request.GET.get('next', 'index')
    error = None
    field_errors = {}

    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect(next_url)
        else:
            error = "Пожалуйста, исправьте ошибки в форме"
            field_errors = {
                'username': form.errors.get('username', []),
                'email': form.errors.get('email', []),
                'password': form.errors.get('password', []),
                'password_confirm': form.errors.get('password_confirm', []),
            }
    else:
        form = UserRegistrationForm()

    return render(request, 'main/register.html', {
        'form': form,
        'next': next_url,
        'title': 'Регистрация',
        'error': error,
        'field_errors': field_errors
    })


def login_view(request):
    next_url = request.GET.get('next', 'index')
    error = None
    field_errors = {'username': [], 'password': []}
    email_value = ''

    if request.method == 'POST':
        form = UserLoginForm(request, data=request.POST)
        if form.is_valid():
            email = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(request, email=email, password=password)

            if user is not None:
                login(request, user)
                return redirect(next_url)
            else:
                error = "Неверный email или пароль"
        else:
            # Собираем ошибки валидации формы
            error = "Неверный email или пароль"
            field_errors = {
                'username': form.errors.get('username', []),
                'password': form.errors.get('password', []),
            }
            # Сохраняем введенный email для повторного отображения
            email_value = request.POST.get('username', '')
    else:
        form = UserLoginForm()

    return render(request, 'main/login.html', {
        'next': next_url,
        'error': error,
        'title': 'Вход',
        'field_errors': field_errors,
        'email_value': email_value
    })


def logout_view(request):
    logout(request)
    return redirect('index')


@login_required(login_url='login')
def create(request):
    error = ''
    if request.method == 'POST':
        form = TaskForm(request.POST, user=request.user)
        if form.is_valid():
            task = form.save(commit=False)
            task.user = request.user
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
        'title': 'Главная',
        'priorities': priorities
    }
    return render(request, 'main/index.html', context)


@login_required(login_url='login')
def home(request):
    return render(request, 'main/home.html')


def favicon_view(request):
    icon = open('main/static/main/images/favicon.ico', 'rb').read()
    return HttpResponse(icon, content_type="image/x-icon")