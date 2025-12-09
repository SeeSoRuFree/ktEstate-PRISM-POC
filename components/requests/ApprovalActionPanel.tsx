'use client'

import { useState } from 'react'
import { Check, X, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ApproverInfo } from '@/types'

interface ApprovalActionPanelProps {
  approvers: ApproverInfo[]
  currentStep: number
  onApprove: (approverId: string, note?: string) => void
  onReject: (approverId: string, note?: string) => void
  className?: string
}

export function ApprovalActionPanel({
  approvers,
  currentStep,
  onApprove,
  onReject,
  className,
}: ApprovalActionPanelProps) {
  const [note, setNote] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // 현재 단계의 결재자 찾기
  const currentApprover = approvers.find((a) => a.order === currentStep && a.status === 'pending')

  if (!currentApprover) {
    return null
  }

  const handleApprove = async () => {
    setIsProcessing(true)
    try {
      onApprove(currentApprover.id, note || undefined)
      setNote('')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    setIsProcessing(true)
    try {
      onReject(currentApprover.id, note || undefined)
      setNote('')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className={cn('bg-blue-50 border border-blue-200 rounded-xl p-4', className)}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900">결재 요청</h4>
          <p className="text-xs text-gray-500">
            {currentApprover.name} ({currentApprover.position}) 님의 결재가 필요합니다
          </p>
        </div>
      </div>

      {/* 결재 의견 입력 */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          결재 의견 (선택)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="결재 의견을 입력하세요..."
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={2}
          disabled={isProcessing}
        />
      </div>

      {/* 결재 버튼 */}
      <div className="flex gap-2">
        <button
          onClick={handleReject}
          disabled={isProcessing}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors',
            'bg-white border border-red-300 text-red-600 hover:bg-red-50',
            isProcessing && 'opacity-50 cursor-not-allowed'
          )}
        >
          <X className="w-4 h-4" />
          반려
        </button>
        <button
          onClick={handleApprove}
          disabled={isProcessing}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors',
            'bg-blue-600 text-white hover:bg-blue-700',
            isProcessing && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Check className="w-4 h-4" />
          승인
        </button>
      </div>

      {/* 결재자 정보 */}
      <div className="mt-3 pt-3 border-t border-blue-200">
        <p className="text-xs text-gray-500">
          {currentStep}단계 결재자: {currentApprover.department} / {currentApprover.name} {currentApprover.position}
        </p>
      </div>
    </div>
  )
}
