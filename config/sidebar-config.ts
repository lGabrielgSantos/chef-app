"use client";

import { useTranslations } from "next-intl";
import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  LayoutDashboardIcon,
  Map,
  PieChart,
  Settings2,
  Store,
  Users,
} from "lucide-react";

export function useSidebarConfig() {
  const tMain = useTranslations("navigation.main");
  const tOrders = useTranslations("navigation.orders");
  const tSettings = useTranslations("navigation.settings");
  const tCustomers = useTranslations("navigation.customers");
  const tDashboard = useTranslations("navigation.dashboard");

  const teams = [
    { name: "Acme Inc", logo: GalleryVerticalEnd, plan: "Enterprise" },
    { name: "Acme Corp.", logo: AudioWaveform, plan: "Startup" },
    { name: "Evil Corp.", logo: Command, plan: "Free" },
  ];

  const navMain = [
    {
      title: tMain("dashboard"),
      url: "/dashboard",
      icon: LayoutDashboardIcon,
      items: [
        { title: tDashboard("overview"), url: "/dashboard" },
        { title: tDashboard("stats"), url: "/dashboard/stats" },
        { title: tDashboard("reports"), url: "/dashboard/reports" },
      ],
    },
    {
      title: tMain("orders"),
      url: "/orders",
      icon: Store,
      items: [
        { title: tOrders("history"), url: "/orders" },
        { title: tOrders("new"), url: "/orders/new" },
      ],
    },
    {
      title: tMain("customers"),
      url: "/customers",
      icon: Users,
      items: [
        { title: tCustomers("list"), url: "/customers" },
        { title: tCustomers("new"), url: "#" },
      ],
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
  ];

  // 🔹 Projetos
  const projects = [
    { name: "Design Engineering", url: "#", icon: Frame },
    { name: "Sales & Marketing", url: "#", icon: PieChart },
    { name: "Travel", url: "#", icon: Map },
  ];

  // ✅ Retorna os objetos separadamente
  return { teams, navMain, projects };
}
