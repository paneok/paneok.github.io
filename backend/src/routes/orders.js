import express from 'express';
import prisma from '../config/database.js';

const router = express.Router();

// Admin Authentication Middleware
const requireAdminAuth = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
  const expectedKey = process.env.ADMIN_API_KEY || 'enot-secret-admin-key-2026';
  
  if (adminKey === expectedKey) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Admin authentication required to access orders' });
};

// GET /api/orders - Получить все заказы (только для админа)
router.get('/', requireAdminAuth, async (req, res, next) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            program: true,
            characters: {
              include: {
                character: true,
              },
            },
            timeSlots: {
              include: {
                character: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/:id - Получить заказ по ID (только для админа)
router.get('/:id', requireAdminAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            program: true,
            characters: {
              include: {
                character: true,
              },
            },
            timeSlots: {
              include: {
                character: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
});

// POST /api/orders - Создать новый заказ
router.post('/', async (req, res, next) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      eventDate,
      eventAddress,
      childAge,
      guestsCount,
      totalPrice,
      totalDuration,
      items = [],
      notes,
    } = req.body;

    // Валидация
    if (!customerName || !customerPhone) {
      return res.status(400).json({ error: 'Customer name and phone are required' });
    }

    // Создаем заказ с элементами
    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        customerEmail,
        eventDate: eventDate ? new Date(eventDate) : null,
        eventAddress,
        childAge,
        guestsCount,
        totalPrice,
        totalDuration,
        status: 'draft',
        notes,
        orderItems: {
          create: items.map(item => ({
            programId: item.programId,
            duration: item.duration,
            price: item.price,
            distributionType: item.distributionType || 'sequential',
            characters: {
              create: (item.characters || []).map(char => ({
                characterId: char.characterId,
                isDefaultCostume: char.isDefaultCostume ?? true,
                requiresSeparateActor: char.requiresSeparateActor ?? false,
              })),
            },
            timeSlots: {
              create: (item.timeSlots || []).map(slot => ({
                orderId: undefined, // будет заполнено автоматически
                characterId: slot.characterId,
                startTime: slot.startTime,
                endTime: slot.endTime,
                priceForSlot: slot.priceForSlot,
              })),
            },
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            program: true,
            characters: {
              include: {
                character: true,
              },
            },
            timeSlots: {
              include: {
                character: true,
              },
            },
          },
        },
      },
    });

    // Обновляем orderId в timeSlots
    for (const item of order.orderItems) {
      await prisma.timeSlot.updateMany({
        where: { orderItemId: item.id },
        data: { orderId: order.id },
      });
    }

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

// PUT /api/orders/:id - Обновить заказ (только для админа)
router.put('/:id', requireAdminAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Удаляем вложенные объекты, т.к. их нужно обновлять отдельно
    delete data.orderItems;

    const order = await prisma.order.update({
      where: { id },
      data,
      include: {
        orderItems: {
          include: {
            program: true,
            characters: {
              include: {
                character: true,
              },
            },
            timeSlots: {
              include: {
                character: true,
              },
            },
          },
        },
      },
    });

    res.json(order);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/orders/:id/status - Обновить статус заказа (только для админа)
router.patch('/:id/status', requireAdminAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['draft', 'pending', 'confirmed', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    res.json(order);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/orders/:id - Удалить заказ (только для админа)
router.delete('/:id', requireAdminAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.order.delete({
      where: { id },
    });

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
