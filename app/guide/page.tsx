'use client'

import { AppLayout } from '@/components/layout'
import { ArrowLeft, ExternalLink, CheckCircle2, Clock, Zap, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function GuidePage() {
  return (
    <AppLayout showSearch={false}>
      <div className="max-w-4xl mx-auto">
        {/* 뒤로가기 */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-kt-black mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          홈으로 돌아가기
        </Link>

        {/* 헤더 */}
        <div className="bg-gradient-to-r from-smart-blue to-blue-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Image
              src="/ktstate_logo.png"
              alt="KT Estate"
              width={120}
              height={34}
              className="bg-white rounded-lg px-3 py-1"
            />
            <span className="text-2xl font-bold">PRISM</span>
          </div>
          <h1 className="text-3xl font-bold mb-3">POC 가이드</h1>
          <p className="text-blue-100 text-lg">
            PRoactive Intelligent Service Manager - AI 기반 업무 요청 관리 시스템
          </p>
        </div>

        {/* 목적 및 개요 */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-border-gray mb-6">
          <h2 className="text-xl font-bold text-kt-black mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-smart-blue" />
            목적 및 개요
          </h2>
          <p className="text-gray-700 leading-relaxed">
            <strong>PRISM</strong>은 KT Estate의 업무 요청 처리를 AI 기반으로 혁신하는 시스템입니다.
            기존에 담당자가 수동으로 분류하고 배정하던 업무 요청을 AI가 자동으로 분석하여
            적합한 시스템/모듈을 추천하고, 영향도 분석 및 처리 시간을 예측합니다.
            이를 통해 요청 접수부터 결재까지의 전 과정을 단일 플랫폼에서 처리할 수 있으며,
            담당자의 업무 부담을 줄이고 처리 속도를 향상시킵니다.
          </p>
        </section>

        {/* 테스트 케이스 */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-border-gray mb-6">
          <h2 className="text-xl font-bold text-kt-black mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-status-success" />
            테스트 케이스
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-gray">
                  <th className="text-left py-3 px-4 font-semibold text-kt-black rounded-tl-lg">케이스</th>
                  <th className="text-left py-3 px-4 font-semibold text-kt-black">입력 예시</th>
                  <th className="text-left py-3 px-4 font-semibold text-kt-black rounded-tr-lg">확인 포인트</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-gray">
                <tr>
                  <td className="py-3 px-4 font-medium">시설 관리</td>
                  <td className="py-3 px-4 text-gray-600">"3층 화장실 누수 신고"</td>
                  <td className="py-3 px-4 text-gray-600">시설관리시스템 자동 매칭, 긴급도 자동 상향</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">계약 관련</td>
                  <td className="py-3 px-4 text-gray-600">"임대차 계약 갱신 문의드립니다"</td>
                  <td className="py-3 px-4 text-gray-600">계약관리시스템 매칭, 문의 유형 분류</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">결제/정산</td>
                  <td className="py-3 px-4 text-gray-600">"이번달 관리비 정산이 이상해요"</td>
                  <td className="py-3 px-4 text-gray-600">정산시스템 매칭, AI 제목 생성</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">일반 문의</td>
                  <td className="py-3 px-4 text-gray-600">"주차 등록 방법 알려주세요"</td>
                  <td className="py-3 px-4 text-gray-600">관련 시스템 추천, FAQ 연계 가능성</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">긴급 상황</td>
                  <td className="py-3 px-4 text-gray-600">"엘리베이터 고장으로 갇혔어요"</td>
                  <td className="py-3 px-4 text-gray-600">긴급 분류, 높은 영향도 분석</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-smart-blue mb-2">테스트 방법</h4>
            <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
              <li>홈 화면에서 자연어로 질문 입력</li>
              <li>AI가 분석한 시스템/메뉴 정보 확인</li>
              <li>"요청 등록하기" 클릭 시 자동 입력된 폼 확인</li>
              <li>결재선 설정 후 등록 → 결재 타임라인 확인</li>
            </ol>
          </div>
        </section>

        {/* 개선 전략 및 주안점 */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-border-gray mb-6">
          <h2 className="text-xl font-bold text-kt-black mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-status-warning" />
            개선 전략 및 주안점
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-bg-gray rounded-lg">
              <h4 className="font-semibold text-kt-black mb-2">AI 분류 정확도</h4>
              <p className="text-sm text-gray-600">한국어 업무 용어 인식, 유사 요청 학습을 통한 자연어 이해 고도화</p>
            </div>
            <div className="p-4 bg-bg-gray rounded-lg">
              <h4 className="font-semibold text-kt-black mb-2">사용자 경험</h4>
              <p className="text-sm text-gray-600">질문 → 분석 → 요청 → 결재를 끊김없이 연결하는 원스톱 처리</p>
            </div>
            <div className="p-4 bg-bg-gray rounded-lg">
              <h4 className="font-semibold text-kt-black mb-2">결재 워크플로우</h4>
              <p className="text-sm text-gray-600">다단계 결재 현황을 한눈에 파악할 수 있는 시각적 진행 상황</p>
            </div>
            <div className="p-4 bg-bg-gray rounded-lg">
              <h4 className="font-semibold text-kt-black mb-2">확장성</h4>
              <p className="text-sm text-gray-600">시스템/메뉴 데이터 독립적 관리 (840개 메뉴 지원) 모듈화 설계</p>
            </div>
          </div>
        </section>

        {/* 향후 확장 가능성 */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-border-gray mb-6">
          <h2 className="text-xl font-bold text-kt-black mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            향후 확장 가능성
          </h2>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 p-4 bg-blue-50 rounded-lg border-2 border-smart-blue">
              <div className="text-xs font-semibold text-smart-blue mb-1">Phase 1 (현재)</div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• AI 요청 분류</li>
                <li>• 결재 UI</li>
                <li>• 시스템 메뉴 탐색</li>
              </ul>
            </div>
            <div className="flex-1 p-4 bg-gray-50 rounded-lg border border-border-gray">
              <div className="text-xs font-semibold text-gray-500 mb-1">Phase 2</div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 실제 백엔드 연동</li>
                <li>• 알림 시스템</li>
                <li>• 사용자 인증</li>
              </ul>
            </div>
            <div className="flex-1 p-4 bg-gray-50 rounded-lg border border-border-gray">
              <div className="text-xs font-semibold text-gray-500 mb-1">Phase 3</div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 챗봇 자동응답</li>
                <li>• 대시보드/통계</li>
                <li>• 모바일 앱</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-700 mb-2">확장 방향</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li><strong>ERP 연동:</strong> 기존 사내 시스템(SAP, 그룹웨어)과 API 연결</li>
              <li><strong>학습형 AI:</strong> 실제 처리 데이터 축적 → 분류 정확도 향상</li>
              <li><strong>자동 라우팅:</strong> 담당자 자동 배정 및 SLA 관리</li>
              <li><strong>모바일 대응:</strong> 현장 담당자용 앱 개발</li>
            </ul>
          </div>
        </section>

        {/* 개발사 소개 */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Developed by Second Team</h3>
              <p className="text-gray-300 text-sm mb-4">
                AI 기반 업무 자동화 솔루션을 제공하는 IT 전문 기업
              </p>
              <a
                href="https://second-team.com/program/ahead"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                회사 소개 보기
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <div className="hidden md:block text-6xl opacity-20">
              ST
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-smart-blue text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            PRISM 체험하기
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}
