document.addEventListener('DOMContentLoaded', function() {
    const btnAddCategory = document.getElementById('btn-add-category');
    const btnClosePanel = document.getElementById('btn-close-panel');
    const categoryPanel = document.getElementById('category-panel');
    const categoryForm = document.getElementById('category-form');
    const categorySelect = document.getElementById('id_category');
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
});