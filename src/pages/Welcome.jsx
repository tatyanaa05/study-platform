import { Link } from "react-router-dom";
import heroImg from "../assets/1.png";

export default function Welcome() {
  return (
    <div className="h-screen w-full relative overflow-hidden flex items-center justify-center px-4 bg-[#EEF3FA]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-sky-200/60 blur-3xl" />
        <div className="absolute -bottom-20 -right-24 h-80 w-80 rounded-full bg-rose-200/60 blur-3xl" />
      </div>

      <div className="relative w-full max-w-3xl rounded-3xl bg-white/90 shadow-xl ring-1 ring-black/5 overflow-hidden">
        {/* Верхний баннер */}
        <div className="relative p-6 sm:p-8 pb-4">
          <div className="relative">
            <img
              src={heroImg}
              alt="Иллюстрация обучения: книга, академическая шапка, идеи и компас"
              className="w-full h-44 sm:h-56 object-cover rounded-2xl shadow-sm"
              loading="eager"
            />

            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-transparent to-rose-100/40" />
          </div>
        </div>

        {/* Контент */}
        <div className="px-6 sm:px-8 pb-8 text-center text-gray-800">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            Добро пожаловать в
            {" "}
            <span className="bg-gradient-to-r from-sky-600 to-rose-500 bg-clip-text text-transparent">
              Учебный планер
            </span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-7">
            Это учебное веб‑приложение, которое помогает планировать занятия, следить за расписанием,
            управлять материалами и задачами. Начните с регистрации или войдите в свой аккаунт.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex justify-center items-center px-6 py-3 rounded-xl bg-sky-600 text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
            >
              Регистрация
            </Link>
            <Link
              to="/login"
              className="inline-flex justify-center items-center px-6 py-3 rounded-xl border border-gray-300 text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
            >
              Войти
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
