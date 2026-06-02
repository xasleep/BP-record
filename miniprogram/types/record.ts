export type BloodPressureStatus = 'normal' | 'high' | 'low'

export type FontSizeLevel = 'small' | 'medium' | 'large'

export interface BloodPressureRecord {
  id: string
  systolic: number
  diastolic: number
  heartRate: number
  medication: string
  timestamp: number
}

export interface BloodPressureRange {
  systolicMin: number
  systolicMax: number
  diastolicMin: number
  diastolicMax: number
}

export interface UserSettings {
  range: BloodPressureRange
  fontSize: FontSizeLevel
}

export interface DaySummary {
  dateKey: string
  status: BloodPressureStatus
  records: BloodPressureRecord[]
}
