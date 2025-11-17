import express from 'express';
import prisma from '../config/database.js';

const router = express.Router();

/**
 * POST /api/calculator/calculate
 * Рассчитать стоимость заказа с учетом распределения персонажей
 *
 * Request body:
 * {
 *   selectedCharacters: [1, 2, 3], // ID выбранных персонажей
 *   selectedPrograms: [
 *     { programId: 1, duration: 2 }, // Программа с продолжительностью в часах
 *     { programId: 5, duration: 0.5 }
 *   ]
 * }
 */
router.post('/calculate', async (req, res, next) => {
  try {
    const { selectedCharacters = [], selectedPrograms = [] } = req.body;

    // Получаем данные о персонажах
    const characters = await prisma.character.findMany({
      where: { id: { in: selectedCharacters } },
    });

    // Получаем данные о программах
    const programIds = selectedPrograms.map(p => p.programId);
    const programs = await prisma.program.findMany({
      where: { id: { in: programIds } },
    });

    // Создаем map для быстрого доступа
    const charactersMap = new Map(characters.map(c => [c.id, c]));
    const programsMap = new Map(programs.map(p => [p.id, p]));

    let totalPrice = 0;
    let totalDuration = 0;
    const details = [];
    const conflicts = []; // Конфликты, требующие решения пользователя

    // Обрабатываем каждую программу
    for (const selectedProgram of selectedPrograms) {
      const { programId, duration } = selectedProgram;
      const program = programsMap.get(programId);

      if (!program) {
        return res.status(400).json({ error: `Program ${programId} not found` });
      }

      // Определяем, какие персонажи могут проводить программу
      const availableCharacters = characters.filter(char => {
        const availablePrograms = char.availablePrograms
          ? JSON.parse(char.availablePrograms)
          : [];
        return availablePrograms.includes(programId);
      });

      // Сценарий 1: Программа требует персонажа, но он не выбран
      if (program.requiresCharacter && selectedCharacters.length === 0) {
        // Используем персонажа по умолчанию, если есть
        if (program.defaultCharacterId) {
          const defaultChar = await prisma.character.findUnique({
            where: { id: program.defaultCharacterId },
          });

          if (defaultChar) {
            const price = program.isCharacterPrice
              ? defaultChar.hourlyPrice * duration
              : program.basePrice;

            totalPrice += price;
            totalDuration += duration;

            details.push({
              type: 'program',
              programId: program.id,
              programName: program.name,
              characterId: defaultChar.id,
              characterName: defaultChar.name,
              duration,
              price,
              isDefaultCharacter: true,
            });

            // Добавляем конфликт - нужно выбрать персонажа
            conflicts.push({
              type: 'no_character_selected',
              programId: program.id,
              programName: program.name,
              defaultCharacter: {
                id: defaultChar.id,
                name: defaultChar.name,
              },
              options: [
                {
                  type: 'use_default',
                  description: `Использовать персонажа по умолчанию: ${defaultChar.name}`,
                  price,
                },
                {
                  type: 'select_character',
                  description: 'Выбрать другого персонажа',
                  requiresAction: true,
                },
              ],
            });
          } else {
            return res.status(400).json({
              error: `Program "${program.name}" requires character selection`
            });
          }
        } else {
          return res.status(400).json({
            error: `Program "${program.name}" requires character selection`
          });
        }
        continue;
      }

      // Сценарий 2: Выбран персонаж, но программа имеет другого дефолтного персонажа
      if (selectedCharacters.length > 0 &&
          program.defaultCharacterId &&
          !selectedCharacters.includes(program.defaultCharacterId)) {

        const defaultChar = await prisma.character.findUnique({
          where: { id: program.defaultCharacterId },
        });

        const selectedChar = characters[0]; // Берем первого выбранного

        // Создаем конфликт выбора
        conflicts.push({
          type: 'character_mismatch',
          programId: program.id,
          programName: program.name,
          selectedCharacter: {
            id: selectedChar.id,
            name: selectedChar.name,
          },
          defaultCharacter: {
            id: defaultChar.id,
            name: defaultChar.name,
          },
          options: [
            {
              type: 'use_selected',
              description: `${selectedChar.name} проведет эту программу`,
              price: program.isCharacterPrice
                ? selectedChar.hourlyPrice * duration
                : program.basePrice,
            },
            {
              type: 'use_default_same_actor',
              description: `${selectedChar.name} переоденется в ${defaultChar.name} (один актер)`,
              price: program.isCharacterPrice
                ? selectedChar.hourlyPrice * duration
                : program.basePrice,
              note: 'Сохранится магия, один актер',
            },
            {
              type: 'use_default_separate_actor',
              description: `Отдельный актер для ${defaultChar.name}`,
              price: (program.isCharacterPrice
                ? selectedChar.hourlyPrice * duration
                : program.basePrice) + (defaultChar.hourlyPrice * duration),
              note: 'Два персонажа одновременно',
            },
          ],
        });

        // По умолчанию используем выбранного персонажа
        const price = program.isCharacterPrice
          ? selectedChar.hourlyPrice * duration
          : program.basePrice;

        totalPrice += price;
        totalDuration += duration;

        details.push({
          type: 'program',
          programId: program.id,
          programName: program.name,
          characterId: selectedChar.id,
          characterName: selectedChar.name,
          duration,
          price,
          hasConflict: true,
        });

        continue;
      }

      // Сценарий 3: Несколько персонажей выбрано для одной программы
      if (selectedCharacters.length > 1 && availableCharacters.length > 1) {
        conflicts.push({
          type: 'multiple_characters',
          programId: program.id,
          programName: program.name,
          duration,
          characters: availableCharacters.map(char => ({
            id: char.id,
            name: char.name,
            hourlyPrice: char.hourlyPrice,
          })),
          options: [
            {
              type: 'all_simultaneous',
              description: 'Все персонажи работают всё время',
              price: availableCharacters.reduce((sum, char) =>
                sum + char.hourlyPrice * duration, 0),
              breakdown: availableCharacters.map(char => ({
                characterId: char.id,
                characterName: char.name,
                duration,
                price: char.hourlyPrice * duration,
              })),
            },
            {
              type: 'sequential',
              description: 'Персонажи работают по очереди',
              requiresTimeSlots: true,
              note: 'Укажите временные интервалы для каждого персонажа',
            },
          ],
        });

        // По умолчанию считаем всех вместе
        const price = availableCharacters.reduce((sum, char) =>
          sum + char.hourlyPrice * duration, 0);

        totalPrice += price;
        totalDuration += duration;

        details.push({
          type: 'program_multiple_characters',
          programId: program.id,
          programName: program.name,
          characters: availableCharacters.map(char => ({
            id: char.id,
            name: char.name,
          })),
          duration,
          price,
          hasConflict: true,
        });

        continue;
      }

      // Стандартный случай: один персонаж, одна программа
      if (availableCharacters.length > 0) {
        const character = availableCharacters[0];
        const price = program.isCharacterPrice
          ? character.hourlyPrice * duration
          : program.basePrice;

        totalPrice += price;
        totalDuration += duration;

        details.push({
          type: 'program',
          programId: program.id,
          programName: program.name,
          characterId: character.id,
          characterName: character.name,
          duration,
          price,
        });
      } else {
        // Программа без персонажа (например, аквагрим)
        const price = program.basePrice;
        totalPrice += price;
        totalDuration += duration;

        details.push({
          type: 'program_no_character',
          programId: program.id,
          programName: program.name,
          duration,
          price,
        });
      }
    }

    // Формируем ответ
    const response = {
      totalPrice,
      totalDuration,
      details,
      conflicts,
      hasConflicts: conflicts.length > 0,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/calculator/resolve
 * Пересчитать стоимость с учетом разрешенных конфликтов
 *
 * Request body:
 * {
 *   selectedCharacters: [1, 2],
 *   selectedPrograms: [{ programId: 1, duration: 2 }],
 *   resolutions: [
 *     {
 *       programId: 1,
 *       type: 'sequential',
 *       timeSlots: [
 *         { characterId: 1, startTime: 0, endTime: 1 },
 *         { characterId: 2, startTime: 1, endTime: 2 }
 *       ]
 *     }
 *   ]
 * }
 */
router.post('/resolve', async (req, res, next) => {
  try {
    const { selectedCharacters = [], selectedPrograms = [], resolutions = [] } = req.body;

    // Получаем данные
    const characters = await prisma.character.findMany({
      where: { id: { in: selectedCharacters } },
    });

    const programIds = selectedPrograms.map(p => p.programId);
    const programs = await prisma.program.findMany({
      where: { id: { in: programIds } },
    });

    const charactersMap = new Map(characters.map(c => [c.id, c]));
    const programsMap = new Map(programs.map(p => [p.id, p]));
    const resolutionsMap = new Map(resolutions.map(r => [r.programId, r]));

    let totalPrice = 0;
    let totalDuration = 0;
    const details = [];
    const timeSlots = [];

    for (const selectedProgram of selectedPrograms) {
      const { programId, duration } = selectedProgram;
      const program = programsMap.get(programId);
      const resolution = resolutionsMap.get(programId);

      if (!program) continue;

      if (resolution) {
        // Применяем разрешение конфликта
        if (resolution.type === 'sequential' && resolution.timeSlots) {
          let programPrice = 0;

          for (const slot of resolution.timeSlots) {
            const character = charactersMap.get(slot.characterId);
            if (!character) continue;

            const slotDuration = slot.endTime - slot.startTime;
            const slotPrice = character.hourlyPrice * slotDuration;
            programPrice += slotPrice;

            timeSlots.push({
              programId,
              programName: program.name,
              characterId: character.id,
              characterName: character.name,
              startTime: slot.startTime,
              endTime: slot.endTime,
              duration: slotDuration,
              price: slotPrice,
            });
          }

          totalPrice += programPrice;
          totalDuration += duration;

          details.push({
            type: 'program_sequential',
            programId: program.id,
            programName: program.name,
            duration,
            price: programPrice,
            distribution: 'sequential',
          });
        } else if (resolution.type === 'use_selected') {
          const character = charactersMap.get(resolution.characterId);
          const price = program.isCharacterPrice
            ? character.hourlyPrice * duration
            : program.basePrice;

          totalPrice += price;
          totalDuration += duration;

          details.push({
            type: 'program',
            programId: program.id,
            programName: program.name,
            characterId: character.id,
            characterName: character.name,
            duration,
            price,
          });
        } else if (resolution.type === 'use_default_same_actor') {
          const character = charactersMap.get(resolution.selectedCharacterId);
          const price = program.isCharacterPrice
            ? character.hourlyPrice * duration
            : program.basePrice;

          totalPrice += price;
          totalDuration += duration;

          details.push({
            type: 'program_costume_change',
            programId: program.id,
            programName: program.name,
            characterId: character.id,
            characterName: character.name,
            newCostume: resolution.newCostumeName,
            duration,
            price,
            note: 'Переодевание в нового персонажа',
          });
        } else if (resolution.type === 'use_default_separate_actor') {
          const selectedChar = charactersMap.get(resolution.selectedCharacterId);
          const defaultChar = charactersMap.get(resolution.defaultCharacterId);

          const price = (program.isCharacterPrice
            ? selectedChar.hourlyPrice * duration
            : program.basePrice) + (defaultChar.hourlyPrice * duration);

          totalPrice += price;
          totalDuration += duration;

          details.push({
            type: 'program_two_actors',
            programId: program.id,
            programName: program.name,
            characters: [
              { id: selectedChar.id, name: selectedChar.name },
              { id: defaultChar.id, name: defaultChar.name },
            ],
            duration,
            price,
            note: 'Два отдельных актера',
          });
        }
      }
    }

    res.json({
      totalPrice,
      totalDuration,
      details,
      timeSlots,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
