import { Router } from 'express';
import { z } from 'zod';
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

export default r;