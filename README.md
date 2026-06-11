# Study Platform — учебная платформа (Frontend + API)

Единый репозиторий клиентской части (SPA на React) и серверного API (Express + Prisma) для планирования индивидуального учебного процесса: задачи по предметам, расписание занятий, материалы и статистика.

## Что реализовано

Frontend (SPA):
- Дашборд с компактным календарём (неделя/месяц) и списком задач.
- Задачи по предметам: дедлайны, приоритеты (низкий/средний/высокий), отметка выполнения, базовая статистика за день/неделю/месяц.
- Фильтры задач по предмету и по выбранной дате из календаря.
- Раздел «Материалы»: список, добавление и удаление учебных ресурсов, фильтрация по типам. При отсутствии токена работает в демо‑режиме «in‑memory» (без сохранения на сервер).
- Раздел «Расписание»: неделя без чётности (создание, редактирование и удаление занятий доступны через API; на клиенте — отображение и базовые операции).
- Боковое меню с навигацией и подсветкой активного раздела.

Backend (API):
- Публичные сервисные эндпоинты: GET /health, GET /ready (проверка подключения к БД), GET /version, GET /.
- Аутентификация: регистрация, вход, обновление токена и выход на JWT (bcrypt для хеширования паролей, Zod для валидации):
  - POST /auth/register, POST /auth/login, POST /auth/refresh, POST /auth/logout.
- Профиль пользователя: получение и обновление профиля, смена пароля:
  - GET /users/me, PATCH /users/me, PATCH /users/password.
- Задачи: список/создание/обновление/удаление, авто‑установка completedAt при смене статуса, агрегатная статистика за день/неделю/месяц:
  - GET /tasks, POST /tasks, PATCH /tasks/:id, DELETE /tasks/:id, GET /tasks/stats.
- Занятия (расписание): список/создание/обновление/удаление. Поддерживаются опциональные поля title/description/color; при необходимости сервер пытается безопасно добавить отсутствующие колонки в БД:
  - GET /lessons, POST /lessons, PATCH /lessons/:id, DELETE /lessons/:id.
- Материалы: список/создание/удаление:
  - GET /materials, POST /materials, DELETE /materials/:id.
- Сводная статистика: агрегирование по задачам и занятиям на базе утилиты из фронтенда (src/utils/statistics.js):
  - GET /statistics с режимами mode=day|week|month или произвольным интервалом startDate/endDate.

Единый формат ошибок и централизованный обработчик, middleware авторизации (Bearer access_token), CORS и безопасность (helmet).

## Технологический стек

Frontend:
- React 19, React Router 6
- Vite 6 (dev‑сервер, сборка), HMR
- Tailwind CSS 4, PostCSS, Autoprefixer
- ESLint 9 (правила React Hooks и React Refresh)
- Библиотеки: dayjs, date‑fns, react‑calendar, lucide‑react, react‑icons

Backend:
- Node.js 18+ (рекомендуемая LTS)
- Express 4, CORS, helmet
- Валидация: Zod 4
- Аутентификация: jsonwebtoken (JWT), bcrypt
- Доступ к БД: Prisma 7 (+ @prisma/adapter‑pg)
- Dev: nodemon

База данных и инфраструктура:
- PostgreSQL 16 (Docker Compose)
- Переменные окружения через dotenv

Инструменты проекта:
- ESLint, Tailwind/PostCSS конфиги, Vite конфиг

## Требования
- Node.js LTS 18+ и npm
- Docker (для локального PostgreSQL)

## Установка и запуск

1) Установка зависимостей
- npm install

2) Запуск фронтенда (dev)
- Скопируйте .env.development.example → .env.development
- При необходимости задайте адрес API: VITE_API_BASE_URL=http://localhost:3001
- Запустите dev‑сервер: npm run dev

3) Запуск backend API (dev)
- Поднимите БД: docker compose up -d (см. docker-compose.yml)
- Скопируйте .env.example → .env и задайте переменные (см. ниже)
- (При наличии миграций) примените их с помощью Prisma
- Запустите API: npm run server:dev
- Проверьте сервисные эндпоинты: GET /health, GET /ready

4) Production‑сборка фронтенда
- npm run build
- Предпросмотр собранного приложения: npm run preview

5) Линтинг
- npm run lint

## Скрипты (package.json)
- dev — запуск Vite dev‑сервера
- build — сборка production‑версии (vite build)
- preview — локальный предпросмотр сборки
- lint — проверка кода ESLint
- server — запуск API в прод‑режиме (node server/index.js)
- server:dev — запуск API в dev‑режиме с перезапуском (nodemon)

## Переменные окружения

Frontend (Vite):
- VITE_API_BASE_URL — базовый URL API (по умолчанию http://localhost:3001)

Backend (см. .env.example):
- PORT=3001 — порт API
- CORS_ORIGIN=http://localhost:5173 — источник для CORS (Vite dev‑сервер)
- DATABASE_URL=postgresql://study:study_password@localhost:5432/study_db?schema=public
- JWT_SECRET, JWT_REFRESH_SECRET — длинные случайные строки
- ACCESS_TOKEN_TTL=15m, REFRESH_TOKEN_TTL=7d — время жизни токенов
- BCRYPT_SALT_ROUNDS=10 — сложность хеширования пароля

Использование переменных на фронтенде: import.meta.env.VITE_API_BASE_URL

## Быстрый старт интеграции фронтенда с API
1. Убедитесь, что API запущен на http://localhost:3001
2. Создайте .env.development с VITE_API_BASE_URL=http://localhost:3001
3. npm run dev
4. Для доступа к защищённым разделам (задачи/расписание/материалы) авторизуйтесь через /auth/login и используйте токен (UI логина может отсутствовать; фронтенд переключается в «in‑memory» режим без токена и использует серверные данные при наличии токена в контексте аутентификации).

## Структура проекта (основное)
- index.html — корневой HTML
- src/ — исходники фронтенда
  - main.jsx — инициализация и монтирование React в #root
  - App.jsx — корневой компонент SPA
  - context/ProfileContext.jsx — провайдер контекста профиля/аутентификации
  - lib/api.js — простой HTTP‑клиент для вызовов API
  - style.css — глобальные стили (Tailwind и др.)
- public/ — статика
- server/ — исходники API
  - index.js — точка входа сервера, сервисные эндпоинты
  - routes/ — роутеры (auth, users, tasks, lessons, materials, statistics)
  - middlewares/ — middleware авторизации и обработки ошибок
  - db/prisma.js — инициализация Prisma‑клиента (PostgreSQL)
- prisma.config.ts — конфигурация Prisma
- docker-compose.yml — локальный PostgreSQL
- vite.config.js, tailwind.config.js, postcss.config.js, eslint.config.js — конфигурации инструментов
- package.json / package‑lock.json — метаданные и зависимости

Примечания по стилям:
- Tailwind CSS 4 сканирует index.html и файлы в src/**/*.{js,ts,jsx,tsx}
- В tailwind.config.js добавлены пользовательские утилиты через plugin()

## Краткий обзор API

Публичные:
- GET /health → { status: "ok" }
- GET /ready → { ready: true|false }
- GET /version → { name, version }
- GET / → приветственное сообщение

Аутентификация:
- POST /auth/register { name, email, password }
- POST /auth/login { email, password }
- POST /auth/refresh { refresh_token }
- POST /auth/logout

Профиль:
- GET /users/me
- PATCH /users/me { name?, email?, group?, avatar?, theme?, language? }
- PATCH /users/password { currentPassword, newPassword }

Задачи:
- GET /tasks — список задач текущего пользователя
- POST /tasks { title, subject, status?, planned_date?, estimated_time?, priority?, description? }
- PATCH /tasks/:id — частичное обновление (auto completedAt при status=done)
- DELETE /tasks/:id
- GET /tasks/stats — { day, week, month }

Занятия:
- GET /lessons
- POST /lessons { subject, title?, description?, color?, start_time, end_time }
- PATCH /lessons/:id
- DELETE /lessons/:id

Материалы:
- GET /materials
- POST /materials { title, type, subject?, url?, description?, tags?[] }
- DELETE /materials/:id

Статистика:
- GET /statistics?mode=day|week|month&date=YYYY-MM-DD
- или GET /statistics?startDate=ISO&endDate=ISO
- Ответ: агрегаты по задачам/занятиям (см. src/utils/statistics.js)

## Тестирование
На текущий момент автотесты не настроены. Рекомендуется добавить Vitest + React Testing Library (frontend) и supertest (backend) с соответствующими npm‑скриптами.

## Деплой
Frontend:
- npm run build → разместить содержимое папки dist на статическом хостинге (NGINX/CDN/GitHub Pages и т. п.)

Backend:
- Запуск Node.js‑сервера (server/index.js) на желаемом порту (PORT), убедиться в корректном CORS и доступе к БД (DATABASE_URL)

## Лицензия
ISC (см. поле license в package.json)
