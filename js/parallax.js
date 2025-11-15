// Parallax Mouse Movement Effect
class ParallaxEffect {
    constructor() {
        this.heroSection = document.querySelector('.hero');
        this.parallaxItems = document.querySelectorAll('.parallax-item');
        this.mouseX = 0;
        this.mouseY = 0;
        this.currentX = 0;
        this.currentY = 0;

        if (this.heroSection && this.parallaxItems.length > 0) {
            this.init();
        }
    }

    init() {
        // Mouse move event
        this.heroSection.addEventListener('mousemove', (e) => {
            const rect = this.heroSection.getBoundingClientRect();
            this.mouseX = (e.clientX - rect.left - rect.width / 2) / rect.width;
            this.mouseY = (e.clientY - rect.top - rect.height / 2) / rect.height;
        });

        // Mouse leave event - return to center
        this.heroSection.addEventListener('mouseleave', () => {
            this.mouseX = 0;
            this.mouseY = 0;
        });

        // Start animation loop
        this.animate();
    }

    animate() {
        // Smooth interpolation
        this.currentX += (this.mouseX - this.currentX) * 0.1;
        this.currentY += (this.mouseY - this.currentY) * 0.1;

        // Apply parallax to each item
        this.parallaxItems.forEach((item) => {
            const speed = parseFloat(item.dataset.speed) || 2;
            const x = this.currentX * speed * 50; // 50px max movement
            const y = this.currentY * speed * 50;

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

            // Apply parallax movement
            item.style.transform = `translate(${x}px, ${y}px)`;
        });

        requestAnimationFrame(() => this.animate());
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
