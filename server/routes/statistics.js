import { Router } from 'express';
import { z } from 'zod';
import dayjs from 'dayjs';
import { prisma } from '../db/prisma.js';


const r = Router();

const querySchema = z
  .object({
    mode: z.enum(['day', 'week', 'month']).optional().default('month'),
    date: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .refine(
    (q) => {
      const a = q.startDate && q.endDate;
      const b = !!q.mode;
      return a || b;
    },
    {
      message: 'Укажите либо startDate и endDate, либо mode/date',
      path: ['startDate'],
    }
  );

function buildRange({ mode, date, startDate, endDate }) {
  if (startDate && endDate) {
    return { start: dayjs(startDate).toDate(), end: dayjs(endDate).toDate() };
  }
  const ref = date ? dayjs(date) : dayjs();
  switch (mode) {
    case 'day':
      return { start: ref.startOf('day').toDate(), end: ref.endOf('day').toDate() };
    case 'week':
      return { start: ref.startOf('week').toDate(), end: ref.endOf('week').toDate() };
    case 'month':
    default:
      return { start: ref.startOf('month').toDate(), end: ref.endOf('month').toDate() };
  }
}

r.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const q = querySchema.parse(req.query);
    const range = buildRange(q);

    // Fetch tasks by plannedDate in range
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        plannedDate: {
          gte: range.start,
          lte: range.end,
        },
      },
      orderBy: { plannedDate: 'asc' },
    });

    // Fetch lessons by overlapping interval
    const lessons = await prisma.lesson.findMany({
      where: {
        userId,
        startTime: { lte: range.end },
        endTime: { gte: range.start },
      },
      orderBy: { startTime: 'asc' },
    });

    // Map to client util expected shapes
    const mappedTasks = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      subject: t.subject,
      status: t.status,
      planned_date: t.plannedDate,
      completed_at: t.completedAt,
      estimated_time: t.estimatedTime,
    }));

    const mappedLessons = lessons.map((l) => ({
      id: l.id,
      subject: l.subject,
      start_time: l.startTime,
      end_time: l.endTime,
    }));

    const result = computeStatistics({
      tasks: mappedTasks,
      lessons: mappedLessons,
      mode: q.startDate && q.endDate ? undefined : q.mode,
      date: q.date || undefined,
      startDate: q.startDate || undefined,
      endDate: q.endDate || undefined,
    });

    res.json(result);
  } catch (e) {
    if (e.name === 'ZodError')
      return res
        .status(400)
        .json({ error: { code: 'VALIDATION_ERROR', message: e.errors } });
    next(e);
  }
});

export default r;
