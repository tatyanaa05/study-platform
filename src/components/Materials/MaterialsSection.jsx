import MaterialsFilter from "./MaterialsFilter.jsx";
import MaterialsForm from "./MaterialsForm.jsx";
import MaterialsList from "./MaterialsList.jsx";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../lib/api.js";

export default function MaterialsSection() {
  const [materials, setMaterials] = useState([]);
  const { accessToken } = useAuth?.() || {};

  const [activeTab, setActiveTab] = useState("all");
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const filtered =
    activeTab === "all"
      ? materials
      : materials.filter((m) => m.type === activeTab);


  useEffect(() => {
    if (!accessToken) return;
    api
      .listMaterials()
      .then((list) => setMaterials(list))
      .catch(() => {});
  }, [accessToken]);

  const handleSave = (item) => {
    const body = {
      title: item.title,
      type: item.type,
      subject: item.subject || undefined,
      url: item.url || undefined,
      description: item.description || undefined,
      tags: item.tags || [],
    };

    if (editing) {
      setMaterials((prev) =>
        prev.map((m) => (m.id === editing.id ? { ...item, id: editing.id } : m))
      );
      if (accessToken) {
        api.updateMaterial(editing.id, body)
          .then(() => api.listMaterials())
          .then((list) => setMaterials(list))
          .catch(() => {});
      }
      setEditing(null);
    } else {
      const newItem = { ...item, id: Date.now() };
      setMaterials((prev) => [newItem, ...prev]);
      if (accessToken) {
        api
          .createMaterial(body)
          .then(() => api.listMaterials())
          .then((list) => setMaterials(list))
          .catch(() => {});
      }
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    try {
      if (accessToken) {
        await api.deleteMaterial(id);

        const list = await api.listMaterials();
        setMaterials(list);
      }
    } catch (_e) {
      try {
        if (accessToken) {
          const list = await api.listMaterials();
          setMaterials(list);
        }
      } catch (_) {}
    }
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
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap md:flex-nowrap">
        <h2 className="text-2xl font-bold">📚 Материалы</h2>
        <button
          onClick={openModalForAdd}
          className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 w-full sm:w-auto"
        >
          ➕ Добавить материал
        </button>
      </div>

      <MaterialsFilter activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 overflow-y-auto pr-0 md:pr-2 mt-4 min-h-0">
        <MaterialsList
          materials={filtered}
          onEdit={openModalForEdit}
          onDelete={handleDelete}
        />
      </div>

      
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 mt-16 pointer-events-none">
    <div className="bg-white w-full max-w-xl rounded-lg shadow-xl p-4 sm:p-6 relative pointer-events-auto">
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

// Загрузка материалов при наличии токена (вынесено в отдельный эффект ниже компонента не получится, оставим здесь)
// Примонтируем эффект в теле компонента выше
