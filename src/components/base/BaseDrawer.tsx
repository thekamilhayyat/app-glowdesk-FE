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
  width?: number | string
}

export function BaseDrawer({
  open,
  onOpenChange,
  title,
  children,
  footer,
  trigger,
  className,
  width = 400,
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
        footerStyle={{
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
          borderTop: '1px solid hsl(var(--border))',
          backgroundColor: 'hsl(var(--background))',
          padding: '16px 24px',
          marginTop: 'auto'
        }}
        styles={{
          body: {
            padding: '16px',
            paddingBottom: footer ? '0' : '16px'
          }
        }}
        closable={true}
        placement="right"
        width={width}
        maskClosable={true}
      >
        {children}
      </AntDrawer>
    </>
  )
} 