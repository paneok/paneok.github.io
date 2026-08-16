// Particles Configuration with Confetti and Stars
function initParticles() {
    const heroSection = document.querySelector('.hero');
    const particlesContainer = document.getElementById('particles-container');
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Keep the interaction working when the optional CDN library is blocked
    // (common on a local server or with an ad blocker).
    if (typeof window.confetti === 'undefined') {
        window.confetti = ({ particleCount = 24, origin = { x: .5, y: .5 }, colors = ['#764ba2', '#ff6b9d', '#ffd700'], scalar = 1 } = {}) => {
            if (!document.body) return;
            if (!document.getElementById('local-confetti-styles')) {
                const style = document.createElement('style');
                style.id = 'local-confetti-styles';
                style.textContent = `
                    .local-confetti-piece { position: fixed; width: 8px; height: 12px; pointer-events: none; z-index: 1201; animation: local-confetti-fall var(--fall-time) ease-out forwards; }
                    @keyframes local-confetti-fall { to { opacity: 0; transform: translate3d(var(--dx), var(--dy), 0) rotate(var(--spin)); } }
                `;
                document.head.append(style);
            }
            const count = Math.min(80, Math.max(1, Math.round(particleCount)));
            for (let i = 0; i < count; i += 1) {
                const piece = document.createElement('i');
                const angle = Math.random() * Math.PI * 2;
                const distance = (80 + Math.random() * 220) * scalar;
                piece.className = 'local-confetti-piece';
                piece.style.left = `${origin.x * 100}%`;
                piece.style.top = `${origin.y * 100}%`;
                piece.style.background = colors[i % colors.length];
                piece.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
                piece.style.setProperty('--dy', `${Math.sin(angle) * distance + 140}px`);
                piece.style.setProperty('--spin', `${Math.round(Math.random() * 900 - 450)}deg`);
                piece.style.setProperty('--fall-time', `${1.1 + Math.random() * .8}s`);
                document.body.append(piece);
                window.setTimeout(() => piece.remove(), 2200);
            }
        };
    }

    // Touch devices still need the interactive burst on tap. Only the
    // continuous ambient stream is skipped there to avoid unnecessary work.
    if (!particlesContainer || typeof confetti === 'undefined' || !heroSection || prefersReducedMotion) {
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
    const interval = isTouchDevice ? null : setInterval(function() {
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
                zIndex: 1200
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
                zIndex: 1200
            });
        });

        if (interval) {
            window.addEventListener('beforeunload', () => clearInterval(interval), { once: true });
        }
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initParticles);
} else {
    initParticles();
}
