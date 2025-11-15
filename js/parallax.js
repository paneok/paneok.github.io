// Parallax Mouse Movement Effect
class ParallaxEffect {
    constructor() {
        this.heroSection = document.querySelector('.hero');
        this.parallaxItems = document.querySelectorAll('.parallax-item');
        this.mouseX = 0;
        this.mouseY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.isMouseInside = false; // Флаг: мышь внутри hero-секции
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.startTime = performance.now();
        this.lastTime = this.startTime;

        // Флаг для первого кадра: распределяем все иконки по траекториям с разной фазой
        this._initialPhaseAssigned = false;

        // ВКЛЮЧАЕМ эффекты только если есть hero и элементы
        if (this.heroSection && this.parallaxItems.length > 0) {
            this.init();
        }
    }

    init() {
        // Для всех устройств включаем эффект "полет сквозь фигурки"
        this.setupMobileStarfield();

        // Start animation loop
        this.animate();
    }

    animate() {
        const now = performance.now();

        // Единый эффект "летим сквозь элементы" для всех устройств
        this.animateMobile(now);

        requestAnimationFrame(() => this.animate());
    }

    // ===== DESKTOP PARALLAX =====
    animateDesktop(now) {
        // Если мышь вне hero-секции, не обновляем позиции
        if (!this.isMouseInside) {
            return;
        }

        // Smooth interpolation
        this.currentX += (this.mouseX - this.currentX) * 0.1;
        this.currentY += (this.mouseY - this.currentY) * 0.1;

        // Apply parallax to each item
        this.parallaxItems.forEach((item) => {
            const speed = parseFloat(item.dataset.speed) || 2;

            // Определяем, какие элементы только смещаются, а какие ещё и вращаются
            const classList = item.classList;
            const rotates = classList.contains('balloon') ||
                            classList.contains('heart') ||
                            classList.contains('logo-item');

            // Get item position
            const rect = item.getBoundingClientRect();
            const itemCenterX = rect.left + rect.width / 2;
            const itemCenterY = rect.top + rect.height / 2;

            // Get mouse position relative to viewport
            const heroRect = this.heroSection.getBoundingClientRect();
            const mouseScreenX = heroRect.left + heroRect.width / 2 + (this.currentX * heroRect.width);
            const mouseScreenY = heroRect.top + heroRect.height / 2 + (this.currentY * heroRect.height);

            // Calculate distance from mouse to item center
            const dx = mouseScreenX - itemCenterX;
            const dy = mouseScreenY - itemCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // ЭФФЕКТ ПРИТЯГИВАНИЯ С ОТТАЛКИВАНИЕМ
            const maxAttractDistance = 300; // радиус притягивания в пикселях
            const comfortDistance = 80; // комфортное расстояние, до которого притягиваются фигуры
            const minDistance = 50; // минимальное расстояние - зона отталкивания
            let attractX = 0;
            let attractY = 0;

            if (distance > comfortDistance && distance < maxAttractDistance) {
                // ПРИТЯГИВАНИЕ: фигура тянется к курсору, но не ближе comfortDistance
                const attractionStrength = (1 - distance / maxAttractDistance) * speed * 25;

                // Вектор от фигуры к курсору (нормализованный)
                const dirX = dx / distance;
                const dirY = dy / distance;

                attractX = dirX * attractionStrength;
                attractY = dirY * attractionStrength;
            } else if (distance <= comfortDistance && distance > minDistance) {
                // ЗОНА КОМФОРТА: фигура замедляется и останавливается
                // Слабая притягивающая сила, чтобы фигура не дрожала
                const gentleStrength = (distance - minDistance) / (comfortDistance - minDistance) * speed * 5;

                const dirX = dx / distance;
                const dirY = dy / distance;

                attractX = dirX * gentleStrength;
                attractY = dirY * gentleStrength;
            } else if (distance <= minDistance && distance > 0) {
                // ОТТАЛКИВАНИЕ: если курсор слишком близко, фигура отталкивается
                const repelStrength = (1 - distance / minDistance) * speed * 40;

                // Вектор от курсора к фигуре (обратное направление)
                const dirX = -dx / distance;
                const dirY = -dy / distance;

                attractX = dirX * repelStrength;
                attractY = dirY * repelStrength;
            }

            // Базовое смещение для не-вращающихся элементов + притяжение для всех
            const x = (rotates ? 0 : this.currentX * speed * 50) + attractX;
            const y = (rotates ? 0 : this.currentY * speed * 50) + attractY;

            // Shimmer threshold (in pixels) - closer = more shimmer
            const shimmerRadius = 150;

            // Apply shimmer effect based on distance
            if (distance < shimmerRadius) {
                const intensity = 1 - (distance / shimmerRadius);
                const brightness = 1 + (intensity * 0.4); // Max 1.4 brightness
                const saturation = 1 + (intensity * 0.5); // Max 1.5 saturation
                const glowSize = intensity * 25; // Max 25px glow

                item.style.filter = `brightness(${brightness}) saturate(${saturation}) drop-shadow(0 0 ${glowSize}px rgba(255, 255, 255, 0.8))`;
            } else {
                // Reset to default
                item.style.filter = 'drop-shadow(0 5px 15px rgba(0, 0, 0, 0.1))';
            }

            // Минимальный 3D‑поворот в сторону указателя (исправлено направление)
            const maxTilt = 5; // минимальный угол поворота в градусах
            const depthFactor = Math.min(speed / 2, 1.5);

            // Нормируем координаты
            const normX = this.currentX;
            const normY = this.currentY;

            // ИСПРАВЛЕНО: инвертированы знаки для правильного направления поворота
            const rotateY = normX * maxTilt * depthFactor; // вправо двигаем мышь — картинка поворачивается вправо
            const rotateX = -normY * maxTilt * depthFactor;  // вверх двигаем мышь — картинка наклоняется вверх

            // Применяем только смещение или смещение + 3D‑поворот
            let transform = `translate(${x}px, ${y}px)`;
            if (rotates) {
                transform += ` rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            }
            item.style.transform = transform;
        });
    }

    // ===== MOBILE STARFIELD EFFECT (используем как общий "полёт сквозь иконки") =====
    setupMobileStarfield() {
        // Увеличиваем количество фигурок: клонируем существующие элементы один раз
        const container = this.heroSection.querySelector('.parallax-container');
        if (container && !this._mobileClonesCreated) {
            const originals = Array.from(this.parallaxItems);
            originals.forEach((item) => {
                const clone = item.cloneNode(true);
                clone.classList.add('mobile-clone');
                container.appendChild(clone);
            });
            this._mobileClonesCreated = true;
            this.parallaxItems = this.heroSection.querySelectorAll('.parallax-item');
        }

        // Центруем все элементы и отключаем их собственные CSS-анимации/transition,
        // чтобы они не "тянулись" обратно к центру
        this.parallaxItems.forEach((item) => {
            item.style.setProperty('left', '50%', 'important');
            item.style.setProperty('top', '50%', 'important');
            item.style.transformOrigin = 'center center';
            item.style.transform = 'translate3d(0, 0, 0) scale(0.2)';
            item.style.transition = 'none';       // убираем плавный возврат к центру
            item.style.animation = 'none';        // отключаем heartBeat/noteBounce и т.п.
            item.style.opacity = '0';             // появление будет через fade-in
            item._star = null;                    // техническое поле для данных частицы
        });
    }

    resetMobileItem(item, randomPhase = false) {
        const heroRect = this.heroSection.getBoundingClientRect();

        // Максимальный радиус примерно до углов hero
        const maxEdgeRadius = Math.hypot(heroRect.width, heroRect.height) * 0.9;

        // Стартовый радиус: фигура появляется в любой области экрана, а не только в центре
        const maxStartRadius = Math.min(heroRect.width, heroRect.height) * 0.6; // до ~60% минимального размера
        const startRadius = Math.random() * maxStartRadius;

        // Конечный радиус: гарантированно дальше стартового, ближе к краю/за краем
        const endRadius = startRadius + (maxEdgeRadius - startRadius) * (0.7 + Math.random() * 0.3);

        // Направление полёта
        const angle = Math.random() * Math.PI * 2;

        // Время полёта — увеличиваем для более медленного движения
        const minTime = 3.0;
        const maxTime = 6.0;
        const duration = minTime + Math.random() * (maxTime - minTime);

        // Масштаб: маленькие при появлении, заметно крупнее у края
        const startScale = 0.18 + Math.random() * 0.12; // ~0.18–0.3
        const endScale = 1.7 + Math.random() * 0.9;     // ~1.7–2.6

        // Если randomPhase = true (первый кадр) — запускаем не с начала траектории,
        // а из случайного места на пути, чтобы не было одновременного старта
        const initialT = randomPhase ? Math.random() : 0;

        item._star = {
            angle,
            elapsed: initialT * duration,
            duration,
            startRadius,
            endRadius,
            startScale,
            endScale
        };

        // Стартовая позиция в любой точке траектории
        const eased = initialT * initialT * (3 - 2 * initialT);
        const radius = startRadius + (endRadius - startRadius) * eased;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const scale = startScale + (endScale - startScale) * eased;

        let opacity;
        if (initialT < 0.1) {
            opacity = initialT / 0.1;
        } else if (initialT > 0.8) {
            opacity = 1 - (initialT - 0.8) / 0.2;
        } else {
            opacity = 1;
        }

        item.style.opacity = opacity.toFixed(2);
        item.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    }

    animateMobile(now) {
        const dt = Math.min((now - this.lastTime) / 1000, 0.05) || 0.016;
        this.lastTime = now;

        // На первом кадре распределяем всем иконкам случайную фазу по траектории
        if (!this._initialPhaseAssigned) {
            this.parallaxItems.forEach((item) => {
                this.resetMobileItem(item, true);
            });
            this._initialPhaseAssigned = true;

            // Когда все иконки получили начальные траектории, плавно показываем слой
            if (this.heroSection) {
                this.heroSection.classList.add('parallax-ready');
            }
        }

        this.parallaxItems.forEach((item) => {
            if (!item._star) {
                // Если по какой-то причине данных нет — просто запускаем с начала
                this.resetMobileItem(item, false);
            }

            const p = item._star;
            p.elapsed += dt;

            // Нормализованное время полёта 0..1
            const t = Math.min(p.elapsed / p.duration, 1);
            // Плавное ускорение/замедление (smoothstep)
            const eased = t * t * (3 - 2 * t);

            // Радиус от случайной стартовой точки до края
            const radius = p.startRadius + (p.endRadius - p.startRadius) * eased;
            const x = Math.cos(p.angle) * radius;
            const y = Math.sin(p.angle) * radius;

            const scale = p.startScale + (p.endScale - p.startScale) * eased;

            // Плавное появление и исчезновение
            let opacity;
            if (t < 0.1) {
                // быстрый fade-in в начале
                opacity = t / 0.1;
            } else if (t > 0.8) {
                // fade-out на последних 20% жизни
                opacity = 1 - (t - 0.8) / 0.2;
            } else {
                opacity = 1;
            }

            item.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
            item.style.opacity = opacity.toFixed(2);

            // Когда фигура "упёрлась" в экран и исчезла — сразу запускаем её заново
            if (t >= 1) {
                this.resetMobileItem(item);
            }
        });
    }
}

// Initialize parallax effect when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ParallaxEffect();
    });
} else {
    new ParallaxEffect();
}
