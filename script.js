// ==================== HERO CHARACTER SILHOUETTES ====================
const HERO_SILHOUETTE_IMAGES = [
    'images/без фона костюмы/Бэтмен-Photoroom.png',
    'images/без фона костюмы/Вампир Дракула-Photoroom.png',
    'images/без фона костюмы/Гвен Стейси-Photoroom.png',
    'images/без фона костюмы/Гринч-Photoroom.png',
    'images/без фона костюмы/Дарт Вейдер-Photoroom.png',
    'images/без фона костюмы/Игра в кальмара-Photoroom.png',
    'images/без фона костюмы/Как приручить дракона Беззубик-Photoroom.png',
    'images/без фона костюмы/Леди баг 2-Photoroom.png',
    'images/без фона костюмы/Принцесса Золушка-Photoroom.png',
    'images/без фона костюмы/Роза Барбоскина-Photoroom.png',
    'images/без фона костюмы/Семейка Аддамс Венсдей-Photoroom.png',
    'images/без фона костюмы/Три кота Карамелька-Photoroom.png',
    'images/без фона костюмы/Фъерк облачко 1-Photoroom.png',
    'images/без фона костюмы/Хаги Ваги 1-Photoroom.png',
    'images/без фона костюмы/Цифровой цирк Помни-Photoroom.png',
    'images/без фона костюмы/Человек паук-Photoroom.png'
];

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function shuffled(list) {
    return [...list].sort(() => Math.random() - 0.5);
}

function createHeroCharacterSilhouettes() {
    const container = document.querySelector('.hero-characters');
    if (!container) return;

    // Clear previous silhouettes
    container.innerHTML = '';

    const zones = [
        { class: 'hero-character-left', opacity: [0.65, 0.85] },
        { class: 'hero-character-right', opacity: [0.65, 0.85] },
        { class: 'hero-character-top-right', opacity: [0.15, 0.30] },
        { class: 'hero-character-bottom-left', opacity: [0.15, 0.30] },
        { class: 'hero-character-bottom-right', opacity: [0.15, 0.30] }
    ];

    const shuffledImages = shuffled(HERO_SILHOUETTE_IMAGES);

    zones.forEach((zone, index) => {
        if (index >= shuffledImages.length) return;

        const img = document.createElement('img');
        const targetOpacity = randomBetween(zone.opacity[0], zone.opacity[1]).toFixed(2);
        
        img.src = shuffledImages[index];
        img.alt = '';
        img.decoding = 'async';
        img.className = `hero-character ${zone.class}`;
        img.style.setProperty('--hero-character-opacity', targetOpacity);
        
        img.style.animationDelay = `${randomBetween(-7, 0).toFixed(2)}s`;
        img.style.animationDuration = `${randomBetween(6.5, 9.5).toFixed(2)}s`;

        img.addEventListener('load', () => {
            img.classList.add('hero-character-loaded');
        }, { once: true });

        img.addEventListener('error', () => {
            img.remove();
        }, { once: true });

        container.appendChild(img);

        if (img.complete) {
            img.classList.add('hero-character-loaded');
        }
    });
}

let heroSilhouetteMobileState = window.matchMedia('(max-width: 768px)').matches;
window.addEventListener('resize', () => {
    const nextMobileState = window.matchMedia('(max-width: 768px)').matches;
    if (nextMobileState !== heroSilhouetteMobileState) {
        heroSilhouetteMobileState = nextMobileState;
        createHeroCharacterSilhouettes();
    }
});

// Обновляет отображение "лет профессиональной деятельности" и "проведенных праздников" в блоке статистики
function updateWorkYearsStat() {
    const startDate = new Date('2017-09-01');
    const currentDate = new Date();
    const diffTime = currentDate - startDate;
    
    // 1. Расчет лет профессиональной деятельности
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    const formattedYears = diffYears.toFixed(1); // Округляем до одного знака после запятой (например, 8.7)
    
    // В русском языке дробные числа согласуются с формой родительного падежа единственного числа: "года"
    const yearsText = `${formattedYears} года`;

    // 2. Расчет проведенных праздников (1.3 праздника в день)
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const calculatedHolidays = Math.floor(diffDays * 1.3);
    const holidaysText = `${calculatedHolidays}`;

    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        const labelEl = card.querySelector('.stat-label');
        const numberEl = card.querySelector('.stat-number');
        if (!labelEl || !numberEl) return;

        const labelText = labelEl.textContent.trim();

        if (labelText.includes('профессиональной деятельности')) {
            numberEl.textContent = yearsText;
            
            // Если анимация уже проигрывалась, перезапускаем с новым значением
            if (card.dataset.animated === 'true') {
                animateCounter(numberEl, yearsText, 2500);
            }
        } else if (labelText.includes('проведенных праздников')) {
            numberEl.textContent = holidaysText;

            // Если анимация уже проигрывалась, перезапускаем с новым значением
            if (card.dataset.animated === 'true') {
                animateCounter(numberEl, holidaysText, 2500);
            }
        }
    });
}

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
        const isOpen = navMenu.classList.contains('active');
        mobileMenuBtn.textContent = isOpen ? '✕' : '☰';
        mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
        mobileMenuBtn.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
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
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : '';

        const nameInput = this.querySelector('#name') || this.querySelector('[name="name"]');
        const phoneInput = this.querySelector('#phone') || this.querySelector('[name="phone"]');
        const dateInput = this.querySelector('#date') || this.querySelector('[name="date"]');
        const classInfoInput = this.querySelector('#class-info') || this.querySelector('[name="class-info"]');
        const childrenCountInput = this.querySelector('#children-count') || this.querySelector('[name="children-count"]');
        const venueInput = this.querySelector('#venue') || this.querySelector('[name="venue"]');
        const formStatus = this.querySelector('.september1-form-status');
        const classInfo = classInfoInput ? classInfoInput.value.trim() : '';
        const childrenCount = childrenCountInput ? childrenCountInput.value.trim() : '';
        const venue = venueInput ? venueInput.value.trim() : '';
        const isSeptemberLanding = document.body.classList.contains('september1-page');
        const requestDetails = [
            classInfo && `Класс / возраст детей: ${classInfo}`,
            childrenCount && `Количество детей: ${childrenCount}`,
            venue && `Площадка: ${venue}`
        ].filter(Boolean);
        const requestNote = requestDetails.join('. ');

        const orderData = {
            customerName: nameInput ? nameInput.value.trim() : 'Клиент',
            customerPhone: phoneInput ? phoneInput.value.trim() : '',
            eventDate: dateInput ? dateInput.value : '',
            source: isSeptemberLanding ? 'Лендинг «1 сентября»' : 'Сайт (Форма контактов)',
            comment: requestNote || (isSeptemberLanding ? 'Заявка с лендинга «1 сентября»' : 'Заявка с главной страницы сайта'),
            notes: requestNote
        };

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправка заявки... ⏳';
        }
        if (formStatus) formStatus.textContent = 'Отправляем заявку…';

        try {
            if (!window.apiClient || typeof window.apiClient.createOrder !== 'function') {
                throw new Error('API client is unavailable');
            }
            await window.apiClient.createOrder(orderData);
            const successMessage = 'Спасибо! Заявка отправлена. Менеджер свяжется с вами для уточнения деталей.';
            showNotification(successMessage, 'success');
            if (formStatus) formStatus.textContent = successMessage;
            this.reset();
        } catch (err) {
            console.error('Could not submit contact form:', err);
            const errorMessage = 'Не удалось отправить заявку. Проверьте интернет или напишите нам в мессенджер.';
            showNotification(errorMessage, 'error');
            if (formStatus) formStatus.textContent = errorMessage;
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
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

    // Поддержка дробных чисел (например "8.7 года" -> 8.7)
    const isFloat = target.includes('.') && !isNaN(parseFloat(target));
    const matches = target.match(isFloat ? /\d+\.\d+/ : /\d+/);
    if (!matches) {
        element.textContent = target;
        return;
    }

    const numericTarget = isFloat ? parseFloat(matches[0]) : parseInt(matches[0]);
    const suffix = target.replace(isFloat ? /\d+\.\d+/g : /\d+/g, '').trim();

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

        // Вычисляем текущее значение
        let current = progress * (numericTarget - start) + start;

        if (isFloat) {
            current = Math.min(current, numericTarget);
            const formattedCurrent = current.toFixed(1);
            if (suffix) {
                element.textContent = formattedCurrent + ' ' + suffix;
            } else {
                element.textContent = formattedCurrent;
            }
        } else {
            let currentInt = Math.floor(current);
            // Округляем до ближайшего шага для плавности
            if (currentInt < numericTarget) {
                const increment = getIncrement(currentInt, numericTarget);
                currentInt = Math.floor(currentInt / increment) * increment;
            }

            if (suffix) {
                element.textContent = currentInt + ' ' + suffix;
            } else {
                element.textContent = currentInt.toLocaleString();
            }
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

// ==================== SEASONAL PARTICLES FROM HEADER BUTTON ====================
function getSeasonalParticleSymbols(slug) {
    if (slug) {
        if (slug.includes('znaniy') || slug.includes('osen')) return ['🍁', '🍂', '🍃', '✏️'];
        if (slug.includes('helloween')) return ['🎃', '🦇', '👻', '✨'];
        if (slug.includes('novy-god') || slug.includes('rozhdestvo') || slug.includes('kanikuly')) return ['❄', '✨', '⭐'];
        if (slug.includes('maslenitsa')) return ['🥞', '☀️', '✨'];
        if (slug.includes('8-marta') || slug.includes('vesny')) return ['🌷', '🌸', '✨'];
        if (slug.includes('23-fevralya')) return ['🛡️', '⭐', '🎖️'];
        if (slug.includes('vypusknoy') || slug.includes('zvonok')) return ['🎓', '🔔', '🎈', '✨'];
        if (slug.includes('detey') || slug.includes('neptuna') || slug.includes('lagern')) return ['🎈', '☀️', '💦', '✨'];
    }

    // Default seasonal symbols by month if no slug specified
    const month = new Date().getMonth() + 1;
    if (month === 8 || month === 9 || month === 10) return ['🍁', '🍂', '🍃'];
    if (month === 12 || month === 1 || month === 2) return ['❄', '✨', '⭐'];
    if (month >= 3 && month <= 5) return ['🌸', '🌷', '✨'];
    return ['🎈', '☀️', '✨'];
}

function createSnowFromButton() {
    const newYearButton = document.querySelector('.nav-link-new-year');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const header = document.querySelector('.header');

    if (!newYearButton || !header) {
        return;
    }

    // Если включён мобильный/вертикальный layout, эффекты отключаем
    const mobileMenuVisible = mobileMenuBtn && window.getComputedStyle(mobileMenuBtn).display !== 'none';
    if (mobileMenuVisible || window.innerWidth <= 768) {
        return;
    }

    // Добавляем CSS для падающих элементов кнопки
    if (!document.querySelector('#button-snow-styles')) {
        const snowStyle = document.createElement('style');
        snowStyle.id = 'button-snow-styles';
        snowStyle.textContent = `
            .button-snowflake {
                position: absolute;
                font-size: 12px;
                color: #ffffff;
                pointer-events: none;
                z-index: 5;
                opacity: 0;
                text-shadow: 0 0 6px rgba(255,255,255,0.8);
                will-change: transform, opacity;
                animation-fill-mode: forwards;
            }

            @keyframes buttonSnowFall {
                0% {
                    transform: translate3d(0, 0, 0) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translate3d(var(--drift, 0px), var(--fall-distance, 80px), 0) rotate(var(--spin, 180deg));
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(snowStyle);
    }

    let snowActive = true;
    const stopOffset = (header.offsetHeight || 80) * 1.2;

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > stopOffset) {
            snowActive = false;
        }
    });

    const minInterval = 50;
    const maxInterval = 140;

    function spawnSnowflake() {
        if (!snowActive) return;

        const buttonRect = newYearButton.getBoundingClientRect();
        const headerRect = header.getBoundingClientRect();

        const symbols = window.currentHolidayParticleSymbols || getSeasonalParticleSymbols(window.currentActiveHolidaySlug);
        const batchCount = 3 + Math.floor(Math.random() * 4);

        for (let i = 0; i < batchCount; i++) {
            const snowflake = document.createElement('div');
            snowflake.className = 'button-snowflake';
            const symbol = symbols[Math.floor(Math.random() * symbols.length)];
            snowflake.textContent = symbol;

            const isEmoji = symbol !== '❄';
            const size = isEmoji ? (11 + Math.random() * 6) : (5 + Math.random() * 4);
            snowflake.style.fontSize = `${size}px`;

            const randomX = Math.random() * buttonRect.width;
            const startX = (buttonRect.left - headerRect.left) + randomX;
            const startY = (buttonRect.bottom - headerRect.top) - 6 + Math.random() * 6;

            snowflake.style.left = `${startX}px`;
            snowflake.style.top = `${startY}px`;

            const duration = 1000 + Math.random() * 1000;
            const drift = (Math.random() - 0.5) * 140;
            const maxFall = Math.max(40, headerRect.height - 10);
            const fallDistance = 40 + Math.random() * (maxFall - 40);
            const spin = (Math.random() - 0.5) * 360;

            snowflake.style.animation = `buttonSnowFall ${duration}ms linear forwards`;
            snowflake.style.setProperty('--drift', `${drift}px`);
            snowflake.style.setProperty('--fall-distance', `${fallDistance}px`);
            snowflake.style.setProperty('--spin', `${spin}deg`);

            header.appendChild(snowflake);

            setTimeout(() => {
                if (snowflake.parentNode) {
                    snowflake.parentNode.removeChild(snowflake);
                }
            }, duration + 200);
        }

        if (snowActive) {
            const nextDelay = minInterval + Math.random() * (maxInterval - minInterval);
            setTimeout(spawnSnowflake, nextDelay);
        }
    }

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
            // Если анимация счетчика уже проигралась, проигрываем заново с новым значением
            if (card.dataset.animated === 'true') {
                animateCounter(numberEl, String(count), 1500);
            }
        }
    });
}

// Инициализирует динамическую загрузку статистики на страницах без каталога персонажей
async function initDynamicStats() {
    const statsGrid = document.querySelector('.stats-grid');
    if (!statsGrid) return;
    
    // Если на странице нет сетки персонажей, но есть счетчики, загружаем данные для синхронизации
    if (!document.getElementById('characters-grid')) {
        try {
            const response = await fetch('data/characters-data.json');
            if (response.ok) {
                const data = await response.json();
                if (data && Array.isArray(data.characters)) {
                    updateFavoriteCharactersStat(data.characters.length);
                }
            }
        } catch (error) {
            console.error('Error loading dynamic statistics:', error);
        }
    }
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

        // Initialize programs renderer if programs grid exists
        if (document.getElementById('programs-grid') && window.programsRenderer) {
            window.programsRenderer.init();
        }
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

        // Плавное увеличение без слежения за курсором: постоянный transform
        // устраняет дёрганье и лишние перерасчёты на каждом mousemove.
        if (!isTouchDevice) {
            let frame = 0;
            let pointerX = 0.5;
            let pointerY = 0.5;
            container.addEventListener('mouseenter', () => {
                image.style.transition = 'transform .15s ease-out';
                image.style.transform = 'scale(2.475)';
            });
            container.addEventListener('mousemove', (event) => {
                const rect = container.getBoundingClientRect();
                pointerX = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
                pointerY = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
                if (frame) return;
                frame = requestAnimationFrame(() => {
                    image.style.transformOrigin = `${(pointerX * 100).toFixed(1)}% ${(pointerY * 100).toFixed(1)}%`;
                    image.style.transform = 'scale(2.475)';
                    frame = 0;
                });
            });
            container.addEventListener('mouseleave', () => {
                if (frame) cancelAnimationFrame(frame);
                frame = 0;
                image.style.transition = 'transform .28s ease-out';
                image.style.transform = 'scale(1)';
                image.style.transformOrigin = '50% 50%';
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
let activeGalleryKeyboardHandler = null;

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
        if (activeGalleryKeyboardHandler) {
            document.removeEventListener('keydown', activeGalleryKeyboardHandler);
            activeGalleryKeyboardHandler = null;
        }
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

    // Re-opening the modal must replace the previous handler rather than
    // accumulating a new closure on every open.
    if (activeGalleryKeyboardHandler) {
        document.removeEventListener('keydown', activeGalleryKeyboardHandler);
    }
    activeGalleryKeyboardHandler = handleKeyboard;
    document.addEventListener('keydown', activeGalleryKeyboardHandler);

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


// ==================== DYNAMIC BACKGROUND RACCOONS GENERATOR ====================
const RACCOON_IMAGES = [
    'енот/Идея.png',
    'енот/Спит.png',
    'енот/большой палец вверх.png',
    'енот/восторг.png',
    'енот/доволен НГ.png',
    'енот/конфити.png',
    'енот/любит.png',
    'енот/пицца.png',
    'енот/подарок.png',
    'енот/подмигивает.png',
    'енот/праздничный список.png',
    'енот/смеется.png',
    'енот/смущение.png',
    'енот/танцует.png',
    'енот/тихо НГ.png',
    'енот/тортик.png'
];

function randomizeBackgroundRaccoons() {
    document.querySelectorAll('.contact-section .page-decor-raccoon').forEach(el => el.remove());
    // Контактная форма должна оставаться чистой: декоративные изображения
    // в ней перекрывают поля и показываются поверх секции на мобильных.
    const sections = document.querySelectorAll(
        '.stats-section, .raccoon-diary-section, .holiday-gallery-section, .team-section, .values-section'
    );
    
    sections.forEach((section, sectionIndex) => {
        // 1. Очищаем старых енотов
        const existingRaccoons = section.querySelectorAll('.page-decor-raccoon');
        existingRaccoons.forEach(el => el.remove());
        
        // 2. Высота секции
        const sectionHeight = section.offsetHeight || section.scrollHeight || 600;
        
        // 3. Количество енотов
        // Несколько равномерно распределённых енотов вместо одного
        // случайного элемента на весь блок.
        const count = Math.min(8, Math.max(2, Math.round(sectionHeight / 400)));
        
        // Перемешиваем и создаем
        const shuffledImages = [...RACCOON_IMAGES].sort(() => Math.random() - 0.5);
        
        // 4. Создаем
        for (let i = 0; i < count; i++) {
            const raccoon = document.createElement('img');
            raccoon.className = 'page-decor-raccoon';
            
            // Картинка
            const imgPath = shuffledImages[i % shuffledImages.length];
            raccoon.src = imgPath;
            raccoon.alt = 'Енот';
            
            // Анимация (float-anim-1 или float-anim-2)
            raccoon.classList.add((sectionIndex + i) % 2 === 0 ? 'float-anim-1' : 'float-anim-2');
            
            // Расчет top положения
            const segmentMin = (i / count) * 100 + 4;
            const segmentMax = ((i + 1) / count) * 100 - 8;
            const randomTop = (Math.random() * (segmentMax - segmentMin) + segmentMin).toFixed(1);
            
            // Положение (лево / право) и отступ
            const isLeft = (sectionIndex + i) % 2 === 0;
            const randomEdge = (Math.random() * 5 + 2).toFixed(1);
            
            raccoon.style.top = `${randomTop}%`;
            
            if (isLeft) {
                raccoon.style.left = `${randomEdge}%`;
            } else {
                raccoon.style.right = `${randomEdge}%`;
            }
            
            // Задержка анимации
            raccoon.style.animationDelay = `${Math.random() * 5}s`;
            
            // Вставляем енота
            section.insertBefore(raccoon, section.firstChild);
        }
    });
}

// Инициализация фоновых енотов
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', randomizeBackgroundRaccoons);
} else {
    randomizeBackgroundRaccoons();
}

// ==================== DYNAMIC NAVBAR LOGO ====================
function initNavbarLogo() {
    const logoImgs = document.querySelectorAll('.logo-img');
    if (logoImgs.length === 0) return;
    
    const randomRaccoon = RACCOON_IMAGES[Math.floor(Math.random() * RACCOON_IMAGES.length)];
    
    logoImgs.forEach(img => {
        img.style.opacity = '0';
        
        const onLoad = () => {
            img.style.opacity = '1';
            img.removeEventListener('load', onLoad);
        };
        img.addEventListener('load', onLoad);
        
        const onError = () => {
            img.src = 'images/енот в деле.png';
            img.style.opacity = '1';
            img.removeEventListener('error', onError);
        };
        img.addEventListener('error', onError);
        
        img.src = randomRaccoon;
        
        if (img.complete) {
            img.style.opacity = '1';
        }
    });
}

// ==================== RACCOON DIARY (3-STEP DOUBLE PAGE SPREAD VERSION) ====================
function initRaccoonDiary() {
    const tabs = document.querySelectorAll('.diary-tab');
    const paper1 = document.getElementById('paper-1');
    const paper2 = document.getElementById('paper-2');
    
    if (tabs.length === 0 || !paper1 || !paper2) return;

    const diaryWrapper = document.querySelector('.diary-book-wrapper');
    const diaryContainer = document.querySelector('.diary-notebook-3d');
    const closedCover = document.querySelector('.diary-closed-cover');
    const btnCloseFullscreen = document.querySelector('.btn-close-fullscreen');
    
    if (!diaryWrapper || !diaryContainer) return;

    // Toggle Functions for inline diary opening/closing (No Native Fullscreen)
    const openFullscreen = () => {
        // Step 1: Add shifting class to slide the cover to the left by half of its width
        diaryWrapper.classList.add('diary-shifting');
        
        // Step 2: After 400ms (sliding done), start the flip-open rotation and fade-out
        setTimeout(() => {
            diaryWrapper.classList.add('diary-opening');
            
            // Step 3: After another 600ms (total 1000ms), reveal the open 3D notebook spread
            setTimeout(() => {
                diaryWrapper.classList.add('diary-fullscreen-active');
                diaryWrapper.classList.remove('diary-opening', 'diary-shifting');
                
                const currentActiveTab = document.querySelector('.diary-tab.active');
                const currentStep = currentActiveTab ? parseInt(currentActiveTab.getAttribute('data-diary-step'), 10) : 1;
                setStep(currentStep);
                setTimeout(scaleDiary, 100);
            }, 600);
        }, 400);
    };

    const closeFullscreen = () => {
        diaryWrapper.classList.remove('diary-fullscreen-active');
        
        setTimeout(() => {
            const currentActiveTab = document.querySelector('.diary-tab.active');
            const currentStep = currentActiveTab ? parseInt(currentActiveTab.getAttribute('data-diary-step'), 10) : 1;
            setStep(currentStep);
            scaleDiary();
        }, 100);
    };

    // Attach user click listeners to closed cover and close button
    if (closedCover) {
        closedCover.addEventListener('click', () => {
            openFullscreen();
        });
    }

    if (btnCloseFullscreen) {
        btnCloseFullscreen.addEventListener('click', (e) => {
            e.stopPropagation();
            closeFullscreen();
        });
    }

    // Get individual page elements
    const p1Front = paper1.querySelector('.page-front');
    const p1Back = paper1.querySelector('.page-back');
    const p2Front = paper2.querySelector('.page-front');
    const p2Back = paper2.querySelector('.page-back');

    // Clean up any old static page buttons inside pages to prevent duplicates
    document.querySelectorAll('.book-page .diary-page-btn').forEach(btn => btn.remove());

    // Dynamically create/inject a single pair of edge buttons directly on the book container
    let prevBtn = diaryContainer.querySelector('.diary-page-btn.prev-btn');
    let nextBtn = diaryContainer.querySelector('.diary-page-btn.next-btn');

    if (!prevBtn) {
        prevBtn = document.createElement('button');
        prevBtn.className = 'diary-page-btn prev-btn';
        prevBtn.innerHTML = '←';
        diaryContainer.appendChild(prevBtn);
    }
    if (!nextBtn) {
        nextBtn = document.createElement('button');
        nextBtn.className = 'diary-page-btn next-btn';
        nextBtn.innerHTML = '→';
        diaryContainer.appendChild(nextBtn);
    }

    // Attach click event listeners directly to pages for high-fidelity physical interaction
    if (p1Back) {
        p1Back.style.cursor = 'pointer';
        p1Back.addEventListener('click', (e) => {
            if (e.target.closest('.diary-page-btn')) return;
            const isMobile = window.innerWidth <= 768 || 
                             (window.innerWidth <= 992 && !diaryWrapper.classList.contains('diary-fullscreen-active'));
            if (!isMobile) {
                setStep(2); // Click left page on Spread B -> Activates Step 2 (12:00 и 17:00)
            }
        });
    }

    if (p2Front) {
        p2Front.style.cursor = 'pointer';
        p2Front.addEventListener('click', (e) => {
            if (e.target.closest('.diary-page-btn')) return;
            const isMobile = window.innerWidth <= 768 || 
                             (window.innerWidth <= 992 && !diaryWrapper.classList.contains('diary-fullscreen-active'));
            if (!isMobile) {
                setStep(2); // Click right page on Spread B -> Activates Step 2 (12:00 и 17:00)
            }
        });
    }

    let initialLoad = true;
    let prevStep = 1;
    let currentStep = 1;

    function flipPage(paper, forward) {
        if (forward) {
            paper.classList.remove('flip-backward');
            paper.classList.add('flip-forward');
        } else {
            paper.classList.remove('flip-forward');
            paper.classList.add('flip-backward');
        }
    }

    function setStep(step) {
        // Determine view mode
        const isMobile = window.innerWidth <= 768 || 
                         (window.innerWidth <= 992 && !diaryWrapper.classList.contains('diary-fullscreen-active'));

        // On desktop, clamp the step between 1 and 3 (mobile goes up to 4)
        if (!isMobile && step > 3) {
            step = 3;
        }

        currentStep = step;
        
        // Reset active tabs (handles both desktop and mobile tab elements)
        tabs.forEach(t => t.classList.remove('active'));
        
        // Activate matching tabs in all active tab elements
        const matchingTabs = document.querySelectorAll(`.diary-tab[data-diary-step="${step}"]`);
        matchingTabs.forEach(t => t.classList.add('active'));

        // Clear active page highlights on all pages
        const allPages = [p1Front, p1Back, p2Front, p2Back];
        allPages.forEach(p => {
            if (p) p.classList.remove('active-page');
        });

        // Get mobile pages viewport
        const viewport = diaryWrapper ? diaryWrapper.querySelector('.diary-pages-viewport') : null;

        // 1. DYNAMIC NAVIGATION ARROWS AND ACTIVE STYLES CONTROLLER
        if (!isMobile) {
            // Desktop Spread Mode / Fullscreen Sideways Mode
            if (step === 1) {
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'flex';
                nextBtn.setAttribute('title', 'Дальше (12:00 и 17:00)');
                nextBtn.onclick = (e) => { e.stopPropagation(); setStep(2); };
                
                if (p1Front) p1Front.classList.add('active-page');
            } 
            else if (step === 2) {
                prevBtn.style.display = 'flex';
                prevBtn.setAttribute('title', 'Назад (08:30)');
                prevBtn.onclick = (e) => { e.stopPropagation(); setStep(1); };
                
                nextBtn.style.display = 'flex';
                nextBtn.setAttribute('title', 'Дальше (21:30)');
                nextBtn.onclick = (e) => { e.stopPropagation(); setStep(3); };
                
                if (p1Back) p1Back.classList.add('active-page');
                if (p2Front) p2Front.classList.add('active-page');
            } 
            else if (step === 3) {
                prevBtn.style.display = 'flex';
                prevBtn.setAttribute('title', 'Назад (12:00 и 17:00)');
                prevBtn.onclick = (e) => { e.stopPropagation(); setStep(2); };
                
                nextBtn.style.display = 'none';
                
                if (p2Back) p2Back.classList.add('active-page');
            }
        } else {
            // Mobile Stack Fallback Mode: Support 4 distinct steps (1 to 4)
            prevBtn.style.display = (step === 1) ? 'none' : 'flex';
            nextBtn.style.display = (step === 4) ? 'none' : 'flex';
            
            if (step > 1) {
                prevBtn.setAttribute('title', 'Назад');
                prevBtn.onclick = (e) => { e.stopPropagation(); setStep(step - 1); };
            }
            if (step < 4) {
                nextBtn.setAttribute('title', 'Вперед');
                nextBtn.onclick = (e) => { e.stopPropagation(); setStep(step + 1); };
            }

            // Highlight active mobile page individually (no overlaps)
            if (step === 1 && p1Front) p1Front.classList.add('active-page');
            if (step === 2 && p1Back) p1Back.classList.add('active-page');
            if (step === 3 && p2Front) p2Front.classList.add('active-page');
            if (step === 4 && p2Back) p2Back.classList.add('active-page');
        }

        // 2. 3D TRANSITION ANIMATIONS AND DECK LAYOUTS CONTROLLER
        if (isMobile) {
            paper1.classList.remove('hover-lift');
            paper2.classList.remove('hover-lift');

            paper1.classList.remove('mobile-active', 'card-flip-forward', 'card-flip-backward', 'card-flipped-static', 'slide-in-left', 'slide-out-right', 'slide-in-right', 'slide-out-left');
            paper2.classList.remove('mobile-active', 'card-flip-forward', 'card-flip-backward', 'card-flipped-static', 'slide-in-left', 'slide-out-right', 'slide-in-right', 'slide-out-left');

            // Clear inline displays on mobile so CSS transitions can drive layout
            if (p1Front) p1Front.style.display = '';
            if (p1Back) p1Back.style.display = '';
            if (p2Front) p2Front.style.display = '';
            if (p2Back) p2Back.style.display = '';

            // Apply the viewport step class to trigger the vertical slide-up transition in CSS
            if (viewport) {
                viewport.classList.remove('step-1', 'step-2', 'step-3', 'step-4');
                viewport.classList.add(`step-${step}`);
            }
            
            prevStep = step;
        } else {
            // Desktop 3D View: Restore regular layouts and clear viewport step classes
            if (viewport) {
                viewport.classList.remove('step-1', 'step-2', 'step-3', 'step-4');
            }

            if (p1Front) { p1Front.style.display = 'flex'; p1Front.style.opacity = '1'; }
            if (p1Back) { p1Back.style.display = 'flex'; p1Back.style.opacity = '1'; }
            if (p2Front) { p2Front.style.display = 'flex'; p2Front.style.opacity = '1'; }
            if (p2Back) { p2Back.style.display = 'flex'; p2Back.style.opacity = '1'; }

            if (step === 1) {
                if (initialLoad) {
                    paper1.classList.remove('flip-forward', 'flip-backward');
                    paper2.classList.remove('flip-forward', 'flip-backward');
                } else {
                    if (paper1.classList.contains('flip-forward')) flipPage(paper1, false);
                    if (paper2.classList.contains('flip-forward')) flipPage(paper2, false);
                }
                
                paper1.style.zIndex = '3';
                paper2.style.zIndex = '2';
            } 
            else if (step === 2) {
                if (initialLoad) {
                    paper1.classList.add('flip-forward');
                    paper2.classList.remove('flip-forward', 'flip-backward');
                } else {
                    if (!paper1.classList.contains('flip-forward')) flipPage(paper1, true);
                    if (paper2.classList.contains('flip-forward')) flipPage(paper2, false);
                }
                
                paper1.style.zIndex = '3';
                paper2.style.zIndex = '3';
            } 
            else if (step === 3) {
                if (initialLoad) {
                    paper1.classList.add('flip-forward');
                    paper2.classList.add('flip-forward');
                } else {
                    if (!paper1.classList.contains('flip-forward')) flipPage(paper1, true);
                    if (!paper2.classList.contains('flip-forward')) flipPage(paper2, true);
                }
                
                paper1.style.zIndex = '2';
                paper2.style.zIndex = '3';
            }

            // Set hover-lift active states on top-most visible sheets
            if (step === 1) {
                paper1.classList.add('hover-lift');
                paper2.classList.remove('hover-lift');
            } else if (step === 2) {
                paper1.classList.add('hover-lift');
                paper2.classList.add('hover-lift');
            } else if (step === 3) {
                paper1.classList.remove('hover-lift');
                paper2.classList.add('hover-lift');
            }
        }
        
        initialLoad = false;
        scaleDiary();
    }

    // Dynamic scale calculator: keep the desktop book ratio and fit the viewport width.
    const scaleDiary = () => {
        const idealW = 1000;
        const idealH = 660;
        const totalW = 1200; // Account for the hanging sidebar tabs (190px offset)
        
        if (!diaryWrapper.classList.contains('diary-fullscreen-active')) {
            diaryContainer.style.transform = '';
            diaryContainer.style.transformOrigin = '';
            diaryContainer.style.width = '';
            diaryContainer.style.height = '';
            diaryWrapper.style.height = '';
            return;
        }

        const w = window.innerWidth;

        // On mobile: reset all JS inline sizing — CSS handles single-page layout
        if (w <= 768) {
            diaryContainer.style.transform = '';
            diaryContainer.style.transformOrigin = '';
            diaryContainer.style.width = '';
            diaryContainer.style.height = '';
            diaryWrapper.style.height = '';
            return;
        }

        const padding = 40;
        // Calculate scale based on total content width (notebook + hanging tabs) to prevent clipping
        const scale = Math.min((w - padding) / totalW, 1.0);

        diaryContainer.style.width = `${idealW}px`;
        diaryContainer.style.height = `${idealH}px`;
        diaryContainer.style.transform = `scale(${scale})`;
        diaryContainer.style.transformOrigin = 'top center';
        diaryWrapper.style.height = `${idealH * scale}px`;
    };

    // Attach click listeners to tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const step = parseInt(tab.getAttribute('data-diary-step'), 10);
            setStep(step);
        });
    });

    // Phone: a diary should turn like pages, not force the visitor to scroll
    // through a long book.  Keep vertical gestures for the page itself and
    // only react to deliberate horizontal swipes.
    const pagesViewport = diaryWrapper.querySelector('.diary-pages-viewport');
    let swipeStartX = 0;
    let swipeStartY = 0;

    if (pagesViewport) {
        pagesViewport.addEventListener('touchstart', (event) => {
            const touch = event.touches[0];
            swipeStartX = touch.clientX;
            swipeStartY = touch.clientY;
        }, { passive: true });

        pagesViewport.addEventListener('touchend', (event) => {
            if (window.innerWidth > 768 || !diaryWrapper.classList.contains('diary-fullscreen-active')) return;

            const touch = event.changedTouches[0];
            const deltaX = touch.clientX - swipeStartX;
            const deltaY = touch.clientY - swipeStartY;

            if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY)) return;

            if (deltaX < 0 && currentStep < 4) setStep(currentStep + 1);
            if (deltaX > 0 && currentStep > 1) setStep(currentStep - 1);
        }, { passive: true });
    }

    // Handle viewport resize to switch layout styles and adapt scale
    window.addEventListener('resize', () => {
        const currentActiveTab = document.querySelector('.diary-tab.active');
        const currentStep = currentActiveTab ? parseInt(currentActiveTab.getAttribute('data-diary-step'), 10) : 1;
        setStep(currentStep);
        scaleDiary();
    });

    // Start at the first step
    setStep(1);
}

// ==================== TELEGRAM TEAM CIRCLES INTERACTIVITY ====================
function initTelegramTeamCircles() {
    const cards = document.querySelectorAll('.team-member-card');
    const modal = document.getElementById('telegram-modal');
    if (cards.length === 0 || !modal) return;

    const closeBtn = modal.querySelector('.telegram-modal-close');
    const backdrop = modal.querySelector('.telegram-modal-backdrop');
    
    const mName = modal.querySelector('.telegram-member-name');
    const mRole = modal.querySelector('.telegram-member-role');
    const mSuperpower = modal.querySelector('.telegram-member-superpower');
    const mRoles = modal.querySelector('.telegram-member-roles');
    const mQuote = modal.querySelector('.telegram-member-quote');
    const mProgress = modal.querySelector('.progress-ring-active');
    const mEmoji = modal.querySelector('.telegram-circle-inner-emoji');
    
    let progressInterval = null;

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const name = card.querySelector('.member-name').textContent;
            const role = card.querySelector('.member-role').textContent;
            const superpower = card.getAttribute('data-superpower') || '';
            const roles = card.getAttribute('data-roles') || '';
            const quote = card.getAttribute('data-quote') || '';
            
            // Заполняем данные
            if (mName) mName.textContent = name;
            if (mRole) mRole.textContent = role;
            if (mSuperpower) mSuperpower.textContent = superpower;
            if (mRoles) mRoles.textContent = roles;
            if (mQuote) mQuote.textContent = quote;
            // Показываем эмодзи-аватар из карточки
            const cardEmoji = card.querySelector('.avatar-emoji');
            if (mEmoji && cardEmoji) mEmoji.textContent = cardEmoji.textContent;
            
            // Анимация progress ring (круглые истории Telegram)
            if (mProgress) {
                const ringMax = 289; // 2*PI*r, r=46
                mProgress.style.strokeDashoffset = ringMax; // Сброс
                let start = Date.now();
                const duration = 8000; // 8 секунд
                
                if (progressInterval) clearInterval(progressInterval);
                
                progressInterval = setInterval(() => {
                    let elapsed = Date.now() - start;
                    let progress = Math.min(elapsed / duration, 1);
                    let offset = ringMax - (progress * ringMax);
                    mProgress.style.strokeDashoffset = offset;
                    
                    if (progress >= 1) {
                        clearInterval(progressInterval);
                        // Повторяем по кругу
                        setTimeout(() => {
                            if (modal.classList.contains('active')) {
                                start = Date.now();
                                progressInterval = setInterval(() => {
                                    let elapsed = Date.now() - start;
                                    let progress = Math.min(elapsed / duration, 1);
                                    let offset = ringMax - (progress * ringMax);
                                    mProgress.style.strokeDashoffset = offset;
                                    if (progress >= 1) {
                                        start = Date.now(); // Loop the progress animation
                                    }
                                }, 50);
                            }
                        }, 500);
                    }
                }, 50);
            }
            
            // Открываем модалку
            modal.classList.add('active');
        });
    });

    const closeModal = () => {
        modal.classList.remove('active');
        if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
        }
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);
    
    // Закрытие по кнопке Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// ==================== HOLIDAY PHOTOS GALLERY CAROUSEL ====================
const HOLIDAY_PHOTOS = [
    "-QdgmvInrQJ3qQJyc0SDQaUocMD7Jst7HeQpxkShraN4Fgv9fq6TSP2nYBh1eWpnIV417sCl.jpg",
    "-s-B3yg8ToGbaB9MhdtZZdFlMfL0XyWWn8VghdLnRjFAgWTkdy2g5JMHVejYNNDSt80y1hJFWk19rvYxN_eadZkv.jpg",
    "09rZoPO0tRn8SSvlYOYBmxmcTH3bzgKlnquuBDx07CAAGubpzrq8qSjGQhyDQnudQ3cnFwqj2qoNh14E7w2MX_3t.jpg",
    "0Z2G21wgjWMRpyr-MlFzCL3VWfaQ6dEN-XtG6t0go0x8-5U82AUOqf_UUaOPPnvA6LrWPzLVYRX7CgVa-0cNxsVd.jpg",
    "0fV0pxPCYzb2773cb8g4HXkOzzfk_6ubapsATjbcGBBEEHvZRB2t7sIxONUNXnU5zMcE-XrDiMG8iy9swfk0en2l.jpg",
    "1DsEDGjgUjNnsD2uaviyN8gycjd-pmGRrqOdFQV5s5x_Offfl9aBhXuRZE5fjRuYF6cSrMKiYDFO3li_ez-Pf-F6.jpg",
    "1Yyj-RlCqtjAib1EL-SFLedGxGpvQfmA2imPUtYRY1bpmc5E3anMFw_1Erzset45NmXmXxiS8PNmjGNs7YpN0RIZ.jpg",
    "1_BtDm7lPKzwkPxQQ10NN0fn3CZ3iI3BEbeisOU9miuUyP25XMGMlyOL9prsL8dQo_RAXdppw4ZI2dEHn8TUTnxh.jpg",
    "1cGNzAOV_IXOJfmZFyd4QGaLGafuB-n--K78_iM3V9e9_XnXnx6FO3o6hhyFOfWcLToRaI_e.jpg",
    "1o5J2oU8K_MRwfVwQHrzGZcDbNJDo1Y06rGJurQN1DK4GbQr84gxvtHCwRLbtdqOIQykfp2N7pie-79pEtyrTVHu.jpg",
    "3Eb2TODE9GVSlzTMxok8FDqDvPmQIz3SaHKU9bY5PbAQJ-tzme-lCsCxI42trmfDhkmKXGPIK8E2lR0b9eAXdyMN.jpg",
    "3NW_Ft4wGU1sFUVcGXbTgW-uCjxleGulurYYxjVjnstTlosCnOjBShTxwTdIuc5kmkPRv3Dpds6kQ9-4BCC-KYMy.jpg",
    "3epJsrrsNb2X-dwyPxB-vxsvFOz_IN1sIiaAT9AD7uLCQ-jKcXMmr6KsdZCUVynKb2_I8NE6.jpg",
    "3xB7EqPj1q13r_Y-PmTHAtNMYes34e08vXxZ7A8C0zCkr1u8ZAQPxLZ1c7jGPXTXj0enB01trjFa03738zLFN510.jpg",
    "3yuaGdQm5FnwLaq2rka8GkK12EwleY3g-zxfBKkj-KYDGCPyIF3nD9dDXQL5D6DhzMOe8D3q0ajwBybnd-9_Dv1-.jpg",
    "53PaOZMc1FL9-yacO_ZYaO75wxGJraK7AHmHEBN884DxFBVB3xmjckE42f9r7hxtRWpVR1q-RUfsCvKhxmmG6ipx.jpg",
    "5GiZt7UnclIyqfLww8r7ahQmPN9j7cFB6tpfu9qYaCyYUx6GGp0Lt0OwPqql7wlA0Syh9uQe9-4SFjaVsAY7ZdHG.jpg",
    "5PxSWH0Qep9VV6sLtF5f8-QUv0u-T6mgLpgTLHbCU2-wJrcfj1ZZ03JYdQi4vXkX1EELF2ZpVg7JbXVo-GpH-Fbm.jpg",
    "5aUOIyDnikvXUXoBQ7BrdtPkKKOM-CLi5SY_MuDNXK7ibINH_RbfBr8TewvDOKPY6L7PrYX5pqWth48MuKqJjnmQ.jpg",
    "5h1S7wRDqaRkv8bP8-OgmXbSVyb5ToWZ-akq0UsvH5gUU5BjlSgf0e1X_1n0NQrqyWiMqE58c5XAm3HBReVAPEdq.jpg",
    "5jngu-uMFNL_JocnRCim9Ed8oRNSmOSnRZMt4sj7Zc3z3DQi-B8qOjuzbNaaj5Zwq-s7YjyxTkF8ylDAKQgB8CIe.jpg",
    "6xAZvcE2mjtwWjG7EyPqEZawIn0kHPzmw8PvXX_M4TiD6ryTCdYx7e2UroCC8sErJP5pXKX7H8MOudSuWicSIMmw.jpg",
    "7PT0i8NfBVxXpeRTqe5uPe1CHgFUDgwKk4fP-Q9gVZSr0Kfas7WzV_lgM8W_0mMB69Ati_4Cj2e2Yypx-EugbXBv.jpg",
    "7Qgq6AewSqslj40TlYzZ-LorJHTS9Ly_TTMP_VHnJmpNSgBjejWB9LkCGu_wB9WWgO3MPNIri6VcO5feDX52RXKB.jpg",
    "7a4UhJxe9DtlCLGLNeqxUAm8SpG0h79uryTqF9pXZ_xC4E6O8yPIrtX6ZwRoznbIBYZ4YL1EvEMSWhG-ChtpjBhL.jpg",
    "7rUghH0sPXSE9YS9tDiwl3N3HsTi23YGud_FpgwW1oXJypzLqm2UhS1evSXEfLlcbZmE2Uue04KJd_dpH37AdBEW.jpg",
    "8vY5L4EzqkkFwiA19Xd_ujDm3gk8CSy3utcD-uaT4ucOhXO5MW4vjmG2v04Hx0mKGldKv-Jnzzav50Q5_UVCZaXL.jpg",
    "9WmhPo5gxVfLvgDuNss-GYzjkZhjXsc-2fSxnDf5JwUFw0yjZ0y7MCZ7tX40s1GNaQYTKHl8.jpg",
    "Ay4-OvD5jGdZ2ejXYsEHyJcezLxl8atbuw_6JZeTHU-eeDshYVDHxoROsGK0v6ecr-eDg4gpnGRC-bgV8aKErMUr.jpg",
    "BAFIxrhx0A6hR_pY9erbaidWD6yo2rU4tXf7-QKzeqa59IFvHNfhHNXKPrchIHeRjUoJVV3x.jpg",
    "Bpai1KLFqyxkc_N9GO9Sf1yM2YaILyyu77_ewtHRt0QzwOHbHRke5zOftxcKdqlIfhiI5g9sXdaWpTCTAjetowD8.jpg",
    "Bpjjll5ssK75oJlAN-SDGC_kXaoXbsIeZa6z_xDC3nkqlA4A4Q9zKuP6n6svyBOafwTZsherthfGc0fI4_ZYmKE1.jpg",
    "C1w6nygQYsgcDPe1zxJeixxqMdAZSZQ1UT2-_sU2U4xgvXdpGj3vgEJSeoqWrj1NT8C6MRp6m3nvbSmBRyURMhMt.jpg",
    "CX7kLmS9Ij09y3_XWlhNrxa2difLwm7BSWfXE4OYAVqMOT5ArHHoGGABoF8z2AoAdh1DLFcXMIt4zHT6K1RiYxM-.jpg",
    "CtEgiocsXeYkvTsPr830mwyipLNLbwGM3W-WFPWURhoXte8pJ7_XOAK7pm7k1K6rtbb1JvpM3Udu_Pxv1AH67bee.jpg",
    "DHnKOeLTsalz80_-TUPu9KuwMtqTGVQx1nc8gcBZhn92y-D-wytdXdmrfcP9FXwq1De-N03X.jpg",
    "DHySKb4g79p_xX4g5PBnzsvBN-9dKg-A_Pv5L0vg3bsVllEIEdO-wcLykLu4Kph0Tp3P5BrlUD4rNedYczptppNF.jpg",
    "E3aDovCBoHRJTeYZz_fYPNb962rU6A53w3ebBKNZ6kkpytoNxjuQSfh2pi-iac4g2qmZchsZQfhtDurAlwQRb7Jn.jpg",
    "E49PS2T45MFLky1Eg9rrsBEXl4jvZFHuwoy010d-ATqsAUL3vokh5ngHOXctv_5xNipWQBephwfil8FRu3sxdlOC.jpg",
    "E6HfnTjlQKMlJSnL_K_13i98O9BztCWYzOBvMfaVCaudNFz9Y6ey_erRjKqdAWS_3JjHV8wO.jpg",
    "EaeBZuNflHFBSTIEhr92EZ_xInXFNtaUZrk7JBWWZuk0LiOgjKPRAxNeERXp0BaislmXl5CPZWwzYAoXFSHI79i-.jpg",
    "Eavzt4VojLyPM0o7zHvpgei1yFPbZaNwLEWb-mPZpWKgh9kDUmHhWaeZkCDX2XrPukc-i2m4.jpg",
    "F3S67g4vdk-mI5GBIXjKCzcg0Sc1GrJY4647_fU5B3zpnfus90sck1Yp68s7L3Tvfs2mfCWaXQk0l-7uRTN-DsgK.jpg",
    "FLuNtQbQHDpo63ncPF7iTTf_XKidArkfl3LtRLeiEHC5GBteZ2rzMby8gq1oJeCi7UpVFiCitC8sE5-ilkZT59Br.jpg",
    "Fnrx5IyXCb4EZWwiqD52RSFwD2pcHWGJTqRwo4p1XshO0ItJrUe2cIQltvBkevgtYJwlxs_a_CwuIk6kktQX6rKF.jpg",
    "GRjO-nqLeFjjvxzbwZXGw3MsQ0Ms08544OLF2pb0m8oXlSOXibI3wUQq5jNr17Lehk3tktpQdZ23Zor14ZqkFww1.jpg",
    "GfCGwdhc18-ml0PSfNqUHKEhKiZD0jHmdwdM5mfEkbAT9M1t7QwqT5tf2nn2Njz7P-C-smgoHqnFTjfBfvrVvH9c.jpg",
    "GqyTXGwvRqZ4PnuDgz1OjZjGL_F5AUTEFPX3NM3T5rnB3t5ca431NGbvAnhd7poxEhGwU2Rvq60Kunau_3xSAXhI.jpg",
    "HdXl4PnjTlVs94NqGkwiEQW9BeIDiTdAEOBuRNyry2GLMKX_zQKAaobMT3KILbMzzC4ogBVANWD-Mdbf4BvCCkZ0.jpg",
    "IrEeDkPvccynI-shOLDKoBqlk1iYrwk5gfv0LuD01uxrsdXYHtupi5hrjHyMg1lFv8Bz-bJuUqLLREJgATJO6XhR.jpg",
    "IwsSFoVVdyKBKTu8iLuPsMMIixc6hn4d_fcPBHXYnuiDR3pWFYFpDH_C4_MEEOTu9JoKP5i8.jpg",
    "KDGu5uXGDcE64DIf3FyMmb32uiJ6eBJLanbk-8uf-KpZbHGR0uOXWm9V6bh1bKbZJRX0e5MfqdIqPIDd_ahZWXSG.jpg",
    "Kn_OziFox2DR0bf0v8QjHYpefQDDGYE5IjtC9eltFcxv3wP43UZlQWKWOUfgT3IksnEzlPlKl3CPAuNDL2QqqTok.jpg",
    "Kt6YOgYIlYCkIulzpIwgyrEczXGjvC4asNAPlUIdKJyqf4dwHF9fQ_7-v-zMNzM2-qBPThPjQmmDijzwu_f9MwoY.jpg",
    "KyYQwGKoWhYjOjdK_dJ_i3DM-R6rKJS_UniWFelRYAZwkOeMDoSqNAEZ1JXQEklTPUrkK9LlP4Alx5MfVIeofmFo.jpg",
    "KyxQulsEeKg4lmO8TbCvqinhWmcxChw4EcyWt8e5nkPbf8-lryv6fiDc7bEJcv4Jawom6eTjrSXf9cE1fUXKpjpd.jpg",
    "L1WG1xlyP4Z1ebgAhkMh2Ew-GflKo2o5R5u5yagmR6yANAJ_FqWEfWx8xkTQGQriR81uPfIQtjsesVAvUVsex9qW.jpg",
    "L_Pd_L_sut4YKIVG8eoFS2a-xnwRFPrkgvBVQAV0BplIQGTc_6Kwz4zZ4Jhrrvmgm2Tb-Bz9k9nSgD4lkzZZPJJc.jpg",
    "LhbAu6DgNzhr3ftmkEYYgTYH6wMfxM0UZQDOWfwlwKRiZZIepwo6FAezM8GnYglipy50tKhhi5Hi4FwHZGk35Hr0.jpg",
    "M5dXrTUO8KYN8gGsoeIvm-N5kMAFvhcSjKTF_1gMptM4cuLTEwI6raPG9vOt9W_WHlVqRE_OCziqzCitQuOfhMtH.jpg",
    "MibyYLBtt7_RLrMwFD5Qi-eVwvxVGprmYaDqY2C0xRdcVznzXGkXSiTUeJO1c2bFclIXokssmhWC4Q9wCdbO-mLm.jpg",
    "N8J7jJrGKbHg3RGa-BOmZ9wIZ3BZBkcSkpii-K8W3_cHTD0vv6oZvbpf40h3PCr_hVXmwpd-FdzARShn7MNZLGIB.jpg",
    "NLaNKnbcwPKgvoIvmeZ4xNHrVlRlmUQKATDtQry7Ijv0zX2-h0SGecwYaeQoyw_bogpqLCPdUDWmr8qR7qNtLZOI.jpg",
    "NPMa6MxzfeY5-bY5cZbnMIwKAoWK5LWAEXCfVxS-OaYxo-_Usj-NGfv1hajXGAvaHjAuTMcmTbVOjQpuRHfc4Zdf.jpg",
    "NSmUFBn3WULeXhFbZAIGtHB8PzdRQmvwaHrDVPODsnMsjF43pmjj8HyABtG9lwzAKdBrunrDQgHcYOhkC-2prS-C.jpg",
    "NpiwITEBe3fe4TjiUQcKtD9iLyLHgjIkaOu2z7FFroCGDYzkTKGe0d84bbRVCDMl2mvvVzv-hRLSsbm0bjAvAtn7.jpg",
    "ORLHdrEisbvJUkyH4jpP8lLpSE7t1bfNo3VvktVe-N2j21LAcRp3RDL_aC6-a2qfKcsxIVXR_wGgBCZGPcuJH-pA.jpg",
    "P7ZwEuNurXHK52LguWNOWqguy5Ut1ir4ORj0duQQhZ0ANGHleDYfwGHyBI3zLjaAK175dJXTJ1FLKIjeVELyxSy3.jpg",
    "PHykEZPcjCn3QhcjTjw_bB8uFgrsLuDj3T2PwO7pCSurap0dbNM73uUZew8LTIlPf_Ti4u4fPNhrZEJuE53oo693.jpg",
    "PRXELcO05ysNoQsi-DpeEL_nIb7BUIIdtmdqlwG39leLqIzVcci9ojUwZjMHhDGV6KnBBQqBsfk_3joiw2XQopU8.jpg",
    "PxPqOyZ7ViXV1-7GwsmSj1Q6wpqX-SouZPl7c79OLY9ZOtVMZuKncaVxMbc1MCtaryBXB7GI.jpg",
    "Q8nR_ZlXgXw6_LuhmN339hVT-kC-m4ZSEHeuQbShlvehof0eBr3ZGMff_uKAPKY-L0ZD8A4K8DVHNMrXzMLBvnmu.jpg",
    "Qem7rzHSuxDF5zATM0FZLrEeFR_BXqcckAOp2bUJUdJjzZizIDeLk0VGwpIfDDa9lC-8wGFoxq-2r6cXGRhUgUbI.jpg",
    "RPwqzRYM1q1VRSuPuuyM8NmLUKdrSvz7_oFxhgcYYm75fgqAoj6CN8UFt9h0Z2tpuip6RpvBacQP5etGmXcXNn5_.jpg",
    "S8UQVy8O_8T_Jf_j46aV9k1a0gktHnEtmP0hZ8OxmBTKQVTRa3tHJRn9pM7R7FZ6r84R4LMI.jpg",
    "SAl1lWon6RGs-23sbU7r_bkJ0p3v5_iKFXG2SnFu4CjmjZzim7raQ0v1kHDK9htLl7pr5-WlIklrxozM1Qfuqy1J.jpg",
    "SXbS9dZeeokZ15G4cd88g5vIxvmu3RFAgIzxQjjH2RkpF5n8HOcAFUE8iz09NTc8CDqmS5qRoBZ5uGI7-NEkuQYc.jpg",
    "SqgC83J5JcH0m0BJj8LlV_RNBl6KgQ_wo8GOG9smmUHiFLK3mLsFT-uGqRdxCp8wajx4lgprxXZNj7zPNntO0TMb.jpg",
    "T46cAoNNzz5oTNEuMohMoqP_4_6wGj5i9_9T5gUOXCF0m22AxNuJre4V2uZHjg4vPVrsvcou3qgLYJU4FwtrTlCA.jpg",
    "UKcvNsmxIel47PCbOGuFhK3a8TRJnXXejibdTnw7h54tqWpLKjjjC_ZdN3QVOonyB8RHMVLvFwoHKTIP_enSzC9i.jpg",
    "UVP6Gn8kSWQxqPvnuVtEaC_wuCoNlXO_liPuXGp2dBy7qLsVyVqu8LLZ7MS4Hf5rOIwmzIcqZR5h9Zyfv5W4E-wl.jpg",
    "Ulr5YSTSKvx3WKnasldMa-hHAZTTiWvwNcAWDIutBvVcjGshrrBb3mKNolrGBcK0dz-IkcgE_Lq9YwvC_h4T0c4I.jpg",
    "UnQd0SUmPS8goSK59bjH7c6hmGpq1IJ0vipL3VQf1hkMr2tXwRkGInjIpZnuOoByVgVZx_leeEDHyZTdOfLD1ta1.jpg",
    "W4oAh6dmC-N-FTxIiC1oQDIMyIoKp5JEk_PE5fmCeWtoq95hTERhC741ZYoOPWUD3oN_HoprYrkdy3vggBiq1VLH.jpg",
    "WG66F18Vt4BKFKcV0U9AZbp7lIBeicZPXw2PqwKWhSTr0MMsqKkG140Uma60ZHJfQ5z7-Ml6dSt-jUVyFE3-q-or.jpg",
    "WTY6IXS-BeUc6uICSWg8b3b3vXHmJTEv_14jEA0aTDdhCToz6CrRhD-NJCU8kn7tQFzELfr6J-6TQfexhp2rCjtf.jpg",
    "WopULVJ7r7ql-e4EfQOoxOXUumEphSpaCZwKy1OQZtusEBIp7NBm-tPl735_Vi9vAAO61IOk1osy387CDWDD1T1A.jpg",
    "XKR4VrI3q4CyqqFMr7RReDmbH3i-xSueCFREKbBi8IUOmj2sRvEJSP61iMQ_USuEC1OMqZPPcEPoxr8KB37vtYbr.jpg",
    "XMlB1_aqOHGkohPXFaujrSSTNLQbMtnBtEhykDi3uEmsmICcljOI03Q_oga76gvfpKPNu85GeKT_ppeCLo0ZCFgC.jpg",
    "YArieiruDErLX3dEKK02Dm6ig5sXpqa5Qdzsayoid6sNsoSbJOWTnJ5aDT_Dq5tsCNpaM_9Wi3swTSypbL6Axndh.jpg",
    "YDkrUE-zLx_AqVDzK_whFh2OIJJ-waizB8Gvnrx7--FBr4tFzuyD4cMz45UFyHpWmvNFzCXrJE2eHqBT02JtKa0-.jpg",
    "YF_KiA7rVA4V2I2HvSp1oXVdjRWPgOVzBfgJDlwJFyMlqBbCt9SomVRu3dl83yFpIGkAnj-_HY7ZF0kWgrQfJc2_.jpg",
    "ZBTIzcwKc7_lzsWUHIOB5FanP19cEMxqMh1qbLMHGrW0irTOqc3qlv6HLN5wXwUtzeFqEKEZ8JZpL4H7B66yoNlZ.jpg",
    "ZJzZQHSek-DbGn04XJynVHa9DF_5z91LW59yKFK8Jq1-9fYZmgvqkLRhL6Sl9RmIPSNBnx1-wuvHelxyu9-2cDFZ.jpg",
    "_AbYdBn5DL7RZyiBqo4E9IMWwMnC_l9xPy5F_jj9jG_0AGjxSflyr54iyiQAVwkreiREdThbVII8HoUzk6wf6qwd.jpg",
    "_cF8-hfCI0GklDK0ftrDVZwwq2IOjaj9H43iiOQ30AZocpxPYsMJ1NCOMMwJnAG9hexuUBp4vr2DeZZlz7ipCFtv.jpg",
    "_kJr3QslasTx25DrHmTsXNAF6yZUJhAje4PrKDNkAAlfM77lpAsXx3vlWr3TmlrBfk_tfp1b.jpg",
    "_l_mAnIg4gu7kACkTxaghgLfZwa4KwaAZ48PzVOLW514EMWVJKgopr6itevqECG0LCHuWQxurAIUSLUk_5oNm2Bo.jpg",
    "a-Ac6S_i-I2nz-Yg6po6zwzXlWdauhA8ANPfiOU5ozBw9vZ4F9hCIcyASNIUuj8hg58urUhZ.jpg",
    "b5aWwt4PTR6_aPoc05H6kSzwmsGXxLQc5FkJET0pWdDylnr7aneDfg9sha0OFmDqjlsvb2SCU7iMIYrooCgpVITY.jpg",
    "bOuY6lb2suIcGVfryOfrvd5jSHhejSmuCH63qt1ptOhkCG8IUeIWJoXaQuln2M_OkbJyUet1.jpg",
    "bzWlMJ--EYXJWG3rWEeZqFu5x-hVdGWEI10HwNgtIY2Vltr3Ht9zgWAIshMCFZhb6wHnzfwo.jpg",
    "c3ZdPz2FYRtl6yKKgfnP0b_zfeJ0vFpavrhId-RzKwXI0AlqWo8ikHvparsfNKydHuu8CAKTBB_Dqx4DoTAmnKKt.jpg",
    "cpo5_x2dHXzM01HGVN-wXhIXC3pCx6gSr17gwyZXy12x7gbycZQEtWJIwczBzNJqgN9cWI4d1-zIp_jz0pTn--Xf.jpg",
    "d18DuP6LaGVyAKE26-AdpiLag8qpasQnbVArPtRkD961pS7AtazPZJWa-ThrDmL5QsbhcHGc5Dp0waEhkj1vBT46.jpg",
    "dTyGCCvtl2k_qidEkM9HHNYreakk9EkpcJilFo-Oi5wejfzZtaOav-X8QNg5WWyQchUxlR8z5eda-OpHOQBOrtSP.jpg",
    "diamfIhiRYYAW9XGRLHGrysPQ3Fh9giMKCvm0TomlKJjzqq0zNsavbilaAjWtlgP9aQ72zdF.jpg",
    "eKkbZnEt_vGqacqG2mA9YM4gFk7KoDRp3N1MQmg_fpy1bFnEHSqI-S-IFDJcIB3uT38mlgTPF07dv3pC36JIHxQl.jpg",
    "f31eI7Ehddhx28ObRrycGyuj44evKVGdINVx8UQvv7q546bp1sqdIxP40rckjuBPnYzDwuvcM6GXbOLLUGdi8vRF.jpg",
    "fhqy9_V329QuIpanafq_hhCB5zNXpGy-x6NVFe_HfmSRVrNiR3OTIKqWS-l0gYYvzc0F_EwCxXOraNMnM6VtT_Ot.jpg",
    "g4m-KRBYVJqZ8qK6nWZ6uX2dPcIzV21rnIuKKTqJThb7DpmYTnUTJSexWobJKigbRQF-Oe4s8GKmPXTWnT-pAQVD.jpg",
    "gCPekCNFsd_5enKoQTOx1M4uncOEDZjK-zaBntKbih-pjEXGcHdQB1V9LVGwILbXndFgj2GbU1XYCFjDnu5-7HCQ.jpg",
    "h6U_07wUas2ecll2gP0PVrfTa8hzW5gmIEciX5ApXeAHzj9rqvzQlc___ITd1SImKqJPXKAhup6y-kfffzdZXPow.jpg",
    "hCgy5puAADCn9Z1MG9Z-eml_7fgX2_OGZOEVFUiS7tBV--ZjB4osWDWNd3q5XlN3c0WbgyZMT8VdhUpDsWs_nzIU.jpg",
    "i7dA9L-iz3CbFY6E_QOe3DJzXq5DsBKnA4MpRkvAt5nzuPigtCKSbm276d_gwGwEqV8Mfj0Mlw6vPfDdZ0suDGDk.jpg",
    "iEdjgSp0-B87qIDgrhnWHM-s0sonXIpgCbluIBRLC2eFRZrMNRwSeOAfOBPSHKSCOveUSAq3oZznC2HfG8kEC1he.jpg",
    "iJbCWQCS6sCQXOOW1kzqOdniPQMajgXYLTrttySyweJ9AVAPncWKrVWrqHQWW7-OQQm6mFf027Bv5jEcwcsbm2yh.jpg",
    "iNSSCQIVxN7nBPQpJVMZhAKYBeBRWyAWMDm5oa8st4BK9dKQSPdNKoXB9IeoCTmU0hAu0LQ00-G9fzbRaq-aP9Ah.jpg",
    "iw94ch0ZK7FtgtkB2r_1rblLa27x4-_IJ1hXYCn5UJz7W0Oun0LbC148FeFnXYknm5JuBtqCayMkR0BoxwQvqCeD.jpg",
    "j9tBe9GSx9lpBAUeO5FXeLO9_PxLbNLBV5jKFIFHgj2B4-AGUnAD3huVjq4kUV_aTTuw786DJucIrubcRi9sTbU7.jpg",
    "jOinaegxsYtKseYxU-Yc8qJE056WH13JUxyhrUQ14F6AjpInNgAZZDzK3t_J7aYqTwuK7b1K9X324neO1h4FfTLz.jpg",
    "ja7SgZ9mIRcS8L1LJwmveusbULrDj5G_jaTx22R-JlVfSzniVFGOJSlKIEibFTA3cupz_vp4FHhJhfMollyDPxk4.jpg",
    "jdx6DkTxBYnz7pTsgU6iirsu3_ndigGKkIritsZjmT0FmOjdNLm8Y_A9LGXMlIgTsc0fZC9F1wkcfQxRD3WVl_vu.jpg",
    "k1vh9mQMK6cvBtI4Seehk2pYvXlHNFq4HX25zoAhfXw8ImMiIDYMXZh5NzpAKuNUXlWi8jF74Iz0dgOs5RDQwHi3.jpg",
    "kAlhuHeNSoqSNHskMTu8ExaNW5rX00YvksM9nRDkHNWdhR71Spsxy0vOxgNk580qNYTPb43jq0qegJ1FDnYrIW25.jpg",
    "kPXseAPe5zGyL-yVjxRrbAPb7JOSqDshmflyb_1R6aRymoRFJ5IA6WBJ0xospDaGBu0Sbw2yMJx6zBd1aKvdKUaa.jpg",
    "kZQY1lT6d5vpueTx8wB6YDlQNF77D5LJP4E8e-dR42Ve98DTCRmhXbIMKbUS4PYaJijkgHDUvZFjGBMqI5f6BMpM.jpg",
    "kk96I6boH18KSXFlyaTtzgD1lbect-1lEygu5tWgKRlaJ8ndMtgaBmSqCXZFW7XLgCp5mWSqWbcdsNVWPtn7LqDI.jpg",
    "kvrvcvpXhZ0q78VlCNC9y9tKU4ZmVUWaEXwOw99kCjumI6njAuCe9QYJnGDckAhLi6lK1v8fG57Ib4W0OXV0EluD.jpg",
    "lXjt8OxlUqZjvGWgNQcaz_bLbpRvh2pdKxqtzlGJmwIqRAZ8EGfdJ98YNWTwHTM0mtvLqWjpGPcEaUUrdio-gk5Z.jpg",
    "lgxKmuoroJN8b7tY0F8z5chvKjZwl_2C4zuJYrHKk__C1XzVL-5804qRFmHVp5dMOavi-IEofaOekm8SYHP83ZcX.jpg",
    "mJV_qDlwr8gCgrMjdgE5p7EskEV3VjYiMGuZMVqegUH4vPtViiO0yyt-BPXxk3qBV2uqxeenJkpucvS7PUmMYA4s.jpg",
    "mRLXxV87f1bQoIBC1TSqVHDeqChXSKC79oCYUsJpZxIeIuGSvk_JyuyfyjfqmVXrLF_a3FTx5RI_Katk2xmlHcuy.jpg",
    "mcyGjovfatHtIn8BtildUm4dnI4QvMWiJUw2OqUV_RcjvsNGqYf-w-KUmoIM4SwLdG6wBFt69Iey7O6BFtPkGD72.jpg",
    "o5FUwUSKqg1UP5sq8bOvzEsdbijPzrLQHWe3TdUwfJ3FQMlzisVQeJ_Bn7ehHg5NmTj8cp6eJw-Wgp7Mpe5NEwnF.jpg",
    "pY3Fk4igefvK9WovpVkIWIH_BkOoMK-IlJR3XHPy17G6DvwY3IF-YXlIRKawT8Taik4e9jwi_fWXl7wmJyqtX1xx.jpg",
    "pr6bPaNvDJpWGrOMHckpm0WwAjDV6Ztgxg_1ch8-qMnAL-AL8jzDUDypeo7okF22VbC-pwfmUk4YOF_vqagMheEj.jpg",
    "qgmtgWhvMmc1U7hskTcWRXWVk7Fk3620ynFz270eSBDXrpJM5l63XHfhp-aDDy57B6HNOijVq-dTNSebbcXu-FTz.jpg",
    "qscBMQ9pQt22o1qDoeGEijz4obSyQQh5d3RAzY1IEUaQ75cDKGSbO7mtyNChGF3kkDO_sgV88QSb71ohEdwpqj_6.jpg",
    "rIq5RlpGVzHLR4zz3fP_uywdcx8vsx17ntsWAi69ecuY0uAd92s-HfeAmFIQdSiFa2UBpE2Ebi_mTEArhyxMlJac.jpg",
    "rmyHjLbajQ0mFkAV1hdj6_HV8DiIINBD8CGwr0Y1KA77x8MLMOBoz7OIYQW-nuc-u_VgpxgRcCRKlBUVEb9VZcMd.jpg",
    "ro8_poiXC-ZJGE7VYpKXVFXbkpiyvV4f87tCq29djZAMWMQ9p2iyxO8juYHiPVKIwDrixYByN5XwOAcQ56YiFrOJ.jpg",
    "sT9fxmx1PExtcryJfLdEQP9uAsGaaIOshtRVTOMmj_oADOSaCDiA7wfvZrMrDPTLaRDlc_h6f-QQuXk277Cdj4fn.jpg",
    "soNXtPc53YmY1DqYG3FUqhnaFa8P1k8qQsTIGYrTUAvyo0nG_3SfdnsqZYTBcAiSvUCQ8J3_FAEJAqhlBnVYaW8v.jpg",
    "szYD5HfOy1Evn77eS3FlmdtjXEuTWwKCjG3uOkM78hNNNw8SZxcVlm8OSjVKasAyslOYQrptO_b5gdy0p3xs7WFx.jpg",
    "tl8pqZDI1kDQ273CvhwkjAdQ81uSJ3KI1dk0pXtrRHGJgNN-Uv8V--sjGOAVJFo-LNClbt1J.jpg",
    "u2aM7ILM-eroSjOCvfnR-OPhn8kOeBW4fJBqtIoqF0pyf_WrZF72QJOFsuWLseYk_-7nTRm2.jpg",
    "uPjnod_qAWapwZmOADhLP6b3oSLkF4Q_U5ecZd7EMzlJK90g2kOFFwo8KfQ2VBj3BikUozB_XLANEkuLvxazkeEF.jpg",
    "uVPvxCB5HK6PkLIJHUP1YJEsRZNLrYhe22Hq31pvj5GcwSiXBVjB6ai8jXTtDKVkGcd7xnEpV-jHc-tXmmXQ0MD7.jpg",
    "uWNtApQwxf_7-yvJrsHUUv55UdV4-71MkSOcnqSBP_I-ui02h_7LGNzDbLmQHAUbW1Pe5fjwJBygRC31S7GYI2_0.jpg",
    "vMmZpH8TLvvHsq51dhCkjxt_sHmM1yLw90OwhKLGw4FAw9ggsBiORg26DD2WO2BuEyAM1wfpJ5qWHGCJLbnPnWhq.jpg",
    "vtZcGFaTI2SJdtOQ-xIBnSGxqKMmK3roXUoaxJHPB7ZhG3Fxeo2sHvrEXu5uLrt2nD-UxaR9QPG1Ucs9AzxSeVBo.jpg",
    "wNccfiGiXeONOhBeY44VQhgv0PJKxHjLnO2a_SVDcNdH5vZwYtJyYtcfYHdhChqoDPBcFPNXXipdUbcZSQ4w-wOz.jpg",
    "wVBMF0xJOrLwPMv9oC5AKHIRwVphiDZnog-gf9R-WpUDE6XBwWWfiirhMzfhSogCSS0z-SvrFhq8CVyTzoJDfllT.jpg",
    "wicIBqbtL2XQ3Ridq9jDYfyr_oKQPcl8dONQXMgBVL6G1Fjs9B2DYkS_Iq94fDKliWCqeoGKhjun0_cW_VqQzjL2.jpg",
    "xfq3-UMtPiFrJZXNQAYYXTuO582dOJ_06-ImSfphbDZaudSKaIBgsYX9LmBQGOijETPicwnUS2fM00aUaJjbt-1X.jpg",
    "xzADWXjdUN90H7ozZG3Zplv8FdxqNrx12rfQpPzq9ob2SfN-QmiUrZtqU_KI1QEQ8EVjBeEATSh44L9y__igYHM2.jpg",
    "yE5-KBlzW4k4c6sthhfL1O8tPxpQRy7n-NMRSXC5hj4hvYEFdCtNqKwa-sLf4GJz1AWgTs3xk68-AgQg1O671-jI.jpg",
    "yo16Q4VkXnMY632ZxhFFcZsQrnJGmJMTPmHf6eU1tv3T0Bg5xMgvJJbjs0cSLAWEvP_ywtb0.jpg",
    "ytutAlxAwxFz9O1Z6BQh_I0fH5dpvfzvCWVAeYgVESKdYL1HOWnUyEUXSBzscOnQXCPuIwMD.jpg",
    "yxQ24Xrej9fFPxQQ6qcbAihIY8y-FzdhNJB3rlx7l-sWhV7RZkvtogdVt-JE8mzEO6jVF7k9.jpg",
    "zqiDla8-vbQJpV-ev3eZ5gzHx0U5K5mfzmXQuvb9BMCeTTWt5hF0PRzxC7AuUMlrG4ZC0A7OOwYhAr76VDjxyL0s.jpg"
];

const RANDOM_CAPTIONS = [
    "Море улыбок и чистого восторга! ✨",
    "Самый яркий день в году! 🎉",
    "Искры счастья в детских глазах! ❤️",
    "Волшебство начинается прямо сейчас! 🪄",
    "Танцы до упаду с любимыми героями! 💃",
    "Дружная команда весёлых непосед! 🦝",
    "Моменты, которые остаются в сердце навсегда! 🥰",
    "Настоящая сказка пришла в гости! 👑",
    "Смех, веселье и горы конфетти! 🎈",
    "Секрет лучшего праздника раскрыт! 💡",
    "Улыбка каждого ребенка — наша победа! 🏆",
    "Праздник с душой и любовью! 🌟",
    "Веселые игры и забавные приключения! 🗺️",
    "Время обнимашек и поздравлений! 🤗",
    "Когда сказка оживает наяву! ✨",
    "Эмоции, которые не передать словами! 📸",
    "Детство должно быть ярким! 🌈",
    "Наши юные супергерои в деле! ⚡",
    "Сладкая вата, игры и смех! 🍭",
    "Создаем волшебные воспоминания! 💫",
    "Искренняя радость и детский восторг! ✨",
    "Праздник, о котором мечтает каждый ребенок! 🎈",
    "Наши аниматоры дарят настоящую сказку! 👑",
    "Зажигательная дискотека и веселые конкурсы! 🎵"
];

let activeHolidayPhotos = [...HOLIDAY_PHOTOS];

async function fetchDynamicPhotos() {
    try {
        const response = await fetch('http://localhost:3001/api/holiday-photos');
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                activeHolidayPhotos = data;
                console.log(`Successfully loaded ${data.length} photos dynamically from Express server!`);
            }
        }
    } catch (e) {
        console.warn("Could not fetch photos dynamically, falling back to pre-compiled list:", e);
    }
}

async function initHolidayGalleryLegacy() {
    const track = document.getElementById('holiday-carousel-track');
    const viewport = document.getElementById('holiday-carousel-viewport');
    
    // Lightbox elements
    const lightbox = document.getElementById('lightbox-modal');
    let lightboxContent = null;
    let lightboxImg = null;
    let lightboxCaption = null;
    let lightboxClose = null;
    let lightboxPrev = null;
    let lightboxNext = null;
    let lightboxBackdrop = null;
    
    if (lightbox) {
        lightboxContent = lightbox.querySelector('.lightbox-content');
        if (lightboxContent) lightboxContent.style.display = 'none'; // Hide the static placeholder card
        lightboxImg = lightbox.querySelector('.lightbox-image');
        lightboxCaption = lightbox.querySelector('.lightbox-caption');
        lightboxClose = lightbox.querySelector('.lightbox-close-btn');
        lightboxPrev = lightbox.querySelector('.lightbox-prev-btn');
        lightboxNext = lightbox.querySelector('.lightbox-next-btn');
        lightboxBackdrop = lightbox.querySelector('.lightbox-backdrop');
    }
    
    if (!track || !viewport) return;
    
    const visiblePhotosCount = 10; // Number of unique photos to show in row
    let realPhotos = [];
    let realCaptions = [];
    let trackPhotos = [];
    let trackCaptions = [];
    
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let velocity = 0;
    let lastX = 0;
    let hasMoved = false; // Used for inertia/scroll tracking
    let animationFrameId = null;
    
    // JS-based autoscroll variables
    let marqueeX = 0;
    let isMarqueeRunning = true;
    
    // Select unique random photos
    function selectRandomPhotos() {
        const photosSource = activeHolidayPhotos.length > 0 ? activeHolidayPhotos : HOLIDAY_PHOTOS;
        const shuffled = [...photosSource].sort(() => Math.random() - 0.5);
        realPhotos = shuffled.slice(0, Math.min(visiblePhotosCount, photosSource.length));
        realCaptions = realPhotos.map(() => RANDOM_CAPTIONS[Math.floor(Math.random() * RANDOM_CAPTIONS.length)]);
        
        // Double them for endless marquee loop
        trackPhotos = [...realPhotos, ...realPhotos];
        trackCaptions = [...realCaptions, ...realCaptions];
    }
    
    // Build DOM structure
    function buildCarouselDOM() {
        track.innerHTML = '';
        
        for (let i = 0; i < trackPhotos.length; i++) {
            const cardIndex = i % realPhotos.length;
            const card = document.createElement('div');
            card.className = 'polaroid-card';
            card.setAttribute('data-card-index', cardIndex);
            
            card.innerHTML = `
                <div class="polaroid-card-img-wrapper">
                    <img class="polaroid-card-img" src="images/fotoprazdnik/${trackPhotos[i]}" alt="${trackCaptions[i]}" loading="lazy">
                </div>
                <p class="polaroid-card-caption font-handwritten">${trackCaptions[i]}</p>
            `;
            
            // Reliable click detection: compare pointer position between down and up
            // Works regardless of pointer capture on track or CSS transforms
            let cardPointerDownX = 0;
            let cardPointerDownY = 0;

            card.addEventListener('pointerdown', (e) => {
                cardPointerDownX = e.clientX;
                cardPointerDownY = e.clientY;
            });

            card.addEventListener('click', (e) => {
                const dx = Math.abs(e.clientX - cardPointerDownX);
                // Only open if it was a true click (not a drag — dx > 10px)
                if (dx > 10 || isTransitioning) return;
                openLightbox(cardIndex, card);
            });
            
            track.appendChild(card);
        }
    }
    
    // JS high-performance marquee autoscroll loop
    function animateMarquee() {
        if (!isMarqueeRunning || isDragging || (lightbox && lightbox.classList.contains('active'))) {
            return;
        }
        
        marqueeX -= 0.8; // Beautiful premium smooth speed
        
        const trackHalfWidth = track.offsetWidth / 2;
        if (marqueeX < -trackHalfWidth) {
            marqueeX += trackHalfWidth;
        } else if (marqueeX > 0) {
            marqueeX -= trackHalfWidth;
        }
        
        track.style.transform = `translate3d(${marqueeX}px, 0px, 0px)`;
        
        animationFrameId = requestAnimationFrame(animateMarquee);
    }
    
    // Setup pointer kinetic drag and inertia
    function setupKineticDrag() {
        // pointerdown on track
        track.addEventListener('pointerdown', (e) => {
            if (isTransitioning) return;
            if (lightbox && lightbox.classList.contains('active')) return;
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            lastX = e.clientX;
            hasMoved = false;
            
            // Show grab cursor while dragging
            viewport.classList.add('is-dragging');
            
            isMarqueeRunning = false; // Pause JS autoscrolling
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            
            // NOTE: setPointerCapture removed — it prevented click events on child cards from firing
        });
        
        // pointermove on window (global tracking)
        window.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            
            const diffX = Math.abs(e.clientX - startX);
            const diffY = Math.abs(e.clientY - startY);
            
            if (diffX > 12 || diffY > 12) {
                hasMoved = true;
            }
            
            const x = e.clientX;
            const walk = x - lastX;
            lastX = x;
            
            velocity = walk * 1.5;
            
            let newX = marqueeX + walk;
            
            // Endless seamless horizontal wrapping
            const trackHalfWidth = track.offsetWidth / 2;
            if (newX < -trackHalfWidth) {
                newX += trackHalfWidth;
            } else if (newX > 0) {
                newX -= trackHalfWidth;
            }
            
            marqueeX = newX;
            track.style.transform = `translate3d(${newX}px, 0px, 0px)`;
        });
        
        // pointerup on window (global tracking)
        window.addEventListener('pointerup', () => {
            if (!isDragging) return;
            isDragging = false;
            viewport.classList.remove('is-dragging');
            
            function inertia() {
                if (lightbox && lightbox.classList.contains('active')) {
                    isMarqueeRunning = false;
                    return;
                }
                
                if (Math.abs(velocity) < 0.1) {
                    if (!lightbox || !lightbox.classList.contains('active')) {
                        isMarqueeRunning = true; // Resume JS autoscrolling
                        animateMarquee();
                    }
                    track.style.transform = `translate3d(${marqueeX}px, 0px, 0px)`;
                    return;
                }
                
                let newX = marqueeX + velocity;
                velocity *= 0.95; // Kinetic Friction
                
                const trackHalfWidth = track.offsetWidth / 2;
                if (newX < -trackHalfWidth) {
                    newX += trackHalfWidth;
                } else if (newX > 0) {
                    newX -= trackHalfWidth;
                }
                
                marqueeX = newX;
                track.style.transform = `translate3d(${newX}px, 0px, 0px)`;
                animationFrameId = requestAnimationFrame(inertia);
            }
            
            animationFrameId = requestAnimationFrame(inertia);
        });
        
        // Handle cancel
        window.addEventListener('pointercancel', () => {
            if (isDragging) {
                isDragging = false;
                viewport.classList.remove('is-dragging');
                isMarqueeRunning = true;
                animateMarquee();
            }
        });
    }
    
    // ==================== PREMIUM LIGHTBOX MODAL ====================
    let lightboxIndex = 0;
    let originalClickedCard = null; // Store reference to restore opacity on close
    let originalTransform = '';     // Store reference to restore rotation on close
    let isTransitioning = false;     // Prevent spam during transitions
    let activeLightboxCard = null;  // Reference to the physical fixed clone on screen
    let originalTrackTransform = ''; // Store the starting track transform matrix to prevent snapping on close
    
    function openLightbox(index, clickedCard) {
        if (!clickedCard || isTransitioning) return;
        isTransitioning = true;
        
        // 1. Pause autoscrolling immediately
        isMarqueeRunning = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        
        lightboxIndex = index;
        originalClickedCard = clickedCard;
        
        // Save the starting track transform matrix using our JS marqueeX coordinate
        originalTrackTransform = `translate3d(${marqueeX}px, 0px, 0px)`;
        
        // 2. Get original card position on screen
        const rect = clickedCard.getBoundingClientRect();
        
        // 3. Create transition clone
        const clone = clickedCard.cloneNode(true);
        clone.classList.add('polaroid-card-transitioning');
        
        // Apply starting position inline styles (fixed relative to screen)
        clone.style.position = 'fixed';
        clone.style.top = rect.top + 'px';
        clone.style.left = rect.left + 'px';
        clone.style.width = rect.width + 'px';
        clone.style.height = rect.height + 'px';
        clone.style.margin = '0';
        clone.style.zIndex = '20005'; // Perfectly between modal (20000) and buttons (20010, 20020)
        
        // Keep current rotation transform
        const computedStyle = window.getComputedStyle(clickedCard);
        originalTransform = computedStyle.transform;
        clone.style.transform = originalTransform;
        clone.style.transition = 'none'; // Initially no transitions
        clone.style.pointerEvents = 'none'; // Ignore clicks during flight
        
        // 4. Hide original card in track (physically gone!)
        clickedCard.style.opacity = '0';
        
        // 5. Append clone directly to body (solid visible flight)
        document.body.appendChild(clone);
        activeLightboxCard = clone;
        
        // 6. Force a reflow
        clone.offsetHeight;
        
        // 7. Target size: 2/3 of viewport height, image fills card
        const targetHeight = window.innerHeight * 0.67;
        const cardAspectRatio = rect.width / rect.height;
        let targetWidth = targetHeight * cardAspectRatio;
        
        // Cap width to viewport
        const maxWidth = window.innerWidth <= 480 ? window.innerWidth * 0.92
                       : window.innerWidth <= 768 ? window.innerWidth * 0.88
                       : window.innerWidth * 0.7;
        if (targetWidth > maxWidth) targetWidth = maxWidth;
        
        const targetTop = (window.innerHeight - targetHeight) / 2;
        const targetLeft = (window.innerWidth - targetWidth) / 2;
        
        // Force image wrapper to fill all available space (no white gap)
        const imgWrapper = clone.querySelector('.polaroid-card-img-wrapper');
        if (imgWrapper) {
            imgWrapper.style.flex = '1';
            imgWrapper.style.height = '0';
            imgWrapper.style.minHeight = '0';
            imgWrapper.style.width = '100%';
        }
        
        // 8. Start backdrop fade in
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        // 9. Animate the clone to center
        clone.style.transition = 'all 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)';
        clone.style.top = targetTop + 'px';
        clone.style.left = targetLeft + 'px';
        clone.style.width = targetWidth + 'px';
        clone.style.height = targetHeight + 'px';
        clone.style.transform = 'rotate(0deg)';
        clone.classList.add('fullscreen-zoom-active');
        
        // 10. Once flight finishes, unlock transitioning — clone stays pointer-events:none
        //     so taps on the card pass through to the lightbox backdrop swipe handler
        setTimeout(() => {
            try {
                // Keep pointerEvents: none — interaction handled by lightbox swipe handler
            } catch (err) {
                console.error("Error during open transition cleanup:", err);
            } finally {
                isTransitioning = false;
            }
        }, 650);
    }
    
    // Find matching card on track that is closest to center of viewport
    function findActiveCardOnTrack(index) {
        const cards = track.querySelectorAll('.polaroid-card');
        let bestCard = null;
        let minDistance = Infinity;
        const viewportCenter = window.innerWidth / 2;
        
        cards.forEach(card => {
            if (parseInt(card.getAttribute('data-card-index')) === index) {
                const rect = card.getBoundingClientRect();
                const cardCenter = rect.left + rect.width / 2;
                const distance = Math.abs(cardCenter - viewportCenter);
                if (distance < minDistance) {
                    minDistance = distance;
                    bestCard = card;
                }
            }
        });
        
        return bestCard || originalClickedCard;
    }
    
    function closeLightbox() {
        if (!lightbox || !activeLightboxCard || isTransitioning) return;
        isTransitioning = true;
        
        // 1. Find the current active card on the track to fly back to
        const activeCard = findActiveCardOnTrack(lightboxIndex);
        if (!activeCard) {
            lightbox.classList.remove('active');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            
            try {
                if (activeLightboxCard && activeLightboxCard.parentNode) {
                    activeLightboxCard.parentNode.removeChild(activeLightboxCard);
                }
            } catch (err) {
                console.error("Error removing clone:", err);
            } finally {
                activeLightboxCard = null;
                track.style.transition = '';
                track.style.transform = `translate3d(${marqueeX}px, 0px, 0px)`;
                
                isMarqueeRunning = true;
                animateMarquee();
                isTransitioning = false;
            }
            return;
        }
        
        // Restore opacity of any previously hidden original card
        if (originalClickedCard && originalClickedCard !== activeCard) {
            originalClickedCard.style.opacity = '1';
        }
        
        // Hide the target track card — the clone will fly INTO its place
        activeCard.style.opacity = '0';
        
        // 2. Get the card's CURRENT position on the track (no track scrolling back!)
        const startRect = activeCard.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(activeCard);
        const targetTransform = computedStyle.transform !== 'none' ? computedStyle.transform : originalTransform;
        
        // 3. Prepare clone for flight
        activeLightboxCard.style.pointerEvents = 'none';
        
        // Fade out backdrop — track stays where it is
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        
        // 4. Fly clone from center to its current track slot (no track animation)
        activeLightboxCard.style.transition = 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
        activeLightboxCard.style.top = startRect.top + 'px';
        activeLightboxCard.style.left = startRect.left + 'px';
        activeLightboxCard.style.width = startRect.width + 'px';
        activeLightboxCard.style.height = startRect.height + 'px';
        activeLightboxCard.style.transform = targetTransform;
        activeLightboxCard.classList.remove('fullscreen-zoom-active');
        
        // 5. Clean up, reveal card, resume carousel
        setTimeout(() => {
            try {
                if (activeLightboxCard && activeLightboxCard.parentNode) {
                    activeLightboxCard.parentNode.removeChild(activeLightboxCard);
                }
                activeLightboxCard = null;
                
                if (activeCard) {
                    activeCard.style.opacity = '1';
                }
                
                isMarqueeRunning = true;
                animateMarquee();
            } catch (err) {
                console.error("Error in close transition timeout cleanup:", err);
            } finally {
                isTransitioning = false;
            }
        }, 500);
    }
    
    // Choreographed double-flight navigation: slides the track and flies the cards
    function navigateLightbox(direction) {
        if (isTransitioning || !activeLightboxCard || !realPhotos.length) return;
        isTransitioning = true;
        
        // 1. Calculate the target index
        let nextIndex = 0;
        if (direction === 'next') {
            nextIndex = (lightboxIndex + 1) % realPhotos.length;
        } else {
            nextIndex = (lightboxIndex - 1 + realPhotos.length) % realPhotos.length;
        }
        
        // 2. Find the current card on the track and the next card on the track
        const currentTrackCard = findActiveCardOnTrack(lightboxIndex);
        const nextTrackCard = findActiveCardOnTrack(nextIndex);
        
        if (!currentTrackCard || !nextTrackCard) {
            isTransitioning = false;
            return;
        }
        
        // 3. Capture CURRENT position of next card BEFORE any track movement
        const startRectB = nextTrackCard.getBoundingClientRect();
        
        // 4. Shift track so the target card lands in viewport CENTER
        const nextCardCenter = startRectB.left + startRectB.width / 2;
        const viewportCenter = window.innerWidth / 2;
        const shiftNeeded = viewportCenter - nextCardCenter;
        let newX = marqueeX + shiftNeeded;
        
        // Handle endless loop wrapping smoothly
        const trackHalfWidth = track.offsetWidth / 2;
        if (newX < -trackHalfWidth) {
            track.style.transition = 'none';
            const jumpedX = marqueeX + trackHalfWidth;
            track.style.transform = `translate3d(${jumpedX}px, 0px, 0px)`;
            track.offsetHeight;
            newX = jumpedX + shiftNeeded;
        } else if (newX > 0) {
            track.style.transition = 'none';
            const jumpedX = marqueeX - trackHalfWidth;
            track.style.transform = `translate3d(${jumpedX}px, 0px, 0px)`;
            track.offsetHeight;
            newX = jumpedX + shiftNeeded;
        }
        
        marqueeX = newX;
        
        // --- FLIGHT A: Current card A flies BACK to the track (at the position it was before shift) ---
        const startRectA = currentTrackCard.getBoundingClientRect();
        const cardToFlyBack = activeLightboxCard;
        cardToFlyBack.style.pointerEvents = 'none';
        
        const computedStyleA = window.getComputedStyle(currentTrackCard);
        const targetTransformA = computedStyleA.transform !== 'none' ? computedStyleA.transform : originalTransform;
        
        cardToFlyBack.style.transition = 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
        cardToFlyBack.style.top = startRectA.top + 'px';
        // Fly back to where the card will be after the track shift
        cardToFlyBack.style.left = (startRectA.left + shiftNeeded) + 'px';
        cardToFlyBack.style.width = startRectA.width + 'px';
        cardToFlyBack.style.height = startRectA.height + 'px';
        cardToFlyBack.style.transform = targetTransformA;
        cardToFlyBack.classList.remove('fullscreen-zoom-active');
        
        setTimeout(() => {
            try {
                if (cardToFlyBack && cardToFlyBack.parentNode) {
                    cardToFlyBack.parentNode.removeChild(cardToFlyBack);
                }
                currentTrackCard.style.opacity = '1';
            } catch (err) {
                console.error("Error cleaning up Flight A:", err);
            }
        }, 500);
        
        // --- TRANSITION THE TRACK to center next card ---
        track.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
        track.style.transform = `translate3d(${newX}px, 0px, 0px)`;
        
        // --- FLIGHT B: Next card B flies OUT from its PRE-SHIFT position to center ---
        
        // Create new transition clone for the next card B
        const cloneB = nextTrackCard.cloneNode(true);
        cloneB.classList.add('polaroid-card-transitioning');
        
        // Position clone B at its starting coordinates on the track (pre-shifted)
        cloneB.style.position = 'fixed';
        cloneB.style.top = startRectB.top + 'px';
        cloneB.style.left = startRectB.left + 'px';
        cloneB.style.width = startRectB.width + 'px';
        cloneB.style.height = startRectB.height + 'px';
        cloneB.style.margin = '0';
        cloneB.style.zIndex = '20005';
        
        const computedStyleB = window.getComputedStyle(nextTrackCard);
        cloneB.style.transform = computedStyleB.transform !== 'none' ? computedStyleB.transform : originalTransform;
        cloneB.style.transition = 'none';
        cloneB.style.pointerEvents = 'none';
        
        // Hide original card B on the track
        nextTrackCard.style.opacity = '0';
        
        // Append clone B to body and update state references
        document.body.appendChild(cloneB);
        activeLightboxCard = cloneB;
        lightboxIndex = nextIndex;
        originalClickedCard = nextTrackCard; // Update reference for exit flight
        
        // Force reflow
        cloneB.offsetHeight;
        
        // Calculate centered dimensions: 2/3 of viewport height, image fills card
        const targetHeight = window.innerHeight * 0.67;
        const cardAspectRatio = startRectB.width / startRectB.height;
        let targetWidth = targetHeight * cardAspectRatio;
        const maxWidth = window.innerWidth <= 480 ? window.innerWidth * 0.92
                       : window.innerWidth <= 768 ? window.innerWidth * 0.88
                       : window.innerWidth * 0.7;
        if (targetWidth > maxWidth) targetWidth = maxWidth;
        const targetTop = (window.innerHeight - targetHeight) / 2;
        const targetLeft = (window.innerWidth - targetWidth) / 2;
        
        // Force image wrapper to fill all available space
        const imgWrapperB = cloneB.querySelector('.polaroid-card-img-wrapper');
        if (imgWrapperB) {
            imgWrapperB.style.flex = '1';
            imgWrapperB.style.height = '0';
            imgWrapperB.style.minHeight = '0';
            imgWrapperB.style.width = '100%';
        }
        
        // Animate clone B to center
        cloneB.style.transition = 'all 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)';
        cloneB.style.top = targetTop + 'px';
        cloneB.style.left = targetLeft + 'px';
        cloneB.style.width = targetWidth + 'px';
        cloneB.style.height = targetHeight + 'px';
        cloneB.style.transform = 'rotate(0deg)';
        cloneB.classList.add('fullscreen-zoom-active');
        
        // Make the new active card interactive after landing
        setTimeout(() => {
            try {
                // Keep pointerEvents: none — interaction via lightbox swipe handler
            } catch (err) {
                console.error("Error during Flight B landing cleanup:", err);
            } finally {
                isTransitioning = false;
            }
        }, 650);
    }
    
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    // Backdrop click removed — unified swipe/tap handler below handles close
    
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox('prev'); });
    }
    
    if (lightboxNext) {
        lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox('next'); });
    }
    
    // Swipe / tap gesture handler on lightbox — covers both touch (mobile) and mouse (desktop)
    if (lightbox) {
        let lbStartX = 0;
        let lbStartY = 0;
        
        // Shared logic: decide what to do based on swipe distance
        function handleLightboxGestureEnd(endX, endY, targetEl) {
            if (!lightbox.classList.contains('active') || isTransitioning) return;
            
            const dx = endX - lbStartX;
            const dy = endY - lbStartY;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
            
            if (absDx > 50 && absDx > absDy * 1.5) {
                // Horizontal swipe → navigate (ignore if tap was on close btn)
                if (targetEl && targetEl.closest && targetEl.closest('.lightbox-close-btn')) return;
                navigateLightbox(dx > 0 ? 'prev' : 'next');
            } else if (absDx < 15 && absDy < 15) {
                // Short tap → close (but not when tapping nav/close buttons — they handle themselves)
                if (targetEl && targetEl.closest && targetEl.closest('.lightbox-close-btn, .lightbox-nav-btn')) return;
                closeLightbox();
            }
        }
        
        // ── TOUCH EVENTS (mobile) ──────────────────────────────────────────
        // touchend always fires on the same target as touchstart — reliable for gesture tracking.
        // pointer-events:none on the clone makes touches pass through to the lightbox element.
        lightbox.addEventListener('touchstart', (e) => {
            lbStartX = e.touches[0].clientX;
            lbStartY = e.touches[0].clientY;
        }, { passive: true });
        
        lightbox.addEventListener('touchend', (e) => {
            const t = e.changedTouches[0];
            handleLightboxGestureEnd(t.clientX, t.clientY, e.target);
        }, { passive: true });
        
        // ── POINTER EVENTS (desktop mouse only, avoid double-firing on touch) ──
        lightbox.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'touch') return; // handled by touch events above
            lbStartX = e.clientX;
            lbStartY = e.clientY;
        });
        
        lightbox.addEventListener('pointerup', (e) => {
            if (e.pointerType === 'touch') return; // handled by touch events above
            handleLightboxGestureEnd(e.clientX, e.clientY, e.target);
        });
    }

    // Initial build with pre-compiled photos (instant rendering, non-blocking)
    selectRandomPhotos();
    buildCarouselDOM();
    setupKineticDrag();
    animateMarquee();
    
    // Fetch dynamic photos in the background (non-blocking)
    try {
        await fetchDynamicPhotos();
        if (!isDragging && (!lightbox || !lightbox.classList.contains('active'))) {
            // Stop the current loop before rebuilding DOM
            isMarqueeRunning = false;
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            
            selectRandomPhotos();
            buildCarouselDOM();
            marqueeX = 0; // Reset to start on dynamic reload
            
            // Restart loop cleanly
            isMarqueeRunning = true;
            animateMarquee();
        }
    } catch (e) {
        console.warn("Failed background fetch of dynamic photos:", e);
    }
}

// Lightweight gallery: native scrolling on the page and a simple lightbox.
// The previous marquee duplicated cards and kept a requestAnimationFrame loop
// running continuously, which was costly on desktop and unreliable on phones.
function initHolidayGallery() {
    const track = document.getElementById('holiday-carousel-track');
    const viewport = document.getElementById('holiday-carousel-viewport');
    const lightbox = document.getElementById('lightbox-modal');
    if (!track || !viewport || !lightbox) return;

    const photosSource = activeHolidayPhotos.length ? activeHolidayPhotos : HOLIDAY_PHOTOS;
    const photos = photosSource.slice(0, 10);
    const captions = photos.map((_, index) => RANDOM_CAPTIONS[index % RANDOM_CAPTIONS.length]);
    const image = lightbox.querySelector('.lightbox-image');
    const caption = lightbox.querySelector('.lightbox-caption');
    const closeButton = lightbox.querySelector('.lightbox-close-btn');
    const previousButton = lightbox.querySelector('.lightbox-prev-btn');
    const nextButton = lightbox.querySelector('.lightbox-next-btn');
    const backdrop = lightbox.querySelector('.lightbox-backdrop');
    let currentIndex = 0;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let lastLightboxSwipeAt = 0;

    track.replaceChildren();
    track.style.transform = '';
    track.style.transition = '';

    // A single duplicate set lets the CSS animation loop seamlessly. Unlike
    // the former implementation, there is no permanent JavaScript animation
    // frame, drag inertia, or clone flight calculation on every frame.
    [...photos, ...photos].forEach((photo, cardPosition) => {
        const index = cardPosition % photos.length;
        const card = document.createElement('button');
        card.className = 'polaroid-card';
        card.type = 'button';
        card.dataset.cardIndex = String(index);
        card.setAttribute('aria-label', `Открыть фото: ${captions[index]}`);
        card.innerHTML = `
            <span class="polaroid-card-img-wrapper">
                <img class="polaroid-card-img" src="images/fotoprazdnik/${photo}" alt="${captions[index]}" loading="lazy" decoding="async">
            </span>
            <span class="polaroid-card-caption font-handwritten">${captions[index]}</span>
        `;

        let downX = 0;
        card.addEventListener('pointerdown', (event) => { downX = event.clientX; });
        card.addEventListener('click', (event) => {
            if (Math.abs(event.clientX - downX) > 8) return;
            openLightbox(index);
        });
        track.append(card);
    });

    function renderLightbox() {
        image.src = `images/fotoprazdnik/${photos[currentIndex]}`;
        image.alt = captions[currentIndex];
        caption.textContent = captions[currentIndex];
    }

    function openLightbox(index) {
        currentIndex = index;
        renderLightbox();
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        closeButton?.focus();
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
    }

    function navigateLightbox(direction) {
        currentIndex = (currentIndex + direction + photos.length) % photos.length;
        renderLightbox();
    }

    closeButton?.addEventListener('click', closeLightbox);
    backdrop?.addEventListener('click', closeLightbox);
    previousButton?.addEventListener('click', (event) => {
        event.stopPropagation();
        navigateLightbox(-1);
    });
    nextButton?.addEventListener('click', (event) => {
        event.stopPropagation();
        navigateLightbox(1);
    });

    function handleLightboxSwipe(endX, endY) {
        if (!lightbox.classList.contains('active')) return;
        const deltaX = endX - pointerStartX;
        const deltaY = endY - pointerStartY;
        if (Math.abs(deltaX) <= 48 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
        if (Date.now() - lastLightboxSwipeAt < 300) return;

        lastLightboxSwipeAt = Date.now();
        navigateLightbox(deltaX < 0 ? 1 : -1);
    }

    // Pointer Events cover most touchscreens and mouse/trackpad testing.
    lightbox.addEventListener('pointerdown', (event) => {
        pointerStartX = event.clientX;
        pointerStartY = event.clientY;
    });
    lightbox.addEventListener('pointerup', (event) => {
        if (event.target.closest('.lightbox-nav-btn, .lightbox-close-btn')) return;
        handleLightboxSwipe(event.clientX, event.clientY);
    });

    // Fallback for mobile browsers that do not deliver reliable pointerup
    // events from an image inside a fixed modal.
    lightbox.addEventListener('touchstart', (event) => {
        const touch = event.touches[0];
        pointerStartX = touch.clientX;
        pointerStartY = touch.clientY;
    }, { passive: true });
    lightbox.addEventListener('touchend', (event) => {
        const touch = event.changedTouches[0];
        handleLightboxSwipe(touch.clientX, touch.clientY);
    }, { passive: true });

    document.addEventListener('keydown', (event) => {
        if (!lightbox.classList.contains('active')) return;
        if (event.key === 'Escape') closeLightbox();
        if (event.key === 'ArrowLeft') navigateLightbox(-1);
        if (event.key === 'ArrowRight') navigateLightbox(1);
    });
}

async function initDynamicHeaderHolidayButton() {
    const holidayLinks = document.querySelectorAll('.nav-link-new-year, .nav-item-new-year, .holiday-header-btn');
    if (holidayLinks.length === 0) return;

    let calendarEvents = [];

    try {
        const res = await fetch('data/holiday-calendar.json?v=20260810-header-holiday', { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            if (data && data.events && data.events.length > 0) {
                calendarEvents = data.events;
            }
        }
    } catch (e) {
        console.warn('Calendar JSON fetch failed, using fallback rules:', e);
    }

    if (calendarEvents.length === 0) {
        calendarEvents = [
            { slug: 'novy-god', title: '🎄 Новый год', monthStart: 11, dayStart: 18, monthEnd: 1, dayEnd: 15, fallbackUrl: 'new-year.html' },
            { slug: 'maslenitsa', title: '🥞 Масленица', monthStart: 2, dayStart: 1, monthEnd: 3, dayEnd: 2, fallbackUrl: 'catalog.html?filter=maslenitsa' },
            { slug: '23-fevralya', title: '🛡️ 23 февраля', monthStart: 2, dayStart: 10, monthEnd: 2, dayEnd: 24, fallbackUrl: 'catalog.html?filter=23-fevralya' },
            { slug: '8-marta', title: '🌷 8 марта', monthStart: 2, dayStart: 25, monthEnd: 3, dayEnd: 9, fallbackUrl: 'catalog.html?filter=8-marta' },
            { slug: 'vypusknoy-v-detskom-sadu', title: '🎓 Выпускной', monthStart: 4, dayStart: 15, monthEnd: 6, dayEnd: 5, fallbackUrl: 'catalog.html?category=vypusknoy' },
            { slug: 'den-znaniy', title: '🍁 1 сентября', monthStart: 8, dayStart: 1, monthEnd: 9, dayEnd: 5, fallbackUrl: 'den-znaniy.html' },
            { slug: 'helloween', title: '🎃 Хэллоуин', monthStart: 10, dayStart: 1, monthEnd: 11, dayEnd: 1, fallbackUrl: 'catalog.html?filter=helloween' }
        ];
    }

    const now = new Date();
    const curMonth = now.getMonth() + 1; // 1-12
    const curDay = now.getDate();

    let activeEvent = null;
    for (const ev of calendarEvents) {
        let inRange = false;
        if (ev.monthStart <= ev.monthEnd) {
            inRange = (curMonth > ev.monthStart || (curMonth === ev.monthStart && curDay >= ev.dayStart)) &&
                      (curMonth < ev.monthEnd || (curMonth === ev.monthEnd && curDay <= ev.dayEnd));
        } else {
            inRange = (curMonth > ev.monthStart || (curMonth === ev.monthStart && curDay >= ev.dayStart)) ||
                      (curMonth < ev.monthEnd || (curMonth === ev.monthEnd && curDay <= ev.dayEnd));
        }
        if (inRange) {
            activeEvent = ev;
            break;
        }
    }

    if (activeEvent) {
        window.currentActiveHolidaySlug = activeEvent.slug;
        window.currentHolidayParticleSymbols = getSeasonalParticleSymbols(activeEvent.slug);
        holidayLinks.forEach(link => {
            link.textContent = activeEvent.title;
            link.setAttribute('href', activeEvent.fallbackUrl || `prazdniki/${activeEvent.slug}.html`);
        });
    }
}

// Инициализация всех компонентов при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initNavbarLogo();
        initDynamicHeaderHolidayButton();
        initRaccoonDiary();
        initTelegramTeamCircles();
        initDynamicStats();
        createHeroCharacterSilhouettes();
        updateWorkYearsStat();
        initHolidayGallery();
    });
} else {
    initNavbarLogo();
    initDynamicHeaderHolidayButton();
    initRaccoonDiary();
    initTelegramTeamCircles();
    initDynamicStats();
    createHeroCharacterSilhouettes();
    updateWorkYearsStat();
    initHolidayGallery();
}
