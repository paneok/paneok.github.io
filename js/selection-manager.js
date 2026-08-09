/**
 * Selection Manager Module
 * Manages selection of characters and programs, calculates total price
 */

class SelectionManager {
  constructor() {
    this.selectedCharacters = []; // Array of selected characters
    this.selectedPrograms = []; // Array of selected programs
    this.selectedServices = []; // Array of selected additional services
    this.resolutions = []; // Разрешения конфликтов
    this.totalPrice = 0; // Общая стоимость
    this.totalDuration = 0; // Общая продолжительность
    this.details = []; // Детали расчета
    this.lastCalculation = null; // Последний результат расчета
    this.boundViewportUpdate = this.updateBottomBar.bind(this);
    this.viewportListenersAttached = false;
    this.loadFromLocalStorage();
    this.checkDeferredAutofill();
    this.attachViewportListeners();
  }

  normalizeCharacterSelection(character) {
    if (!character || typeof character !== 'object') {
      return null;
    }

    const id = Number(character.id);
    if (!Number.isFinite(id)) {
      return null;
    }

    return {
      ...character,
      id,
      pricing: {
        ...(character.pricing || {}),
        hourly: Number(character.pricing?.hourly) || 0
      }
    };
  }

  normalizeProgramSelection(program) {
    if (!program || typeof program !== 'object') {
      return null;
    }

    const id = Number(program.id);
    if (!Number.isFinite(id)) {
      return null;
    }

    return {
      ...program,
      id,
      duration: Number(program.duration) || this.parseDurationToHours(program.duration) || 1,
      pricing: {
        ...(program.pricing || {}),
        amount: Number(program.pricing?.amount) || 0,
        unit: program.pricing?.unit || '',
        isCharacterPrice: Boolean(program.pricing?.isCharacterPrice)
      }
    };
  }

  normalizeServiceSelection(service) {
    if (!service || typeof service !== 'object') {
      return null;
    }

    const id = Number(service.id);
    if (!Number.isFinite(id)) {
      return null;
    }

    return {
      ...service,
      id,
      quantity: Math.max(1, Number(service.quantity) || 1),
      pricing: {
        ...(service.pricing || {}),
        amount: Number(service.pricing?.amount) || 0,
        unit: service.pricing?.unit || '₽/шт'
      }
    };
  }

  /**
   * Load saved selection from localStorage
   */
  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('selectionState');
      if (saved) {
        const state = JSON.parse(saved);
        this.selectedCharacters = Array.isArray(state.characters)
          ? state.characters
            .map((character) => this.normalizeCharacterSelection(character))
            .filter(Boolean)
          : [];
        this.selectedPrograms = Array.isArray(state.programs)
          ? state.programs
            .map((program) => this.normalizeProgramSelection(program))
            .filter(Boolean)
          : [];
        this.selectedServices = Array.isArray(state.services)
          ? state.services
            .map((service) => this.normalizeServiceSelection(service))
            .filter(Boolean)
          : [];
      }
    } catch (error) {
      console.error('Error loading selection from localStorage:', error);
      this.selectedCharacters = [];
      this.selectedPrograms = [];
      this.selectedServices = [];
    }
  }

  /**
   * Save selection to localStorage
   */
  saveToLocalStorage() {
    try {
      const state = {
        characters: this.selectedCharacters,
        programs: this.selectedPrograms,
        services: this.selectedServices
      };
      localStorage.setItem('selectionState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving selection to localStorage:', error);
    }
  }

  attachViewportListeners() {
    if (this.viewportListenersAttached || typeof window === 'undefined') {
      return;
    }

    const registerListeners = () => {
      window.addEventListener('scroll', this.boundViewportUpdate, { passive: true });
      window.addEventListener('resize', this.boundViewportUpdate, { passive: true });
      this.viewportListenersAttached = true;
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', registerListeners, { once: true });
      return;
    }

    registerListeners();
  }

  /**
   * Add or remove a character
   */
  toggleCharacter(character) {
    this.lastCalculation = null;
    this.resolutions = [];
    const normalizedCharacter = this.normalizeCharacterSelection(character);
    if (!normalizedCharacter) {
      return;
    }

    const index = this.selectedCharacters.findIndex(c => c.id === normalizedCharacter.id);

    if (index > -1) {
      // Remove character
      this.selectedCharacters.splice(index, 1);
    } else {
      // Add character
      this.selectedCharacters.push(normalizedCharacter);
    }

    // Update programs renderer with current character
    if (window.programsRenderer) {
      const mainCharacter = this.selectedCharacters[0] || null;
      window.programsRenderer.setSelectedCharacter(mainCharacter);
    }

    this.saveToLocalStorage();
    this.updateUI();
  }

  /**
   * Add or remove a program
   */
  async toggleProgram(program) {
    this.lastCalculation = null;
    this.resolutions = [];
    const normalizedProgram = this.normalizeProgramSelection(program);
    if (!normalizedProgram) {
      return;
    }

    const index = this.selectedPrograms.findIndex(p => p.id === normalizedProgram.id);

    if (index > -1) {
      // Remove program
      this.selectedPrograms.splice(index, 1);
    } else {
      this.selectedPrograms.push(normalizedProgram);
    }

    this.saveToLocalStorage();
    this.updateUI();

    // Проверяем конфликты только при добавлении программы
    if (index === -1 && this.selectedPrograms.length > 0) {
      await this.checkForConflicts();
    }
  }

  /**
   * Обновить продолжительность программы
   */
  async updateProgramDuration(programId, duration) {
    const program = this.selectedPrograms.find((item) => item.id === programId);
    if (!program) return;

    program.duration = Number(duration) || this.parseDurationToHours(duration) || 1;
    this.lastCalculation = null;
    this.resolutions = [];
    this.saveToLocalStorage();
    this.updateUI();

    if (this.selectedPrograms.length > 0) {
      await this.checkForConflicts();
    }
  }

  /**
   * Парсинг duration в часы
   */
  parseDurationToHours(durationStr) {
    if (!durationStr) return 1;

    // "30 минут" = 0.5
    if (durationStr.includes('минут')) {
      const match = durationStr.match(/(\d+)/);
      if (match) {
        return parseInt(match[1]) / 60;
      }
    }

    // "1 час", "2 часа" = 1, 2
    const hourMatch = durationStr.match(/(\d+\.?\d*)\s*(ч|час)/i);
    if (hourMatch) {
      return parseFloat(hourMatch[1]);
    }

    return 1; // default
  }

  isProgramsSectionInView() {
    const programsSection = document.getElementById('programs');
    if (!programsSection) {
      return false;
    }

    const rect = programsSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const visibleTop = Math.max(rect.top, 0);
    const visibleBottom = Math.min(rect.bottom, viewportHeight);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
    const requiredVisibleHeight = Math.min(rect.height, viewportHeight) * 0.35;

    return visibleHeight >= requiredVisibleHeight && rect.bottom > 0;
  }

  isAdditionalServicesSectionInView() {
    const additionalServicesSection = document.getElementById('additional-services');
    if (!additionalServicesSection) {
      return false;
    }

    const rect = additionalServicesSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const visibleTop = Math.max(rect.top, 0);
    const visibleBottom = Math.min(rect.bottom, viewportHeight);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
    const requiredVisibleHeight = Math.min(rect.height, viewportHeight) * 0.2;

    return visibleHeight >= requiredVisibleHeight && rect.bottom > 0;
  }

  hasAdditionalServicesSection() {
    return Boolean(document.getElementById('additional-services'));
  }

  handleContinue() {
    if (this.selectedCharacters.length === 0) {
      return;
    }

    if (this.selectedPrograms.length === 0) {
      const programsSection = document.getElementById('programs');
      if (!programsSection) {
        return;
      }

      programsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      return;
    }

    if (this.hasAdditionalServicesSection() && !this.isAdditionalServicesSectionInView()) {
      this.navigateToContinueTarget('#additional-services');
      return;
    }

    window.location.href = 'booking.html';
  }

  navigateToContinueTarget(targetHref) {
    if (!targetHref) {
      return;
    }

    if (targetHref.startsWith('#')) {
      const targetSection = document.querySelector(targetHref);
      if (!targetSection) {
        return;
      }

      targetSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      return;
    }

    window.location.href = targetHref;
  }

  getContinueButtonState() {
    if (this.selectedCharacters.length === 0) {
      return {
        enabled: false,
        mode: 'idle',
        label: 'Продолжить'
      };
    }

    if (this.selectedPrograms.length === 0) {
      if (this.isProgramsSectionInView()) {
        return {
          enabled: false,
          mode: 'awaiting-program',
          label: 'Выберите программу'
        };
      }

      return {
        enabled: true,
        mode: 'scroll-to-programs',
        label: 'К программам'
      };
    }

    if (!this.hasAdditionalServicesSection() || this.isAdditionalServicesSectionInView()) {
      return {
        enabled: true,
        mode: 'calculate-total',
        label: 'Рассчитать стоимость'
      };
    }

    return {
      enabled: true,
      mode: 'scroll-to-services',
      label: 'К доп. услугам'
    };
  }

  isServiceSelected(serviceId) {
    return this.selectedServices.some((service) => service.id === serviceId);
  }

  getSelectedService(serviceId) {
    return this.selectedServices.find((service) => service.id === serviceId) || null;
  }

  toggleService(service) {
    this.lastCalculation = null;
    const normalizedService = this.normalizeServiceSelection(service);
    if (!normalizedService) {
      return;
    }

    const index = this.selectedServices.findIndex((item) => item.id === normalizedService.id);

    if (index > -1) {
      this.selectedServices.splice(index, 1);
    } else {
      this.selectedServices.push(normalizedService);
    }

    this.saveToLocalStorage();
    this.updateUI();
  }

  updateServiceQuantity(serviceId, delta) {
    const service = this.selectedServices.find((item) => item.id === serviceId);
    if (!service) {
      return;
    }

    const nextQuantity = (Number(service.quantity) || 1) + delta;
    if (nextQuantity <= 0) {
      this.selectedServices = this.selectedServices.filter((item) => item.id !== serviceId);
      this.lastCalculation = null;
      this.saveToLocalStorage();
      this.updateUI();
      return;
    }

    service.quantity = nextQuantity;
    this.lastCalculation = null;
    this.saveToLocalStorage();
    this.updateUI();
  }

  /**
   * Проверить наличие конфликтов через API
   */
  async checkForConflicts() {
    try {
      // Подготавливаем данные для API
      const selectedCharacterIds = this.selectedCharacters.map(c => c.id);
      const selectedProgramsData = this.selectedPrograms.map(p => ({
        programId: p.id,
        duration: p.duration || 1
      }));

      // Вызываем API калькулятора
      const result = await window.apiClient.calculatePrice({
        selectedCharacters: selectedCharacterIds,
        selectedPrograms: selectedProgramsData
      });

      // Если есть конфликты - показываем модальные окна
      if (result.hasConflicts && result.conflicts.length > 0) {
        // Показываем первый конфликт
        this.showConflictModal(result.conflicts[0], result.conflicts.slice(1));
      } else {
        // Сохраняем результат расчета
        this.lastCalculation = result;
        this.updatePriceDisplay(result);
      }
    } catch (error) {
      console.error('Error checking conflicts:', error);
      // Продолжаем работу с fallback логикой
    }
  }

  /**
   * Показать модальное окно для конфликта
   */
  showConflictModal(conflict, remainingConflicts = []) {
    window.personaModal.show(conflict, (resolution) => {
      // Применяем разрешение конфликта
      this.applyResolution(resolution);

      // Если есть еще конфликты - показываем следующий
      if (remainingConflicts.length > 0) {
        this.showConflictModal(remainingConflicts[0], remainingConflicts.slice(1));
      } else {
        // Все конфликты разрешены - пересчитываем с учетом разрешений
        this.recalculateWithResolutions();
      }
    });
  }

  /**
   * Применить разрешение конфликта
   */
  applyResolution(resolution) {
    if (!this.resolutions) {
      this.resolutions = [];
    }

    // Удаляем предыдущее разрешение для этой программы
    this.resolutions = this.resolutions.filter(r => r.programId !== resolution.programId);

    // Добавляем новое разрешение
    this.resolutions.push(resolution);

  }

  /**
   * Пересчитать стоимость с учетом разрешений
   */
  async recalculateWithResolutions() {
    try {
      const selectedCharacterIds = this.selectedCharacters.map(c => c.id);
      const selectedProgramsData = this.selectedPrograms.map(p => ({
        programId: p.id,
        duration: p.duration || 1
      }));

      const result = await window.apiClient.resolveConflicts({
        selectedCharacters: selectedCharacterIds,
        selectedPrograms: selectedProgramsData,
        resolutions: this.resolutions || []
      });

      // Сохраняем результат и обновляем UI
      this.lastCalculation = result;
      this.updatePriceDisplay(result);
    } catch (error) {
      console.error('Error recalculating with resolutions:', error);
    }
  }

  /**
   * Обновить отображение цены
   */
  updatePriceDisplay(calculation) {
    // Обновляем UI с новыми данными
    if (calculation) {
      this.totalPrice = calculation.totalPrice;
      this.totalDuration = calculation.totalDuration;
      this.details = calculation.details;
    }
    this.updateUI();
  }

  /**
   * Check if a program is selected
   */
  isProgramSelected(programId) {
    return this.selectedPrograms.some(p => p.id === programId);
  }

  /**
   * Check if a character is selected
   */
  isCharacterSelected(characterId) {
    return this.selectedCharacters.some(c => c.id === characterId);
  }

  /**
   * Add default character for a program
   */
  async addDefaultCharacterForProgram(program) {
    if (!program.defaultCharacterId) {
      console.warn('Program has no default character');
      return;
    }

    // Load characters if not available
    if (!window.charactersData) {
      console.error('Characters data not loaded');
      return;
    }

    const defaultCharacter = window.charactersData.find(
      c => c.id === program.defaultCharacterId
    );

    if (!defaultCharacter) {
      console.error('Default character not found');
      return;
    }

    // Add the default character if not already selected
    if (!this.isCharacterSelected(defaultCharacter.id)) {
      this.selectedCharacters.push(defaultCharacter);
    }

    // Add the program
    if (!this.isProgramSelected(program.id)) {
      this.selectedPrograms.push(program);
    }

    this.saveToLocalStorage();
    this.updateUI();

    // Re-render programs to update availability
    if (window.programsRenderer) {
      const mainCharacter = this.selectedCharacters[0] || null;
      window.programsRenderer.setSelectedCharacter(mainCharacter);
    }
  }

  /**
   * Calculate total price and duration
   */
  calculateTotal() {
    if (this.lastCalculation) {
      return {
        totalPrice: this.lastCalculation.totalPrice || 0,
        totalHours: this.lastCalculation.totalDuration || 0,
        details: this.lastCalculation.details || []
      };
    }

    let totalPrice = 0;
    let totalHours = 0;
    const details = [];

    // If no programs selected, use character base price
    if (this.selectedPrograms.length === 0) {
      this.selectedCharacters.forEach(character => {
        const price = character.pricing?.hourly || 0;
        totalPrice += price;
        totalHours += 1; // Default 1 hour

        details.push({
          type: 'character',
          name: character.name,
          price: price,
          hours: 1
        });
      });
    } else {
      // Calculate based on programs
      this.selectedPrograms.forEach(program => {
        if (!program) {
          return;
        }

        const pricing = program.pricing || {};
        let programPrice = 0;
        let programHours = 1;

        const duration = Number(program.duration) || this.parseDurationToHours(program.duration) || 1;

        if (pricing.isCharacterPrice) {
          // Use first character's price
          const character = this.selectedCharacters[0];
          programPrice = (character?.pricing?.hourly || 0) * duration;
        } else {
          const isPerHour = String(pricing.unit || '').includes('/час');
          programPrice = isPerHour
            ? (pricing.amount || 0) * duration
            : (pricing.amount || 0);
        }

        programHours = duration;

        totalPrice += programPrice;
        totalHours += programHours;

        // Find which character will perform this program
        let performingCharacter = null;

        // First, check if any selected character can perform this program
        performingCharacter = this.selectedCharacters[0] || null;

        // If no selected character can perform it, use default character
        if (!performingCharacter && program.defaultCharacterId) {
          const defaultChar = window.charactersData?.find(
            c => c.id === program.defaultCharacterId
          );
          if (defaultChar) {
            performingCharacter = defaultChar;
          }
        }

        details.push({
          type: 'program',
          name: program.name,
          price: programPrice,
          hours: programHours,
          character: performingCharacter
        });
      });
    }

    this.selectedServices.forEach((service) => {
      if (!service) {
        return;
      }

      const quantity = Math.max(1, Number(service.quantity) || 1);
      const servicePrice = (Number(service.pricing?.amount) || 0) * quantity;
      totalPrice += servicePrice;

      details.push({
        type: 'service',
        name: service.name,
        price: servicePrice,
        quantity
      });
    });

    return {
      totalPrice,
      totalHours,
      details
    };
  }

  /**
   * Get selection summary text
   */
  getSummaryText() {
    const { totalPrice, totalHours, details } = this.calculateTotal();

    let summary = '';

    // Build summary from details
    const characterNames = [];
    const programNames = [];
    const serviceNames = [];

    details.forEach(detail => {
      const detailName = detail.name || detail.programName || detail.characterName;
      const detailCharacterName = detail.character?.name || detail.characterName;

      if (detail.type === 'character' && detailName) {
        characterNames.push(detailName);
      } else if (detail.type === 'program') {
        let programText = detailName;
        if (detailCharacterName && !characterNames.includes(detailCharacterName)) {
          characterNames.push(detailCharacterName);
        }
        if (programText) {
          programNames.push(programText);
        }
      } else if (detail.type === 'service' && detailName) {
        const quantitySuffix = detail.quantity > 1 ? ` x${detail.quantity}` : '';
        serviceNames.push(`${detailName}${quantitySuffix}`);
      }
    });

    if (characterNames.length > 0) {
      summary += characterNames.join(' + ');
    }

    if (programNames.length > 0) {
      if (summary) summary += ' | ';
      summary += programNames.join(' + ');
    }

    if (serviceNames.length > 0) {
      if (summary) summary += ' | ';
      summary += serviceNames.join(' + ');
    }

    return summary || 'Ничего не выбрано';
  }

  /**
   * Get price summary text
   */
  getPriceSummaryText() {
    const { totalPrice, totalHours } = this.calculateTotal();

    let text = '';

    if (totalHours > 0) {
      text = `${this.formatDurationLabel(totalHours)} ${totalPrice.toLocaleString('ru-RU')} ₽`;
    } else {
      text = `${totalPrice.toLocaleString('ru-RU')} ₽`;
    }

    return text;
  }

  /**
   * Pluralize hours in Russian
   */
  pluralizeHours(hours) {
    const cases = [2, 0, 1, 1, 1, 2];
    const titles = ['час', 'часа', 'часов'];
    return titles[
      hours % 100 > 4 && hours % 100 < 20
        ? 2
        : cases[hours % 10 < 5 ? hours % 10 : 5]
    ];
  }

  formatDurationLabel(hours) {
    if (hours === 0.5) return '30 минут';
    if (!Number.isInteger(hours)) return `${hours} часа`;
    return `${hours} ${this.pluralizeHours(hours)}`;
  }

  /**
   * Update UI elements
   */
  updateUI() {
    if (window.programsRenderer && typeof window.programsRenderer.setSelectedCharacter === 'function') {
      const currentId = window.programsRenderer.selectedCharacter?.id || null;
      const nextId = this.selectedCharacters[0]?.id || null;
      if (currentId !== nextId) {
        window.programsRenderer.setSelectedCharacter(this.selectedCharacters[0] || null);
      }
    }

    this.updateBottomBar();
    this.updateProgramCards();
    this.updateCharacterCards();
    this.updateServiceCards();
  }

  /**
   * Update bottom selection bar
   */
  updateBottomBar() {
    const bar = document.getElementById('selection-bar');
    if (!bar) return;

    this.calculateTotal();

    if (this.selectedCharacters.length === 0 && this.selectedPrograms.length === 0) {
      bar.classList.remove('selection-bar-visible');
      return;
    }

    bar.classList.add('selection-bar-visible');

    const summaryEl = bar.querySelector('.selection-summary');
    const priceEl = bar.querySelector('.selection-price');
    const continueBtn = bar.querySelector('.selection-continue-btn');

    if (summaryEl) {
      summaryEl.textContent = this.getSummaryText();
    }

    if (priceEl) {
      priceEl.textContent = this.getPriceSummaryText();
    }

    if (continueBtn) {
      const buttonState = this.getContinueButtonState();
      continueBtn.disabled = !buttonState.enabled;
      continueBtn.dataset.mode = buttonState.mode;
      continueBtn.textContent = buttonState.label;

      if (buttonState.enabled) {
        continueBtn.classList.remove('btn-disabled');
      } else {
        continueBtn.classList.add('btn-disabled');
      }
    }
  }

  /**
   * Update program cards selection state
   */
  updateProgramCards() {
    document.querySelectorAll('.program-card').forEach(card => {
      const programId = parseInt(card.dataset.programId);
      const isSelected = this.isProgramSelected(programId);
      const selectedProgram = this.selectedPrograms.find(p => p.id === programId);
      const selectBtn = card.querySelector('.btn-select');
      const hoursEl = card.querySelector('.btn-select-hours');
      const hoursValueEl = card.querySelector('.hours-value');

      if (isSelected) {
        card.classList.add('program-card-selected');
        card.classList.add('selected');
        card.querySelectorAll('.btn-select').forEach((btn) => btn.classList.remove('selected'));
        if (selectBtn) selectBtn.style.display = 'none';
        if (hoursEl) hoursEl.style.display = 'inline-flex';
        if (hoursValueEl) {
          const duration = Number(selectedProgram?.duration) || 1;
          hoursValueEl.textContent = this.formatDurationLabel(duration);
        }
      } else {
        card.classList.remove('program-card-selected');
        card.classList.remove('selected');
        card.querySelectorAll('.btn-select').forEach((btn) => btn.classList.remove('selected'));
        if (selectBtn) selectBtn.style.display = 'inline-flex';
        if (hoursEl) hoursEl.style.display = 'none';
      }
    });
  }

  /**
   * Update character cards selection state
   */
  updateCharacterCards() {
    document.querySelectorAll('.character-card').forEach(card => {
      const characterId = parseInt(card.dataset.characterId);
      if (!characterId) return;

      if (this.isCharacterSelected(characterId)) {
        card.classList.add('character-card-selected');
        card.classList.add('selected');
        card.querySelectorAll('.btn-select').forEach((btn) => {
          btn.classList.add('selected');
          const textEl = btn.querySelector('.btn-select-text');
          if (textEl) textEl.textContent = 'Выбрано';
        });
      } else {
        card.classList.remove('character-card-selected');
        card.classList.remove('selected');
        card.querySelectorAll('.btn-select').forEach((btn) => {
          btn.classList.remove('selected');
          const textEl = btn.querySelector('.btn-select-text');
          if (textEl) textEl.textContent = 'Выбрать';
        });
      }
    });
  }

  updateServiceCards() {
    document.querySelectorAll('.additional-service-card[data-service-id]').forEach((card) => {
      const serviceId = Number(card.dataset.serviceId);
      const selectedService = this.getSelectedService(serviceId);
      const isSelected = Boolean(selectedService);
      const button = card.querySelector('.additional-service-action');
      const qtyControls = card.querySelector('.additional-service-qty');
      const qtyValue = card.querySelector('.additional-service-qty-value');
      const footer = card.querySelector('.additional-service-footer');

      card.classList.toggle('selected', isSelected);
      card.classList.toggle('additional-service-card-selected', isSelected);

      if (button) {
        button.classList.add('btn-select');
        button.classList.remove('btn-secondary');

        if (!button.querySelector('.btn-select-checkbox')) {
          button.innerHTML = `
            <span class="btn-select-checkbox">✓</span>
            <span class="btn-select-text">Выбрать</span>
          `;
        } else {
          const textEl = button.querySelector('.btn-select-text');
          if (textEl) textEl.textContent = 'Выбрать';
        }

        const textEl = button.querySelector('.btn-select-text');
        button.classList.toggle('selected', false);
        button.style.display = isSelected ? 'none' : 'inline-flex';

        if (textEl) {
          textEl.style.display = 'inline';
        }
      }

      // We do not move qtyControls to the footer anymore, it stays in the character-overlay on top of the image

      if (qtyControls) {
        qtyControls.hidden = !isSelected;
        qtyControls.style.display = isSelected ? 'inline-flex' : 'none';
      }

      if (qtyValue) {
        qtyValue.textContent = String(selectedService?.quantity || 1);
      }
    });
  }

  /**
   * Clear all selections
   */
  openCalculationModal() {
    const modal = document.getElementById('calculation-modal');
    if (!modal) return;

    const { totalPrice, details } = this.calculateTotal();

    // Обновляем общую стоимость
    const totalPriceEl = modal.querySelector('.estimate-total-price');
    if (totalPriceEl) {
      totalPriceEl.textContent = `${totalPrice.toLocaleString()} ₽`;
    }

    // Генерируем детальный список вкладок
    const listEl = modal.querySelector('.estimate-details-list');
    if (listEl) {
      listEl.innerHTML = '';

      details.forEach(item => {
        const row = document.createElement('div');
        row.className = 'estimate-item-row';

        let icon = '✨';
        let iconClass = 'service';
        let metaText = '';

        if (item.type === 'character') {
          icon = '🦹';
          iconClass = 'character';
          metaText = 'Аниматор / Персонаж';
        } else if (item.type === 'program') {
          icon = '🎭';
          iconClass = 'program';
          metaText = `Программа • ${item.hours} ч`;
        } else if (item.type === 'service') {
          icon = '✨';
          iconClass = 'service';
          metaText = `Доп. услуга • ${item.quantity} шт`;
        }

        row.innerHTML = `
          <div class="estimate-item-left">
            <div class="estimate-item-icon ${iconClass}">${icon}</div>
            <div class="estimate-item-info">
              <div class="estimate-item-name">${item.name}</div>
              <div class="estimate-item-meta">${metaText}</div>
            </div>
          </div>
          <div class="estimate-item-price">${item.price.toLocaleString()} ₽</div>
        `;
        listEl.appendChild(row);
      });

      if (details.length === 0) {
        listEl.innerHTML = '<div style="text-align: center; padding: 2rem; color: #64748b;">Вы ничего не выбрали</div>';
      }
    }

    // Показываем окно
    modal.classList.add('active');
    document.body.classList.add('modal-open');
  }

  closeCalculationModal() {
    const modal = document.getElementById('calculation-modal');
    if (modal) {
      modal.classList.remove('active');
    }
    document.body.classList.remove('modal-open');
  }

  confirmOrder() {
    this.closeCalculationModal();

    const { totalPrice, details } = this.calculateTotal();
    
    let text = 'Здравствуйте! Я хочу заказать детский праздник "Енот в деле".\n\n📋 СОСТАВ ПРАЗДНИКА:\n';
    
    const characters = details.filter(i => i.type === 'character');
    const programs = details.filter(i => i.type === 'program');
    const services = details.filter(i => i.type === 'service');

    if (characters.length > 0) {
      text += '🦹 Выбранные персонажи:\n';
      characters.forEach(c => {
        text += `- ${c.name} (${c.price.toLocaleString()} ₽)\n`;
      });
      text += '\n';
    }

    if (programs.length > 0) {
      text += '🎭 Выбранные программы:\n';
      programs.forEach(p => {
        text += `- ${p.name} — ${p.hours} ч (${p.price.toLocaleString()} ₽)\n`;
      });
      text += '\n';
    }

    if (services.length > 0) {
      text += '✨ Дополнительные услуги:\n';
      services.forEach(s => {
        text += `- ${s.name} — ${s.quantity} шт (${s.price.toLocaleString()} ₽)\n`;
      });
      text += '\n';
    }

    text += `💰 ИТОГОВАЯ СТОИМОСТЬ: ${totalPrice.toLocaleString()} ₽`;

    // Заполняем текстовое поле описания праздника
    const textarea = document.querySelector('.contact-form textarea') || document.querySelector('.contact-form .form-textarea');
    if (textarea) {
      textarea.value = text;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));

      // Скроллим до формы заказа
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }

      // Красивое уведомление
      if (typeof window.showNotification === 'function') {
        window.showNotification('Смета успешно сформирована! Заполните Ваши контакты и отправьте заявку.', 'success');
      } else {
        alert('Смета успешно сформирована! Пожалуйста, укажите имя и телефон в форме внизу страницы.');
      }
    } else {
      // Сохраняем смету в локальное хранилище и перенаправляем на главную к форме контактов
      localStorage.setItem('autofill_estimate_text', text);
      localStorage.setItem('autofill_estimate_flag', 'true');
      window.location.href = 'index.html#contact';
    }
  }

  checkDeferredAutofill() {
    if (localStorage.getItem('autofill_estimate_flag') === 'true') {
      const text = localStorage.getItem('autofill_estimate_text');
      
      const performAutofill = () => {
        const textarea = document.querySelector('.contact-form textarea') || document.querySelector('.contact-form .form-textarea');
        if (textarea && text) {
          textarea.value = text;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          
          localStorage.removeItem('autofill_estimate_flag');
          localStorage.removeItem('autofill_estimate_text');
          
          // Плавно скроллим к контактам после небольшой задержки для полной загрузки стилей страницы
          setTimeout(() => {
            const contactSection = document.getElementById('contact');
            if (contactSection) {
              contactSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });
            }
            if (typeof window.showNotification === 'function') {
              window.showNotification('Ваша новогодняя смета успешно перенесена! Заполните контакты для отправки.', 'success');
            }
          }, 800);
        }
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', performAutofill);
      } else {
        performAutofill();
      }
    }
  }

  clearAll() {
    this.selectedCharacters = [];
    this.selectedPrograms = [];
    this.selectedServices = [];
    this.lastCalculation = null;
    this.resolutions = [];

    if (window.programsRenderer && typeof window.programsRenderer.setSelectedCharacter === 'function') {
      window.programsRenderer.setSelectedCharacter(null);
    }

    this.saveToLocalStorage();
    this.updateUI();
  }

  /**
   * Get current selection state
   */
  getState() {
    return {
      characters: this.selectedCharacters,
      programs: this.selectedPrograms,
      services: this.selectedServices,
      total: this.calculateTotal()
    };
  }
}

// Initialize selection manager
window.selectionManager = new SelectionManager();
