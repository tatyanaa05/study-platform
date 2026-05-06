import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth?.() || {};
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!register) return;
    register({ name, email, password })
      .then(() => navigate("/"))
      .catch(() => {});
  };

  return (
    <div className="min-h-screen bg-[#EFF3F8] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-gray-900">
        <h1 className="text-2xl font-bold mb-6 text-center">Регистрация</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Имя</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Пароль</label>
            <div className="relative">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                className="w-full border rounded-lg px-3 py-2 pr-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-r-lg"
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                aria-pressed={showPassword}
                aria-controls="register-password"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  <span className="text-sm">Скрыть</span>
                ) : (
                  <span className="text-sm">Показать</span>
                )}
              </button>
            </div>
          </div>
          {error && (
            <div className="text-red-600 text-sm" role="alert">{String(error)}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-2 rounded-lg ${loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading ? "Создаём..." : "Создать аккаунт"}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600">
          Уже есть аккаунт? <Link to="/login" className="text-blue-600">Войти</Link>
        </div>
        <div className="mt-6 text-center">
          <Link to="/welcome" className="text-gray-500 hover:underline">На приветственную страницу</Link>
        </div>
      </div>
    </div>
  );
}
