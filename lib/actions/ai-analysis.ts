/**
 * AI 분석 로직
 * 사용자 자연어 입력을 분석하여 시스템/모듈/유형을 자동 감지하고 제목을 생성
 */

import type {
  AIAnalysisResult,
  SystemDetection,
  ModuleDetection,
  RequestTypeDetection,
  RequestCategory,
  SuggestedFieldValue,
} from '@/types'

// 시스템 감지용 키워드 (KT Estate 19개 시스템 기반)
const SYSTEM_KEYWORDS: Record<string, { name: string; keywords: string[] }> = {
  one: {
    name: 'ONE 통합부동산관리',
    keywords: [
      'ONE', '부동산', '임대', 'FM', 'PM', '시설', '자산', '건물',
      '임대료', '정산', '공실', '관리비', '계약', '입주', '퇴거',
      '유지보수', '보일러', '에어컨', '누수', '고장', '수리',
    ],
  },
  portal: {
    name: '그룹웨어 Portal',
    keywords: [
      '그룹웨어', '포탈', 'Portal', '휴가', '연차', '반차', '병가',
      '결재', '메일', '일정', '근태', '출퇴근', '전자결재',
    ],
  },
  erp: {
    name: '전사적자원관리 ERP',
    keywords: [
      'ERP', '전표', '예산', '정산', '법인카드', '경비', '회계',
      '비용', '지출', '영수증', '출장비', '식대', '교통비', '재무',
    ],
  },
  os: {
    name: '윈도우&OA',
    keywords: [
      'PC', '컴퓨터', 'IT', '프린터', '네트워크', '설치', '윈도우',
      'OA', '노트북', '소프트웨어', '계정', '비밀번호', '느려', '느림',
      '인터넷', '와이파이', 'WiFi',
    ],
  },
  security: {
    name: '보안',
    keywords: [
      '보안', '외장하드', 'USB', '반출', '반입', '저장장치', 'SSD',
      '데이터', '보안솔루션', '승인',
    ],
  },
  sios: {
    name: '통합관제 SIOS',
    keywords: [
      '관제', 'CCTV', '센서', '모니터링', '화재감지', '침입', '전력',
      '엘리베이터', '경보', '알림', '이상',
    ],
  },
  eps: {
    name: '전자조달 EPS',
    keywords: ['조달', '구매', '발주', '입찰', '계약', '납품'],
  },
  bis: {
    name: '경영정보 BIS',
    keywords: ['BI', '리포트', '대시보드', '분석', '경영', '통계'],
  },
}

// ONE 시스템 모듈 키워드
const ONE_MODULE_KEYWORDS: Record<string, { name: string; keywords: string[] }> = {
  'one-fm': {
    name: 'FM관리',
    keywords: [
      'FM', '시설', '유지보수', '누수', '고장', '수리', '점검',
      '에어컨', '보일러', '전등', '청소', '긴급',
    ],
  },
  'one-pm': {
    name: '자산운영',
    keywords: [
      'PM', '자산', '임대', '공실', '계약', '입주', '퇴거',
      '임대료', '관리비', '면적',
    ],
  },
  'one-fi': {
    name: '전표/예산',
    keywords: ['전표', '예산', '정산', '부가세', '회계', '비용'],
  },
  'one-ps': {
    name: '개발사업',
    keywords: ['개발', '프로젝트', '사업', '착공', '준공'],
  },
  'one-bi': {
    name: '경영정보',
    keywords: ['BI', '리포트', '현황', '통계', '분석'],
  },
  'one-sm': {
    name: '공통/업무결재',
    keywords: ['결재', '승인', '워크플로우', '공통'],
  },
  'one-vc': {
    name: 'VOC',
    keywords: ['VOC', '민원', '고객', '의견', '불만'],
  },
}

// 요청 유형 키워드
const REQUEST_TYPE_KEYWORDS: Record<RequestCategory, { label: string; keywords: string[] }> = {
  bug_fix: {
    label: '오류 수정',
    keywords: [
      '오류', '버그', '틀려', '틀림', '안됨', '안돼', '에러', '문제',
      '수정', '잘못', '이상', '오작동', '맞지 않',
    ],
  },
  feature_request: {
    label: '기능 요청',
    keywords: [
      '기능', '추가', '개선', '새로운', '했으면', '되면', '좋겠',
      '변경', '수정 요청', '업그레이드',
    ],
  },
  inquiry: {
    label: '문의',
    keywords: [
      '문의', '어떻게', '방법', '확인', '조회', '알고 싶', '궁금',
      '질문', '알려',
    ],
  },
  emergency: {
    label: '긴급',
    keywords: [
      '긴급', '누수', '화재', '정전', '당장', '급해', '지금', '바로',
      '위험', '사고', '응급', '비상',
    ],
  },
  maintenance: {
    label: '점검/유지보수',
    keywords: [
      '점검', '유지보수', '청소', '교체', '정비', '관리', '수리',
      '보수', '정기',
    ],
  },
  approval: {
    label: '승인 요청',
    keywords: ['승인', '신청', '요청', '허가', '결재', '반출'],
  },
  general: {
    label: '일반',
    keywords: [],
  },
}

/**
 * 시스템 감지
 */
function detectSystem(query: string): SystemDetection {
  const queryLower = query.toLowerCase()
  let bestMatch: SystemDetection = { id: 'one', name: 'ONE 통합부동산관리', confidence: 0.3 }
  let maxScore = 0

  for (const [systemId, { name, keywords }] of Object.entries(SYSTEM_KEYWORDS)) {
    let score = 0
    for (const keyword of keywords) {
      if (queryLower.includes(keyword.toLowerCase())) {
        // 긴 키워드일수록 더 높은 점수
        score += 0.15 + keyword.length * 0.02
      }
    }

    if (score > maxScore) {
      maxScore = score
      bestMatch = {
        id: systemId,
        name,
        confidence: Math.min(score, 1),
      }
    }
  }

  return bestMatch
}

/**
 * 모듈 감지 (ONE 시스템 전용)
 */
function detectModule(query: string, systemId: string): ModuleDetection | null {
  if (systemId !== 'one') return null

  const queryLower = query.toLowerCase()
  let bestMatch: ModuleDetection | null = null
  let maxScore = 0

  for (const [moduleId, { name, keywords }] of Object.entries(ONE_MODULE_KEYWORDS)) {
    let score = 0
    for (const keyword of keywords) {
      if (queryLower.includes(keyword.toLowerCase())) {
        score += 0.2 + keyword.length * 0.02
      }
    }

    if (score > maxScore) {
      maxScore = score
      bestMatch = {
        id: moduleId,
        name,
        confidence: Math.min(score, 1),
      }
    }
  }

  return bestMatch
}

/**
 * 요청 유형 감지
 */
function detectRequestType(query: string): RequestTypeDetection {
  const queryLower = query.toLowerCase()
  let bestMatch: RequestTypeDetection = {
    category: 'general',
    label: '일반',
    confidence: 0.3,
  }
  let maxScore = 0

  for (const [category, { label, keywords }] of Object.entries(REQUEST_TYPE_KEYWORDS)) {
    let score = 0
    for (const keyword of keywords) {
      if (queryLower.includes(keyword.toLowerCase())) {
        score += 0.25
      }
    }

    if (score > maxScore) {
      maxScore = score
      bestMatch = {
        category: category as RequestCategory,
        label,
        confidence: Math.min(score, 1),
      }
    }
  }

  return bestMatch
}

/**
 * 매칭된 키워드 추출
 */
function extractMatchedKeywords(query: string): string[] {
  const queryLower = query.toLowerCase()
  const matched: string[] = []

  // 시스템 키워드
  for (const { keywords } of Object.values(SYSTEM_KEYWORDS)) {
    for (const keyword of keywords) {
      if (queryLower.includes(keyword.toLowerCase()) && !matched.includes(keyword)) {
        matched.push(keyword)
      }
    }
  }

  // 모듈 키워드
  for (const { keywords } of Object.values(ONE_MODULE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (queryLower.includes(keyword.toLowerCase()) && !matched.includes(keyword)) {
        matched.push(keyword)
      }
    }
  }

  // 요청 유형 키워드
  for (const { keywords } of Object.values(REQUEST_TYPE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (queryLower.includes(keyword.toLowerCase()) && !matched.includes(keyword)) {
        matched.push(keyword)
      }
    }
  }

  return matched.slice(0, 5) // 최대 5개
}

/**
 * 제목 자동 생성
 */
function generateTitle(
  query: string,
  system: SystemDetection,
  module: ModuleDetection | null,
  requestType: RequestTypeDetection
): string {
  // 시스템/모듈 코드 추출
  const systemCode = system.id.toUpperCase()
  const moduleCode = module?.id.replace('one-', '').toUpperCase() || ''

  // 핵심 내용 추출 (간략화)
  let content = query
    .replace(/ONE 시스템|ONE|시스템/gi, '')
    .replace(/쪽에서|관련해서|관련/gi, '')
    .replace(/할 때|할때/gi, ' ')
    .replace(/요청|신청|문의/gi, '')
    .trim()

  // 50자 이내로 자르기
  if (content.length > 50) {
    content = content.substring(0, 47) + '...'
  }

  // 제목 포맷 생성
  const prefix = moduleCode ? `[${systemCode}/${moduleCode}]` : `[${systemCode}]`
  const suffix = requestType.label !== '일반' ? ` ${requestType.label}` : ''

  return `${prefix} ${content}${suffix}`
}

/**
 * 필드 자동 채움 값 추출
 */
function extractSuggestedFields(query: string): Record<string, SuggestedFieldValue> {
  const fields: Record<string, SuggestedFieldValue> = {}

  // 상황/내용 필드
  fields['situation'] = {
    value: query,
    confidence: 1,
    source: 'context',
  }

  // 위치 추출 (층, 화장실 등)
  const floorMatch = query.match(/(\d+)층/)
  if (floorMatch) {
    fields['location_floor'] = {
      value: floorMatch[1] + '층',
      confidence: 0.95,
      source: 'pattern',
    }
  }

  const locationKeywords = ['화장실', '사무실', '회의실', '로비', '주차장', '복도', '엘리베이터']
  for (const loc of locationKeywords) {
    if (query.includes(loc)) {
      fields['location_detail'] = {
        value: loc,
        confidence: 0.9,
        source: 'keyword',
      }
      break
    }
  }

  // 긴급도 추출
  if (query.match(/긴급|급해|당장|지금|바로|위험|사고/)) {
    fields['urgency'] = {
      value: 'critical',
      confidence: 0.9,
      source: 'keyword',
    }
  } else if (query.match(/빨리|가능한 빨리|ASAP/i)) {
    fields['urgency'] = {
      value: 'high',
      confidence: 0.8,
      source: 'keyword',
    }
  }

  return fields
}

/**
 * 메인 분석 함수
 * 사용자 입력을 받아 AI 분석 결과를 반환
 */
export function analyzeUserInput(query: string): AIAnalysisResult | null {
  if (!query || query.trim().length < 3) {
    return null
  }

  const system = detectSystem(query)
  const module = detectModule(query, system.id)
  const requestType = detectRequestType(query)
  const matchedKeywords = extractMatchedKeywords(query)
  const suggestedFields = extractSuggestedFields(query)
  const generatedTitle = generateTitle(query, system, module, requestType)

  // 전체 신뢰도 계산 (가중 평균)
  const overallConfidence = (
    system.confidence * 0.4 +
    (module?.confidence || 0) * 0.3 +
    requestType.confidence * 0.3
  )

  return {
    originalQuery: query,
    system,
    module,
    requestType,
    generatedTitle,
    suggestedFields,
    overallConfidence: Math.min(overallConfidence, 1),
    matchedKeywords,
  }
}

/**
 * 높은 신뢰도인지 확인
 */
export function hasHighConfidence(analysis: AIAnalysisResult | null): boolean {
  return analysis !== null && analysis.overallConfidence >= 0.5
}

// ============================================================
// 고급 AI 분석 기능 (Phase 2)
// ============================================================

// 시스템 간 연관관계 정의 (영향도 분석용)
const SYSTEM_DEPENDENCIES: Record<string, { related: string[]; description: string }> = {
  one: {
    related: ['sios', 'erp', 'portal'],
    description: 'ONE 시스템은 관제(SIOS), ERP, 그룹웨어와 연동됩니다',
  },
  portal: {
    related: ['erp', 'security'],
    description: 'Portal은 ERP 결재 및 보안 시스템과 연동됩니다',
  },
  erp: {
    related: ['portal', 'one'],
    description: 'ERP는 그룹웨어 결재 및 ONE 정산과 연동됩니다',
  },
  security: {
    related: ['portal', 'sios'],
    description: '보안 시스템은 그룹웨어 승인 및 관제와 연동됩니다',
  },
  sios: {
    related: ['one', 'security'],
    description: '관제 시스템은 ONE FM관리 및 보안과 연동됩니다',
  },
  os: {
    related: ['security', 'portal'],
    description: 'IT 시스템은 보안 및 그룹웨어 계정과 연동됩니다',
  },
}

// 요청 유형별 예상 처리 시간
const ESTIMATED_PROCESSING_TIME: Record<RequestCategory, { min: string; max: string; avg: string }> = {
  emergency: { min: '30분', max: '2시간', avg: '약 1시간' },
  bug_fix: { min: '1일', max: '5일', avg: '약 2-3일' },
  feature_request: { min: '1주', max: '1개월', avg: '약 2주' },
  inquiry: { min: '1시간', max: '1일', avg: '약 4시간' },
  maintenance: { min: '2시간', max: '1일', avg: '약 4시간' },
  approval: { min: '1시간', max: '3일', avg: '약 1일' },
  general: { min: '1일', max: '1주', avg: '약 3일' },
}

// 긴급도별 처리 시간 가중치
const URGENCY_TIME_MULTIPLIER: Record<string, number> = {
  critical: 0.3,
  high: 0.6,
  normal: 1.0,
  low: 1.5,
}

/**
 * 영향도 분석 결과 타입
 */
export interface ImpactAnalysisResult {
  affectedSystems: Array<{ id: string; name: string; reason: string }>
  riskLevel: 'low' | 'medium' | 'high'
  message: string
  recommendations: string[]
}

/**
 * 예상 처리 시간 결과 타입
 */
export interface ProcessingTimeEstimate {
  estimate: string
  range: { min: string; max: string }
  factors: string[]
}

/**
 * 영향도 분석
 * 요청이 다른 시스템에 미치는 영향을 분석
 */
export function analyzeImpact(
  systemId: string,
  requestType: RequestCategory,
  query: string
): ImpactAnalysisResult {
  const deps = SYSTEM_DEPENDENCIES[systemId]
  const affectedSystems: Array<{ id: string; name: string; reason: string }> = []
  const recommendations: string[] = []

  if (deps) {
    for (const relatedId of deps.related) {
      const relatedSystem = SYSTEM_KEYWORDS[relatedId]
      if (relatedSystem) {
        // 키워드 매칭으로 연관성 확인
        const queryLower = query.toLowerCase()
        const hasRelatedKeyword = relatedSystem.keywords.some(
          (kw) => queryLower.includes(kw.toLowerCase())
        )

        if (hasRelatedKeyword || requestType === 'feature_request' || requestType === 'bug_fix') {
          affectedSystems.push({
            id: relatedId,
            name: relatedSystem.name,
            reason: `${SYSTEM_KEYWORDS[systemId]?.name || systemId}와(과) 연동되어 영향 가능`,
          })
        }
      }
    }
  }

  // 위험 수준 결정
  let riskLevel: 'low' | 'medium' | 'high' = 'low'
  if (affectedSystems.length >= 3 || requestType === 'emergency') {
    riskLevel = 'high'
  } else if (affectedSystems.length >= 1 || requestType === 'bug_fix') {
    riskLevel = 'medium'
  }

  // 메시지 생성
  let message = ''
  if (affectedSystems.length === 0) {
    message = '이 요청은 다른 시스템에 영향을 주지 않을 것으로 예상됩니다.'
  } else if (affectedSystems.length === 1) {
    message = `이 요청은 ${affectedSystems[0].name}에도 영향을 줄 수 있습니다.`
  } else {
    message = `이 요청은 ${affectedSystems.map((s) => s.name).join(', ')} 등 ${affectedSystems.length}개 시스템에 영향을 줄 수 있습니다.`
  }

  // 권장 사항 생성
  if (riskLevel === 'high') {
    recommendations.push('관련 시스템 담당자를 참조자로 추가하세요.')
    recommendations.push('변경 전 영향 범위를 한 번 더 검토하세요.')
  }
  if (requestType === 'feature_request' || requestType === 'bug_fix') {
    recommendations.push('테스트 환경에서 먼저 검증하는 것을 권장합니다.')
  }

  return {
    affectedSystems,
    riskLevel,
    message,
    recommendations,
  }
}

/**
 * 예상 처리 시간 계산
 */
export function estimateProcessingTime(
  requestType: RequestCategory,
  urgency: 'low' | 'normal' | 'high' | 'critical' = 'normal'
): ProcessingTimeEstimate {
  const baseTime = ESTIMATED_PROCESSING_TIME[requestType] || ESTIMATED_PROCESSING_TIME.general
  const multiplier = URGENCY_TIME_MULTIPLIER[urgency] || 1.0

  const factors: string[] = []

  // 긴급도에 따른 설명
  if (urgency === 'critical') {
    factors.push('긴급 요청으로 우선 처리됩니다')
  } else if (urgency === 'high') {
    factors.push('높은 우선순위로 처리됩니다')
  }

  // 요청 유형에 따른 설명
  if (requestType === 'emergency') {
    factors.push('긴급 신고는 즉시 담당자에게 전달됩니다')
  } else if (requestType === 'approval') {
    factors.push('승인 요청은 결재선에 따라 처리 시간이 달라질 수 있습니다')
  }

  // 처리 시간 조정 (긴급도 반영)
  let estimate = baseTime.avg
  if (multiplier < 1) {
    estimate = `${baseTime.min} ~ ${baseTime.avg}`
  } else if (multiplier > 1) {
    estimate = `${baseTime.avg} ~ ${baseTime.max}`
  }

  return {
    estimate,
    range: { min: baseTime.min, max: baseTime.max },
    factors,
  }
}

/**
 * 확장된 AI 분석 결과 (영향도, 처리시간 포함)
 */
export interface ExtendedAIAnalysisResult {
  base: AIAnalysisResult
  impact: ImpactAnalysisResult
  processingTime: ProcessingTimeEstimate
}

/**
 * 확장된 사용자 입력 분석
 * 기본 분석 + 영향도 + 예상 처리시간
 */
export function analyzeUserInputExtended(
  query: string,
  urgency: 'low' | 'normal' | 'high' | 'critical' = 'normal'
): ExtendedAIAnalysisResult | null {
  const baseAnalysis = analyzeUserInput(query)
  if (!baseAnalysis) return null

  // 긴급도 자동 감지 (필드에서 추출했다면 사용)
  const detectedUrgency =
    (baseAnalysis.suggestedFields['urgency']?.value as typeof urgency) || urgency

  const impact = analyzeImpact(
    baseAnalysis.system.id,
    baseAnalysis.requestType.category,
    query
  )

  const processingTime = estimateProcessingTime(
    baseAnalysis.requestType.category,
    detectedUrgency
  )

  return {
    base: baseAnalysis,
    impact,
    processingTime,
  }
}

// SYSTEM_KEYWORDS를 외부에서 사용할 수 있도록 export
export { SYSTEM_KEYWORDS, ONE_MODULE_KEYWORDS }
