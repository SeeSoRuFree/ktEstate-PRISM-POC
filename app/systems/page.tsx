'use client'

import { useState, useMemo } from 'react'
import { AppLayout } from '@/components/layout'
import { SYSTEMS, ONE_MODULES, getTotalMenuCount } from '@/lib/actions'
import {
  ChevronRight,
  ChevronDown,
  Search,
  FolderTree,
  Server,
  Layers,
  FileText,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SystemsPage() {
  const [expandedSystems, setExpandedSystems] = useState<Set<string>>(new Set())
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  const totalMenuCount = getTotalMenuCount()

  const toggleSystem = (systemId: string) => {
    setExpandedSystems((prev) => {
      const next = new Set(prev)
      if (next.has(systemId)) {
        next.delete(systemId)
      } else {
        next.add(systemId)
      }
      return next
    })
  }

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) {
        next.delete(moduleId)
      } else {
        next.add(moduleId)
      }
      return next
    })
  }

  const expandAll = () => {
    setExpandedSystems(new Set(SYSTEMS.map((s) => s.id)))
    setExpandedModules(new Set(ONE_MODULES.map((m) => m.id)))
  }

  const collapseAll = () => {
    setExpandedSystems(new Set())
    setExpandedModules(new Set())
  }

  // Filter systems and menus based on search query
  const filteredSystems = useMemo(() => {
    if (!searchQuery.trim()) return SYSTEMS

    const query = searchQuery.toLowerCase()
    return SYSTEMS.map((system) => {
      const systemMatches = system.name.toLowerCase().includes(query) ||
        system.nameEn?.toLowerCase().includes(query)

      if (system.modules && system.modules.length > 0) {
        const filteredModules = system.modules.map((module) => {
          const moduleMatches = module.name.toLowerCase().includes(query) ||
            module.nameEn.toLowerCase().includes(query)
          const filteredMenus = module.menus.filter((menu) =>
            menu.toLowerCase().includes(query)
          )

          if (moduleMatches || filteredMenus.length > 0) {
            return { ...module, menus: moduleMatches ? module.menus : filteredMenus }
          }
          return null
        }).filter(Boolean)

        if (systemMatches || filteredModules.length > 0) {
          return { ...system, modules: filteredModules as typeof system.modules }
        }
      } else {
        const filteredMenus = system.menus.filter((menu) =>
          menu.toLowerCase().includes(query)
        )

        if (systemMatches || filteredMenus.length > 0) {
          return { ...system, menus: systemMatches ? system.menus : filteredMenus }
        }
      }
      return null
    }).filter(Boolean) as typeof SYSTEMS
  }, [searchQuery])

  // Auto-expand when searching
  useMemo(() => {
    if (searchQuery.trim()) {
      setExpandedSystems(new Set(filteredSystems.map((s) => s.id)))
      const moduleIds = filteredSystems
        .filter((s) => s.modules)
        .flatMap((s) => s.modules!.map((m) => m.id))
      setExpandedModules(new Set(moduleIds))
    }
  }, [searchQuery, filteredSystems])

  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        {/* Page Header */}
        <div className="flex-shrink-0 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FolderTree className="w-6 h-6 text-smart-blue" />
                IT 시스템 메뉴 트리
              </h1>
              <p className="text-gray-600 mt-1">
                전체 {SYSTEMS.length}개 시스템, {totalMenuCount}개 메뉴
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                모두 펼치기
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                모두 접기
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex-shrink-0 mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="시스템, 모듈, 메뉴 검색..."
              className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-smart-blue focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-gray-500">
              검색 결과: {filteredSystems.length}개 시스템
            </p>
          )}
        </div>

        {/* Tree View */}
        <div className="flex-1 overflow-y-auto bg-white border border-gray-200 rounded-xl p-4">
          <div className="space-y-1">
            {filteredSystems.map((system) => {
              const isExpanded = expandedSystems.has(system.id)
              const hasModules = system.modules && system.modules.length > 0
              const menuCount = hasModules
                ? system.modules!.reduce((acc, m) => acc + m.menus.length, 0)
                : system.menus.length

              return (
                <div key={system.id}>
                  {/* System Row */}
                  <button
                    onClick={() => toggleSystem(system.id)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors',
                      isExpanded ? 'bg-smart-blue-light' : 'hover:bg-gray-50'
                    )}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    )}
                    <Server className="w-4 h-4 text-smart-blue flex-shrink-0" />
                    <span className="font-medium text-gray-900">{system.name}</span>
                    {system.nameEn && (
                      <span className="text-xs text-gray-400">({system.nameEn})</span>
                    )}
                    <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {menuCount}개 메뉴
                    </span>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {hasModules ? (
                        // ONE system with modules
                        system.modules!.map((module) => {
                          const isModuleExpanded = expandedModules.has(module.id)
                          return (
                            <div key={module.id}>
                              {/* Module Row */}
                              <button
                                onClick={() => toggleModule(module.id)}
                                className={cn(
                                  'w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-colors',
                                  isModuleExpanded ? 'bg-purple-50' : 'hover:bg-gray-50'
                                )}
                              >
                                {isModuleExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                                )}
                                <Layers className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                                <span className="text-sm font-medium text-gray-800">{module.name}</span>
                                <span className="text-xs text-gray-400">({module.nameEn})</span>
                                <span className="ml-auto text-xs text-gray-500">
                                  {module.menus.length}개
                                </span>
                              </button>

                              {/* Module Menus */}
                              {isModuleExpanded && (
                                <div className="ml-6 mt-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
                                  {module.menus.map((menu, idx) => (
                                    <div
                                      key={`${module.id}-${idx}`}
                                      className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-600 bg-gray-50 rounded"
                                    >
                                      <FileText className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                      <span className="truncate">{menu}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })
                      ) : (
                        // Regular system with menus
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 pl-3">
                          {system.menus.map((menu, idx) => (
                            <div
                              key={`${system.id}-${idx}`}
                              className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-600 bg-gray-50 rounded"
                            >
                              <FileText className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{menu}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {filteredSystems.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>검색 결과가 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
