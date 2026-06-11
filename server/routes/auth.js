import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma.js';

const router = Router();

const registerSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
});

function signTokens(user) {
    const access = jwt.sign(
        { sub: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_TTL || '15m' }
    );
    const refresh = jwt.sign(
        { sub: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_TTL || '7d' }
    );
    return { access, refresh };
}

router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password } = registerSchema.parse(req.body);
        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) return res.status(409).json({ error: { code: 'EMAIL_TAKEN', message: 'Email уже зарегистрирован' } });
        const hash = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS) || 10);
        const user = await prisma.user.create({ data: { name, email, passwordHash: hash } });
        const { access, refresh } = signTokens(user);
        res.status(201).json({ user: { id: user.id, name: user.name, email: user.email }, access_token: access, refresh_token: refresh });
    } catch (e) {
        if (e.name === 'ZodError') return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: e.errors } });
        next(e);
    }
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Неверный email или пароль' } });
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Неверный email или пароль' } });
        const { access, refresh } = signTokens(user);
        res.json({ user: { id: user.id, name: user.name, email: user.email }, access_token: access, refresh_token: refresh });
    } catch (e) {
        if (e.name === 'ZodError') return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: e.errors } });
        next(e);
    }
});

router.post('/refresh', (req, res) => {
    const token = req.body?.refresh_token;
    if (!token) return res.status(400).json({ error: { code: 'NO_TOKEN', message: 'refresh_token отсутствует' } });
    try {
        const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const access = jwt.sign(
            { sub: payload.sub },
            process.env.JWT_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_TTL || '15m' }
        );
        res.json({ access_token: access });
    } catch (_e) {
        res.status(401).json({ error: { code: 'INVALID_REFRESH', message: 'Неверный или истёкший refresh_token' } });
    }
});

router.post('/logout', (_req, res) => {
    res.status(204).send();
});

export default router;