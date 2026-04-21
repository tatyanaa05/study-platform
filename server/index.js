import 'dotenv/config';
import { prisma } from './db/prisma.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { mountFeatureRouters } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const app = express();
const PORT = config.port;

// Basic middlewares
app.use(helmet());
app.use(cors({ origin: config.corsOrigin })); // CORS настраивается через переменную окружения
app.use(express.json());

// Health endpoints
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/ready', async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ ready: true });
    } catch (e) {
        res.status(500).json({ ready: false, error: { code: 'DB_NOT_READY', message: String(e) } });
    }
});

// Version endpoint sourced from package.json at runtime
app.get('/version', async (_req, res) => {
  try {
    // dynamic import to avoid caching during dev watch
    const pkg = await import('../package.json', { with: { type: 'json' } });
    res.json({ name: pkg.default.name, version: pkg.default.version });
  } catch (e) {
    res.status(500).json({ error: { code: 'VERSION_READ_ERROR', message: String(e) } });
  }
});

// Root
app.get('/', (_req, res) => {
  res.json({ message: 'Study Platform API (skeleton)' });
});

// Подключаем заготовки фич-роутеров (пока возвращают NOT_IMPLEMENTED)
mountFeatureRouters(app);

// 404 для всех остальных маршрутов
app.use(notFoundHandler);

// Централизованный обработчик ошибок (единый формат)
app.use(errorHandler);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API server listening on http://localhost:${PORT}`);
});
