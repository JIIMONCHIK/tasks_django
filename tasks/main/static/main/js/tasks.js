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
});