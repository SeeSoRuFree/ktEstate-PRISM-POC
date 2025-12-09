'use client'

import { motion } from 'framer-motion'
import { Cpu, Layers, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DetectedTagsBarProps {
  systemName?: string
  moduleName?: string | null
  requestType?: string
  className?: string
}

export function DetectedTagsBar({
  systemName,
  moduleName,
  requestType,
  className,
}: DetectedTagsBarProps) {
  if (!systemName && !moduleName && !requestType) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex flex-wrap gap-2', className)}
    >
      {systemName && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-smart-blue-light text-smart-blue text-xs font-medium rounded-full">
          <Cpu className="w-3 h-3" />
          {systemName}
        </span>
      )}
      {moduleName && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
          <Layers className="w-3 h-3" />
          {moduleName}
        </span>
      )}
      {requestType && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
          <Tag className="w-3 h-3" />
          {requestType}
        </span>
      )}
    </motion.div>
  )
}
