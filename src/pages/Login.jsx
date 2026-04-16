import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    // Здесь могла бы быть логика аутентификации
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#EFF3F8] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-gray-900">
        <h1 className="text-2xl font-bold mb-6 text-center">Войти</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Пароль</label>
            <input type="password" className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            Войти
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600">
          Нет аккаунта? <Link to="/register" className="text-blue-600">Зарегистрироваться</Link>
        </div>
        <div className="mt-6 text-center">
          <Link to="/welcome" className="text-gray-500 hover:underline">На приветственную страницу</Link>
        </div>
      </div>
    </div>
  );
}
