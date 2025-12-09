'use client'

import { useState, useMemo, useEffect } from 'react'
import { ListFilter, RefreshCw, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RequestCard } from './RequestCard'
import { RequestDetailModal } from './RequestDetailModal'
import { useRequestsStore } from '@/lib/store/requests-store'
import type { Request, RequestStatus } from '@/types'

interface MyRequestsPanelProps {
  onNewRequest?: () => void
  isAdmin?: boolean
  className?: string
}

type FilterTab = 'all' | RequestStatus

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'pending', label: '대기' },
  { value: 'in_progress', label: '처리중' },
  { value: 'completed', label: '완료' },
]

export function MyRequestsPanel({
  onNewRequest,
  isAdmin = false,
  className,
}: MyRequestsPanelProps) {
  const { requests, getRequestStats, initSampleData } = useRequestsStore()
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const stats = getRequestStats()

  const filteredRequests = useMemo(() => {
    if (activeTab === 'all') return requests
    if (activeTab === 'in_progress') {
      return requests.filter((r) => r.status === 'in_progress' || r.status === 'approved')
    }
    return requests.filter((r) => r.status === activeTab)
  }, [requests, activeTab])

  const handleInitSample = () => {
    if (requests.length === 0) {
      initSampleData()
    }
  }

  return (
    <>
      <Card className={cn('flex flex-col h-full', className)}>
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <ListFilter className="w-4 h-4" />
              나의 요청
              <span className="text-sm font-normal text-gray-500" suppressHydrationWarning>
                ({isMounted ? stats.total : 0}건)
              </span>
            </CardTitle>
            {onNewRequest && (
              <button
                onClick={onNewRequest}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors lg:hidden"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 mt-3 p-1 bg-gray-100 rounded-lg">
            {FILTER_TABS.map((tab) => {
              const count = isMounted
                ? tab.value === 'all'
                  ? stats.total
                  : tab.value === 'pending'
                  ? stats.pending
                  : tab.value === 'in_progress'
                  ? stats.inProgress
                  : stats.completed
                : 0

              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    'flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                    activeTab === tab.value
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  {tab.label}
                  {isMounted && count > 0 && (
                    <span
                      className={cn(
                        'ml-1.5 text-xs',
                        activeTab === tab.value ? 'text-blue-600' : 'text-gray-400'
                      )}
                      suppressHydrationWarning
                    >
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden flex flex-col pt-0">
          {/* Request List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <ListFilter className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-4">
                  {activeTab === 'all'
                    ? '아직 등록된 요청이 없습니다'
                    : `${FILTER_TABS.find((t) => t.value === activeTab)?.label} 상태의 요청이 없습니다`}
                </p>
                {requests.length === 0 && (
                  <button
                    onClick={handleInitSample}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    샘플 데이터 불러오기
                  </button>
                )}
              </div>
            ) : (
              filteredRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onClick={() => setSelectedRequest(request)}
                  compact
                />
              ))
            )}
          </div>

          {/* Stats Summary */}
          {isMounted && stats.total > 0 && (
            <div className="flex-shrink-0 pt-4 mt-4 border-t">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <p className="text-lg font-semibold text-yellow-700">{stats.pending}</p>
                  <p className="text-xs text-yellow-600">대기</p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <p className="text-lg font-semibold text-purple-700">{stats.inProgress}</p>
                  <p className="text-xs text-purple-600">처리중</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <p className="text-lg font-semibold text-green-700">{stats.completed}</p>
                  <p className="text-xs text-green-600">완료</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          isAdmin={isAdmin}
        />
      )}
    </>
  )
}
