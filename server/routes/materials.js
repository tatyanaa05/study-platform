import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';

const r = Router();

const createSchema = z.object({
  title: z.string().min(1),
  type: z.string().min(1),
  subject: z.string().optional(),
  url: z.string().url().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

r.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const items = await prisma.material.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(
      items.map((m) => ({
        id: m.id,
        title: m.title,
        type: m.type,
        subject: m.subject,
        url: m.url,
        description: m.description,
        tags: m.tags,
        created_at: m.createdAt,
        updated_at: m.updatedAt,
      }))
    );
  } catch (e) {
    next(e);
  }
});

r.post('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = createSchema.parse(req.body);
    const created = await prisma.material.create({
      data: {
        userId,
        title: data.title,
        type: data.type,
        subject: data.subject ?? null,
        url: data.url ?? null,
        description: data.description ?? null,
        tags: data.tags ?? [],
      },
    });
    res.status(201).json({ id: created.id });
  } catch (e) {
    if (e.name === 'ZodError')
      return res
        .status(400)
        .json({ error: { code: 'VALIDATION_ERROR', message: e.errors } });
    next(e);
  }
});

const updateSchema = createSchema.partial();

r.patch('/:id', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;
    const data = updateSchema.parse(req.body);

    const updated = await prisma.material.updateMany({
      where: { id, userId },
      data: {
        ...data,
      },
    });

    if (updated.count === 0) {
      return res.status(404).json({ error: { code: 'MATERIAL_NOT_FOUND', message: 'Material not found' } });
    }

    const item = await prisma.material.findUnique({ where: { id } });
    res.json(item);
  } catch (e) {
    if (e.name === 'ZodError')
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: e.errors } });
    next(e);
  }
});

r.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const id = z.string().min(1).parse(req.params.id);

    const result = await prisma.material.deleteMany({ where: { id, userId } });
    if (result.count === 0) {
      return res.status(404).json({ error: { code: 'MATERIAL_NOT_FOUND', message: 'Material not found' } });
    }
    return res.status(204).send();
  } catch (e) {
    if (e.name === 'ZodError')
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: e.errors } });
    next(e);
  }
});

export default r;
