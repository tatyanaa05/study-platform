import { useProfile } from "../../context/ProfileContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import ProfileAvatar from "./ProfileAvatar.jsx";
import ProfileInfoForm from "./ProfileInfoForm.jsx";
import ChangePasswordForm from "./ChangePasswordForm.jsx";
import DeleteAccountSection from "./DeleteAccountSection.jsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentProfileSection() {
  const { profile, saveProfile } = useProfile();
  const { logout } = useAuth?.() || { logout: () => {} };
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(profile);
  const [emailError, setEmailError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const validateEmail = (email) => {
    if (!email) return "Email не может быть пустым";
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    return re.test(email) ? "" : "Некорректный формат email";
  };

  const handleSave = () => {
    const err = validateEmail(formData.email);
    setEmailError(err);
    if (err) return;
    saveProfile(formData);
    setEditing(false);
  };

  const onEmailChange = (e) => {
    const val = e.target.value;
    setFormData({ ...formData, email: val });
    setEmailError(validateEmail(val));
  };

  const handleLogout = () => {
    try { logout(); } catch (_) {}
    navigate("/welcome");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">👤 Профиль студента</h2>
      <div className="bg-white text-gray-900 p-6 rounded-xl shadow space-y-6 border border-gray-100">
        <ProfileAvatar
          avatar={formData.avatar}
          setAvatar={(a) => setFormData({ ...formData, avatar: a })}
          editing={editing}
        />

        <ProfileInfoForm
          name={formData.name}
          email={formData.email}
          setName={(n) => setFormData({ ...formData, name: n })}
          onEmailChange={onEmailChange}
          emailError={emailError}
          editing={editing}
        />

        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-lg font-semibold mb-4">Смена пароля</h3>
          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Сменить пароль
          </button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleLogout}
              className="text-red-600 border border-red-200 px-4 py-2 rounded hover:bg-red-50 w-full sm:w-auto"
            >
              Выйти из аккаунта
            </button>
            <DeleteAccountSection compact className="w-full sm:w-auto" />
          </div>

          {editing ? (
            <button
              onClick={handleSave}
              disabled={!!emailError}
              className={`px-4 py-2 rounded text-white w-full sm:w-auto ${emailError ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
            >
              Сохранить
            </button>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200 w-full sm:w-auto"
            >
              Редактировать
            </button>
          )}
        </div>
      </div>
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 mt-16 pointer-events-none">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-6 relative pointer-events-auto">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              aria-label="Закрыть окно"
            >
              ✖
            </button>
            <h3 className="text-lg font-semibold mb-4">Смена пароля</h3>
            <ChangePasswordForm />
          </div>
        </div>
      )}
    </div>
  );
}
