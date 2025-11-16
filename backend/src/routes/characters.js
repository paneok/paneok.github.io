import express from 'express';
import prisma from '../config/database.js';

const router = express.Router();

// GET /api/characters - Получить всех персонажей
router.get('/', async (req, res, next) => {
  try {
    const { category, isActive } = req.query;

    const where = {};
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const characters = await prisma.character.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    // Parse JSON fields
    const formattedCharacters = characters.map(char => ({
      ...char,
      gallery: char.gallery ? JSON.parse(char.gallery) : [],
      availablePrograms: char.availablePrograms ? JSON.parse(char.availablePrograms) : [],
    }));

    res.json(formattedCharacters);
  } catch (error) {
    next(error);
  }
});

// GET /api/characters/:id - Получить персонажа по ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const character = await prisma.character.findUnique({
      where: { id: parseInt(id) },
    });

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // Parse JSON fields
    const formattedCharacter = {
      ...character,
      gallery: character.gallery ? JSON.parse(character.gallery) : [],
      availablePrograms: character.availablePrograms ? JSON.parse(character.availablePrograms) : [],
    };

    res.json(formattedCharacter);
  } catch (error) {
    next(error);
  }
});

// GET /api/characters/slug/:slug - Получить персонажа по slug
router.get('/slug/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;

    const character = await prisma.character.findUnique({
      where: { slug },
    });

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // Parse JSON fields
    const formattedCharacter = {
      ...character,
      gallery: character.gallery ? JSON.parse(character.gallery) : [],
      availablePrograms: character.availablePrograms ? JSON.parse(character.availablePrograms) : [],
    };

    res.json(formattedCharacter);
  } catch (error) {
    next(error);
  }
});

// POST /api/characters - Создать нового персонажа (для админки)
router.post('/', async (req, res, next) => {
  try {
    const data = req.body;

    // Stringify JSON fields
    if (data.gallery && Array.isArray(data.gallery)) {
      data.gallery = JSON.stringify(data.gallery);
    }
    if (data.availablePrograms && Array.isArray(data.availablePrograms)) {
      data.availablePrograms = JSON.stringify(data.availablePrograms);
    }

    const character = await prisma.character.create({
      data,
    });

    res.status(201).json(character);
  } catch (error) {
    next(error);
  }
});

// PUT /api/characters/:id - Обновить персонажа (для админки)
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Stringify JSON fields
    if (data.gallery && Array.isArray(data.gallery)) {
      data.gallery = JSON.stringify(data.gallery);
    }
    if (data.availablePrograms && Array.isArray(data.availablePrograms)) {
      data.availablePrograms = JSON.stringify(data.availablePrograms);
    }

    const character = await prisma.character.update({
      where: { id: parseInt(id) },
      data,
    });

    res.json(character);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/characters/:id - Удалить персонажа (для админки)
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.character.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Character deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
