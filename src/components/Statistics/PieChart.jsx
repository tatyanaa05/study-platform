import React from "react";

// Pie chart using pure SVG. Expects data as array of { label, value, color }
export default function PieChart({ data, size = 220, strokeWidth = 42 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  // Handle empty total gracefully
  if (total === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full text-gray-400">
        Нет данных для диаграммы
      </div>
    );
  }

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;
  const segments = data.map((d, idx) => {
    const fraction = d.value / total;
    const dash = fraction * circumference;
    const gap = circumference - dash;
    const rotation = (cumulative / total) * 360 - 90; // start at top
    cumulative += d.value;
    return { dash, gap, rotation, color: d.color, key: `${d.label}-${idx}` };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        {segments.map((s) => (
          <circle
            key={s.key}
            r={radius}
            fill="transparent"
            stroke={s.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${s.dash} ${s.gap}`}
            transform={`rotate(${s.rotation})`}
            strokeLinecap="butt"
          />
        ))}
      </g>
    </svg>
  );
}
