"use client"
import * as React from "react"
import { NavUser } from "@/components/navigation/nav-user"
import { TeamSwitcher } from "@/components/navigation/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { useSidebarConfig } from "@/config/sidebar-config"
import { useEffect } from "react"



export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
const { teams, navMain }  = useSidebarConfig();
useEffect(() => {
  console.log("Sidebar montado!");
}, []);
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
