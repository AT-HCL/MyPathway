"use client";

// Lightweight i18n: nested-key lookup over JSON dictionaries.
// All user-facing strings live in /locales/en.json and /locales/es.json.
// Architecture supports adding the remaining BenefitsCal languages later:
// add a JSON file and an entry to DICTS.

import { createContext, useContext, useEffect, useState } from "react";
import en from "@/locales/en.json";
import es from "@/locales/es.json";

const DICTS = { en, es };

const I18nContext = createContext({ lang: "en", setLang: () => {}, t: (k) => k });

function lookup(dict, key) {
  return key.split(".").reduce((node, part) => (node && typeof node === "object" ? node[part] : undefined), dict);
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    const saved = typeof window !== "undefined" && window.localStorage.getItem("mpw_lang");
    if (saved && DICTS[saved]) setLangState(saved);
  }, []);

  const setLang = (l) => {
    if (!DICTS[l]) return;
    setLangState(l);
    try { window.localStorage.setItem("mpw_lang", l); } catch {}
  };

  // t("a.b.c") -> string; falls back to English, then to the key itself.
  const t = (key, vars) => {
    let s = lookup(DICTS[lang], key);
    if (s === undefined) s = lookup(DICTS.en, key);
    if (s === undefined) return key;
    if (vars && typeof s === "string") {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replaceAll(`{${k}}`, String(v));
      }
    }
    return s;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
