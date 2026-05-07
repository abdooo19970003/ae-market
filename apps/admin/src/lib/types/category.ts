// lib/types/category.ts

export interface AttributeOption {
  id?: number
  label: string
  value: string
  sortOrder: number
}

export interface CategoryAttribute {
  id?: number | string
  name: string
  slug: string
  inputType: 'text' | 'number' | 'select' | 'multi_select' | 'boolean'
  unit?: string | null
  isRequired: boolean
  isFilterable: boolean
  sortOrder: number
  options?: AttributeOption[]
}

export interface CategoryFormData {
  name: string
  slug: string
  parentId?: number | null
  description?: string
  imageUrl?: string
  sortOrder: number
  attributes: CategoryAttribute[]
}

// For edit mode
export interface CategoryWithAttributes extends CategoryFormData {
  id: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const INPUT_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Single Select' },
  { value: 'multi_select', label: 'Multi Select' },
  { value: 'boolean', label: 'Yes / No' },
] as const