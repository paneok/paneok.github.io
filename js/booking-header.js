/* Small page-specific header behavior for booking.html. */
document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.mobile-menu-btn');
    const menu = document.querySelector('.nav-menu');
    if (!button || !menu) return;

    button.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('active');
        button.textContent = isOpen ? '✕' : '☰';
        button.setAttribute('aria-expanded', String(isOpen));
    });
});
