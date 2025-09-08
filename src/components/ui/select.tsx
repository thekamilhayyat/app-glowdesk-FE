import * as React from "react"
import { Select as AntSelect } from "antd"
import { cn } from "@/lib/utils"

const Select = AntSelect

const SelectGroup = AntSelect.OptGroup

const SelectValue = ({ value }: { value: string }) => <span>{value}</span>

const SelectTrigger = React.forwardRef<
  any,
  React.ComponentProps<typeof AntSelect> & { children?: React.ReactNode }
>(({ className, children, ...props }, ref) => (
  <AntSelect
    ref={ref}
    className={cn("w-full", className)}
    {...props}
  />
))
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef<
  any,
  React.ComponentProps<typeof AntSelect>
>(({ className, children, ...props }, ref) => (
  <AntSelect
    ref={ref}
    className={cn("w-full", className)}
    {...props}
  />
))
SelectContent.displayName = "SelectContent"

const SelectLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  >
    {children}
  </div>
))
SelectLabel.displayName = "SelectLabel"

const SelectItem = React.forwardRef<
  any,
  React.ComponentProps<typeof AntSelect.Option>
>(({ className, children, value, ...props }, ref) => (
  <AntSelect.Option
    ref={ref}
    value={value}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    {children}
  </AntSelect.Option>
))
SelectItem.displayName = "SelectItem"

const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = "SelectSeparator"

const SelectScrollUpButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  />
))
SelectScrollUpButton.displayName = "SelectScrollUpButton"

const SelectScrollDownButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  />
))
SelectScrollDownButton.displayName = "SelectScrollDownButton"

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
