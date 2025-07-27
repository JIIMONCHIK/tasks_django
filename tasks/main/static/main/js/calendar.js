document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const modal = document.getElementById('dayTasksModal');
    const modalTitle = document.getElementById('modal-day-title');
    const tasksList = document.getElementById('tasks-list');
    const closeBtn = document.querySelector('.close');

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'ru',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: function(fetchInfo, successCallback, failureCallback) {
            fetch('/calendar/events/')
                .then(response => response.json())
                .then(data => {
                    successCallback(data);
                })
                .catch(error => {
                    failureCallback(error);
                });
        },
       eventDidMount: function c(info) {
            // Устанавливаем кастомные стили
            const eventEl = info.el;

            // Цвет по умолчанию
            let bgColor = 'white';
            let borderColor = '#cccccc';

            // Если есть цвет категории, используем его с прозрачностью
            if (info.event.extendedProps.category_color) {
                bgColor = `${info.event.extendedProps.category_color}20`; // 20% прозрачность
                borderColor = info.event.extendedProps.category_color;
            }

            // Устанавливаем CSS переменные
            eventEl.style.setProperty('--event-bg', bgColor);
            eventEl.style.setProperty('--event-border', borderColor);

            // Устанавливаем цвет текста
            const titleEl = eventEl.querySelector('.fc-event-title');
            if (titleEl) {
                titleEl.style.color = '#333';
            }

            // Убираем стандартные классы FullCalendar
//            eventEl.classList.remove('fc-h-event');
            eventEl.classList.add('custom-event');
        },
        eventClick: function(info) {
            window.location.href = '/tasks?highlight=' + info.event.id + '#task-' + info.event.id;
        },
        dateClick: function(info) {
            showDayTasks(info.dateStr);
        },
        dayCellContent: function(args) {
            // Для совместимости с новой версией FullCalendar
            return { html: args.dayNumberText };
        },
        eventContent: function(arg) {
            // Ограничиваем количество отображаемых событий
            const maxEvents = 3;
            const container = document.createElement('div');

            if (arg.event._def.ui.display === 'auto') {
                const eventCount = arg.el.closest('.fc-daygrid-day-frame')?.querySelectorAll('.fc-daygrid-event').length || 0;

                if (eventCount > maxEvents) {
                    const eventIndex = Array.from(arg.el.closest('.fc-daygrid-day-frame')?.querySelectorAll('.fc-daygrid-event') || []).indexOf(arg.el);

                    if (eventIndex >= maxEvents) {
                        if (eventIndex === maxEvents) {
                            const moreEl = document.createElement('div');
                            moreEl.className = 'fc-daygrid-more-link';
                            moreEl.textContent = `+${eventCount - maxEvents} ещё`;
                            moreEl.onclick = function(e) {
                                e.stopPropagation();
                                showDayTasks(arg.event.startStr);
                            };
                            container.appendChild(moreEl);
                        }
                        return { domNodes: [] };
                    }
                }
            }

            const eventEl = document.createElement('div');
            eventEl.className = 'fc-event-title fc-sticky';
            eventEl.textContent = arg.event.title;
            container.appendChild(eventEl);

            return { domNodes: [container] };
        }
    });

    calendar.render();

    // Закрытие модального окна
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }

    // Закрытие при клике вне модального окна
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Функция показа задач для выбранного дня
    function showDayTasks(dateStr) {
        // Загрузка задач для выбранного дня
        fetch(`/calendar/day-tasks/?date=${dateStr}`)
            .then(response => response.json())
            .then(tasks => {
                // Обновляем заголовок модального окна
                const date = new Date(dateStr);
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                modalTitle.textContent = date.toLocaleDateString('ru-RU', options);

                // Очищаем список задач
                tasksList.innerHTML = '';

                // Добавляем задачи в список
                tasks.forEach(task => {
                    const taskItem = document.createElement('div');
                    taskItem.className = 'task-item';
                    taskItem.dataset.id = task.id;

                    // Устанавливаем цвет фона и границы в цвет категории
                    if (task.category_color) {
                        taskItem.style.backgroundColor = task.category_color + '20'; // Добавляем прозрачность 20%
                        taskItem.style.borderLeftColor = task.category_color;
                    } else {
                        // Стили по умолчанию
                        taskItem.style.backgroundColor = '#f8f9fa';
                        taskItem.style.borderLeftColor = '#cccccc';
                    }

                    taskItem.innerHTML = `
                        <div class="task-title">${task.title}</div>
                        ${task.category_name ? `<div class="task-category">${task.category_name}</div>` : ''}
                    `;

                    taskItem.addEventListener('click', function() {
                        window.location.href = '/tasks?highlight=' + task.id + '#task-' + task.id;
                    });

                    tasksList.appendChild(taskItem);
                });

                // Показываем модальное окно
                modal.style.display = 'flex';
            });
    }
});