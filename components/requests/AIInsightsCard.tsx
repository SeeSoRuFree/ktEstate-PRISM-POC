'use client'

import { Sparkles, AlertTriangle, Clock, Copy, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AIAnalysisResult, RequestCategory } from '@/types'
import { REQUEST_CATEGORY_LABELS } from '@/types'
import type { ImpactAnalysisResult, ProcessingTimeEstimate } from '@/lib/actions/ai-analysis'

interface AIInsightsCardProps {
  analysis: AIAnalysisResult | null
  impact?: ImpactAnalysisResult | null
  processingTime?: ProcessingTimeEstimate | null
  similarRequests?: Array<{ id: string; title: string; similarity: number }>
  isLoading?: boolean
  className?: string
}

function ConfidenceBadge({ value, label }: { value: number; label: string }) {
  const percent = Math.round(value * 100)
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-1.5">
        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              percent >= 80 ? 'bg-green-500' : percent >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-xs text-gray-500">{percent}%</span>
      </div>
    </div>
  )
}

export function AIInsightsCard({
  analysis,
  impact,
  processingTime,
  similarRequests,
  isLoading = false,
  className,
}: AIInsightsCardProps) {
  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-4 h-4 text-blue-500" />
            AI 분석 중...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return null
  }

  const hasSimilar = similarRequests && similarRequests.length > 0
  const hasImpact = impact && impact.affectedSystems.length > 0

  return (
    <Card className={cn('border-blue-100 bg-blue-50/50', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="w-4 h-4 text-blue-500" />
          AI 분석 결과
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* System/Module/Type Detection */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm bg-white border border-gray-200">
              <span className="text-gray-500 mr-1.5">시스템:</span>
              <span className="font-medium">{analysis.system.name}</span>
            </span>
            {analysis.module && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm bg-white border border-gray-200">
                <span className="text-gray-500 mr-1.5">모듈:</span>
                <span className="font-medium">{analysis.module.name}</span>
              </span>
            )}
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm bg-white border border-gray-200">
              <span className="text-gray-500 mr-1.5">유형:</span>
              <span className="font-medium">
                {REQUEST_CATEGORY_LABELS[analysis.requestType.category]}
              </span>
            </span>
          </div>

          <ConfidenceBadge value={analysis.overallConfidence} label="분석 신뢰도" />
        </div>

        {/* Impact Analysis */}
        {hasImpact && (
          <div
            className={cn(
              'p-3 rounded-lg border',
              impact.riskLevel === 'high'
                ? 'bg-red-50 border-red-200'
                : impact.riskLevel === 'medium'
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-gray-50 border-gray-200'
            )}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle
                className={cn(
                  'w-4 h-4 mt-0.5 flex-shrink-0',
                  impact.riskLevel === 'high'
                    ? 'text-red-500'
                    : impact.riskLevel === 'medium'
                    ? 'text-yellow-500'
                    : 'text-gray-500'
                )}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">영향도 분석</p>
                <p className="text-sm text-gray-600 mt-1">{impact.message}</p>
                {impact.recommendations.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {impact.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-xs text-gray-500 flex items-start gap-1">
                        <span className="text-gray-400">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Similar Requests */}
        {hasSimilar && (
          <div className="p-3 rounded-lg border border-orange-200 bg-orange-50">
            <div className="flex items-start gap-2">
              <Copy className="w-4 h-4 mt-0.5 text-orange-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">유사 요청 감지</p>
                <div className="mt-2 space-y-1.5">
                  {similarRequests.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between text-sm bg-white rounded px-2 py-1.5"
                    >
                      <span className="text-gray-700 truncate">{req.title}</span>
                      <span className="text-xs text-orange-600 ml-2">
                        {Math.round(req.similarity * 100)}% 유사
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Processing Time Estimate */}
        {processingTime && (
          <div className="p-3 rounded-lg border border-gray-200 bg-white">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">예상 처리 시간</p>
                <p className="text-lg font-semibold text-blue-600 mt-1">
                  {processingTime.estimate}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  범위: {processingTime.range.min} ~ {processingTime.range.max}
                </p>
                {processingTime.factors.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {processingTime.factors.map((factor, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Matched Keywords */}
        {analysis.matchedKeywords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {analysis.matchedKeywords.map((keyword, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
