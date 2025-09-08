import * as React from "react"
import { Drawer as AntDrawer } from "antd"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { BaseButton } from "@/components/base/BaseButton"

const Drawer = AntDrawer

const DrawerTrigger = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
  <div onClick={onClick}>{children}</div>
)

const DrawerPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>

const DrawerClose = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
  <div onClick={onClick}>{children}</div>
)

const DrawerOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
    {...props}
  />
))
DrawerOverlay.displayName = "DrawerOverlay"

const DrawerContent = React.forwardRef<
  any,
  React.ComponentProps<typeof AntDrawer> & { children?: React.ReactNode }
>(({ className, children, ...props }, ref) => (
  <AntDrawer
    className={cn(
      "fixed right-0 top-0 z-50 h-full w-full max-w-md border-l bg-background shadow-lg",
      "data-[state=open]:animate-slide-in-right data-[state=closed]:animate-slide-out-right",
      className
    )}
    {...props}
  >
    <div className="flex flex-col h-full">
      {children}
    </div>
  </AntDrawer>
))
DrawerContent.displayName = "DrawerContent"

const DrawerHeader = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex items-center justify-between p-4 border-b flex-shrink-0", className)}
    {...props}
  >
    {children}
  </div>
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex-1 overflow-auto p-4", className)}
    {...props}
  />
)
DrawerBody.displayName = "DrawerBody"

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex gap-2 p-4 border-t bg-muted/50 flex-shrink-0", className)}
    {...props}
  />
)
DrawerFooter.displayName = "DrawerFooter"

const DrawerTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  >
    {children}
  </h3>
))
DrawerTitle.displayName = "DrawerTitle"

const DrawerDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  >
    {children}
  </p>
))
DrawerDescription.displayName = "DrawerDescription"

const DrawerCloseButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => (
  <BaseButton
    ref={ref}
    variant="ghost"
    size="sm"
    className={cn("h-8 w-8 p-0", className)}
    onClick={onClick}
    {...props}
  >
    <X className="h-4 w-4" />
    <span className="sr-only">Close</span>
  </BaseButton>
))
DrawerCloseButton.displayName = "DrawerCloseButton"

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerCloseButton,
}
