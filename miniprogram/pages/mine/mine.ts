import { BloodPressureRange, FontSizeLevel, UserSettings } from '../../types/record'
import { DEFAULT_SETTINGS, getSettings, saveSettings } from '../../utils/storage'

type RangeField = keyof BloodPressureRange

function isRangeValid(range: BloodPressureRange): boolean {
  return range.systolicMin > 0
    && range.systolicMax > range.systolicMin
    && range.diastolicMin > 0
    && range.diastolicMax > range.diastolicMin
}

Page({
  data: {
    fontClass: 'font-medium',
    fontSize: 'medium' as FontSizeLevel,
    range: DEFAULT_SETTINGS.range,
  },

  onShow() {
    const tabBar = this.getTabBar && this.getTabBar()
    if (tabBar) {
      tabBar.setData({ selected: 2 })
    }
    this.loadSettings()
  },

  loadSettings() {
    const settings = getSettings()
    this.setData({
      fontSize: settings.fontSize,
      fontClass: `font-${settings.fontSize}`,
      range: settings.range,
    })
  },

  onRangeInput(event: WechatMiniprogram.Input) {
    const dataset = event.currentTarget.dataset as { field?: RangeField }
    if (!dataset.field) {
      return
    }

    const nextRange: BloodPressureRange = {
      ...this.data.range,
      [dataset.field]: Number(event.detail.value),
    }
    this.setData({
      range: nextRange,
    })
    this.persist({
      range: nextRange,
      fontSize: this.data.fontSize,
    }, false)
  },

  changeFontSize(event: WechatMiniprogram.TouchEvent) {
    const dataset = event.currentTarget.dataset as { size?: FontSizeLevel }
    const fontSize = dataset.size || 'medium'
    this.setData({
      fontSize,
      fontClass: `font-${fontSize}`,
    })
    this.persist({
      range: this.data.range,
      fontSize,
    }, true)
  },

  restoreDefaults() {
    this.persist(DEFAULT_SETTINGS, true)
    this.setData({
      range: DEFAULT_SETTINGS.range,
      fontSize: DEFAULT_SETTINGS.fontSize,
      fontClass: `font-${DEFAULT_SETTINGS.fontSize}`,
    })
  },

  persist(settings: UserSettings, showSuccess: boolean) {
    if (!isRangeValid(settings.range)) {
      wx.showToast({
        title: '请检查上下限',
        icon: 'none',
      })
      return
    }

    if (!saveSettings(settings)) {
      wx.showToast({
        title: '保存失败',
        icon: 'none',
      })
      return
    }

    if (showSuccess) {
      wx.showToast({
        title: '已保存',
        icon: 'success',
        duration: 800,
      })
    }
  },
})
