'use client'

import { cn } from '@/lib/utils'
import type { RequestStatus } from '@/types'
import { REQUEST_STATUS_LABELS, REQUEST_STATUS_COLORS } from '@/types'

interface StatusBadgeProps {
  status: RequestStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        REQUEST_STATUS_COLORS[status],
        className
      )}
    >
      {REQUEST_STATUS_LABELS[status]}
    </span>
  )
}
