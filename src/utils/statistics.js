// Универсальная утилита для расчёта статистики по задачам (tasks) и занятиям (lessons)
// Форматы входных данных ожидаются следующими:
// Task: {
//   id,
//   title?,
//   subject,
//   status?: 'todo'|'in_progress'|'done',
//   planned_date?: string|Date,
//   completed_at?: string|Date|null,
//   estimated_time?: number|null // минуты
// }
// Lesson: {
//   id,
//   subject,
//   start_time: string|Date,
//   end_time: string|Date
// }

import dayjs from "dayjs";

function normalizeDate(d) {
  return d ? dayjs(d) : null;
}

function getRange(mode, refDate) {
  const d = refDate ? dayjs(refDate) : dayjs();
  switch (mode) {
    case "day":
      return { start: d.startOf("day"), end: d.endOf("day") };
    case "week":
      return { start: d.startOf("week"), end: d.endOf("week") };
    case "month":
    default:
      return { start: d.startOf("month"), end: d.endOf("month") };
  }
}

function isWithin(d, start, end) {
  if (!d) return false;
  const dd = dayjs(d);
  return (dd.isAfter(start) || dd.isSame(start)) && (dd.isBefore(end) || dd.isSame(end));
}

function overlap(startA, endA, startB, endB) {
  // Есть ли пересечение интервалов [startA, endA] и [startB, endB]
  return !(dayjs(endA).isBefore(startB) || dayjs(endB).isBefore(startA));
}

// Основной расчёт: возвращает расширенный объект со служебными полями
export function computeStatisticsRaw({
  tasks = [],
  lessons = [],
  mode = "month",
  date = null,
  startDate = null,
  endDate = null,
} = {}) {
  const range = startDate && endDate ? { start: dayjs(startDate), end: dayjs(endDate) } : getRange(mode, date);

  // Фильтрация по диапазону
  const filteredTasks = tasks.filter((t) => isWithin(t.planned_date, range.start, range.end));
  const filteredLessons = lessons.filter((l) => {
    const s = normalizeDate(l.start_time);
    const e = normalizeDate(l.end_time);
    if (!s || !e) return false;
    return overlap(s, e, range.start, range.end);
  });

  // Группировка по предметам
  const subjectMap = new Map();

  const ensureSubject = (subject) => {
    if (!subjectMap.has(subject)) {
      subjectMap.set(subject, {
        subject,
        minutesFromLessons: 0,
        minutesFromEstimates: 0,
        taskCount: 0,
      });
    }
    return subjectMap.get(subject);
  };

  // Учёт занятий (в минутах)
  for (const les of filteredLessons) {
    const s = normalizeDate(les.start_time);
    const e = normalizeDate(les.end_time);
    if (!s || !e) continue;
    const minutes = Math.max(0, e.diff(s, "minute"));
    const entry = ensureSubject(les.subject || "Без предмета");
    entry.minutesFromLessons += minutes;
  }

  // Учёт задач
  for (const t of filteredTasks) {
    const entry = ensureSubject(t.subject || t.title || "Без предмета");
    entry.taskCount += 1;
    const est = Number.isFinite(t.estimated_time) ? t.estimated_time : null;
    if (est && est > 0) entry.minutesFromEstimates += est;
  }

  // Метрики задач
  const tasks_total = filteredTasks.length;
  const tasks_done = filteredTasks.filter(
    (t) => t.status === "done" || (t.completed_at != null && t.completed_at !== "")
  ).length;
  const completion_rate = tasks_total === 0 ? 0 : Math.round((tasks_done / tasks_total) * 100);

  // Список предметов и итоговое значение по каждому
  const subjectsDetailed = Array.from(subjectMap.values()).map((s) => {
    const minutes = s.minutesFromLessons > 0 ? s.minutesFromLessons : s.minutesFromEstimates;
    const valueIsTime = minutes > 0;
    const value = valueIsTime ? minutes : s.taskCount;
    return {
      name: s.subject,
      value, // минуты либо количество задач
      valueIsTime, // true, если value в минутах
      minutes,
      taskCountFallback: s.taskCount,
    };
  });

  // Для круговой диаграммы нужны проценты — они будут вычислены на UI на основе value
  const totalForPie = subjectsDetailed.reduce((sum, s) => sum + s.value, 0);
  const distribution = subjectsDetailed.map((s) => ({
    name: s.name,
    value: s.value,
    percent: totalForPie > 0 ? (s.value / totalForPie) * 100 : 0,
    valueIsTime: s.valueIsTime,
  }));

  return {
    range,
    subjectsDetailed,
    distribution,
    tasks_total,
    tasks_done,
    completion_rate,
  };
}

// Функция, возвращающая ровно требуемый формат JSON из условия
export function computeStatistics(params = {}) {
  const raw = computeStatisticsRaw(params);
  return {
    subjects: raw.subjectsDetailed.map((s) => ({ name: s.name, value: s.value })),
    tasks_done: raw.tasks_done,
    tasks_total: raw.tasks_total,
    completion_rate: raw.completion_rate,
  };
}
