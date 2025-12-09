'use client'

import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Bot, Sparkles, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AISearchInputProps {
  value: string
  onChange: (value: string) => void
  onFocus?: () => void
  onClear?: () => void
  isSearching?: boolean
  isFocused?: boolean
  placeholder?: string
  className?: string
}

export const AISearchInput = forwardRef<HTMLInputElement, AISearchInputProps>(
  function AISearchInput(
    {
      value,
      onChange,
      onFocus,
      onClear,
      isSearching = false,
      isFocused = false,
      placeholder = '무엇을 도와드릴까요? 예: "3층 화장실에 누수가 발생했어요"',
      className,
    },
    ref
  ) {
    return (
      <div className={cn('relative', className)}>
        {/* AI Avatar */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <motion.div
            animate={{
              scale: isSearching ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 1,
              repeat: isSearching ? Infinity : 0,
            }}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center',
              isFocused ? 'bg-smart-blue' : 'bg-smart-blue/80'
            )}
          >
            <Bot className="w-4 h-4 text-white" />
          </motion.div>
        </div>

        {/* Input Field */}
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          placeholder={placeholder}
          className={cn(
            'w-full pl-14 pr-12 py-3.5 text-sm bg-bg-gray border-2 rounded-2xl transition-all',
            'focus:outline-none focus:bg-white',
            isFocused
              ? 'border-smart-blue bg-white shadow-lg'
              : 'border-transparent hover:border-border-gray'
          )}
        />

        {/* Right Icons */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {value && !isSearching && (
            <button
              onClick={onClear}
              className="p-1 rounded-full hover:bg-bg-gray transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          {isSearching ? (
            <Loader2 className="w-5 h-5 text-smart-blue animate-spin" />
          ) : value ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Sparkles className="w-5 h-5 text-smart-blue" />
            </motion.div>
          ) : null}
        </div>
      </div>
    )
  }
)
