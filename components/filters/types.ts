export interface FilterOption {
  value: string
  label: string
  color?: 'slate' | 'blue' | 'emerald' | 'amber' | 'rose' | 'cyan'
}

export interface ComboboxOption {
  id: string
  name: string
}

export interface MultiSelectOption {
  id: string
  label: string
}

export interface DateRangeValue {
  from: Date | null
  to: Date | null
}

export interface DateRangePreset {
  label: string
  getValue: () => DateRangeValue
}

export interface ActiveFilter {
  id: string
  label: string
  value: string
}
