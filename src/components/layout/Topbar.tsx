import { BaseInput } from "@/components/base/BaseInput";
import { BaseButton } from "@/components/base/BaseButton";
import { cn } from "@/lib/utils";

export interface TopbarProps {
  className?: string;
}

export function Topbar({ className }: TopbarProps) {
  return (
    <header className={cn(
      "bg-card border-b border-border px-6 py-4",
      className
    )}>
      <div className="flex items-center justify-between">
        {/* Left side - Search */}
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <BaseInput
            placeholder="Search..."
            className="flex-1"
            variant="filled"
          />
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          <BaseButton variant="ghost" size="sm">
            Help
          </BaseButton>
          
          {/* User Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-medium text-white">
            U
          </div>
        </div>
      </div>
    </header>
  );
}