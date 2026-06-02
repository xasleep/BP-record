import { BloodPressureRecord, UserSettings } from '../types/record'

const RECORDS_KEY = 'bp_records'
const SETTINGS_KEY = 'bp_settings'

export const DEFAULT_SETTINGS: UserSettings = {
  range: {
    systolicMin: 90,
    systolicMax: 129,
    diastolicMin: 60,
    diastolicMax: 89,
  },
  fontSize: 'medium',
}

export function getRecords(): BloodPressureRecord[] {
  try {
    const records = wx.getStorageSync(RECORDS_KEY) as BloodPressureRecord[] | ''
    return Array.isArray(records)
      ? records.sort((a, b) => b.timestamp - a.timestamp)
      : []
  } catch (error) {
    return []
  }
}

export function saveRecords(records: BloodPressureRecord[]): boolean {
  try {
    wx.setStorageSync(RECORDS_KEY, records)
    return true
  } catch (error) {
    return false
  }
}

export function addRecord(record: BloodPressureRecord): boolean {
  const records = getRecords()
  return saveRecords([record, ...records])
}

export function getSettings(): UserSettings {
  try {
    const stored = wx.getStorageSync(SETTINGS_KEY) as Partial<UserSettings> | ''
    if (!stored || typeof stored !== 'object') {
      return DEFAULT_SETTINGS
    }

    return {
      range: {
        ...DEFAULT_SETTINGS.range,
        ...stored.range,
      },
      fontSize: stored.fontSize || DEFAULT_SETTINGS.fontSize,
    }
  } catch (error) {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: UserSettings): boolean {
  try {
    wx.setStorageSync(SETTINGS_KEY, settings)
    return true
  } catch (error) {
    return false
  }
}
