import { FaFileAlt, FaVideo, FaLink, FaDownload } from "react-icons/fa";

const typeIcons = {
  article: <FaFileAlt className="text-blue-500" />,
  video: <FaVideo className="text-red-500" />,
  link: <FaLink className="text-green-500" />,
  file: <FaDownload className="text-purple-500" />,
};

export default function MaterialCard({ item, onEdit, onDelete }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-2 mb-2">
        {typeIcons[item.type]}
        <h3 className="text-lg font-semibold">{item.title}</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">{item.description}</p>
      <div className="flex gap-2">
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
        >
          Открыть
        </a>
        <button
          onClick={() => onEdit(item)}
          className="px-3 py-2 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition"
        >
          ✏️ Редактировать
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="px-3 py-2 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 transition"
        >
          🗑️ Удалить
        </button>
      </div>
    </div>
  );
}
