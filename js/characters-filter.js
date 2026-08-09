// Characters Filtering System
class CharactersFilter {
    constructor(renderer) {
        this.renderer = renderer;
        this.filters = {
            search: '',
            age: [],
            gender: [],
            category: [],
            activities: []
        };
        this.debounceTimer = null;

        this.initializeFilters();
        this.initializeAccordions();
    }

    normalizeCategory(category) {
        const aliases = {
            'superheroes': 'superhero',
            'animals': 'animal'
        };

        return aliases[category] || category;
    }

    initializeAccordions() {
        const accordions = document.querySelectorAll('.filter-accordion');
        
        accordions.forEach(accordion => {
            const header = accordion.querySelector('.filter-accordion-header');
            
            if (header) {
                // Открыть/закрыть при клике
                header.addEventListener('click', (e) => {
                    e.preventDefault();
                    accordion.classList.toggle('open');
                });
            }
            
            // Закрыть при уходе курсора с аккордеона
            accordion.addEventListener('mouseleave', () => {
                accordion.classList.remove('open');
            });
        });
    }

    initializeFilters() {
        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value.toLowerCase().trim();
                this.debounceFilter();
            });
        }

        // Checkboxes (age, gender, category, activities)
        const checkboxes = document.querySelectorAll('.filter-checkbox input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateCheckboxFilters();
                this.applyFilters();
            });
        });

        // Sort select
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.renderer.sortCharacters(e.target.value);
            });
        }

        // Reset button
        const resetBtn = document.querySelector('.btn-reset-filters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }
    }

    // Update checkbox filters (age, gender, category, activities)
    updateCheckboxFilters() {
        // Reset arrays
        this.filters.age = [];
        this.filters.gender = [];
        this.filters.category = [];
        this.filters.activities = [];

        // Age checkboxes
        document.querySelectorAll('input[name="age"]:checked').forEach(checkbox => {
            this.filters.age.push(checkbox.value);
        });

        // Gender checkboxes
        document.querySelectorAll('input[name="gender"]:checked').forEach(checkbox => {
            this.filters.gender.push(checkbox.value);
        });

        // Category checkboxes
        document.querySelectorAll('input[name="category"]:checked').forEach(checkbox => {
            this.filters.category.push(checkbox.value);
        });

        // Activities checkboxes
        document.querySelectorAll('input[name="activities"]:checked').forEach(checkbox => {
            this.filters.activities.push(checkbox.value);
        });
    }

    // Debounced filter application (for search input)
    debounceFilter() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.applyFilters();
        }, 300);
    }

    // Apply all filters
    applyFilters() {
        if (!this.renderer || !this.renderer.characters) return;

        let filtered = [...this.renderer.characters];

        // Search filter
        if (this.filters.search) {
            filtered = filtered.filter(char => {
                return char.name.toLowerCase().includes(this.filters.search) ||
                       char.description.short.toLowerCase().includes(this.filters.search) ||
                       (char.tags || []).some(tag => tag.toLowerCase().includes(this.filters.search));
            });
        }

        // Age filter
        if (this.filters.age.length > 0) {
            filtered = filtered.filter(char => {
                return this.filters.age.some(ageRange => {
                    return this.matchesAgeRange(char.features.age, ageRange);
                });
            });
        }

        // Gender filter
        if (this.filters.gender.length > 0) {
            filtered = filtered.filter(char => {
                return this.filters.gender.includes(char.features.gender);
            });
        }

        // Category filter
        if (this.filters.category.length > 0) {
            filtered = filtered.filter(char => {
                return this.filters.category.includes(this.normalizeCategory(char.category));
            });
        }

        // Activities filter
        if (this.filters.activities.length > 0) {
            filtered = filtered.filter(char => {
                return this.filters.activities.some(activity => {
                    return char.features.activities.includes(activity);
                });
            });
        }

        // Update renderer
        this.renderer.filteredCharacters = filtered;
        this.renderer.renderCharacters();
    }

    // Check if character age range matches filter
    matchesAgeRange(charAge, filterAge) {
        // charAge format: "5-10" or "3-8"
        // filterAge format: "0-3", "3-5", "5-8", "8-12", "12+"

        // Parse character age range
        const charAges = charAge.split('-').map(a => parseInt(a.trim()));
        const charMin = charAges[0];
        const charMax = charAges[1] || charAges[0];

        // Parse filter age range
        if (filterAge === '12+') {
            return charMax >= 12;
        }

        const filterAges = filterAge.split('-').map(a => parseInt(a.trim()));
        const filterMin = filterAges[0];
        const filterMax = filterAges[1];

        // Check if ranges overlap
        return charMax >= filterMin && charMin <= filterMax;
    }

    // Reset all filters
    resetFilters() {
        // Reset search
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';
        this.filters.search = '';

        // Reset checkboxes
        document.querySelectorAll('.filter-checkbox input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        this.filters.age = [];
        this.filters.gender = [];
        this.filters.category = [];
        this.filters.activities = [];

        // Reset sort
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) sortSelect.value = 'popular';

        // Apply filters
        this.applyFilters();
    }
}

// Create global instance (will be initialized after renderer)
let charactersFilter = null;
