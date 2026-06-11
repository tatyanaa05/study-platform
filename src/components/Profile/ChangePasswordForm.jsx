import { useState } from "react";
import { api } from "../../lib/api.js";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validate = () => {
    if (!currentPassword) return "Введите текущий пароль";
    if (!newPassword) return "Введите новый пароль";
    if (newPassword.length < 8) return "Новый пароль должен быть не короче 8 символов";
    if (newPassword !== confirmPassword) return "Подтверждение пароля не совпадает";
    if (newPassword === currentPassword) return "Новый пароль не должен совпадать с текущим";
    return "";
  };

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const v = validate();
    if (v) { setError(v); return; }
    setLoading(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setSuccess("Пароль успешно изменён");
      // Очистить поля
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      const msg = e?.payload?.error?.message || e.message || "Не удалось изменить пароль";
      setError(typeof msg === 'string' ? msg : "Ошибка при изменении пароля");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="current-password">Текущий пароль</label>
        <div className="relative">
          <input
            id="current-password"
            type={showCurrent ? "text" : "password"}
            className="w-full border rounded-lg px-3 py-2 pr-11"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-r-lg"
            aria-label={showCurrent ? "Скрыть пароль" : "Показать пароль"}
            aria-pressed={showCurrent}
            aria-controls="current-password"
            onClick={() => setShowCurrent((v) => !v)}
          >
            {showCurrent ? <span className="text-sm">Скрыть</span> : <span className="text-sm">Показать</span>}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="new-password">Новый пароль</label>
        <div className="relative">
          <input
            id="new-password"
            type={showNew ? "text" : "password"}
            className="w-full border rounded-lg px-3 py-2 pr-11"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={8}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-r-lg"
            aria-label={showNew ? "Скрыть пароль" : "Показать пароль"}
            aria-pressed={showNew}
            aria-controls="new-password"
            onClick={() => setShowNew((v) => !v)}
          >
            {showNew ? <span className="text-sm">Скрыть</span> : <span className="text-sm">Показать</span>}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="confirm-password">Подтверждение нового пароля</label>
        <div className="relative">
          <input
            id="confirm-password"
            type={showConfirm ? "text" : "password"}
            className="w-full border rounded-lg px-3 py-2 pr-11"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={8}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-r-lg"
            aria-label={showConfirm ? "Скрыть пароль" : "Показать пароль"}
            aria-pressed={showConfirm}
            aria-controls="confirm-password"
            onClick={() => setShowConfirm((v) => !v)}
          >
            {showConfirm ? <span className="text-sm">Скрыть</span> : <span className="text-sm">Показать</span>}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm" role="alert">{String(error)}</div>
      )}
      {success && (
        <div className="text-green-600 text-sm" role="status">{success}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`px-4 py-2 rounded text-white ${loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
      >
        {loading ? "Сохраняем..." : "Изменить пароль"}
      </button>
    </form>
  );
}
