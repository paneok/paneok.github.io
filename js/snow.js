function initSnow() {
    if (!document.body.classList.contains('new-year-page')) return;

    const container = document.getElementById('snow-container');
    if (!container) return;

    const isMobile = window.innerWidth <= 768;

    // Отключаем снег на мобильных устройствах для оптимизации
    if (isMobile) return;

    const flakesCount = 220; // снежинки только для десктопа

    for (let i = 0; i < flakesCount; i++) {
        const flake = document.createElement('span');
        flake.className = 'snowflake';

        const size = 4 + Math.random() * 6; // 4–10 px, более заметные хлопья
        const left = Math.random() * 100;   // % по ширине
        const delay = Math.random() * 10;   // более частые волны снега
        const duration = isMobile
            ? 6 + Math.random() * 4   // 6–10 c на мобильных
            : 7 + Math.random() * 5;  // 7–12 c на десктопе
        const drift = (Math.random() - 0.5) * 220; // хаотичный снос по горизонтали -110..110 px

        flake.style.width = `${size}px`;
        flake.style.height = `${size}px`;
        flake.style.left = `${left}%`;
        flake.style.animationDelay = `${delay}s`;
        flake.style.animationDuration = `${duration}s`;
        flake.style.opacity = (0.3 + Math.random() * 0.7).toFixed(2);
        flake.style.setProperty('--snow-x', `${drift}px`);

        container.appendChild(flake);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSnow);
} else {
    initSnow();
}
