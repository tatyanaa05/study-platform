import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { api } from "../lib/api.js";

const ProfileContext = createContext();

export function useProfile() {
  return useContext(ProfileContext);
}

export function ProfileProvider({ children }) {
  const { user, accessToken } = useAuth?.() || {};
  const [profile, setProfile] = useState(() => ({
    name: user?.name || "Гость",
    group: "",
    email: user?.email || "",
    avatar: null,
    theme: "light",
    language: "ru",
  }));

  // При смене авторизованного пользователя обновляем профиль (имя/почта)
  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      name: user?.name || "Гость",
      email: user?.email || "",
    }));
  }, [user]);

  // Загружаем профиль с сервера при наличии токена (включая avatar)
  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    api
      .me()
      .then((u) => {
        if (cancelled) return;
        const next = {
          name: u.name || "Гость",
          group: u.group || "",
          email: u.email || "",
          avatar: u.avatar_url || null,
          theme: u.theme || "light",
          language: u.language || "ru",
        };
        setProfile(next);
        try {
          document.documentElement.classList.toggle("dark", next.theme === "dark");
        } catch (_) {}
      })
      .catch(() => {
        // игнорируем — останемся на локальном состоянии
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const saveProfile = async (newProfile) => {
    // Сначала обновим локально для отзывчивости UI
    setProfile(newProfile);
    try {
      document.documentElement.classList.toggle("dark", newProfile.theme === "dark");
    } catch (_) {}

    // Затем попробуем сохранить на сервере (если авторизованы)
    try {
      const payload = {
        name: newProfile.name,
        email: newProfile.email,
        group: newProfile.group || null,
        avatar: newProfile.avatar || null,
        theme: newProfile.theme,
        language: newProfile.language,
      };
      const updated = await api.updateMe(payload);
      const normalized = {
        name: updated.name,
        email: updated.email,
        group: updated.group || "",
        avatar: updated.avatar_url || null,
        theme: updated.theme || "light",
        language: updated.language || "ru",
      };
      setProfile(normalized);
      try {
        document.documentElement.classList.toggle("dark", normalized.theme === "dark");
      } catch (_) {}
    } catch (_e) {
      // При ошибке оставляем локальные изменения, можно дополнительно логировать
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, saveProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}
