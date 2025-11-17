/**
 * Модальное окно для выбора распределения персонажей
 * Обрабатывает 3 сценария:
 * 1. Несколько персонажей на одну программу
 * 2. Программа с другим дефолтным персонажем
 * 3. Персонаж не выбран
 */
class PersonaSelectionModal {
  constructor() {
    this.modal = null;
    this.currentConflict = null;
    this.onResolve = null;
    this.timeSlots = [];
  }

  /**
   * Показать модальное окно для конфликта
   */
  show(conflict, onResolve) {
    this.currentConflict = conflict;
    this.onResolve = onResolve;
    this.timeSlots = [];

    // Создаем модальное окно
    this.createModal();
    document.body.appendChild(this.modal);

    // Показываем модальное окно с анимацией
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

    // Обработчик закрытия
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    const overlay = modal.querySelector('.modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => this.close());
    }

    // Обработчики для опций
    const options = modal.querySelectorAll('input[name="persona-option"]');
    options.forEach(option => {
      option.addEventListener('change', (e) => this.onOptionChange(e.target.value));
    });

    // Обработчик подтверждения
    const confirmBtn = modal.querySelector('.modal-confirm');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => this.confirm());
    }

    const cancelBtn = modal.querySelector('.modal-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.close());
    }

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
    const { programName, duration, characters, options } = this.currentConflict;
    const simultaneous = options.find(o => o.type === 'all_simultaneous');
    const sequential = options.find(o => o.type === 'sequential');

    return `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <button class="modal-close">×</button>

        <h2>Как распределить персонажей на программу?</h2>

        <div class="modal-info">
          <p><strong>Выбрано:</strong> ${characters.map(c => c.name).join(', ')}</p>
          <p><strong>Программа:</strong> ${programName} (${duration} ${this.pluralizeHours(duration)})</p>
        </div>

        <div class="modal-options">
          <label class="modal-option">
            <input type="radio" name="persona-option" value="all_simultaneous" checked>
            <div class="option-content">
              <div class="option-title">Все персонажи работают всё время</div>
              <div class="option-note">👤👤 × ${duration} ${this.pluralizeHours(duration)}</div>
              <div class="option-price">${simultaneous.price.toLocaleString('ru-RU')} ₽</div>
            </div>
          </label>

          <label class="modal-option">
            <input type="radio" name="persona-option" value="sequential">
            <div class="option-content">
              <div class="option-title">Персонажи работают по очереди</div>
              <div class="option-note">Укажите временные интервалы для каждого персонажа</div>
              <div class="time-slots-container" id="time-slots-container" style="display: none;">
                ${this.getTimeSlotsHTML(characters, duration)}
              </div>
            </div>
          </label>
        </div>

        <div class="modal-footer">
          <button class="modal-cancel">Отмена</button>
          <button class="modal-confirm">
            Подтвердить: <span class="confirm-price">${simultaneous.price.toLocaleString('ru-RU')} ₽</span>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * HTML для временных слотов
   */
  getTimeSlotsHTML(characters, totalDuration) {
    let html = '<div class="time-slots-list">';

    // Автоматически распределяем время поровну
    const slotDuration = totalDuration / characters.length;

    characters.forEach((char, index) => {
      const startTime = index * slotDuration;
      const endTime = (index + 1) * slotDuration;

      html += `
        <div class="time-slot">
          <div class="slot-character">
            <select class="slot-character-select" data-slot-index="${index}">
              ${characters.map((c, i) => `
                <option value="${c.id}" ${i === index ? 'selected' : ''}>${c.name}</option>
              `).join('')}
            </select>
          </div>
          <div class="slot-time">
            <input type="number"
                   class="slot-duration"
                   data-slot-index="${index}"
                   value="${slotDuration}"
                   min="0.5"
                   max="${totalDuration}"
                   step="0.5">
            <span class="slot-time-label">${this.pluralizeHours(slotDuration)}</span>
          </div>
          <div class="slot-price" data-slot-index="${index}">
            ${(char.hourlyPrice * slotDuration).toLocaleString('ru-RU')} ₽
          </div>
        </div>
      `;
    });

    html += '</div>';
    html += '<div class="time-slots-total">Итого: <span id="slots-total-price">0 ₽</span></div>';

    return html;
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
          <p>У вас уже выбран <strong>${selectedCharacter.name}</strong> для других программ</p>
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
          <button class="modal-confirm">
            Подтвердить: <span class="confirm-price">${options[0].price.toLocaleString('ru-RU')} ₽</span>
          </button>
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
          ${options.map((option, index) => `
            <label class="modal-option">
              <input type="radio" name="persona-option" value="${option.type}" ${index === 0 ? 'checked' : ''}>
              <div class="option-content">
                <div class="option-title">${option.description}</div>
                ${option.price ? `<div class="option-price">${option.price.toLocaleString('ru-RU')} ₽</div>` : ''}
                ${option.requiresAction ? '<div class="option-note">Откроется каталог персонажей</div>' : ''}
              </div>
            </label>
          `).join('')}
        </div>

        <div class="modal-footer">
          <button class="modal-cancel">Отмена</button>
          <button class="modal-confirm">Подтвердить</button>
        </div>
      </div>
    `;
  }

  /**
   * Обработчик изменения выбранной опции
   */
  onOptionChange(selectedOption) {
    // Обновляем цену в кнопке подтверждения
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
        this.setupTimeSlotsHandlers();
        this.calculateTimeSlotsPrice();
      }
    } else {
      const slotsContainer = this.modal.querySelector('#time-slots-container');
      if (slotsContainer) {
        slotsContainer.style.display = 'none';
      }
    }
  }

  /**
   * Настроить обработчики для временных слотов
   */
  setupTimeSlotsHandlers() {
    const durationInputs = this.modal.querySelectorAll('.slot-duration');
    const characterSelects = this.modal.querySelectorAll('.slot-character-select');

    durationInputs.forEach(input => {
      input.addEventListener('input', () => this.calculateTimeSlotsPrice());
    });

    characterSelects.forEach(select => {
      select.addEventListener('change', () => this.calculateTimeSlotsPrice());
    });
  }

  /**
   * Рассчитать стоимость для временных слотов
   */
  calculateTimeSlotsPrice() {
    const { characters } = this.currentConflict;
    let totalPrice = 0;

    const durationInputs = this.modal.querySelectorAll('.slot-duration');
    const characterSelects = this.modal.querySelectorAll('.slot-character-select');
    const priceElements = this.modal.querySelectorAll('.slot-price');

    durationInputs.forEach((input, index) => {
      const duration = parseFloat(input.value) || 0;
      const characterId = parseInt(characterSelects[index].value);
      const character = characters.find(c => c.id === characterId);

      if (character) {
        const slotPrice = character.hourlyPrice * duration;
        totalPrice += slotPrice;

        if (priceElements[index]) {
          priceElements[index].textContent = `${slotPrice.toLocaleString('ru-RU')} ₽`;
        }

        // Обновляем label часов
        const label = input.nextElementSibling;
        if (label) {
          label.textContent = this.pluralizeHours(duration);
        }
      }
    });

    // Обновляем общую стоимость
    const totalElement = this.modal.querySelector('#slots-total-price');
    if (totalElement) {
      totalElement.textContent = `${totalPrice.toLocaleString('ru-RU')} ₽`;
    }

    const confirmPrice = this.modal.querySelector('.confirm-price');
    if (confirmPrice) {
      confirmPrice.textContent = `${totalPrice.toLocaleString('ru-RU')} ₽`;
    }
  }

  /**
   * Получить временные слоты из формы
   */
  getTimeSlots() {
    const { characters } = this.currentConflict;
    const durationInputs = this.modal.querySelectorAll('.slot-duration');
    const characterSelects = this.modal.querySelectorAll('.slot-character-select');

    const slots = [];
    let startTime = 0;

    durationInputs.forEach((input, index) => {
      const duration = parseFloat(input.value) || 0;
      const characterId = parseInt(characterSelects[index].value);
      const character = characters.find(c => c.id === characterId);

      if (character && duration > 0) {
        slots.push({
          characterId: character.id,
          startTime: startTime,
          endTime: startTime + duration,
          priceForSlot: character.hourlyPrice * duration,
        });

        startTime += duration;
      }
    });

    return slots;
  }

  /**
   * Подтвердить выбор
   */
  confirm() {
    const selectedInput = this.modal.querySelector('input[name="persona-option"]:checked');
    if (!selectedInput) return;

    const resolution = {
      type: selectedInput.value,
      programId: this.currentConflict.programId,
    };

    // Добавляем дополнительные данные в зависимости от типа
    if (selectedInput.value === 'sequential') {
      resolution.timeSlots = this.getTimeSlots();
    } else if (selectedInput.value === 'use_selected') {
      resolution.characterId = this.currentConflict.selectedCharacter.id;
    } else if (selectedInput.value === 'use_default_same_actor') {
      resolution.selectedCharacterId = this.currentConflict.selectedCharacter.id;
      resolution.newCostumeName = this.currentConflict.defaultCharacter.name;
    } else if (selectedInput.value === 'use_default_separate_actor') {
      resolution.selectedCharacterId = this.currentConflict.selectedCharacter.id;
      resolution.defaultCharacterId = this.currentConflict.defaultCharacter.id;
    } else if (selectedInput.value === 'select_character') {
      // Открыть каталог персонажей
      this.close();
      const charactersSection = document.getElementById('characters');
      if (charactersSection) {
        charactersSection.scrollIntoView({ behavior: 'smooth' });
      }
      return;
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
        this.currentConflict = null;
        this.onResolve = null;
      }, 300);
    }
  }

  /**
   * Pluralize hours in Russian
   */
  pluralizeHours(hours) {
    if (hours === 0.5) return '30 минут';
    if (hours === 1) return 'час';
    if (hours === 1.5) return '1.5 часа';

    const cases = [2, 0, 1, 1, 1, 2];
    const titles = ['час', 'часа', 'часов'];

    const hoursInt = Math.floor(hours);
    const index = hoursInt % 100 > 4 && hoursInt % 100 < 20
      ? 2
      : cases[hoursInt % 10 < 5 ? hoursInt % 10 : 5];

    return `${hours} ${titles[index]}`;
  }
}

// Создаем глобальный экземпляр
window.personaModal = new PersonaSelectionModal();
