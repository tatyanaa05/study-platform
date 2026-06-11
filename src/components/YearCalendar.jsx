import React, { useState } from "react";
import dayjs from "dayjs";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { LuCalendarArrowDown, LuCalendarArrowUp } from "react-icons/lu";


export default function Calendar({ selectedDate, setSelectedDate, tasks = [] }) {
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const [isExpanded, setIsExpanded] = useState(false);

  const hasTasks = (day) => {
    const formatted = day.format("YYYY-MM-DD");
    return tasks.some(t => t.deadline === formatted);
  };

  const startOfWeek = currentDate.startOf("week").add(1, "day"); // Пн
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    startOfWeek.add(i, "day")
  );

  const startOfMonth = currentDate
    .startOf("month")
    .startOf("week")
    .add(1, "day");
  const monthDays = Array.from({ length: 35 }, (_, i) =>
    startOfMonth.add(i, "day")
  );

  const handlePrev = () => {
    setCurrentDate(
      isExpanded
        ? currentDate.subtract(1, "month")
        : currentDate.subtract(1, "week")
    );
  };

  const handleNext = () => {
    setCurrentDate(
      isExpanded ? currentDate.add(1, "month") : currentDate.add(1, "week")
    );
  };

  const isSameDay = (a, b) => a.isSame(b, "day");

  const daysToShow = isExpanded ? monthDays : weekDays;

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 w-full max-w-md transition-all">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">
          {currentDate.format("MMMM YYYY")}
        </h2>
        <div className="flex gap-2 items-center">
          <button
            onClick={handlePrev}
            className="text-gray-500 hover:text-black"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={handleNext}
            className="text-gray-500 hover:text-black"
          >
            <FaChevronRight />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 text-xl text-blue-600 hover:underline"
          >
            {isExpanded ? <LuCalendarArrowUp/> : <LuCalendarArrowDown/>}
          </button>
        </div>
      </div>

      {/* Дни недели */}
      <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-1">
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Даты */}
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {daysToShow.map((day) => {
          const isToday = day.isSame(dayjs(), "day");
          const isSelected = isSameDay(day, selectedDate);

          return (
            <button
              key={day.format("DD.MM.YYYY")}
              onClick={() => {
                setSelectedDate(day);
                setCurrentDate(day);
                if (isExpanded) setIsExpanded(false);
              }}
              className="py-1 focus:outline-none relative"
            >
              <div
                className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full 
            ${
              isSelected
                ? "bg-blue-500 text-white"
                : isToday
                ? "border border-blue-400 text-blue-600"
                : "text-gray-800"
            }
          `}
              >
                {day.format("D")}
              </div>
              {hasTasks(day) && (
                <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`}></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
