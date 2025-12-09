/**
 * 요청(Request) 관련 타입 정의
 * 통합 요청 관리 시스템에서 사용
 */

import type { RequestCategory } from './analysis'

// 요청 상태
export type RequestStatus =
  | 'pending'      // 대기중 (접수됨)
  | 'approved'     // 승인됨
  | 'in_progress'  // 처리중
  | 'completed'    // 완료
  | 'rejected'     // 반려됨

// 상태 레이블 매핑
export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  pending: '대기',
  approved: '승인',
  in_progress: '처리중',
  completed: '완료',
  rejected: '반려',
}

// 상태별 색상 (Tailwind 클래스)
export const REQUEST_STATUS_COLORS: Record<RequestStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

// 첨부파일 정보
export interface AttachmentInfo {
  id: string
  name: string
  size: number        // bytes
  type: string        // MIME type
  url: string         // data URL 또는 object URL
  uploadedAt: string  // ISO 날짜 문자열
}

// 처리 이력
export interface RequestHistory {
  id: string
  timestamp: string   // ISO 날짜 문자열
  action: string      // 예: '요청 접수', '승인', '처리 시작', '완료'
  actor: string       // 수행자 (이름 또는 시스템)
  note?: string       // 추가 메모
}

// 담당자 정보
export interface AssigneeInfo {
  id: string
  name: string
  department?: string
  contact?: string
}

// 결재 상태
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

// 결재자 정보
export interface ApproverInfo {
  id: string
  name: string
  department: string
  position: string              // 직급
  order: number                 // 결재 순서 (1, 2, 3)
  status: ApprovalStatus        // 결재 상태
  note?: string                 // 결재 의견
  processedAt?: string          // 결재 처리 시각 (ISO 날짜 문자열)
}

// 샘플 결재자 목록
export const SAMPLE_APPROVERS: Omit<ApproverInfo, 'order' | 'status'>[] = [
  { id: 'approver-1', name: '김팀장', department: 'IT운영팀', position: '팀장' },
  { id: 'approver-2', name: '박부장', department: 'IT운영본부', position: '부장' },
  { id: 'approver-3', name: '이상무', department: '경영지원실', position: '상무' },
  { id: 'approver-4', name: '최과장', department: 'IT운영팀', position: '과장' },
  { id: 'approver-5', name: '정대리', department: 'IT운영팀', position: '대리' },
]

// 요청 엔티티
export interface Request {
  id: string                      // 고유 ID (예: REQ-2024-001)
  title: string                   // 요청 제목
  content: string                 // 상세 내용

  // 분류 정보
  systemId: string                // 시스템 ID
  systemName: string              // 시스템 이름
  moduleId?: string               // 모듈 ID (선택)
  moduleName?: string             // 모듈 이름 (선택)
  requestType: RequestCategory    // 요청 유형

  // 상태 정보
  status: RequestStatus           // 현재 상태
  urgency: 'low' | 'normal' | 'high' | 'critical'  // 긴급도

  // 담당자 정보
  requester: {                    // 요청자
    id: string
    name: string
    department?: string
  }
  assignee?: AssigneeInfo         // 처리 담당자

  // 첨부 및 이력
  attachments: AttachmentInfo[]   // 첨부파일 목록
  history: RequestHistory[]       // 처리 이력

  // 결재 정보
  approvers?: ApproverInfo[]      // 결재선
  currentApprovalStep?: number    // 현재 결재 단계 (1부터 시작)

  // AI 분석 정보
  aiAnalysis?: {
    confidence: number            // 전체 신뢰도
    suggestedTitle: string        // AI 추천 제목
    matchedKeywords: string[]     // 매칭된 키워드
    impact?: {                    // 영향도 분석
      affectedSystems: string[]
      riskLevel: 'low' | 'medium' | 'high'
      message: string
    }
    similarRequests?: {           // 중복 감지
      id: string
      title: string
      status: RequestStatus
      similarity: number
    }[]
    estimatedTime?: string        // 예상 처리 시간
  }

  // 타임스탬프
  createdAt: string               // ISO 날짜 문자열
  updatedAt: string               // ISO 날짜 문자열
  completedAt?: string            // 완료 시각
}

// 요청 생성 시 입력 데이터
export interface CreateRequestInput {
  title: string
  content: string
  systemId: string
  systemName: string
  moduleId?: string
  moduleName?: string
  requestType: RequestCategory
  urgency: 'low' | 'normal' | 'high' | 'critical'
  attachments?: AttachmentInfo[]
}

// 요청 목록 필터
export interface RequestFilter {
  status?: RequestStatus | 'all'
  systemId?: string
  dateRange?: {
    from: string
    to: string
  }
  searchQuery?: string
}
