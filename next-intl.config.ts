import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => {
  const currentLocale = locale || "pt";

  try {
    const messages = (await import(`./messages/${currentLocale}.json`)).default;

    return {
      locale: currentLocale,
      messages,
    };
  } catch {
    const fallbackMessages = (await import("./messages/pt.json")).default;

    return {
      locale: "pt",
      messages: fallbackMessages,
    };
  }
});
