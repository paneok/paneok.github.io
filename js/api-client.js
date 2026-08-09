/**
 * API Client для работы с бэкендом
 * Обеспечивает связь между фронтендом и REST API
 */
class ApiClient {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
    this.isOnline = true;
    this.useFallback = true; // Использовать JSON файлы как fallback (автоматически)
    this.charactersCache = null;
    this.programsCache = null;
  }

  shouldUseDirectFallback(endpoint) {
    if (!this.useFallback || this.baseUrl) {
      return false;
    }

    return endpoint.includes('characters')
      || endpoint.includes('programs')
      || endpoint.includes('/api/calculator/calculate')
      || endpoint.includes('/api/calculator/resolve');
  }

  /**
   * Универсальный метод для HTTP запросов
   */
  async request(endpoint, options = {}) {
    if (this.shouldUseDirectFallback(endpoint)) {
      this.isOnline = false;

      if (endpoint.includes('characters') || endpoint.includes('programs')) {
        return this.fallbackToJson(endpoint);
      }

      if (endpoint.includes('/api/calculator/calculate')) {
        return this.calculatePriceFallback(options.body ? JSON.parse(options.body) : {});
      }

      if (endpoint.includes('/api/calculator/resolve')) {
        return this.resolveConflictsFallback(options.body ? JSON.parse(options.body) : {});
      }
    }

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

      this.isOnline = true;
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);

      // Если бэкенд недоступен, пробуем fallback на локальные данные
      if (this.useFallback) {
        if (endpoint.includes('characters') || endpoint.includes('programs')) {
          console.warn('Falling back to JSON files');
          return this.fallbackToJson(endpoint);
        }

        if (endpoint.includes('/api/calculator/calculate')) {
          console.warn('Falling back to local calculator');
          return this.calculatePriceFallback(options.body ? JSON.parse(options.body) : {});
        }

        if (endpoint.includes('/api/calculator/resolve')) {
          console.warn('Falling back to local calculator resolution');
          return this.resolveConflictsFallback(options.body ? JSON.parse(options.body) : {});
        }
      }

      if (this.useFallback && (endpoint.includes('characters') || endpoint.includes('programs'))) {
        return this.fallbackToJson(endpoint);
      }

      throw error;
    }
  }

  /**
   * Fallback на JSON файлы если бэкенд недоступен
   */
  async fallbackToJson(endpoint) {
    this.isOnline = false;

    if (endpoint.includes('characters')) {
      const data = await this.loadCharactersJson();
      // Возвращаем массив персонажей, а не весь объект
      return data.characters || [];
    } else if (endpoint.includes('programs')) {
      const data = await this.loadProgramsJson();
      return data.programs || [];
    }

    throw new Error('Fallback not available for this endpoint');
  }

  async loadCharactersJson() {
    if (!this.charactersCache) {
      const response = await fetch('data/characters-data.json');
      this.charactersCache = await response.json();
    }
    return this.charactersCache;
  }

  async loadProgramsJson() {
    if (!this.programsCache) {
      const response = await fetch('data/programs-data.json');
      this.programsCache = await response.json();
    }
    return this.programsCache;
  }

  async getLocalCharacters() {
    const data = await this.loadCharactersJson();
    return data.characters || [];
  }

  async getLocalPrograms() {
    const data = await this.loadProgramsJson();
    return data.programs || [];
  }

  async calculatePriceFallback(data = {}) {
    this.isOnline = false;

    const allCharacters = await this.getLocalCharacters();
    const allPrograms = await this.getLocalPrograms();

    const selectedCharacters = allCharacters.filter((character) =>
      (data.selectedCharacters || []).includes(character.id)
    );

    let totalPrice = 0;
    let totalDuration = 0;
    const details = [];

    for (const selection of (data.selectedPrograms || [])) {
      const program = allPrograms.find((item) => item.id === selection.programId);
      if (!program) {
        continue;
      }

      const duration = Number(selection.duration) || 1;
      const selectedCharacter = selectedCharacters[0] || null;
      const defaultCharacter = program.defaultCharacterId
        ? allCharacters.find((item) => item.id === program.defaultCharacterId) || null
        : null;
      const effectiveCharacter = selectedCharacter || defaultCharacter;

      let price = 0;
      if (program.pricing?.isCharacterPrice) {
        price = (effectiveCharacter?.pricing?.hourly || 0) * duration;
      } else {
        const baseAmount = Number(program.pricing?.amount) || 0;
        const perHour = String(program.pricing?.unit || '').includes('/час');
        price = perHour ? baseAmount * duration : baseAmount;
      }

      totalPrice += price;
      totalDuration += duration;
      details.push({
        type: 'program',
        programId: program.id,
        programName: program.name,
        duration,
        price,
        characterId: effectiveCharacter?.id || null,
        characterName: effectiveCharacter?.name || null,
        isDefaultCharacter: !selectedCharacter && !!defaultCharacter,
      });
    }

    if ((data.selectedPrograms || []).length === 0) {
      for (const character of selectedCharacters) {
        const price = Number(character.pricing?.hourly) || 0;
        totalPrice += price;
        totalDuration += 1;
        details.push({
          type: 'character',
          characterId: character.id,
          characterName: character.name,
          duration: 1,
          price,
        });
      }
    }

    return {
      totalPrice,
      totalDuration,
      details,
      conflicts: [],
      hasConflicts: false,
    };
  }

  async resolveConflictsFallback(data = {}) {
    const result = await this.calculatePriceFallback(data);
    return {
      totalPrice: result.totalPrice,
      totalDuration: result.totalDuration,
      details: result.details,
      timeSlots: [],
    };
  }

  // ==================== Characters API ====================

  /**
   * Получить всех персонажей
   * @param {Object} filters - Фильтры (category, isActive)
   */
  async getCharacters(filters = {}) {
    const params = new URLSearchParams(filters);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/characters${query}`);
  }

  /**
   * Получить персонажа по ID
   */
  async getCharacter(id) {
    return this.request(`/api/characters/${id}`);
  }

  /**
   * Получить персонажа по slug
   */
  async getCharacterBySlug(slug) {
    return this.request(`/api/characters/slug/${slug}`);
  }

  /**
   * Создать персонажа (для админки)
   */
  async createCharacter(data) {
    return this.request('/api/characters', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Обновить персонажа (для админки)
   */
  async updateCharacter(id, data) {
    return this.request(`/api/characters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Удалить персонажа (для админки)
   */
  async deleteCharacter(id) {
    return this.request(`/api/characters/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== Programs API ====================

  /**
   * Получить все программы
   * @param {Object} filters - Фильтры (category, isActive)
   */
  async getPrograms(filters = {}) {
    const params = new URLSearchParams(filters);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/programs${query}`);
  }

  /**
   * Получить программу по ID
   */
  async getProgram(id) {
    return this.request(`/api/programs/${id}`);
  }

  /**
   * Получить программу по slug
   */
  async getProgramBySlug(slug) {
    return this.request(`/api/programs/slug/${slug}`);
  }

  /**
   * Создать программу (для админки)
   */
  async createProgram(data) {
    return this.request('/api/programs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Обновить программу (для админки)
   */
  async updateProgram(id, data) {
    return this.request(`/api/programs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Удалить программу (для админки)
   */
  async deleteProgram(id) {
    return this.request(`/api/programs/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== Calculator API ====================

  /**
   * Рассчитать стоимость с определением конфликтов
   * @param {Object} data - { selectedCharacters: [], selectedPrograms: [] }
   * @returns {Promise<Object>} - { totalPrice, totalDuration, details, conflicts, hasConflicts }
   */
  async calculatePrice(data) {
    return this.request('/api/calculator/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Пересчитать стоимость с учетом разрешенных конфликтов
   * @param {Object} data - { selectedCharacters, selectedPrograms, resolutions }
   * @returns {Promise<Object>} - { totalPrice, totalDuration, details, timeSlots }
   */
  async resolveConflicts(data) {
    return this.request('/api/calculator/resolve', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== Orders API ====================

  /**
   * Создать заказ
   */
  async createOrder(data) {
    return this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Получить все заказы
   */
  async getOrders(filters = {}) {
    const params = new URLSearchParams(filters);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/orders${query}`);
  }

  /**
   * Получить заказ по ID
   */
  async getOrder(id) {
    return this.request(`/api/orders/${id}`);
  }

  /**
   * Обновить заказ
   */
  async updateOrder(id, data) {
    return this.request(`/api/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Обновить статус заказа
   */
  async updateOrderStatus(id, status) {
    return this.request(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  /**
   * Удалить заказ
   */
  async deleteOrder(id) {
    return this.request(`/api/orders/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== Health Check ====================

  /**
   * Проверить доступность бэкенда
   */
  async healthCheck() {
    if (!this.baseUrl) {
      this.isOnline = false;
      return false;
    }

    try {
      await this.request('/health');
      this.isOnline = true;
      return true;
    } catch (error) {
      this.isOnline = false;
      return false;
    }
  }

  /**
   * Получить статус подключения
   */
  getStatus() {
    return {
      isOnline: this.isOnline,
      baseUrl: this.baseUrl,
      useFallback: this.useFallback,
    };
  }
}

// Создаем глобальный экземпляр API клиента
window.apiClient = new ApiClient();

// При загрузке страницы проверяем доступность бэкенда
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', async () => {
    const isHealthy = await window.apiClient.healthCheck();
    if (!isHealthy && window.apiClient.baseUrl) {
      console.warn('⚠️ Backend is offline, using fallback mode');
      window.apiClient.useFallback = true;
    }
  });
}
