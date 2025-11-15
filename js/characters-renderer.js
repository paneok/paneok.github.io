// Characters Renderer - Loads and displays character cards
class CharactersRenderer {
    constructor() {
        this.characters = [];
        this.filteredCharacters = [];
        this.container = document.getElementById('characters-grid');
        this.resultsCounter = document.getElementById('results-count');
    }

    // Load characters data from JSON
    async loadCharacters() {
        try {
            console.log('Loading characters...');
            const response = await fetch('data/characters-data.json');
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Data loaded:', data);
            this.characters = data.characters;
            this.filteredCharacters = [...this.characters];
            console.log('Characters loaded:', this.characters.length);
            return this.characters;
        } catch (error) {
            console.error('Error loading characters:', error);
            this.showError();
            return [];
        }
    }

    // Render all filtered characters
    renderCharacters(characters = this.filteredCharacters) {
        console.log('Rendering characters:', characters.length);
        console.log('Container found:', !!this.container);
        
        if (!this.container) {
            console.error('Characters container not found!');
            return;
        }

        // Clear container
        this.container.innerHTML = '';

        // Update counter
        if (this.resultsCounter) {
            this.resultsCounter.textContent = characters.length;
        }

        // Show empty state if no characters
        if (characters.length === 0) {
            console.log('No characters to render, showing empty state');
            this.showEmptyState();
            return;
        }

        console.log('Rendering', characters.length, 'character cards');
        // Render each character
        characters.forEach((character, index) => {
            const card = this.createCharacterCard(character, index);
            this.container.appendChild(card);
        });

        console.log('All character cards rendered');
        // Swiper initialization temporarily disabled
        // setTimeout(() => this.initializeSwiper(), 100);
    }

    // Create a character card element
    createCharacterCard(character, index) {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.setAttribute('data-character-id', character.id);
        card.style.animationDelay = `${index * 0.05}s`;

        console.log('Creating card for:', character.name);

        // Badges
        const badges = [];
        if (character.isNew) badges.push('<span class="badge badge-new">Новинка</span>');
        if (character.isPopular) badges.push('<span class="badge badge-popular">Популярно</span>');

        card.innerHTML = `
            <div class="character-image-container">
                ${badges.length > 0 ? `<div class="character-badges">${badges.join('')}</div>` : ''}

                <!-- Simple Gallery without Swiper -->
                <div class="character-image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);">
                    <img src="${character.images.main}" alt="${character.name}" class="character-photo"
                         onerror="this.parentNode.querySelector('.character-emoji').style.display='flex'; this.style.display='none';">
                    <span class="character-emoji">${character.emoji}</span>
                </div>

                <div class="character-overlay">
                    <button class="btn btn-secondary btn-order" data-character-id="${character.id}">
                        Заказать
                    </button>
                </div>
            </div>

            <div class="character-info">
                <h3 class="character-name">${character.name}</h3>
                <p class="character-description">${character.description.short}</p>

                <div class="character-meta">
                    <div class="character-features">
                        <span class="feature-tag">
                            <span class="feature-icon">👶</span>
                            ${character.features.age} лет
                        </span>
                        <span class="feature-tag">
                            <span class="feature-icon">🎮</span>
                            ${this.getActivityLabel(character.features.activities[0])}
                        </span>
                    </div>
                </div>

                <div class="character-footer">
                    <div class="character-price">
                        <span class="price-label">от</span>
                        <span class="price-amount">${character.pricing.hourly}</span>
                        <span class="price-currency">₽/час</span>
                    </div>
                    ${character.pricing.packages && character.pricing.packages.length > 0 ? `
                        <div class="character-package">
                            ${character.pricing.packages[0].duration} часа: ${character.pricing.packages[0].price}₽
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        // Add click event for order button
        const orderBtn = card.querySelector('.btn-order');
        if (orderBtn) {
            orderBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleOrder(character);
            });
        }

        return card;
    }

    // Initialize Swiper for all galleries
    initializeSwiper() {
        if (typeof Swiper === 'undefined') {
            console.warn('Swiper library not loaded');
            return;
        }

        const swipers = document.querySelectorAll('.character-swiper');
        swipers.forEach((swiperEl, index) => {
            // Generate unique identifiers for each swiper instance
            const paginationId = `swiper-pagination-${index}`;
            const nextBtnId = `swiper-button-next-${index}`;
            const prevBtnId = `swiper-button-prev-${index}`;
            
            // Update HTML to use unique IDs
            const paginationEl = swiperEl.querySelector('.swiper-pagination');
            const nextBtnEl = swiperEl.querySelector('.swiper-button-next');
            const prevBtnEl = swiperEl.querySelector('.swiper-button-prev');
            
            if (paginationEl) paginationEl.id = paginationId;
            if (nextBtnEl) nextBtnEl.id = nextBtnId;
            if (prevBtnEl) prevBtnEl.id = prevBtnId;

            new Swiper(swiperEl, {
                loop: true,
                pagination: {
                    el: `#${paginationId}`,
                    clickable: true,
                },
                navigation: {
                    nextEl: `#${nextBtnId}`,
                    prevEl: `#${prevBtnId}`,
                },
                autoplay: false,
                speed: 400,
            });
        });
    }

    // Get activity label in Russian
    getActivityLabel(activity) {
        const labels = {
            'active': 'Активные игры',
            'creative': 'Творчество',
            'magic': 'Фокусы',
            'dance': 'Танцы',
            'quest': 'Квесты'
        };
        return labels[activity] || activity;
    }

    // Handle order button click
    handleOrder(character) {
        // Scroll to contact form
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });

            // Pre-fill the form message
            const textarea = document.querySelector('.contact-form textarea');
            if (textarea) {
                textarea.value = `Здравствуйте! Хочу заказать аниматора "${character.name}" для праздника.`;
                textarea.focus();
            }
        }
    }

    // Show error message
    showError() {
        if (this.container) {
            this.container.innerHTML = `
                <div class="error-message">
                    <p>⚠️ Ошибка загрузки персонажей</p>
                    <button class="btn btn-primary" onclick="location.reload()">Обновить страницу</button>
                </div>
            `;
        }
    }

    // Show empty state
    showEmptyState() {
        if (this.container) {
            this.container.innerHTML = `
                <div class="empty-state">
                    <p>😔 Персонажи не найдены</p>
                    <p>Попробуйте изменить фильтры</p>
                </div>
            `;
        }
    }

    // Sort characters
    sortCharacters(sortBy) {
        switch (sortBy) {
            case 'popular':
                this.filteredCharacters.sort((a, b) => {
                    if (a.isPopular && !b.isPopular) return -1;
                    if (!a.isPopular && b.isPopular) return 1;
                    return 0;
                });
                break;
            case 'price-asc':
                this.filteredCharacters.sort((a, b) => a.pricing.hourly - b.pricing.hourly);
                break;
            case 'price-desc':
                this.filteredCharacters.sort((a, b) => b.pricing.hourly - a.pricing.hourly);
                break;
            case 'name':
                this.filteredCharacters.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
                break;
        }
        this.renderCharacters();
    }
}

// Create global instance
const charactersRenderer = new CharactersRenderer();
