/**
 * Booking Page Interactive Controller
 * Manages form conditional inputs, visual timeline tracks, range inputs,
 * hour increments, instant price recalculation, and order submission.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------------------------------
    // 1. Initial State & Data Loading
    // ---------------------------------------------------------
    let selection = {
        characters: [],
        programs: [],
        services: []
    };

    let allPrograms = [];
    let allCharacters = [];
    let scheduleItems = [];
    let performerTracks = [];
    let selectedCharactersPool = [];

    // Load from localStorage or create defaults if empty
    try {
        const saved = localStorage.getItem('selectionState');
        if (saved) {
            selection = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to parse selectionState:', e);
    }

    // Ensure we have a rich default setup if they visited booking.html directly
    const hasSelections = (selection.characters && selection.characters.length > 0) || 
                          (selection.programs && selection.programs.length > 0) || 
                          (selection.services && selection.services.length > 0);

    if (!hasSelections) {
        // Fallback default playground selections (e.g. 2 hrs animation, 1 hr bubble show, 1 hr photo)
        selection = {
            characters: [
                { id: 1, name: "Енот в деле", pricing: { hourly: 5000 } },
                { id: 2, name: "Эльза", pricing: { hourly: 4000 } }
            ],
            programs: [
                { id: 101, name: "Анимационная программа", duration: 2, pricing: { amount: 5000, unit: "₽/час" } },
                { id: 102, name: "Шоу мыльных пузырей", duration: 1, pricing: { amount: 6000, unit: "₽/час" } }
            ],
            services: [
                { id: 201, name: "Фотограф", quantity: 1, pricing: { amount: 4000, unit: "₽/час" } }
            ]
        };
    }

    // Helper: format floating hour to HH:MM string
    function formatTime(hourFloat) {
        const h = Math.floor(hourFloat);
        const m = Math.round((hourFloat - h) * 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    // Helper: format duration to human readable
    function formatDuration(hours) {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        if (m === 0) {
            if (h === 1) return '1 час';
            if (h >= 2 && h <= 4) return `${h} часа`;
            return `${h} часов`;
        }
        if (h === 0) {
            return `${m} мин`;
        }
        return `${h} ч. ${m} мин.`;
    }

    function initializeSchedule() {
        scheduleItems = [];
        performerTracks = [];
        selectedCharactersPool = selection.characters || [];

        // Automatically add standard "Анимационная программа" if they selected characters but no programs
        if ((!selection.programs || selection.programs.length === 0) && selectedCharactersPool.length > 0) {
            selection.programs = [
                { id: 999, name: "Анимационная программа", duration: 2.0, pricing: { amount: 5000, unit: "₽/час" } }
            ];
        }

        let defaultStartHour = 10.0; // Start scheduling from 10:00

        // Add selected Programs (and automatically assign first character to the first program by default)
        if (selection.programs && selection.programs.length > 0) {
            selection.programs.forEach((prog, index) => {
                const isPerHour = String(prog.pricing?.unit || '').includes('/час') || prog.pricing?.isCharacterPrice;
                const duration = Number(prog.duration) || 1.0;
                
                const programUniqueId = `prog-${prog.id || index}`;

                scheduleItems.push({
                    uniqueId: programUniqueId,
                    type: 'program',
                    name: prog.name,
                    basePrice: Number(prog.pricing?.amount) || 6000,
                    isHourly: isPerHour,
                    startTime: defaultStartHour,
                    duration: duration,
                    icon: '🎭',
                    colorClass: 'program-bar'
                });

                // Auto-assign magician or standard animator
                const isMagicianProg = prog.id === 9 || String(prog.name || '').toLowerCase().includes('фокус') || String(prog.name || '').toLowerCase().includes('иллюзион');

                if (isMagicianProg) {
                    const wizardChar = allCharacters.find(c => c.id === 6);
                    const hourlyPrice = wizardChar?.pricing?.hourly || 4500;
                    const charName = wizardChar?.name || 'Волшебник';
                    
                    scheduleItems.push({
                        uniqueId: `char-assign-${programUniqueId}-6`,
                        type: 'character_assignment',
                        name: `Аниматор: ${charName}`,
                        charId: 6,
                        parentProgramId: programUniqueId,
                        basePrice: Number(hourlyPrice),
                        isHourly: true,
                        startTime: defaultStartHour,
                        duration: duration,
                        icon: '🎩',
                        colorClass: 'character-bar'
                    });
                } else if (index === 0 && selectedCharactersPool.length > 0) {
                    const char = selectedCharactersPool[0];
                    if (char.id !== 6) {
                        scheduleItems.push({
                            uniqueId: `char-assign-${programUniqueId}-${char.id}`,
                            type: 'character_assignment',
                            name: `Аниматор: ${char.name}`,
                            charId: char.id,
                            parentProgramId: programUniqueId,
                            basePrice: Number(char.pricing?.hourly) || 3000,
                            isHourly: true,
                            startTime: defaultStartHour,
                            duration: duration,
                            icon: '🦹',
                            colorClass: 'character-bar'
                        });
                    }
                }

                defaultStartHour += duration; // Continuous schedule helper
            });
        }

        // Add selected Additional Services
        if (selection.services && selection.services.length > 0) {
            selection.services.forEach((serv, index) => {
                const isHourly = ['Фотограф', 'Ведущий праздника', 'Фото и видео'].some(keyword => serv.name.includes(keyword));
                const quantity = Number(serv.quantity) || 1;
                
                scheduleItems.push({
                    uniqueId: `serv-${serv.id || index}`,
                    type: 'service',
                    name: serv.name,
                    basePrice: Number(serv.pricing?.amount) || 4000,
                    isHourly: isHourly,
                    startTime: 11.0, // Default photographer welcome zone starts at 11:00
                    duration: isHourly ? quantity : 1.0,
                    quantity: isHourly ? 1 : quantity,
                    icon: '✨',
                    colorClass: 'service-bar'
                });
            });
        }
    }

    // Асинхронно загружаем базы данных
    Promise.all([
        fetch('data/programs-data.json').then(r => r.json()).catch(e => ({ programs: [] })),
        fetch('data/characters-data.json').then(r => r.json()).catch(e => ({ characters: [] }))
    ]).then(([progData, charData]) => {
        allPrograms = progData.programs || [];
        allCharacters = charData.characters || [];
        
        initializeSchedule();
        renderTimeline();
    });

    // ---------------------------------------------------------
    // 2. Timeline Grid & Hour Scale Generation
    // ---------------------------------------------------------
    const startScaleHour = 8;  // 08:00
    const endScaleHour = 22;   // 22:00
    const totalScaleHours = endScaleHour - startScaleHour; // 14 hours

    const scaleContainer = document.getElementById('timeline-hours-scale');
    if (scaleContainer) {
        scaleContainer.innerHTML = '';
        const spacer = document.createElement('div');
        spacer.className = 'timeline-scale-spacer';
        scaleContainer.appendChild(spacer);
        
        for (let h = startScaleHour; h <= endScaleHour; h += 2) {
            const tick = document.createElement('div');
            tick.className = 'hour-tick';
            tick.textContent = `${String(h).padStart(2, '0')}:00`;
            scaleContainer.appendChild(tick);
        }
    }

    // ---------------------------------------------------------
    // 3. Conditional Booking Form Logic
    // ---------------------------------------------------------
    // Event type cards toggle
    const eventCards = document.querySelectorAll('.event-type-card');
    const childBirthdayBlock = document.getElementById('child-birthday-block');
    let selectedEventType = 'child-birthday';

    eventCards.forEach(card => {
        card.addEventListener('click', () => {
            eventCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            const eventType = card.dataset.type;
            selectedEventType = eventType;

            if (eventType === 'child-birthday') {
                childBirthdayBlock.classList.add('active');
                // Make inputs required inside block
                document.getElementById('child-name').required = true;
            } else {
                childBirthdayBlock.classList.remove('active');
                document.getElementById('child-name').required = false;
            }
        });
    });

    // Make initial child-name required
    const childNameInput = document.getElementById('child-name');
    if (childNameInput) {
        childNameInput.required = true;
    }

    // Set today's date + 7 days for event date default
    const eventDateInput = document.getElementById('event-date');
    if (eventDateInput) {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        eventDateInput.value = date.toISOString().split('T')[0];
    }

    // Gender selection toggle
    const genderCards = document.querySelectorAll('.gender-card');
    let selectedGender = 'boy';

    genderCards.forEach(card => {
        card.addEventListener('click', () => {
            genderCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedGender = card.dataset.gender;
        });
    });

    // ---------------------------------------------------------
    // 4. Render & Recalculate Timeline & Price
    // ---------------------------------------------------------
    const tracksContainer = document.getElementById('timeline-tracks-container');
    const configList = document.getElementById('timeline-config-list');
    const totalPriceEl = document.getElementById('summary-total-price');

    function getPerformerType(item) {
        const name = (item.name || '').toLowerCase();
        if (name.includes('фото') || name.includes('видео')) {
            return 'photographer';
        }
        if (name.includes('фокус') || name.includes('магическ') || name.includes('волшебник') || item.charId === 6 || item.defaultCharacterId === 6) {
            return 'magician';
        }
        return 'animator';
    }

    function renderTimeline() {
        // Запоминаем текущие положения блоков перед перерисовкой (FLIP: First)
        const firstPositions = {};
        if (tracksContainer) {
            const bars = tracksContainer.querySelectorAll('.timeline-bar');
            bars.forEach(bar => {
                const id = bar.dataset.id;
                if (id) {
                    firstPositions[id] = bar.getBoundingClientRect();
                }
            });
        }

        // Управляем видимостью таймлайна в зависимости от количества персонажей
        const visualWrapper = document.querySelector('.timeline-visual-wrapper');
        const sectionTitle = document.querySelector('.timeline-section-header .form-section-title');
        const introText = document.querySelector('.timeline-intro-text');

        const hasMultiplePerformers = selectedCharactersPool.length > 1;

        if (visualWrapper) {
            visualWrapper.style.display = hasMultiplePerformers ? '' : 'none';
        }

        if (sectionTitle) {
            sectionTitle.innerHTML = hasMultiplePerformers 
                ? '<span class="step-num">2</span>Интерактивный таймлайн' 
                : '<span class="step-num">2</span>Настройка времени';
        }

        if (introText) {
            introText.textContent = hasMultiplePerformers
                ? 'Перетаскивайте ползунки, чтобы распределить время и настроить паузы. Стоимость пересчитается автоматически!'
                : 'Настройте длительность программ и количество услуг. Стоимость пересчитается автоматически!';
        }

        tracksContainer.innerHTML = '';
        configList.innerHTML = '';
        let grandTotalPrice = 0;

        // 1. Collect all active visual blocks that need rendering
        const activeBlocks = [];
        scheduleItems.forEach((item) => {
            if (item.type === 'character_assignment') {
                return;
            }
            const isAquagrim = item.name && item.name.toLowerCase().includes('аквагрим');
            if (item.type === 'program' || isAquagrim) {
                const assigned = scheduleItems.filter(i => i.type === 'character_assignment' && i.parentProgramId === item.uniqueId);
                if (assigned.length === 0) {
                    activeBlocks.push(item);
                } else {
                    assigned.forEach(subItem => {
                        activeBlocks.push(subItem);
                    });
                }
            } else {
                activeBlocks.push(item);
            }
        });

        // 2. Build named performer tracks based on selected characters, services, and unassigned programs
        performerTracks = [];

        // Make sure we include all assigned characters as well as selected ones
        const trackCharacterIds = new Set(selectedCharactersPool.map(c => c.id));
        scheduleItems.forEach(item => {
            if (item.type === 'character_assignment') {
                trackCharacterIds.add(item.charId);
            }
        });

        // Create tracks for characters
        trackCharacterIds.forEach(charId => {
            let char = selectedCharactersPool.find(c => c.id === charId);
            if (!char && allCharacters) {
                char = allCharacters.find(c => c.id === charId);
            }
            const name = char ? char.name : (charId === 6 ? 'Фокусник' : `Аниматор ${charId}`);
            const emoji = charId === 6 ? '🎩' : '🦹';
            
            // Get all blocks of type character_assignment for this specific character
            const charBlocks = activeBlocks.filter(b => b.type === 'character_assignment' && b.charId === charId);
            charBlocks.sort((a, b) => a.startTime - b.startTime);
            
            performerTracks.push({
                id: `char-${charId}`,
                type: 'character',
                charId: charId,
                name: name,
                emoji: emoji,
                blocks: charBlocks
            });
        });

        // Create tracks for hourly/timeline services
        const serviceBlocks = activeBlocks.filter(b => b.type === 'service');
        serviceBlocks.forEach(item => {
            let emoji = '✨';
            if (item.name.toLowerCase().includes('фото') || item.name.toLowerCase().includes('видео')) {
                emoji = '📸';
            }
            performerTracks.push({
                id: `service-${item.uniqueId}`,
                type: 'service',
                name: item.name,
                emoji: emoji,
                blocks: [item]
            });
        });

        // Create an "unassigned" track for program blocks that are not yet assigned to any character
        const unassignedBlocks = activeBlocks.filter(b => b.type === 'program');
        if (unassignedBlocks.length > 0) {
            unassignedBlocks.sort((a, b) => a.startTime - b.startTime);
            performerTracks.push({
                id: 'unassigned',
                type: 'unassigned',
                name: 'Ожидают исполнителя',
                emoji: '⏳',
                blocks: unassignedBlocks
            });
        }

        // 3. Render performer tracks with left-aligned headers and right-aligned bars
        performerTracks.forEach((track) => {
            const row = document.createElement('div');
            row.className = 'timeline-track-row';
            row.dataset.trackId = track.id;

            // Left Performer Label
            const labelEl = document.createElement('div');
            labelEl.className = 'timeline-track-label';
            labelEl.innerHTML = `<span>${track.emoji}</span><span>${track.name}</span>`;
            row.appendChild(labelEl);

            // Right Container for Bars
            const barContainer = document.createElement('div');
            barContainer.className = 'timeline-track-bar-container';

            // Render all bars packed on this performer
            track.blocks.forEach(item => {
                const bar = document.createElement('div');
                bar.className = `timeline-bar ${item.colorClass}`;
                bar.dataset.id = item.uniqueId;
                
                // Calculate absolute layout percentages
                const leftPct = ((item.startTime - startScaleHour) / totalScaleHours) * 100;
                const widthPct = (item.duration / totalScaleHours) * 100;

                bar.style.left = `${Math.max(0, Math.min(100, leftPct))}%`;
                bar.style.width = `${Math.max(2, Math.min(100 - leftPct, widthPct))}%`;

                // Nested label for safety clipping
                const label = document.createElement('div');
                label.className = 'timeline-bar-label';
                
                let displayName = item.name;
                if (item.type === 'character_assignment') {
                    const parent = scheduleItems.find(p => p.uniqueId === item.parentProgramId);
                    const progName = parent ? parent.name : '';
                    const animName = item.name.replace('Аниматор: ', '');
                    displayName = progName ? `${progName}: ${animName}` : animName;
                }
                
                label.textContent = displayName;
                bar.appendChild(label);

                // Render visual 15-minute break tail if not last block on this performer's track
                const idx = track.blocks.indexOf(item);
                const isNotLast = idx < track.blocks.length - 1;
                if (isNotLast) {
                    const breakPctOfBar = (0.25 / item.duration) * 100;
                    bar.style.setProperty('--break-width', `${breakPctOfBar}%`);
                    
                    const breakTail = document.createElement('div');
                    breakTail.className = 'timeline-bar-break-tail';
                    
                    const breakIcon = document.createElement('span');
                    breakIcon.textContent = '⏳';
                    breakTail.appendChild(breakIcon);
                    
                    const breakTooltip = document.createElement('div');
                    breakTooltip.className = 'timeline-break-tooltip';
                    breakTooltip.textContent = 'Перерыв на переодевание и подготовку (15 минут)';
                    breakTail.appendChild(breakTooltip);
                    
                    bar.appendChild(breakTail);
                }

                // Drag handles for resizing (only if hourly-based)
                if (item.isHourly) {
                    const resizeHandle = document.createElement('div');
                    resizeHandle.className = 'timeline-resize-handle';
                    bar.appendChild(resizeHandle);
                }

                // Beautiful interactive tooltip
                const tooltip = document.createElement('div');
                tooltip.className = 'timeline-tooltip';
                
                if (item.type === 'character_assignment') {
                    const parent = scheduleItems.find(p => p.uniqueId === item.parentProgramId);
                    const progName = parent ? parent.name : '';
                    const animName = item.name.replace('Аниматор: ', '');
                    tooltip.textContent = `${progName ? `${progName}: ` : ''}${animName} [${formatTime(item.startTime)} — ${formatTime(item.startTime + item.duration)}]`;
                } else {
                    tooltip.textContent = `${item.name} [${formatTime(item.startTime)} — ${formatTime(item.startTime + item.duration)}]`;
                }
                bar.appendChild(tooltip);

                barContainer.appendChild(bar);
            });

            row.appendChild(barContainer);
            tracksContainer.appendChild(row);
        });

        // 4. Generate pricing and render configuration cards
        scheduleItems.forEach((item) => {
            if (item.type === 'character_assignment') return;

            let itemPrice = 0;
            let breakdownHTML = '';
            const isAquagrim = item.name && item.name.toLowerCase().includes('аквагрим');
            const isProgramOrAquagrim = item.type === 'program' || isAquagrim;
            const assigned = isProgramOrAquagrim ? scheduleItems.filter(i => i.type === 'character_assignment' && i.parentProgramId === item.uniqueId) : [];

            if (isProgramOrAquagrim) {
                let breakdownItemsHTML = '';
                if (assigned.length > 0) {
                    let totalProgramPrice = 0;
                    
                    assigned.forEach((c) => {
                        const animatorName = c.name.replace('Аниматор: ', '');
                        const charCost = item.isHourly ? (item.basePrice * c.duration) : item.basePrice;
                        totalProgramPrice += charCost;
                        
                        const costDetailsText = item.isHourly 
                            ? `${formatDuration(c.duration)} — ${charCost.toLocaleString()} ₽ (${item.basePrice} ₽/ч)`
                            : `Фикс — ${charCost.toLocaleString()} ₽`;
                            
                        breakdownItemsHTML += `<div style="font-size: 0.74rem; color: #e84393; margin-top: 0.15rem; font-weight: 600;">• ${animatorName}: ${costDetailsText}</div>`;
                    });

                    itemPrice = totalProgramPrice;
                    breakdownHTML = `
                        <div style="margin-top: 0.35rem; padding: 0.4rem; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; width: 100%;">
                            <div style="font-size: 0.75rem; color: #475569; font-weight: 700;">Детализация по аниматорам:</div>
                            ${breakdownItemsHTML}
                            <div style="font-size: 0.75rem; color: #e84393; font-weight: 700; margin-top: 0.25rem; border-top: 1px dashed #e2e8f0; padding-top: 0.25rem;">
                                Итого за программу: ${itemPrice.toLocaleString()} ₽
                            </div>
                        </div>
                    `;
                } else {
                    itemPrice = item.isHourly ? (item.basePrice * item.duration) : item.basePrice;
                }
            } else if (item.isHourly) {
                itemPrice = item.basePrice * item.duration;
            } else {
                itemPrice = item.basePrice * (item.quantity || 1);
            }
            grandTotalPrice += itemPrice;

            const configCard = document.createElement('div');
            configCard.className = 'timeline-config-item';

            let durationControlsHTML = '';
            if (item.isHourly) {
                durationControlsHTML = `
                    <div class="control-slider-group">
                        <div class="control-label-row">
                            <span>Длительность:</span>
                            <span class="time-readout" id="readout-dur-${item.uniqueId}">${formatDuration(item.duration)}</span>
                        </div>
                        <div class="hours-control-wrapper">
                            <button type="button" class="hour-btn" onclick="adjustDuration('${item.uniqueId}', -0.25)">−</button>
                            <span class="hours-value-display" id="display-dur-${item.uniqueId}">${formatDuration(item.duration)}</span>
                            <button type="button" class="hour-btn" onclick="adjustDuration('${item.uniqueId}', 0.25)">+</button>
                        </div>
                    </div>
                `;
            } else {
                durationControlsHTML = `
                    <div class="control-slider-group">
                        <div class="control-label-row">
                            <span>Количество:</span>
                            <span class="time-readout">${item.quantity || 1} шт</span>
                        </div>
                        <div class="hours-control-wrapper">
                            <button type="button" class="hour-btn" onclick="adjustQuantity('${item.uniqueId}', -1)">−</button>
                            <span class="hours-value-display">${item.quantity || 1} шт</span>
                            <button type="button" class="hour-btn" onclick="adjustQuantity('${item.uniqueId}', 1)">+</button>
                        </div>
                    </div>
                `;
            }

            // Assign characters checklist UI (for programs and Aquagrim)
            let localCharactersPool = [...selectedCharactersPool];
            const dbProgram = allPrograms.find(p => p.name && p.name.toLowerCase().trim() === item.name.toLowerCase().trim());
            
            let defaultCharId = dbProgram ? dbProgram.defaultCharacterId : null;
            if (isAquagrim && !defaultCharId) {
                defaultCharId = 360; // Аквагример
            }

            if (defaultCharId) {
                const defChar = allCharacters.find(c => c.id === defaultCharId);
                if (defChar && !localCharactersPool.some(c => c.id === defChar.id)) {
                    localCharactersPool.push({
                        id: defChar.id,
                        name: defChar.name,
                        pricing: {
                            hourly: defChar.pricing?.hourly || 3000
                        }
                    });
                }
            }

            // Strict check: magician program can only be performed by the Magician (ID 6)
            const isMagicianProgram = (dbProgram && dbProgram.id === 9) || item.name.toLowerCase().includes('фокус') || item.name.toLowerCase().includes('иллюзион');
            if (isMagicianProgram) {
                const defChar = allCharacters.find(c => c.id === 6);
                if (defChar) {
                    localCharactersPool = [{
                        id: defChar.id,
                        name: defChar.name,
                        pricing: {
                            hourly: defChar.pricing?.hourly || 4500
                        }
                    }];
                } else {
                    localCharactersPool = [];
                }
            }

            let characterCheckboxesHTML = '';
            if (isProgramOrAquagrim && localCharactersPool.length > 0) {
                characterCheckboxesHTML = `
                    <div class="assigned-characters-selector" style="margin-top: 1rem; padding-top: 0.8rem; border-top: 1px dashed #e2e8f0; width: 100%;">
                        <span style="display: block; font-size: 0.82rem; font-weight: 700; color: #475569; margin-bottom: 0.5rem;">Кто проводит программу?</span>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.6rem;">
                `;
                
                localCharactersPool.forEach(char => {
                    const isChecked = scheduleItems.some(i => i.type === 'character_assignment' && i.parentProgramId === item.uniqueId && i.charId === char.id);
                    characterCheckboxesHTML += `
                        <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; font-weight: 600; background: ${isChecked ? '#ffe8f0' : '#f8fafc'}; border: 1.5px solid ${isChecked ? '#fd79a8' : '#e2e8f0'}; padding: 0.35rem 0.65rem; border-radius: 10px; cursor: pointer; transition: all 0.2s ease; user-select: none;">
                            <input type="checkbox" 
                                   style="accent-color: #e84393; cursor: pointer;"
                                   ${isChecked ? 'checked' : ''} 
                                   onchange="toggleCharacterAssignment('${item.uniqueId}', ${char.id}, this.checked)">
                            <span>${char.name}</span>
                        </label>
                        `;
                });
                
                characterCheckboxesHTML += `
                        </div>
                    </div>
                `;
            }

            // Set constraints on start sliders
            let sliderMin = startScaleHour;
            let sliderMax = endScaleHour - item.duration;

            let itemTitle = item.name;
            let itemRateText = item.isHourly ? `${item.basePrice.toLocaleString()} ₽/час` : `Фикс. цена: ${item.basePrice.toLocaleString()} ₽`;
            if (isProgramOrAquagrim) {
                itemRateText = item.isHourly 
                    ? `${item.basePrice.toLocaleString()} ₽/час (за каждого аниматора)`
                    : `${item.basePrice.toLocaleString()} ₽ (за каждого аниматора)`;
            }

            let controlsHTML = '';
            if (isProgramOrAquagrim && assigned.length > 0) {
                let animatorControlsBlocks = '';
                assigned.forEach(subItem => {
                    const animatorName = subItem.name.replace('Аниматор: ', '');
                    const subSliderMin = startScaleHour;
                    const subSliderMax = endScaleHour - subItem.duration;
                    
                    animatorControlsBlocks += `
                        <div class="animator-controls-block" style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 0.8rem; margin-top: 0.8rem; width: 100%;">
                            <div style="font-size: 0.85rem; font-weight: 700; color: #e84393; margin-bottom: 0.6rem; display: flex; align-items: center; justify-content: space-between; gap: 0.3rem; width: 100%; flex-wrap: wrap;">
                                <div style="display: flex; align-items: center; gap: 0.3rem;">
                                    <span>🦸</span> <span>Аниматор: ${animatorName}</span>
                                </div>
                                <label style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.76rem; font-weight: 700; color: #64748b; cursor: pointer; user-select: none; margin-bottom: 0;">
                                    <input type="checkbox" 
                                           style="accent-color: #e84393; cursor: pointer; width: 14px; height: 14px;" 
                                           ${subItem.isSeparatePerformer ? 'checked' : ''} 
                                           onchange="toggleSeparatePerformer('${subItem.uniqueId}', this.checked)">
                                     <span>Отдельный исполнитель</span>
                                </label>
                            </div>
                            <div class="item-controls-grid" style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 1rem; border-top: none; padding-top: 0;">
                                <!-- Start Time Slider -->
                                <div class="control-slider-group">
                                    <div class="control-label-row">
                                        <span>Время начала:</span>
                                        <span class="time-readout" id="readout-start-${subItem.uniqueId}">${formatTime(subItem.startTime)}</span>
                                    </div>
                                    <input type="range" 
                                           class="custom-range-slider" 
                                           min="${subSliderMin}" 
                                           max="${subSliderMax}" 
                                           step="0.25" 
                                           value="${subItem.startTime}"
                                           oninput="updateStartTime('${subItem.uniqueId}', this.value)">
                                </div>
                                <!-- Duration Adjuster -->
                                <div class="control-slider-group">
                                    <div class="control-label-row">
                                        <span>Длительность:</span>
                                        <span class="time-readout" id="readout-dur-${subItem.uniqueId}">${formatDuration(subItem.duration)}</span>
                                    </div>
                                    <div class="hours-control-wrapper">
                                        <button type="button" class="hour-btn" onclick="adjustDuration('${subItem.uniqueId}', -0.25)">−</button>
                                        <span class="hours-value-display" id="display-dur-${subItem.uniqueId}">${formatDuration(subItem.duration)}</span>
                                        <button type="button" class="hour-btn" onclick="adjustDuration('${subItem.uniqueId}', 0.25)">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
                controlsHTML = `<div style="display: flex; flex-direction: column; gap: 0.5rem; width: 100%;">${animatorControlsBlocks}</div>`;
            } else {
                controlsHTML = `
                    <div class="item-controls-grid">
                        <!-- Start Time Slider -->
                        <div class="control-slider-group">
                            <div class="control-label-row">
                                <span>Время начала:</span>
                                <span class="time-readout" id="readout-start-${item.uniqueId}">${formatTime(item.startTime)}</span>
                            </div>
                            <input type="range" 
                                   class="custom-range-slider" 
                                   min="${sliderMin}" 
                                   max="${sliderMax}" 
                                   step="0.25" 
                                   value="${item.startTime}"
                                   oninput="updateStartTime('${item.uniqueId}', this.value)">
                        </div>
                        <!-- Duration Adjuster -->
                        ${durationControlsHTML}
                    </div>
                `;
            }

            configCard.innerHTML = `
                <div class="item-header">
                    <div class="item-info">
                        <div class="item-icon-circle ${item.type}">${item.icon}</div>
                        <div class="item-title-block">
                            <span class="item-name">${itemTitle}</span>
                            <span class="item-rate">${itemRateText}</span>
                            ${breakdownHTML}
                        </div>
                    </div>
                    <div class="item-price-tag" id="price-tag-${item.uniqueId}">${itemPrice.toLocaleString()} ₽</div>
                </div>
                ${controlsHTML}
                ${characterCheckboxesHTML}
            `;
            configList.appendChild(configCard);
        });

        // Update Grand Total
        totalPriceEl.textContent = `${grandTotalPrice.toLocaleString()}\u00A0₽`;

        // Применяем FLIP-анимацию для блоков (FLIP: Last, Invert, Play)
        if (tracksContainer) {
            const newBars = tracksContainer.querySelectorAll('.timeline-bar');
            newBars.forEach(newBar => {
                const id = newBar.dataset.id;
                const firstRect = firstPositions[id];
                if (firstRect) {
                    const lastRect = newBar.getBoundingClientRect();
                    const deltaX = firstRect.left - lastRect.left;
                    const deltaY = firstRect.top - lastRect.top;
                    
                    if (deltaX !== 0 || deltaY !== 0) {
                        // Шаг Invert: мгновенно возвращаем элемент на старое место без перехода
                        newBar.style.transition = 'none';
                        newBar.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                        
                        // Принудительный reflow для регистрации браузером начального состояния
                        newBar.offsetHeight;
                        
                        // Шаг Play: включаем плавную анимацию перемещения в целевое состояние (0, 0)
                        newBar.style.zIndex = '105';
                        newBar.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
                        newBar.style.transform = 'translate(0px, 0px)';
                        
                        // Очищаем стили анимации после её завершения
                        newBar.addEventListener('transitionend', () => {
                            newBar.style.transform = '';
                            newBar.style.transition = '';
                            newBar.style.zIndex = '';
                        }, { once: true });
                    }
                }
            });
        }
    }

    // Toggle animator assignment to specific programs
    window.toggleCharacterAssignment = (programUniqueId, charId, isChecked) => {
        const program = scheduleItems.find(i => i.uniqueId === programUniqueId);
        if (program) {
            let char = selectedCharactersPool.find(c => c.id === charId);
            if (!char && allCharacters) {
                const dbChar = allCharacters.find(c => c.id === charId);
                if (dbChar) {
                    char = {
                        id: dbChar.id,
                        name: dbChar.name,
                        pricing: {
                            hourly: dbChar.pricing?.hourly || 3000
                        }
                    };
                }
            }
            if (char) {
                const uniqueId = `char-assign-${programUniqueId}-${charId}`;
                if (isChecked) {
                    if (!scheduleItems.some(i => i.uniqueId === uniqueId)) {
                        scheduleItems.push({
                            uniqueId: uniqueId,
                            type: 'character_assignment',
                            name: `Аниматор: ${char.name}`,
                            charId: char.id,
                            parentProgramId: programUniqueId,
                            basePrice: Number(char.pricing?.hourly) || 3000,
                            isHourly: true,
                            startTime: program.startTime,
                            duration: program.duration,
                            icon: '🦹',
                            colorClass: 'character-bar'
                        });
                    }
                } else {
                    scheduleItems = scheduleItems.filter(i => i.uniqueId !== uniqueId);
                }
            }
            renderTimeline();
        }
    };

    // Toggle manual override "Separate Performer"
    window.toggleSeparatePerformer = (uniqueId, isChecked) => {
        const item = scheduleItems.find(i => i.uniqueId === uniqueId);
        if (item) {
            item.isSeparatePerformer = isChecked;
            renderTimeline();
        }
    };

    // Expose adjustment functions to window scope for slider/button events
    window.updateStartTime = (uniqueId, newStart) => {
        const item = scheduleItems.find(i => i.uniqueId === uniqueId);
        if (item) {
            item.startTime = parseFloat(newStart);
            sliderChanged = true;
            
            // 1. Update text readout on the config card
            const readout = document.getElementById(`readout-start-${uniqueId}`);
            if (readout) readout.textContent = formatTime(item.startTime);
            
            // 2. Update visual bar position on the timeline in real time
            const bar = tracksContainer.querySelector(`.timeline-bar[data-id="${uniqueId}"]`);
            if (bar) {
                const leftPct = ((item.startTime - startScaleHour) / totalScaleHours) * 100;
                bar.style.left = `${Math.max(0, Math.min(100, leftPct))}%`;
                
                // 3. Update active tooltip text on the visual bar
                const tooltip = bar.querySelector('.timeline-tooltip');
                if (tooltip) {
                    if (item.type === 'character_assignment') {
                        const parent = scheduleItems.find(p => p.uniqueId === item.parentProgramId);
                        const progName = parent ? parent.name : '';
                        const animName = item.name.replace('Аниматор: ', '');
                        tooltip.textContent = `${progName ? `${progName}: ` : ''}${animName} [${formatTime(item.startTime)} - ${formatTime(item.startTime + item.duration)}]`;
                    } else {
                        tooltip.textContent = `${item.name} [${formatTime(item.startTime)} - ${formatTime(item.startTime + item.duration)}]`;
                    }
                }
            }
        }
    };

    window.adjustDuration = (uniqueId, offset) => {
        const item = scheduleItems.find(i => i.uniqueId === uniqueId);
        if (item) {
            const currentDur = item.duration;
            const newDur = Math.max(1.0, Math.min(6.0, currentDur + offset));
            
            // Adjust start time if duration pushes past 22:00
            if (item.startTime + newDur > endScaleHour) {
                item.startTime = endScaleHour - newDur;
            }
            
            item.duration = newDur;
            renderTimeline();
        }
    };

    window.adjustQuantity = (uniqueId, offset) => {
        const item = scheduleItems.find(i => i.uniqueId === uniqueId);
        if (item) {
            const currentQ = item.quantity || 1;
            item.quantity = Math.max(1, Math.min(10, currentQ + offset));
            renderTimeline();
        }
    };

    // ---------------------------------------------------------
    // 4c. Visual Drag-and-Drop & Resizing logic directly on Timeline
    // ---------------------------------------------------------
    let activeDrag = null; // { item, type, startX, initialStart, initialDuration, trackWidth, assignedSnapshot }
    let sliderChanged = false;

    tracksContainer.addEventListener('mousedown', (e) => {
        const resizeHandle = e.target.closest('.timeline-resize-handle');
        const bar = e.target.closest('.timeline-bar');
        
        if (!bar) return;

        const itemId = bar.dataset.id;
        const item = scheduleItems.find(i => i.uniqueId === itemId);
        if (!item) return;

        e.preventDefault();
        
        const barContainer = bar.closest('.timeline-track-bar-container');
        const trackWidth = barContainer ? barContainer.clientWidth : tracksContainer.clientWidth;

        let assignedSnapshot = null;
        if (item.type === 'program') {
            assignedSnapshot = scheduleItems
                .filter(i => i.type === 'character_assignment' && i.parentProgramId === item.uniqueId)
                .map(char => ({ char, initialStart: char.startTime }));
        }

        activeDrag = {
            item: item,
            type: resizeHandle ? 'resize' : 'move',
            startX: e.clientX,
            startY: e.clientY,
            initialStart: item.startTime,
            initialDuration: item.duration,
            trackWidth: trackWidth,
            barElement: bar,
            assignedSnapshot: assignedSnapshot
        };

        bar.classList.add('dragging');
    });

    tracksContainer.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        const resizeHandle = e.target.closest('.timeline-resize-handle');
        const bar = e.target.closest('.timeline-bar');
        
        if (!bar) return;

        const itemId = bar.dataset.id;
        const item = scheduleItems.find(i => i.uniqueId === itemId);
        if (!item) return;

        const barContainer = bar.closest('.timeline-track-bar-container');
        const trackWidth = barContainer ? barContainer.clientWidth : tracksContainer.clientWidth;

        let assignedSnapshot = null;
        if (item.type === 'program') {
            assignedSnapshot = scheduleItems
                .filter(i => i.type === 'character_assignment' && i.parentProgramId === item.uniqueId)
                .map(char => ({ char, initialStart: char.startTime }));
        }

        activeDrag = {
            item: item,
            type: resizeHandle ? 'resize' : 'move',
            startX: touch.clientX,
            startY: touch.clientY,
            initialStart: item.startTime,
            initialDuration: item.duration,
            trackWidth: trackWidth,
            barElement: bar,
            assignedSnapshot: assignedSnapshot
        };

        bar.classList.add('dragging');
    });

    window.addEventListener('mousemove', (e) => {
        if (!activeDrag) return;
        handleDragMove(e.clientX, e.clientY);
    });

    window.addEventListener('touchmove', (e) => {
        if (!activeDrag) return;
        if (e.touches.length > 0) {
            handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    });

    function handleDragMove(clientX, clientY) {
        const deltaX = clientX - activeDrag.startX;
        const hoursPerPixel = totalScaleHours / activeDrag.trackWidth;
        const deltaHours = deltaX * hoursPerPixel;

        if (activeDrag.type === 'move') {
            let newStart = activeDrag.initialStart + deltaHours;
            newStart = Math.round(newStart * 4) / 4;
            
            // Constrain
            const constraintMin = startScaleHour;
            const constraintMax = endScaleHour - activeDrag.item.duration;
            
            newStart = Math.max(constraintMin, Math.min(constraintMax, newStart));
            activeDrag.item.startTime = newStart;

            // Синхронное горизонтальное перемещение назначенных аниматоров программы
            if (activeDrag.assignedSnapshot) {
                activeDrag.assignedSnapshot.forEach(snapshot => {
                    let charNewStart = snapshot.initialStart + (newStart - activeDrag.initialStart);
                    const charConstraintMax = endScaleHour - snapshot.char.duration;
                    charNewStart = Math.max(startScaleHour, Math.min(charConstraintMax, charNewStart));
                    snapshot.char.startTime = charNewStart;
                });
            }

            // Обработка вертикального перемещения
            if (clientY !== undefined && activeDrag.startY !== undefined) {
                const deltaY = clientY - activeDrag.startY;
                activeDrag.barElement.style.transform = `translateY(${deltaY}px)`;

                // Услуги (service) не перемещаются вертикально по другим дорожкам
                if (activeDrag.item.type !== 'service') {
                    const rows = Array.from(tracksContainer.querySelectorAll('.timeline-track-row'));
                    
                    // Совместимые строки: только строки персонажей (char-*) и техническая строка (unassigned)
                    const compatibleRows = rows.filter(r => {
                        const trackId = r.dataset.trackId || '';
                        return trackId.startsWith('char-') || trackId === 'unassigned';
                    });

                    let targetRow = null;
                    let minDistance = Infinity;

                    compatibleRows.forEach(row => {
                        const rect = row.getBoundingClientRect();
                        const rowCenterY = rect.top + rect.height / 2;
                        const distance = Math.abs(clientY - rowCenterY);
                        
                        if (distance < minDistance) {
                            minDistance = distance;
                            targetRow = row;
                        }
                    });

                    if (targetRow) {
                        activeDrag.targetTrackId = targetRow.dataset.trackId;
                    }
                }
            }

        } else if (activeDrag.type === 'resize') {
            let newDur = activeDrag.initialDuration + deltaHours;
            newDur = Math.round(newDur * 4) / 4;
            
            // Constrain
            newDur = Math.max(1.0, Math.min(6.0, newDur));
            if (activeDrag.item.startTime + newDur > endScaleHour) {
                newDur = endScaleHour - activeDrag.item.startTime;
            }
            activeDrag.item.duration = newDur;
        }

        // Live visual updates at 60fps
        const leftPct = ((activeDrag.item.startTime - startScaleHour) / totalScaleHours) * 100;
        const widthPct = (activeDrag.item.duration / totalScaleHours) * 100;
        activeDrag.barElement.style.left = `${Math.max(0, Math.min(100, leftPct))}%`;
        activeDrag.barElement.style.width = `${Math.max(2, Math.min(100 - leftPct, widthPct))}%`;

        // Update break tail width percentage in real-time during resizing
        if (activeDrag.barElement.querySelector('.timeline-bar-break-tail')) {
            const breakPctOfBar = (0.25 / activeDrag.item.duration) * 100;
            activeDrag.barElement.style.setProperty('--break-width', `${breakPctOfBar}%`);
        }

        // Update active label
        const label = activeDrag.barElement.querySelector('.timeline-bar-label');
        if (label) {
            let displayName = activeDrag.item.name;
            if (activeDrag.item.type === 'character_assignment') {
                const parent = scheduleItems.find(p => p.uniqueId === activeDrag.item.parentProgramId);
                const progName = parent ? parent.name : '';
                const animName = activeDrag.item.name.replace('Аниматор: ', '');
                displayName = progName ? `${progName}: ${animName}` : animName;
            }
            label.textContent = displayName;
        }

        // Update active tooltip
        const tooltip = activeDrag.barElement.querySelector('.timeline-tooltip');
        if (tooltip) {
            if (activeDrag.item.type === 'character_assignment') {
                const parent = scheduleItems.find(p => p.uniqueId === activeDrag.item.parentProgramId);
                const progName = parent ? parent.name : '';
                const animName = activeDrag.item.name.replace('Аниматор: ', '');
                tooltip.textContent = `${progName ? `${progName}: ` : ''}${animName} [${formatTime(activeDrag.item.startTime)} — ${formatTime(activeDrag.item.startTime + activeDrag.item.duration)}]`;
            } else {
                tooltip.textContent = `${activeDrag.item.name} [${formatTime(activeDrag.item.startTime)} — ${formatTime(activeDrag.item.startTime + activeDrag.item.duration)}]`;
            }
        }
    }

    const endDrag = () => {
        if (activeDrag) {
            activeDrag.barElement.classList.remove('dragging');
            activeDrag.barElement.style.transform = ''; // Сбрасываем временный translateY

            if (activeDrag.type === 'move' && activeDrag.targetTrackId !== undefined) {
                const targetTrackId = activeDrag.targetTrackId;
                const draggedItem = activeDrag.item;

                if (draggedItem.type === 'program' || draggedItem.type === 'character_assignment') {
                    if (targetTrackId === 'unassigned') {
                        // Перенос на техническую дорожку "Ожидают исполнителя"
                        if (draggedItem.type === 'character_assignment') {
                            const parentProg = scheduleItems.find(p => p.uniqueId === draggedItem.parentProgramId);
                            if (parentProg) {
                                parentProg.startTime = draggedItem.startTime;
                                parentProg.duration = draggedItem.duration;
                            }
                            // Удаляем назначение исполнителя
                            scheduleItems = scheduleItems.filter(i => i.uniqueId !== draggedItem.uniqueId);
                        }
                    } else if (targetTrackId.startsWith('char-')) {
                        const targetCharId = parseInt(targetTrackId.replace('char-', ''));
                        
                        // Жесткое ограничение для Фокусника (ID 6)
                        const nameLower = (draggedItem.name || '').toLowerCase();
                        const isMagicianProg = nameLower.includes('фокус') || nameLower.includes('иллюзион') || nameLower.includes('маг') || draggedItem.charId === 6;

                        if (isMagicianProg && targetCharId !== 6) {
                            console.warn("Программа Фокусника может быть назначена только Фокуснику!");
                        } else if (!isMagicianProg && targetCharId === 6) {
                            console.warn("Фокусник может проводить только программу Фокусника!");
                        } else {
                            // Проверка наложений на целевой дорожке
                            const otherBlocksOnTrack = scheduleItems.filter(b => 
                                b.uniqueId !== draggedItem.uniqueId &&
                                b.type === 'character_assignment' &&
                                b.charId === targetCharId
                            );

                            let hasOverlap = false;
                            for (let ob of otherBlocksOnTrack) {
                                const overlap = !(
                                    draggedItem.startTime >= ob.startTime + ob.duration ||
                                    draggedItem.startTime + draggedItem.duration <= ob.startTime
                                );
                                if (overlap) {
                                    hasOverlap = true;
                                    break;
                                }
                            }

                            if (hasOverlap) {
                                console.warn("Наложение расписания у исполнителя!");
                            } else {
                                // Назначение
                                let char = selectedCharactersPool.find(c => c.id === targetCharId);
                                if (!char && allCharacters) {
                                    char = allCharacters.find(c => c.id === targetCharId);
                                }
                                const charHourlyPrice = char ? (char.pricing?.hourly || 3000) : 3000;
                                const charName = char ? char.name : `Аниматор ${targetCharId}`;

                                if (draggedItem.type === 'program') {
                                    // Создаем новое назначение аниматора для этой программы
                                    const newAssignId = `char-assign-${draggedItem.uniqueId}-${targetCharId}`;
                                    scheduleItems.push({
                                        uniqueId: newAssignId,
                                        type: 'character_assignment',
                                        name: `Аниматор: ${charName}`,
                                        charId: targetCharId,
                                        parentProgramId: draggedItem.uniqueId,
                                        basePrice: Number(charHourlyPrice),
                                        isHourly: true,
                                        startTime: draggedItem.startTime,
                                        duration: draggedItem.duration,
                                        icon: targetCharId === 6 ? '🎩' : '🦹',
                                        colorClass: 'character-bar'
                                    });
                                } else if (draggedItem.type === 'character_assignment') {
                                    // Переназначаем существующего аниматора
                                    draggedItem.charId = targetCharId;
                                    draggedItem.name = `Аниматор: ${charName}`;
                                    draggedItem.basePrice = Number(charHourlyPrice);
                                    draggedItem.icon = targetCharId === 6 ? '🎩' : '🦹';
                                    draggedItem.uniqueId = `char-assign-${draggedItem.parentProgramId}-${targetCharId}`;
                                }
                            }
                        }
                    }
                }
            }

            activeDrag = null;
            renderTimeline(); // Полная перерисовка с запуском FLIP-анимации
        } else if (sliderChanged) {
            sliderChanged = false;
            renderTimeline(); // Полная перерисовка после изменения ползунка на карточке
        }
    };

    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);

    // Дополнительные обработчики для коммита изменений ползунка при клавиатурном вводе или потере фокуса
    window.addEventListener('keyup', (e) => {
        if (sliderChanged && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown', 'Tab', 'Enter', 'Escape'].includes(e.key)) {
            sliderChanged = false;
            renderTimeline();
        }
    });

    window.addEventListener('blur', () => {
        if (sliderChanged) {
            sliderChanged = false;
            renderTimeline();
        }
    });

    // Initial Render
    renderTimeline();

    // ---------------------------------------------------------
    // 5. Submit Booking with Confetti fireworks!
    // ---------------------------------------------------------
    const submitBtn = document.getElementById('btn-submit-booking');
    const form = document.getElementById('booking-form');
    const successModal = document.getElementById('success-modal');
    const successMessageText = document.getElementById('success-message-text');

    submitBtn.addEventListener('click', (event) => {
        event.preventDefault();

        // Perform validation
        const clientName = document.getElementById('client-name').value.trim();
        const clientPhone = document.getElementById('client-phone').value.trim();
        const clientEmail = document.getElementById('client-email').value.trim();
        const eventDate = document.getElementById('event-date').value;
        const eventLocation = document.getElementById('event-location').value.trim();
        const eventAddress = document.getElementById('event-address').value.trim();

        if (!clientName || !clientPhone || !eventDate || !eventLocation || !eventAddress) {
            // Trigger browser validation tooltips
            form.reportValidity();
            return;
        }

        if (selectedEventType === 'child-birthday' && !document.getElementById('child-name').value.trim()) {
            form.reportValidity();
            return;
        }

        // Generate detailed final summary and schedule
        let summaryHTML = ``;
        let textLog = `Имя заказчика: ${clientName}\nТелефон: ${clientPhone}\n`;
        if (clientEmail) textLog += `Email: ${clientEmail}\n`;
        textLog += `Тип события: ${selectedEventType}\n`;

        if (selectedEventType === 'child-birthday') {
            const childName = document.getElementById('child-name').value.trim();
            const childBirthdate = document.getElementById('child-birthdate').value;
            const childrenCount = document.getElementById('children-count').value;
            textLog += `Именинник: ${childName} (${selectedGender === 'boy' ? 'мальчик' : 'девочка'})\n`;
            if (childBirthdate) textLog += `Дата рождения: ${childBirthdate}\n`;
            textLog += `Количество детей: ${childrenCount}\n`;
        }

        textLog += `Дата праздника: ${eventDate}\nМесто проведения: ${eventLocation}\nАдрес праздника: ${eventAddress}\n\n📋 СОСТАВЛЕННЫЙ ТАЙМЛАЙН:\n`;

        scheduleItems.forEach(item => {
            if (item.type === 'character_assignment') return;

            const formattedStart = formatTime(item.startTime);
            const formattedEnd = formatTime(item.startTime + item.duration);
            
            if (item.type === 'program') {
                const assigned = scheduleItems.filter(i => i.type === 'character_assignment' && i.parentProgramId === item.uniqueId);
                let detail = item.name;
                if (assigned.length === 1) {
                    detail += ` (Ведущий: ${assigned[0].name.replace('Аниматор: ', '')})`;
                }
                textLog += `- ${formattedStart} — ${formattedEnd}: ${detail} (${item.duration} ч)\n`;
                if (assigned.length > 1) {
                    assigned.forEach(char => {
                        const charStart = formatTime(char.startTime);
                        const charEnd = formatTime(char.startTime + char.duration);
                        textLog += `  └─ ${charStart} — ${charEnd}: ${char.name} (${char.duration} ч)\n`;
                    });
                }
            } else {
                textLog += `- ${formattedStart} — ${formattedEnd}: ${item.name} (${item.isHourly ? `${item.duration} ч` : `${item.quantity || 1} шт`})\n`;
            }
        });

        if (performerTracks && performerTracks.length > 0) {
            textLog += `\n👤 РАСПРЕДЕЛЕНИЕ ИСПОЛНИТЕЛЕЙ:\n`;
            performerTracks.forEach(track => {
                let roleName = 'Аниматор';
                if (track.role === 'photographer') roleName = 'Фотограф';
                else if (track.role === 'magician') roleName = 'Фокусник';

                textLog += `Исполнитель ${track.index} (${roleName}):\n`;
                track.blocks.forEach(block => {
                    const start = formatTime(block.startTime);
                    const end = formatTime(block.startTime + block.duration);
                    textLog += `  └─ [${start} — ${end}] ${block.name}\n`;
                });
            });
        }

        const grandTotal = totalPriceEl.textContent;
        textLog += `\n💰 ИТОГОВАЯ СТОИМОСТЬ: ${grandTotal}`;

        console.log("FINAL BOOKING LOG:\n", textLog);

        // Render summary text on modal
        successMessageText.innerHTML = `
            Спасибо, <strong>${clientName}</strong>! Мы забронировали Ваше расписание и уже готовим лучших аниматоров!<br><br>
            <strong>📅 Дата праздника:</strong> ${eventDate.split('-').reverse().join('.')}<br>
            <strong>📍 Место:</strong> ${eventLocation}<br>
            <strong>🏠 Адрес:</strong> ${eventAddress}<br>
            <strong>💰 Согласованная смета:</strong> ${grandTotal}<br><br>
            Наш менеджер свяжется с Вами по телефону <strong>${clientPhone}</strong> в течение 10 минут для подтверждения заказа!
        `;

        // Clear Selection Storage to reset calculator
        localStorage.removeItem('selectionState');

        // Show Modal
        successModal.classList.add('active');
        document.body.classList.add('modal-open');

        // Fire premium full screen confetti celebration
        if (window.confetti) {
            const duration = 4 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1200 };

            function randomInRange(min, max) {
                return Math.random() * (max - min) + min;
            }

            const interval = setInterval(function() {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                // since particles fall down, animate a bit higher than middle
                window.confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                window.confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);
        }
    });
});
