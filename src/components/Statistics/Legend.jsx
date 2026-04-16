import React from "react";

export default function Legend({ items }) {
  return (
    <div className="space-y-2">
      <div className="flex text-xs text-gray-500 uppercase tracking-wide px-1">
        <div className="w-3 mr-2" />
        <div className="flex-1">предметы</div>
        <div className="w-24 text-right">время</div>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-center px-1">
            <span
              className="w-3 h-3 rounded-sm mr-2 inline-block"
              style={{ backgroundColor: item.color }}
            />
            <span className="flex-1 text-sm text-gray-800 truncate">
              {item.label}
            </span>
            <span className="w-24 text-right text-sm text-gray-600">
              {item.hours > 0 ? `${item.hours} ч` : "—"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
