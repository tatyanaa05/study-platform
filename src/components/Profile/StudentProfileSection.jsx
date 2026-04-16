import { useProfile } from "../../context/ProfileContext.jsx";
import ProfileAvatar from "./ProfileAvatar.jsx";
import ProfileInfoForm from "./ProfileInfoForm.jsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentProfileSection() {
  const { profile, saveProfile } = useProfile();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(profile);
  const [emailError, setEmailError] = useState("");
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
    try {
      localStorage.removeItem("studentProfile");
    } catch (e) {}
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

        <div className="flex justify-between items-center gap-3 pt-4">
          <button
            onClick={handleLogout}
            className="text-red-600 border border-red-200 px-4 py-2 rounded hover:bg-red-50"
          >
            Выйти из аккаунта
          </button>
          
          {editing ? (
            <button
              onClick={handleSave}
              disabled={!!emailError}
              className={`px-4 py-2 rounded text-white ${emailError ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
            >
              Сохранить
            </button>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200"
            >
              Редактировать
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
