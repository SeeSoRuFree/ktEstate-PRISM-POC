/**
 * AI 분석 결과 관련 타입 정의
 * Smart Request Form 기능에서 사용
 */

// 요청 유형 카테고리
export type RequestCategory =
  | 'bug_fix'           // 오류 수정
  | 'feature_request'   // 기능 요청
  | 'inquiry'           // 문의
  | 'emergency'         // 긴급
  | 'maintenance'       // 점검/유지보수
  | 'approval'          // 승인 요청
  | 'general'           // 일반

// 요청 유형 레이블 매핑
export const REQUEST_CATEGORY_LABELS: Record<RequestCategory, string> = {
  bug_fix: '오류 수정',
  feature_request: '기능 요청',
  inquiry: '문의',
  emergency: '긴급',
  maintenance: '점검/유지보수',
  approval: '승인 요청',
  general: '일반',
}

// 시스템 감지 결과
export interface SystemDetection {
  id: string
  name: string
  confidence: number // 0-1
}

// 모듈 감지 결과
export interface ModuleDetection {
  id: string
  name: string
  confidence: number // 0-1
}

// 요청 유형 감지 결과
export interface RequestTypeDetection {
  category: RequestCategory
  label: string
  confidence: number // 0-1
}

// AI 분석 전체 결과
export interface AIAnalysisResult {
  originalQuery: string
  system: SystemDetection
  module: ModuleDetection | null
  requestType: RequestTypeDetection
  generatedTitle: string
  suggestedFields: Record<string, SuggestedFieldValue>
  overallConfidence: number // 0-1
  matchedKeywords: string[]
}

// 자동 채움 필드 값
export interface SuggestedFieldValue {
  value: string
  confidence: number // 0-1
  source: 'keyword' | 'pattern' | 'context' // 값이 어디서 추출되었는지
}

// AI 분석 결과를 포함한 검색 결과 (확장)
export interface SearchResultWithAnalysis {
  aiAnalysis: AIAnalysisResult | null
  hasHighConfidence: boolean // overallConfidence > 0.7
}
