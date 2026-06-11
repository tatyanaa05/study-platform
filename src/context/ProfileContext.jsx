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
  const [error, setError] = useState(null);

  // При смене авторизованного пользователя обновляем профиль (имя/почта)
  useEffect(() => {
    if (!user) {
      setProfile({
        name: "Гость",
        group: "",
        email: "",
        avatar: null,
        theme: "light",
        language: "ru",
      });
      return;
    }
    setProfile((prev) => ({
      ...prev,
      name: user.name || prev.name,
      email: user.email || prev.email,
    }));
  }, [user]);

  // Загружаем профиль с сервера при наличии токена (включая avatar)
  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    console.log("Fetching profile for token:", accessToken.slice(0, 10) + "...");
    api
      .me()
      .then((u) => {
        if (cancelled) return;
        console.log("Profile loaded from server:", u);
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
      .catch((err) => {
        console.error("Failed to fetch profile:", err);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const saveProfile = async (newProfile) => {
    setError(null);
    console.log("Saving profile:", { ...newProfile, avatar: newProfile.avatar ? "data:image/..." : null });
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
      console.log("Profile saved successfully, server returned:", { ...updated, avatar_url: updated.avatar_url ? "data:image/..." : null });
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
    } catch (e) {
      console.error("Failed to save profile:", e);
      setError(e.message || "Ошибка при сохранении профиля");
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, saveProfile, error, setError }}>
      {children}
    </ProfileContext.Provider>
  );
}
