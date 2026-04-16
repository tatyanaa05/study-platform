import { createContext, useContext, useState, useEffect } from "react";

const ProfileContext = createContext();

export function useProfile() {
  return useContext(ProfileContext);
}

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState({
    name: "",
    group: "",
    email: "",
    avatar: null,
    theme: "light",
    language: "ru",
  });

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("studentProfile")) || {};
    setProfile({
      name: data.name || "Анна Иванова",
      group: data.group || "ПИ-21",
      email: data.email || "anna@example.com",
      avatar: data.avatar || null,
    });
  }, []);

  const saveProfile = (newProfile) => {
    setProfile(newProfile);
    localStorage.setItem("studentProfile", JSON.stringify(newProfile));
    document.documentElement.classList.toggle(
      "dark",
      newProfile.theme === "dark"
    );
  };

  return (
    <ProfileContext.Provider value={{ profile, saveProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}
