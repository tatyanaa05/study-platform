import React, { useMemo } from "react";
import PieChart from "./PieChart";
import Legend from "./Legend";
import Counters from "./Counters";
import { coursesData } from "../../data/courses";
import { computeStatisticsRaw } from "../../utils/statistics";

// Utility to get distinct, consistent colors per subject if not provided
const palette = [
  "#60a5fa", // blue-400
  "#f59e0b", // amber-500
  "#34d399", // emerald-400
  "#a78bfa", // violet-400
  "#f87171", // red-400
  "#22d3ee", // cyan-400
  "#fb923c", // orange-400
  "#4ade80", // green-400
];

function pickColor(index) {
  return palette[index % palette.length];
}

export default function Statistics({ tasks, lessons, mode = "month", date = null }) {
  // Временный маппинг из coursesData в tasks, если tasks не переданы
  const fallbackTasks = useMemo(() => {
    return coursesData.map((c, i) => ({
      id: c.id ?? i + 1,
      title: c.title,
      subject: c.title,
      status: (c.progress || 0) >= 100 ? "done" : (c.progress || 0) > 0 ? "in_progress" : "todo",
      planned_date: c.date,
      completed_at: (c.progress || 0) >= 100 ? c.date : null,
      estimated_time: null, // нет данных — оставляем null
    }));
  }, []);

  const raw = useMemo(() => {
    return computeStatisticsRaw({
      tasks: tasks ?? fallbackTasks,
      lessons: lessons ?? [],
      mode,
      date,
    });
  }, [tasks, lessons, mode, date, fallbackTasks]);

  // Подготовка данных для диаграммы и легенды
  const bySubject = useMemo(() => {
    // назначим цвета стабильно на основе индекса
    return raw.subjectsDetailed.map((s, idx) => ({
      label: s.name,
      value: s.value, // минуты или количество задач
      color: pickColor(idx),
      // «время» показываем в часах только если есть минуты (valueIsTime)
      hours: s.valueIsTime ? Math.round(s.minutes / 60) : 0,
    }));
  }, [raw]);

  const totalTasks = raw.tasks_total;
  const completedTasks = raw.tasks_done;

  return (
    <section className="w-full sticky top-0 self-start">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Статистика</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="flex items-center justify-center">
            <PieChart data={bySubject} size={260} strokeWidth={56} />
          </div>
          <div>
            <Legend items={bySubject} />
            <Counters completed={completedTasks} total={totalTasks} />
          </div>
        </div>
      </div>
    </section>
  );
}
