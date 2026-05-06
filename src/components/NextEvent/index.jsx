import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { api } from "../../lib/api.js";

// Простой форматтер обратного отсчёта на русском
function formatCountdown(targetTs, nowTs = Date.now()) {
  const diffMs = targetTs - nowTs;
  if (diffMs <= 0) return "Сейчас";

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) {
    const m = Math.max(1, minutes);
    return `Через ${m} ${plural(m, ['минуту', 'минуты', 'минут'])}`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `Через ${hours} ${plural(hours, ['час', 'часа', 'часов'])}`;
  }
  const days = Math.floor(hours / 24);
  return `Через ${days} ${plural(days, ['день', 'дня', 'дней'])}`;
}

function plural(n, forms) {
  // forms: [1, 2-4, 5+]
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}

export default function NextEvent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [nowTick, setNowTick] = useState(Date.now());

  // Загрузка задач и занятий
  useEffect(() => {
    let aborted = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [tasks, lessons] = await Promise.all([
          api.listTasks().catch(() => []),
          api.listLessons().catch(() => []),
        ]);
        if (aborted) return;

        const now = Date.now();

        const taskEvents = (tasks || [])
          .filter((t) => t && t.planned_date && t.status !== 'done')
          .map((t) => ({
            type: 'deadline',
            subject: (t.subject || '').trim() || 'Задача',
            title: (t.title || '').trim(),
            at: Date.parse(t.planned_date),
            raw: t,
          }))
          .filter((e) => Number.isFinite(e.at) && e.at > now);

        const lessonEvents = (lessons || [])
          .filter((l) => l && l.start_time)
          .map((l) => ({
            type: 'lesson',
            subject: (l.subject || '').trim() || 'Занятие',
            title: (l.title || '').trim(),
            at: Date.parse(l.start_time),
            raw: l,
          }))
          .filter((e) => Number.isFinite(e.at) && e.at > now);

        setEvents([...taskEvents, ...lessonEvents]);
      } catch (e) {
        if (!aborted) setError(e?.message || 'Не удалось загрузить события');
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    load();

    function onTasksUpdated() { load(); }
    function onLessonsUpdated() { load(); }
    try { window.addEventListener('tasksUpdated', onTasksUpdated); } catch (_) {}
    try { window.addEventListener('lessonsUpdated', onLessonsUpdated); } catch (_) {}
    return () => {
      aborted = true;
      try { window.removeEventListener('tasksUpdated', onTasksUpdated); } catch (_) {}
      try { window.removeEventListener('lessonsUpdated', onLessonsUpdated); } catch (_) {}
    };
  }, []);

  // Тикер для пересчёта обратного отсчёта
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const next = useMemo(() => {
    if (!events.length) return null;
    const sorted = [...events].sort((a, b) => a.at - b.at);
    return sorted[0];
  }, [events, nowTick]);

  return (
    <section className="w-full sticky top-0 self-start">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Ближайшее событие</h2>

        {loading && (
          <div className="text-center text-gray-500">Загрузка…</div>
        )}

        {!loading && error && (
          <div className="text-center text-red-600">{error}</div>
        )}

        {!loading && !error && !next && (
          <div className="text-center text-gray-600">Нет ближайших событий</div>
        )}

        {!loading && !error && next && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  next.type === 'lesson' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {next.type === 'lesson' ? 'Занятие' : 'Дедлайн'}
                </span>
                {next.title ? (
                  <span className="text-xs text-gray-500">{next.title}</span>
                ) : null}
              </div>
              <div className="text-lg font-semibold text-gray-900">{next.subject}</div>
              <div className="text-sm text-gray-600">
                {formatWhen(next.at)} • {formatCountdown(next.at, nowTick)}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function formatWhen(ts) {
  const d = dayjs(ts);
  const today = dayjs();
  const tomorrow = dayjs().add(1, 'day');
  if (d.isSame(today, 'day')) return `Сегодня в ${d.format('HH:mm')}`;
  if (d.isSame(tomorrow, 'day')) return `Завтра в ${d.format('HH:mm')}`;
  return d.format('DD.MM.YYYY HH:mm');
}
