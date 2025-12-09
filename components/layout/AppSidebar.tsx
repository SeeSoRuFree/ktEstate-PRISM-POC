'use client'

import { useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Home,
  Search,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  ClipboardList,
  FolderTree,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebarStore, type DynamicMenu } from '@/lib/store'

interface AppSidebarProps {
  onSearch?: (query: string) => void
}

const STATIC_MENUS = [
  { id: 'home', name: '홈', icon: Home, href: '/' },
  { id: 'requests', name: '요청 관리', icon: ClipboardList, href: '/requests' },
  { id: 'systems', name: '시스템 메뉴', icon: FolderTree, href: '/systems' },
]

export function AppSidebar({ onSearch }: AppSidebarProps) {
  const pathname = usePathname()
  const { isCollapsed, toggleCollapsed, dynamicMenus, removeDynamicMenu } = useSidebarStore()

  const handleDynamicMenuClick = useCallback((menu: DynamicMenu) => {
    if (onSearch && menu.query) {
      onSearch(menu.query)
    }
  }, [onSearch])

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 64 : 260 }}
      className="h-screen bg-white border-r border-border-gray flex flex-col sticky top-0"
    >
      {/* 로고 영역 */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border-gray">
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-kt-red">PRISM</span>
            <span className="text-xs text-muted-foreground">POC</span>
          </Link>
        )}
        <button
          onClick={toggleCollapsed}
          className="p-1.5 rounded-lg hover:bg-bg-gray transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* 메뉴 영역 */}
      <nav className="flex-1 overflow-y-auto py-4">
        {/* 고정 메뉴 */}
        <div className="px-3 mb-4">
          {STATIC_MENUS.map((menu) => {
            const isActive = pathname === menu.href
            return (
              <Link
                key={menu.id}
                href={menu.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-all',
                  isActive
                    ? 'bg-smart-blue-light text-smart-blue'
                    : 'text-muted-foreground hover:bg-bg-gray hover:text-kt-black'
                )}
              >
                <menu.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium text-sm">{menu.name}</span>
                )}
              </Link>
            )
          })}
        </div>

        {/* 최근 검색 메뉴 (동적) */}
        {!isCollapsed && dynamicMenus.length > 0 && (
          <div className="px-3">
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground">
              <History className="w-3.5 h-3.5" />
              최근 검색
            </div>
            <div className="space-y-1">
              {dynamicMenus.map((menu) => (
                <div
                  key={menu.id}
                  className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-bg-gray transition-all cursor-pointer"
                >
                  <Link
                    href={`/action/${menu.actionId}?pf_situation=${encodeURIComponent(menu.query)}`}
                    className="flex-1 min-w-0"
                    onClick={() => handleDynamicMenuClick(menu)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{menu.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-kt-black truncate">
                          {menu.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {menu.query}
                        </p>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      removeDynamicMenu(menu.id)
                    }}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white transition-all"
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* 하단 영역 */}
      <div className="p-3 border-t border-border-gray">
        <button
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg w-full transition-all',
            'text-muted-foreground hover:bg-bg-gray hover:text-kt-black'
          )}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium text-sm">설정</span>}
        </button>
      </div>
    </motion.aside>
  )
}
