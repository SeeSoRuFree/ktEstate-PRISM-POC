'use client'

import { useCallback, useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Sparkles, Loader2, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { AppSidebar } from './AppSidebar'
import { cn } from '@/lib/utils'
import { searchActionsGrouped, analyzeUserInput, hasHighConfidence, type GroupedActionResult } from '@/lib/actions'
import { useSidebarStore } from '@/lib/store'
import type { ActionSearchResult, AIAnalysisResult } from '@/types'
import { Bot, ArrowRight, CheckCircle2 } from 'lucide-react'

interface AppLayoutProps {
  children: React.ReactNode
  showSearch?: boolean
}

export function AppLayout({ children, showSearch = true }: AppLayoutProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<GroupedActionResult[]>([])
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const { addDynamicMenu, pendingSearch, clearPendingSearch } = useSidebarStore()

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 홈페이지 빠른 검색 처리
  useEffect(() => {
    if (pendingSearch) {
      setSearchQuery(pendingSearch)
      setIsSearchFocused(true)
      handleSearchChange(pendingSearch)
      clearPendingSearch()
    }
  }, [pendingSearch, clearPendingSearch])

  // 검색 실행
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)

    if (!value.trim()) {
      setSearchResults([])
      setAiAnalysis(null)
      return
    }

    setIsSearching(true)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      const results = searchActionsGrouped(value)
      const analysis = analyzeUserInput(value)
      setSearchResults(results)
      setAiAnalysis(analysis)
      setIsSearching(false)
    }, 150)
  }, [])

  // 메뉴 선택
  const handleSelectMenu = useCallback(
    (result: ActionSearchResult, systemInfo: { id: string; name: string; icon: string }) => {
      const { action } = result

      // 사이드바에 동적 메뉴 추가
      addDynamicMenu({
        id: `search-${action.id}-${Date.now()}`,
        actionId: action.id,
        name: action.name,
        icon: systemInfo.icon,
        systemName: systemInfo.name,
        query: searchQuery,
      })

      // 검색 초기화
      setSearchQuery('')
      setSearchResults([])
      setIsSearchFocused(false)

      // 액션 페이지로 이동
      const params = new URLSearchParams()
      if (searchQuery) params.set('pf_situation', searchQuery)
      router.push(`/action/${action.id}${params.toString() ? '?' + params : ''}`)
    },
    [searchQuery, addDynamicMenu, router]
  )

  // 사이드바 검색 핸들러
  const handleSidebarSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setIsSearchFocused(true)
    handleSearchChange(query)
  }, [handleSearchChange])

  return (
    <div className="flex min-h-screen bg-bg-gray">
      {/* 사이드바 */}
      <AppSidebar onSearch={handleSidebarSearch} />

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 상단 헤더 */}
        <header className="h-14 bg-white border-b border-border-gray flex items-center justify-between px-6 sticky top-0 z-20">
          {showSearch ? (
            <div ref={searchRef} className="relative flex-1 max-w-2xl">
              {/* 검색 입력 */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="메뉴 검색..."
                  className={cn(
                    'w-full pl-12 pr-12 py-2.5 text-sm bg-bg-gray border-2 rounded-xl transition-all',
                    'focus:outline-none focus:bg-white',
                    isSearchFocused
                      ? 'border-smart-blue bg-white shadow-lg'
                      : 'border-transparent hover:border-border-gray'
                  )}
                />
                {isSearching ? (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-smart-blue animate-spin" />
                ) : searchQuery && (
                  <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-smart-blue" />
                )}
              </div>

              {/* 검색 결과 드롭다운 */}
              <AnimatePresence>
                {isSearchFocused && (searchResults.length > 0 || searchQuery.trim()) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-border-gray overflow-hidden z-50"
                  >
                    {searchResults.length > 0 ? (
                      <div className="max-h-[400px] overflow-y-auto">
                        {searchResults.slice(0, 3).map((group) => (
                          <div key={group.system.id}>
                            {/* 시스템 헤더 */}
                            <div className="px-4 py-2 bg-bg-gray border-b border-border-gray">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{group.system.icon}</span>
                                <span className="font-medium text-sm text-kt-black">
                                  {group.system.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {group.actions.length}개 메뉴
                                </span>
                              </div>
                            </div>

                            {/* 액션 리스트 */}
                            <div className="py-1">
                              {group.actions.slice(0, 3).map((actionResult) => (
                                <button
                                  key={actionResult.action.id}
                                  onClick={() => handleSelectMenu(actionResult, group.system)}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-smart-blue-light transition-colors text-left"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm text-kt-black">
                                        {actionResult.action.name}
                                      </span>
                                      {actionResult.confidence >= 0.7 && (
                                        <span className="px-1.5 py-0.5 bg-status-success/10 text-status-success text-[10px] rounded">
                                          추천
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {actionResult.action.description}
                                    </p>
                                  </div>
                                  <div className="w-12 h-1.5 bg-border-gray rounded-full overflow-hidden">
                                    <div
                                      className={cn(
                                        'h-full rounded-full',
                                        actionResult.confidence >= 0.7
                                          ? 'bg-status-success'
                                          : actionResult.confidence >= 0.4
                                            ? 'bg-status-warning'
                                            : 'bg-gray-400'
                                      )}
                                      style={{ width: `${Math.round(actionResult.confidence * 100)}%` }}
                                    />
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : searchQuery.trim() && !isSearching ? (
                      <div className="py-8 text-center">
                        <p className="text-sm text-muted-foreground">
                          "{searchQuery}"에 대한 메뉴를 찾지 못했습니다
                        </p>
                      </div>
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* POC 가이드 버튼 */}
          <Link
            href="/guide"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-smart-blue hover:bg-smart-blue-light rounded-lg transition-colors ml-4"
          >
            <BookOpen className="w-4 h-4" />
            <span>POC 가이드</span>
          </Link>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
