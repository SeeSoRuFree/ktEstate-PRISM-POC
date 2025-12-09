export interface ModuleMeta {
  id: string
  name: string
  description: string
  keywords: string[]
  category: SystemCategory
}

export interface SystemMeta {
  id: string
  name: string
  description: string
  icon: string
  color: string
  modules: ModuleMeta[]
  keywords: string[]
  isActive: boolean
}

export type SystemCategory =
  | 'facility_management'
  | 'facility_emergency'
  | 'hr_request'
  | 'it_support'
  | 'procurement'
  | 'finance'
  | 'approval'
  | 'security'
  | 'general'
