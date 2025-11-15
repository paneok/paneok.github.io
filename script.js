// ==================== SMOOTH SCROLLING ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        const target = document.querySelector(href);
        if (target) {
            // Для секции персонажей прокручиваем к панели фильтров
            if (href === '#characters') {
                const filtersPanel = document.querySelector('.filters-panel');
                if (filtersPanel) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = filtersPanel.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                } else {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            } else {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ==================== MOBILE MENU ====================
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileMenuBtn.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
    });
}

// ==================== HEADER SCROLL EFFECT ====================
let lastScroll = 0;
let ticking = false;
const header = document.querySelector('.header');
const isNewYearPageHeader = document.body.classList.contains('new-year-page');
const reduceHeaderAnimations = window.innerWidth <= 1024;

function updateHeader() {
    const currentScroll = window.pageYOffset;

    // На планшетах/небольших экранах упрощаем анимацию шапки для плавности
    if (reduceHeaderAnimations) {
        header.style.transform = 'translateY(0)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.12)';
        header.style.background = isNewYearPageHeader
            ? 'rgba(21, 31, 52, 0.97)'
            : 'rgba(255, 255, 255, 0.97)';
        lastScroll = currentScroll;
        ticking = false;
        return;
    }

    if (currentScroll <= 0) {
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        header.style.transform = 'translateY(0)';

        // На новогодней странице оставляем тёмный header, на остальных — белый
        header.style.background = isNewYearPageHeader
            ? 'rgba(21, 31, 52, 0.95)'
            : 'rgba(255, 255, 255, 0.95)';
        return;
    }

    // Добавляем плавное изменение фона при прокрутке
    const progress = Math.min(currentScroll / 200, 1);

    if (isNewYearPageHeader) {
        // Для новогодней страницы не высветляем шапку, чтобы меню оставалось читаемым
        header.style.background = 'rgba(21, 31, 52, 0.97)';
    } else {
        header.style.background = `rgba(255, 255, 255, ${0.95 + progress * 0.05})`;
    }

    if (currentScroll > lastScroll && currentScroll > 80) {
        // Scrolling down - скрываем header
        header.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up - показываем header с увеличенной тенью
        header.style.transform = 'translateY(0)';
        header.style.boxShadow = `0 4px ${20 + progress * 15}px rgba(0, 0, 0, ${0.1 + progress * 0.1})`;
    }

    lastScroll = currentScroll;
    ticking = false;
}

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Добавляем небольшой эффект уменьшения padding при прокрутке
    if (currentScroll > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    // Используем requestAnimationFrame для оптимизации
    if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
    }
});

// ==================== SCROLL REVEAL ANIMATION ====================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all elements with fade-in class
document.querySelectorAll('.fade-in').forEach(element => {
    observer.observe(element);
});

// ==================== CHARACTER CARDS ANIMATION ====================
const characterCards = document.querySelectorAll('.character-card');

characterCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        // Add a subtle scale animation to the emoji
        const emoji = this.querySelector('.character-emoji');
        if (emoji) {
            emoji.style.transform = 'scale(1.2) rotate(10deg)';
        }
    });

    card.addEventListener('mouseleave', function() {
        const emoji = this.querySelector('.character-emoji');
        if (emoji) {
            emoji.style.transform = 'scale(1) rotate(0deg)';
        }
    });
});

// ==================== PROGRAM CARDS ANIMATION ====================
const programCards = document.querySelectorAll('.program-card');

programCards.forEach((card, index) => {
    card.addEventListener('mouseenter', function() {
        // Create a ripple effect
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// ==================== FORM HANDLING ====================
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(this);

        // Show success message
        showNotification('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время!', 'success');

        // Reset form
        this.reset();
    });
}

// ==================== NOTIFICATION SYSTEM ====================
function showNotification(message, type = 'success') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        padding: '1rem 2rem',
        background: type === 'success' ? '#26de81' : '#ff6b9d',
        color: 'white',
        borderRadius: '10px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        zIndex: '10000',
        animation: 'slideInRight 0.5s ease',
        fontWeight: '600',
        maxWidth: '400px'
    });

    // Add to body
    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 5000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    @media (max-width: 768px) {
        .nav-menu.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            padding: 1rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            animation: slideDown 0.3s ease;
        }
    }
`;
document.head.appendChild(style);

// ==================== BUTTON CLICK EFFECTS ====================
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        // Create ripple effect
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        Object.assign(ripple.style, {
            position: 'absolute',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.6)',
            transform: 'scale(0)',
            animation: 'ripple-effect 0.6s ease-out',
            pointerEvents: 'none'
        });

        this.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple-effect {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// ==================== PARALLAX EFFECT FOR HERO ====================
// Оставляем параллакс только на больших экранах, чтобы избежать дёргания на планшетах/мобилках
const enableHeroParallax = !reduceHeaderAnimations;

if (enableHeroParallax) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroContent = document.querySelector('.hero-content');
        const floatingShapes = document.querySelectorAll('.shape');

        if (heroContent) {
            heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
            heroContent.style.opacity = 1 - (scrolled / 600);
        }

        floatingShapes.forEach((shape, index) => {
            const speed = (index + 1) * 0.1;
            shape.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.1}deg)`;
        });
    });
}

// ==================== ANIMATED COUNTER FOR STATISTICS ====================
function animateCounter(element, target, duration = 2000) {
    let startTimestamp = null;
    const start = 0;

    // Извлекаем число из строки (например "8 лет" -> 8)
    const matches = target.match(/\d+/);
    if (!matches) {
        element.textContent = target;
        return;
    }

    const numericTarget = parseInt(matches[0]);
    const suffix = target.replace(/\d+/g, '').trim();

    // Определяем шаг инкремента для оптимизации больших чисел
    const getIncrement = (current, target) => {
        const remaining = target - current;

        // Для больших чисел используем крупные шаги
        if (remaining > 1000) return 100; // Считаем сотнями
        if (remaining > 100) return 10;   // Считаем десятками
        if (remaining > 10) return 5;     // Считаем пятёрками
        return 1;                          // В конце считаем по единице
    };

    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);

        // Вычисляем текущее значение с учётом оптимизированного шага
        let current = Math.floor(progress * (numericTarget - start) + start);

        // Округляем до ближайшего шага для плавности
        if (current < numericTarget) {
            const increment = getIncrement(current, numericTarget);
            current = Math.floor(current / increment) * increment;
        }

        if (suffix) {
            element.textContent = current + ' ' + suffix;
        } else {
            element.textContent = current.toLocaleString();
        }

        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            element.textContent = target; // Устанавливаем финальное значение
        }
    };
    window.requestAnimationFrame(step);
}

// Наблюдаем за счетчиками статистики
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
            const statNumber = entry.target.querySelector('.stat-number');
            const targetValue = statNumber.textContent;

            // Помечаем как анимированное
            entry.target.dataset.animated = 'true';

            // Запускаем анимацию
            animateCounter(statNumber, targetValue, 2500);
        }
    });
}, {
    threshold: 0.5
});

// Наблюдаем за всеми карточками статистики
document.querySelectorAll('.stat-card').forEach(card => {
    statsObserver.observe(card);
});

// ==================== DYNAMIC YEAR IN FOOTER ====================
const currentYear = new Date().getFullYear();
const footerYear = document.querySelector('.footer-bottom p');
if (footerYear) {
    footerYear.innerHTML = `&copy; ${currentYear} Мастерская праздников "Holiday". Все права защищены.`;
}

// ==================== LOADING ANIMATION ====================
// Убрано для предотвращения мерцания при перезагрузке страницы

// ==================== INTERACTIVE EMOJIS ====================
const emojis = document.querySelectorAll('.character-emoji, .program-emoji');

emojis.forEach(emoji => {
    emoji.addEventListener('mouseenter', function() {
        this.style.transition = 'transform 0.3s ease';
        this.style.transform = 'scale(1.3) rotate(15deg)';
    });

    emoji.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1) rotate(0deg)';
    });
});

// ==================== SNOW FROM NEW YEAR BUTTON ====================
function createSnowFromButton() {
    const newYearButton = document.querySelector('.nav-link-new-year');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const header = document.querySelector('.header');

    if (!newYearButton || !header) {
        console.log('New Year button or header not found');
        return;
    }

    // Если включён мобильный/вертикальный layout (видна кнопка-бургер), снег отключаем,
    // так как кнопка "Новый год" спрятана в выпадающем меню
    const mobileMenuVisible = mobileMenuBtn && window.getComputedStyle(mobileMenuBtn).display !== 'none';
    if (mobileMenuVisible || window.innerWidth <= 768) {
        return;
    }

    // Добавляем CSS для снежинок, если его ещё нет
    if (!document.querySelector('#button-snow-styles')) {
        const snowStyle = document.createElement('style');
        snowStyle.id = 'button-snow-styles';
        snowStyle.textContent = `
            .button-snowflake {
                position: absolute; /* внутри header */
                font-size: 10px; /* базовый размер, дальше уменьшаем/варьируем через inline-стили */
                color: #ffffff;
                pointer-events: none;
                z-index: 5;
                opacity: 0;
                text-shadow: 0 0 6px rgba(255,255,255,0.9);
                will-change: transform, opacity;
                animation-fill-mode: forwards;
            }

            @keyframes buttonSnowFall {
                0% {
                    transform: translate3d(0, 0, 0);
                    opacity: 1;
                }
                100% {
                    transform: translate3d(var(--drift, 0px), var(--fall-distance, 80px), 0);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(snowStyle);
    }

    // Флаг, чтобы перестать сыпать снег при прокрутке вниз
    let snowActive = true;
    const stopOffset = (header.offsetHeight || 80) * 1.2;

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > stopOffset) {
            snowActive = false;
        }
    });

    // МЕТЕЛЬНЫЙ РЕЖИМ: очень частое появление снежинок (только пока snowActive === true)
    const minInterval = 40;  // минимальная пауза между "порциями" снега
    const maxInterval = 120; // максимальная пауза

    function spawnSnowflake() {
        if (!snowActive) return;

        const buttonRect = newYearButton.getBoundingClientRect();
        const headerRect = header.getBoundingClientRect();

        // За один вызов создаём небольшую "порцию" снежинок
        const batchCount = 4 + Math.floor(Math.random() * 4); // 4–7 снежинок за раз

        for (let i = 0; i < batchCount; i++) {
            const snowflake = document.createElement('div');
            snowflake.className = 'button-snowflake';
            snowflake.textContent = '❄';

            // Мелкие снежинки для эффекта метели
            const size = 5 + Math.random() * 3; // 5–8 px
            snowflake.style.fontSize = `${size}px`;

            // Позиционируем снежинку относительно header, чтобы она оставалась только в шапке
            const randomX = Math.random() * buttonRect.width;
            const startX = (buttonRect.left - headerRect.left) + randomX;
            const startY = (buttonRect.bottom - headerRect.top) - 6 + Math.random() * 6;

            snowflake.style.left = `${startX}px`;
            snowflake.style.top = `${startY}px`;

            // Падаем только в пределах высоты шапки
            const duration = 900 + Math.random() * 900;          // 0.9–1.8 секунды
            const drift = (Math.random() - 0.5) * 140;           // лёгкий дрейф влево/вправо
            const maxFall = Math.max(40, headerRect.height - 10);
            const fallDistance = 40 + Math.random() * (maxFall - 40);

            snowflake.style.animation = `buttonSnowFall ${duration}ms linear forwards`;
            snowflake.style.setProperty('--drift', `${drift}px`);
            snowflake.style.setProperty('--fall-distance', `${fallDistance}px`);

            header.appendChild(snowflake);

            // Удаляем снежинку после анимации
            setTimeout(() => {
                if (snowflake.parentNode) {
                    snowflake.parentNode.removeChild(snowflake);
                }
            }, duration + 200);
        }

        // Планируем появление следующей порции снега, пока мы ещё в шапке
        if (snowActive) {
            const nextDelay = minInterval + Math.random() * (maxInterval - minInterval);
            setTimeout(spawnSnowflake, nextDelay);
        }
    }

    // Запускаем непрерывный "дождь" из снежинок только в области header
    spawnSnowflake();
}

// Запускаем снег после загрузки страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createSnowFromButton);
} else {
    createSnowFromButton();
}

// ==================== CONSOLE MESSAGE ====================
console.log('%c✨ Волшебный Праздник ✨', 'font-size: 20px; color: #ff6b9d; font-weight: bold;');
console.log('%cСоздано с любовью для незабываемых детских праздников!', 'font-size: 14px; color: #764ba2;');

// ==================== ORDER BUTTON HANDLERS ====================
document.querySelectorAll('.btn-secondary, .btn-outline').forEach(button => {
    button.addEventListener('click', function(e) {
        if (this.textContent.includes('Заказать')) {
            e.preventDefault();
            showNotification('Отлично! Прокрутите страницу вниз, чтобы заполнить форму заказа.', 'success');
            setTimeout(() => {
                document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
            }, 1000);
        }
    });
});

// ==================== CHARACTERS CATALOG INTEGRATION ====================
// Определяем, считается ли персонаж новогодним
function isNewYearCharacter(character) {
    if (!character || !character.images) return false;

    const mainPath = (character.images.main || '').toLowerCase();
    const tags = (character.tags || []).join(' ').toLowerCase();
    const name = (character.name || '').toLowerCase();

    // Варианты определения: папка "Новый год", теги, ключевые слова в названии
    if (mainPath.includes('новый год')) return true;
    if (tags.includes('новый год')) return true;

    const keywords = ['дед мороз', 'снегуроч', 'снежинк', 'снежная королева', 'санта', 'эльф'];
    return keywords.some(keyword => name.includes(keyword));
}

// Вспомогательные функции для сортировки новогодних персонажей
function isPairCharacter(character) {
    const name = (character.name || '').toLowerCase();
    const tags = (character.tags || []).join(' ').toLowerCase();
    const mainPath = (character.images?.main || '').toLowerCase();

    return (
        name.startsWith('пара ') ||
        tags.includes('пара ') ||
        mainPath.includes('парные')
    );
}

function isDMCharacter(character) {
    const name = (character.name || '').toLowerCase();
    const tags = (character.tags || []).join(' ').toLowerCase();

    return (
        name.includes('дед мороз') ||
        name.startsWith('дм') ||
        tags.includes('дед мороз') ||
        tags.includes('дм') ||
        name.includes('санта') ||
        tags.includes('санта')
    );
}

function isSNCharacter(character) {
    const name = (character.name || '').toLowerCase();
    const tags = (character.tags || []).join(' ').toLowerCase();

    return (
        name.includes('снегуроч') ||
        name.startsWith('сн ') ||
        tags.includes('снегуроч') ||
        tags.includes('сн ') ||
        name.includes('снегурочка') ||
        tags.includes('снегурочка')
    );
}

// Кастомная сортировка: сначала пары, затем чередование ДМ / Сн, потом остальные
function sortNewYearCharacters(characters) {
    const pairs = [];
    const dms = [];
    const sns = [];
    const others = [];

    characters.forEach((ch) => {
        if (isPairCharacter(ch)) {
            pairs.push(ch);
        } else if (isDMCharacter(ch)) {
            dms.push(ch);
        } else if (isSNCharacter(ch)) {
            sns.push(ch);
        } else {
            others.push(ch);
        }
    });

    // Чередуем ДМ и Сн
    const dmSnAlternated = [];
    const maxLen = Math.max(dms.length, sns.length);
    for (let i = 0; i < maxLen; i++) {
        if (i < dms.length) dmSnAlternated.push(dms[i]);
        if (i < sns.length) dmSnAlternated.push(sns[i]);
    }

    return [...pairs, ...dmSnAlternated, ...others];
}

// Initialize characters system when DOM is ready
async function initializeCharactersCatalog() {
    try {
        const isNewYearPage = document.body.classList.contains('new-year-page');

        // Load characters data
        const allCharacters = await charactersRenderer.loadCharacters();

        let initialCharacters = allCharacters;
        if (isNewYearPage) {
            // Оставляем только новогодних персонажей для отдельной страницы
            initialCharacters = allCharacters.filter(isNewYearCharacter);

            // Кастомная сортировка: пары, затем чередование ДМ/Сн, затем остальные
            initialCharacters = sortNewYearCharacters(initialCharacters);

            charactersRenderer.characters = initialCharacters;
            charactersRenderer.filteredCharacters = [...initialCharacters];
        }

        // Обновляем счетчик "любимых персонажей" в блоке статистики (если он есть на странице)
        const favoriteCount = allCharacters.length;
        updateFavoriteCharactersStat(favoriteCount);

        // Initialize filter system только на основной странице каталога
        if (!isNewYearPage) {
            charactersFilter = new CharactersFilter(charactersRenderer);
        }

        // Initial render
        charactersRenderer.renderCharacters(initialCharacters);

        console.log('Characters catalog initialized successfully!');
    } catch (error) {
        console.error('Error initializing characters catalog:', error);
        charactersRenderer.showError();
    }
}

// Обновляет отображение количества "любимых персонажей" в блоке статистики
function updateFavoriteCharactersStat(count) {
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        const labelEl = card.querySelector('.stat-label');
        const numberEl = card.querySelector('.stat-number');
        if (!labelEl || !numberEl) return;

        if (labelEl.textContent.trim().includes('любимых персонажей')) {
            numberEl.textContent = count;
        }
    });
}

// Characters grid view toggle (3 per row → 4 per row → 4 per row with square photos)
function initCharactersViewToggle() {
    const grid = document.getElementById('characters-grid');
    const toggleBtn = document.getElementById('view-toggle-btn');
    const section = grid ? grid.closest('.characters-section') : null;

    if (!grid || !toggleBtn) return;

    const modes = [
        {
            classes: ['view-3'],
            label: '3×',
            title: '3 карточки в ряд, вертикальные фото',
            wide: false
        },
        {
            classes: ['view-4'],
            label: '4×',
            title: '4 карточки в ряд, вертикальные фото',
            wide: true
        },
        {
            classes: ['view-4', 'view-4-square'],
            label: '4□',
            title: '4 карточки в ряд, квадратные фото',
            wide: true
        }
    ];

    let currentMode = 0;

    function applyMode() {
        grid.classList.remove('view-3', 'view-4', 'view-4-square');
        modes[currentMode].classes.forEach(cls => grid.classList.add(cls));

        // Управляем расширением секции на всю ширину только для режимов 4-в-ряд
        if (section) {
            if (modes[currentMode].wide) {
                section.classList.add('characters-section--wide');
            } else {
                section.classList.remove('characters-section--wide');
            }
        }

        const icon = toggleBtn.querySelector('.view-toggle-icon');
        if (icon) {
            icon.textContent = modes[currentMode].label;
        }

        toggleBtn.title = modes[currentMode].title;
        toggleBtn.setAttribute('aria-label', modes[currentMode].title);
    }

    toggleBtn.addEventListener('click', () => {
        currentMode = (currentMode + 1) % modes.length;
        applyMode();
    });

    // Устанавливаем начальный режим (3 карточки в ряд)
    applyMode();
}

// Initialize catalog if we're on a page with the characters grid
if (document.getElementById('characters-grid')) {
    const initCharactersFeatures = () => {
        initializeCharactersCatalog();
        initCharactersViewToggle();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCharactersFeatures);
    } else {
        initCharactersFeatures();
    }
}

// ==================== IMAGE ZOOM WITH MOUSE FOLLOW ====================
// Эффект увеличения изображения с следованием за курсором
function initializeImageZoom() {
    const imageContainers = document.querySelectorAll('.character-image-container');

    // Проверяем, является ли устройство сенсорным
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    imageContainers.forEach(container => {
        const image = container.querySelector('.character-photo');

        if (!image) return;
        if (container._zoomInitialized) return;
        container._zoomInitialized = true;

        // Только для НЕ сенсорных устройств добавляем zoom эффект
        if (!isTouchDevice) {
            let isHovering = false;

            container.addEventListener('mouseenter', () => {
                isHovering = true;
            });

            container.addEventListener('mousemove', (e) => {
                if (!isHovering) return;

                const rect = container.getBoundingClientRect();
                const x = e.clientX - rect.left; // Позиция X внутри контейнера
                const y = e.clientY - rect.top;  // Позиция Y внутри контейнера

                // Вычисляем процентное положение курсора (0-1)
                const xPercent = x / rect.width;
                const yPercent = y / rect.height;

                // Сильное смещение для просмотра всех частей изображения
                // При zoom 2.475 нужно большое смещение, чтобы показать края
                const moveX = (xPercent - 0.5) * -250; // Увеличено для просмотра краев по горизонтали
                const moveY = (yPercent - 0.5) * -350; // Увеличено для просмотра лица и ног (вертикаль важнее!)

                image.style.transformOrigin = 'center center';
                image.style.transform = `scale(2.475) translate(${moveX}px, ${moveY}px)`;
            });

            container.addEventListener('mouseleave', () => {
                isHovering = false;
                image.style.transform = 'scale(1)';
                image.style.transformOrigin = 'center center';
            });
        }

        // Добавляем обработчик клика для открытия галереи (для ВСЕХ устройств)
        container.addEventListener('click', (e) => {
            console.log('Image clicked!');
            e.stopPropagation();
            const card = container.closest('.character-card');
            console.log('Card element:', card);
            const characterId = card ? card.getAttribute('data-character-id') : null;
            console.log('Character ID:', characterId);
            if (characterId) {
                openGalleryModal(characterId);
            } else {
                console.error('Character ID not found!');
            }
        });
    });
}

// ==================== GALLERY MODAL ====================
// Создаем модальное окно галереи
function createGalleryModal() {
    const modal = document.createElement('div');
    modal.className = 'gallery-modal';
    modal.innerHTML = `
        <div class="gallery-modal-overlay"></div>
        <div class="gallery-modal-content">
            <button class="gallery-close">&times;</button>

            <div class="gallery-body">
                <div class="gallery-info">
                    <h2 class="gallery-character-name"></h2>
                    <div class="gallery-character-description"></div>
                    <div class="gallery-character-details">
                        <div class="gallery-detail-item">
                            <span class="gallery-detail-icon">👶</span>
                            <div class="gallery-detail-content">
                                <div class="gallery-detail-label">Возраст</div>
                                <span class="gallery-detail-text age"></span>
                            </div>
                        </div>
                        <div class="gallery-detail-item">
                            <span class="gallery-detail-icon">👫</span>
                            <div class="gallery-detail-content">
                                <div class="gallery-detail-label">Для кого</div>
                                <span class="gallery-detail-text gender"></span>
                            </div>
                        </div>
                        <div class="gallery-detail-item">
                            <span class="gallery-detail-icon">🎮</span>
                            <div class="gallery-detail-content">
                                <div class="gallery-detail-label">Активности</div>
                                <span class="gallery-detail-text activities"></span>
                            </div>
                        </div>
                    </div>
                    <div class="gallery-pricing">
                        <div class="gallery-price-main">
                            <span class="gallery-price-label">от</span>
                            <span class="gallery-price-amount"></span>
                            <span class="gallery-price-currency">₽/час</span>
                        </div>
                        <div class="gallery-packages"></div>
                    </div>
                    <button class="btn btn-select gallery-select-btn" data-character-id="">
                        <span class="btn-select-checkbox">✓</span>
                        <span class="btn-select-text">Выбрать</span>
                    </button>
                </div>

                <div class="gallery-images">
                    <button class="gallery-prev">‹</button>
                    <button class="gallery-next">›</button>
                    <div class="gallery-main-image">
                        <img src="" alt="" class="gallery-current-image">
                    </div>
                    <div class="gallery-thumbnails"></div>
                    <div class="gallery-counter">
                        <span class="gallery-current">1</span> / <span class="gallery-total">1</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

// Получаем или создаем модальное окно
function getGalleryModal() {
    let modal = document.querySelector('.gallery-modal');
    if (!modal) {
        modal = createGalleryModal();
    }
    return modal;
}

// Открываем галерею для конкретного персонажа
function openGalleryModal(characterId) {
    console.log('Opening gallery for character:', characterId);

    // Проверяем доступность данных
    if (!window.charactersRenderer || !window.charactersRenderer.characters) {
        console.error('Characters data not loaded yet');
        return;
    }

    console.log('Total characters loaded:', window.charactersRenderer.characters.length);

    // Преобразуем characterId в число, если это строка
    const numericId = parseInt(characterId);
    console.log('Looking for character ID:', numericId);

    // Находим данные персонажа
    const character = window.charactersRenderer.characters.find(c => c.id === numericId);
    console.log('Found character:', character);

    if (!character) {
        console.error('Character not found with ID:', numericId);
        console.log('Available character IDs:', window.charactersRenderer.characters.map(c => c.id));
        return;
    }

    if (!character.images || !character.images.main) {
        console.error('Character has no images:', character);
        // Показываем уведомление пользователю
        if (typeof showNotification === 'function') {
            showNotification('У этого персонажа пока нет фотографий', 'error');
        }
        return;
    }

    // Собираем все изображения - всегда начинаем с main
    const images = [character.images.main];

    // Добавляем дополнительные фотографии из галереи, если они есть
    if (character.images.gallery && Array.isArray(character.images.gallery) && character.images.gallery.length > 0) {
        images.push(...character.images.gallery);
    }

    // Убираем дубликаты (если main повторяется в gallery)
    const uniqueImages = [...new Set(images)];

    console.log('Total images:', uniqueImages.length, uniqueImages);

    const modal = getGalleryModal();

    // Элементы информации о персонаже
    const characterName = modal.querySelector('.gallery-character-name');
    const characterDescription = modal.querySelector('.gallery-character-description');
    const characterDetails = modal.querySelectorAll('.gallery-detail-text');
    const priceAmount = modal.querySelector('.gallery-price-amount');
    const packagesContainer = modal.querySelector('.gallery-packages');
    const selectBtn = modal.querySelector('.gallery-select-btn');

    // Элементы галереи
    const mainImage = modal.querySelector('.gallery-current-image');
    const thumbnailsContainer = modal.querySelector('.gallery-thumbnails');
    const currentCounter = modal.querySelector('.gallery-current');
    const totalCounter = modal.querySelector('.gallery-total');
    const prevBtn = modal.querySelector('.gallery-prev');
    const nextBtn = modal.querySelector('.gallery-next');
    const closeBtn = modal.querySelector('.gallery-close');
    const overlay = modal.querySelector('.gallery-modal-overlay');

    // Заполняем информацию о персонаже
    characterName.textContent = character.name;
    characterDescription.textContent = character.description.full || character.description.short;

    // Возраст
    const ageElement = modal.querySelector('.gallery-detail-text.age');
    ageElement.textContent = `${character.features.age} лет`;

    // Для кого (пол)
    const genderElement = modal.querySelector('.gallery-detail-text.gender');
    const genderLabels = {
        'boys': 'Для мальчиков',
        'girls': 'Для девочек',
        'unisex': 'Универсальные'
    };
    genderElement.textContent = genderLabels[character.features.gender] || 'Универсальные';

    // Активности
    const activitiesElement = modal.querySelector('.gallery-detail-text.activities');
    const activitiesLabels = {
        'active': 'Активные игры',
        'creative': 'Творчество',
        'magic': 'Фокусы',
        'dance': 'Танцы',
        'quest': 'Квесты'
    };
    const activities = character.features.activities.map(a => activitiesLabels[a] || a).join(', ');
    activitiesElement.textContent = activities;

    // Цена
    priceAmount.textContent = character.pricing.hourly.toLocaleString();

    // Пакеты
    packagesContainer.innerHTML = '';
    if (character.pricing.packages && character.pricing.packages.length > 0) {
        character.pricing.packages.forEach(pkg => {
            const pkgEl = document.createElement('div');
            pkgEl.className = 'gallery-package-item';
            pkgEl.innerHTML = `${pkg.duration} часа: <strong>${pkg.price.toLocaleString()}₽</strong>`;
            packagesContainer.appendChild(pkgEl);
        });
    }

    let currentIndex = 0;

    // Закрытие модального окна
    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Установить ID персонажа для кнопки выбора
    selectBtn.setAttribute('data-character-id', character.id);

    // Проверить, выбран ли уже персонаж
    if (window.selectedCharacters && window.selectedCharacters.has(character.id)) {
        selectBtn.classList.add('selected');
        selectBtn.querySelector('.btn-select-text').textContent = 'Выбрано';
    }

    // Кнопка выбора
    selectBtn.onclick = (e) => {
        e.stopPropagation();
        if (window.charactersRenderer) {
            window.charactersRenderer.toggleSelection(character, selectBtn);

            // Обновить состояние кнопки
            if (window.selectedCharacters && window.selectedCharacters.has(character.id)) {
                selectBtn.classList.add('selected');
                selectBtn.querySelector('.btn-select-text').textContent = 'Выбрано';
            } else {
                selectBtn.classList.remove('selected');
                selectBtn.querySelector('.btn-select-text').textContent = 'Выбрать';
            }
        }
    };

    // Функция обновления изображения
    function updateImage(index) {
        currentIndex = index;
        mainImage.src = uniqueImages[index];
        currentCounter.textContent = index + 1;
        totalCounter.textContent = uniqueImages.length;

        // Сбрасываем масштаб при переключении фото
        if (typeof mainImage._pinchScale !== 'undefined') {
            mainImage._pinchScale = 1;
            mainImage.style.transform = 'scale(1)';
        }

        // Обновляем активную миниатюру
        document.querySelectorAll('.gallery-thumbnail').forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }

    // Создаем миниатюры (только если больше 1 изображения)
    thumbnailsContainer.innerHTML = '';
    if (uniqueImages.length > 1) {
        uniqueImages.forEach((src, index) => {
            const thumb = document.createElement('div');
            thumb.className = 'gallery-thumbnail';
            thumb.innerHTML = `<img src="${src}" alt="Photo ${index + 1}" loading="lazy" decoding="async">`;
            thumb.addEventListener('click', () => updateImage(index));
            thumbnailsContainer.appendChild(thumb);
        });
    } else {
        // Если только одно изображение, скрываем миниатюры
        thumbnailsContainer.style.display = 'none';
    }

    // Показываем/скрываем кнопки навигации
    if (uniqueImages.length <= 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
    }

    // Навигация
    prevBtn.onclick = () => {
        const newIndex = currentIndex > 0 ? currentIndex - 1 : uniqueImages.length - 1;
        updateImage(newIndex);
    };

    nextBtn.onclick = () => {
        const newIndex = currentIndex < uniqueImages.length - 1 ? currentIndex + 1 : 0;
        updateImage(newIndex);
    };

    // Обработчики закрытия
    closeBtn.onclick = closeModal;
    overlay.onclick = closeModal;

    // Клавиатурная навигация
    const handleKeyboard = (e) => {
        if (!modal.classList.contains('active')) return;

        if (e.key === 'ArrowLeft') prevBtn.click();
        if (e.key === 'ArrowRight') nextBtn.click();
        if (e.key === 'Escape') closeModal();
    };

    document.removeEventListener('keydown', handleKeyboard);
    document.addEventListener('keydown', handleKeyboard);

    // Настраиваем pinch-to-zoom для основной фотографии на мобильных
    setupPinchToZoomForGalleryImage(mainImage);

    // Показываем модальное окно
    updateImage(0);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ==================== GALLERY PINCH-TO-ZOOM (MOBILE) ====================
function setupPinchToZoomForGalleryImage(imgEl) {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice || !imgEl) return;

    // Навешиваем жесты на контейнер, чтобы ловить касания по всей области фото
    const container = imgEl.closest('.gallery-main-image') || imgEl;

    // Не навешиваем обработчики повторно
    if (container._pinchZoomEnabled) return;
    container._pinchZoomEnabled = true;

    imgEl._pinchScale = 1;
    let startDistance = 0;
    let startScale = 1;

    const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

    const getDistance = (t1, t2) => {
        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;
        return Math.hypot(dx, dy);
    };

    const getMidpoint = (t1, t2) => ({
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
    });

    container.addEventListener('touchstart', function (e) {
        // один палец — даём обычный скролл страницы
        if (e.touches.length === 2) {
            e.preventDefault();
            startDistance = getDistance(e.touches[0], e.touches[1]);
            startScale = imgEl._pinchScale || 1;

            // Смещаем центр масштабирования к точке между пальцами
            const mid = getMidpoint(e.touches[0], e.touches[1]);
            const rect = imgEl.getBoundingClientRect();
            const originX = ((mid.x - rect.left) / rect.width) * 100;
            const originY = ((mid.y - rect.top) / rect.height) * 100;
            imgEl.style.transformOrigin = `${originX}% ${originY}%`;
        }
    }, { passive: false });

    container.addEventListener('touchmove', function (e) {
        if (e.touches.length === 2 && startDistance > 0) {
            e.preventDefault();
            const newDistance = getDistance(e.touches[0], e.touches[1]);
            const scale = clamp(startScale * (newDistance / startDistance), 1, 3);
            imgEl._pinchScale = scale;
            imgEl.style.transform = `scale(${scale})`;
        }
        // один палец — не трогаем, пусть работает вертикальный скролл
    }, { passive: false });

    container.addEventListener('touchend', function (e) {
        if (e.touches.length < 2) {
            startDistance = 0;
            // При завершении жеста всегда возвращаем картинку к исходному масштабу
            imgEl._pinchScale = 1;
            imgEl.style.transform = 'scale(1)';
            imgEl.style.transformOrigin = '50% 50%';
        }
    });
}

// Инициализируем zoom эффект после загрузки персонажей
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeImageZoom, 500);
    });
} else {
    setTimeout(initializeImageZoom, 500);
}

// Переинициализируем после рендеринга персонажей
if (typeof window.charactersRenderer !== 'undefined') {
    const originalMethod = window.charactersRenderer.renderCharacters.bind(window.charactersRenderer);
    window.charactersRenderer.renderCharacters = function(...args) {
        originalMethod(...args);
        setTimeout(initializeImageZoom, 100);
    };
} else {
    // Если charactersRenderer еще не определен, ждем его инициализации
    const checkRenderer = setInterval(() => {
        if (typeof window.charactersRenderer !== 'undefined') {
            clearInterval(checkRenderer);
            const originalMethod = window.charactersRenderer.renderCharacters.bind(window.charactersRenderer);
            window.charactersRenderer.renderCharacters = function(...args) {
                originalMethod(...args);
                setTimeout(initializeImageZoom, 100);
            };
        }
    }, 100);
}
