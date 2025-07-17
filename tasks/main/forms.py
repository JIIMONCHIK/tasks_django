from .models import Tasks
from django.forms import ModelForm, TextInput, Textarea, SelectDateWidget


class TaskForm(ModelForm):
    class Meta:
        model = Tasks
        fields = ["title", "description", "due_date", "priority", "status", "category"]
        widgets = {
            "title": TextInput(attrs={
                "class": "asdf",
                "placeholder": "Название"
            }),
            "description": Textarea(attrs={
                "class": "asdf",
                "placeholder": "Описание"
            }),
            "due_date": SelectDateWidget(attrs={
                "class": "asdf",
                "placeholder": "Сроки"
            }),
        }