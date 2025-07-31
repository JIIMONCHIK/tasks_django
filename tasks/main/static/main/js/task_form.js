document.addEventListener('DOMContentLoaded', function() {
    // Улучшение отображения дат
    const dateFields = document.querySelectorAll('.date-field select');
    dateFields.forEach(select => {
        select.classList.add('form-control');
    });

    // Автоматическая установка дат
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const startDateDay = document.getElementById('id_start_date_day');
    const startDateMonth = document.getElementById('id_start_date_month');
    const startDateYear = document.getElementById('id_start_date_year');

    const dueDateDay = document.getElementById('id_due_date_day');
    const dueDateMonth = document.getElementById('id_due_date_month');
    const dueDateYear = document.getElementById('id_due_date_year');

    // Устанавливаем дату начала только если поля пустые
    if (startDateDay && !startDateDay.value) {
        startDateDay.value = today.getDate();
        startDateMonth.value = today.getMonth() + 1;
        startDateYear.value = today.getFullYear();
    }

    // Устанавливаем дедлайн только если поля пустые
    if (dueDateDay && !dueDateDay.value) {
        dueDateDay.value = nextWeek.getDate();
        dueDateMonth.value = nextWeek.getMonth() + 1;
        dueDateYear.value = nextWeek.getFullYear();
    }

    // Добавляем валидацию дат
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            if (startDateYear.value && dueDateYear.value) {
                const start = new Date(
                    startDateYear.value,
                    startDateMonth.value - 1,
                    startDateDay.value
                );

                const due = new Date(
                    dueDateYear.value,
                    dueDateMonth.value - 1,
                    dueDateDay.value
                );

                if (start > due) {
                    e.preventDefault();
                    alert('Дата начала не может быть позже срока выполнения!');
                    dueDateDay.focus();
                }
            }
        });
    }
});


document.addEventListener('click', function(event) {
    const categoryPanel = document.getElementById('category-panel');
    const btnAddCategory = document.getElementById('btn-add-category');

    if (categoryPanel && categoryPanel.style.display === 'block') {
        const isClickInsidePanel = categoryPanel.contains(event.target);
        const isClickOnAddButton = btnAddCategory.contains(event.target);

        if (!isClickInsidePanel && !isClickOnAddButton) {
            categoryPanel.style.display = 'none';
        }
    }
});