import type { ActionMeta, ActionField } from '@/types'

const POC_ACTIONS: ActionMeta[] = [
  // 1. ONE-FM 긴급 신고
  {
    id: 'one-fm-emergency',
    systemId: 'one',
    moduleId: 'one-fm',
    name: 'FM 긴급 신고',
    icon: '🚨',
    description: '시설 긴급 상황 신고 (누수, 정전, 화재 등)',
    category: 'facility_emergency',
    processType: 'direct',
    fields: [
      { id: 'location', name: '위치', type: 'text', required: true, placeholder: '예: 3층 남자화장실', aiAutoFill: true },
      { id: 'situation', name: '상황', type: 'select', required: true, options: [
        { value: 'leak', label: '누수' },
        { value: 'blackout', label: '정전' },
        { value: 'fire', label: '화재' },
        { value: 'flood', label: '침수' },
        { value: 'elevator', label: '엘리베이터 고장' },
        { value: 'other', label: '기타' },
      ], aiAutoFill: true },
      { id: 'urgency', name: '긴급도', type: 'urgency', required: true, aiAutoFill: true },
      { id: 'description', name: '상세 내용', type: 'textarea', required: false, placeholder: '상황을 자세히 설명해주세요', aiAutoFill: true },
    ],
    copilotHints: {
      suggestedActions: ['긴급 신고 접수', '담당자 자동 배정', 'SMS 알림 발송'],
      relatedInfo: ['3층 담당: 김철수', '최근 유사 건: 2건', '평균 처리 시간: 30분'],
      estimatedTime: '30분 ~ 1시간',
    },
  },
  // 2. ONE-FM 시설 점검
  {
    id: 'one-fm-maintenance',
    systemId: 'one',
    moduleId: 'one-fm',
    name: 'FM 시설 점검 요청',
    icon: '🔧',
    description: '에어컨, 보일러, 청소 등 일반 시설 점검 요청',
    category: 'facility_management',
    processType: 'assignment',
    fields: [
      { id: 'location', name: '위치', type: 'text', required: true, placeholder: '예: 5층 회의실', aiAutoFill: true },
      { id: 'category', name: '점검 유형', type: 'select', required: true, options: [
        { value: 'aircon', label: '에어컨/냉난방' },
        { value: 'boiler', label: '보일러/난방' },
        { value: 'light', label: '조명/전등' },
        { value: 'cleaning', label: '청소' },
        { value: 'repair', label: '일반 수리' },
        { value: 'other', label: '기타' },
      ], aiAutoFill: true },
      { id: 'urgency', name: '긴급도', type: 'urgency', required: true },
      { id: 'preferredDate', name: '희망 점검일', type: 'date', required: false },
      { id: 'description', name: '상세 내용', type: 'textarea', required: false, aiAutoFill: true },
    ],
    copilotHints: {
      suggestedActions: ['점검 요청 등록', '담당자 배정', '일정 조율'],
      relatedInfo: ['담당 협력사: FM서비스', '금주 점검 가능일: 수, 목'],
      estimatedTime: '1~2일 내 방문',
    },
  },
  // 3. ONE-PM 임대 문의
  {
    id: 'one-pm-lease',
    systemId: 'one',
    moduleId: 'one-pm',
    name: 'PM 임대/공실 문의',
    icon: '🏢',
    description: '공실 현황 조회 및 임대 관련 문의',
    category: 'facility_management',
    processType: 'direct',
    fields: [
      { id: 'building', name: '건물', type: 'select', required: true, options: [
        { value: 'gangnam', label: '강남 리마크빌' },
        { value: 'yeouido', label: '여의도 리마크빌' },
        { value: 'jongno', label: '종로 리마크빌' },
        { value: 'pangyo', label: '판교 리마크빌' },
      ] },
      { id: 'inquiryType', name: '문의 유형', type: 'select', required: true, options: [
        { value: 'vacancy', label: '공실 현황' },
        { value: 'contract', label: '계약 관련' },
        { value: 'movein', label: '입주 문의' },
        { value: 'other', label: '기타' },
      ], aiAutoFill: true },
      { id: 'desiredSize', name: '희망 면적', type: 'text', required: false, placeholder: '예: 100평' },
      { id: 'description', name: '문의 내용', type: 'textarea', required: false },
    ],
    copilotHints: {
      suggestedActions: ['공실 현황 조회', 'PM 담당자 연결'],
      relatedInfo: ['현재 공실: 강남 3개, 여의도 1개', '금월 계약 예정: 2건'],
    },
  },
  // 4. Portal 휴가 신청
  {
    id: 'portal-leave',
    systemId: 'portal',
    moduleId: 'portal-leave',
    name: '휴가 신청',
    icon: '🏖️',
    description: '연차, 반차, 병가 등 휴가 신청',
    category: 'hr_request',
    processType: 'approval-required',
    fields: [
      { id: 'leaveType', name: '휴가 유형', type: 'select', required: true, options: [
        { value: 'annual', label: '연차' },
        { value: 'half-am', label: '오전 반차' },
        { value: 'half-pm', label: '오후 반차' },
        { value: 'sick', label: '병가' },
        { value: 'family', label: '경조사' },
        { value: 'special', label: '특별휴가' },
      ], aiAutoFill: true },
      { id: 'startDate', name: '시작일', type: 'date', required: true, aiAutoFill: true },
      { id: 'endDate', name: '종료일', type: 'date', required: true, aiAutoFill: true },
      { id: 'reason', name: '사유', type: 'textarea', required: false },
    ],
    copilotHints: {
      suggestedActions: ['휴가 신청', '승인자에게 알림'],
      relatedInfo: ['잔여 연차: 12일', '승인자: 홍팀장', '예상 승인 시간: 1일 내'],
      estimatedTime: '승인 후 즉시 반영',
    },
  },
  // 5. ERP 경비 정산
  {
    id: 'erp-expense',
    systemId: 'erp',
    moduleId: 'erp-expense',
    name: '경비 정산',
    icon: '💳',
    description: '법인카드, 경비 지출 정산 요청',
    category: 'finance',
    processType: 'approval-required',
    fields: [
      { id: 'expenseType', name: '정산 유형', type: 'select', required: true, options: [
        { value: 'card', label: '법인카드' },
        { value: 'cash', label: '현금 지출' },
        { value: 'travel', label: '출장비' },
        { value: 'other', label: '기타' },
      ], aiAutoFill: true },
      { id: 'amount', name: '금액', type: 'text', required: true, placeholder: '예: 50,000원' },
      { id: 'date', name: '지출일', type: 'date', required: true },
      { id: 'purpose', name: '지출 목적', type: 'textarea', required: true, aiAutoFill: true },
    ],
    copilotHints: {
      suggestedActions: ['정산 요청', '승인자에게 전달'],
      relatedInfo: ['이번 달 사용 한도: 500,000원', '승인자: 김부장'],
      estimatedTime: '2~3일 내 처리',
    },
  },
  // 6. OS IT 지원
  {
    id: 'os-it-support',
    systemId: 'os',
    moduleId: 'os-it',
    name: 'IT 지원 요청',
    icon: '💻',
    description: 'PC, 프린터, 네트워크 등 IT 장비 지원',
    category: 'it_support',
    processType: 'assignment',
    fields: [
      { id: 'category', name: '지원 유형', type: 'select', required: true, options: [
        { value: 'pc', label: 'PC/노트북' },
        { value: 'printer', label: '프린터/복합기' },
        { value: 'network', label: '네트워크/인터넷' },
        { value: 'software', label: '소프트웨어' },
        { value: 'account', label: '계정/비밀번호' },
        { value: 'other', label: '기타' },
      ], aiAutoFill: true },
      { id: 'symptom', name: '증상', type: 'text', required: true, placeholder: '예: PC가 느려요', aiAutoFill: true },
      { id: 'location', name: '위치/좌석', type: 'text', required: true, placeholder: '예: 4층 A구역 12번' },
      { id: 'urgency', name: '긴급도', type: 'urgency', required: true },
    ],
    copilotHints: {
      suggestedActions: ['지원 요청 접수', 'IT 담당자 배정'],
      relatedInfo: ['IT팀 담당: 이기술', '평균 응답 시간: 2시간'],
      estimatedTime: '당일 ~ 익일',
    },
  },
  // 7. 보안 외장하드 반출 신청
  {
    id: 'security-hdd',
    systemId: 'security',
    moduleId: 'security-hdd',
    name: '외장하드 반출 신청',
    icon: '🔒',
    description: '외장하드, USB 등 저장장치 반출 승인 요청',
    category: 'security',
    processType: 'approval-required',
    fields: [
      { id: 'deviceType', name: '장치 유형', type: 'select', required: true, options: [
        { value: 'hdd', label: '외장하드' },
        { value: 'usb', label: 'USB 메모리' },
        { value: 'ssd', label: '외장 SSD' },
        { value: 'other', label: '기타 저장장치' },
      ] },
      { id: 'capacity', name: '용량', type: 'text', required: true, placeholder: '예: 1TB' },
      { id: 'purpose', name: '반출 목적', type: 'textarea', required: true },
      { id: 'returnDate', name: '반납 예정일', type: 'date', required: true },
    ],
    copilotHints: {
      suggestedActions: ['반출 신청', '보안팀 승인 요청'],
      relatedInfo: ['승인 필요: 팀장 + 보안팀장', '평균 승인 시간: 1~2일'],
      estimatedTime: '승인 후 반출 가능',
    },
  },
  // 8. SIOS 관제 알림
  {
    id: 'sios-alert',
    systemId: 'sios',
    moduleId: 'sios-alert',
    name: '관제 이상 신고',
    icon: '📡',
    description: '엘리베이터, 화재, CCTV 등 관제 시스템 이상 신고',
    category: 'facility_emergency',
    processType: 'direct',
    fields: [
      { id: 'building', name: '건물', type: 'select', required: true, options: [
        { value: 'gangnam', label: '강남 리마크빌' },
        { value: 'yeouido', label: '여의도 리마크빌' },
        { value: 'jongno', label: '종로 리마크빌' },
        { value: 'pangyo', label: '판교 리마크빌' },
      ] },
      { id: 'alertType', name: '이상 유형', type: 'select', required: true, options: [
        { value: 'elevator', label: '엘리베이터 이상' },
        { value: 'fire', label: '화재 감지' },
        { value: 'intrusion', label: '침입 감지' },
        { value: 'cctv', label: 'CCTV 이상' },
        { value: 'power', label: '전력 이상' },
        { value: 'other', label: '기타' },
      ], aiAutoFill: true },
      { id: 'location', name: '상세 위치', type: 'text', required: true, aiAutoFill: true },
      { id: 'description', name: '상황 설명', type: 'textarea', required: true, aiAutoFill: true },
    ],
    copilotHints: {
      suggestedActions: ['즉시 신고', '관제센터 알림', '현장 출동 요청'],
      relatedInfo: ['관제센터: 02-1234-5678', '현장 담당자 자동 배정'],
      estimatedTime: '즉시 대응',
    },
  },
]

export function getActionMeta(actionId: string): ActionMeta | undefined {
  return POC_ACTIONS.find((a) => a.id === actionId)
}

export function getActionFields(actionId: string): ActionField[] {
  const action = getActionMeta(actionId)
  return action?.fields || []
}

export function getAllActions(): ActionMeta[] {
  return POC_ACTIONS
}

export function getActionsBySystem(systemId: string): ActionMeta[] {
  return POC_ACTIONS.filter((a) => a.systemId === systemId)
}
