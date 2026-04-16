const typeLabels = {
  all: "Все",
  article: "Статьи",
  video: "Видео",
  link: "Ссылки",
  file: "Файлы",
};

const tabs = ["all", "article", "video", "link", "file"];

export default function MaterialsFilter({ activeTab, setActiveTab }) {
  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === tab
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {typeLabels[tab]}
        </button>
      ))}
    </div>
  );
}
