import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const r = Router();

// GET /users/me — профиль текущего пользователя
r.get('/me', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'Пользователь не найден' } });
    }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatarUrl || null,
    });
  } catch (e) {
    next(e);
  }
});

// PATCH /users/me — обновление профиля текущего пользователя
r.patch('/me', async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(1, 'Имя обязательно').optional(),
      email: z.string().email('Некорректный email').optional(),
      avatar: z.string().optional().nullable(),
    });

    const body = schema.parse(req.body || {});
    const userId = req.user.id;
    console.log(`Updating profile for user ${userId}, fields:`, { ...body, avatar: body.avatar ? `string(${body.avatar.length})` : body.avatar });

    // Проверка уникальности email, если меняется
    if (body.email) {
      const exists = await prisma.user.findUnique({ where: { email: body.email } });
      if (exists && exists.id !== userId) {
        return res.status(409).json({ error: { code: 'EMAIL_TAKEN', message: 'Email уже зарегистрирован' } });
      }
    }

    const data = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.email !== undefined) data.email = body.email;
    if (body.avatar !== undefined) data.avatarUrl = body.avatar; // может быть null

    const user = await prisma.user.update({ where: { id: userId }, data });
    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatarUrl || null,
    });
  } catch (e) {
    if (e.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: e.errors } });
    }
    next(e);
  }
});

export default r;

// PATCH /users/password — смена пароля текущего пользователя
r.patch('/password', async (req, res, next) => {
  try {
    const schema = z.object({
      currentPassword: z.string().min(1, 'Текущий пароль обязателен'),
      newPassword: z.string().min(8, 'Новый пароль должен быть не короче 8 символов'),
    });
    const { currentPassword, newPassword } = schema.parse(req.body);

    const userId = req.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'Пользователь не найден' } });
    }

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      return res.status(400).json({ error: { code: 'WRONG_PASSWORD', message: 'Неверный текущий пароль' } });
    }

    const hash = await bcrypt.hash(newPassword, Number(process.env.BCRYPT_SALT_ROUNDS) || 10);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });

    return res.status(204).send();
  } catch (e) {
    if (e.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: e.errors } });
    }
    next(e);
    }
  });

  // DELETE /users/me — удаление аккаунта текущего пользователя
  // Требует подтверждения паролем. Удаляет пользователя и все связанные сущности (каскадно согласно Prisma‑схеме)
  r.delete('/me', async (req, res, next) => {
    try {
      const bodySchema = z.object({
        password: z.string().min(1, 'Пароль обязателен'),
      });
      const { password } = bodySchema.parse(req.body || {});

      const userId = req.user.id;

      // Проверим существование пользователя и получим хэш пароля
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'Пользователь не найден' } });
      }

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        return res.status(400).json({ error: { code: 'WRONG_PASSWORD', message: 'Неверный пароль' } });
      }

      // Удаление пользователя. Связанные записи удаляются каскадно (см. schema.prisma onDelete: Cascade)
      await prisma.user.delete({ where: { id: userId } });

      return res.status(204).send();
    } catch (e) {
      if (e.name === 'ZodError') {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: e.errors } });
      }
      next(e);
    }
  });
