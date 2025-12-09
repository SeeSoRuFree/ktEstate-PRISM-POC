'use client'

import { useState } from 'react'
import { X, Clock, User, Paperclip, History, FileText, Image, Download, Users } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { StatusBadge } from './StatusBadge'
import { ApprovalTimeline } from './ApprovalTimeline'
import { ApprovalActionPanel } from './ApprovalActionPanel'
import { ApprovalSetupModal } from './ApprovalSetupModal'
import type { Request, RequestStatus, ApproverInfo } from '@/types'
import { REQUEST_CATEGORY_LABELS } from '@/types'
import { useRequestsStore, SAMPLE_ASSIGNEES } from '@/lib/store/requests-store'

interface RequestDetailModalProps {
  request: Request
  onClose: () => void
  isAdmin?: boolean
}

const URGENCY_LABELS = {
  low: '낮음',
  normal: '보통',
  high: '높음',
  critical: '긴급',
}

const URGENCY_COLORS = {
  low: 'text-gray-600 bg-gray-100',
  normal: 'text-blue-600 bg-blue-100',
  high: 'text-orange-600 bg-orange-100',
  critical: 'text-red-600 bg-red-100',
}

export function RequestDetailModal({
  request,
  onClose,
  isAdmin = false,
}: RequestDetailModalProps) {
  const { updateStatus, assignRequest, setApprovers, processApproval, getRequestById } = useRequestsStore()
  const [selectedAssignee, setSelectedAssignee] = useState(request.assignee?.id || '')
  const [statusNote, setStatusNote] = useState('')
  const [showApprovalSetup, setShowApprovalSetup] = useState(false)

  // 최신 요청 데이터 가져오기 (결재 처리 후 업데이트 반영)
  const currentRequest = getRequestById(request.id) || request

  const handleStatusChange = (newStatus: RequestStatus) => {
    updateStatus(request.id, newStatus, statusNote || undefined)
    setStatusNote('')
  }

  const handleAssign = () => {
    if (selectedAssignee) {
      assignRequest(request.id, selectedAssignee)
    }
  }

  const handleApprovalSetup = (approvers: ApproverInfo[]) => {
    setApprovers(request.id, approvers)
  }

  const handleApprove = (approverId: string, note?: string) => {
    processApproval(request.id, approverId, 'approve', note)
  }

  const handleReject = (approverId: string, note?: string) => {
    processApproval(request.id, approverId, 'reject', note)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-500 font-mono">{request.id}</span>
              <StatusBadge status={request.status} />
              <span className={cn('text-xs px-2 py-0.5 rounded', URGENCY_COLORS[request.urgency])}>
                {URGENCY_LABELS[request.urgency]}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{request.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">시스템</label>
              <p className="text-sm font-medium">{request.systemName}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">모듈</label>
              <p className="text-sm font-medium">{request.moduleName || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">요청 유형</label>
              <p className="text-sm font-medium">{REQUEST_CATEGORY_LABELS[request.requestType]}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">요청일시</label>
              <p className="text-sm font-medium">
                {format(new Date(request.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
              </p>
            </div>
          </div>

          {/* Requester & Assignee */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">요청자</p>
                <p className="text-sm font-medium">{currentRequest.requester.name}</p>
                {currentRequest.requester.department && (
                  <p className="text-xs text-gray-500">{currentRequest.requester.department}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <User className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">담당자</p>
                {currentRequest.assignee ? (
                  <>
                    <p className="text-sm font-medium">{currentRequest.assignee.name}</p>
                    {currentRequest.assignee.department && (
                      <p className="text-xs text-gray-500">{currentRequest.assignee.department}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-400">미배정</p>
                )}
              </div>
            </div>
          </div>

          {/* 결재선 섹션 */}
          {currentRequest.approvers && currentRequest.approvers.length > 0 ? (
            <div className="border rounded-xl p-4">
              <ApprovalTimeline
                approvers={currentRequest.approvers}
                currentStep={currentRequest.currentApprovalStep || 1}
              />

              {/* 결재 액션 패널 - 현재 결재 단계에 pending 결재자가 있을 때 표시 */}
              {isAdmin && currentRequest.status !== 'completed' && currentRequest.status !== 'rejected' && (
                <ApprovalActionPanel
                  approvers={currentRequest.approvers}
                  currentStep={currentRequest.currentApprovalStep || 1}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  className="mt-4"
                />
              )}
            </div>
          ) : (
            /* 결재선 미설정 시 설정 버튼 표시 */
            isAdmin && currentRequest.status === 'pending' && (
              <div className="border border-dashed border-gray-300 rounded-xl p-6 text-center">
                <Users className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-3">아직 결재선이 설정되지 않았습니다</p>
                <button
                  onClick={() => setShowApprovalSetup(true)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  결재선 설정
                </button>
              </div>
            )
          )}

          {/* Content */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">상세 내용</label>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.content}</p>
            </div>
          </div>

          {/* Attachments */}
          {request.attachments.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2 flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                첨부파일 ({request.attachments.length})
              </label>
              <div className="space-y-2">
                {request.attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                  >
                    {file.type.startsWith('image/') ? (
                      <Image className="w-4 h-4 text-gray-500" />
                    ) : (
                      <FileText className="w-4 h-4 text-gray-500" />
                    )}
                    <span className="flex-1 text-sm truncate">{file.name}</span>
                    <a
                      href={file.url}
                      download={file.name}
                      className="p-1 text-gray-400 hover:text-blue-600"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2 flex items-center gap-2">
              <History className="w-4 h-4" />
              처리 이력
            </label>
            <div className="space-y-3">
              {request.history.map((item, idx) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                    {idx < request.history.length - 1 && (
                      <div className="absolute top-3 left-0.5 w-0.5 h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 pb-3">
                    <p className="text-sm font-medium text-gray-900">{item.action}</p>
                    <p className="text-xs text-gray-500">
                      {item.actor} • {format(new Date(item.timestamp), 'yyyy-MM-dd HH:mm', { locale: ko })}
                    </p>
                    {item.note && (
                      <p className="text-sm text-gray-600 mt-1">{item.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Actions */}
          {isAdmin && currentRequest.status !== 'completed' && currentRequest.status !== 'rejected' && (
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-sm font-medium text-gray-900">관리 기능</h3>

              {/* Assign */}
              {!currentRequest.assignee && (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedAssignee}
                    onChange={(e) => setSelectedAssignee(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="">담당자 선택</option>
                    {SAMPLE_ASSIGNEES.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.department})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssign}
                    disabled={!selectedAssignee}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    배정
                  </button>
                </div>
              )}

              {/* Status Change */}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="처리 메모 (선택)"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
                <div className="flex gap-2">
                  {currentRequest.status === 'pending' && !currentRequest.approvers && (
                    <>
                      <button
                        onClick={() => handleStatusChange('approved')}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => handleStatusChange('rejected')}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                      >
                        반려
                      </button>
                    </>
                  )}
                  {currentRequest.status === 'approved' && (
                    <button
                      onClick={() => handleStatusChange('in_progress')}
                      className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                    >
                      처리 시작
                    </button>
                  )}
                  {currentRequest.status === 'in_progress' && (
                    <button
                      onClick={() => handleStatusChange('completed')}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                    >
                      처리 완료
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 결재선 설정 모달 */}
      <ApprovalSetupModal
        isOpen={showApprovalSetup}
        onClose={() => setShowApprovalSetup(false)}
        onConfirm={handleApprovalSetup}
        initialApprovers={currentRequest.approvers || []}
      />
    </div>
  )
}
