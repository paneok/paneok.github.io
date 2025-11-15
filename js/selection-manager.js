/**
 * Selection Manager Module
 * Manages selection of characters and programs, calculates total price
 */

class SelectionManager {
  constructor() {
    this.selectedCharacters = []; // Array of selected characters
    this.selectedPrograms = []; // Array of selected programs
    this.loadFromLocalStorage();
  }

  /**
   * Load saved selection from localStorage
   */
  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('selectionState');
      if (saved) {
        const state = JSON.parse(saved);
        this.selectedCharacters = state.characters || [];
        this.selectedPrograms = state.programs || [];
      }
    } catch (error) {
      console.error('Error loading selection from localStorage:', error);
    }
  }

  /**
   * Save selection to localStorage
   */
  saveToLocalStorage() {
    try {
      const state = {
        characters: this.selectedCharacters,
        programs: this.selectedPrograms
      };
      localStorage.setItem('selectionState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving selection to localStorage:', error);
    }
  }

  /**
   * Add or remove a character
   */
  toggleCharacter(character) {
    const index = this.selectedCharacters.findIndex(c => c.id === character.id);

    if (index > -1) {
      // Remove character
      this.selectedCharacters.splice(index, 1);
    } else {
      // Add character
      this.selectedCharacters.push(character);
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
  toggleProgram(program) {
    const index = this.selectedPrograms.findIndex(p => p.id === program.id);

    if (index > -1) {
      // Remove program
      this.selectedPrograms.splice(index, 1);
    } else {
      // Add program
      this.selectedPrograms.push(program);
    }

    this.saveToLocalStorage();
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
        let programPrice = 0;
        let programHours = 1;

        if (program.pricing.isCharacterPrice) {
          // Use first character's price
          const character = this.selectedCharacters[0];
          programPrice = character?.pricing?.hourly || 0;
        } else {
          programPrice = program.pricing.amount;
        }

        // Parse hours from unit (e.g., "₽/час" = 1 hour, "₽" = 0 hours for price calc)
        if (program.pricing.unit.includes('час')) {
          programHours = 1;
        } else {
          programHours = 0; // One-time fee
        }

        totalPrice += programPrice;
        totalHours += programHours;

        // Find which character will perform this program
        let performingCharacter = null;

        // First, check if any selected character can perform this program
        for (const character of this.selectedCharacters) {
          if (character.availablePrograms?.includes(program.id)) {
            performingCharacter = character;
            break;
          }
        }

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

    details.forEach(detail => {
      if (detail.type === 'character' && !detail.program) {
        characterNames.push(detail.name);
      } else if (detail.type === 'program') {
        let programText = detail.name;
        if (detail.character && !characterNames.includes(detail.character.name)) {
          characterNames.push(detail.character.name);
        }
        programNames.push(programText);
      }
    });

    if (characterNames.length > 0) {
      summary += characterNames.join(' + ');
    }

    if (programNames.length > 0) {
      if (summary) summary += ' | ';
      summary += programNames.join(' + ');
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
      text = `${totalHours} ${this.pluralizeHours(totalHours)} ${totalPrice.toLocaleString('ru-RU')} ₽`;
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

  /**
   * Update UI elements
   */
  updateUI() {
    this.updateBottomBar();
    this.updateProgramCards();
    this.updateCharacterCards();
  }

  /**
   * Update bottom selection bar
   */
  updateBottomBar() {
    const bar = document.getElementById('selection-bar');
    if (!bar) return;

    const { totalPrice, totalHours } = this.calculateTotal();

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

    // Enable continue button only if both character and program are selected
    if (continueBtn) {
      const canContinue = this.selectedCharacters.length > 0 && this.selectedPrograms.length > 0;
      continueBtn.disabled = !canContinue;

      if (canContinue) {
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
      if (this.isProgramSelected(programId)) {
        card.classList.add('program-card-selected');
      } else {
        card.classList.remove('program-card-selected');
      }
    });
  }

  /**
   * Update character cards selection state
   */
  updateCharacterCards() {
    document.querySelectorAll('.character-card').forEach(card => {
      const characterSlug = card.dataset.slug;
      const character = window.charactersData?.find(c => c.slug === characterSlug);

      if (character && this.isCharacterSelected(character.id)) {
        card.classList.add('character-card-selected');
      } else {
        card.classList.remove('character-card-selected');
      }
    });
  }

  /**
   * Clear all selections
   */
  clearAll() {
    this.selectedCharacters = [];
    this.selectedPrograms = [];
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
      total: this.calculateTotal()
    };
  }
}

// Initialize selection manager
window.selectionManager = new SelectionManager();
