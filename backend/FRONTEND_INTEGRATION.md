# 🎨 Интеграция фронтенда с бэкендом

## Обзор изменений

Теперь вместо JSON файлов фронтенд будет получать данные через REST API.

## 📝 Изменения в коде фронтенда

### 1. Создать API клиент

Создайте файл `js/api-client.js`:

```javascript
/**
 * API Client для работы с бэкендом
 */
class ApiClient {
  constructor(baseUrl = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Characters
  getCharacters() {
    return this.request('/api/characters');
  }

  getCharacter(id) {
    return this.request(`/api/characters/${id}`);
  }

  getCharacterBySlug(slug) {
    return this.request(`/api/characters/slug/${slug}`);
  }

  // Programs
  getPrograms() {
    return this.request('/api/programs');
  }

  getProgram(id) {
    return this.request(`/api/programs/${id}`);
  }

  getProgramBySlug(slug) {
    return this.request(`/api/programs/slug/${slug}`);
  }

  // Calculator
  calculatePrice(data) {
    return this.request('/api/calculator/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  resolveConflicts(data) {
    return this.request('/api/calculator/resolve', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Orders
  createOrder(data) {
    return this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getOrders() {
    return this.request('/api/orders');
  }

  getOrder(id) {
    return this.request(`/api/orders/${id}`);
  }

  updateOrderStatus(id, status) {
    return this.request(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
}

// Создаем глобальный экземпляр
window.apiClient = new ApiClient();
```

### 2. Обновить загрузку персонажей

В `js/characters-renderer.js`:

```javascript
// БЫЛО:
async loadCharacters() {
  const response = await fetch('data/characters-data.json');
  const data = await response.json();
  this.characters = data;
}

// СТАЛО:
async loadCharacters() {
  this.characters = await window.apiClient.getCharacters();
}
```

### 3. Обновить загрузку программ

В `js/programs-renderer.js`:

```javascript
// БЫЛО:
async loadPrograms() {
  const response = await fetch('data/programs-data.json');
  const data = await response.json();
  this.programs = data.programs;
}

// СТАЛО:
async loadPrograms() {
  this.programs = await window.apiClient.getPrograms();
}
```

### 4. Добавить скрипт в HTML

В `index.html`, перед закрывающим `</body>`:

```html
<!-- API Client -->
<script src="js/api-client.js"></script>

<!-- Existing scripts -->
<script src="js/characters-renderer.js"></script>
<script src="js/programs-renderer.js"></script>
<script src="js/selection-manager.js"></script>
```

## 🎭 Реализация модальных окон

### 1. Создать файл модального окна

Создайте `js/persona-selection-modal.js`:

```javascript
/**
 * Модальное окно для выбора распределения персонажей
 */
class PersonaSelectionModal {
  constructor() {
    this.modal = null;
    this.currentConflict = null;
    this.onResolve = null;
  }

  /**
   * Показать модальное окно для конфликта
   */
  show(conflict, onResolve) {
    this.currentConflict = conflict;
    this.onResolve = onResolve;

    // Создаем модальное окно
    this.createModal();
    document.body.appendChild(this.modal);

    // Показываем модальное окно
    setTimeout(() => {
      this.modal.classList.add('modal-visible');
    }, 10);
  }

  /**
   * Создать HTML модального окна
   */
  createModal() {
    const modal = document.createElement('div');
    modal.className = 'persona-modal';
    modal.innerHTML = this.getModalHTML();

    // Обработчики событий
    modal.querySelector('.modal-close').addEventListener('click', () => this.close());
    modal.querySelector('.modal-overlay').addEventListener('click', () => this.close());

    // Обработчики для опций
    const options = modal.querySelectorAll('input[name="persona-option"]');
    options.forEach(option => {
      option.addEventListener('change', (e) => this.updatePrice(e.target.value));
    });

    // Обработчик подтверждения
    modal.querySelector('.modal-confirm').addEventListener('click', () => {
      this.confirm();
    });

    this.modal = modal;
  }

  /**
   * Получить HTML в зависимости от типа конфликта
   */
  getModalHTML() {
    const { type } = this.currentConflict;

    if (type === 'multiple_characters') {
      return this.getMultipleCharactersHTML();
    } else if (type === 'character_mismatch') {
      return this.getCharacterMismatchHTML();
    } else if (type === 'no_character_selected') {
      return this.getNoCharacterHTML();
    }

    return '';
  }

  /**
   * HTML для сценария: несколько персонажей
   */
  getMultipleCharactersHTML() {
    const { programName, characters, options } = this.currentConflict;
    const simultaneous = options.find(o => o.type === 'all_simultaneous');
    const sequential = options.find(o => o.type === 'sequential');

    return `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <button class="modal-close">×</button>

        <h2>Как распределить персонажей на программу?</h2>

        <div class="modal-info">
          <p><strong>Выбрано:</strong> ${characters.map(c => c.name).join(', ')}</p>
          <p><strong>Программа:</strong> ${programName}</p>
        </div>

        <div class="modal-options">
          <label class="modal-option">
            <input type="radio" name="persona-option" value="simultaneous" checked>
            <div class="option-content">
              <div class="option-title">Все персонажи работают всё время</div>
              <div class="option-price">👤👤 = ${simultaneous.price.toLocaleString('ru-RU')} ₽</div>
            </div>
          </label>

          <label class="modal-option">
            <input type="radio" name="persona-option" value="sequential">
            <div class="option-content">
              <div class="option-title">Персонажи работают по очереди</div>
              <div class="option-note">Укажите временные интервалы</div>
              <div class="time-slots" id="time-slots-container" style="display: none;">
                <!-- Временные слоты будут добавлены динамически -->
              </div>
            </div>
          </label>
        </div>

        <div class="modal-footer">
          <button class="modal-cancel">Отмена</button>
          <button class="modal-confirm">Подтвердить: <span class="confirm-price">${simultaneous.price.toLocaleString('ru-RU')} ₽</span></button>
        </div>
      </div>
    `;
  }

  /**
   * HTML для сценария: несоответствие персонажа
   */
  getCharacterMismatchHTML() {
    const { programName, selectedCharacter, defaultCharacter, options } = this.currentConflict;

    return `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <button class="modal-close">×</button>

        <h2>Кто проводит: ${programName}?</h2>

        <div class="modal-info">
          <p>У вас уже выбран ${selectedCharacter.name} для других программ</p>
        </div>

        <div class="modal-options">
          ${options.map((option, index) => `
            <label class="modal-option">
              <input type="radio" name="persona-option" value="${option.type}" ${index === 0 ? 'checked' : ''}>
              <div class="option-content">
                <div class="option-title">${option.description}</div>
                ${option.note ? `<div class="option-note">${option.note}</div>` : ''}
                <div class="option-price">${option.price.toLocaleString('ru-RU')} ₽</div>
              </div>
            </label>
          `).join('')}
        </div>

        <div class="modal-footer">
          <button class="modal-cancel">Отмена</button>
          <button class="modal-confirm">Подтвердить: <span class="confirm-price">${options[0].price.toLocaleString('ru-RU')} ₽</span></button>
        </div>
      </div>
    `;
  }

  /**
   * HTML для сценария: персонаж не выбран
   */
  getNoCharacterHTML() {
    const { programName, defaultCharacter, options } = this.currentConflict;

    return `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <button class="modal-close">×</button>

        <h2>Выберите персонажа</h2>

        <div class="modal-info">
          <p><strong>Программа:</strong> ${programName}</p>
        </div>

        <div class="modal-options">
          <label class="modal-option">
            <input type="radio" name="persona-option" value="use_default" checked>
            <div class="option-content">
              <div class="option-title">Персонаж по умолчанию: ${defaultCharacter.name}</div>
              <div class="option-price">${options[0].price.toLocaleString('ru-RU')} ₽</div>
            </div>
          </label>

          <label class="modal-option">
            <input type="radio" name="persona-option" value="select_character">
            <div class="option-content">
              <div class="option-title">Выбрать другого персонажа</div>
              <div class="option-note">Откроется каталог персонажей</div>
            </div>
          </label>
        </div>

        <div class="modal-footer">
          <button class="modal-cancel">Отмена</button>
          <button class="modal-confirm">Подтвердить</button>
        </div>
      </div>
    `;
  }

  /**
   * Обновить отображаемую цену
   */
  updatePrice(selectedOption) {
    const option = this.currentConflict.options.find(o => o.type === selectedOption);
    if (option && option.price) {
      const priceEl = this.modal.querySelector('.confirm-price');
      if (priceEl) {
        priceEl.textContent = `${option.price.toLocaleString('ru-RU')} ₽`;
      }
    }

    // Показать/скрыть временные слоты для sequential
    if (selectedOption === 'sequential') {
      const slotsContainer = this.modal.querySelector('#time-slots-container');
      if (slotsContainer) {
        slotsContainer.style.display = 'block';
        this.renderTimeSlots(slotsContainer);
      }
    } else {
      const slotsContainer = this.modal.querySelector('#time-slots-container');
      if (slotsContainer) {
        slotsContainer.style.display = 'none';
      }
    }
  }

  /**
   * Подтвердить выбор
   */
  confirm() {
    const selected = this.modal.querySelector('input[name="persona-option"]:checked');
    if (!selected) return;

    const resolution = {
      type: selected.value,
      programId: this.currentConflict.programId,
    };

    // Добавляем дополнительные данные в зависимости от типа
    if (selected.value === 'sequential') {
      resolution.timeSlots = this.getTimeSlots();
    } else if (selected.value === 'use_default_same_actor') {
      resolution.selectedCharacterId = this.currentConflict.selectedCharacter.id;
      resolution.newCostumeName = this.currentConflict.defaultCharacter.name;
    } else if (selected.value === 'use_default_separate_actor') {
      resolution.selectedCharacterId = this.currentConflict.selectedCharacter.id;
      resolution.defaultCharacterId = this.currentConflict.defaultCharacter.id;
    }

    if (this.onResolve) {
      this.onResolve(resolution);
    }

    this.close();
  }

  /**
   * Закрыть модальное окно
   */
  close() {
    if (this.modal) {
      this.modal.classList.remove('modal-visible');
      setTimeout(() => {
        this.modal.remove();
        this.modal = null;
      }, 300);
    }
  }
}

// Создаем глобальный экземпляр
window.personaModal = new PersonaSelectionModal();
```

### 2. Добавить CSS для модального окна

Создайте `css/persona-modal.css`:

```css
.persona-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10000;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.persona-modal.modal-visible {
  opacity: 1;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.modal-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #333;
}

.modal-content h2 {
  margin: 0 0 24px 0;
  font-size: 24px;
  color: #333;
}

.modal-info {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.modal-info p {
  margin: 4px 0;
  color: #666;
}

.modal-options {
  margin-bottom: 24px;
}

.modal-option {
  display: block;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-option:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.modal-option input[type="radio"] {
  margin-right: 12px;
}

.modal-option input[type="radio"]:checked ~ .option-content {
  color: #667eea;
}

.option-content {
  display: inline-block;
  width: calc(100% - 30px);
}

.option-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
}

.option-note {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}

.option-price {
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
  margin-top: 8px;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.modal-cancel {
  background: #e0e0e0;
  color: #666;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.modal-cancel:hover {
  background: #d0d0d0;
}

.modal-confirm {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: transform 0.2s;
  flex: 1;
}

.modal-confirm:hover {
  transform: translateY(-2px);
}
```

## 🔄 Обновление логики выбора

В `js/selection-manager.js`, добавьте проверку конфликтов:

```javascript
async toggleProgram(program) {
  // ... existing code ...

  // После добавления программы проверяем конфликты
  const result = await window.apiClient.calculatePrice({
    selectedCharacters: this.selectedCharacters.map(c => c.id),
    selectedPrograms: this.selectedPrograms.map(p => ({
      programId: p.id,
      duration: p.duration || 1,
    })),
  });

  // Если есть конфликты - показываем модальное окно
  if (result.hasConflicts) {
    for (const conflict of result.conflicts) {
      window.personaModal.show(conflict, (resolution) => {
        this.applyResolution(resolution);
      });
    }
  }
}

applyResolution(resolution) {
  // Сохраняем разрешение конфликта
  // и пересчитываем стоимость
  // ...
}
```

## 📦 Деплой

### Development

```bash
# Запустить бэкенд
cd backend && npm run dev

# Запустить фронтенд (Live Server в VS Code или)
python3 -m http.server 5500
```

### Production

1. **Backend**: Railway, Render, или любой Node.js хостинг
2. **Frontend**: GitHub Pages, Netlify, Vercel
3. **Database**: PostgreSQL на Heroku или Supabase

Обновите `ALLOWED_ORIGINS` в `.env` для production домена.

## 🎯 Следующие шаги

1. ✅ Запустить бэкенд локально
2. ✅ Обновить фронтенд для использования API
3. ✅ Реализовать модальные окна
4. 🎨 Стилизовать модальные окна
5. 🧪 Протестировать все сценарии
6. 🚀 Задеплоить на production
