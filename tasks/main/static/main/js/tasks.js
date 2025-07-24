document.addEventListener('DOMContentLoaded', function() {
    // Элементы управления
    const sortSelect = document.getElementById('sort-select');
    const filterBtn = document.getElementById('filter-btn');
    const filterDropdown = document.getElementById('filter-dropdown');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const resetFiltersBtn = document.getElementById('reset-filters');

    // Модальное окно
    const modal = document.getElementById('task-modal');
    const closeBtn = document.querySelector('.close');
    const taskForm = document.getElementById('task-edit-form');
    const deleteBtn = document.getElementById('delete-task');

    const btnAddCategory = document.getElementById('btn-add-category');
    const btnClosePanel = document.getElementById('btn-close-panel');
    const categoryPanel = document.getElementById('category-panel');
    const categoryForm = document.getElementById('category-form');
    const categorySelect = document.getElementById('task-category');
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    const colorPicker = document.querySelector('.color-picker');
    const colorPreview = document.getElementById('color-preview');

    if (colorPicker && colorPreview) {
        colorPreview.style.backgroundColor = colorPicker.value;

        colorPicker.addEventListener('input', function() {
            colorPreview.style.backgroundColor = this.value;

            // Анимация изменения
            colorPreview.style.transform = 'scale(1.2)';
            setTimeout(() => {
                colorPreview.style.transform = 'scale(1)';
            }, 200);
        });
    }

    // Открытие панели создания категории
    if (btnAddCategory) {
        btnAddCategory.addEventListener('click', function() {
            // Сбрасываем предыдущие анимации
            categoryPanel.classList.remove('slide-out');
            categoryPanel.classList.remove('active');

            // Добавляем оверлей
            overlay.style.display = 'block';

            // Запускаем анимацию
            setTimeout(() => {
                categoryPanel.classList.add('active');
                categoryPanel.classList.add('slide-in');
            }, 10);
        });
    }

    // Закрытие панели создания категории
    function closeCategoryPanel() {
        // Запускаем анимацию закрытия
        categoryPanel.classList.remove('slide-in');
        categoryPanel.classList.add('slide-out');

        // Убираем оверлей
        overlay.style.display = 'none';

        // После завершения анимации убираем классы
        setTimeout(() => {
            categoryPanel.classList.remove('active');
            categoryPanel.classList.remove('slide-out');
        }, 400);
    }

    // Закрытие по кнопке
    if (btnClosePanel) {
        btnClosePanel.addEventListener('click', closeCategoryPanel);
    }

    // Закрытие по клику на оверлей
    overlay.addEventListener('click', closeCategoryPanel);

    // Закрытие по клавише Esc
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && categoryPanel.classList.contains('active')) {
            closeCategoryPanel();
        }
    });

    // Обработка отправки формы создания категории
    if (categoryForm) {
        categoryForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(categoryForm);
            const nameError = document.getElementById('name-error');
            nameError.textContent = '';

            fetch('create-category', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Добавляем новую категорию в выпадающий список
                    const option = document.createElement('option');
                    option.value = data.id;
                    option.textContent = data.name;
                    option.selected = true;
                    categorySelect.appendChild(option);

                    // Сбрасываем форму
                    categoryForm.reset();
                    closeCategoryPanel()
                } else {
                    // Показываем ошибку
                    if (data.error) {
                        nameError.textContent = data.error;
                        nameError.parentElement.classList.add('error-animation');
                        setTimeout(() => {
                            nameError.parentElement.classList.remove('error-animation');
                        }, 500);
                    } else {
                        showNotification('Ошибка при создании категории', 'error');
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Произошла ошибка', 'error');
            });
        });
    }

    // Функция для получения CSRF-токена
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function showNotification(message, type) {
        alert(message);
    }

    // Обработка сортировки
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const url = new URL(window.location.href);
            url.searchParams.set('sort', this.value);
            window.location.href = url.toString();
        });
    }

    // Показать/скрыть фильтры
    if (filterBtn && filterDropdown) {
        filterBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            filterDropdown.style.display = filterDropdown.style.display === 'block' ? 'none' : 'block';
        });

        // Закрыть фильтры при клике вне
        document.addEventListener('click', function(e) {
            if (!filterDropdown.contains(e.target) && e.target !== filterBtn) {
                filterDropdown.style.display = 'none';
            }
        });
    }

    // Применить фильтры
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            // Здесь будет логика применения фильтров
            filterDropdown.style.display = 'none';
            alert('Фильтры применены! В реальном приложении здесь будет AJAX запрос');
        });
    }

    // Сбросить фильтры
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            const checkboxes = filterDropdown.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
        });
    }

    // Открыть модальное окно при клике на карточку
    const taskCards = document.querySelectorAll('.task-card');
    taskCards.forEach(card => {
        card.addEventListener('click', function() {
            const taskId = this.getAttribute('data-task-id');
            openTaskModal(taskId);
        });
    });

    // Закрыть модальное окно
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Закрыть модальное окно при клике вне
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Обработка сохранения задачи
    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = {
            task_id: document.getElementById('task-id').value,
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-description').value,
            due_date: document.getElementById('task-due-date').value,
            category: document.getElementById('task-category').value,
            priority: document.getElementById('task-priority').value,
            status: document.getElementById('task-status').value
        };

        console.log("Saving task data:", formData);

        // Отправка данных на сервер через AJAX
        fetch('update-task/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Обновляем страницу
                location.reload();
            } else {
                alert('Ошибка при обновлении задачи: ' + (data.error || ''));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Ошибка сети при обновлении задачи');
        });
    });

    // Обработка удаления задачи
    deleteBtn.addEventListener('click', function() {
        if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
            const taskId = document.getElementById('task-id').value;

            fetch('/delete-task/' + taskId + '/', {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    location.reload();
                } else {
                    alert('Ошибка при удалении задачи');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Ошибка сети при удалении задачи');
            });
        }
    });

    // Функция открытия модального окна
    function openTaskModal(taskId) {
        console.log("Fetching task data for ID:", taskId);

        // Запрос данных задачи
        fetch('/get-task/' + taskId + '/')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log("Task data received:", data);

                document.getElementById('task-id').value = taskId;
                document.getElementById('task-title').value = data.title || '';
                document.getElementById('task-description').value = data.description || '';
                document.getElementById('task-due-date').value = data.due_date || '';
                document.getElementById('task-category').value = data.category_id || '';
                document.getElementById('task-priority').value = data.priority_id || '';
                document.getElementById('task-status').value = data.status_id || '';

                modal.style.display = 'flex';
            })
            .catch(error => {
                console.error('Error fetching task data:', error);
                alert('Ошибка при загрузке данных задачи');
            });
    }
});