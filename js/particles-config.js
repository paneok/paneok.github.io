// Particles Configuration with Confetti and Stars
function initParticles() {
    const heroSection = document.querySelector('.hero');
    const particlesContainer = document.getElementById('particles-container');
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!particlesContainer || typeof confetti === 'undefined' || !heroSection || isTouchDevice || prefersReducedMotion) {
        console.warn('Particles container or confetti library not found');
        return;
    }

    if (window.__particlesInitialized) {
        return;
    }
    window.__particlesInitialized = true;

    // Configuration for continuous confetti effect
    const defaults = {
        startVelocity: 12,
        spread: 360,
        ticks: 80,
        zIndex: 0,
        disableForReducedMotion: true
    };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Create continuous confetti particles (background ambient)
    const interval = setInterval(function() {
        if (document.hidden) {
            return;
        }

        const particleCount = 1;

        // Launch confetti from random positions
        confetti({
            ...defaults,
            particleCount,
            origin: {
                x: randomInRange(0.1, 0.9),
                y: Math.random() - 0.2
            },
            colors: ['#667eea', '#764ba2', '#f093fb', '#ff6b9d', '#ffd700', '#ff8fab'],
            shapes: ['circle', 'square'],
            scalar: randomInRange(0.35, 0.65),
            drift: randomInRange(-0.25, 0.25)
        });

        // Add some stars
        confetti({
            ...defaults,
            particleCount: 1,
            origin: {
                x: randomInRange(0.1, 0.9),
                y: Math.random() - 0.2
            },
            colors: ['#ffd700', '#fff', '#ffed4e'],
            shapes: ['star'],
            scalar: randomInRange(0.45, 0.8),
            drift: randomInRange(-0.2, 0.2)
        });

    }, 1200);

    // ==================== INTERACTIVE EFFECTS ====================

    // Click anywhere on hero section for confetti burst
    if (heroSection) {
        heroSection.addEventListener('click', function(e) {
            const rect = heroSection.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            // Big confetti explosion at click position
            confetti({
                particleCount: 50,
                spread: 80,
                origin: { x, y },
                colors: ['#667eea', '#764ba2', '#f093fb', '#ff6b9d', '#ffd700', '#ff8fab', '#f5576c'],
                shapes: ['circle', 'square'],
                scalar: randomInRange(0.8, 1.5),
                startVelocity: 30,
                ticks: 120,
                zIndex: 0
            });

            // Add stars burst
            confetti({
                particleCount: 20,
                spread: 100,
                origin: { x, y },
                colors: ['#ffd700', '#fff', '#ffed4e'],
                shapes: ['star'],
                scalar: randomInRange(1, 2),
                startVelocity: 35,
                ticks: 150,
                zIndex: 0
            });
        });

        window.addEventListener('beforeunload', () => clearInterval(interval), { once: true });
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initParticles);
} else {
    initParticles();
}
