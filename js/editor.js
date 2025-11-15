// ==================== CHARACTER EDITOR ====================
class CharacterEditor {
    constructor() {
        this.characters = [];
        this.currentCharacter = null;
        this.currentIndex = -1;
        this.init();
    }

    async init() {
        await this.loadCharacters();
        this.renderCharactersList();
        this.setupEventListeners();
        this.updateCount();
    }

    async loadCharacters() {
        try {
            const response = await fetch('data/characters-data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Поддержка разных форматов JSON
            if (Array.isArray(data)) {
                this.characters = data;
            } else if (data.characters && Array.isArray(data.characters)) {
                this.characters = data.characters;
            } else {
                this.characters = [];
            }

            console.log('Loaded characters:', this.characters.length);
        } catch (error) {
            console.error('Error loading characters:', error);
            console.log('Starting with empty character list');
            this.characters = [];

            // Show error notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                background: #ff9800;
                color: white;
                padding: 1rem 2rem;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                z-index: 10000;
                max-width: 400px;
            `;
            notification.innerHTML = `
                <strong>⚠️ Ошибка загрузки данных</strong><br>
                <small>Файл data/characters-data.json не найден или недоступен.<br>
                Вы можете начать с пустого каталога.</small>
            `;
            document.body.appendChild(notification);

            setTimeout(() => notification.remove(), 5000);
        }
    }

    setupEventListeners() {
        // Add character button
        document.getElementById('add-character-btn').addEventListener('click', () => {
            this.openModal();
        });

        // Sort buttons
        document.getElementById('sort-rating-btn').addEventListener('click', () => {
            this.sortByRating();
        });

        document.getElementById('sort-name-btn').addEventListener('click', () => {
            this.sortByName();
        });

        document.getElementById('sort-manual-btn').addEventListener('click', () => {
            this.enableManualSort();
        });

        // Search
        document.getElementById('search-editor').addEventListener('input', (e) => {
            this.filterCharacters(e.target.value);
        });

        // Save all button
        document.getElementById('save-all-btn').addEventListener('click', () => {
            this.saveAll();
        });

        // Export JSON button
        document.getElementById('export-json-btn').addEventListener('click', () => {
            this.exportJSON();
        });

        // Import JSON button
        document.getElementById('import-json-input').addEventListener('change', (e) => {
            this.importJSON(e.target.files[0]);
        });

        // Modal controls
        document.getElementById('modal-close-btn').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.closeModal();
        });

        document.querySelector('.editor-modal-overlay').addEventListener('click', () => {
            this.closeModal();
        });

        // Form submission
        document.getElementById('character-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCharacter();
        });

        // Delete character
        document.getElementById('delete-character-btn').addEventListener('click', () => {
            this.deleteCharacter();
        });

        // Add package button
        document.getElementById('add-package-btn').addEventListener('click', () => {
            this.addPackageField();
        });

        // Add gallery image button
        document.getElementById('add-gallery-image-btn').addEventListener('click', () => {
            this.addGalleryImageField();
        });

        // Main image preview
        document.getElementById('char-main-image').addEventListener('input', (e) => {
            this.updateMainImagePreview(e.target.value);
        });
    }

    renderCharactersList() {
        const container = document.getElementById('characters-list');

        if (this.characters.length === 0) {
            container.innerHTML = '<div class="loading-message">Персонажи не найдены. Добавьте первого персонажа!</div>';
            return;
        }

        // Табличный вид: каждая строка = один персонаж
        const headerHtml = `
            <div class="editor-table">
                <div class="editor-table-header">
                    <div class="editor-cell cell-handle">#</div>
                    <div class="editor-cell cell-name">Имя</div>
                    <div class="editor-cell cell-desc">Краткое описание</div>
                    <div class="editor-cell cell-price">Цена, ₽/ч</div>
                    <div class="editor-cell cell-age">Возраст (фильтр)</div>
                    <div class="editor-cell cell-gender">Пол</div>
                    <div class="editor-cell cell-activities">Активности (фильтр)</div>
                    <div class="editor-cell cell-category">Категория</div>
                    <div class="editor-cell cell-flags">Метки</div>
                    <div class="editor-cell cell-actions">Действия</div>
                </div>
                <div class="editor-table-body">
        `;

        const ageOptions = [
            { value: '0-3', label: '0-3' },
            { value: '3-5', label: '3-5' },
            { value: '5-8', label: '5-8' },
            { value: '8-12', label: '8-12' },
            { value: '12+', label: '12+' }
        ];

        const activitiesOptions = [
            { value: 'active', label: 'Активные игры' },
            { value: 'creative', label: 'Творчество' },
            { value: 'magic', label: 'Фокусы' },
            { value: 'dance', label: 'Танцы' },
            { value: 'quest', label: 'Квесты' }
        ];

        const bodyHtml = this.characters.map((char, index) => {
            const ageSummary = this.formatAgeSummary(char.features?.age || '');
            const checkedAges = this.getAgeFilterValuesForCharacter(char.features?.age || '');

            const ageCheckboxesHtml = ageOptions.map(opt => `
                <label class="editor-filter-checkbox">
                    <input type="checkbox" value="${opt.value}" ${checkedAges.includes(opt.value) ? 'checked' : ''}>
                    <span>${opt.label}</span>
                </label>
            `).join('');

            const currentActivities = Array.isArray(char.features?.activities) ? char.features.activities : [];
            const activitiesSummary = this.formatActivitiesSummary(currentActivities, activitiesOptions);

            const activitiesCheckboxesHtml = activitiesOptions.map(opt => `
                <label class="editor-filter-checkbox">
                    <input type="checkbox" value="${opt.value}" ${currentActivities.includes(opt.value) ? 'checked' : ''}>
                    <span>${opt.label}</span>
                </label>
            `).join('');

            return `
                <div class="editor-row" data-index="${index}" draggable="true">
                    <div class="editor-cell cell-handle">
                        <span class="drag-handle" title="Перетащите для изменения порядка">☰</span>
                        <span class="row-index">${index + 1}</span>
                    </div>
                    <div class="editor-cell cell-name">
                        <input type="text" class="cell-input cell-input-text" data-field="name" value="${char.name || ''}">
                    </div>
                    <div class="editor-cell cell-desc">
                        <textarea class="cell-input cell-input-textarea" rows="2" data-field="description.short">${char.description?.short || ''}</textarea>
                    </div>
                    <div class="editor-cell cell-price">
                        <input type="number" class="cell-input cell-input-number" data-field="pricing.hourly" min="0" value="${char.pricing?.hourly || 0}">
                    </div>
                    <div class="editor-cell cell-age">
                        <div class="editor-filter-spoiler" data-type="age">
                            <button type="button" class="editor-filter-toggle">Возраст</button>
                            <div class="editor-filter-summary">${ageSummary || 'не задан'}</div>
                            <div class="editor-filter-body">
                                ${ageCheckboxesHtml}
                            </div>
                        </div>
                    </div>
                    <div class="editor-cell cell-gender">
                        <select class="cell-input cell-input-select" data-field="features.gender">
                            <option value="unisex" ${char.features?.gender === 'unisex' ? 'selected' : ''}>Для всех</option>
                            <option value="boys" ${char.features?.gender === 'boys' ? 'selected' : ''}>Для мальчиков</option>
                            <option value="girls" ${char.features?.gender === 'girls' ? 'selected' : ''}>Для девочек</option>
                        </select>
                    </div>
                    <div class="editor-cell cell-activities">
                        <div class="editor-filter-spoiler" data-type="activities">
                            <button type="button" class="editor-filter-toggle">Активности</button>
                            <div class="editor-filter-summary">${activitiesSummary || 'не заданы'}</div>
                            <div class="editor-filter-body">
                                ${activitiesCheckboxesHtml}
                            </div>
                        </div>
                    </div>
                    <div class="editor-cell cell-category">
                        <input type="text" class="cell-input cell-input-text" data-field="category" value="${char.category || ''}">
                    </div>
                    <div class="editor-cell cell-flags">
                        <label class="editor-flag">
                            <input type="checkbox" class="editor-flag-input" data-field="isNew" ${char.isNew ? 'checked' : ''}>
                            <span>🆕</span>
                        </label>
                        <label class="editor-flag">
                            <input type="checkbox" class="editor-flag-input" data-field="isPopular" ${char.isPopular ? 'checked' : ''}>
                            <span>⭐</span>
                        </label>
                    </div>
                    <div class="editor-cell cell-actions">
                        <button class="btn btn-accent btn-xs full-edit-btn" data-index="${index}" title="Открыть полное редактирование">⚙️</button>
                        <button class="btn btn-primary btn-xs row-save-btn" data-index="${index}" title="Сохранить изменения по строке">💾</button>
                        <button class="btn btn-danger btn-xs delete-btn" data-index="${index}" title="Удалить персонажа">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');

        const footerHtml = `
                </div>
            </div>
        `;

        container.innerHTML = headerHtml + bodyHtml + footerHtml;

        // Кнопки действий в строках
        container.querySelectorAll('.full-edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                this.openModal(index);
            });
        });

        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                this.deleteCharacterInline(index);
            });
        });

        container.querySelectorAll('.row-save-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                this.saveRowChanges(index);
            });
        });

        // Спойлеры фильтров (возраст)
        this.setupFilterSpoilers();

        // Drag & drop для изменения порядка
        this.setupDragAndDrop();
    }

    // --- Старый механизм inline-редактирования имени больше не используется, но оставляем на случай отката ---
    setupInlineEditListeners() {}

    // ====== Хелперы для табличного редактора ======

    formatAgeSummary(ageStr) {
        if (!ageStr) return '';
        return ageStr;
    }

    formatActivitiesSummary(activities, options) {
        if (!Array.isArray(activities) || activities.length === 0) return '';
        const labelsByValue = new Map(options.map(o => [o.value, o.label]));
        return activities
            .map(a => labelsByValue.get(a) || a)
            .join(', ');
    }

    getAgeFilterValuesForCharacter(ageStr) {
        const filterRanges = ['0-3', '3-5', '5-8', '8-12', '12+'];
        if (!ageStr) return [];
        return filterRanges.filter(r => this.matchesAgeRangeForEditor(ageStr, r));
    }

    matchesAgeRangeForEditor(charAge, filterAge) {
        // Логика аналогична CharactersFilter.matchesAgeRange
        if (!charAge) return false;

        // charAge формат: "5-10" или "3-12"
        const charAges = charAge.split('-').map(a => parseInt(a.trim()));
        const charMin = charAges[0];
        const charMax = charAges[1] || charAges[0];

        if (Number.isNaN(charMin) || Number.isNaN(charMax)) {
            return false;
        }

        // filterAge формат: "0-3", "3-5", ... или "12+"
        if (filterAge === '12+') {
            return charMax >= 12;
        }

        const filterAges = filterAge.split('-').map(a => parseInt(a.trim()));
        const filterMin = filterAges[0];
        const filterMax = filterAges[1];

        return charMax >= filterMin && charMin <= filterMax;
    }

    buildAgeFromSelectedFilters(selectedRanges) {
        if (!selectedRanges || selectedRanges.length === 0) return '';

        let minAge = Infinity;
        let maxAge = -Infinity;

        selectedRanges.forEach(range => {
            if (range === '12+') {
                // Приблизительно считаем как диапазон, начинающийся с 12
                minAge = Math.min(minAge, 12);
                maxAge = Math.max(maxAge, 12);
            } else {
                const [minStr, maxStr] = range.split('-');
                const min = parseInt(minStr.trim());
                const max = parseInt(maxStr.trim());
                if (!Number.isNaN(min)) minAge = Math.min(minAge, min);
                if (!Number.isNaN(max)) maxAge = Math.max(maxAge, max);
            }
        });

        if (!Number.isFinite(minAge)) return '';
        if (!Number.isFinite(maxAge) || maxAge < minAge) {
            return String(minAge);
        }
        return minAge === maxAge ? String(minAge) : `${minAge}-${maxAge}`;
    }

    setupFilterSpoilers() {
        const spoilers = document.querySelectorAll('.editor-filter-spoiler');

        spoilers.forEach(spoiler => {
            const toggle = spoiler.querySelector('.editor-filter-toggle');
            const body = spoiler.querySelector('.editor-filter-body');
            if (!toggle || !body) return;

            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                spoiler.classList.toggle('open');
            });

            // Обновление текста при изменении чекбоксов возраста/активностей
            if (spoiler.dataset.type === 'age') {
                body.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    cb.addEventListener('change', () => {
                        const checked = Array.from(body.querySelectorAll('input[type="checkbox"]:checked')).map(i => i.value);
                        const summary = this.buildAgeFromSelectedFilters(checked);
                        const summaryEl = spoiler.querySelector('.editor-filter-summary');
                        summaryEl.textContent = summary || 'не задан';
                    });
                });
            } else if (spoiler.dataset.type === 'activities') {
                body.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    cb.addEventListener('change', () => {
                        const checked = Array.from(body.querySelectorAll('input[type="checkbox"]:checked')).map(i => i.value);
                        const summaryEl = spoiler.querySelector('.editor-filter-summary');
                        // Лейблы подтягиваем из текста рядом с чекбоксом
                        const labels = Array.from(body.querySelectorAll('input[type="checkbox"]:checked')).map(i => {
                            const labelEl = i.closest('label');
                            return labelEl ? labelEl.querySelector('span')?.textContent || i.value : i.value;
                        });
                        const summary = labels.join(', ');
                        summaryEl.textContent = summary || 'не заданы';
                    });
                });
            }
        });

        // Глобальный обработчик закрытия по клику вне (вешаем один раз)
        if (!this._filterSpoilersGlobalHandler) {
            this._filterSpoilersGlobalHandler = (e) => {
                document.querySelectorAll('.editor-filter-spoiler.open').forEach(openSpoiler => {
                    if (!openSpoiler.contains(e.target)) {
                        openSpoiler.classList.remove('open');
                    }
                });
            };
            document.addEventListener('click', this._filterSpoilersGlobalHandler);
        }
    }

    saveRowChanges(index) {
        const row = document.querySelector(`.editor-row[data-index="${index}"]`);
        if (!row) return;

        const character = this.characters[index];
        if (!character) return;

        // Текстовые поля и числа
        row.querySelectorAll('.cell-input[data-field]').forEach(input => {
            const fieldPath = input.dataset.field;
            const value = input.type === 'number' ? parseInt(input.value) || 0 : input.value;

            this.applyFieldPath(character, fieldPath, value);
        });

        // Флажки (isNew / isPopular)
        row.querySelectorAll('.editor-flag-input[data-field]').forEach(cb => {
            const fieldPath = cb.dataset.field;
            this.applyFieldPath(character, fieldPath, cb.checked);
        });

        // Возраст по выбраным диапазонам
        const ageSpoiler = row.querySelector('.editor-filter-spoiler[data-type="age"]');
        if (ageSpoiler) {
            const checked = Array.from(ageSpoiler.querySelectorAll('input[type="checkbox"]:checked')).map(i => i.value);
            const ageStr = this.buildAgeFromSelectedFilters(checked);
            if (!character.features) character.features = {};
            character.features.age = ageStr;
        }

        // Активности по выбранным чекбоксам
        const activitiesSpoiler = row.querySelector('.editor-filter-spoiler[data-type="activities"]');
        if (activitiesSpoiler) {
            const checkedActs = Array.from(activitiesSpoiler.querySelectorAll('input[type="checkbox"]:checked')).map(i => i.value);
            if (!character.features) character.features = {};
            character.features.activities = checkedActs;
        }

        this.showNotification('Изменения по строке сохранены. Не забудьте нажать "Сохранить" сверху для выгрузки JSON.');
        // Перерисуем список, чтобы обновить индексы/отображение
        this.renderCharactersList();
    }

    applyFieldPath(obj, path, value) {
        if (!path) return;
        const parts = path.split('.');
        let current = obj;
        for (let i = 0; i < parts.length - 1; i++) {
            const key = parts[i];
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        current[parts[parts.length - 1]] = value;
    }

    getGenderDisplayName(gender) {
        switch (gender) {
            case 'boys': return 'Для мальчиков';
            case 'girls': return 'Для девочек';
            case 'unisex':
            default: return 'Для всех';
        }
    }

    deleteCharacterInline(index) {
        if (index < 0) return;

        const name = this.characters[index].name;
        if (confirm(`Вы уверены, что хотите удалить персонажа "${name}"?`)) {
            this.characters.splice(index, 1);
            this.showNotification('Персонаж удален');
            this.renderCharactersList();
            this.updateCount();
        }
    }

    setupDragAndDrop() {
        const rows = document.querySelectorAll('.editor-row');
        const container = document.querySelector('.editor-table-body');
        if (!rows.length || !container) return;

        let draggedRow = null;

        rows.forEach(row => {
            const handle = row.querySelector('.drag-handle');
            if (!handle) return;

            handle.addEventListener('mousedown', () => {
                row.setAttribute('draggable', 'true');
            });

            handle.addEventListener('mouseup', () => {
                row.removeAttribute('draggable');
            });

            row.addEventListener('dragstart', (e) => {
                draggedRow = row;
                row.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            row.addEventListener('dragend', () => {
                row.classList.remove('dragging');
                row.removeAttribute('draggable');
                this.updateDraggedOrder();
            });

            row.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (!draggedRow || draggedRow === row) return;

                const bounding = row.getBoundingClientRect();
                const offset = e.clientY - bounding.top;
                const shouldInsertBefore = offset < bounding.height / 2;

                if (shouldInsertBefore) {
                    container.insertBefore(draggedRow, row);
                } else {
                    container.insertBefore(draggedRow, row.nextSibling);
                }
            });
        });

        container.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
    }

    updateDraggedOrder() {
        const rows = document.querySelectorAll('.editor-row');
        const newOrder = [];

        rows.forEach(row => {
            const index = parseInt(row.dataset.index);
            if (!Number.isNaN(index) && this.characters[index]) {
                newOrder.push(this.characters[index]);
            }
        });

        if (newOrder.length === this.characters.length) {
            this.characters = newOrder;
            this.renderCharactersList();
            this.showNotification('Порядок изменен. Не забудьте сохранить!');
        }
    }

    filterCharacters(query) {
        const rows = document.querySelectorAll('.editor-row');
        const lowerQuery = query.toLowerCase();

        rows.forEach(row => {
            const index = parseInt(row.dataset.index);
            const character = this.characters[index];
            if (!character) return;

            const name = (character.name || '').toLowerCase();
            const shortDesc = (character.description?.short || '').toLowerCase();

            if (name.includes(lowerQuery) || shortDesc.includes(lowerQuery)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    sortByRating() {
        this.characters.sort((a, b) => (b.rating || 50) - (a.rating || 50));
        this.renderCharactersList();
        this.showNotification('Отсортировано по рейтингу');
    }

    sortByName() {
        this.characters.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
        this.renderCharactersList();
        this.showNotification('Отсортировано по имени');
    }

    enableManualSort() {
        this.showNotification('Перетаскивайте строки (иконка ☰ слева) для изменения порядка');
    }

    openModal(index = -1) {
        this.currentIndex = index;
        const modal = document.getElementById('edit-modal');

        if (index >= 0) {
            this.currentCharacter = JSON.parse(JSON.stringify(this.characters[index]));
            document.getElementById('modal-title').textContent = `Редактирование: ${this.currentCharacter.name}`;
            document.getElementById('delete-character-btn').style.display = 'block';
            this.populateForm(this.currentCharacter);
        } else {
            this.currentCharacter = this.getEmptyCharacter();
            document.getElementById('modal-title').textContent = 'Новый персонаж';
            document.getElementById('delete-character-btn').style.display = 'none';
            this.populateForm(this.currentCharacter);
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('edit-modal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        this.currentCharacter = null;
        this.currentIndex = -1;
    }

    getEmptyCharacter() {
        return {
            id: Date.now(),
            name: '',
            rating: 50,
            isNew: false,
            isPopular: false,
            description: {
                short: '',
                full: ''
            },
            pricing: {
                hourly: 0,
                packages: []
            },
            features: {
                age: '',
                gender: 'unisex',
                activities: []
            },
            images: {
                main: '',
                gallery: []
            },
            tags: []
        };
    }

    populateForm(character) {
        // Basic info
        document.getElementById('char-name').value = character.name || '';
        document.getElementById('char-rating').value = character.rating || 50;
        document.getElementById('char-is-new').checked = character.isNew || false;
        document.getElementById('char-is-popular').checked = character.isPopular || false;

        // Descriptions
        document.getElementById('char-desc-short').value = character.description?.short || '';
        document.getElementById('char-desc-full').value = character.description?.full || '';

        // Pricing
        document.getElementById('char-price-hourly').value = character.pricing?.hourly || 0;

        // Packages
        const packagesContainer = document.getElementById('packages-container');
        packagesContainer.innerHTML = '';
        if (character.pricing?.packages) {
            character.pricing.packages.forEach(pkg => {
                this.addPackageField(pkg);
            });
        }

        // Features
        document.getElementById('char-age').value = character.features?.age || '';
        document.getElementById('char-gender').value = character.features?.gender || 'unisex';

        // Activities
        document.querySelectorAll('.activity-checkbox').forEach(cb => {
            cb.checked = character.features?.activities?.includes(cb.value) || false;
        });

        // Images
        document.getElementById('char-main-image').value = character.images?.main || '';
        this.updateMainImagePreview(character.images?.main || '');

        // Gallery
        const galleryContainer = document.getElementById('gallery-images-container');
        galleryContainer.innerHTML = '';
        if (character.images?.gallery) {
            character.images.gallery.forEach(img => {
                this.addGalleryImageField(img);
            });
        }

        // Tags
        document.getElementById('char-tags').value = character.tags?.join(', ') || '';
    }

    addPackageField(pkg = null) {
        const container = document.getElementById('packages-container');
        const packageItem = document.createElement('div');
        packageItem.className = 'package-item';
        packageItem.innerHTML = `
            <input type="number" class="package-duration" placeholder="Часы" value="${pkg?.duration || ''}" min="1">
            <input type="number" class="package-price" placeholder="Цена" value="${pkg?.price || ''}" min="0">
            <button type="button" class="remove-package-btn">Удалить</button>
        `;

        packageItem.querySelector('.remove-package-btn').addEventListener('click', () => {
            packageItem.remove();
        });

        container.appendChild(packageItem);
    }

    addGalleryImageField(imagePath = '') {
        const container = document.getElementById('gallery-images-container');
        const imageItem = document.createElement('div');
        imageItem.className = 'gallery-image-item';
        imageItem.innerHTML = `
            <div class="gallery-image-preview">
                ${imagePath ? `<img src="${imagePath}" alt="Gallery">` : ''}
            </div>
            <input type="text" class="gallery-image-path" placeholder="images/catalog/..." value="${imagePath}">
            <button type="button" class="remove-gallery-btn">Удалить</button>
        `;

        imageItem.querySelector('.remove-gallery-btn').addEventListener('click', () => {
            imageItem.remove();
        });

        imageItem.querySelector('.gallery-image-path').addEventListener('input', (e) => {
            const preview = imageItem.querySelector('.gallery-image-preview');
            if (e.target.value) {
                preview.innerHTML = `<img src="${e.target.value}" alt="Gallery">`;
            } else {
                preview.innerHTML = '';
            }
        });

        container.appendChild(imageItem);
    }

    updateMainImagePreview(path) {
        const preview = document.getElementById('main-image-preview');
        if (path) {
            preview.innerHTML = `<img src="${path}" alt="Main image">`;
            preview.classList.remove('empty');
        } else {
            preview.innerHTML = '';
            preview.classList.add('empty');
        }
    }

    saveCharacter() {
        // Collect form data
        const formData = {
            id: this.currentCharacter.id || Date.now(),
            name: document.getElementById('char-name').value,
            rating: parseInt(document.getElementById('char-rating').value) || 50,
            isNew: document.getElementById('char-is-new').checked,
            isPopular: document.getElementById('char-is-popular').checked,
            description: {
                short: document.getElementById('char-desc-short').value,
                full: document.getElementById('char-desc-full').value
            },
            pricing: {
                hourly: parseInt(document.getElementById('char-price-hourly').value) || 0,
                packages: this.collectPackages()
            },
            features: {
                age: document.getElementById('char-age').value,
                gender: document.getElementById('char-gender').value,
                activities: this.collectActivities()
            },
            images: {
                main: document.getElementById('char-main-image').value,
                gallery: this.collectGalleryImages()
            },
            tags: document.getElementById('char-tags').value.split(',').map(t => t.trim()).filter(t => t)
        };

        // Validate
        if (!formData.name || !formData.images.main || !formData.description.short) {
            alert('Пожалуйста, заполните все обязательные поля (отмечены *)');
            return;
        }

        // Save or update
        if (this.currentIndex >= 0) {
            this.characters[this.currentIndex] = formData;
            this.showNotification('Персонаж обновлен');
        } else {
            this.characters.push(formData);
            this.showNotification('Персонаж добавлен');
        }

        this.renderCharactersList();
        this.updateCount();
        this.closeModal();
    }

    collectPackages() {
        const packages = [];
        document.querySelectorAll('.package-item').forEach(item => {
            const duration = parseInt(item.querySelector('.package-duration').value);
            const price = parseInt(item.querySelector('.package-price').value);
            if (duration && price) {
                packages.push({ duration, price });
            }
        });
        return packages;
    }

    collectActivities() {
        const activities = [];
        document.querySelectorAll('.activity-checkbox:checked').forEach(cb => {
            activities.push(cb.value);
        });
        return activities;
    }

    collectGalleryImages() {
        const images = [];
        document.querySelectorAll('.gallery-image-path').forEach(input => {
            if (input.value) {
                images.push(input.value);
            }
        });
        return images;
    }

    deleteCharacter() {
        if (this.currentIndex < 0) return;

        const name = this.characters[this.currentIndex].name;
        if (confirm(`Вы уверены, что хотите удалить персонажа "${name}"?`)) {
            this.characters.splice(this.currentIndex, 1);
            this.showNotification('Персонаж удален');
            this.renderCharactersList();
            this.updateCount();
            this.closeModal();
        }
    }

    saveAll() {
        // Сохраняем в формате с объектом { "characters": [...] }
        const dataToSave = {
            characters: this.characters
        };
        const json = JSON.stringify(dataToSave, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'characters-data.json';
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('Файл сохранен! Замените им data/characters-data.json');
    }

    exportJSON() {
        // Экспорт в том же формате
        const dataToSave = {
            characters: this.characters
        };
        const json = JSON.stringify(dataToSave, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `characters-backup-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('Резервная копия экспортирована');
    }

    importJSON(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                // Поддержка разных форматов JSON
                let charactersArray = [];
                if (Array.isArray(data)) {
                    charactersArray = data;
                } else if (data.characters && Array.isArray(data.characters)) {
                    charactersArray = data.characters;
                } else {
                    throw new Error('JSON должен содержать массив персонажей или объект с полем "characters"');
                }

                this.characters = charactersArray;
                this.renderCharactersList();
                this.updateCount();
                this.showNotification(`Загружено ${charactersArray.length} персонажей`);
            } catch (error) {
                alert('Ошибка при загрузке файла: ' + error.message);
                console.error('Import error:', error);
            }
        };

        reader.onerror = () => {
            alert('Ошибка при чтении файла');
        };

        reader.readAsText(file);

        // Reset input
        document.getElementById('import-json-input').value = '';
    }

    updateCount() {
        document.getElementById('total-count').textContent = this.characters.length;
    }

    showNotification(message) {
        // Create notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #4caf50;
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            font-weight: 600;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize editor
const editor = new CharacterEditor();
