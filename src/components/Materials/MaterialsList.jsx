import MaterialRow from "./MaterialRow.jsx";

export default function MaterialsList({ materials, onEdit, onDelete }) {
  // Группировка по предмету
  const groups = materials.reduce((acc, m) => {
    const key = m.subject || "Без предмета";
    (acc[key] = acc[key] || []).push(m);
    return acc;
  }, {});

  const subjects = Object.keys(groups).sort((a, b) => a.localeCompare(b, "ru"));

  return (
    <div className="space-y-6">
      {subjects.map((subject) => (
        <section key={subject} className="">
          <h3 className="text-xl font-semibold mb-2">{subject}</h3>
          <div className="bg-white border border-gray-200 rounded-xl divide-y">
            {groups[subject].map((item) => (
              <MaterialRow
                key={item.id}
                item={item}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
