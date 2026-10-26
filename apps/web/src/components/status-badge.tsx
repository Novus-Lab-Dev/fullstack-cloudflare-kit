import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import type { MessageStatus } from '@/lib/data'

const TONES = {
  neutral: 'bg-muted text-muted-foreground',
  info: 'bg-info/10 text-info',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/10 text-danger',
  brand: 'bg-primary/10 text-primary',
} as const

export type BadgeTone = keyof typeof TONES

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: BadgeTone
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

const STATUS_TONE: Record<MessageStatus, BadgeTone> = {
  queued: 'info',
  sent: 'neutral',
  delivered: 'success',
  failed: 'danger',
}

export function StatusBadge({ status }: { status: MessageStatus }) {
  return (
    <Badge tone={STATUS_TONE[status]} className="capitalize">
      {status}
    </Badge>
  )
}
