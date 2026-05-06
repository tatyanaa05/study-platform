import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";
import dayjs from "dayjs";
export default function TaskList({ courses, selectedDate }) {
  // Храним задачи только в памяти (без localStorage)
  const [tasks, setTasks] = useState([]);
  const { accessToken } = useAuth?.() || {};
  
  const [newTask, setNewTask] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("medium");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterCourseId, setFilterCourseId] = useState("");
  const [filterByDate, setFilterByDate] = useState(false);

  const toggleTask = async (id) => {
    const prev = tasks;
    const next = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    setTasks(next);

    // Если нет токена — ограничимся локальным переключением
    if (!accessToken) return;

    const toggled = next.find((t) => t.id === id);
    const newStatus = toggled?.done ? 'done' : 'todo';
    try {
      await api.updateTask(id, { status: newStatus });
      const items = await api.listTasks();
      setTasks(items.map(mapApiTaskToUi));
      try { window.dispatchEvent(new Event('tasksUpdated')); } catch (_) {}
    } catch (_e) {
      // Откатим локально и синхронизируемся с сервером
      setTasks(prev);
      try {
        const items = await api.listTasks();
        setTasks(items.map(mapApiTaskToUi));
      } catch (_) {}
    }
  };

  const addTask = () => {
    if (newTask.trim() === "") return;
    const newId = tasks.length + 1;
    const newLocal = {
      id: newId,
      text: newTask,
      done: false,
      deadline,
      priority,
      courseId: selectedCourseId ? selectedCourseId : null,
    };
    setTasks([...tasks, newLocal]);

    // Если есть токен — отправим создание на сервер и затем перезагрузим список
    if (accessToken) {
      const subject = (() => {
        const course = courses.find((c) => String(c.id) === String(selectedCourseId));
        return course ? course.title : "Общий";
      })();
      const body = {
        title: newTask,
        subject,
        status: "todo",
        planned_date: deadline ? `${deadline}T00:00:00Z` : undefined,
        estimated_time: undefined,
        priority,
      };
      api.createTask(body)
        .then(() => api.listTasks())
        .then((items) => {
          setTasks(items.map(mapApiTaskToUi));
          try { window.dispatchEvent(new Event('tasksUpdated')); } catch (_) {}
        })
        .catch(() => {});
    }
    setNewTask("");
    setDeadline("");
    setPriority("medium");
    setSelectedCourseId("");
    setShowForm(false);
  };


  const filteredTasks = tasks
    .filter((task) => (filterCourseId === "" ? true : task.courseId === filterCourseId))
    .filter((task) =>
      filterByDate && selectedDate
        ? task.deadline === dayjs(selectedDate).format("YYYY-MM-DD")
        : true
    );

  const getCourse = (courseId) => courses.find((c) => c.id === courseId) || null;
  // Ранее задачи синхронизировались с localStorage — теперь убрано

  // Если из расписания удалили предмет, снимаем несоответствующий фильтр
  useEffect(() => {
    if (filterCourseId && !courses.some((c) => String(c.id) === String(filterCourseId))) {
      setFilterCourseId("");
    }
    if (selectedCourseId && !courses.some((c) => String(c.id) === String(selectedCourseId))) {
      setSelectedCourseId("");
    }
  }, [courses]);

  // Предзаполняем дату дедлайна текущей выбранной датой при открытии формы
  useEffect(() => {
    if (showForm && selectedDate && !deadline) {
      setDeadline(dayjs(selectedDate).format("YYYY-MM-DD"));
    }
  }, [showForm, selectedDate]);

  // Загрузка задач из API при наличии токена
  useEffect(() => {
    if (!accessToken) return; // без токена — оставляем поведение in-memory
    api
      .listTasks()
      .then((items) => setTasks(items.map(mapApiTaskToUi)))
      .catch(() => {
        // молча игнорируем ошибки на первом этапе интеграции
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  function mapApiTaskToUi(t) {
    return {
      id: t.id,
      text: t.title || t.subject || "Задача",
      done: t.status === "done" || !!t.completed_at,
      deadline: t.planned_date ? dayjs(t.planned_date).format("YYYY-MM-DD") : "",
      priority: t.priority || "medium",
      courseId: t.subject || null, // в UI courseId может быть id предмета; используем subject как ключ
    };
  }
  return (
    <div className="border rounded-xl p-3 md:p-5 bg-white w-full md:w-[400px] max-w-full max-h-[420px] md:max-h-[550px] overflow-y-auto relative">
      <h2 className="font-semibold mb-2 text-base md:text-lg">Список задач</h2>

      {/* Фильтр по предмету */}
      <div className="mb-3 space-y-2">
        {selectedDate && (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={filterByDate}
              onChange={(e) => setFilterByDate(e.target.checked)}
            />
            Только на дату: {dayjs(selectedDate).format("DD.MM.YYYY")}
          </label>
        )}
        <select
          value={filterCourseId}
          onChange={(e) => setFilterCourseId(e.target.value)}
          className="border rounded-md px-2 py-1 text-sm w-full"
        >
          <option value="">Все предметы</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* Список задач */}
      <ul className="space-y-2">
        {filteredTasks.length === 0 && (
          <li className="text-sm text-gray-500">Задач не найдено.</li>
        )}
        {filteredTasks.map((task) => {
          const course = getCourse(task.courseId);
          return (
            <li
              key={task.id}
              className={`flex flex-col gap-1 cursor-pointer border rounded-lg px-3 py-2 md:px-4 md:py-3 hover:bg-gray-100 transition`}
              onClick={() => setSelectedTask(task)}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={task.done}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => toggleTask(task.id)}
                  className="accent-blue-500"
                />
                <span
                  className={`${
                    task.done ? "line-through text-gray-400" : ""
                  } font-medium text-sm md:text-base`}
                >
                  {task.text}
                </span>
                {task.priority && (
                  <span
                    className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                      task.priority === "high"
                        ? "bg-red-100 text-red-700"
                        : task.priority === "medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {task.priority === "high"
                      ? "Высокий"
                      : task.priority === "medium"
                      ? "Средний"
                      : "Низкий"}
                  </span>
                )}
              </div>
              {task.deadline && (
                <span className="text-xs text-gray-600">
                  до {task.deadline}
                </span>
              )}
              {course && (
                <span className="text-xs italic text-gray-600">
                  {course.title}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {/* Кнопка и форма */}
      <div className="flex flex-col items-center">
        {showForm ? (
          <div className="w-full space-y-3 mt-4">
            <input
              type="text"
              placeholder="Введите задачу"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="low">Низкий приоритет</option>
              <option value="medium">Средний приоритет</option>
              <option value="high">Высокий приоритет</option>
            </select>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="">Без привязки</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            <div className="flex justify-center gap-3">
              <button
                onClick={addTask}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Добавить
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-600 hover:text-red-500 text-sm"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm px-6 py-2 mt-4 rounded-full shadow-md"
          >
            + Новая задача
          </button>
        )}
      </div>

      {/* Модальное окно */}
      {selectedTask && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex justify-center items-center z-10">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            {selectedTask.editing ? (
              <>
                <input
                  type="text"
                  value={selectedTask.text}
                  onChange={(e) =>
                    setSelectedTask({ ...selectedTask, text: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm mb-2"
                />
                <input
                  type="date"
                  value={selectedTask.deadline || ""}
                  onChange={(e) =>
                    setSelectedTask({
                      ...selectedTask,
                      deadline: e.target.value,
                    })
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm mb-2"
                />
                <select
                  value={selectedTask.priority || "medium"}
                  onChange={(e) =>
                    setSelectedTask({
                      ...selectedTask,
                      priority: e.target.value,
                    })
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm mb-4"
                >
                  <option value="low">Низкий приоритет</option>
                  <option value="medium">Средний приоритет</option>
                  <option value="high">Высокий приоритет</option>
                </select>
                <select
                  value={selectedTask.courseId || ""}
                  onChange={(e) =>
                    setSelectedTask({
                      ...selectedTask,
                      // courseId в нашем UI — это строка subject из расписания
                      courseId: e.target.value || null,
                    })
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm mb-4"
                >
                  <option value="">Без привязки</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={async () => {
                      const edited = selectedTask;
                      // Оптимистично обновим локальный список
                      setTasks((prev) => prev.map((t) => (t.id === edited.id ? edited : t)));
                      setSelectedTask(null);

                      if (!accessToken) return; // Без токена — только локально

                      try {
                        // Определим subject по выбранному courseId (или строке subject из UI)
                        let subjectVal = 'Общий';
                        const foundCourse = courses.find((c) => String(c.id) === String(edited.courseId));
                        if (foundCourse) subjectVal = foundCourse.title;
                        else if (typeof edited.courseId === 'string' && edited.courseId.trim()) subjectVal = edited.courseId.trim();

                        const body = {
                          title: edited.text,
                          subject: subjectVal,
                          priority: edited.priority ?? null,
                          planned_date: edited.deadline ? `${edited.deadline}T00:00:00Z` : null,
                        };
                        await api.updateTask(edited.id, body);
                        // После успешного сохранения перезагрузим список с сервера
                        const items = await api.listTasks();
                        setTasks(items.map(mapApiTaskToUi));
                        try { window.dispatchEvent(new Event('tasksUpdated')); } catch (_) {}
                      } catch (_e) {
                        // При ошибке попытаемся восстановить консистентность путём перезагрузки списка
                        try {
                          const items = await api.listTasks();
                          setTasks(items.map(mapApiTaskToUi));
                        } catch (_) {}
                      }
                    }}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={() =>
                      setSelectedTask((prev) => ({ ...prev, editing: false }))
                    }
                    className="text-gray-600 hover:text-red-500 text-sm"
                  >
                    Отмена
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">
                  {selectedTask.text}
                </h3>
                {selectedTask.deadline && (
                  <p className="text-sm mb-2">
                    Дедлайн: {selectedTask.deadline}
                  </p>
                )}
                {getCourse(selectedTask.courseId) && (
                  <p className="text-sm mb-4">
                    Предмет: {getCourse(selectedTask.courseId)?.title}
                  </p>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={async () => {
                      const id = selectedTask.id;
                      // Оптимистичное удаление из UI
                      setTasks((prev) => prev.filter((t) => t.id !== id));
                      setSelectedTask(null);
                      try {
                        if (accessToken) {
                          await api.deleteTask(id);
                          // Синхронизируем список после успешного удаления
                          const items = await api.listTasks();
                          setTasks(items.map(mapApiTaskToUi));
                          try { window.dispatchEvent(new Event('tasksUpdated')); } catch (_) {}
                        }
                      } catch (e) {
                        // В случае ошибки откатим UI путём повторной загрузки списка (если есть токен)
                        try {
                          if (accessToken) {
                            const items = await api.listTasks();
                            setTasks(items.map(mapApiTaskToUi));
                          }
                        } catch (_) {}
                      }
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Удалить
                  </button>

                  <button
                    onClick={() =>
                      setSelectedTask((prev) => ({ ...prev, editing: true }))
                    }
                    className="bg-yellow-500 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="text-gray-600 hover:text-red-500 text-sm"
                  >
                    Закрыть
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
