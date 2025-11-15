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
    this.attachEventListeners();
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

    // Always show all programs
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
    let html = '';

    availablePrograms.forEach(program => {
      html += this.renderProgramCard(program, true);
    });

    // Render unavailable programs if any (only when character is selected)
    if (this.selectedCharacter && unavailablePrograms.length > 0) {
      unavailablePrograms.forEach(program => {
        html += this.renderProgramCard(program, false);
      });
    }

    container.innerHTML = html;
  }

  /**
   * Render a single program card
   */
  renderProgramCard(program, isAvailable) {
    let priceDisplay;

    if (program.pricing.isCharacterPrice && this.selectedCharacter) {
      // Show character price if character is selected
      priceDisplay = `${this.selectedCharacter.pricing?.hourly || 0} ${program.pricing.unit}`;
    } else if (program.pricing.variants && program.pricing.variants.length > 0) {
      // Show first variant price if variants exist
      priceDisplay = `от ${program.pricing.variants[0].price} ${program.pricing.unit}`;
    } else {
      // Show base price
      priceDisplay = `${program.pricing.amount} ${program.pricing.unit}`;
    }

    const unavailableClass = !isAvailable ? 'program-card-unavailable' : '';
    const selectedClass = window.selectionManager?.isProgramSelected(program.id) ? 'program-card-selected' : '';

    return `
      <div class="program-card ${unavailableClass} ${selectedClass}"
           data-program-id="${program.id}"
           data-available="${isAvailable}">
        <div class="program-card-header">
          <span class="program-emoji">${program.emoji}</span>
          ${!isAvailable ? '<span class="program-unavailable-badge">Недоступно</span>' : ''}
        </div>
        <h4 class="program-name">${program.name}</h4>
        <p class="program-price">${priceDisplay}</p>
        ${program.description ? `<p class="program-description">${program.description}</p>` : ''}
        ${!isAvailable && program.defaultCharacterId ?
          `<p class="program-default-character">Требуется другой персонаж</p>` :
          ''}
      </div>
    `;
  }

  /**
   * Attach event listeners to program cards
   */
  attachEventListeners() {
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.program-card');
      if (!card) return;

      const programId = parseInt(card.dataset.programId);
      const isAvailable = card.dataset.available === 'true';

      this.handleProgramClick(programId, isAvailable);
    });
  }

  /**
   * Handle program card click
   */
  handleProgramClick(programId, isAvailable) {
    if (!window.selectionManager) {
      console.error('Selection manager not initialized');
      return;
    }

    const program = this.programs.find(p => p.id === programId);
    if (!program) return;

    if (isAvailable) {
      // If no character selected, auto-add default character for this program
      if (!this.selectedCharacter && program.defaultCharacterId) {
        window.selectionManager.addDefaultCharacterForProgram(program);
      } else {
        // Select this available program
        window.selectionManager.toggleProgram(program);
      }
    } else {
      // Program is unavailable - show option to add default character
      this.handleUnavailableProgram(program);
    }
  }

  /**
   * Handle click on unavailable program
   */
  handleUnavailableProgram(program) {
    if (!program.defaultCharacterId) {
      alert('Выберите подходящего персонажа для этой программы');
      return;
    }

    const message = `Эта программа недоступна для текущего персонажа.\n\nХотите добавить подходящего персонажа?`;

    if (confirm(message)) {
      // Auto-add the default character for this program
      window.selectionManager.addDefaultCharacterForProgram(program);
    }
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
