'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SYSTEMS, getSystemById } from '@/mock-data/systems'
import type { SystemMeta, ModuleMeta } from '@/types'

interface SystemModuleSelectorProps {
  selectedSystemId: string | null
  selectedModuleId: string | null
  onSystemChange: (systemId: string, systemName: string) => void
  onModuleChange: (moduleId: string | null, moduleName: string | null) => void
  aiSuggested?: { systemId?: string; moduleId?: string }
  disabled?: boolean
}

export function SystemModuleSelector({
  selectedSystemId,
  selectedModuleId,
  onSystemChange,
  onModuleChange,
  aiSuggested,
  disabled = false,
}: SystemModuleSelectorProps) {
  const [systemOpen, setSystemOpen] = useState(false)
  const [moduleOpen, setModuleOpen] = useState(false)

  const activeSystems = useMemo(() => SYSTEMS.filter((s) => s.isActive), [])
  const selectedSystem = selectedSystemId ? getSystemById(selectedSystemId) : null
  const selectedModule = selectedSystem?.modules?.find((m) => m.id === selectedModuleId)

  const isAiSuggestedSystem = aiSuggested?.systemId === selectedSystemId
  const isAiSuggestedModule = aiSuggested?.moduleId === selectedModuleId

  return (
    <div className="flex gap-3">
      {/* System Selector */}
      <div className="relative flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          시스템
          {isAiSuggestedSystem && (
            <span className="ml-2 inline-flex items-center text-xs text-blue-600">
              <Sparkles className="w-3 h-3 mr-1" />
              AI 추천
            </span>
          )}
        </label>
        <button
          type="button"
          onClick={() => !disabled && setSystemOpen(!systemOpen)}
          disabled={disabled}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 text-left',
            'border rounded-lg bg-white',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            disabled && 'opacity-50 cursor-not-allowed',
            isAiSuggestedSystem && 'border-blue-300 bg-blue-50'
          )}
        >
          <span className={selectedSystem ? 'text-gray-900' : 'text-gray-500'}>
            {selectedSystem ? (
              <span className="flex items-center gap-2">
                <span>{selectedSystem.icon}</span>
                <span>{selectedSystem.name}</span>
              </span>
            ) : (
              '시스템 선택'
            )}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        {systemOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setSystemOpen(false)} />
            <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
              {activeSystems.map((system) => (
                <button
                  key={system.id}
                  type="button"
                  onClick={() => {
                    onSystemChange(system.id, system.name)
                    onModuleChange(null, null)
                    setSystemOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50',
                    selectedSystemId === system.id && 'bg-blue-50'
                  )}
                >
                  <span>{system.icon}</span>
                  <span className="flex-1">{system.name}</span>
                  {selectedSystemId === system.id && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                  {aiSuggested?.systemId === system.id && selectedSystemId !== system.id && (
                    <Sparkles className="w-4 h-4 text-blue-400" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Module Selector */}
      <div className="relative flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          모듈
          {isAiSuggestedModule && (
            <span className="ml-2 inline-flex items-center text-xs text-blue-600">
              <Sparkles className="w-3 h-3 mr-1" />
              AI 추천
            </span>
          )}
        </label>
        <button
          type="button"
          onClick={() => !disabled && selectedSystem?.modules?.length && setModuleOpen(!moduleOpen)}
          disabled={disabled || !selectedSystem?.modules?.length}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 text-left',
            'border rounded-lg bg-white',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            (disabled || !selectedSystem?.modules?.length) && 'opacity-50 cursor-not-allowed',
            isAiSuggestedModule && 'border-blue-300 bg-blue-50'
          )}
        >
          <span className={selectedModule ? 'text-gray-900' : 'text-gray-500'}>
            {selectedModule?.name || (selectedSystem?.modules?.length ? '모듈 선택' : '모듈 없음')}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        {moduleOpen && selectedSystem?.modules && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setModuleOpen(false)} />
            <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
              <button
                type="button"
                onClick={() => {
                  onModuleChange(null, null)
                  setModuleOpen(false)
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50',
                  !selectedModuleId && 'bg-blue-50'
                )}
              >
                <span className="flex-1 text-gray-500">선택 안함</span>
                {!selectedModuleId && <Check className="w-4 h-4 text-blue-600" />}
              </button>
              {selectedSystem.modules.map((module) => (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => {
                    onModuleChange(module.id, module.name)
                    setModuleOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50',
                    selectedModuleId === module.id && 'bg-blue-50'
                  )}
                >
                  <span className="flex-1">{module.name}</span>
                  {selectedModuleId === module.id && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                  {aiSuggested?.moduleId === module.id && selectedModuleId !== module.id && (
                    <Sparkles className="w-4 h-4 text-blue-400" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
