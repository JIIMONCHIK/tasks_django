document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    let debounceTimer;

    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.trim();

        clearTimeout(debounceTimer);

        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        // Показываем индикатор загрузки
        searchResults.innerHTML = '<div class="search-loading">Поиск...</div>';
        searchResults.style.display = 'block';

        debounceTimer = setTimeout(() => {
            fetch(`/search/autocomplete/?q=${encodeURIComponent(query)}`)
                .then(response => {
                    // Проверяем статус ответа
                    if (response.status === 302) {
                        // Перенаправление на страницу входа
                        window.location.href = '/login';
                        return;
                    }
                    return response.json();
                })
                .then(data => {
                    if (data && data.results) {
                        displayResults(data.results);
                    } else {
                        searchResults.innerHTML = '<div class="search-no-results">Для поиска войдите в систему</div>';
                    }
                })
                .catch(error => {
                    console.error('Search error:', error);
                    searchResults.innerHTML = '<div class="search-error">Ошибка поиска</div>';
                });
        }, 300);
    });

    function displayResults(results) {
        if (!results || results.length === 0) {
            searchResults.innerHTML = '<div class="search-no-results">Ничего не найдено</div>';
            searchResults.style.display = 'block';
            return;
        }

        let html = '';
        results.forEach(item => {
            html += `
            <div class="search-result-item ${item.type}" data-url="${item.url}">
                <div class="result-header">
                    <span class="type-badge">${item.type === 'task' ? 'Задача' : 'Категория'}</span>
                    <span class="result-title">${item.title}</span>
                </div>
                ${item.description ? `
                <div class="result-description">
                    ${item.description}
                </div>` : ''}
                <div class="result-meta">
                    ${item.category_name ? `
                    <span class="category-tag" style="background-color: ${item.category_color}20; border-color: ${item.category_color}">
                        ${item.category_name}
                    </span>` : ''}
                    ${item.due_date ? `<span class="due-date">${item.due_date}</span>` : ''}
                    ${item.tasks_count ? `<span class="tasks-count">Задач: ${item.tasks_count}</span>` : ''}
                </div>
            </div>
            `;
        });

        searchResults.innerHTML = html;
        searchResults.style.display = 'block';

        // Добавляем обработчики клика
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', function() {
                window.location.href = this.dataset.url;
            });
        });
    }

    // Закрываем результаты при клике вне области
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-bar') &&
            !e.target.closest('#search-results')) {
            searchResults.style.display = 'none';
        }
    });

    // Закрытие при нажатии ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            searchResults.style.display = 'none';
        }
    });
});