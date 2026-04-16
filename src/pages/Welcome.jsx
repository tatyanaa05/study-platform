import { Link } from "react-router-dom";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-[#EFF3F8] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 text-gray-900">
        {/* Hero изображение */}
        <img
          src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1600&auto=format&fit=crop"
          alt="Студенты учатся с ноутбуками и книгами"
          className="w-full h-48 sm:h-56 object-cover rounded-xl mb-6"
          loading="eager"
        />

        <h1 className="text-3xl font-bold mb-4 text-center">Добро пожаловать в Study Platform</h1>
        <p className="text-gray-600 text-center mb-6">
          Это учебное веб‑приложение, которое помогает планировать занятия, следить за расписанием,
          управлять материалами и задачами. Начните с регистрации или войдите в свой аккаунт.
        </p>
        {/* Небольшая галерея иллюстраций */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <img
            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800&auto=format&fit=crop"
            alt="Ежедневник и заметки для планирования"
            className="w-full h-24 object-cover rounded-lg"
            loading="lazy"
          />
          <img
            src="https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=800&auto=format&fit=crop"
            alt="Учебные материалы и книги на столе"
            className="w-full h-24 object-cover rounded-lg"
            loading="lazy"
          />
          <img
            src="https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=800&auto=format&fit=crop"
            alt="Ноутбук с открытым календарем расписания"
            className="w-full h-24 object-cover rounded-lg"
            loading="lazy"
          />
          <img
            src="https://images.unsplash.com/photo-1557800636-894a64c1696f?q=80&w=800&auto=format&fit=crop"
            alt="Командная работа и обсуждение задач"
            className="w-full h-24 object-cover rounded-lg"
            loading="lazy"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="inline-flex justify-center items-center px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Регистрация
          </Link>
          <Link
            to="/login"
            className="inline-flex justify-center items-center px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
}
