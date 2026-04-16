export default function ProfileStats({ stats }) {
  return (
    <div className="flex justify-between text-sm text-gray-600 mt-4">
      <span>
        📌 Задач: <strong>{stats.tasks}</strong>
      </span>
      <span>
        📚 Материалов: <strong>{stats.materials}</strong>
      </span>
    </div>
  );
}
