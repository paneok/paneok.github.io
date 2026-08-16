/**
 * Programs Renderer Module
 * Handles rendering and filtering of programs based on selected characters
 */

class ProgramsRenderer {
  constructor() {
    this.programs = [];
    this.selectedCharacter = null;
  }

  normalizeImagePath(path) {
    return String(path || 'images/catalog/placeholder.png').replace(/\\/g, '/');
  }

  /**
   * Initialize the programs renderer
   */
  async init() {
    await this.loadPrograms();

    // URL Parameter filter detection (e.g. ?filter=den-znaniy from September 1st page)
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');
    if (filterParam === 'den-znaniy' || filterParam === '1-sentyabrya') {
      this.activeTagFilter = '1 сентября';
    }

    this.renderPrograms(); // Render all programs on init
  }

  /**
   * Load programs from JSON file
   */
  async loadPrograms() {
    try {
      // Используем API клиент вместо прямого fetch
      const data = await window.apiClient.getPrograms();
      this.programs = data;
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

    if (this.selectedCharacter && Array.isArray(this.selectedCharacter.availablePrograms) && this.selectedCharacter.availablePrograms.length > 0) {
      const availableProgramIds = this.selectedCharacter.availablePrograms;

      // Filter programs that the character can perform
      availablePrograms = this.programs.filter(program =>
        availableProgramIds.includes(program.id)
      );

      unavailablePrograms = this.programs.filter(program =>
        !availableProgramIds.includes(program.id)
      );
    } else {
      // No character selected or character has no program bindings in data
      availablePrograms = this.programs;
    }

    // Apply tag filter (e.g. from ?filter=den-znaniy URL param)
    if (this.activeTagFilter) {
      const tag = this.activeTagFilter.toLowerCase();
      const tagMatched = availablePrograms.filter(p =>
        (p.tags || []).some(t => t.toLowerCase().includes(tag)) ||
        (p.name || '').toLowerCase().includes(tag) ||
        (p.description?.short || '').toLowerCase().includes(tag)
      );
      // Show tag-matched programs first, rest after
      const tagUnmatched = availablePrograms.filter(p =>
        !(p.tags || []).some(t => t.toLowerCase().includes(tag)) &&
        !(p.name || '').toLowerCase().includes(tag) &&
        !(p.description?.short || '').toLowerCase().includes(tag)
      );
      availablePrograms = [...tagMatched, ...tagUnmatched];
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
  }

  /**
   * Create a program card element (same as character cards)
   */
  createProgramCard(program, index, isAvailable = true) {
    const card = document.createElement('div');
    card.className = 'character-card program-card';
    card.setAttribute('data-program-id', program.id);
    card.setAttribute('data-available', isAvailable);
    card.style.animationDelay = `${index * 0.05}s`;
    const isSelected = !!window.selectionManager?.isProgramSelected(program.id);
    const selectedProgram = window.selectionManager?.selectedPrograms?.find((item) => item.id === program.id);
    const selectedDuration = Number(selectedProgram?.duration) || 1;

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
    } else if (program.pricing.isCharacterPrice) {
      priceDisplay = 'от цены персонажа';
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
          <img src="${this.normalizeImagePath(program.images?.main)}" alt="${program.name}" class="character-photo" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='images/catalog/placeholder.png';">
        </div>

        <div class="character-overlay">
          <button class="btn btn-select ${isSelected ? 'selected' : ''}" data-program-id="${program.id}" style="display: ${isSelected ? 'none' : 'inline-flex'};">
            <span class="btn-select-checkbox">✓</span>
            <span class="btn-select-text">Выбрать</span>
          </button>
          <div class="btn-select-hours" style="display: ${isSelected ? 'inline-flex' : 'none'};">
            <button type="button" class="hours-minus" data-program-id="${program.id}" aria-label="Уменьшить время программы">−</button>
            <span class="hours-value">${this.formatHoursText(selectedDuration)}</span>
            <button type="button" class="hours-plus" data-program-id="${program.id}" aria-label="Увеличить время программы">+</button>
          </div>
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
            <span class="price-amount">${priceDisplay}</span>
            <span class="price-currency">${typeof priceDisplay === 'string' && priceDisplay.includes('цены') ? '' : priceUnit}</span>
          </div>
        </div>
      </div>
    `;

    if (isSelected) {
      card.classList.add('selected', 'program-card-selected');
    }

    // Add click event for select buttons
    const selectBtns = card.querySelectorAll('.btn-select');
    selectBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
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
  async toggleSelection(program, button) {
    if (!window.selectionManager) return;

    if (program.requiresCharacter && !this.selectedCharacter) {
      alert('Обязательно нужно выбрать персонажа для этой программы!');
      return;
    }

    await window.selectionManager.toggleProgram(program);
  }

  // Update hours for selected program
  updateProgramHours(programId, hours, card) {
    if (!window.selectionManager?.isProgramSelected(programId)) return;
    window.selectionManager.updateProgramDuration(programId, hours);
  }

  // Increment hours
  incrementHours(programId, card) {
    const currentData = window.selectionManager?.selectedPrograms?.find((item) => item.id === programId);
    if (!currentData) return;
    const currentHours = Number(currentData.duration) || 1;
    const newHours = Math.min(currentHours + 0.5, 10); // Max 10 hours

    this.updateProgramHours(programId, newHours, card);
  }

  // Decrement hours
  decrementHours(programId, card) {
    const currentData = window.selectionManager?.selectedPrograms?.find((item) => item.id === programId);
    if (!currentData) return;
    const currentHours = Number(currentData.duration) || 1;
    if (currentHours <= 0.5) {
      const program = this.programs.find((item) => item.id === programId);
      if (program) {
        this.toggleSelection(program, null);
      }
      return;
    }

    const newHours = Math.max(currentHours - 0.5, 0.5);

    this.updateProgramHours(programId, newHours, card);
  }

  // Format hours text
  formatHoursText(hours) {
    if (hours === 0.5) return '30 минут';
    if (hours === 1) return '1 час';
    if (hours === 1.5) return '1.5 часа';
    if (!Number.isInteger(hours)) return `${hours} часа`;
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
   * Format selection text with programs, characters, duration and price
   */
  formatSelectionText() {
    const selectedPrograms = window.selectionManager?.selectedPrograms || [];
    const selectedCharacters = window.selectionManager?.selectedCharacters || [];

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
      const hours = Number(program.duration) || 1;
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
        const baseAmount = Number(program.pricing.amount) || 0;
        const isPerHour = String(program.pricing.unit || '').includes('/час');
        totalPrice += isPerHour ? baseAmount * hours : baseAmount;
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
