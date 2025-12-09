'use client'

import { useState, useCallback, useEffect } from 'react'
import { Send, Save, Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SystemModuleSelector } from './SystemModuleSelector'
import { FileUploader } from './FileUploader'
import { AIInsightsCard } from './AIInsightsCard'
import { useRequestsStore } from '@/lib/store/requests-store'
import { analyzeUserInputExtended } from '@/lib/actions/ai-analysis'
import type { AIAnalysisResult, RequestCategory, AttachmentInfo } from '@/types'
import { REQUEST_CATEGORY_LABELS } from '@/types'
import type { ImpactAnalysisResult, ProcessingTimeEstimate } from '@/lib/actions/ai-analysis'

interface PrefillData {
  content?: string
  title?: string
  systemId?: string
  systemName?: string
  moduleId?: string
  moduleName?: string
  requestType?: RequestCategory
}

interface RequestFormPanelProps {
  onSubmitSuccess?: () => void
  className?: string
  prefill?: PrefillData
}

type Urgency = 'low' | 'normal' | 'high' | 'critical'

const URGENCY_OPTIONS: { value: Urgency; label: string }[] = [
  { value: 'low', label: '낮음' },
  { value: 'normal', label: '보통' },
  { value: 'high', label: '높음' },
  { value: 'critical', label: '긴급' },
]

const REQUEST_TYPE_OPTIONS: { value: RequestCategory; label: string }[] = [
  { value: 'emergency', label: '긴급' },
  { value: 'bug_fix', label: '오류 수정' },
  { value: 'feature_request', label: '기능 요청' },
  { value: 'inquiry', label: '문의' },
  { value: 'maintenance', label: '점검/유지보수' },
  { value: 'approval', label: '승인 요청' },
  { value: 'general', label: '일반' },
]

export function RequestFormPanel({ onSubmitSuccess, className, prefill }: RequestFormPanelProps) {
  const { addRequest, findSimilarRequests } = useRequestsStore()

  // Form State
  const [naturalInput, setNaturalInput] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [systemId, setSystemId] = useState<string | null>(null)
  const [systemName, setSystemName] = useState('')
  const [moduleId, setModuleId] = useState<string | null>(null)
  const [moduleName, setModuleName] = useState<string | null>(null)
  const [requestType, setRequestType] = useState<RequestCategory>('general')
  const [urgency, setUrgency] = useState<Urgency>('normal')
  const [attachments, setAttachments] = useState<AttachmentInfo[]>([])
  const [isPrefilled, setIsPrefilled] = useState(false)

  // Handle prefill data
  useEffect(() => {
    if (prefill && !isPrefilled) {
      if (prefill.content) setNaturalInput(prefill.content)
      if (prefill.title) setTitle(prefill.title)
      if (prefill.systemId) {
        setSystemId(prefill.systemId)
        setSystemName(prefill.systemName || '')
      }
      if (prefill.moduleId) {
        setModuleId(prefill.moduleId)
        setModuleName(prefill.moduleName || null)
      }
      if (prefill.requestType) setRequestType(prefill.requestType)
      setIsPrefilled(true)
    }
  }, [prefill, isPrefilled])

  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null)
  const [impact, setImpact] = useState<ImpactAnalysisResult | null>(null)
  const [processingTime, setProcessingTime] = useState<ProcessingTimeEstimate | null>(null)
  const [similarRequests, setSimilarRequests] = useState<Array<{ id: string; title: string; similarity: number }>>([])

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // AI Analysis on Natural Input Change
  const analyzeInput = useCallback(async () => {
    if (!naturalInput.trim() || naturalInput.length < 5) {
      setAiAnalysis(null)
      setImpact(null)
      setProcessingTime(null)
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      // Simulate async analysis
      await new Promise((resolve) => setTimeout(resolve, 500))

      const result = analyzeUserInputExtended(naturalInput, urgency)

      if (result) {
        setAiAnalysis(result.base)
        setImpact(result.impact)
        setProcessingTime(result.processingTime)

        // Auto-fill form fields
        if (!title) setTitle(result.base.generatedTitle)
        if (!systemId) {
          setSystemId(result.base.system.id)
          setSystemName(result.base.system.name)
        }
        if (!moduleId && result.base.module) {
          setModuleId(result.base.module.id)
          setModuleName(result.base.module.name)
        }
        setRequestType(result.base.requestType.category)

        // Auto-set urgency for emergency types
        if (result.base.requestType.category === 'emergency' && urgency === 'normal') {
          setUrgency('high')
        }

        // Find similar requests
        const similar = findSimilarRequests(result.base.generatedTitle, naturalInput)
        setSimilarRequests(
          similar.map((r) => ({
            id: r.id,
            title: r.title,
            similarity: 0.7, // Simplified
          }))
        )
      }
    } catch (err) {
      console.error('Analysis error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }, [naturalInput, urgency, title, systemId, moduleId, findSimilarRequests])

  // Debounced analysis
  useEffect(() => {
    const timer = setTimeout(analyzeInput, 800)
    return () => clearTimeout(timer)
  }, [naturalInput, analyzeInput])

  // Form Validation
  const isValid = systemId && title.trim() && (content.trim() || naturalInput.trim())

  // Submit Handler
  const handleSubmit = async () => {
    if (!isValid) {
      setError('시스템과 제목은 필수 입력 항목입니다.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const newRequest = addRequest({
        title: title.trim(),
        content: content.trim() || naturalInput.trim(),
        systemId: systemId!,
        systemName,
        moduleId: moduleId || undefined,
        moduleName: moduleName || undefined,
        requestType,
        urgency,
        attachments,
      })

      // Reset form
      setNaturalInput('')
      setTitle('')
      setContent('')
      setSystemId(null)
      setSystemName('')
      setModuleId(null)
      setModuleName(null)
      setRequestType('general')
      setUrgency('normal')
      setAttachments([])
      setAiAnalysis(null)
      setImpact(null)
      setProcessingTime(null)
      setSimilarRequests([])

      onSubmitSuccess?.()
    } catch (err) {
      setError('요청 등록에 실패했습니다. 다시 시도해 주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className={cn('flex flex-col h-full', className)}>
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="w-4 h-4 text-blue-500" />
          요청 등록
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto space-y-5">
        {/* Natural Language Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            무엇을 도와드릴까요?
          </label>
          <div className="relative">
            <textarea
              value={naturalInput}
              onChange={(e) => setNaturalInput(e.target.value)}
              placeholder="예: 3층 화장실 누수 신고해주세요"
              className={cn(
                'w-full px-4 py-3 border rounded-lg resize-none',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'text-gray-900 placeholder-gray-400'
              )}
              rows={3}
            />
            {isAnalyzing && (
              <div className="absolute right-3 top-3">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* AI Insights */}
        {(aiAnalysis || isAnalyzing) && (
          <AIInsightsCard
            analysis={aiAnalysis}
            impact={impact}
            processingTime={processingTime}
            similarRequests={similarRequests}
            isLoading={isAnalyzing}
          />
        )}

        {/* System/Module Selector */}
        <SystemModuleSelector
          selectedSystemId={systemId}
          selectedModuleId={moduleId}
          onSystemChange={(id, name) => {
            setSystemId(id)
            setSystemName(name)
          }}
          onModuleChange={(id, name) => {
            setModuleId(id)
            setModuleName(name)
          }}
          aiSuggested={{
            systemId: aiAnalysis?.system.id,
            moduleId: aiAnalysis?.module?.id,
          }}
        />

        {/* Request Type & Urgency */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">요청 유형</label>
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value as RequestCategory)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {REQUEST_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">긴급도</label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as Urgency)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {URGENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            제목
            {aiAnalysis && title === aiAnalysis.generatedTitle && (
              <span className="ml-2 inline-flex items-center text-xs text-blue-600">
                <Sparkles className="w-3 h-3 mr-1" />
                AI 생성
              </span>
            )}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="요청 제목을 입력하세요"
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">상세 내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="요청 상세 내용을 입력하세요 (선택)"
            className="w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        </div>

        {/* File Uploader */}
        <FileUploader attachments={attachments} onAttachmentsChange={setAttachments} />

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
      </CardContent>

      {/* Actions */}
      <div className="p-4 border-t flex-shrink-0">
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isValid && !isSubmitting
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                등록 중...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                요청 등록
              </>
            )}
          </button>
        </div>
      </div>
    </Card>
  )
}
