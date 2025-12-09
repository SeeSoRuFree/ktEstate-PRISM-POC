import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface DynamicMenu {
  id: string
  actionId: string
  name: string
  icon: string
  systemName: string
  query: string
  createdAt: number
}

interface SidebarState {
  isCollapsed: boolean
  dynamicMenus: DynamicMenu[]
  pendingSearch: string | null
  toggleCollapsed: () => void
  addDynamicMenu: (menu: Omit<DynamicMenu, 'createdAt'>) => void
  removeDynamicMenu: (id: string) => void
  clearDynamicMenus: () => void
  triggerSearch: (query: string) => void
  clearPendingSearch: () => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      dynamicMenus: [],
      pendingSearch: null,
      toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      addDynamicMenu: (menu) =>
        set((state) => ({
          dynamicMenus: [
            { ...menu, createdAt: Date.now() },
            ...state.dynamicMenus.slice(0, 9), // 최대 10개 유지
          ],
        })),
      removeDynamicMenu: (id) =>
        set((state) => ({
          dynamicMenus: state.dynamicMenus.filter((m) => m.id !== id),
        })),
      clearDynamicMenus: () => set({ dynamicMenus: [] }),
      triggerSearch: (query) => set({ pendingSearch: query }),
      clearPendingSearch: () => set({ pendingSearch: null }),
    }),
    {
      name: 'prism-sidebar',
      partialize: (state) => ({
        isCollapsed: state.isCollapsed,
        dynamicMenus: state.dynamicMenus,
      }),
    }
  )
)
