export const locales = {
  supported: ["pt", "en"] as const,
  default: "pt" as const,
  detection: true,
};

export type Locale = (typeof locales.supported)[number];
