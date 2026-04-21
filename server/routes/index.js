import { Router } from 'express';
import authRouter from './auth.js';
import tasksRouter from './tasks.js';
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
  const auth = Router();
  auth.post('/register', notImplemented);
  auth.post('/login', notImplemented);
  auth.post('/refresh', notImplemented);
  auth.post('/logout', notImplemented);
  app.use('/auth', authRouter);

  // CRUD placeholders
    app.use('/tasks', authMiddleware, tasksRouter);
  app.use('/lessons', buildPlaceholderRouter('lessons'));
  app.use('/materials', buildPlaceholderRouter('materials'));

  // Statistics placeholder
  const stats = Router();
  stats.get('/', notImplemented);
  app.use('/statistics', stats);
}

export default { mountFeatureRouters };
