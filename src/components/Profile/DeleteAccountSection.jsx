import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function DeleteAccountSection({ compact = false, className = "" }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { logout } = useAuth?.() || { logout: () => {} };

  async function handleDelete() {
    setLoading(true); setError("");
    try {
      if (!password) {
        throw new Error("Введите пароль для подтверждения");
      }
      await api.deleteAccount(password);
      try { logout(); } catch (_) {}
      navigate("/welcome", { replace: true });
    } catch (e) {
      setError(e.payload?.error?.message || e.message || "Не удалось удалить аккаунт");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setPassword("");
    }
  }

  return (
    <div className={`${compact ? "inline-block" : "mt-4"} ${className}`}>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Удалить аккаунт
      </button>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 mt-16">
          <div className="absolute inset-0 bg-black/40" onClick={() => !loading && setConfirmOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-lg shadow-xl p-6">
            <h4 className="text-lg font-semibold mb-3">Подтвердите удаление</h4>
            <p className="text-sm text-gray-700 mb-3">
              Для подтверждения удаления аккаунта введите ваш текущий пароль. Это действие нельзя отменить.
            </p>
            <label className="block text-sm text-gray-700 mb-1" htmlFor="confirm-password">Пароль</label>
            <input
              id="confirm-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-red-200"
              autoFocus
            />
            {error && (
              <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded p-2">
                {error}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading || !password}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              >
                {loading ? "Удаление..." : "Удалить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
