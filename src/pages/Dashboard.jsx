import { useEffect, useState } from "react";
import NextEvent from "../components/NextEvent";
import Header from "../components/Header";
import TaskList from "../components/TaskList";
import YearCalendar from "../components/YearCalendar";
import { useProfile } from "../context/ProfileContext";
import dayjs from "dayjs";
import { api } from "../lib/api.js";


export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const { profile } = useProfile();
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    let aborted = false;
    async function load() {
      try {
        const lessons = await api.listLessons();
        if (aborted) return;
        const uniq = Array.from(
          new Set((lessons || []).map((l) => (l.subject || "").trim()).filter(Boolean))
        );
        setSubjects(uniq.map((s) => ({ id: s, title: s })));
      } catch (_e) {
      }
    }
    load();

    function onLessonsUpdated() {
      load();
    }
    try {
      window.addEventListener("lessonsUpdated", onLessonsUpdated);
    } catch (_) {}
    return () => {
      aborted = true;
      try { window.removeEventListener("lessonsUpdated", onLessonsUpdated); } catch (_) {}
    };
  }, []);

  return (
    <div className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6">
      <Header studentName={profile.name} />
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_400px] gap-4 md:gap-6">
        <div className="space-y-4 md:space-y-6">
          <YearCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>
          <NextEvent />
        </div>
        <div className="space-y-4 md:space-y-6">
          <TaskList courses={subjects} selectedDate={selectedDate}/>
        </div>
      </div>
    </div>
  );
}