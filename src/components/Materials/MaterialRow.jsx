import { FaFilePdf, FaFileWord, FaFilePowerpoint, FaFileExcel, FaFileAlt, FaFileArchive, FaImage, FaMusic, FaVideo, FaLink, FaDownload, FaEdit, FaTrash } from "react-icons/fa";

function iconByExt(ext, type) {
  const e = (ext || "").toLowerCase();
  if (type === "video") return <FaVideo className="text-red-500" />;
  if (type === "link") return <FaLink className="text-green-600" />;
  switch (e) {
    case "pdf":
      return <FaFilePdf className="text-red-600" />;
    case "doc":
    case "docx":
      return <FaFileWord className="text-blue-600" />;
    case "ppt":
    case "pptx":
      return <FaFilePowerpoint className="text-orange-500" />;
    case "xls":
    case "xlsx":
      return <FaFileExcel className="text-green-600" />;
    case "zip":
    case "rar":
    case "7z":
      return <FaFileArchive className="text-yellow-600" />;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
      return <FaImage className="text-purple-500" />;
    case "mp3":
    case "wav":
      return <FaMusic className="text-emerald-600" />;
    case "mp4":
    case "mov":
    case "avi":
      return <FaVideo className="text-red-500" />;
    default:
      return <FaFileAlt className="text-gray-600" />;
  }
}

export default function MaterialRow({ item, onEdit, onDelete }) {
  const sourceForExt = (item.url || item.link || item.title || "").toString();
  const match = sourceForExt.match(/\.([a-zA-Z0-9]+)(?:$|[?#])/);
  const ext = item.fileExt || (match ? match[1].toLowerCase() : undefined);
  const Icon = iconByExt(ext, item.type);

  return (
    <div className="flex items-center justify-between p-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 flex items-center justify-center">{Icon}</div>
        <div className="min-w-0">
          <div className="font-medium truncate">{item.title}</div>
          <div className="text-xs text-gray-500 truncate">{item.description}</div>
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {item.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded uppercase tracking-wider font-semibold"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4 shrink-0">
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center gap-1"
            title="Открыть/скачать"
          >
            <FaDownload />
            <span className="hidden sm:inline">Открыть</span>
          </a>
        )}
        <button
          onClick={() => onEdit(item)}
          className="px-2 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 flex items-center gap-1"
        >
          <FaEdit />
          <span className="hidden sm:inline">Редактировать</span>
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="px-2 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 flex items-center gap-1"
        >
          <FaTrash />
          <span className="hidden sm:inline">Удалить</span>
        </button>
      </div>
    </div>
  );
}
