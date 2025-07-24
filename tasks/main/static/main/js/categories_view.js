document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('category-modal');
    const closeBtn = modal.querySelector('.close');
    const categoryForm = document.getElementById('category-form');
    const btnAddCategory = document.getElementById('btn-add-category');
    const saveBtn = document.getElementById('save-category');
    const nameError = document.getElementById('name-error');
    const categoryCards = document.querySelectorAll('.category-card');
    const colorPicker = document.getElementById('category-color');
    const colorPreview = document.getElementById('color-preview');

    // Инициализация цветового превью
    if (colorPicker && colorPreview) {
        colorPreview.style.backgroundColor = colorPicker.value;
        colorPicker.addEventListener('input', function() {
            colorPreview.style.backgroundColor = this.value;
        });
    }

    // Открытие модального окна для создания
    if (btnAddCategory) {
        btnAddCategory.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            document.getElementById('modal-title').textContent = 'Создать новую категорию';
            categoryForm.reset();
            document.getElementById('category-id').value = '';
            modal.style.display = 'flex';
        });
    }

    // Открытие модального окна для редактирования
    categoryCards.forEach(card => {
        const editBtn = card.querySelector('.btn-edit-category');
        const deleteBtn = card.querySelector('.btn-delete-category');
        const categoryId = card.getAttribute('data-category-id');

        editBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            openEditModal(categoryId);
        });

        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (confirm('Вы уверены, что хотите удалить категорию? Все задачи будут перемещены в "Без категории".')) {
                deleteCategory(categoryId);
            }
        });

        card.addEventListener('click', function(e) {
        // Проверяем, не было ли клика по кнопкам действий
        if (!e.target.closest('.btn-edit-category') && !e.target.closest('.btn-delete-category')) {
            // Переходим на страницу задач с фильтром по категории
            window.location.href = `/tasks?category=${categoryId}`;
        }
        });
    });

    // Закрытие модального окна
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Обработка отправки формы
    categoryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveCategory();
    });

    function openEditModal(categoryId) {
        fetch(`/get-category/${categoryId}/`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('modal-title').textContent = 'Редактировать категорию';
                document.getElementById('category-id').value = categoryId;
                document.getElementById('category-name').value = data.name;
                document.getElementById('category-color').value = data.color_code;
                colorPreview.style.backgroundColor = data.color_code;
                modal.style.display = 'flex';
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Ошибка при загрузке данных категории');
            });
    }

    function saveCategory() {
        const nameInput = document.getElementById('category-name');
        const name = nameInput.value;
        const color = document.getElementById('category-color').value;
        const categoryId = document.getElementById('category-id').value;

        // Сбрасываем предыдущие ошибки
        nameInput.classList.remove('input-error');
        nameError.textContent = '';

        // Проверяем обязательные поля
        if (!name) {
            nameInput.classList.add('input-error');
            nameError.textContent = 'Название категории обязательно';
            return;
        }

        // Создаем FormData
        const formData = new FormData();
        formData.append('name', name);
        formData.append('color_code', color);

        if (categoryId) {
            formData.append('category_id', categoryId);
        }

        const url = categoryId ? '/update-category/' : '/create-category';

        fetch(url, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                if (data.error) {
                    nameError.textContent = data.error;
                    nameInput.classList.add('input-error');
                } else {
                    alert('Ошибка при сохранении категории');
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Ошибка сети');
        });
    }

    function deleteCategory(categoryId) {
        fetch(`/delete-category/${categoryId}/`, {
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
                alert('Ошибка при удалении категории');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Ошибка сети');
        });
    }

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