import type { SystemMeta } from '@/types'

export const SYSTEMS: SystemMeta[] = [
  // 1. 그룹웨어 Portal
  {
    id: 'portal',
    name: '그룹웨어',
    description: '결재, 메일, 일정 관리',
    icon: '📧',
    color: '#3B82F6',
    keywords: ['결재', '메일', '일정', '공지', '휴가', '연차', '반차'],
    isActive: true,
    modules: [
      { id: 'portal-approval', name: '결재', description: '전자 결재', keywords: ['결재', '승인', '반려'], category: 'approval' },
      { id: 'portal-leave', name: '휴가관리', description: '휴가 신청/관리', keywords: ['휴가', '연차', '반차', '병가'], category: 'hr_request' },
    ],
  },
  // 2. ONE 통합부동산관리 (9개 모듈)
  {
    id: 'one',
    name: 'ONE 통합부동산관리',
    description: 'KT Estate 핵심 부동산 관리 시스템',
    icon: '🏢',
    color: '#10B981',
    keywords: ['부동산', '시설', '관리', '임대', '자산'],
    isActive: true,
    modules: [
      { id: 'one-ps', name: '개발사업(PS)', description: '프로젝트/개발 관리', keywords: ['개발', '프로젝트', '사업'], category: 'general' },
      { id: 'one-pm', name: '자산운영(PM)', description: '자산/임대 관리', keywords: ['임대', '공실', '계약', '입주', '자산'], category: 'facility_management' },
      { id: 'one-fm', name: 'FM관리', description: '시설 유지보수', keywords: ['시설', '점검', '수리', '누수', '고장', '긴급'], category: 'facility_emergency' },
      { id: 'one-fi', name: '전표/예산(FI)', description: '재무/회계', keywords: ['전표', '예산', '회계'], category: 'finance' },
      { id: 'one-bi', name: '경영정보(BI)', description: '리포트/대시보드', keywords: ['리포트', '대시보드', '통계'], category: 'general' },
      { id: 'one-sm', name: '공통/업무결재(SM)', description: '결재/워크플로우', keywords: ['결재', '승인'], category: 'approval' },
      { id: 'one-vc', name: 'VOC', description: '고객 의견 관리', keywords: ['VOC', '민원', '고객'], category: 'general' },
      { id: 'one-gr', name: '권한관리(GR)', description: '사용자 권한', keywords: ['권한', '사용자'], category: 'general' },
      { id: 'one-wd', name: '배포관리(WD)', description: '배포/릴리즈', keywords: ['배포', '릴리즈'], category: 'general' },
    ],
  },
  // 3. 전자조달 EPS
  {
    id: 'eps',
    name: '전자조달',
    description: '구매/조달 시스템',
    icon: '📦',
    color: '#F59E0B',
    keywords: ['구매', '조달', '발주', '입찰'],
    isActive: true,
    modules: [],
  },
  // 4. 경영정보 BIS
  {
    id: 'bis',
    name: '경영정보',
    description: 'BI/리포트 시스템',
    icon: '📊',
    color: '#8B5CF6',
    keywords: ['BI', '리포트', '경영', '통계'],
    isActive: true,
    modules: [],
  },
  // 5. 인재개발원 LIME
  {
    id: 'lime',
    name: '인재개발원',
    description: '교육/학습 관리',
    icon: '🎓',
    color: '#06B6D4',
    keywords: ['교육', '학습', '연수', '과정'],
    isActive: true,
    modules: [],
  },
  // 6-8. 홈페이지들
  {
    id: 'kteh',
    name: '회사홈페이지',
    description: 'KT Estate 대외 홈페이지',
    icon: '🌐',
    color: '#64748B',
    keywords: ['홈페이지', '대외'],
    isActive: true,
    modules: [],
  },
  {
    id: 'remk',
    name: '리마크빌홈페이지',
    description: '리마크빌 브랜드 사이트',
    icon: '🏠',
    color: '#EC4899',
    keywords: ['리마크빌', '브랜드'],
    isActive: true,
    modules: [],
  },
  {
    id: 'hms',
    name: '호텔멤버십',
    description: '호텔 서비스 관리',
    icon: '🏨',
    color: '#F97316',
    keywords: ['호텔', '멤버십', '예약'],
    isActive: true,
    modules: [],
  },
  // 9. ERP
  {
    id: 'erp',
    name: '전사적자원관리',
    description: '회계/재무 시스템',
    icon: '💰',
    color: '#22C55E',
    keywords: ['ERP', '회계', '재무', '정산', '전표', '법인카드'],
    isActive: true,
    modules: [
      { id: 'erp-expense', name: '경비정산', description: '비용 정산', keywords: ['정산', '경비', '법인카드', '출장비'], category: 'finance' },
    ],
  },
  // 10. 통합관제 SIOS
  {
    id: 'sios',
    name: '통합관제',
    description: '시설 모니터링 시스템',
    icon: '📡',
    color: '#EF4444',
    keywords: ['관제', '모니터링', 'CCTV', '화재', '엘리베이터'],
    isActive: true,
    modules: [
      { id: 'sios-alert', name: '관제알림', description: '이상 감지/알림', keywords: ['알림', '이상', '감지', '경보'], category: 'facility_emergency' },
    ],
  },
  // 11. 비즈라운지
  {
    id: 'bizl',
    name: '비즈라운지',
    description: '공유오피스 관리',
    icon: '🪑',
    color: '#A855F7',
    keywords: ['비즈라운지', '공유오피스', '좌석'],
    isActive: true,
    modules: [],
  },
  // 12. 전자문서고 EDMS
  {
    id: 'edms',
    name: '전자문서고',
    description: '문서 관리 시스템',
    icon: '📁',
    color: '#0EA5E9',
    keywords: ['문서', 'EDMS', '파일', '저장'],
    isActive: true,
    modules: [],
  },
  // 13. 도면관리 Revit
  {
    id: 'revit',
    name: '도면관리',
    description: '건축 도면 관리',
    icon: '📐',
    color: '#14B8A6',
    keywords: ['도면', 'CAD', '설계', 'Revit'],
    isActive: true,
    modules: [],
  },
  // 14. 윈도우&OA (OS)
  {
    id: 'os',
    name: '윈도우&OA',
    description: 'IT 인프라/장비 지원',
    icon: '💻',
    color: '#6366F1',
    keywords: ['PC', '컴퓨터', '프린터', '인터넷', 'IT', '느려'],
    isActive: true,
    modules: [
      { id: 'os-it', name: 'IT지원', description: 'IT 장비 지원', keywords: ['PC', '컴퓨터', '프린터', '느려', '설치'], category: 'it_support' },
    ],
  },
  // 15-17. 보안 관련
  {
    id: 'security',
    name: '보안',
    description: '보안 요청 및 관리',
    icon: '🔒',
    color: '#DC2626',
    keywords: ['보안', '외장하드', 'USB', '반출', '솔루션'],
    isActive: true,
    modules: [
      { id: 'security-hdd', name: '외장하드반출', description: '저장장치 반출 신청', keywords: ['외장하드', 'USB', '반출', '반납'], category: 'security' },
      { id: 'security-solution', name: '보안솔루션', description: '보안 솔루션 문의/변경', keywords: ['보안솔루션', '백신', 'DLP'], category: 'security' },
    ],
  },
  // 18. 안전보건스퀘어
  {
    id: 'safety',
    name: '안전보건스퀘어',
    description: '안전/보건 관리',
    icon: '⛑️',
    color: '#F97316',
    keywords: ['안전', '보건', '사고', '위험'],
    isActive: true,
    modules: [],
  },
  // 19. 구)그룹웨어 (레거시)
  {
    id: 'legacy-gw',
    name: '구)그룹웨어',
    description: '레거시 그룹웨어',
    icon: '📋',
    color: '#9CA3AF',
    keywords: ['구그룹웨어', '레거시'],
    isActive: false,
    modules: [],
  },
]

export function getSystemById(id: string): SystemMeta | undefined {
  return SYSTEMS.find((s) => s.id === id)
}

export function getActiveSystems(): SystemMeta[] {
  return SYSTEMS.filter((s) => s.isActive)
}
