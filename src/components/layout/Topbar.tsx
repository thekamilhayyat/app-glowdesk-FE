import { BaseInput } from "@/components/base/BaseInput";
import { BaseButton } from "@/components/base/BaseButton";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TopbarProps {
  className?: string;
}

export function Topbar({ className }: TopbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className={cn(
      "bg-card border-b border-border px-6 py-4",
      className
    )}>
      <div className="flex items-center justify-between">
        {/* Left side - Sidebar Toggle & Search */}
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <SidebarTrigger className="h-9 w-9" />
          <BaseInput
            placeholder="Search..."
            className="flex-1"
            variant="filled"
          />
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          <BaseButton variant="ghost" size="sm">
            Help
          </BaseButton>
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <BaseButton variant="ghost" size="sm" className="relative h-8 w-8 rounded-full p-0">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-medium text-white">
                  {user?.firstName?.charAt(0) || 'U'}
                </div>
              </BaseButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}