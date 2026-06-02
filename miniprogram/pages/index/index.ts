import { BloodPressureRecord, BloodPressureStatus } from '../../types/record'
import { getRecordStatus, groupRecordsByDay } from '../../utils/bloodPressure'
import { formatDate, formatTime, getDateKey } from '../../utils/format'
import { getRecords, getSettings } from '../../utils/storage'

interface CalendarDay {
  dateKey: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  hasRecord: boolean
  status: BloodPressureStatus | ''
}

interface RecentRecord extends BloodPressureRecord {
  dateText: string
  timeText: string
  status: BloodPressureStatus
}

function buildCalendar(year: number, month: number, records: BloodPressureRecord[]): CalendarDay[] {
  const settings = getSettings()
  const dayMap = groupRecordsByDay(records, settings.range)
  const firstDate = new Date(year, month, 1)
  const start = new Date(year, month, 1 - firstDate.getDay())
  const todayKey = getDateKey(Date.now())
  const days: CalendarDay[] = []

  for (let index = 0; index < 42; index += 1) {
    const current = new Date(start)
    current.setDate(start.getDate() + index)
    const dateKey = getDateKey(current.getTime())
    const summary = dayMap[dateKey]
    days.push({
      dateKey,
      day: current.getDate(),
      isCurrentMonth: current.getMonth() === month,
      isToday: dateKey === todayKey,
      hasRecord: Boolean(summary),
      status: summary ? summary.status : '',
    })
  }

  return days
}

Page({
  data: {
    fontClass: 'font-medium',
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    displayYear: new Date().getFullYear(),
    displayMonth: new Date().getMonth(),
    monthTitle: '',
    calendarDays: [] as CalendarDay[],
    recentRecords: [] as RecentRecord[],
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    const settings = getSettings()
    const records = getRecords()
    const displayYear = this.data.displayYear
    const displayMonth = this.data.displayMonth
    const recentRecords = records.slice(0, 3).map((record) => ({
      ...record,
      dateText: formatDate(record.timestamp),
      timeText: formatTime(record.timestamp),
      status: getRecordStatus(record, settings.range),
    }))

    this.setData({
      fontClass: `font-${settings.fontSize}`,
      monthTitle: `${displayYear}年${displayMonth + 1}月`,
      calendarDays: buildCalendar(displayYear, displayMonth, records),
      recentRecords,
    })
  },

  prevMonth() {
    const date = new Date(this.data.displayYear, this.data.displayMonth - 1, 1)
    this.setData({
      displayYear: date.getFullYear(),
      displayMonth: date.getMonth(),
    }, () => this.refresh())
  },

  nextMonth() {
    const date = new Date(this.data.displayYear, this.data.displayMonth + 1, 1)
    this.setData({
      displayYear: date.getFullYear(),
      displayMonth: date.getMonth(),
    }, () => this.refresh())
  },

  onDayTap(event: WechatMiniprogram.TouchEvent) {
    const dataset = event.currentTarget.dataset as { date?: string; hasRecord?: boolean | string }
    const hasRecord = dataset.hasRecord === true || dataset.hasRecord === 'true'
    if (!hasRecord || !dataset.date) {
      return
    }
    wx.navigateTo({
      url: `/pages/history/history?date=${dataset.date}`,
    })
  },

  goRecord() {
    wx.navigateTo({
      url: '/pages/record/record',
    })
  },

  goHistory() {
    wx.navigateTo({
      url: '/pages/history/history',
    })
  },
})
