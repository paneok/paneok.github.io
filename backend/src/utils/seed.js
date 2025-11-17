import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

/**
 * Скрипт для миграции данных из JSON файлов в БД
 */
async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Очистка существующих данных
    console.log('🗑️  Clearing existing data...');
    await prisma.timeSlot.deleteMany();
    await prisma.orderItemCharacter.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.program.deleteMany();
    await prisma.character.deleteMany();

    // Загрузка данных персонажей из JSON
    console.log('📖 Loading characters from JSON...');
    const charactersPath = path.join(__dirname, '../../../data/characters-data.json');

    let charactersData;
    try {
      const charactersFile = await fs.readFile(charactersPath, 'utf-8');
      charactersData = JSON.parse(charactersFile);
    } catch (error) {
      console.error('❌ Error loading characters JSON:', error.message);
      console.log('⚠️  Skipping characters import');
      charactersData = { characters: [] };
    }

    // Импорт персонажей
    if (charactersData.characters && charactersData.characters.length > 0) {
      console.log(`📥 Importing ${charactersData.characters.length} characters...`);

      for (const char of charactersData.characters) {
        // Преобразуем данные в формат БД
        const characterData = {
          id: char.id,
          name: char.name,
          slug: char.slug,
          category: char.category || 'Другие',
          hourlyPrice: char.pricing?.hourly || 0,
          description: char.description || '',
          mainImage: char.images?.main || '',
          gallery: char.images?.gallery ? JSON.stringify(char.images.gallery) : JSON.stringify([]),
          availablePrograms: char.availablePrograms ? JSON.stringify(char.availablePrograms) : JSON.stringify([]),
          isActive: true,
        };

        await prisma.character.create({ data: characterData });
      }

      console.log(`✅ Imported ${charactersData.characters.length} characters`);
    }

    // Загрузка данных программ из JSON
    console.log('📖 Loading programs from JSON...');
    const programsPath = path.join(__dirname, '../../../data/programs-data.json');

    let programsData;
    try {
      const programsFile = await fs.readFile(programsPath, 'utf-8');
      programsData = JSON.parse(programsFile);
    } catch (error) {
      console.error('❌ Error loading programs JSON:', error.message);
      console.log('⚠️  Skipping programs import');
      programsData = { programs: [] };
    }

    // Импорт программ
    if (programsData.programs && programsData.programs.length > 0) {
      console.log(`📥 Importing ${programsData.programs.length} programs...`);

      for (const prog of programsData.programs) {
        // Преобразуем данные в формат БД
        const programData = {
          id: prog.id,
          name: prog.name,
          slug: prog.slug,
          category: prog.category || 'other',
          emoji: prog.emoji || '🎉',
          basePrice: prog.pricing?.amount || 0,
          priceUnit: prog.pricing?.unit || '₽',
          isCharacterPrice: prog.pricing?.isCharacterPrice || false,
          defaultCharacterId: prog.defaultCharacterId || null,
          description: prog.description || '',
          fullDescription: prog.fullDescription || '',
          bonus: prog.bonus || null,
          duration: prog.duration || null,
          targetAge: prog.targetAge || null,
          slogan: prog.slogan || null,
          mainImage: prog.images?.main || '',
          gallery: prog.images?.gallery ? JSON.stringify(prog.images.gallery) : JSON.stringify([]),
          requiresCharacter: prog.requiresCharacter || false,
          isActive: true,
        };

        await prisma.program.create({ data: programData });
      }

      console.log(`✅ Imported ${programsData.programs.length} programs`);
    }

    console.log('✨ Database seed completed successfully!');

    // Вывод статистики
    const charactersCount = await prisma.character.count();
    const programsCount = await prisma.program.count();

    console.log('\n📊 Database Statistics:');
    console.log(`   Characters: ${charactersCount}`);
    console.log(`   Programs: ${programsCount}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск скрипта
seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
