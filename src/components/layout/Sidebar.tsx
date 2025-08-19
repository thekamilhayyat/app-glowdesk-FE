import { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { BaseButton } from "@/components/base/BaseButton";

const navigationItems = [
  { name: "Dashboard", href: "/" },
  { name: "Calendar", href: "/calendar" },
  { name: "Appointments", href: "/appointments" },
  { name: "Clients", href: "/clients" },
  { name: "Services", href: "/services" },
  { name: "Staff", href: "/staff" },
  { name: "POS", href: "/pos" },
  { name: "Inventory", href: "/inventory" },
  { name: "Reports", href: "/reports" },
  { name: "Settings", href: "/settings" },
];

export interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={cn(
      "bg-card border-r border-border flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && <Logo variant="full" size="md" />}
          {isCollapsed && <Logo variant="icon" size="sm" />}
          <BaseButton
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="md:hidden"
          >
            ☰
          </BaseButton>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground",
                isCollapsed && "justify-center"
              )
            }
          >
            <span className={cn(
              "w-2 h-2 rounded-full bg-current mr-3 flex-shrink-0",
              isCollapsed && "mr-0"
            )} />
            {!isCollapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}