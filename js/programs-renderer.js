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

    if (!this.selectedCharacter) {
      container.innerHTML = `
        <div class="empty-state">
          <p>Сначала выберите персонажа</p>
        </div>
      `;
      return;
    }

    const availableProgramIds = this.selectedCharacter.availablePrograms || [];

    // Filter programs that the character can perform
    const availablePrograms = this.programs.filter(program =>
      availableProgramIds.includes(program.id)
    );

    const unavailablePrograms = this.programs.filter(program =>
      !availableProgramIds.includes(program.id)
    );

    if (availablePrograms.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>Для этого персонажа нет доступных программ</p>
        </div>
      `;
      return;
    }

    // Render available programs
    let html = '<div class="programs-section">';
    html += '<h3>Доступные программы</h3>';
    html += '<div class="programs-list">';

    availablePrograms.forEach(program => {
      html += this.renderProgramCard(program, true);
    });

    html += '</div></div>';

    // Render unavailable programs if any
    if (unavailablePrograms.length > 0) {
      html += '<div class="programs-section programs-unavailable">';
      html += '<h3>Недоступные программы</h3>';
      html += '<p class="programs-hint">Эти программы требуют другого персонажа</p>';
      html += '<div class="programs-list">';

      unavailablePrograms.forEach(program => {
        html += this.renderProgramCard(program, false);
      });

      html += '</div></div>';
    }

    container.innerHTML = html;
  }

  /**
   * Render a single program card
   */
  renderProgramCard(program, isAvailable) {
    const priceDisplay = program.pricing.isCharacterPrice
      ? `${this.selectedCharacter?.pricing?.hourly || 0} ${program.pricing.unit}`
      : `${program.pricing.amount} ${program.pricing.unit}`;

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
      // Select this available program
      window.selectionManager.toggleProgram(program);
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
