'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, Sparkles, Clock, User, AlertCircle, Bot, Wand2 } from 'lucide-react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { getActionMeta } from '@/lib/actions'
import { cn } from '@/lib/utils'
import type { ActionMeta, ActionField } from '@/types'

export default function ActionPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const actionId = params.actionId as string
  const prefillSituation = searchParams.get('pf_situation') || ''
  const prefillSystem = searchParams.get('pf_system') || ''
  const prefillModule = searchParams.get('pf_module') || ''
  const prefillType = searchParams.get('pf_type') || ''
  const prefillTitle = searchParams.get('pf_title') || ''

  // AI 분석 정보가 있는지 확인
  const hasAiAnalysis = !!(prefillSystem || prefillModule || prefillType || prefillTitle)

  const [action, setAction] = useState<ActionMeta | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    const meta = getActionMeta(actionId)
    if (meta) {
      setAction(meta)
      // AI 자동 채움 필드에 prefill 값 설정
      const initialData: Record<string, string> = {}
      const filledFields = new Set<string>()

      // AI 생성 제목이 있으면 title 필드에 설정
      if (prefillTitle) {
        initialData['title'] = prefillTitle
        filledFields.add('title')
      }

      if (prefillSituation && meta.fields) {
        meta.fields.forEach((field) => {
          if (field.aiAutoFill && (field.type === 'text' || field.type === 'textarea')) {
            initialData[field.id] = prefillSituation
            filledFields.add(field.id)
          }
        })
      }

      setFormData(initialData)
      setAiFilledFields(filledFields)
    }
  }, [actionId, prefillSituation, prefillTitle])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
  }

  if (!action) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">액션을 찾을 수 없습니다</p>
        </div>
      </AppLayout>
    )
  }

  if (isSubmitted) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-status-success/10 flex items-center justify-center">
              <span className="text-4xl">✅</span>
            </div>
            <h1 className="text-2xl font-bold text-kt-black mb-2">
              {action.processType === 'approval-required' ? '신청이 완료되었습니다' : '접수가 완료되었습니다'}
            </h1>
            <p className="text-muted-foreground mb-8">
              {action.processType === 'approval-required'
                ? '승인자에게 알림이 전송되었습니다. 승인 후 처리됩니다.'
                : '담당자에게 알림이 전송되었습니다. 곧 처리될 예정입니다.'}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-smart-blue text-white rounded-xl hover:bg-smart-blue/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              홈으로 돌아가기
            </Link>
          </motion.div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-kt-black transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{action.icon}</span>
            <div>
              <h1 className="text-2xl font-bold text-kt-black">{action.name}</h1>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 메인 폼 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">요청 정보 입력</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {action.fields?.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-kt-black mb-1.5">
                      {field.name}
                      {field.required && <span className="text-status-error ml-1">*</span>}
                      {aiFilledFields.has(field.id) && (
                        <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 bg-smart-blue/10 text-smart-blue text-[10px] rounded-full">
                          <Wand2 className="w-3 h-3" />
                          AI 자동입력
                        </span>
                      )}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="w-full px-4 py-2.5 border border-border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-smart-blue/20 focus:border-smart-blue transition-all"
                      >
                        <option value="">선택하세요</option>
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-smart-blue/20 focus:border-smart-blue transition-all resize-none"
                      />
                    ) : field.type === 'date' ? (
                      <input
                        type="date"
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="w-full px-4 py-2.5 border border-border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-smart-blue/20 focus:border-smart-blue transition-all"
                      />
                    ) : field.type === 'urgency' ? (
                      <div className="flex gap-2">
                        {['low', 'normal', 'high', 'critical'].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => handleInputChange(field.id, level)}
                            className={cn(
                              'flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all',
                              formData[field.id] === level
                                ? level === 'critical'
                                  ? 'bg-status-error text-white border-status-error'
                                  : level === 'high'
                                    ? 'bg-status-warning text-white border-status-warning'
                                    : level === 'normal'
                                      ? 'bg-smart-blue text-white border-smart-blue'
                                      : 'bg-gray-500 text-white border-gray-500'
                                : 'bg-white text-muted-foreground border-border-gray hover:border-smart-blue'
                            )}
                          >
                            {level === 'low' && '낮음'}
                            {level === 'normal' && '보통'}
                            {level === 'high' && '높음'}
                            {level === 'critical' && '긴급'}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-2.5 border border-border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-smart-blue/20 focus:border-smart-blue transition-all"
                      />
                    )}
                  </div>
                ))}

                {/* 제출 버튼 */}
                <div className="pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={cn(
                      'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all',
                      action.processType === 'direct'
                        ? 'bg-status-error text-white hover:bg-status-error/90'
                        : 'bg-smart-blue text-white hover:bg-smart-blue/90',
                      isSubmitting && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {isSubmitting ? (
                      <>처리 중...</>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {action.processType === 'direct' ? '긴급 신고' : '신청하기'}
                      </>
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Copilot 사이드패널 */}
          <div className="space-y-4">
            {/* AI 분석 결과 카드 */}
            {hasAiAnalysis && (
              <Card className="bg-gradient-to-br from-smart-blue-light to-blue-50 border-smart-blue/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Bot className="w-4 h-4 text-smart-blue" />
                    AI 분석 결과
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {prefillSystem && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-14">시스템</span>
                      <span className="px-2 py-1 bg-white rounded text-xs font-medium text-kt-black">
                        {prefillSystem.toUpperCase()}
                      </span>
                    </div>
                  )}
                  {prefillModule && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-14">모듈</span>
                      <span className="px-2 py-1 bg-white rounded text-xs font-medium text-kt-black">
                        {prefillModule.replace('one-', '').toUpperCase()}
                      </span>
                    </div>
                  )}
                  {prefillType && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-14">요청유형</span>
                      <span className="px-2 py-1 bg-white rounded text-xs font-medium text-kt-black">
                        {prefillType === 'bug_fix' && '오류 수정'}
                        {prefillType === 'feature_request' && '기능 요청'}
                        {prefillType === 'inquiry' && '문의'}
                        {prefillType === 'emergency' && '긴급'}
                        {prefillType === 'maintenance' && '점검/유지보수'}
                        {prefillType === 'approval' && '승인 요청'}
                        {prefillType === 'general' && '일반'}
                      </span>
                    </div>
                  )}
                  {prefillTitle && (
                    <div className="mt-3 p-2 bg-white rounded-lg">
                      <p className="text-[10px] text-muted-foreground mb-1">자동 생성 제목</p>
                      <p className="text-xs font-medium text-kt-black">{prefillTitle}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-[10px] text-smart-blue pt-2">
                    <Wand2 className="w-3 h-3" />
                    AI가 입력 내용을 분석하여 자동 분류했습니다
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 추천 액션 */}
            {action.copilotHints?.suggestedActions && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-smart-blue" />
                    추천 액션
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {action.copilotHints.suggestedActions.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-smart-blue" />
                      {item}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* 관련 정보 */}
            {action.copilotHints?.relatedInfo && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    관련 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {action.copilotHints.relatedInfo.map((item, idx) => (
                    <div
                      key={idx}
                      className="text-sm text-muted-foreground"
                    >
                      {item}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* 예상 처리 시간 */}
            {action.copilotHints?.estimatedTime && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    예상 처리 시간
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium text-kt-black">
                    {action.copilotHints.estimatedTime}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* 프로세스 타입 안내 */}
            <Card className={cn(
              action.processType === 'approval-required'
                ? 'bg-status-warning/10 border-status-warning/30'
                : action.processType === 'direct'
                  ? 'bg-status-error/10 border-status-error/30'
                  : 'bg-smart-blue/10 border-smart-blue/30'
            )}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className={cn(
                    'w-5 h-5 flex-shrink-0',
                    action.processType === 'approval-required'
                      ? 'text-status-warning'
                      : action.processType === 'direct'
                        ? 'text-status-error'
                        : 'text-smart-blue'
                  )} />
                  <div>
                    <p className="text-sm font-medium text-kt-black mb-1">
                      {action.processType === 'approval-required' && '승인 필요'}
                      {action.processType === 'direct' && '즉시 처리'}
                      {action.processType === 'assignment' && '담당자 배정'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {action.processType === 'approval-required' && '승인자의 승인 후 처리됩니다.'}
                      {action.processType === 'direct' && '신고 즉시 담당자에게 전달됩니다.'}
                      {action.processType === 'assignment' && '적합한 담당자가 배정됩니다.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
