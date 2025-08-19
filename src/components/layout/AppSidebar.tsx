import { useState } from "react"
import { 
  IconDashboard, 
  IconCalendar, 
  IconClock, 
  IconUsers, 
  IconShoppingBag,
  IconUser,
  IconCash,
  IconBoxSeam,
  IconChartBar,
  IconSettings
} from "@tabler/icons-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Logo } from "@/components/ui/Logo"

const navigationItems = [
  { title: "Dashboard", url: "/", icon: IconDashboard },
  { title: "Calendar", url: "/calendar", icon: IconCalendar },
  { title: "Appointments", url: "/appointments", icon: IconClock },
  { title: "Clients", url: "/clients", icon: IconUsers },
  { title: "Services", url: "/services", icon: IconShoppingBag },
  { title: "Staff", url: "/staff", icon: IconUser },
  { title: "POS", url: "/pos", icon: IconCash },
  { title: "Inventory", url: "/inventory", icon: IconBoxSeam },
  { title: "Reports", url: "/reports", icon: IconChartBar },
  { title: "Settings", url: "/settings", icon: IconSettings },
]

export function AppSidebar() {
  const { state: sidebarState } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path
  const isCollapsed = sidebarState === "collapsed"

  return (
    <Sidebar 
      className={isCollapsed ? "w-[var(--sidebar-width-icon)]" : "w-[var(--sidebar-width)]"} 
      collapsible="icon"
    >
      <SidebarContent>
        {/* Logo Section */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-center">
            {isCollapsed ? (
              <Logo variant="icon" size="sm" />
            ) : (
              <Logo variant="full" size="md" />
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={`${isCollapsed ? "sr-only" : ""} text-sidebar-foreground`}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.url)}
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <NavLink to={item.url}>
                      <item.icon 
                        className="h-5 w-5 flex-shrink-0" 
                        stroke={1.5}
                      />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}