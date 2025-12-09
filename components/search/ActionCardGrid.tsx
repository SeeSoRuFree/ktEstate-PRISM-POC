'use client'

import { motion } from 'framer-motion'
import { ActionCard } from './ActionCard'
import type { ActionMeta } from '@/types'

interface ActionResult {
  action: ActionMeta
  confidence: number
}

interface ActionCardGridProps {
  actions: ActionResult[]
  onActionClick?: (action: ActionMeta) => void
  className?: string
}

export function ActionCardGrid({
  actions,
  onActionClick,
  className,
}: ActionCardGridProps) {
  if (actions.length === 0) return null

  return (
    <div className={className}>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-muted-foreground mb-3"
      >
        이 작업을 도와드릴 수 있어요:
      </motion.p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.slice(0, 4).map((result, index) => (
          <ActionCard
            key={result.action.id}
            action={result.action}
            isRecommended={index === 0 && result.confidence >= 0.7}
            confidence={result.confidence}
            onClick={() => onActionClick?.(result.action)}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}
