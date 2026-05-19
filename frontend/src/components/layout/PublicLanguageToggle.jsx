import { useEffect, useState } from "react";
import styles from "./PublicLanguageToggle.module.css";

const STORAGE_KEY = "pharmaos_public_language";

export default function PublicLanguageToggle({ position = "fixed" }) {
  const [language, setLanguage] = useState("fr");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const initial = stored === "ar" ? "ar" : "fr";
    applyLanguage(initial);
  }, []);

  function applyLanguage(nextLanguage) {
    setLanguage(nextLanguage);
    document.documentElement.lang = nextLanguage;
    document.documentElement.dir = nextLanguage === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
  }

  return (
    <div className={`${styles.toggle} ${position === "fixed" ? styles.fixed : styles.inline}`} aria-label="Language">
      <button type="button" className={language === "fr" ? styles.active : ""} onClick={() => applyLanguage("fr")}>
        FR
      </button>
      <button type="button" className={language === "ar" ? styles.active : ""} onClick={() => applyLanguage("ar")}>
        AR
      </button>
    </div>
  );
}
