'use client'

import { useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AppLayout } from '@/components/layout'
import { RequestFormPanel, MyRequestsPanel } from '@/components/requests'
import type { RequestCategory } from '@/types'

function RequestsContent() {
  const searchParams = useSearchParams()
  const [refreshKey, setRefreshKey] = useState(0)

  // Parse prefill data from URL params
  const prefillData = useMemo(() => {
    if (searchParams.get('prefill') !== 'true') return undefined

    return {
      content: searchParams.get('content') || undefined,
      title: searchParams.get('title') || undefined,
      systemId: searchParams.get('systemId') || undefined,
      systemName: searchParams.get('systemName') || undefined,
      moduleId: searchParams.get('moduleId') || undefined,
      moduleName: searchParams.get('moduleName') || undefined,
      requestType: (searchParams.get('requestType') as RequestCategory) || undefined,
    }
  }, [searchParams])

  const handleSubmitSuccess = () => {
    // Force refresh of the requests list
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">요청 관리</h1>
        <p className="text-gray-600 mt-1">
          AI가 자동으로 시스템/모듈/유형을 분류하고, 영향도와 처리 시간을 예측합니다.
        </p>
        {prefillData && (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            AI 분석 결과가 자동으로 입력되었습니다
          </div>
        )}
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-0">
        {/* Left: Request Form (3 cols) */}
        <div className="lg:col-span-3 min-h-0">
          <RequestFormPanel
            onSubmitSuccess={handleSubmitSuccess}
            prefill={prefillData}
            className="h-full"
          />
        </div>

        {/* Right: My Requests (2 cols) */}
        <div className="lg:col-span-2 min-h-0">
          <MyRequestsPanel
            key={refreshKey}
            isAdmin={true}
            className="h-full"
          />
        </div>
      </div>
    </div>
  )
}

export default function RequestsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="h-full flex items-center justify-center">로딩 중...</div>}>
        <RequestsContent />
      </Suspense>
    </AppLayout>
  )
}
