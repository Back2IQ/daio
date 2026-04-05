import { createContext, useContext } from "react";
import { en } from "./en";
import { de } from "./de";
import type { Language } from "../types";
import type { TranslationKeys } from "./en";

const translations: Record<Language, TranslationKeys> = { en, de };

export function getTranslations(lang: Language): TranslationKeys {
  return translations[lang];
}

export const I18nContext = createContext<{
  t: TranslationKeys;
  language: Language;
  setLanguage: (lang: Language) => void;
}>({
  t: en,
  language: "en",
  setLanguage: () => {},
});

export function useI18n() {
  return useContext(I18nContext);
}
