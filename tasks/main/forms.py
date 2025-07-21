from .models import Tasks, Priorities, Statuses, Categories, Users
from django import forms as f
from django.contrib.auth.forms import AuthenticationForm


class UserRegistrationForm(f.ModelForm):
    password = f.CharField(widget=f.PasswordInput)
    password_confirm = f.CharField(widget=f.PasswordInput, label='Confirm Password')

    class Meta:
        model = Users
        fields = ['username', 'email', 'password']

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        password_confirm = cleaned_data.get("password_confirm")

        if password and password_confirm and password != password_confirm:
            self.add_error('password_confirm', "Passwords do not match")

        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password"])
        if commit:
            user.save()
        return user


class UserLoginForm(AuthenticationForm):
    username = f.CharField(label='Email')  # Используем email для входа

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['password'].widget = f.PasswordInput()


class TaskForm(f.ModelForm):
    class Meta:
        model = Tasks
        fields = ["title", "description", "start_date", "due_date", "priority", "status", "category"]
        widgets = {
            "title": f.TextInput(attrs={
                "class": "form-control",
                "placeholder": "Название задачи"
            }),
            "description": f.Textarea(attrs={
                "class": "form-control",
                "placeholder": "Подробное описание задачи",
                "rows": 4
            }),
            "start_date": f.SelectDateWidget(attrs={
                "class": "form-control date-field",
                "placeholder": "Дата начала"
            }),
            "due_date": f.SelectDateWidget(attrs={
                "class": "form-control date-field",
                "placeholder": "Срок выполнения"
            }),
            "priority": f.Select(attrs={
                "class": "form-control"
            }),
            "status": f.Select(attrs={
                "class": "form-control"
            }),
            "category": f.Select(attrs={
                "class": "form-control"
            }),
        }

    # Добавляем пустые лейблы для выпадающих списков
    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super(TaskForm, self).__init__(*args, **kwargs)

        # Фильтрация по текущему пользователю
        if user:
            self.fields['priority'].queryset = Priorities.objects.all()
            self.fields['status'].queryset = Statuses.objects.all()
            self.fields['category'].queryset = Categories.objects.filter(user=user)

        # Пустые лейблы
        self.fields['priority'].empty_label = "Выберите приоритет"
        self.fields['status'].empty_label = "Выберите статус"
        self.fields['category'].empty_label = "Выберите категорию"
        self.fields['description'].required = False
        self.fields['start_date'].empty_label = ("День", "Месяц", "Год")
        self.fields['due_date'].empty_label = ("День", "Месяц", "Год")

        for field in self.fields:
            if self.errors.get(field):
                self.fields[field].widget.attrs['class'] += 'error-field'
