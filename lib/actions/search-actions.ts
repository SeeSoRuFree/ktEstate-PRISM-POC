import { getAllActions } from './action-registry'
import type { ActionMeta, ActionSearchResult, GroupedActionResult } from '@/types'

// POC용 키워드 매핑 (8개 액션)
const ACTION_KEYWORDS: Record<string, string[]> = {
  'one-fm-emergency': [
    '긴급', '신고', '누수', '화장실', '3층', '화재', '정전', '침수',
    '비상', '급해', '지금', '당장', '물', '새', '고장', '안됨',
    '엘리베이터', '위험', '사고', '응급'
  ],
  'one-fm-maintenance': [
    '점검', '시설', '에어컨', '보일러', '수리', '정비', '관리',
    '조명', '전등', '난방', '냉방', '청소', '요청', '교체', '수선'
  ],
  'one-pm-lease': [
    '임대', '공실', '계약', '입주', '퇴거', '면적', '평', '층',
    '리마크빌', '건물', '사무실', '오피스'
  ],
  'portal-leave': [
    '휴가', '연차', '반차', '병가', '월요일', '다음주', '쉬고',
    '신청', '휴일', '연휴', '경조사', '특별휴가', '오전', '오후'
  ],
  'erp-expense': [
    '정산', '전표', '법인카드', '비용', '지출', '영수증', '카드',
    '출장비', '식대', '교통비', '경비', '금액'
  ],
  'os-it-support': [
    'IT', '컴퓨터', 'PC', '느려', '문제', '안됨', '프린터', '인터넷',
    '네트워크', '설치', '계정', '비밀번호', '느림', '노트북', '소프트웨어'
  ],
  'security-hdd': [
    '외장하드', '반출', '보안', 'USB', '저장장치', 'SSD', '데이터',
    '반납', '승인', '신청'
  ],
  'sios-alert': [
    '관제', '모니터링', '알림', '이상', 'CCTV', '센서', '화재감지',
    '침입', '전력', '엘리베이터', '경보'
  ],
}

const SYSTEM_INFO: Record<string, { name: string; icon: string }> = {
  'one': { name: 'ONE 통합부동산관리', icon: '🏢' },
  'portal': { name: '그룹웨어 Portal', icon: '📧' },
  'erp': { name: '전사적자원관리 ERP', icon: '💰' },
  'os': { name: '윈도우&OA', icon: '💻' },
  'security': { name: '보안', icon: '🔒' },
  'sios': { name: '통합관제 SIOS', icon: '📡' },
}

export function searchActions(query: string): ActionSearchResult[] {
  if (!query.trim()) return []

  const queryLower = query.toLowerCase()
  const queryKeywords = query.split(/\s+/).filter((k) => k.length > 0)
  const actions = getAllActions()
  const results: ActionSearchResult[] = []

  for (const action of actions) {
    const actionKeywords = ACTION_KEYWORDS[action.id] || []
    const matchedKeywords: string[] = []
    let score = 0

    // 액션 이름 매칭
    if (action.name.toLowerCase().includes(queryLower) || queryLower.includes(action.name.toLowerCase())) {
      score += 0.5
      matchedKeywords.push(action.name)
    }

    // 키워드 매칭
    for (const keyword of actionKeywords) {
      const keywordLower = keyword.toLowerCase()
      if (
        queryLower.includes(keywordLower) ||
        queryKeywords.some((qk) =>
          qk.includes(keywordLower) || keywordLower.includes(qk)
        )
      ) {
        score += 0.15
        if (!matchedKeywords.includes(keyword)) {
          matchedKeywords.push(keyword)
        }
      }
    }

    if (score > 0.1 || matchedKeywords.length > 0) {
      results.push({
        action,
        confidence: Math.min(score, 1),
        matchedKeywords,
      })
    }
  }

  results.sort((a, b) => b.confidence - a.confidence)
  return results
}

export function searchActionsGrouped(query: string): GroupedActionResult[] {
  const results = searchActions(query)
  const groups = new Map<string, GroupedActionResult>()

  for (const result of results) {
    const systemId = result.action.systemId
    if (!groups.has(systemId)) {
      const info = SYSTEM_INFO[systemId] || { name: systemId, icon: '📁' }
      groups.set(systemId, {
        system: { id: systemId, ...info },
        actions: [],
        maxConfidence: 0,
      })
    }

    const group = groups.get(systemId)!
    group.actions.push(result)
    group.maxConfidence = Math.max(group.maxConfidence, result.confidence)
  }

  const groupedResults = Array.from(groups.values())
  groupedResults.sort((a, b) => b.maxConfidence - a.maxConfidence)

  return groupedResults
}
