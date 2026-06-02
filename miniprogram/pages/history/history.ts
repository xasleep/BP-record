import { BloodPressureRecord, BloodPressureStatus } from '../../types/record'
import { getRecordStatus } from '../../utils/bloodPressure'
import { formatFullDate, formatTime, getDateKey } from '../../utils/format'
import { getRecords, getSettings } from '../../utils/storage'

interface HistoryRecord extends BloodPressureRecord {
  dateText: string
  timeText: string
  status: BloodPressureStatus
  statusText: string
}

const STATUS_TEXT: Record<BloodPressureStatus, string> = {
  normal: '正常',
  high: '偏高',
  low: '偏低',
}

Page({
  data: {
    fontClass: 'font-medium',
    filterDate: '',
    dateTitle: '',
    records: [] as HistoryRecord[],
  },

  onLoad(options: Record<string, string | undefined>) {
    this.setData({
      filterDate: options.date || '',
    })
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    const settings = getSettings()
    const filterDate = this.data.filterDate
    const records = getRecords()
      .filter((record) => !filterDate || getDateKey(record.timestamp) === filterDate)
      .map((record) => {
        const status = getRecordStatus(record, settings.range)
        return {
          ...record,
          dateText: formatFullDate(record.timestamp),
          timeText: formatTime(record.timestamp),
          status,
          statusText: STATUS_TEXT[status],
        }
      })

    this.setData({
      fontClass: `font-${settings.fontSize}`,
      dateTitle: filterDate ? filterDate.replace(/-/g, '/') : '',
      records,
    })
  },

  clearFilter() {
    this.setData({
      filterDate: '',
    }, () => this.refresh())
  },
})
