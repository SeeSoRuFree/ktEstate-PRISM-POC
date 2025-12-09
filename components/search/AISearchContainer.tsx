'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AISearchInput } from './AISearchInput'
import { AIResponseBubble } from './AIResponseBubble'
import { ActionCardGrid } from './ActionCardGrid'
import {
  searchActionsGrouped,
  analyzeUserInput,
  hasHighConfidence,
} from '@/lib/actions'
import { useSidebarStore } from '@/lib/store'
import type { AIAnalysisResult, ActionMeta } from '@/types'

interface ActionResult {
  action: ActionMeta
  confidence: number
}

interface AISearchContainerProps {
  className?: string
}

export function AISearchContainer({ className }: AISearchContainerProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null)
  const [actionResults, setActionResults] = useState<ActionResult[]>([])

  const { addDynamicMenu, pendingSearch, clearPendingSearch } = useSidebarStore()

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle pending search from homepage
  useEffect(() => {
    if (pendingSearch) {
      setSearchQuery(pendingSearch)
      setIsSearchFocused(true)
      handleSearchChange(pendingSearch)
      clearPendingSearch()
    }
  }, [pendingSearch, clearPendingSearch])

  // Search execution with debounce
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)

    if (!value.trim()) {
      setActionResults([])
      setAiAnalysis(null)
      return
    }

    setIsSearching(true)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      const groupedResults = searchActionsGrouped(value)
      const analysis = analyzeUserInput(value)

      // Flatten grouped results into action results
      const flatResults: ActionResult[] = []
      groupedResults.forEach((group) => {
        group.actions.forEach((actionResult) => {
          flatResults.push({
            action: actionResult.action,
            confidence: actionResult.confidence,
          })
        })
      })

      // Sort by confidence and take top results
      flatResults.sort((a, b) => b.confidence - a.confidence)

      setActionResults(flatResults.slice(0, 4))
      setAiAnalysis(analysis)
      setIsSearching(false)
    }, 150)
  }, [])

  // Handle action selection
  const handleActionClick = useCallback(
    (action: ActionMeta) => {
      // Add to sidebar dynamic menu
      addDynamicMenu({
        id: `search-${action.id}-${Date.now()}`,
        actionId: action.id,
        name: action.name,
        icon: action.icon,
        systemName: action.systemId,
        query: searchQuery,
      })

      // Build URL params
      const params = new URLSearchParams()
      if (searchQuery) params.set('pf_situation', searchQuery)
      if (aiAnalysis) {
        params.set('pf_system', aiAnalysis.system.id)
        if (aiAnalysis.module) params.set('pf_module', aiAnalysis.module.id)
        params.set('pf_type', aiAnalysis.requestType.category)
        params.set('pf_title', aiAnalysis.generatedTitle)
      }

      // Reset state
      setSearchQuery('')
      setActionResults([])
      setAiAnalysis(null)
      setIsSearchFocused(false)

      // Navigate
      router.push(`/action/${action.id}${params.toString() ? '?' + params : ''}`)
    },
    [searchQuery, aiAnalysis, addDynamicMenu, router]
  )

  // Clear search
  const handleClear = useCallback(() => {
    setSearchQuery('')
    setActionResults([])
    setAiAnalysis(null)
    inputRef.current?.focus()
  }, [])

  const showResults = isSearchFocused && (actionResults.length > 0 || aiAnalysis || searchQuery.trim())

  return (
    <div ref={containerRef} className={className}>
      {/* Search Input */}
      <AISearchInput
        ref={inputRef}
        value={searchQuery}
        onChange={handleSearchChange}
        onFocus={() => setIsSearchFocused(true)}
        onClear={handleClear}
        isSearching={isSearching}
        isFocused={isSearchFocused}
      />

      {/* Results Panel */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-xl border border-border-gray overflow-hidden z-50"
          >
            <div className="p-4 max-h-[500px] overflow-y-auto">
              {/* AI Response Bubble */}
              <AIResponseBubble
                analysis={aiAnalysis}
                userInput={searchQuery}
                isLoading={isSearching}
                className="mb-4"
              />

              {/* Action Cards */}
              {!isSearching && actionResults.length > 0 && (
                <ActionCardGrid
                  actions={actionResults}
                  onActionClick={handleActionClick}
                  className="mt-4"
                />
              )}

              {/* No Results */}
              {!isSearching && searchQuery.trim() && actionResults.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-8 text-center"
                >
                  <p className="text-sm text-muted-foreground">
                    "{searchQuery}"에 대한 관련 작업을 찾지 못했습니다
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    다른 키워드로 검색해 보세요
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
