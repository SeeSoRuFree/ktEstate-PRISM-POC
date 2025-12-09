'use client'

import { Check, X, Clock, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ApproverInfo } from '@/types'

interface ApprovalTimelineProps {
  approvers: ApproverInfo[]
  currentStep?: number
  className?: string
}

export function ApprovalTimeline({ approvers, currentStep = 1, className }: ApprovalTimelineProps) {
  if (!approvers || approvers.length === 0) {
    return null
  }

  const sortedApprovers = [...approvers].sort((a, b) => a.order - b.order)

  const getStatusIcon = (status: ApproverInfo['status'], isCurrentStep: boolean) => {
    switch (status) {
      case 'approved':
        return <Check className="w-4 h-4 text-white" />
      case 'rejected':
        return <X className="w-4 h-4 text-white" />
      default:
        return isCurrentStep ? (
          <Clock className="w-4 h-4 text-white animate-pulse" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-gray-300" />
        )
    }
  }

  const getStatusColor = (status: ApproverInfo['status'], isCurrentStep: boolean) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500 border-green-500'
      case 'rejected':
        return 'bg-red-500 border-red-500'
      default:
        return isCurrentStep
          ? 'bg-blue-500 border-blue-500'
          : 'bg-gray-100 border-gray-300'
    }
  }

  const getLineColor = (status: ApproverInfo['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500'
      case 'rejected':
        return 'bg-red-500'
      default:
        return 'bg-gray-200'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  return (
    <div className={cn('py-4', className)}>
      <h4 className="text-sm font-medium text-gray-700 mb-4">결재 진행 현황</h4>

      <div className="flex items-start">
        {sortedApprovers.map((approver, index) => {
          const isCurrentStep = approver.order === currentStep
          const isLastItem = index === sortedApprovers.length - 1

          return (
            <div key={approver.id} className="flex items-start flex-1 min-w-0">
              {/* Step Item */}
              <div className="flex flex-col items-center min-w-[80px]">
                {/* Circle */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all',
                    getStatusColor(approver.status, isCurrentStep),
                    isCurrentStep && approver.status === 'pending' && 'ring-2 ring-blue-200 ring-offset-2'
                  )}
                >
                  {getStatusIcon(approver.status, isCurrentStep)}
                </div>

                {/* Info */}
                <div className="mt-2 text-center">
                  <p className="text-xs font-medium text-gray-500">{approver.order}단계</p>
                  <p className="text-sm font-semibold text-gray-900 truncate max-w-[80px]">
                    {approver.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate max-w-[80px]">
                    {approver.position}
                  </p>

                  {/* Status Badge */}
                  <div className="mt-1">
                    {approver.status === 'approved' && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">
                        승인
                      </span>
                    )}
                    {approver.status === 'rejected' && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700">
                        반려
                      </span>
                    )}
                    {approver.status === 'pending' && isCurrentStep && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">
                        진행중
                      </span>
                    )}
                    {approver.status === 'pending' && !isCurrentStep && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500">
                        대기
                      </span>
                    )}
                  </div>

                  {/* Processed Date */}
                  {approver.processedAt && (
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {formatDate(approver.processedAt)}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {!isLastItem && (
                <div className="flex-1 flex items-center pt-5 px-1">
                  <div className={cn('h-0.5 w-full', getLineColor(approver.status))} />
                  <ArrowRight className={cn(
                    'w-4 h-4 -ml-1 flex-shrink-0',
                    approver.status === 'approved' ? 'text-green-500' :
                    approver.status === 'rejected' ? 'text-red-500' : 'text-gray-300'
                  )} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Approval Notes */}
      {sortedApprovers.some((a) => a.note) && (
        <div className="mt-4 pt-4 border-t">
          <h5 className="text-xs font-medium text-gray-500 mb-2">결재 의견</h5>
          <div className="space-y-2">
            {sortedApprovers
              .filter((a) => a.note)
              .map((approver) => (
                <div key={`note-${approver.id}`} className="flex gap-2 text-sm">
                  <span className="font-medium text-gray-700 flex-shrink-0">
                    {approver.name}:
                  </span>
                  <span className="text-gray-600">{approver.note}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
