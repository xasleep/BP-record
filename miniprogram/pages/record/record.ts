import { BloodPressureRecord } from '../../types/record'
import { formatTime, getDateKey } from '../../utils/format'
import { addRecord, getRecordById, getSettings, updateRecord } from '../../utils/storage'

function parsePositiveInteger(value: string): number {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0
}

function buildTimestamp(dateValue: string, timeValue: string): number {
  const dateParts = dateValue.split('-').map((part) => Number(part))
  const timeParts = timeValue.split(':').map((part) => Number(part))
  if (dateParts.length !== 3 || timeParts.length !== 2) {
    return NaN
  }

  const [year, month, day] = dateParts
  const [hour, minute] = timeParts
  return new Date(year, month - 1, day, hour, minute, 0, 0).getTime()
}

Page({
  data: {
    fontClass: 'font-medium',
    editingId: '',
    recordDate: '',
    recordTime: '',
    systolic: '',
    diastolic: '',
    heartRate: '',
    medication: '',
    submitText: '保存记录',
  },

  onLoad(options: Record<string, string | undefined>) {
    const editingId = options.id || ''
    if (editingId) {
      this.loadRecord(editingId)
      return
    }

    this.setNow()
  },

  onShow() {
    const settings = getSettings()
    this.setData({
      fontClass: `font-${settings.fontSize}`,
    })
  },

  setNow() {
    const now = Date.now()
    this.setData({
      recordDate: getDateKey(now),
      recordTime: formatTime(now),
    })
  },

  loadRecord(id: string) {
    const record = getRecordById(id)
    if (!record) {
      wx.showToast({
        title: '记录不存在',
        icon: 'none',
      })
      setTimeout(() => {
        wx.navigateBack({ delta: 1 })
      }, 900)
      return
    }

    wx.setNavigationBarTitle({
      title: '编辑记录',
    })

    this.setData({
      editingId: id,
      recordDate: getDateKey(record.timestamp),
      recordTime: formatTime(record.timestamp),
      systolic: `${record.systolic}`,
      diastolic: `${record.diastolic}`,
      heartRate: `${record.heartRate}`,
      medication: record.medication,
      submitText: '保存修改',
    })
  },

  onDateChange(event: WechatMiniprogram.PickerChange) {
    this.setData({
      recordDate: String(event.detail.value),
    })
  },

  onTimeChange(event: WechatMiniprogram.PickerChange) {
    this.setData({
      recordTime: String(event.detail.value),
    })
  },

  onSystolicInput(event: WechatMiniprogram.Input) {
    this.setData({
      systolic: event.detail.value,
    })
  },

  onDiastolicInput(event: WechatMiniprogram.Input) {
    this.setData({
      diastolic: event.detail.value,
    })
  },

  onHeartRateInput(event: WechatMiniprogram.Input) {
    this.setData({
      heartRate: event.detail.value,
    })
  },

  onMedicationInput(event: WechatMiniprogram.Input) {
    this.setData({
      medication: event.detail.value,
    })
  },

  submitRecord() {
    const systolic = parsePositiveInteger(this.data.systolic)
    const diastolic = parsePositiveInteger(this.data.diastolic)
    const heartRate = parsePositiveInteger(this.data.heartRate)

    if (!systolic || !diastolic || !heartRate) {
      wx.showToast({
        title: '请填写有效数字',
        icon: 'none',
      })
      return
    }

    if (heartRate < 30 || heartRate > 250) {
      wx.showToast({
        title: '心率需在30-250',
        icon: 'none',
      })
      return
    }

    const timestamp = buildTimestamp(this.data.recordDate, this.data.recordTime)
    if (!Number.isFinite(timestamp)) {
      wx.showToast({
        title: '请选择测量时间',
        icon: 'none',
      })
      return
    }

    const record: BloodPressureRecord = {
      id: this.data.editingId || `${timestamp}`,
      systolic,
      diastolic,
      heartRate,
      medication: this.data.medication.trim(),
      timestamp,
    }

    const saved = this.data.editingId ? updateRecord(record) : addRecord(record)
    if (!saved) {
      wx.showToast({
        title: '保存失败',
        icon: 'none',
      })
      return
    }

    wx.showToast({
      title: '已保存',
      icon: 'success',
      duration: 900,
    })

    setTimeout(() => {
      wx.navigateBack({
        delta: 1,
      })
    }, 900)
  },
})
