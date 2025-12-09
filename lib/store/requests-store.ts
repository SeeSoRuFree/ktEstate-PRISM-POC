/**
 * 요청 상태 관리 스토어
 * LocalStorage에 persist하여 새로고침해도 데이터 유지
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Request, RequestStatus, CreateRequestInput, RequestFilter, ApproverInfo } from '@/types'

// 현재 사용자 (POC용 하드코딩)
const CURRENT_USER = {
  id: 'user-001',
  name: '홍길동',
  department: '디지털혁신팀',
}

// 샘플 담당자 목록
const SAMPLE_ASSIGNEES = [
  { id: 'assignee-001', name: '김철수', department: '시설관리팀', contact: '010-1234-5678' },
  { id: 'assignee-002', name: '이영희', department: 'IT운영팀', contact: '010-2345-6789' },
  { id: 'assignee-003', name: '박지성', department: '인사팀', contact: '010-3456-7890' },
]

// 고유 ID 생성
function generateRequestId(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `REQ-${year}-${random}`
}

interface RequestsState {
  requests: Request[]

  // 요청 추가
  addRequest: (input: CreateRequestInput) => Request

  // 상태 변경
  updateStatus: (id: string, status: RequestStatus, note?: string) => void

  // 담당자 배정
  assignRequest: (id: string, assigneeId: string) => void

  // 요청 삭제
  deleteRequest: (id: string) => void

  // 필터링된 요청 조회
  getFilteredRequests: (filter: RequestFilter) => Request[]

  // 내 요청 조회
  getMyRequests: () => Request[]

  // 요청 상세 조회
  getRequestById: (id: string) => Request | undefined

  // 통계
  getRequestStats: () => { total: number; pending: number; inProgress: number; completed: number }

  // 유사 요청 검색 (중복 감지용)
  findSimilarRequests: (title: string, content: string) => Request[]

  // 샘플 데이터 초기화 (개발용)
  initSampleData: () => void

  // 전체 초기화
  clearAll: () => void

  // 결재선 설정
  setApprovers: (id: string, approvers: ApproverInfo[]) => void

  // 결재 처리 (승인/반려)
  processApproval: (id: string, approverId: string, action: 'approve' | 'reject', note?: string) => void
}

export const useRequestsStore = create<RequestsState>()(
  persist(
    (set, get) => ({
      requests: [],

      addRequest: (input) => {
        const now = new Date().toISOString()
        const newRequest: Request = {
          id: generateRequestId(),
          title: input.title,
          content: input.content,
          systemId: input.systemId,
          systemName: input.systemName,
          moduleId: input.moduleId,
          moduleName: input.moduleName,
          requestType: input.requestType,
          status: 'pending',
          urgency: input.urgency,
          requester: CURRENT_USER,
          attachments: input.attachments || [],
          history: [
            {
              id: `hist-${Date.now()}`,
              timestamp: now,
              action: '요청 접수',
              actor: CURRENT_USER.name,
            },
          ],
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          requests: [newRequest, ...state.requests],
        }))

        return newRequest
      },

      updateStatus: (id, status, note) => {
        const now = new Date().toISOString()
        set((state) => ({
          requests: state.requests.map((req) => {
            if (req.id !== id) return req

            const actionLabels: Record<RequestStatus, string> = {
              pending: '대기 상태로 변경',
              approved: '승인',
              in_progress: '처리 시작',
              completed: '처리 완료',
              rejected: '반려',
            }

            return {
              ...req,
              status,
              updatedAt: now,
              completedAt: status === 'completed' ? now : req.completedAt,
              history: [
                ...req.history,
                {
                  id: `hist-${Date.now()}`,
                  timestamp: now,
                  action: actionLabels[status],
                  actor: req.assignee?.name || '시스템',
                  note,
                },
              ],
            }
          }),
        }))
      },

      assignRequest: (id, assigneeId) => {
        const assignee = SAMPLE_ASSIGNEES.find((a) => a.id === assigneeId)
        if (!assignee) return

        const now = new Date().toISOString()
        set((state) => ({
          requests: state.requests.map((req) => {
            if (req.id !== id) return req
            return {
              ...req,
              assignee,
              updatedAt: now,
              history: [
                ...req.history,
                {
                  id: `hist-${Date.now()}`,
                  timestamp: now,
                  action: `담당자 배정: ${assignee.name}`,
                  actor: '시스템',
                },
              ],
            }
          }),
        }))
      },

      deleteRequest: (id) => {
        set((state) => ({
          requests: state.requests.filter((req) => req.id !== id),
        }))
      },

      getFilteredRequests: (filter) => {
        const { requests } = get()
        return requests.filter((req) => {
          if (filter.status && filter.status !== 'all' && req.status !== filter.status) {
            return false
          }
          if (filter.systemId && req.systemId !== filter.systemId) {
            return false
          }
          if (filter.searchQuery) {
            const query = filter.searchQuery.toLowerCase()
            if (
              !req.title.toLowerCase().includes(query) &&
              !req.content.toLowerCase().includes(query)
            ) {
              return false
            }
          }
          return true
        })
      },

      getMyRequests: () => {
        const { requests } = get()
        return requests.filter((req) => req.requester.id === CURRENT_USER.id)
      },

      getRequestById: (id) => {
        const { requests } = get()
        return requests.find((req) => req.id === id)
      },

      getRequestStats: () => {
        const { requests } = get()
        return {
          total: requests.length,
          pending: requests.filter((r) => r.status === 'pending').length,
          inProgress: requests.filter((r) => r.status === 'in_progress' || r.status === 'approved').length,
          completed: requests.filter((r) => r.status === 'completed').length,
        }
      },

      findSimilarRequests: (title, content) => {
        const { requests } = get()
        const titleWords = title.toLowerCase().split(/\s+/)
        const contentWords = content.toLowerCase().split(/\s+/)
        const allWords = [...titleWords, ...contentWords]

        return requests
          .filter((req) => req.status !== 'completed' && req.status !== 'rejected')
          .map((req) => {
            const reqTitleWords = req.title.toLowerCase().split(/\s+/)
            const reqContentWords = req.content.toLowerCase().split(/\s+/)
            const reqAllWords = [...reqTitleWords, ...reqContentWords]

            // 단순 단어 매칭 기반 유사도 계산
            const matchCount = allWords.filter((word) =>
              reqAllWords.some((w) => w.includes(word) || word.includes(w))
            ).length
            const similarity = matchCount / Math.max(allWords.length, 1)

            return { request: req, similarity }
          })
          .filter(({ similarity }) => similarity > 0.3)
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 3)
          .map(({ request }) => request)
      },

      initSampleData: () => {
        const now = new Date()
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)

        const sampleRequests: Request[] = [
          {
            id: 'REQ-2024-001',
            title: '[ONE/FM] 3층 화장실 누수 긴급',
            content: '3층 남자 화장실에서 누수가 발생했습니다. 긴급 조치 부탁드립니다.',
            systemId: 'one',
            systemName: 'ONE 통합부동산관리',
            moduleId: 'one-fm',
            moduleName: 'FM관리',
            requestType: 'emergency',
            status: 'in_progress',
            urgency: 'critical',
            requester: CURRENT_USER,
            assignee: SAMPLE_ASSIGNEES[0],
            attachments: [],
            history: [
              { id: 'h1', timestamp: twoDaysAgo.toISOString(), action: '요청 접수', actor: CURRENT_USER.name },
              { id: 'h2', timestamp: yesterday.toISOString(), action: '담당자 배정: 김철수', actor: '시스템' },
              { id: 'h3', timestamp: yesterday.toISOString(), action: '처리 시작', actor: '김철수' },
            ],
            createdAt: twoDaysAgo.toISOString(),
            updatedAt: yesterday.toISOString(),
          },
          {
            id: 'REQ-2024-002',
            title: '[Portal/휴가] 연차 신청',
            content: '12월 15일 연차 신청합니다.',
            systemId: 'portal',
            systemName: '그룹웨어 Portal',
            moduleId: 'portal-leave',
            moduleName: '휴가관리',
            requestType: 'approval',
            status: 'completed',
            urgency: 'normal',
            requester: CURRENT_USER,
            assignee: SAMPLE_ASSIGNEES[2],
            attachments: [],
            history: [
              { id: 'h4', timestamp: twoDaysAgo.toISOString(), action: '요청 접수', actor: CURRENT_USER.name },
              { id: 'h5', timestamp: yesterday.toISOString(), action: '승인', actor: '박지성' },
              { id: 'h6', timestamp: now.toISOString(), action: '처리 완료', actor: '시스템' },
            ],
            createdAt: twoDaysAgo.toISOString(),
            updatedAt: now.toISOString(),
            completedAt: now.toISOString(),
          },
          {
            id: 'REQ-2024-003',
            title: '[OS/IT] PC 속도 저하 문제',
            content: '최근 PC가 많이 느려졌습니다. 점검 부탁드립니다.',
            systemId: 'os',
            systemName: '윈도우&OA',
            moduleId: 'os-support',
            moduleName: 'IT지원',
            requestType: 'maintenance',
            status: 'pending',
            urgency: 'normal',
            requester: CURRENT_USER,
            attachments: [],
            history: [
              { id: 'h7', timestamp: now.toISOString(), action: '요청 접수', actor: CURRENT_USER.name },
            ],
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
          },
        ]

        set({ requests: sampleRequests })
      },

      clearAll: () => {
        set({ requests: [] })
      },

      setApprovers: (id, approvers) => {
        const now = new Date().toISOString()
        set((state) => ({
          requests: state.requests.map((req) => {
            if (req.id !== id) return req
            return {
              ...req,
              approvers,
              currentApprovalStep: 1,
              updatedAt: now,
              history: [
                ...req.history,
                {
                  id: `hist-${Date.now()}`,
                  timestamp: now,
                  action: `결재선 설정: ${approvers.map((a) => a.name).join(' → ')}`,
                  actor: CURRENT_USER.name,
                },
              ],
            }
          }),
        }))
      },

      processApproval: (id, approverId, action, note) => {
        const now = new Date().toISOString()
        set((state) => ({
          requests: state.requests.map((req) => {
            if (req.id !== id || !req.approvers) return req

            const updatedApprovers = req.approvers.map((approver) => {
              if (approver.id !== approverId) return approver
              return {
                ...approver,
                status: action === 'approve' ? 'approved' : 'rejected',
                note,
                processedAt: now,
              } as ApproverInfo
            })

            // 현재 단계의 결재자가 승인했으면 다음 단계로
            const currentApprover = updatedApprovers.find((a) => a.order === req.currentApprovalStep)
            let nextStep = req.currentApprovalStep || 1
            let newStatus = req.status

            if (action === 'reject') {
              // 반려 시 요청 상태도 반려로
              newStatus = 'rejected'
            } else if (currentApprover?.status === 'approved') {
              // 다음 결재자가 있으면 단계 증가
              const hasNextApprover = updatedApprovers.some((a) => a.order === nextStep + 1)
              if (hasNextApprover) {
                nextStep += 1
              } else {
                // 모든 결재 완료 시 승인 상태로
                newStatus = 'approved'
              }
            }

            const approverName = req.approvers.find((a) => a.id === approverId)?.name || '결재자'

            return {
              ...req,
              approvers: updatedApprovers,
              currentApprovalStep: nextStep,
              status: newStatus,
              updatedAt: now,
              history: [
                ...req.history,
                {
                  id: `hist-${Date.now()}`,
                  timestamp: now,
                  action: action === 'approve' ? `${approverName} 결재 승인` : `${approverName} 결재 반려`,
                  actor: approverName,
                  note,
                },
              ],
            }
          }),
        }))
      },
    }),
    {
      name: 'kt-estate-requests',
      version: 1,
    }
  )
)

// 샘플 담당자 목록 export (컴포넌트에서 사용)
export { SAMPLE_ASSIGNEES, CURRENT_USER }
