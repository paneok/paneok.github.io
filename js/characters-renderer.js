// Characters Renderer - Loads and displays character cards
class CharactersRenderer {
    constructor() {
        this.characters = [];
        this.filteredCharacters = [];
        this.container = document.getElementById('characters-grid');
        this.resultsCounter = document.getElementById('results-count');
        this.displayedCount = 0;
        this.itemsPerPage = 30;
        this.loadMoreButton = null;

        this.initLoadMoreButton();
    }

    // Initialize "Show more" button
    initLoadMoreButton() {
        if (!this.container) return;

        // Try to reuse existing button if it was added to markup
        let button = document.getElementById('load-more-characters');

        if (!button) {
            button = document.createElement('button');
            button.id = 'load-more-characters';
            button.className = 'btn btn-outline characters-load-more';
            button.textContent = 'Показать ещё';

            const parent = this.container.parentElement;
            if (parent) {
                parent.appendChild(button);
            }
        }

        // Avoid attaching multiple listeners
        if (!button._charactersLoadMoreInit) {
            button.addEventListener('click', () => this.showMore());
            button._charactersLoadMoreInit = true;
        }

        this.loadMoreButton = button;
        this.loadMoreButton.style.display = 'none';
    }

    // Load characters data from JSON
    async loadCharacters() {
        try {
            console.log('Loading characters from API...');
            // Используем API клиент вместо прямого fetch
            const data = await window.apiClient.getCharacters();
            console.log('Characters loaded from API:', data.length);
            this.characters = data;
            this.filteredCharacters = [...this.characters];
            console.log('Total characters:', this.characters.length);
            return this.characters;
        } catch (error) {
            console.error('Error loading characters:', error);
            this.showError();
            return [];
        }
    }

    // Render characters with pagination
    renderCharacters(characters = this.filteredCharacters, options = {}) {
        if (!characters) {
            characters = [];
        }

        const { resetVisible = true, appendFrom = null } = options;

        console.log('Rendering characters (total):', characters.length);
        console.log('Container found:', !!this.container);
        
        if (!this.container) {
            console.error('Characters container not found!');
            return;
        }

        // Reset visible count on new data (filters/sorting/etc.)
        if (resetVisible) {
            this.displayedCount = Math.min(this.itemsPerPage, characters.length);
        } else {
            // Make sure displayedCount is in valid range
            this.displayedCount = Math.min(this.displayedCount || 0, characters.length);
            if (this.displayedCount === 0 && characters.length > 0) {
                this.displayedCount = Math.min(this.itemsPerPage, characters.length);
            }
        }

        // Update counter (total found, not only visible)
        if (this.resultsCounter) {
            this.resultsCounter.textContent = characters.length;
        }

        // Show empty state if no characters
        if (characters.length === 0) {
            console.log('No characters to render, showing empty state');
            this.container.innerHTML = '';
            this.showEmptyState();
            this.updateLoadMoreButton(0);
            return;
        }

        // Clear container only when fully rerendering
        if (resetVisible || appendFrom === null) {
            this.container.innerHTML = '';
        }

        const fromIndex = appendFrom !== null ? appendFrom : 0;
        const visibleCharacters = characters.slice(fromIndex, this.displayedCount);
        console.log('Rendering', visibleCharacters.length, 'character cards (visible), from index', fromIndex);

        visibleCharacters.forEach((character, index) => {
            const card = this.createCharacterCard(character, fromIndex + index);
            this.container.appendChild(card);
        });

        this.updateLoadMoreButton(characters.length);

        console.log('Character cards rendered with pagination');
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

        // Количество фото: считаем уникальные пути main + gallery (как в модальном окне)
        let photoCount = 0;
        if (character.images) {
            const sources = [];
            if (character.images.main) sources.push(character.images.main);
            if (character.images.gallery && Array.isArray(character.images.gallery)) {
                sources.push(...character.images.gallery);
            }
            const uniqueSources = [...new Set(sources)];
            photoCount = uniqueSources.length;
        }

        card.innerHTML = `
            <div class="character-image-container">
                ${badges.length > 0 ? `<div class="character-badges">${badges.join('')}</div>` : ''}

                ${photoCount > 1 ? `
                    <div class="character-photo-counter">
                        <span class="character-photo-counter-text">${photoCount}</span>
                    </div>
                ` : ''}

                <!-- Simple Gallery without Swiper -->
                <div class="character-image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);">
                    <img src="${character.images.main}" alt="${character.name}" class="character-photo" loading="lazy" decoding="async">
                </div>

                <div class="character-overlay">
                    <button class="btn btn-select" data-character-id="${character.id}">
                        <span class="btn-select-checkbox">✓</span>
                        <span class="btn-select-text">Выбрать</span>
                    </button>
                </div>
            </div>

            <div class="character-info">
                <div class="character-header">
                    <h3 class="character-name">${character.name}</h3>
                </div>
                <p class="character-description">${character.description.short}</p>

                <div class="character-meta">
                    <div class="character-features">
                        <span class="feature-tag">
                            <span class="feature-icon">👶</span>
                            ${character.features.age} лет
                        </span>
                        <span class="feature-tag">
                            <span class="feature-icon">👫</span>
                            ${this.getGenderLabel(character.features.gender)}
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

        // Add click event for select buttons (both overlay and inline)
        const selectBtns = card.querySelectorAll('.btn-select');
        selectBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSelection(character, btn);
            });
        });

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

    // Get gender label in Russian
    getGenderLabel(gender) {
        const labels = {
            'boys': 'Для мальчиков',
            'girls': 'Для девочек',
            'unisex': 'Для всех'
        };
        return labels[gender] || 'Для всех';
    }

    // Toggle character selection
    toggleSelection(character, button) {
        if (!window.selectedCharacters) {
            window.selectedCharacters = new Set();
        }

        const characterId = character.id;
        const card = button.closest('.character-card');

        if (window.selectedCharacters.has(characterId)) {
            // Deselect
            window.selectedCharacters.delete(characterId);
            card.classList.remove('selected');
            // Update all buttons for this character
            const allBtns = card.querySelectorAll('.btn-select');
            allBtns.forEach(btn => {
                btn.classList.remove('selected');
                btn.querySelector('.btn-select-text').textContent = 'Выбрать';
            });
        } else {
            // Select
            window.selectedCharacters.add(characterId);
            card.classList.add('selected');
            // Update all buttons for this character
            const allBtns = card.querySelectorAll('.btn-select');
            allBtns.forEach(btn => {
                btn.classList.add('selected');
                btn.querySelector('.btn-select-text').textContent = 'Выбрано';
            });
        }

        // Передаем выбранного персонажа в ProgramsRenderer (основной = первый в Set)
        if (window.programsRenderer && typeof window.programsRenderer.setSelectedCharacter === 'function') {
            const selectedIds = Array.from(window.selectedCharacters);
            if (selectedIds.length > 0) {
                const mainId = selectedIds[0];
                const mainCharacter = this.characters.find(c => c.id === mainId) || null;
                window.programsRenderer.setSelectedCharacter(mainCharacter);
            } else {
                // Если персонажей больше нет, сбрасываем выбор
                window.programsRenderer.setSelectedCharacter(null);
            }
        }

        // Update selection panel
        this.updateSelectionPanel();
    }

    // Update the selection panel at the bottom
    updateSelectionPanel() {
        const hasCharacters = window.selectedCharacters && window.selectedCharacters.size > 0;
        const hasPrograms = window.selectedPrograms && window.selectedPrograms.size > 0;

        if (!hasCharacters && !hasPrograms) {
            // Hide panel if no selections
            const panel = document.getElementById('selection-panel');
            if (panel) {
                panel.classList.remove('active');
            }
            return;
        }

        // Get or create panel
        let panel = document.getElementById('selection-panel');
        if (!panel) {
            panel = this.createSelectionPanel();
            document.body.appendChild(panel);
        }

        // Use programs renderer to format selection text if available
        let selectionText = '';
        if (window.programsRenderer && typeof window.programsRenderer.formatSelectionText === 'function') {
            selectionText = window.programsRenderer.formatSelectionText();
        } else {
            // Fallback: just show character names
            const characterNames = Array.from(window.selectedCharacters)
                .map(id => {
                    const char = this.characters.find(c => c.id === id);
                    return char ? char.name : null;
                })
                .filter(name => name !== null);
            selectionText = `Персонажи: ${characterNames.join(', ')}`;
        }

        // Update panel content
        const namesContainer = panel.querySelector('.selection-names');
        namesContainer.textContent = selectionText;

        // Show panel
        panel.classList.add('active');
    }

    // Create selection panel
    createSelectionPanel() {
        const panel = document.createElement('div');
        panel.id = 'selection-panel';
        panel.className = 'selection-panel';
        panel.innerHTML = `
            <div class="selection-panel-content">
                <div class="selection-info">
                    <strong>Вы выбрали:</strong>
                    <span class="selection-names"></span>
                </div>
                <button class="btn btn-primary selection-continue">
                    Продолжить
                </button>
            </div>
        `;

        // Add click handler for continue button
        const continueBtn = panel.querySelector('.selection-continue');
        continueBtn.addEventListener('click', () => {
            const programsSection = document.getElementById('programs');
            if (programsSection) {
                programsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });

        return panel;
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
        this.updateLoadMoreButton(0);
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
        this.updateLoadMoreButton(0);
    }

    // Show more characters (load next page)
    showMore() {
        if (!this.filteredCharacters || this.filteredCharacters.length === 0) return;

        const totalCount = this.filteredCharacters.length;
        const previousCount = this.displayedCount || 0;
        this.displayedCount = Math.min(previousCount + this.itemsPerPage, totalCount);
        this.renderCharacters(this.filteredCharacters, { resetVisible: false, appendFrom: previousCount });
    }

    // Update state of the "Show more" button
    updateLoadMoreButton(totalCount) {
        if (!this.loadMoreButton) return;

        if (totalCount > this.displayedCount) {
            this.loadMoreButton.style.display = 'block';
        } else {
            this.loadMoreButton.style.display = 'none';
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
window.charactersRenderer = charactersRenderer;
