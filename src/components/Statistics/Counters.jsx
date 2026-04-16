import React from "react";

export default function Counters({ completed, total }) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <div className="text-sm text-gray-600">выполнено задач</div>
        <div className="text-2xl font-bold text-green-700">{completed}</div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
        <div className="text-sm text-gray-600">общее количество</div>
        <div className="text-2xl font-bold text-blue-700">{total}</div>
      </div>
    </div>
  );
}
