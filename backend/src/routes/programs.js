import express from 'express';
import prisma from '../config/database.js';

const router = express.Router();

// GET /api/programs - Получить все программы
router.get('/', async (req, res, next) => {
  try {
    const { category, isActive } = req.query;

    const where = {};
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const programs = await prisma.program.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    // Parse JSON fields
    const formattedPrograms = programs.map(program => ({
      ...program,
      gallery: program.gallery ? JSON.parse(program.gallery) : [],
    }));

    res.json(formattedPrograms);
  } catch (error) {
    next(error);
  }
});

// GET /api/programs/:id - Получить программу по ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const program = await prisma.program.findUnique({
      where: { id: parseInt(id) },
    });

    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }

    // Parse JSON fields
    const formattedProgram = {
      ...program,
      gallery: program.gallery ? JSON.parse(program.gallery) : [],
    };

    res.json(formattedProgram);
  } catch (error) {
    next(error);
  }
});

// GET /api/programs/slug/:slug - Получить программу по slug
router.get('/slug/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;

    const program = await prisma.program.findUnique({
      where: { slug },
    });

    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }

    // Parse JSON fields
    const formattedProgram = {
      ...program,
      gallery: program.gallery ? JSON.parse(program.gallery) : [],
    };

    res.json(formattedProgram);
  } catch (error) {
    next(error);
  }
});

// POST /api/programs - Создать новую программу (для админки)
router.post('/', async (req, res, next) => {
  try {
    const data = req.body;

    // Stringify JSON fields
    if (data.gallery && Array.isArray(data.gallery)) {
      data.gallery = JSON.stringify(data.gallery);
    }

    const program = await prisma.program.create({
      data,
    });

    res.status(201).json(program);
  } catch (error) {
    next(error);
  }
});

// PUT /api/programs/:id - Обновить программу (для админки)
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Stringify JSON fields
    if (data.gallery && Array.isArray(data.gallery)) {
      data.gallery = JSON.stringify(data.gallery);
    }

    const program = await prisma.program.update({
      where: { id: parseInt(id) },
      data,
    });

    res.json(program);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/programs/:id - Удалить программу (для админки)
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.program.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Program deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
