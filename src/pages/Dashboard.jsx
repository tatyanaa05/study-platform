import { useEffect, useState } from "react";
import Statistics from "../components/Statistics";
import Header from "../components/Header";
import TaskList from "../components/TaskList";
import YearCalendar from "../components/YearCalendar";
import { useProfile } from "../context/ProfileContext";
import dayjs from "dayjs";


export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const { profile } = useProfile();
  const [subjects, setSubjects] = useState(() => getSubjectsFromLessons());

  // Получить уникальные предметы из localStorage("lessons")
  function getSubjectsFromLessons() {
    try {
      const raw = localStorage.getItem("lessons");
      const lessons = raw ? JSON.parse(raw) : [];
      const uniq = Array.from(
        new Set(
          lessons
            .map((l) => (l && typeof l.subject === "string" ? l.subject.trim() : ""))
            .filter(Boolean)
        )
      );
      return uniq.map((name) => ({ id: name, title: name }));
    } catch (_) {
      return [];
    }
  }

  // Подписка на обновления расписания из ScheduleTable (CustomEvent) и изменения localStorage
  useEffect(() => {
    const onUpdated = () => setSubjects(getSubjectsFromLessons());
    const onStorage = (e) => {
      if (e.key === "lessons") onUpdated();
    };
    window.addEventListener("lessonsUpdated", onUpdated);
    window.addEventListener("storage", onStorage);
    // начальная синхронизация на случай внешних изменений
    onUpdated();
    return () => {
      window.removeEventListener("lessonsUpdated", onUpdated);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return (
    <div className="flex-1 p-6 space-y-6">
      <Header studentName={profile.name} />
      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-2 space-y-6">
          <YearCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>
          <Statistics />
        </div>
        <div className="space-y-6">
          <TaskList courses={subjects} selectedDate={selectedDate}/>
        </div>
      </div>
    </div>
  );
}