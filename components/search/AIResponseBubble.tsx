'use client'

import { motion } from 'framer-motion'
import { Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DetectedTagsBar } from './DetectedTagsBar'
import { TypingIndicator } from './TypingIndicator'
import type { AIAnalysisResult } from '@/types'

interface AIResponseBubbleProps {
  analysis: AIAnalysisResult | null
  userInput: string
  isLoading?: boolean
  className?: string
}

function generateConversationalResponse(
  analysis: AIAnalysisResult,
  userInput: string
): string {
  const typeLabels: Record<string, string> = {
    emergency: '긴급 대응이',
    bug_fix: '오류 수정이',
    feature_request: '기능 요청 처리가',
    inquiry: '문의 답변이',
    maintenance: '점검/유지보수가',
    approval: '승인 처리가',
    general: '요청 처리가',
  }

  const typeLabel = typeLabels[analysis.requestType.category] || '요청 처리가'

  // Create a natural language response
  const responses = [
    `네, 이해했습니다! "${userInput.slice(0, 30)}${userInput.length > 30 ? '...' : ''}" 관련 상황이시군요. ${typeLabel} 필요해 보입니다.`,
    `알겠습니다! 말씀하신 내용을 분석해보니, ${typeLabel} 필요한 상황으로 보입니다.`,
    `확인했습니다! ${analysis.system.name} 시스템의 ${typeLabel} 필요해 보여요.`,
  ]

  // Pick based on confidence level
  if (analysis.overallConfidence >= 0.8) {
    return responses[0]
  } else if (analysis.overallConfidence >= 0.6) {
    return responses[1]
  }
  return responses[2]
}

export function AIResponseBubble({
  analysis,
  userInput,
  isLoading = false,
  className,
}: AIResponseBubbleProps) {
  if (!analysis && !isLoading) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn('flex gap-3', className)}
    >
      {/* AI Avatar */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-smart-blue to-blue-600 flex items-center justify-center shadow-md">
          <Bot className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Response Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-gradient-to-r from-smart-blue-light to-blue-50 rounded-2xl rounded-tl-sm p-4 shadow-sm">
          {isLoading ? (
            <TypingIndicator />
          ) : analysis ? (
            <>
              {/* Confidence Badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-smart-blue">
                  AI 분석 완료
                </span>
                <span className="px-2 py-0.5 bg-smart-blue text-white text-[10px] font-medium rounded-full">
                  {Math.round(analysis.overallConfidence * 100)}% 신뢰도
                </span>
              </div>

              {/* Conversational Response */}
              <p className="text-sm text-kt-black leading-relaxed mb-3">
                {generateConversationalResponse(analysis, userInput)}
              </p>

              {/* Detected Tags */}
              <DetectedTagsBar
                systemName={analysis.system.name}
                moduleName={analysis.module?.name}
                requestType={analysis.requestType.label}
              />

              {/* Generated Title Preview */}
              <div className="mt-3 p-2 bg-white/80 rounded-lg border border-white">
                <p className="text-[10px] text-muted-foreground mb-0.5">
                  생성된 요청 제목
                </p>
                <p className="text-sm font-medium text-kt-black">
                  {analysis.generatedTitle}
                </p>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}
