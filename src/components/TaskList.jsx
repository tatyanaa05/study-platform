import { useState, useEffect } from "react";
import dayjs from "dayjs";
export default function TaskList({ courses, selectedDate }) {
  const [tasks, setTasks] = useState(() => {
    const stored = localStorage.getItem("tasks");
    return stored
      ? JSON.parse(stored)
      : [];
  });
  
  const [newTask, setNewTask] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("medium");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterCourseId, setFilterCourseId] = useState("");
  const [filterByDate, setFilterByDate] = useState(false);

  const toggleTask = (id) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const addTask = () => {
    if (newTask.trim() === "") return;
    const newId = tasks.length + 1;
    setTasks([
      ...tasks,
      {
        id: newId,
        text: newTask,
        done: false,
        deadline,
        priority,
        courseId: selectedCourseId ? selectedCourseId : null,
      },
    ]);
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
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

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
  return (
    <div className="border rounded-xl p-5 bg-white w-[400px] max-h-[550px] overflow-y-auto relative">
      <h2 className="font-semibold mb-2 text-lg">Список задач</h2>

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
              className={`flex flex-col gap-1 cursor-pointer border rounded-lg px-3 py-2 hover:bg-gray-100 transition`}
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
                  } font-medium`}
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
                      courseId: parseInt(e.target.value) || null,
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
                    onClick={() => {
                      setTasks((prev) =>
                        prev.map((t) =>
                          t.id === selectedTask.id ? selectedTask : t
                        )
                      );
                      setSelectedTask(null);
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
                    onClick={() => {
                      setTasks((prev) =>
                        prev.filter((t) => t.id !== selectedTask.id)
                      );
                      setSelectedTask(null);
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
