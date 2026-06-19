import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";


const HOURS_START = 6;
const HOURS_END = 24;
const MINUTES_TOTAL = (HOURS_END - HOURS_START) * 60;
const PX_PER_MINUTE = 1;

const ruDaysShort = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeek(date) {
  // Неделя начинается с Пн
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Пн = 0 ... Вс = 6
  const res = new Date(d);
  res.setDate(d.getDate() - day);
  res.setHours(0, 0, 0, 0);
  return res;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatISO(date) {
  // YYYY-MM-DD в локальном времени
  if (!date || isNaN(date.getTime())) date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatTime(date) {
  // HH:mm в локальном времени
  if (!date || isNaN(date.getTime())) return "10:00";
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function combineDateAndTime(dateStr, timeStr) {
  // dateStr: YYYY-MM-DD, timeStr: HH:mm
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  const res = new Date();
  res.setFullYear(y, m - 1, d);
  res.setHours(hh, mm, 0, 0);
  return res.toISOString();
}

function timeLabel(h) {
  return `${String(h).padStart(2, "0")}:00`;
}

function parseToDate(iso) {
  return new Date(iso);
}

function minutesSinceGridStart(date) {
  const h = date.getHours();
  const m = date.getMinutes();
  return Math.max(0, (h - HOURS_START) * 60 + m);
}

function clampToGrid(date) {
  const d = new Date(date);
  if (d.getHours() < HOURS_START) d.setHours(HOURS_START, 0, 0, 0);
  if (d.getHours() >= HOURS_END) d.setHours(HOURS_END - 1, 59, 0, 0);
  return d;
}

function getRangeFilter(lessons, from, to) {
  // включительно по from..to (конец дня to)
  const end = new Date(to);
  end.setHours(23, 59, 59, 999);
  return lessons
    .filter((l) => {
      const s = parseToDate(l.start_time);
      return s >= from && s <= end;
    })
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
}

function groupByDay(lessons) {
  const map = new Map();
  for (const l of lessons) {
    const d = formatISO(startOfDay(new Date(l.start_time)));
    if (!map.has(d)) map.set(d, []);
    map.get(d).push(l);
  }
  for (const list of map.values()) {
    list.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  }
  return map;
}

// Алгоритм раскладки перекрывающихся занятий в колонки
function layoutDay(lessons) {
  // Вход: массив занятий одного дня, отсортированный по start_time
  // Выход: для каждого занятия добавим поля column и columns (ширина = 100/columns)
  const events = lessons.map((l, idx) => ({ ...l, _idx: idx }));
  const groups = [];

  function overlaps(a, b) {
    const s1 = new Date(a.start_time).getTime();
    const e1 = new Date(a.end_time).getTime();
    const s2 = new Date(b.start_time).getTime();
    const e2 = new Date(b.end_time).getTime();
    return s1 < e2 && s2 < e1; // пересечение интервалов
  }

  // Разбиваем на кластеры пересечений
  for (const ev of events) {
    let placed = false;
    for (const g of groups) {
      if (g.some((x) => overlaps(x, ev))) {
        g.push(ev);
        placed = true;
        break;
      }
    }
    if (!placed) groups.push([ev]);
  }

  // Внутри каждого кластера раскидываем по колонкам (жадно)
  for (const g of groups) {
    const columns = [];
    g.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    for (const ev of g) {
      let col = 0;
      while (true) {
        if (!columns[col]) {
          columns[col] = [ev];
          ev.column = col;
          break;
        }
        const last = columns[col][columns[col].length - 1];
        if (!overlaps(last, ev)) {
          columns[col].push(ev);
          ev.column = col;
          break;
        }
        col += 1;
      }
    }
    const totalCols = columns.length;
    for (const colArr of columns) {
      for (const ev of colArr) {
        ev.columns = totalCols;
      }
    }
  }

  const res = Array(events.length);
  for (const ev of events) res[ev._idx] = ev;
  return res;
}

function cryptoRandomId() {
  try {
    return crypto.randomUUID();
  } catch (_) {
    return Math.random().toString(36).slice(2);
  }
}

export default function ScheduleTable() {
  const [view, setView] = useState(() => {
    try {
      return window.matchMedia && window.matchMedia('(min-width: 768px)').matches ? 'week' : 'day';
    } catch (_) {
      return 'week';
    }
  }); // 'day' | 'week'
  const [currentDate, setCurrentDate] = useState(() => startOfDay(new Date()));
  // Храним только серверные данные. Без дефолтного сида — чтобы не путать пользователя.
  const [lessons, setLessons] = useState([]);
  const { accessToken } = useAuth?.() || {};
  const [editing, setEditing] = useState(null); // lesson | null
  const [showForm, setShowForm] = useState(false);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    // Оповещаем других слушателей (если есть) о изменении расписания
    try {
      window.dispatchEvent(new CustomEvent("lessonsUpdated"));
    } catch (_) {
      // no-op for environments without CustomEvent
    }
  }, [lessons]);

  // Загрузка занятий из API при наличии токена
  useEffect(() => {
    if (!accessToken) return;
    api
      .listLessons()
      .then((items) => setLessons(items.map(mapApiLessonToUi)))
      .catch(() => {
        setWarning("Не удалось загрузить расписание с сервера. Попробуйте обновить страницу.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const range = useMemo(() => {
    if (view === "day") {
      return { from: startOfDay(currentDate), to: startOfDay(currentDate) };
    }
    const sw = startOfWeek(currentDate);
    return { from: sw, to: addDays(sw, 6) };
  }, [view, currentDate]);

  const rangeLessons = useMemo(() => getRangeFilter(lessons, range.from, range.to), [lessons, range]);
  const byDay = useMemo(() => groupByDay(rangeLessons), [rangeLessons]);

  function onPrev() {
    setCurrentDate((d) => (view === "day" ? addDays(d, -1) : addDays(d, -7)));
  }
  function onNext() {
    setCurrentDate((d) => (view === "day" ? addDays(d, 1) : addDays(d, 7)));
  }

  function onToday() {
    setCurrentDate(startOfDay(new Date()));
  }

  function openCreateAt(dayDate, hour = 10) {
    if (!accessToken) {
      setWarning("Чтобы добавлять занятия, войдите в систему.");
      return;
    }
    const start = new Date(dayDate);
    const startHour = Math.max(HOURS_START, hour);
    start.setHours(startHour, 0, 0, 0);

    const end = new Date(start);
    if (startHour >= HOURS_END - 1) {
      end.setHours(HOURS_END - 1, 59, 0, 0);
    } else {
      end.setHours(startHour + 1, 0, 0, 0);
    }

    setEditing({
      id: null,
      subject: "",
      title: "",
      description: "",
      color: "#4F8CFF",
      start_time: start.toISOString(),
      end_time: end.toISOString(),
    });
    setShowForm(true);
  }

  function openEdit(lesson) {
    if (!accessToken) {
      setWarning("Редактирование доступно только после входа.");
      return;
    }
    setEditing({ ...lesson });
    setShowForm(true);
  }

  function removeLesson(id) {
    if (!accessToken) {
      setWarning("Удаление доступно только для авторизованных пользователей.");
      return;
    }
    // Сначала оптимистично уберём из UI
    const removed = lessons.find((l) => l.id === id);
    setLessons((ls) => ls.filter((l) => l.id !== id));
    // Если элемент существует на сервере — удалим там и потом перечитаем список
    if (removed?.persisted) {
      api
        .deleteLesson(id)
        .then(() => api.listLessons())
        .then((items) => setLessons(items.map(mapApiLessonToUi)))
        .catch(() => {
          setWarning("Не удалось удалить занятие на сервере. Обновите страницу.");
        });
    }
  }

  function saveLesson(data) {
    if (!accessToken) {
      setWarning("Сохранение доступно только после входа в систему.");
      return false;
    }
    // Валидация
    const s = new Date(data.start_time);
    const e = new Date(data.end_time);
    if (!(e > s)) {
      setWarning("Время окончания должно быть позже начала");
      return false;
    }
    setWarning("");

    // Проверка пересечений (только предупреждение)
    const sameDay = lessons.filter((l) => formatISO(new Date(l.start_time)) === formatISO(s) && l.id !== data.id);
    const hasOverlap = sameDay.some((l) => {
      const ls = new Date(l.start_time).getTime();
      const le = new Date(l.end_time).getTime();
      return s.getTime() < le && ls < e.getTime();
    });
    if (hasOverlap) {
      setWarning("Предупреждение: занятие пересекается с другим. Будет отображено рядом.");
    }

    const titleTrimmed = (data.title || "").trim();
    const descTrimmed = (data.description || "").trim();
    const payload = {
      subject: (data.subject || "Предмет").trim(),
      title: titleTrimmed ? titleTrimmed : undefined, // не отправляем пустую строку — поле опционально
      description: descTrimmed ? descTrimmed : undefined,
      color: data.color || "#4F8CFF",
      start_time: data.start_time,
      end_time: data.end_time,
    };

    // Локальное обновление для мгновенного UX (только для авторизованных)
    if (!data.id) {
      data.id = cryptoRandomId();
      data.persisted = false;
      setLessons((ls) => [...ls, { ...data }]);
    } else {
      setLessons((ls) => ls.map((l) => (l.id === data.id ? { ...data } : l)));
    }
    setShowForm(false);

    // Серверная запись
    const isPersisted = Boolean(data?.persisted && data?.id);
    const op = isPersisted
      ? api.updateLesson(data.id, payload)
      : api.createLesson(payload);

    op
      .then(() => api.listLessons())
      .then((items) => setLessons(items.map(mapApiLessonToUi)))
      .catch((err) => {
        const msg = err?.payload?.error?.message || err?.message || "Не удалось сохранить занятие на сервере.";
        setWarning(String(msg));
        console.error("LESSON_SAVE_ERROR", { payload, err });
      });
    return true;
  }

  function mapApiLessonToUi(l) {
    return {
      id: l.id,
      subject: l.subject,
      title: l.title,
      description: l.description,
      start_time: typeof l.start_time === 'string' ? l.start_time : new Date(l.start_time).toISOString(),
      end_time: typeof l.end_time === 'string' ? l.end_time : new Date(l.end_time).toISOString(),
      color: l.color,
      persisted: true,
    };
  }


  const daysToRender = useMemo(() => {
    if (view === "day") return [startOfDay(currentDate)];
    const sw = startOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => addDays(sw, i));
  }, [view, currentDate]);

  const gridMinWidthClass = daysToRender.length > 1 ? 'min-w-[900px]' : 'min-w-0';

  return (
    <div className="p-4 md:p-6 h-full flex flex-col min-h-0">
      <div className="flex flex-wrap md:flex-nowrap gap-2 justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Расписание</h2>
          <span className="text-gray-500 text-sm">
            {view === "day"
              ? new Date(currentDate).toLocaleDateString("ru-RU")
              : `${new Date(daysToRender[0]).toLocaleDateString("ru-RU")} – ${new Date(
                  daysToRender[6]
                ).toLocaleDateString("ru-RU")}`}
          </span>
        </div>
        <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
          <button className={`px-3 py-1 rounded border ${view === "day" ? "bg-blue-600 text-white border-blue-600" : "border-gray-300"}`} onClick={() => setView("day")}>
            День
          </button>
          <button className={`hidden md:inline-flex px-3 py-1 rounded border ${view === "week" ? "bg-blue-600 text-white border-blue-600" : "border-gray-300"}`} onClick={() => setView("week")}>
            Неделя
          </button>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <button className="px-3 py-1 rounded border border-gray-300" onClick={onPrev}>
            ◀
          </button>
          <button className="px-3 py-1 rounded border border-gray-300" onClick={onToday}>
            Сегодня
          </button>
          <button className="px-3 py-1 rounded border border-gray-300" onClick={onNext}>
            ▶
          </button>
          <input
            type="date"
            className="ml-2 px-2 py-1 rounded border border-gray-300"
            value={formatISO(currentDate)}
            onChange={(e) => setCurrentDate(startOfDay(new Date(e.target.value)))}
          />
          <button
            className="ml-2 px-3 py-1 rounded bg-blue-600 text-white"
            onClick={() => openCreateAt(daysToRender[0])}
          >
            + Добавить
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-auto md:overflow-auto rounded-lg border border-gray-200 bg-white">
        <div className={`${gridMinWidthClass} grid`} style={{ gridTemplateColumns: `80px repeat(${daysToRender.length}, 1fr)` }}>
          {/* Левая колонка со временем */}
          <div className="relative border-r border-gray-200">
            <div className="relative" style={{ height: MINUTES_TOTAL * PX_PER_MINUTE }}>
              {Array.from({ length: HOURS_END - HOURS_START + 1 }, (_, i) => HOURS_START + i).map((h) => (
                <div key={h} className="absolute w-full text-xs text-gray-500" style={{ top: (h - HOURS_START) * 60 * PX_PER_MINUTE }}>
                  <div className="absolute left-0 right-0 border-t border-gray-100" />
                  <span className="absolute -top-2 left-2 bg-white px-1 z-10">{h === 24 ? "00:00" : timeLabel(h)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Дни */}
          {daysToRender.map((day, idx) => {
            const key = formatISO(day);
            const list = byDay.get(key) || [];
            const laid = layoutDay(list);
            return (
              <div key={idx} className="relative border-r border-gray-100">
                {/* Заголовок дня */}
                <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100 p-2 text-sm font-medium flex flex-col items-center">
                  <div className="flex items-center justify-center gap-2">
                    <span>{ruDaysShort[(day.getDay() + 6) % 7]}</span>
                    <span className="text-gray-500">{day.getDate()}.{String(day.getMonth() + 1).padStart(2, "0")}</span>
                  </div>
                  <button
                    className="mt-1 px-2 py-1 rounded text-blue-600 text-xs border border-blue-200 hover:bg-blue-50"
                    onClick={() => openCreateAt(day)}
                  >
                    Добавить
                  </button>
                </div>

                {/* Сетка времени */}
                <div className="relative" style={{ height: MINUTES_TOTAL * PX_PER_MINUTE }} onDoubleClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const y = e.clientY - rect.top;
                  const clickedMinutes = y / PX_PER_MINUTE;
                  const clickedHour = Math.floor(clickedMinutes / 60) + HOURS_START;
                  openCreateAt(day, clickedHour);
                }}>

                    {Array.from({ length: HOURS_END - HOURS_START + 1 }, (_, i) => HOURS_START + i).map((h) => (
                      <div key={h} className="absolute left-0 right-0 border-t border-gray-100" style={{ top: (h - HOURS_START) * 60 * PX_PER_MINUTE }} />
                    ))}

                  {/* Сами занятия */}
                  {laid.map((ev) => {
                    const s = clampToGrid(new Date(ev.start_time));
                    const e = clampToGrid(new Date(ev.end_time));
                    const top = minutesSinceGridStart(s) * PX_PER_MINUTE;
                    const height = Math.max((e - s) / 60000, 15) * PX_PER_MINUTE; // мин -> px
                    const widthPct = 100 / (ev.columns || 1);
                    const leftPct = (ev.column || 0) * widthPct;
                    return (
                      <div
                        key={ev.id}
                        className="absolute px-2 py-1 rounded-md shadow-sm text-xs overflow-hidden cursor-pointer"
                        style={{
                          top,
                          height,
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                          backgroundColor: ev.color || "#E5F0FF",
                          borderLeft: `4px solid ${ev.color || "#4F8CFF"}`,
                        }}
                        onClick={() => openEdit(ev)}
                        title={`${ev.subject} — ${ev.title}`}
                      >
                        <div className="font-semibold truncate">{ev.subject}</div>
                        <div className="truncate">{ev.title}</div>
                        {ev.description ? (
                          <div className="text-[11px] text-gray-700 line-clamp-2">{ev.description}</div>
                        ) : null}
                        <div className="text-[11px] text-gray-700 mt-1">
                          {new Date(ev.start_time).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                          {" – "}
                          {new Date(ev.end_time).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showForm && (
        <LessonForm
          data={editing}
          onClose={() => {
            setShowForm(false);
            setWarning("");
          }}
          onSave={saveLesson}
          onDelete={editing?.id ? () => { removeLesson(editing.id); setShowForm(false); } : null}
          warning={warning}
        />
      )}
    </div>
  );
}

function LessonForm({ data, onClose, onSave, onDelete, warning }) {
  const [form, setForm] = useState({ ...data });

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-[560px] rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{form.id ? "Редактировать занятие" : "Новое занятие"}</h3>
          <button className="text-gray-500" onClick={onClose}>✕</button>
        </div>
        {warning ? (
          <div className="mb-3 text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded">{warning}</div>
        ) : null}
        <form className="grid grid-cols-2 gap-3" onSubmit={submit}>
          <div className="col-span-2">
            <label className="text-sm text-gray-600">Предмет</label>
            <input className="w-full border rounded px-2 py-1" value={form.subject} onChange={(e) => setField("subject", e.target.value)} required />
          </div>
          <div className="col-span-2">
            <label className="text-sm text-gray-600">Название</label>
            <input className="w-full border rounded px-2 py-1" value={form.title} onChange={(e) => setField("title", e.target.value)} required />
          </div>
          <div className="col-span-2">
            <label className="text-sm text-gray-600">Описание</label>
            <textarea className="w-full border rounded px-2 py-1" rows={2} value={form.description || ""} onChange={(e) => setField("description", e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600">Дата</label>
            <input
              type="date"
              className="w-full border rounded px-2 py-1"
              value={formatISO(new Date(form.start_time))}
              onChange={(e) => {
                const d = e.target.value; // YYYY-MM-DD
                const startTime = formatTime(new Date(form.start_time));
                const endTime = formatTime(new Date(form.end_time));
                setField("start_time", combineDateAndTime(d, startTime));
                setField("end_time", combineDateAndTime(d, endTime));
              }}
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Цвет</label>
            <input type="color" className="w-full h-[36px] border rounded" value={form.color || "#4F8CFF"} onChange={(e) => setField("color", e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600">Начало</label>
            <input
              type="time"
              className="w-full border rounded px-2 py-1"
              value={formatTime(new Date(form.start_time))}
              onChange={(e) => {
                const datePart = formatISO(new Date(form.start_time));
                setField("start_time", combineDateAndTime(datePart, e.target.value));
              }}
              required
              min={`${String(HOURS_START).padStart(2, "0")}:00`}
              max={`${String(HOURS_END - 1).padStart(2, "0")}:59`}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Окончание</label>
            <input
              type="time"
              className="w-full border rounded px-2 py-1"
              value={formatTime(new Date(form.end_time))}
              onChange={(e) => {
                const datePart = formatISO(new Date(form.end_time));
                setField("end_time", combineDateAndTime(datePart, e.target.value));
              }}
              required
              min={`${String(HOURS_START).padStart(2, "0")}:00`}
              max={`${String(HOURS_END - 1).padStart(2, "0")}:59`}
            />
          </div>

          <div className="col-span-2 flex items-center justify-between mt-2">
            {onDelete ? (
              <button type="button" onClick={onDelete} className="px-3 py-1 rounded border border-red-300 text-red-600">Удалить</button>
            ) : <span />}
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-3 py-1 rounded border border-gray-300">Отмена</button>
              <button type="submit" className="px-3 py-1 rounded bg-blue-600 text-white">Сохранить</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
