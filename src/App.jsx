import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import ScheduleTable from "./pages/ScheduleTable";
import Materials from "./pages/Materials";
import Settings from "./pages/Settings";
import Welcome from "./pages/Welcome.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#EFF3F8] px-4 py-3 md:flex md:items-center md:justify-center">
      <div className="bg-white rounded-[20px] shadow-lg w-full max-w-[1300px] mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 md:h-[700px]">
        {/* Мобильная шапка с бургером */}
        <div className="md:hidden flex items-center justify-between">
          <button
            className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700"
            onClick={() => setSidebarOpen(true)}
            aria-label="Открыть меню"
          >
            ☰
          </button>
          <div className="text-sm text-gray-500">Учебный планер</div>
        </div>

        {/* Боковая навигация (десктоп) */}
        <div className="hidden md:block md:flex-none">
          <Sidebar />
        </div>

        {/* Контент */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>

      {/* Мобильное выезжающее меню */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 max-w-[85%] p-3">
            <div className="h-full rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-white h-full">
                <div className="p-2 border-b flex items-center justify-end">
                  <button
                    className="px-3 py-1 rounded-lg border border-gray-200 text-gray-600"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Закрыть меню"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-2">
                  <Sidebar onNavigate={() => setSidebarOpen(false)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RequireAuth({ children }) {
  const { accessToken } = useAuth?.() || {};
  if (!accessToken) {
    return <Navigate to="/welcome" replace />;
  }
  return children;
}

function GuestOnly({ children }) {
  const { accessToken } = useAuth?.() || {};
  if (accessToken) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Гостевые страницы без сайдбара */}
        <Route path="/welcome" element={<GuestOnly><Welcome /></GuestOnly>} />
        <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

        {/* Основное приложение с лэйаутом */}
        <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="/schedule" element={<ScheduleTable />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        {/* Фолбэк: неизвестные пути отправляем на welcome (гостям) или на домашнюю страницу (авторизованным) */}
        <Route path="*" element={<RedirectUnknown />} />
      </Routes>
    </BrowserRouter>
  );
}

function RedirectUnknown() {
  const { accessToken } = useAuth?.() || {};
  return <Navigate to={accessToken ? "/" : "/welcome"} replace />;
}

export default App;
