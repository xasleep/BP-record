import {
  BloodPressureRange,
  BloodPressureRecord,
  BloodPressureStatus,
  DaySummary,
} from '../types/record'
import { getDateKey } from './format'

export function getRecordStatus(record: BloodPressureRecord, range: BloodPressureRange): BloodPressureStatus {
  if (record.systolic > range.systolicMax || record.diastolic > range.diastolicMax) {
    return 'high'
  }

  if (record.systolic < range.systolicMin || record.diastolic < range.diastolicMin) {
    return 'low'
  }

  return 'normal'
}

export function getDayStatus(records: BloodPressureRecord[], range: BloodPressureRange): BloodPressureStatus {
  const statuses = records.map((record) => getRecordStatus(record, range))
  if (statuses.includes('high')) {
    return 'high'
  }
  if (statuses.includes('low')) {
    return 'low'
  }
  return 'normal'
}

export function groupRecordsByDay(records: BloodPressureRecord[], range: BloodPressureRange): Record<string, DaySummary> {
  const grouped: Record<string, BloodPressureRecord[]> = {}

  records.forEach((record) => {
    const dateKey = getDateKey(record.timestamp)
    grouped[dateKey] = grouped[dateKey] || []
    grouped[dateKey].push(record)
  })

  return Object.keys(grouped).reduce<Record<string, DaySummary>>((result, dateKey) => {
    result[dateKey] = {
      dateKey,
      records: grouped[dateKey],
      status: getDayStatus(grouped[dateKey], range),
    }
    return result
  }, {})
}
