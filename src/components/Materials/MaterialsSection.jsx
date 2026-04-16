import initialMaterials from "../../data/materials.json";
import MaterialsFilter from "./MaterialsFilter.jsx";
import MaterialsForm from "./MaterialsForm.jsx";
import MaterialsList from "./MaterialsList.jsx";
import { useEffect, useState } from "react";

export default function MaterialsSection() {
  const [materials, setMaterials] = useState(() => {
    const saved = localStorage.getItem("materials");
    return saved ? JSON.parse(saved) : initialMaterials;
  });

  const [activeTab, setActiveTab] = useState("all");
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const filtered =
    activeTab === "all"
      ? materials
      : materials.filter((m) => m.type === activeTab);

  useEffect(() => {
    localStorage.setItem("materials", JSON.stringify(materials));
  }, [materials]);

  const handleSave = (item) => {
    if (editing) {
      setMaterials((prev) =>
        prev.map((m) => (m.id === editing.id ? { ...item, id: editing.id } : m))
      );
      setEditing(null);
    } else {
      const newItem = { ...item, id: Date.now() };
      setMaterials((prev) => [newItem, ...prev]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const openModalForEdit = (item) => {
    setEditing(item);
    setShowModal(true);
  };

  const openModalForAdd = () => {
    setEditing(null);
    setShowModal(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">📚 Материалы</h2>
        <button
          onClick={openModalForAdd}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          ➕ Добавить материал
        </button>
      </div>

      <MaterialsFilter activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 overflow-y-auto pr-2 mt-4">
        <MaterialsList
          materials={filtered}
          onEdit={openModalForEdit}
          onDelete={handleDelete}
        />
      </div>

      
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 mt-16 pointer-events-none">
    <div className="bg-white w-full max-w-xl rounded-lg shadow-xl p-6 relative pointer-events-auto">
            <button
              onClick={() => {
                setShowModal(false);
                setEditing(null);
              }}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✖
            </button>
            <MaterialsForm
              onSave={handleSave}
              initialData={editing}
              onClose={() => {
                setShowModal(false);
                setEditing(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
