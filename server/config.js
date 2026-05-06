// Простая конфигурация сервера на основе переменных окружения
// На данном этапе без dotenv — Node читает process.env напрямую.

const numberFromEnv = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export const config = {
  port: numberFromEnv(process.env.PORT, 3001),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  env: process.env.NODE_ENV || 'development',
};

export default config;
