import * as React from "react"
import { Input as AntInput } from "antd"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <AntInput
        type={type}
        className={cn(
          "flex h-10 w-full border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [&]:rounded-[6px]",
          className
        )}
        style={{ borderRadius: '6px' }}
        {...(props as any)}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
