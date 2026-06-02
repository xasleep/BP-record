import { BloodPressureRecord } from '../../types/record'
import { addRecord, getSettings } from '../../utils/storage'

function parsePositiveInteger(value: string): number {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0
}

Page({
  data: {
    fontClass: 'font-medium',
    systolic: '',
    diastolic: '',
    heartRate: '',
    medication: '',
  },

  onShow() {
    const settings = getSettings()
    this.setData({
      fontClass: `font-${settings.fontSize}`,
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

    const timestamp = Date.now()
    const record: BloodPressureRecord = {
      id: `${timestamp}`,
      systolic,
      diastolic,
      heartRate,
      medication: this.data.medication.trim(),
      timestamp,
    }

    if (!addRecord(record)) {
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
