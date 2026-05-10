import { authMessages } from "@/shared/i18n/messages/vi/auth";
import { commonMessages } from "@/shared/i18n/messages/vi/common";
import { homeMessages } from "@/shared/i18n/messages/vi/home";

export const i18nConfig = {
  defaultLocale: "vi",
  locales: ["vi", "en"],
} as const;

export const messages = {
  auth: authMessages,
  common: commonMessages,
  home: homeMessages,
} as const;


