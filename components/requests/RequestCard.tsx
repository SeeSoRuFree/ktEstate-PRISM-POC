'use client'

import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Clock, User, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBadge } from './StatusBadge'
import type { Request } from '@/types'

interface RequestCardProps {
  request: Request
  onClick?: () => void
  isSelected?: boolean
  compact?: boolean
}

const URGENCY_COLORS = {
  low: 'border-l-gray-300',
  normal: 'border-l-blue-400',
  high: 'border-l-orange-400',
  critical: 'border-l-red-500',
}

const URGENCY_LABELS = {
  low: '낮음',
  normal: '보통',
  high: '높음',
  critical: '긴급',
}

export function RequestCard({
  request,
  onClick,
  isSelected = false,
  compact = false,
}: RequestCardProps) {
  const createdAt = new Date(request.createdAt)
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true, locale: ko })

  return (
    <div
      onClick={onClick}
      className={cn(
        'border rounded-lg bg-white transition-all cursor-pointer border-l-4',
        URGENCY_COLORS[request.urgency],
        isSelected && 'ring-2 ring-blue-500 bg-blue-50/50',
        !isSelected && 'hover:shadow-md hover:border-gray-300',
        compact ? 'p-3' : 'p-4'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500 font-mono">{request.id}</span>
            <StatusBadge status={request.status} />
          </div>
          <h3
            className={cn(
              'font-medium text-gray-900 truncate',
              compact ? 'text-sm' : 'text-base'
            )}
          >
            {request.title}
          </h3>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
      </div>

      {/* Content Preview */}
      {!compact && (
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{request.content}</p>
      )}

      {/* Meta Info */}
      <div className={cn('flex items-center gap-4 text-xs text-gray-500', compact ? 'mt-2' : 'mt-3')}>
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{timeAgo}</span>
        </div>
        {request.assignee ? (
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            <span>{request.assignee.name}</span>
          </div>
        ) : (
          <span className="text-gray-400">담당자 미배정</span>
        )}
        {request.urgency !== 'normal' && (
          <span
            className={cn(
              'px-1.5 py-0.5 rounded text-xs',
              request.urgency === 'critical' && 'bg-red-100 text-red-700',
              request.urgency === 'high' && 'bg-orange-100 text-orange-700',
              request.urgency === 'low' && 'bg-gray-100 text-gray-600'
            )}
          >
            {URGENCY_LABELS[request.urgency]}
          </span>
        )}
      </div>

      {/* System/Module Tags */}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
          {request.systemName}
        </span>
        {request.moduleName && (
          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
            {request.moduleName}
          </span>
        )}
      </div>
    </div>
  )
}
