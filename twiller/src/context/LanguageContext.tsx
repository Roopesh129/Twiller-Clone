"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type LanguageCode = "en" | "es" | "hi" | "pt" | "zh" | "fr";

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    home: "Home",
    explore: "Explore",
    notifications: "Notifications",
    messages: "Messages",
    bookmarks: "Bookmarks",
    profile: "Profile",
    more: "More",
    post: "Post",
    selectLanguage: "Select Language",
    verifyOTP: "Verify Security Code",
    enterOTP: "Enter 6-digit OTP",
    verify: "Verify & Apply",
    cancel: "Cancel",
    languageSettings: "Display Language",
  },
  es: {
    home: "Inicio",
    explore: "Explorar",
    notifications: "Notificaciones",
    messages: "Mensajes",
    bookmarks: "Guardados",
    profile: "Perfil",
    more: "Más opciones",
    post: "Postear",
    selectLanguage: "Seleccionar idioma",
    verifyOTP: "Verificar código de seguridad",
    enterOTP: "Ingrese OTP de 6 dígitos",
    verify: "Verificar y aplicar",
    cancel: "Cancelar",
    languageSettings: "Idioma de pantalla",
  },
  hi: {
    home: "होम",
    explore: "एक्सप्लोर",
    notifications: "सूचनाएं",
    messages: "संदेश",
    bookmarks: "बुकमार्क",
    profile: "प्रोफ़ाइल",
    more: "अधिक",
    post: "पोस्ट करें",
    selectLanguage: "भाषा चुनें",
    verifyOTP: "सुरक्षा कोड सत्यापित करें",
    enterOTP: "6-अंकों का OTP दर्ज करें",
    verify: "सत्यापित करें और लागू करें",
    cancel: "रद्द करें",
    languageSettings: "प्रदर्शन भाषा",
  },
  pt: {
    home: "Início",
    explore: "Explorar",
    notifications: "Notificações",
    messages: "Mensagens",
    bookmarks: "Itens salvos",
    profile: "Perfil",
    more: "Mais",
    post: "Postar",
    selectLanguage: "Selecionar idioma",
    verifyOTP: "Verificar código de segurança",
    enterOTP: "Digite o OTP de 6 dígitos",
    verify: "Verificar e aplicar",
    cancel: "Cancelar",
    languageSettings: "Idioma de exibição",
  },
  zh: {
    home: "首页",
    explore: "探索",
    notifications: "通知",
    messages: "私信",
    bookmarks: "书签",
    profile: "个人资料",
    more: "更多",
    post: "发帖",
    selectLanguage: "选择语言",
    verifyOTP: "验证安全码",
    enterOTP: "输入 6 位验证码",
    verify: "验证并应用",
    cancel: "取消",
    languageSettings: "显示语言",
  },
  fr: {
    home: "Accueil",
    explore: "Explorer",
    notifications: "Notifications",
    messages: "Messages",
    bookmarks: "Signets",
    profile: "Profil",
    more: "Plus",
    post: "Poster",
    selectLanguage: "Choisir la langue",
    verifyOTP: "Vérifier le code de sécurité",
    enterOTP: "Entrez le code OTP à 6 chiffres",
    verify: "Vérifier et appliquer",
    cancel: "Annuler",
    languageSettings: "Langue d'affichage",
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  useEffect(() => {
    const saved = localStorage.getItem("preferred_language") as LanguageCode;
    if (saved && translations[saved]) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem("preferred_language", lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations["en"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);