from .models import Tasks, Priorities, Statuses, Categories
from django.forms import ModelForm, TextInput, Textarea, SelectDateWidget, Select


class TaskForm(ModelForm):
    class Meta:
        model = Tasks
        fields = ["title", "description", "start_date", "due_date", "priority", "status", "category"]
        widgets = {
            "title": TextInput(attrs={
                "class": "form-control",
                "placeholder": "Название задачи"
            }),
            "description": Textarea(attrs={
                "class": "form-control",
                "placeholder": "Подробное описание задачи",
                "rows": 4
            }),
            "start_date": SelectDateWidget(attrs={
                "class": "form-control date-field",
                "placeholder": "Дата начала"
            }),
            "due_date": SelectDateWidget(attrs={
                "class": "form-control date-field",
                "placeholder": "Срок выполнения"
            }),
            "priority": Select(attrs={
                "class": "form-control"
            }),
            "status": Select(attrs={
                "class": "form-control"
            }),
            "category": Select(attrs={
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
