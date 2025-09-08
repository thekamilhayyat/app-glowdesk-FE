import React from "react"
import { Drawer as AntDrawer } from "antd"
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
    <>
      {trigger && <div onClick={() => onOpenChange(true)}>{trigger}</div>}
      <AntDrawer
        open={open}
        onClose={() => onOpenChange(false)}
        title={title}
        className={className}
        footer={footer}
      >
        {children}
      </AntDrawer>
    </>
  )
} 