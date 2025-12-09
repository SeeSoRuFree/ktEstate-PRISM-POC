'use client'

import { useState } from 'react'
import { X, Plus, Trash2, GripVertical, Users, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ApproverInfo } from '@/types'
import { SAMPLE_APPROVERS } from '@/types'

interface ApprovalSetupModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (approvers: ApproverInfo[]) => void
  initialApprovers?: ApproverInfo[]
}

export function ApprovalSetupModal({
  isOpen,
  onClose,
  onConfirm,
  initialApprovers = [],
}: ApprovalSetupModalProps) {
  const [selectedApprovers, setSelectedApprovers] = useState<ApproverInfo[]>(initialApprovers)
  const [searchQuery, setSearchQuery] = useState('')

  if (!isOpen) return null

  const filteredApprovers = SAMPLE_APPROVERS.filter((approver) => {
    const isAlreadySelected = selectedApprovers.some((s) => s.id === approver.id)
    if (isAlreadySelected) return false

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        approver.name.toLowerCase().includes(query) ||
        approver.department.toLowerCase().includes(query) ||
        approver.position.toLowerCase().includes(query)
      )
    }
    return true
  })

  const addApprover = (approver: typeof SAMPLE_APPROVERS[0]) => {
    const newApprover: ApproverInfo = {
      ...approver,
      order: selectedApprovers.length + 1,
      status: 'pending',
    }
    setSelectedApprovers([...selectedApprovers, newApprover])
  }

  const removeApprover = (id: string) => {
    const filtered = selectedApprovers.filter((a) => a.id !== id)
    // 순서 재정렬
    const reordered = filtered.map((a, idx) => ({ ...a, order: idx + 1 }))
    setSelectedApprovers(reordered)
  }

  const moveApprover = (fromIndex: number, toIndex: number) => {
    const items = [...selectedApprovers]
    const [removed] = items.splice(fromIndex, 1)
    items.splice(toIndex, 0, removed)
    // 순서 재정렬
    const reordered = items.map((a, idx) => ({ ...a, order: idx + 1 }))
    setSelectedApprovers(reordered)
  }

  const handleConfirm = () => {
    if (selectedApprovers.length > 0) {
      onConfirm(selectedApprovers)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">결재선 설정</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* 결재자 선택 영역 */}
          <div className="w-1/2 border-r flex flex-col">
            <div className="p-3 border-b bg-gray-50">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="이름, 부서, 직급 검색..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <p className="text-xs font-medium text-gray-500 mb-2">결재자 선택</p>
              <div className="space-y-1">
                {filteredApprovers.map((approver) => (
                  <button
                    key={approver.id}
                    onClick={() => addApprover(approver)}
                    className="w-full flex items-center justify-between p-2 text-left rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{approver.name}</p>
                      <p className="text-xs text-gray-500">
                        {approver.department} / {approver.position}
                      </p>
                    </div>
                    <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                  </button>
                ))}
                {filteredApprovers.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">
                    {searchQuery ? '검색 결과가 없습니다' : '모든 결재자가 선택되었습니다'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 선택된 결재선 영역 */}
          <div className="w-1/2 flex flex-col">
            <div className="p-3 border-b bg-gray-50">
              <p className="text-sm font-medium text-gray-700">
                결재선 ({selectedApprovers.length}명)
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {selectedApprovers.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">좌측에서 결재자를 선택하세요</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedApprovers.map((approver, index) => (
                    <div key={approver.id} className="flex items-center gap-2">
                      <div
                        className="flex-1 flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100"
                      >
                        <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">
                          {approver.order}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {approver.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {approver.department} / {approver.position}
                          </p>
                        </div>
                        <button
                          onClick={() => removeApprover(approver.id)}
                          className="p-1 hover:bg-white rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                      {index < selectedApprovers.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 결재 흐름 미리보기 */}
            {selectedApprovers.length > 0 && (
              <div className="p-3 border-t bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">결재 흐름</p>
                <p className="text-sm text-gray-700">
                  {selectedApprovers.map((a) => a.name).join(' → ')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedApprovers.length === 0}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              selectedApprovers.length > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            결재선 설정 완료
          </button>
        </div>
      </div>
    </div>
  )
}
