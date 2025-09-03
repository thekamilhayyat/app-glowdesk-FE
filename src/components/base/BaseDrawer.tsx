import React from "react"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerCloseButton,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { BaseButton } from "@/components/base/BaseButton"

export interface BaseDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  trigger?: React.ReactNode
  className?: string
}

export function BaseDrawer({
  open,
  onOpenChange,
  title,
  children,
  footer,
  trigger,
  className,
}: BaseDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent className={className}>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerCloseButton />
        </DrawerHeader>
        
        <DrawerBody>
          {children}
        </DrawerBody>
        
        {footer && (
          <DrawerFooter>
            {footer}
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
} 