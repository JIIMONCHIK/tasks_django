document.addEventListener('DOMContentLoaded', function() {
    // Функция для проверки видимости элемента
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.75 &&
            rect.bottom >= 0
        );
    }

    // Функция для обработки анимации при прокрутке
    function handleScrollAnimation() {
        const elements = document.querySelectorAll('.animate-on-scroll');

        elements.forEach(element => {
            if (isElementInViewport(element)) {
                element.classList.add('visible');
            }
        });
    }

    // Инициализация при загрузке
    handleScrollAnimation();

    // Обработка события прокрутки
    window.addEventListener('scroll', handleScrollAnimation);
});