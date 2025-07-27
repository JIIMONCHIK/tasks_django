from django.shortcuts import render, redirect, HttpResponse, get_object_or_404
from .models import *
from .forms import TaskForm, UserRegistrationForm, UserLoginForm
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.db.models import Case, When, Value, BooleanField, Q
import json
from datetime import datetime


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
def create_category(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        color_code = request.POST.get('color_code', '#ffffff')

        if not name:
            return JsonResponse({
                'success': False,
                'error': 'Название категории обязательно'
            })

        # Проверяем, что категория с таким именем у пользователя не существует
        if Categories.objects.filter(user=request.user, name=name).exists():
            return JsonResponse({
                'success': False,
                'error': 'Категория с таким именем уже существует'
            })

        # Создаем новую категорию
        category = Categories.objects.create(
            user=request.user,
            name=name,
            color_code=color_code
        )

        return JsonResponse({
            'success': True,
            'id': category.id,
            'name': category.name,
            'color_code': category.color_code
        })

    return JsonResponse({'success': False, 'error': 'Неверный запрос'})


@login_required
def get_category(request, category_id):
    category = get_object_or_404(Categories, id=category_id, user=request.user)
    return JsonResponse({
        'name': category.name,
        'color_code': category.color_code
    })


@login_required(login_url='login')
def update_category(request):
    if request.method == 'POST':
        try:
            category_id = request.POST.get('category_id')
            name = request.POST.get('name')
            color_code = request.POST.get('color_code')

            if not name:
                return JsonResponse({'success': False, 'error': 'Название обязательно'})

            category = get_object_or_404(Categories, id=category_id, user=request.user)

            # Проверяем уникальность имени (кроме текущей категории)
            if Categories.objects.filter(user=request.user, name=name).exclude(id=category_id).exists():
                return JsonResponse({'success': False, 'error': 'Категория с таким именем уже существует'})

            category.name = name
            category.color_code = color_code
            category.save()

            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False})


@login_required
def delete_category(request, category_id):
    if request.method == 'DELETE':
        category = get_object_or_404(Categories, id=category_id, user=request.user)

        # Переносим задачи в "Без категории"
        Tasks.objects.filter(category=category).update(category=None)

        category.delete()
        return JsonResponse({'success': True})
    return JsonResponse({'success': False})


@login_required(login_url='login')
def create(request):
    error = ''
    if request.method == 'POST':
        form = TaskForm(request.POST, user=request.user)
        if form.is_valid():
            task = form.save(commit=False)
            task.user = request.user
            task.save()
            return redirect('tasks')
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
def tasks_view(request):
    # Получаем параметр сортировки
    sort_by = request.GET.get('sort', 'due_date')

    # Получаем задачи текущего пользователя
    tasks = Tasks.objects.filter(user=request.user)

    # Применяем фильтрацию если есть соответствующие параметры
    # Фильтр по категориям
    if 'category' in request.GET:
        category_ids = [int(cid) for cid in request.GET['category'].split(',') if cid]
        if 'category' in request.GET:
            valid_ids = Categories.objects.filter(
                id__in=category_ids,
                user=request.user
            ).values_list('id', flat=True)

            tasks = tasks.filter(
                Q(category_id__in=valid_ids) |
                Q(category__isnull=True) & Q(category_id__in=category_ids)
            )

    # Фильтр по приоритетам
    if 'priority' in request.GET:
        priority_ids = [int(pid) for pid in request.GET['priority'].split(',') if pid]
        tasks = tasks.filter(priority_id__in=priority_ids)

    # Фильтр по статусам
    if 'status' in request.GET:
        status_ids = [int(sid) for sid in request.GET['status'].split(',') if sid]
        tasks = tasks.filter(status_id__in=status_ids)

    # Применяем сортировку
    if sort_by == 'due_date':
        tasks = tasks.order_by('due_date')  # Сначала ближайшие сроки
    elif sort_by == 'created':
        tasks = tasks.order_by('-start_date')  # Последние созданные
    elif sort_by == 'status':
        # Сначала незавершенные, потом завершенные
        tasks = tasks.annotate(
            completed_flag=Case(
                When(status__is_completed=True, then=Value(1)),
                default=Value(0),
                output_field=BooleanField()
            )
        ).order_by('completed_flag', '-start_date')
    elif sort_by == 'priority':
        tasks = tasks.order_by('-priority__weight')  # По важности приоритета
    elif sort_by == 'category':
        tasks = tasks.order_by('category__name')

    # Получаем все сущности для фильтров
    categories = Categories.objects.filter(user=request.user)
    priorities = Priorities.objects.all()
    statuses = Statuses.objects.all()
    has_tasks = Tasks.objects.filter(user=request.user).exists()

    context = {
        'title': 'Мои задачи',
        'tasks': tasks,
        'categories': categories,
        'sort_by': sort_by,
        'statuses': statuses,
        'priorities': priorities,
        'has_tasks': has_tasks
    }
    return render(request, 'main/tasks.html', context)


@login_required
def get_task(request, task_id):
    task = get_object_or_404(Tasks, id=task_id, user=request.user)

    return JsonResponse({
        'title': task.title,
        'description': task.description,
        'due_date': task.due_date.strftime('%Y-%m-%d') if task.due_date else None,
        'category_id': task.category.id if task.category else None,
        'priority_id': task.priority.id if task.priority else None,
        'status_id': task.status.id if task.status else None
    })


@login_required(login_url='login')
def update_task(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            task_id = data.get('task_id')
            task = get_object_or_404(Tasks, id=task_id, user=request.user)

            # Обновляем поля
            task.title = data.get('title', task.title)
            task.description = data.get('description', task.description)

            due_date = data.get('due_date')
            task.due_date = due_date if due_date else None

            category_id = data.get('category')
            task.category = Categories.objects.get(id=category_id) if category_id else None

            priority_id = data.get('priority')
            if priority_id:
                task.priority = Priorities.objects.get(id=priority_id)

            status_id = data.get('status')
            if status_id:
                task.status = Statuses.objects.get(id=status_id)

            task.save()

            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False})


@login_required(login_url='login')
def delete_task(request, task_id):
    if request.method == 'DELETE':
        task = get_object_or_404(Tasks, id=task_id, user=request.user)
        task.delete()
        return JsonResponse({'success': True})
    return JsonResponse({'success': False})


@login_required(login_url='login')
def categories_view(request):
    categories = Categories.objects.filter(user=request.user)

    context = {
        'title': 'Мои категории',
        'categories': categories
    }
    return render(request, 'main/categories.html', context)


@login_required(login_url='login')
def search_autocomplete(request):
    query = request.GET.get('q', '').strip()
    results = []

    if query:
        # Поиск задач
        tasks = Tasks.objects.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query),
            user=request.user
        )[:5]

        for task in tasks:
            results.append({
                'type': 'task',
                'id': task.id,
                'title': task.title,
                'description': task.description[:100] + '...' if task.description else '',
                'url': f"/tasks?highlight={task.id}#task-{task.id}",
                'category_name': task.category.name if task.category else None,
                'category_color': task.category.color_code if task.category else "#cccccc",
                'due_date': task.due_date.strftime("%d.%m.%Y") if task.due_date else None
            })

        # Поиск категорий
        categories = Categories.objects.filter(
            Q(name__icontains=query),
            user=request.user
        )[:5]

        for category in categories:
            results.append({
                'type': 'category',
                'id': category.id,
                'title': category.name,
                'url': f"/categories?highlight={category.id}#category-{category.id}",
                'color_code': category.color_code,
                'tasks_count': category.tasks_count
            })

    return JsonResponse({'results': results})


@login_required(login_url='login')
def calendar_view(request):
    return render(request, 'main/calendar.html')


@login_required(login_url='login')
def calendar_events(request):
    # Получаем задачи пользователя только с due_date
    tasks = Tasks.objects.filter(
        user=request.user,
        due_date__isnull=False
    ).select_related('category')

    events = []
    for task in tasks:
        # Добавляем только события по дате дедлайна
        events.append({
            'id': task.id,
            'title': task.title,
            'start': task.due_date.isoformat(),
            'extendedProps': {
                'category_color': task.category.color_code if task.category else None,
                'category_name': task.category.name if task.category else None
            }
        })

    return JsonResponse(events, safe=False)


@login_required(login_url='login')
def day_tasks(request):
    date_str = request.GET.get('date')
    if not date_str:
        return JsonResponse([], safe=False)

    try:
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return JsonResponse([], safe=False)

    tasks = Tasks.objects.filter(
        user=request.user,
        due_date=date
    ).select_related('category')

    tasks_data = []
    for task in tasks:
        tasks_data.append({
            'id': task.id,
            'title': task.title,
            'category_name': task.category.name if task.category else None,
            'category_color': task.category.color_code if task.category else None
        })

    return JsonResponse(tasks_data, safe=False)


def favicon_view(request):
    icon = open('main/static/main/images/favicon.ico', 'rb').read()
    return HttpResponse(icon, content_type="image/x-icon")