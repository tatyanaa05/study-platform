import { Router } from 'express';
import { z } from 'zod';
import dayjs from 'dayjs';
import { prisma } from '../db/prisma.js';

const r = Router();

const createSchema = z.object({
    title: z.string().min(1),
    subject: z.string().min(1),
    status: z.enum(['todo','in_progress','done']).optional(),
    planned_date: z.string().datetime().optional(),
    estimated_time: z.number().int().positive().optional(),
    priority: z.enum(['low','medium','high']).optional(),
    description: z.string().optional(),
});

r.patch('/:id', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const id = z.string().min(1).parse(req.params.id);

        const patchSchema = z.object({
            title: z.string().min(1).optional(),
            subject: z.string().min(1).optional(),
            status: z.enum(['todo','in_progress','done']).optional(),
            planned_date: z.union([z.string().datetime(), z.null()]).optional(),
            estimated_time: z.union([z.number().int().positive(), z.null()]).optional(),
            priority: z.union([z.enum(['low','medium','high']), z.null()]).optional(),
            description: z.union([z.string(), z.null()]).optional(),
        }).refine((obj) => Object.keys(obj).length > 0, { message: 'No fields to update' });

        const data = patchSchema.parse(req.body);

        const dataUpdate = {
            title: data.title ?? undefined,
            subject: data.subject ?? undefined,
            status: data.status ?? undefined,
            plannedDate: Object.prototype.hasOwnProperty.call(data, 'planned_date')
                ? (data.planned_date ? new Date(data.planned_date) : null)
                : undefined,
            estimatedTime: Object.prototype.hasOwnProperty.call(data, 'estimated_time')
                ? (data.estimated_time ?? null)
                : undefined,
            priority: Object.prototype.hasOwnProperty.call(data, 'priority')
                ? (data.priority ?? null)
                : undefined,
            description: Object.prototype.hasOwnProperty.call(data, 'description')
                ? (data.description ?? null)
                : undefined,
        };

        // Авто-установка времени завершения при смене статуса
        if (Object.prototype.hasOwnProperty.call(data, 'status')) {
            if (data.status === 'done') {
                dataUpdate.completedAt = new Date();
            } else {
                dataUpdate.completedAt = null;
            }
        }

        const result = await prisma.task.updateMany({ where: { id, userId }, data: dataUpdate });
        if (result.count === 0) {
            return res.status(404).json({ error: { code: 'TASK_NOT_FOUND', message: 'Task not found' } });
        }
        return res.json({ id });
    } catch (e) {
        if (e.name === 'ZodError') return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: e.errors } });
        next(e);
    }
});

r.get('/stats', async (req, res, next) => {
    try {
        const userId = req.user.id;

        const now = dayjs();
        const dayStart = now.startOf('day').toDate();
        const dayEnd = now.endOf('day').toDate();
        const weekStart = now.startOf('week').toDate();
        const weekEnd = now.endOf('week').toDate();
        const monthStart = now.startOf('month').toDate();
        const monthEnd = now.endOf('month').toDate();

        const [day, week, month] = await Promise.all([
            prisma.task.count({ where: { userId, completedAt: { gte: dayStart, lte: dayEnd } } }),
            prisma.task.count({ where: { userId, completedAt: { gte: weekStart, lte: weekEnd } } }),
            prisma.task.count({ where: { userId, completedAt: { gte: monthStart, lte: monthEnd } } }),
        ]);

        res.json({ day, week, month });
    } catch (e) { next(e); }
});

r.get('/', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const items = await prisma.task.findMany({ where: { userId }, orderBy: { plannedDate: 'asc' } });
        res.json(items.map(t => ({
            id: t.id,
            title: t.title,
            subject: t.subject,
            status: t.status,
            planned_date: t.plannedDate,
            completed_at: t.completedAt,
            estimated_time: t.estimatedTime,
            priority: t.priority,
            description: t.description,
        })));
    } catch (e) { next(e); }
});

r.post('/', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const data = createSchema.parse(req.body);
        const created = await prisma.task.create({
            data: {
                userId,
                title: data.title,
                subject: data.subject,
                status: data.status ?? 'todo',
                plannedDate: data.planned_date ? new Date(data.planned_date) : null,
                estimatedTime: data.estimated_time ?? null,
                priority: data.priority ?? null,
                description: data.description ?? null,
            },
        });
        res.status(201).json({ id: created.id });
    } catch (e) {
        if (e.name === 'ZodError') return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: e.errors } });
        next(e);
    }
});

r.delete('/:id', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const id = z.string().min(1).parse(req.params.id);

        // Удаляем только задачу текущего пользователя
        const result = await prisma.task.deleteMany({ where: { id, userId } });
        if (result.count === 0) {
            return res.status(404).json({ error: { code: 'TASK_NOT_FOUND', message: 'Task not found' } });
        }
        return res.status(204).send();
    } catch (e) {
        if (e.name === 'ZodError') return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: e.errors } });
        next(e);
    }
});

export default r;