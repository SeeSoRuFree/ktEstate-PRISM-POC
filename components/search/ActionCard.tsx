'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Clock, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ActionMeta } from '@/types'

interface ActionCardProps {
  action: ActionMeta
  isRecommended?: boolean
  confidence?: number
  onClick?: () => void
  className?: string
  index?: number
}

export function ActionCard({
  action,
  isRecommended = false,
  confidence = 0,
  onClick,
  className,
  index = 0,
}: ActionCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className={cn(
        'relative w-full p-4 bg-white rounded-xl border-2 transition-all text-left group',
        'hover:shadow-lg hover:scale-[1.02]',
        isRecommended
          ? 'border-smart-blue shadow-md'
          : 'border-border-gray hover:border-smart-blue/50',
        className
      )}
    >
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute -top-2 -right-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-smart-blue text-white text-[10px] font-medium rounded-full shadow-sm">
            <Star className="w-3 h-3 fill-current" />
            추천
          </span>
        </div>
      )}

      {/* Icon */}
      <div className="text-4xl mb-3">{action.icon}</div>

      {/* Title */}
      <h3 className="font-semibold text-kt-black mb-1">{action.name}</h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {action.description}
      </p>

      {/* Estimated Time */}
      {action.copilotHints?.estimatedTime && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <Clock className="w-3.5 h-3.5" />
          <span>예상: {action.copilotHints.estimatedTime}</span>
        </div>
      )}

      {/* CTA Button */}
      <div
        className={cn(
          'flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors',
          isRecommended
            ? 'bg-smart-blue text-white group-hover:bg-smart-blue/90'
            : 'bg-bg-gray text-kt-black group-hover:bg-smart-blue-light group-hover:text-smart-blue'
        )}
      >
        시작하기
        <ArrowRight className="w-4 h-4" />
      </div>

      {/* Confidence Bar (subtle) */}
      {confidence > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl overflow-hidden bg-border-gray">
          <div
            className={cn(
              'h-full transition-all',
              confidence >= 0.7
                ? 'bg-status-success'
                : confidence >= 0.4
                  ? 'bg-status-warning'
                  : 'bg-gray-400'
            )}
            style={{ width: `${Math.round(confidence * 100)}%` }}
          />
        </div>
      )}
    </motion.button>
  )
}
