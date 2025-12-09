import type { SystemCategory } from './system'

export type ActionProcessType = 'direct' | 'approval-required' | 'assignment'

export type Urgency = 'low' | 'normal' | 'high' | 'critical'

export interface ActionField {
  id: string
  name: string
  type: 'text' | 'textarea' | 'select' | 'date' | 'time' | 'file' | 'urgency'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  defaultValue?: string | number
  aiAutoFill?: boolean
}

export interface ActionMeta {
  id: string
  name: string
  description: string
  systemId: string
  moduleId: string
  category: SystemCategory
  processType: ActionProcessType
  icon: string
  color?: string
  fields?: ActionField[]
  copilotHints?: {
    suggestedFields?: string[]
    relatedActions?: string[]
    suggestedActions?: string[]
    relatedInfo?: string[]
    estimatedTime?: string
  }
}

export interface ActionSearchResult {
  action: ActionMeta
  confidence: number
  matchedKeywords: string[]
}

export interface GroupedActionResult {
  system: {
    id: string
    name: string
    icon: string
  }
  actions: ActionSearchResult[]
  maxConfidence: number
}
