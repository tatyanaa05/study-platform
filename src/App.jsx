import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import ScheduleTable from "./pages/ScheduleTable";
import Materials from "./pages/Materials";
import Settings from "./pages/Settings";
import Welcome from "./pages/Welcome.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

function MainLayout() {
  return (
    <div className="min-h-screen bg-[#EFF3F8] flex items-center justify-center px-4 py-3">
      <div className="bg-white rounded-[20px] shadow-lg w-full max-w-[1300px] p-6 flex gap-6 h-[700px]">
        <Sidebar />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Гостевые страницы без сайдбара */}
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Основное приложение с лэйаутом */}
        <Route element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/schedule" element={<ScheduleTable />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
