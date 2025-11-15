/**
 * Admin Panel - Manage Characters and Programs
 */

class AdminPanel {
    constructor() {
        this.characters = [];
        this.programs = [];
        this.currentTab = 'characters';
        this.init();
    }

    async init() {
        await this.loadData();
        this.render();
        this.attachEventListeners();
    }

    async loadData() {
        try {
            // Load characters
            const charactersResponse = await fetch('data/characters-data.json');
            const charactersData = await charactersResponse.json();
            this.characters = charactersData.characters;

            // Load programs
            const programsResponse = await fetch('data/programs-data.json');
            const programsData = await programsResponse.json();
            this.programs = programsData.programs;

            console.log('Data loaded:', this.characters.length, 'characters,', this.programs.length, 'programs');
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Ошибка загрузки данных. Проверьте консоль.');
        }
    }

    render() {
        this.renderCharactersList();
        this.renderProgramsList();
    }

    renderCharactersList() {
        const container = document.getElementById('characters-list');
        if (!container) return;

        container.innerHTML = this.characters.map(character => `
            <div class="data-item" data-id="${character.id}">
                <div class="data-item-header">
                    <div>
                        <span style="font-size: 1.5rem; margin-right: 10px;">${character.emoji}</span>
                        <span class="data-item-title">${character.name}</span>
                    </div>
                    <div class="data-item-actions">
                        <button class="btn btn-primary" onclick="adminPanel.editCharacter(${character.id})">
                            ✏️ Редактировать
                        </button>
                    </div>
                </div>
                <div style="margin-top: 10px;">
                    <span class="info-badge">${character.availablePrograms?.length || 0} программ</span>
                    <span class="info-badge">${character.pricing.hourly} ₽/час</span>
                    ${character.isPopular ? '<span class="info-badge" style="background: #f39c12;">Популярный</span>' : ''}
                    ${character.isNew ? '<span class="info-badge" style="background: #27ae60;">Новинка</span>' : ''}
                </div>
            </div>
        `).join('');
    }

    renderProgramsList() {
        const container = document.getElementById('programs-list');
        if (!container) return;

        container.innerHTML = this.programs.map(program => {
            const defaultCharacter = program.defaultCharacterId
                ? this.characters.find(c => c.id === program.defaultCharacterId)
                : null;

            return `
                <div class="data-item" data-id="${program.id}">
                    <div class="data-item-header">
                        <div>
                            <span style="font-size: 1.5rem; margin-right: 10px;">${program.emoji}</span>
                            <span class="data-item-title">${program.name}</span>
                        </div>
                        <div class="data-item-actions">
                            <button class="btn btn-primary" onclick="adminPanel.editProgram(${program.id})">
                                ✏️ Редактировать
                            </button>
                            <button class="btn btn-danger" onclick="adminPanel.deleteProgram(${program.id})">
                                🗑️
                            </button>
                        </div>
                    </div>
                    <div style="margin-top: 10px;">
                        <span class="info-badge">${program.pricing.isCharacterPrice ? 'Цена персонажа' : program.pricing.amount + ' ' + program.pricing.unit}</span>
                        ${defaultCharacter ? `<span class="info-badge" style="background: #9b59b6;">По умолчанию: ${defaultCharacter.name}</span>` : ''}
                    </div>
                    <p style="margin-top: 8px; color: #7f8c8d; font-size: 0.9rem;">${program.description || ''}</p>
                </div>
            `;
        }).join('');
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    editCharacter(characterId) {
        const character = this.characters.find(c => c.id === characterId);
        if (!character) return;

        // Fill form
        document.getElementById('edit-character-id').value = character.id;
        document.getElementById('edit-character-name').value = character.name;

        // Render programs checkboxes
        const programsContainer = document.getElementById('edit-character-programs');
        programsContainer.innerHTML = this.programs.map(program => `
            <label class="checkbox-label">
                <input type="checkbox"
                       value="${program.id}"
                       ${character.availablePrograms?.includes(program.id) ? 'checked' : ''}>
                <span>${program.emoji} ${program.name}</span>
            </label>
        `).join('');

        this.openModal('edit-character-modal');
    }

    editProgram(programId) {
        const program = this.programs.find(p => p.id === programId);
        if (!program) return;

        document.getElementById('program-modal-title').textContent = 'Редактировать программу';

        // Fill form
        document.getElementById('edit-program-id').value = program.id;
        document.getElementById('edit-program-name').value = program.name;
        document.getElementById('edit-program-emoji').value = program.emoji || '';
        document.getElementById('edit-program-description').value = program.description || '';
        document.getElementById('edit-program-price').value = program.pricing.amount;
        document.getElementById('edit-program-unit').value = program.pricing.unit;
        document.getElementById('edit-program-is-character-price').checked = program.pricing.isCharacterPrice || false;

        // Populate default character select
        const defaultCharacterSelect = document.getElementById('edit-program-default-character');
        defaultCharacterSelect.innerHTML = '<option value="">Не требуется</option>' +
            this.characters.map(c => `
                <option value="${c.id}" ${program.defaultCharacterId === c.id ? 'selected' : ''}>
                    ${c.emoji} ${c.name}
                </option>
            `).join('');

        this.openModal('edit-program-modal');
    }

    addProgram() {
        // Find next available ID
        const maxId = Math.max(...this.programs.map(p => p.id), 0);
        const newId = maxId + 1;

        document.getElementById('program-modal-title').textContent = 'Добавить программу';

        // Clear form
        document.getElementById('edit-program-id').value = newId;
        document.getElementById('edit-program-name').value = '';
        document.getElementById('edit-program-emoji').value = '🎉';
        document.getElementById('edit-program-description').value = '';
        document.getElementById('edit-program-price').value = '5000';
        document.getElementById('edit-program-unit').value = '₽/час';
        document.getElementById('edit-program-is-character-price').checked = false;

        // Populate default character select
        const defaultCharacterSelect = document.getElementById('edit-program-default-character');
        defaultCharacterSelect.innerHTML = '<option value="">Не требуется</option>' +
            this.characters.map(c => `<option value="${c.id}">${c.emoji} ${c.name}</option>`).join('');

        this.openModal('edit-program-modal');
    }

    deleteProgram(programId) {
        if (!confirm('Вы уверены, что хотите удалить эту программу?')) return;

        // Remove from programs array
        this.programs = this.programs.filter(p => p.id !== programId);

        // Remove from all characters' availablePrograms
        this.characters.forEach(character => {
            if (character.availablePrograms) {
                character.availablePrograms = character.availablePrograms.filter(id => id !== programId);
            }
        });

        this.render();
        this.showNotification('Программа удалена', 'success');
    }

    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    attachEventListeners() {
        // Character form submit
        document.getElementById('edit-character-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCharacter();
        });

        // Program form submit
        document.getElementById('edit-program-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProgram();
        });

        // Close modals on background click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    saveCharacter() {
        const characterId = parseInt(document.getElementById('edit-character-id').value);
        const character = this.characters.find(c => c.id === characterId);
        if (!character) return;

        // Get selected programs
        const checkboxes = document.querySelectorAll('#edit-character-programs input[type="checkbox"]');
        const selectedPrograms = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => parseInt(cb.value));

        // Update character
        character.availablePrograms = selectedPrograms;

        this.closeModal('edit-character-modal');
        this.render();
        this.showNotification('Персонаж обновлен', 'success');
    }

    saveProgram() {
        const programId = parseInt(document.getElementById('edit-program-id').value);
        const name = document.getElementById('edit-program-name').value.trim();

        if (!name) {
            alert('Введите название программы');
            return;
        }

        const programData = {
            id: programId,
            name: name,
            slug: this.generateSlug(name),
            category: 'custom',
            emoji: document.getElementById('edit-program-emoji').value || '🎉',
            pricing: {
                amount: parseInt(document.getElementById('edit-program-price').value) || 0,
                unit: document.getElementById('edit-program-unit').value,
                isCharacterPrice: document.getElementById('edit-program-is-character-price').checked
            },
            defaultCharacterId: document.getElementById('edit-program-default-character').value
                ? parseInt(document.getElementById('edit-program-default-character').value)
                : null,
            description: document.getElementById('edit-program-description').value.trim(),
            image: ''
        };

        // Check if program exists
        const existingIndex = this.programs.findIndex(p => p.id === programId);
        if (existingIndex >= 0) {
            // Update existing
            this.programs[existingIndex] = programData;
        } else {
            // Add new
            this.programs.push(programData);
        }

        this.closeModal('edit-program-modal');
        this.render();
        this.showNotification('Программа сохранена', 'success');
    }

    generateSlug(text) {
        return text.toLowerCase()
            .replace(/[^a-z0-9а-я]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    exportData() {
        const data = {
            characters: this.characters,
            programs: this.programs
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `catalog-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(url);
        this.showNotification('Данные экспортированы', 'success');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const data = JSON.parse(text);

                if (data.characters && data.programs) {
                    if (confirm('Это заменит текущие данные. Продолжить?')) {
                        this.characters = data.characters;
                        this.programs = data.programs;
                        this.render();
                        this.showNotification('Данные импортированы', 'success');
                    }
                } else {
                    alert('Неверный формат файла');
                }
            } catch (error) {
                console.error('Import error:', error);
                alert('Ошибка при импорте файла');
            }
        };

        input.click();
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            font-weight: 600;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize admin panel
const adminPanel = new AdminPanel();
