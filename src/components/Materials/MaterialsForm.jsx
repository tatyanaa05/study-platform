import { useState, useEffect } from "react";

export default function MaterialsForm({ onSave, initialData, onClose }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "article",
    link: "",
    subject: "",
    tags: "",
    file: null,
    fileName: "",
    fileExt: undefined,
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        type: initialData.type || "article",
        // При редактировании подставляем ссылку из url (API) или legacy link
        link: initialData.link || initialData.url || "",
        subject: initialData.subject || "",
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(", ") : initialData.tags || "",
        file: null,
        fileName: initialData.fileName || initialData.title || "",
        fileExt: initialData.fileExt,
      }); // файл отдельно
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const name = file.name;
      const ext = (name.match(/\.([a-zA-Z0-9]+)$/) || [])[1]?.toLowerCase();
      setForm({
        ...form,
        title: form.title || name,
        type: "file",
        link: url,
        file,
        fileName: name,
        fileExt: ext,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const tagsArray = form.tags
      ? form.tags.split(",").map((t) => t.trim()).filter((t) => t !== "")
      : [];
    const item = {
      ...form,
      tags: tagsArray,
      link: form.link,
      // Нормализуем поле для UI и API
      url: form.link || undefined,
    };
    onSave(item);
    setForm({
      title: "",
      description: "",
      type: "article",
      link: "",
      subject: "",
      tags: "",
      file: null,
      fileName: "",
      fileExt: undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 p-4 rounded-xl mb-6 border"
    >
      <h3 className="text-lg font-semibold mb-2">
        {initialData ? "Редактировать материал" : "Добавить материал"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          name="subject"
          placeholder="Предмет (например, Математика)"
          value={form.subject}
          onChange={handleChange}
          required
          className="p-2 border rounded md:col-span-2"
        />
        <input
          type="text"
          name="title"
          placeholder="Название"
          value={form.title}
          onChange={handleChange}
          required
          className="p-2 border rounded"
        />
        <input
          type="text"
          name="tags"
          placeholder="Теги (через запятую)"
          value={form.tags}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="p-2 border rounded"
        >
          <option value="article">Статья</option>
          <option value="video">Видео</option>
          <option value="link">Ссылка</option>
          <option value="file">Файл</option>
        </select>

        {form.type === "file" ? (
          <input
            type="file"
            onChange={handleFileChange}
            accept="*/*"
            className="col-span-2 p-2 border rounded"
          />
        ) : (
          <input
            type="text"
            name="link"
            placeholder="Ссылка (URL)"
            value={form.link}
            onChange={handleChange}
            required={form.type !== "file"}
            className="col-span-2 p-2 border rounded"
          />
        )}

        <textarea
          name="description"
          placeholder="Описание"
          value={form.description}
          onChange={handleChange}
          className="p-2 border rounded col-span-2"
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {initialData ? "Сохранить" : "Добавить"}
        </button>
        {initialData && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:underline"
          >
            Отмена
          </button>
        )}
      </div>
    </form>
  );
}
