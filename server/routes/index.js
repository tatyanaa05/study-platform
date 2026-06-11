import { Router } from 'express';
import authRouter from './auth.js';
import tasksRouter from './tasks.js';
import lessonsRouter from './lessons.js';
import materialsRouter from './materials.js';
import usersRouter from './users.js';
import statisticsRouter from './statistics.js';
import { authMiddleware } from '../middlewares/auth.js';

function notImplemented(req, res) {
  res.status(501).json({ error: { code: 'NOT_IMPLEMENTED', message: `Endpoint ${req.method} ${req.originalUrl} is not implemented yet` } });
}

function buildPlaceholderRouter(resourceName) {
  const r = Router();
  r.get('/', (req, res) => notImplemented(req, res));
  r.post('/', (req, res) => notImplemented(req, res));
  r.get('/:id', (req, res) => notImplemented(req, res));
  r.patch('/:id', (req, res) => notImplemented(req, res));
  r.delete('/:id', (req, res) => notImplemented(req, res));
  return r;
}

export function mountFeatureRouters(app) {
  // Auth router (auth-specific endpoints)
  app.use('/auth', authRouter);

  // CRUD placeholders
  app.use('/tasks', authMiddleware, tasksRouter);
  app.use('/lessons', authMiddleware, lessonsRouter);
  app.use('/materials', authMiddleware, materialsRouter);

  // Statistics
  app.use('/statistics', authMiddleware, statisticsRouter);

  // Users
  app.use('/users', authMiddleware, usersRouter);
}

export default { mountFeatureRouters };
