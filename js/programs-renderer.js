/**
 * Programs Renderer Module
 * Handles rendering and filtering of programs based on selected characters
 */

class ProgramsRenderer {
  constructor() {
    this.programs = [];
    this.selectedCharacter = null;
  }

  /**
   * Initialize the programs renderer
   */
  async init() {
    await this.loadPrograms();
    this.renderPrograms(); // Render all programs on init
  }

  /**
   * Load programs from JSON file
   */
  async loadPrograms() {
    try {
      const response = await fetch('data/programs-data.json');
      const data = await response.json();
      this.programs = data.programs;
      console.log('Programs loaded:', this.programs.length);
    } catch (error) {
      console.error('Error loading programs:', error);
      this.programs = [];
    }
  }

  /**
   * Set the selected character to filter available programs
   */
  setSelectedCharacter(character) {
    this.selectedCharacter = character;
    this.renderPrograms();
  }

  /**
   * Render programs to the container
   */
  renderPrograms() {
    const container = document.getElementById('programs-grid');
    if (!container) {
      console.warn('Programs container not found');
      return;
    }

    // Clear container
    container.innerHTML = '';

    // Show empty state if no programs
    if (this.programs.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>Программы не найдены</p>
        </div>
      `;
      return;
    }

    let availablePrograms = [];
    let unavailablePrograms = [];

    if (this.selectedCharacter) {
      const availableProgramIds = this.selectedCharacter.availablePrograms || [];

      // Filter programs that the character can perform
      availablePrograms = this.programs.filter(program =>
        availableProgramIds.includes(program.id)
      );

      unavailablePrograms = this.programs.filter(program =>
        !availableProgramIds.includes(program.id)
      );
    } else {
      // No character selected - all programs are available
      availablePrograms = this.programs;
    }

    // Render available programs
    availablePrograms.forEach((program, index) => {
      const card = this.createProgramCard(program, index, true);
      container.appendChild(card);
    });

    // Render unavailable programs if any (only when character is selected)
    if (this.selectedCharacter && unavailablePrograms.length > 0) {
      const offset = availablePrograms.length;
      unavailablePrograms.forEach((program, index) => {
        const card = this.createProgramCard(program, offset + index, false);
        container.appendChild(card);
      });
    }

    console.log('Programs rendered:', this.programs.length);
  }

  /**
   * Create a program card element (same as character cards)
   */
  createProgramCard(program, index, isAvailable = true) {
    const card = document.createElement('div');
    card.className = 'character-card';
    card.setAttribute('data-program-id', program.id);
    card.setAttribute('data-available', isAvailable);
    card.style.animationDelay = `${index * 0.05}s`;

    // Badges
    const badges = [];
    if (!isAvailable) badges.push('<span class="badge badge-unavailable">Недоступно</span>');

    // Photo count
    let photoCount = 0;
    if (program.images) {
      const sources = [];
      if (program.images.main) sources.push(program.images.main);
      if (program.images.gallery && Array.isArray(program.images.gallery)) {
        sources.push(...program.images.gallery);
      }
      const uniqueSources = [...new Set(sources)];
      photoCount = uniqueSources.length;
    }

    // Price display
    let priceDisplay;
    // Если программа требует персонажа по умолчанию и нет выбранного персонажа
    if (program.requiresCharacter && !this.selectedCharacter && !program.defaultCharacterId) {
      priceDisplay = '⚠️ Требует выбор персонажа';
    } else if (program.pricing.isCharacterPrice && this.selectedCharacter) {
      priceDisplay = `${this.selectedCharacter.pricing?.hourly || 0}`;
    } else if (program.pricing.amount) {
      priceDisplay = `${program.pricing.amount}`;
    } else {
      priceDisplay = 'По запросу';
    }

    const priceUnit = program.pricing.unit || '₽';

    card.innerHTML = `
      <div class="character-image-container">
        ${badges.length > 0 ? `<div class="character-badges">${badges.join('')}</div>` : ''}

        ${photoCount > 1 ? `
          <div class="character-photo-counter">
            <span class="character-photo-counter-text">${photoCount}</span>
          </div>
        ` : ''}

        <div class="character-image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);">
          <img src="${program.images?.main || 'images/placeholder.jpg'}" alt="${program.name}" class="character-photo" loading="lazy" decoding="async">
        </div>

        <div class="character-overlay">
          <button class="btn btn-select" data-program-id="${program.id}">
            <span class="btn-select-checkbox">✓</span>
            <span class="btn-select-text">Выбрать</span>
            <span class="btn-select-hours" style="display: none;">
              <span class="hours-minus" data-program-id="${program.id}">−</span>
              <span class="hours-value">1 час</span>
              <span class="hours-plus" data-program-id="${program.id}">+</span>
            </span>
          </button>
        </div>
      </div>

      <div class="character-info">
        <div class="character-header">
          <h3 class="character-name">${program.name}</h3>
        </div>
        <p class="character-description">${program.description || ''}</p>

        <div class="character-meta">
          <div class="character-features">
            ${program.duration ? `
              <span class="feature-tag">
                <span class="feature-icon">⏱️</span>
                ${program.duration}
              </span>
            ` : ''}
            ${program.targetAge ? `
              <span class="feature-tag">
                <span class="feature-icon">👶</span>
                ${program.targetAge}
              </span>
            ` : ''}
            ${program.category ? `
              <span class="feature-tag">
                <span class="feature-icon">${program.emoji || '🎉'}</span>
                ${this.getCategoryLabel(program.category)}
              </span>
            ` : ''}
          </div>
        </div>

        <div class="character-footer">
          <div class="character-price">
            <span class="price-label">от</span>
            <span class="price-amount">${priceDisplay}</span>
            <span class="price-currency">${priceUnit}</span>
          </div>
        </div>
      </div>
    `;

    // Add click event for select buttons
    const selectBtns = card.querySelectorAll('.btn-select');
    selectBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Если клик по плюс/минус для часов — не трогаем выбор программы
        if (e.target.closest('.hours-plus') || e.target.closest('.hours-minus')) {
          return;
        }
        this.toggleSelection(program, btn);
      });
    });

    // Add click events for hours +/- buttons
    const minusBtn = card.querySelector('.hours-minus');
    const plusBtn = card.querySelector('.hours-plus');

    if (minusBtn) {
      minusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.decrementHours(program.id, card);
      });
    }

    if (plusBtn) {
      plusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.incrementHours(program.id, card);
      });
    }

    return card;
  }

  // Toggle program selection (like character selection)
  toggleSelection(program, button) {
    if (!window.selectedPrograms) {
      window.selectedPrograms = new Map();
    }

    const programId = program.id;
    const card = button.closest('.character-card');

    if (window.selectedPrograms.has(programId)) {
      // Deselect
      window.selectedPrograms.delete(programId);
      card.classList.remove('selected');
      const allBtns = card.querySelectorAll('.btn-select');
      allBtns.forEach(btn => {
        btn.classList.remove('selected');
        const textEl = btn.querySelector('.btn-select-text');
        const hoursEl = btn.querySelector('.btn-select-hours');
        if (textEl) textEl.style.display = 'inline';
        if (hoursEl) hoursEl.style.display = 'none';
      });
    } else {
      // Check if program requires character selection and no character selected
      if (program.requiresCharacter && !this.selectedCharacter) {
        alert('Обязательно нужно выбрать персонажа для этой программы!');
        return;
      }

      // Select with default 1 hour
      const hours = 1;

      window.selectedPrograms.set(programId, { hours });
      card.classList.add('selected');
      const allBtns = card.querySelectorAll('.btn-select');
      allBtns.forEach(btn => {
        btn.classList.add('selected');
        const textEl = btn.querySelector('.btn-select-text');
        const hoursEl = btn.querySelector('.btn-select-hours');
        if (textEl) textEl.style.display = 'none';
        if (hoursEl) hoursEl.style.display = 'inline-flex';
      });
    }

    // Update selection panel
    this.updateSelectionPanel();
  }

  // Update hours for selected program
  updateProgramHours(programId, hours, card) {
    if (window.selectedPrograms && window.selectedPrograms.has(programId)) {
      window.selectedPrograms.set(programId, { hours });

      // Update display
      const hoursValue = card.querySelector('.hours-value');
      if (hoursValue) {
        hoursValue.textContent = this.formatHoursText(hours);
      }

      this.updateSelectionPanel();
    }
  }

  // Increment hours
  incrementHours(programId, card) {
    if (!window.selectedPrograms || !window.selectedPrograms.has(programId)) return;

    const currentData = window.selectedPrograms.get(programId);
    const currentHours = currentData.hours || 1;
    const newHours = Math.min(currentHours + 0.5, 10); // Max 10 hours

    this.updateProgramHours(programId, newHours, card);
  }

  // Decrement hours
  decrementHours(programId, card) {
    if (!window.selectedPrograms || !window.selectedPrograms.has(programId)) return;

    const currentData = window.selectedPrograms.get(programId);
    const currentHours = currentData.hours || 1;
    const newHours = Math.max(currentHours - 0.5, 0.5); // Min 0.5 hours

    this.updateProgramHours(programId, newHours, card);
  }

  // Format hours text
  formatHoursText(hours) {
    if (hours === 0.5) return '30 минут';
    if (hours === 1) return '1 час';
    if (hours === 1.5) return '1.5 часа';
    if (hours >= 2 && hours < 5) return `${hours} часа`;
    return `${hours} часов`;
  }

  // Get category label in Russian
  getCategoryLabel(category) {
    const labels = {
      'animation': 'Анимация',
      'party': 'Вечеринка',
      'creative': 'Творчество',
      'show': 'Шоу',
      'food': 'Кулинария',
      'games': 'Игры',
      'active': 'Активная'
    };
    return labels[category] || category;
  }


  /**
   * Update selection panel with both characters and programs
   */
  updateSelectionPanel() {
    const hasCharacters = window.selectedCharacters && window.selectedCharacters.size > 0;
    const hasPrograms = window.selectedPrograms &&
      (window.selectedPrograms instanceof Map ? window.selectedPrograms.size > 0 : window.selectedPrograms.size > 0);

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
    if (!panel && window.charactersRenderer) {
      // Use character renderer to create panel if it exists
      panel = window.charactersRenderer.createSelectionPanel();
      document.body.appendChild(panel);
    } else if (!panel) {
      // Create simple panel
      panel = this.createSelectionPanel();
      document.body.appendChild(panel);
    }

    // Build formatted selection text
    const selectionText = this.formatSelectionText();

    // Update panel content
    const namesContainer = panel.querySelector('.selection-names');
    if (namesContainer) {
      namesContainer.textContent = selectionText;
    }

    // Show panel
    panel.classList.add('active');
  }

  /**
   * Format selection text with programs, characters, duration and price
   */
  formatSelectionText() {
    const selectedProgramsMap = window.selectedPrograms || new Map();
    const selectedPrograms = Array.from(selectedProgramsMap.keys())
      .map(id => this.programs.find(p => p.id === id))
      .filter(p => p);

    const selectedCharacters = Array.from(window.selectedCharacters || [])
      .map(id => window.charactersRenderer?.characters.find(c => c.id === id))
      .filter(c => c);

    if (selectedPrograms.length === 0) {
      // Only characters selected
      const names = selectedCharacters.map(c => c.name).join(', ');
      return `Персонажи: ${names}`;
    }

    // Get characters for programs (selected or default)
    const getCharactersForProgram = (program) => {
      if (selectedCharacters.length > 0) {
        return selectedCharacters;
      }
      // Use default character if available
      if (program.defaultCharacterId && window.charactersRenderer) {
        const defaultChar = window.charactersRenderer.characters.find(
          c => c.id === program.defaultCharacterId
        );
        return defaultChar ? [defaultChar] : [];
      }
      return [];
    };

    // Calculate total duration and price
    let totalHours = 0;
    let totalPrice = 0;

    selectedPrograms.forEach(program => {
      // Get selected hours for this program
      const programData = selectedProgramsMap.get(program.id);
      const hours = programData?.hours || 1;
      totalHours += hours;

      // Calculate price based on new pricing structure
      if (program.pricing.isCharacterPrice) {
        // Цена зависит от выбранного персонажа
        const characters = getCharactersForProgram(program);
        characters.forEach(char => {
          totalPrice += char.pricing.hourly * hours;
        });
      } else {
        // Фиксированная цена программы
        totalPrice += program.pricing.amount * hours;
      }
    });

    // Format programs text
    const programNames = selectedPrograms.map(p => p.name).join(', ');

    // Format characters text
    let charactersText = '';
    if (selectedCharacters.length > 0) {
      const charNames = selectedCharacters.map(c => c.name).join(', ');
      charactersText = selectedCharacters.length === 1
        ? `с персонажем ${charNames}`
        : `с персонажами ${charNames}`;
    } else {
      // Use default characters
      const defaultChars = selectedPrograms
        .map(p => getCharactersForProgram(p))
        .flat()
        .filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i); // unique

      if (defaultChars.length > 0) {
        const charNames = defaultChars.map(c => c.name).join(', ');
        charactersText = defaultChars.length === 1
          ? `с персонажем ${charNames}`
          : `с персонажами ${charNames}`;
      }
    }

    // Format duration
    let durationText = '';
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);

    if (hours > 0 && minutes > 0) {
      durationText = `${hours} ч ${minutes} мин`;
    } else if (hours > 0) {
      durationText = `${totalHours} ${totalHours === 1 ? 'час' : totalHours < 5 ? 'часа' : 'часов'}`;
    } else {
      durationText = `${minutes} минут`;
    }

    return `${programNames} ${charactersText}, продолжительность: ${durationText}, стоимость ${totalPrice.toLocaleString('ru-RU')}₽`;
  }

  /**
   * Parse duration string to minutes
   */
  parseDuration(durationStr) {
    if (!durationStr) return 60; // default 1 hour

    // Check for range format like "1-3 часа" - take minimum (first number)
    const rangeMatch = durationStr.match(/(\d+)-(\d+)\s*(ч|час)/i);
    if (rangeMatch) {
      // Use minimum value from range
      return parseInt(rangeMatch[1]) * 60;
    }

    // Check for range in minutes like "30-40 минут"
    const rangeMinMatch = durationStr.match(/(\d+)-(\d+)\s*(м|мин)/i);
    if (rangeMinMatch) {
      // Use minimum value from range
      return parseInt(rangeMinMatch[1]);
    }

    // Extract single numbers
    const hourMatch = durationStr.match(/(\d+)\s*(ч|час)/i);
    const minMatch = durationStr.match(/(\d+)\s*(м|мин)/i);

    let totalMinutes = 0;
    if (hourMatch) {
      totalMinutes += parseInt(hourMatch[1]) * 60;
    }
    if (minMatch) {
      totalMinutes += parseInt(minMatch[1]);
    }

    // If no match, try to extract first number and assume hours
    if (totalMinutes === 0) {
      const numMatch = durationStr.match(/(\d+)/);
      if (numMatch) {
        totalMinutes = parseInt(numMatch[1]) * 60;
      } else {
        totalMinutes = 60; // default
      }
    }

    return totalMinutes;
  }

  /**
   * Create selection panel (fallback if character renderer doesn't exist)
   */
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
      // Scroll to contact section or show contact form
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    });

    return panel;
  }

  /**
   * Get program by ID
   */
  getProgramById(id) {
    return this.programs.find(p => p.id === id);
  }

  /**
   * Get all programs
   */
  getAllPrograms() {
    return this.programs;
  }
}

// Initialize programs renderer
window.programsRenderer = new ProgramsRenderer();
