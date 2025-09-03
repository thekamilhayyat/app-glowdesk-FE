import * as React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface BaseTooltipProps {
  content: string;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
  delayDuration?: number;
}

export const BaseTooltip = React.forwardRef<HTMLDivElement, BaseTooltipProps>(({
  content,
  children,
  side = "top",
  align = "center",
  className,
  delayDuration = 500,
  ...props
}, ref) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={delayDuration}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          align={align}
          className={cn("text-xs", className)}
          ref={ref}
          {...props}
        >
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

BaseTooltip.displayName = "BaseTooltip"; 