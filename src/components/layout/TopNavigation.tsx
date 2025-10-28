import { NavLink, useLocation } from "react-router-dom"
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
  IconSettings,
  IconMenu2
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { BaseButton } from "@/components/base/BaseButton";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { Dropdown } from "antd";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LogOut } from "lucide-react";
import { useState } from "react";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: IconDashboard },
  { title: "Calendar", url: "/calendar", icon: IconCalendar },
  { title: "Appointments", url: "/appointments", icon: IconClock },
  { title: "Clients", url: "/clients", icon: IconUsers },
  { title: "Services", url: "/services", icon: IconShoppingBag },
  { title: "Staff", url: "/staff", icon: IconUser },
  { title: "POS", url: "/sales", icon: IconCash },
  { title: "Inventory", url: "/inventory", icon: IconBoxSeam },
  { title: "Reports", url: "/reports", icon: IconChartBar },
  { title: "Settings", url: "/settings", icon: IconSettings },
]

export function TopNavigation() {
  const location = useLocation()
  const currentPath = location.pathname
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => currentPath === path

  const userMenu = {
    items: [
      {
        key: 'profile',
        label: (
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        ),
        disabled: true,
        className: "font-normal"
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'logout',
        label: (
          <div className="flex items-center">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </div>
        ),
        onClick: logout,
        className: "cursor-pointer"
      }
    ]
  };

  return (
    <nav className="bg-card border-b border-border px-4 sm:px-6 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg mr-3">
            G
          </div>
          <span className="text-lg sm:text-xl font-bold text-foreground">GlowFlowApp</span>
        </div>

        {/* Desktop Navigation Items */}
        <div className="hidden lg:flex items-center space-x-1">
          {navigationItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive(item.url) 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground"
              )}
            >
              <item.icon 
                className="h-4 w-4" 
                size={16}
                stroke={1.5}
              />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          
          <BaseButton variant="ghost" size="sm" className="text-xs hidden sm:block">
            Help
          </BaseButton>
          
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          
          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <BaseButton variant="ghost" size="sm" className="lg:hidden">
                <IconMenu2 className="h-5 w-5" />
              </BaseButton>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-2">
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.title}
                    to={item.url}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      isActive(item.url) 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground"
                    )}
                  >
                    <item.icon 
                      className="h-5 w-5" 
                      size={20}
                      stroke={1.5}
                    />
                    <span>{item.title}</span>
                  </NavLink>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t">
                <BaseButton variant="ghost" size="sm" className="w-full justify-start">
                  Help
                </BaseButton>
              </div>
            </SheetContent>
          </Sheet>
          
          {/* User Menu */}
          <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
            <BaseButton variant="ghost" size="sm" className="relative h-8 w-8 rounded-full p-0">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-medium text-white">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
            </BaseButton>
          </Dropdown>
        </div>
      </div>
    </nav>
  )
} 