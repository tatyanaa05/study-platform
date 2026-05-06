import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';

const r = Router();

// Cached DB capabilities for Lesson optional columns
let LESSON_COL_SUPPORT = { checked: false, title: false, description: false, color: false };

async function ensureLessonColumnSupport() {
  if (LESSON_COL_SUPPORT.checked) return LESSON_COL_SUPPORT;
  try {
    const rows = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND lower(table_name) = 'lesson'
        AND column_name IN ('title','description','color')
    `;
    const names = (rows || []).map((r) => (r.column_name || r.columnName || "").toString().toLowerCase());
    let hasTitle = names.includes('title');
    let hasDescription = names.includes('description');
    let hasColor = names.includes('color');


    try {
      if (!hasTitle) {
        await prisma.$executeRaw`ALTER TABLE "public"."Lesson" ADD COLUMN IF NOT EXISTS "title" TEXT`;
        hasTitle = true;
      }
      if (!hasDescription) {
        await prisma.$executeRaw`ALTER TABLE "public"."Lesson" ADD COLUMN IF NOT EXISTS "description" TEXT`;
        hasDescription = true;
      }
      if (!hasColor) {
        await prisma.$executeRaw`ALTER TABLE "public"."Lesson" ADD COLUMN IF NOT EXISTS "color" TEXT`;
        hasColor = true;
      }
    } catch (_alterErr) {

    }

    LESSON_COL_SUPPORT = {
      checked: true,
      title: hasTitle,
      description: hasDescription,
      color: hasColor,
    };
  } catch (_e) {
    // If detection fails, assume legacy schema without these columns
    LESSON_COL_SUPPORT = { checked: true, title: false, description: false, color: false };
  }
  return LESSON_COL_SUPPORT;
}

// Zod не принимает локальные ISO без таймзоны в .datetime(), поэтому делаем своё правило
const isoLike = z
  .string()
  .refine((s) => {
    const t = Date.parse(s);
    return Number.isFinite(t);
  }, { message: 'Invalid date/time format' });

const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, { message: 'Invalid hex color' })
  .optional();

const createSchema = z.object({
  subject: z.string().min(1),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  color: hexColor,
  start_time: isoLike,
  end_time: isoLike,
});

const updateSchema = z.object({
  subject: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  color: hexColor,
  start_time: isoLike.optional(),
  end_time: isoLike.optional(),
}).refine((obj) => Object.keys(obj).length > 0, {
  message: 'No fields to update',
});

r.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const items = await prisma.lesson.findMany({
      where: { userId },
      orderBy: { startTime: 'asc' },
    });
    res.json(
      items.map((l) => ({
        id: l.id,
        subject: l.subject,
        title: l.title || '',
        description: l.description || '',
        color: l.color || null,
        start_time: l.startTime,
        end_time: l.endTime,
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
    const support = await ensureLessonColumnSupport();
    const payload = {
      userId,
      subject: data.subject,
      startTime: new Date(data.start_time),
      endTime: new Date(data.end_time),
      // опциональные столбцы — только если есть в схеме БД
      ...(support.title ? { title: data.title ?? null } : {}),
      ...(support.description ? { description: data.description ?? null } : {}),
      ...(support.color ? { color: data.color ?? null } : {}),
    };
    const created = await prisma.lesson.create({ data: payload });
    res.status(201).json({ id: created.id });
  } catch (e) {
    if (e.name === 'ZodError')
      return res
        .status(400)
        .json({ error: { code: 'VALIDATION_ERROR', message: e.errors } });
    next(e);
  }
});

// PATCH /lessons/:id — обновление занятия пользователя
r.patch('/:id', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const patch = updateSchema.parse(req.body);
    const support = await ensureLessonColumnSupport();

    // Проверяем принадлежность
    const existing = await prisma.lesson.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: { code: 'LESSON_NOT_FOUND', message: 'Занятие не найдено' } });
    }

    const dataUpdate = {
      subject: patch.subject ?? undefined,
      startTime: patch.start_time ? new Date(patch.start_time) : undefined,
      endTime: patch.end_time ? new Date(patch.end_time) : undefined,
      ...(support.title ? { title: patch.title ?? undefined } : {}),
      ...(support.description ? { description: patch.description ?? undefined } : {}),
      ...(support.color ? { color: patch.color ?? undefined } : {}),
    };

    const updated = await prisma.lesson.update({ where: { id }, data: dataUpdate });
    res.json({ id: updated.id });
  } catch (e) {
    if (e.name === 'ZodError')
      return res
        .status(400)
        .json({ error: { code: 'VALIDATION_ERROR', message: e.errors } });
    next(e);
  }
});

// DELETE /lessons/:id — удаление занятия пользователя
r.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const existing = await prisma.lesson.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: { code: 'LESSON_NOT_FOUND', message: 'Занятие не найдено' } });
    }
    await prisma.lesson.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default r;
