// Particles Configuration with Confetti and Stars
function initParticles() {
    const heroSection = document.querySelector('.hero');
    const particlesContainer = document.getElementById('particles-container');

    if (!particlesContainer || typeof confetti === 'undefined') {
        console.warn('Particles container or confetti library not found');
        return;
    }

    // Configuration for continuous confetti effect
    const duration = 60 * 1000; // 60 seconds
    const animationEnd = Date.now() + duration;
    const defaults = {
        startVelocity: 15,
        spread: 360,
        ticks: 100,
        zIndex: 0,
        disableForReducedMotion: true
    };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Create continuous confetti particles (background ambient)
    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 2; // Reduced for background

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
            scalar: randomInRange(0.4, 0.8),
            drift: randomInRange(-0.4, 0.4)
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
            scalar: randomInRange(0.5, 1),
            drift: randomInRange(-0.3, 0.3)
        });

    }, 600); // Slower for background effect

    // Restart particles after duration
    setTimeout(() => {
        initParticles();
    }, duration);

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

        // Mouse move creates trailing confetti
        let lastMouseMove = 0;
        heroSection.addEventListener('mousemove', function(e) {
            const now = Date.now();
            // Throttle to every 200ms
            if (now - lastMouseMove < 200) return;
            lastMouseMove = now;

            const rect = heroSection.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            // Small trailing effect on mouse move
            confetti({
                particleCount: 3,
                spread: 30,
                origin: { x, y },
                colors: ['#667eea', '#f093fb', '#ffd700'],
                shapes: ['circle'],
                scalar: randomInRange(0.3, 0.6),
                startVelocity: 10,
                ticks: 50,
                gravity: 0.8,
                zIndex: 0
            });
        });

        // Extra burst when entering hero section
        heroSection.addEventListener('mouseenter', function(e) {
            const rect = heroSection.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            confetti({
                particleCount: 30,
                spread: 60,
                origin: { x, y },
                colors: ['#667eea', '#764ba2', '#f093fb', '#ff6b9d', '#ffd700'],
                shapes: ['circle', 'square', 'star'],
                scalar: randomInRange(0.6, 1.2),
                startVelocity: 25,
                ticks: 100,
                zIndex: 0
            });
        });
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initParticles);
} else {
    initParticles();
}
