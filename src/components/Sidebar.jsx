import { FaBook, FaCalendarAlt, FaFileAlt, FaUserCog } from "react-icons/fa";
import { NavLink } from "react-router-dom";


const menuItems = [
  { icon: <FaBook />, label: "Учебный план", path: "/" },
  { icon: <FaCalendarAlt />, label: "Расписание", path: "/schedule" },
  { icon: <FaFileAlt />, label: "Материалы", path: "/materials" },
  { icon: <FaUserCog />, label: "Настройки профиля", path: "/settings" },
];

export default function Sidebar() {
  return (
    <div className="w-56 h-full bg-white p-4 rounded-2xl shadow flex-none">
      <div className="mb-4">
        <h1 className="text-xl font-bold tracking-tight">Учебный планер</h1>
        <p className="text-xs text-gray-500">планирование и организация</p>
      </div>
      <ul className="space-y-2">
        {menuItems.map((item, idx) => (
          <li key={idx}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 p-2 rounded-xl cursor-pointer transition-colors duration-200
                 ${
                   isActive
                     ? "bg-blue-100 text-blue-600 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                 }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}