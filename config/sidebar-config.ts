"use client";

import { useTranslations } from "next-intl";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

export function useSidebarConfig() {
  const tMain = useTranslations("navigation.main");
  const tOrders = useTranslations("navigation.orders");
  const tSettings = useTranslations("navigation.settings");
  const tCustomers = useTranslations("navigation.customers");
  return {
    teams: [
      { name: "Acme Inc", logo: GalleryVerticalEnd, plan: "Enterprise" },
      { name: "Acme Corp.", logo: AudioWaveform, plan: "Startup" },
      { name: "Evil Corp.", logo: Command, plan: "Free" },
    ],
    navMain: [
      {
        title: tMain("dashboard"),
        url: "/dashboard",
        icon: SquareTerminal,
      },
      {
        title: tMain("orders"),
        url: "/orders",
        icon: Bot,
        items: [
          { title: tOrders("history"), url: "#" },
          { title: tOrders("new"), url: "#" },
        ],
      },
      {
        title: tMain("customers"),
        url: "/customers",
        icon: Bot,
        items: [{ title: tCustomers("new"), url: "#" }],
      },
      {
        title: tMain("settings"),
        url: "/settings",
        icon: Settings2,
        items: [
          { title: tSettings("general"), url: "#" },
          { title: tSettings("team"), url: "#" },
          { title: tSettings("billing"), url: "#" },
          { title: tSettings("limits"), url: "#" },
        ],
      },
    ],
    projects: [
      { name: "Design Engineering", url: "#", icon: Frame },
      { name: "Sales & Marketing", url: "#", icon: PieChart },
      { name: "Travel", url: "#", icon: Map },
    ],
  };
}
