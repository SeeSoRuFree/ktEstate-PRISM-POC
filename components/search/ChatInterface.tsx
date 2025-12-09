'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, User, Loader2, ArrowRight, Clock, Star, FileText, ExternalLink, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { searchActionsGrouped, analyzeUserInput } from '@/lib/actions'
import { useSidebarStore } from '@/lib/store'
import type { AIAnalysisResult, ActionMeta } from '@/types'
import { TypingIndicator } from './TypingIndicator'
import { DetectedTagsBar } from './DetectedTagsBar'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  analysis?: AIAnalysisResult
  actions?: Array<{ action: ActionMeta; confidence: number }>
  timestamp: Date
}

interface ChatInterfaceProps {
  className?: string
}

function generateAIResponse(analysis: AIAnalysisResult, userInput: string): string {
  const typeLabels: Record<string, string> = {
    emergency: '긴급 대응이',
    bug_fix: '오류 수정이',
    feature_request: '기능 요청 처리가',
    inquiry: '문의 답변이',
    maintenance: '점검/유지보수가',
    approval: '승인 처리가',
    general: '요청 처리가',
  }

  const typeLabel = typeLabels[analysis.requestType.category] || '요청 처리가'
  const shortInput = userInput.length > 30 ? userInput.slice(0, 30) + '...' : userInput

  if (analysis.overallConfidence >= 0.7) {
    return `네, 이해했습니다! "${shortInput}" 관련 상황이시군요. ${analysis.system.name} 시스템에서 ${typeLabel} 필요해 보입니다. 아래 작업 중 하나를 선택해 주세요.`
  } else if (analysis.overallConfidence >= 0.5) {
    return `말씀하신 내용을 분석해보니, ${typeLabel} 필요한 상황으로 보입니다. 관련된 작업들을 찾아봤어요.`
  }
  return `입력하신 내용과 관련된 작업들을 찾아봤습니다. 원하시는 작업을 선택해 주세요.`
}

export function ChatInterface({ className }: ChatInterfaceProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { addDynamicMenu } = useSidebarStore()

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle send message
  const handleSend = useCallback(async () => {
    const query = inputValue.trim()
    if (!query || isProcessing) return

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsProcessing(true)

    // Simulate AI thinking
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Get AI analysis
    const groupedResults = searchActionsGrouped(query)
    const analysis = analyzeUserInput(query)

    // Flatten results
    const flatActions: Array<{ action: ActionMeta; confidence: number }> = []
    groupedResults.forEach((group) => {
      group.actions.forEach((result) => {
        flatActions.push({
          action: result.action,
          confidence: result.confidence,
        })
      })
    })
    flatActions.sort((a, b) => b.confidence - a.confidence)

    // Add AI response
    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: analysis ? generateAIResponse(analysis, query) : '관련된 작업을 찾지 못했습니다. 다른 방식으로 말씀해 주시겠어요?',
      analysis: analysis || undefined,
      actions: flatActions.slice(0, 4),
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, aiMessage])
    setIsProcessing(false)
  }, [inputValue, isProcessing])

  // Handle action click
  const handleActionClick = useCallback(
    (action: ActionMeta, query: string, analysis?: AIAnalysisResult) => {
      // Add to sidebar
      addDynamicMenu({
        id: `chat-${action.id}-${Date.now()}`,
        actionId: action.id,
        name: action.name,
        icon: action.icon,
        systemName: action.systemId,
        query,
      })

      // Build URL params
      const params = new URLSearchParams()
      params.set('pf_situation', query)
      if (analysis) {
        params.set('pf_system', analysis.system.id)
        if (analysis.module) params.set('pf_module', analysis.module.id)
        params.set('pf_type', analysis.requestType.category)
        params.set('pf_title', analysis.generatedTitle)
      }

      router.push(`/action/${action.id}?${params.toString()}`)
    },
    [addDynamicMenu, router]
  )

  // Handle request creation (요청 등록하기)
  const handleCreateRequest = useCallback(
    (query: string, analysis?: AIAnalysisResult) => {
      const params = new URLSearchParams()
      params.set('prefill', 'true')
      params.set('content', query)
      if (analysis) {
        params.set('systemId', analysis.system.id)
        params.set('systemName', analysis.system.name)
        if (analysis.module) {
          params.set('moduleId', analysis.module.id)
          params.set('moduleName', analysis.module.name)
        }
        params.set('requestType', analysis.requestType.category)
        params.set('title', analysis.generatedTitle)
      }
      router.push(`/requests?${params.toString()}`)
    },
    [router]
  )

  // Handle system link click
  const handleSystemClick = useCallback(
    (systemId: string) => {
      router.push(`/systems?highlight=${systemId}`)
    },
    [router]
  )

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          // Empty state
          <div className="h-full flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-smart-blue to-blue-600 flex items-center justify-center mb-6 shadow-lg"
            >
              <Bot className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold text-kt-black mb-2"
            >
              안녕하세요! PRISM AI입니다
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground mb-8"
            >
              무엇이든 자연스럽게 말씀해 주세요.
            </motion.p>

            {/* Quick Examples */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 gap-2 max-w-md"
            >
              {[
                '3층 화장실에 누수가 발생했어요',
                '에어컨이 안 시원해요',
                '다음주 월요일 연차 쓰고 싶어요',
                'PC가 너무 느려요',
              ].map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputValue(example)
                    inputRef.current?.focus()
                  }}
                  className="px-3 py-2 text-sm text-left bg-white border border-border-gray rounded-lg hover:border-smart-blue hover:bg-smart-blue-light transition-all"
                >
                  "{example}"
                </button>
              ))}
            </motion.div>
          </div>
        ) : (
          // Message list
          <div className="max-w-3xl mx-auto space-y-6">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-smart-blue to-blue-600 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <div
                    className={cn(
                      'max-w-[80%]',
                      message.role === 'user' ? 'order-first' : ''
                    )}
                  >
                    {message.role === 'user' ? (
                      // User message
                      <div className="bg-smart-blue text-white rounded-2xl rounded-tr-sm px-4 py-3">
                        <p className="text-sm">{message.content}</p>
                      </div>
                    ) : (
                      // AI message
                      <div className="space-y-3">
                        <div className="bg-white border border-border-gray rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                          <p className="text-sm text-kt-black leading-relaxed">
                            {message.content}
                          </p>

                          {message.analysis && (
                            <DetectedTagsBar
                              systemName={message.analysis.system.name}
                              moduleName={message.analysis.module?.name}
                              requestType={message.analysis.requestType.label}
                              className="mt-3"
                            />
                          )}
                        </div>

                        {/* System Info Card */}
                        {message.analysis && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-blue-600 font-medium mb-1">담당 시스템</p>
                                <p className="font-semibold text-sm text-kt-black">
                                  {message.analysis.system.name}
                                  {message.analysis.module && (
                                    <span className="text-muted-foreground font-normal">
                                      {' > '}{message.analysis.module.name}
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  관련 업무를 처리할 수 있는 시스템입니다
                                </p>
                              </div>
                              <button
                                onClick={() => handleSystemClick(message.analysis!.system.id)}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="시스템 메뉴 보기"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        )}

                        {/* Action Cards */}
                        {message.actions && message.actions.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground px-1">
                              직접 처리 가능한 작업
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {message.actions.map((item, idx) => (
                                <motion.button
                                  key={item.action.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.1 }}
                                  onClick={() =>
                                    handleActionClick(
                                      item.action,
                                      messages.find((m) => m.role === 'user')?.content || '',
                                      message.analysis
                                    )
                                  }
                                  className={cn(
                                    'relative p-3 bg-white border-2 rounded-xl text-left transition-all group',
                                    'hover:shadow-md hover:border-smart-blue',
                                    idx === 0 && item.confidence >= 0.7
                                      ? 'border-smart-blue shadow-sm'
                                      : 'border-border-gray'
                                  )}
                                >
                                  {idx === 0 && item.confidence >= 0.7 && (
                                    <span className="absolute -top-2 -right-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-smart-blue text-white text-[10px] font-medium rounded-full">
                                      <Star className="w-2.5 h-2.5 fill-current" />
                                      추천
                                    </span>
                                  )}
                                  <div className="flex items-start gap-3">
                                    <span className="text-2xl">{item.action.icon}</span>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm text-kt-black group-hover:text-smart-blue">
                                        {item.action.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground line-clamp-1">
                                        {item.action.description}
                                      </p>
                                      {item.action.copilotHints?.estimatedTime && (
                                        <p className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                                          <Clock className="w-3 h-3" />
                                          {item.action.copilotHints.estimatedTime}
                                        </p>
                                      )}
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Request Creation Button */}
                        {message.analysis && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="pt-2 border-t border-gray-100"
                          >
                            <p className="text-xs text-muted-foreground mb-2 px-1">
                              {message.actions && message.actions.length > 0
                                ? '원하시는 작업이 없으신가요?'
                                : '담당자에게 요청을 보내시겠어요?'}
                            </p>
                            <button
                              onClick={() =>
                                handleCreateRequest(
                                  messages.find((m) => m.role === 'user')?.content || '',
                                  message.analysis
                                )
                              }
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:scale-[1.02] transition-all"
                            >
                              <FileText className="w-4 h-4" />
                              요청 등록하기
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-smart-blue to-blue-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white border border-border-gray rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <TypingIndicator />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 bg-white border-t border-border-gray">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 bg-bg-gray rounded-2xl px-4 py-2 border-2 border-transparent focus-within:border-smart-blue focus-within:bg-white transition-all">
            <Bot className="w-6 h-6 text-smart-blue flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="무엇을 도와드릴까요? 예: 3층 화장실에 누수가 발생했어요"
              className="flex-1 bg-transparent text-sm text-kt-black placeholder-muted-foreground focus:outline-none"
              disabled={isProcessing}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isProcessing}
              className={cn(
                'p-2 rounded-lg transition-colors',
                inputValue.trim() && !isProcessing
                  ? 'bg-smart-blue text-white hover:bg-smart-blue/90'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              )}
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
