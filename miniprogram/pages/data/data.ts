import { BloodPressureRecord } from '../../types/record'
import { daysAgoKey } from '../../utils/format'
import { getRecords, getSettings } from '../../utils/storage'

interface TrendPoint {
  dateKey: string
  label: string
  systolic: number
  diastolic: number
  heartRate: number
}

interface ChartSeries {
  values: number[]
  color: string
}

interface CanvasBundle {
  canvas: WechatMiniprogram.Canvas
  ctx: WechatMiniprogram.CanvasContext
  width: number
  height: number
}

interface CanvasNodeResult {
  node?: WechatMiniprogram.Canvas
  width?: number
  height?: number
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function buildTrend(records: BloodPressureRecord[], days: number): TrendPoint[] {
  const dateKeys = Array.from({ length: days }, (_item, index) => daysAgoKey(days - 1 - index))
  return dateKeys.reduce<TrendPoint[]>((points, dateKey) => {
    const dayRecords = records.filter((record) => {
      const date = new Date(record.timestamp)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      return key === dateKey
    })

    if (dayRecords.length > 0) {
      const monthDay = dateKey.slice(5).replace('-', '/')
      points.push({
        dateKey,
        label: monthDay,
        systolic: Math.round(average(dayRecords.map((record) => record.systolic))),
        diastolic: Math.round(average(dayRecords.map((record) => record.diastolic))),
        heartRate: Math.round(average(dayRecords.map((record) => record.heartRate))),
      })
    }

    return points
  }, [])
}

function drawLineChart(bundle: CanvasBundle, points: TrendPoint[], series: ChartSeries[], unit: string, references: number[]): void {
  const ctx = bundle.ctx as any
  const width = bundle.width
  const height = bundle.height
  const padding = {
    top: 28,
    right: 22,
    bottom: 44,
    left: 42,
  }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  const allValues = series.reduce<number[]>((result, item) => result.concat(item.values), references.slice())
  const minValue = Math.max(0, Math.floor((Math.min(...allValues) - 12) / 10) * 10)
  const maxValue = Math.ceil((Math.max(...allValues) + 12) / 10) * 10
  const valueRange = Math.max(1, maxValue - minValue)
  const xFor = (index: number) => padding.left + (points.length === 1 ? chartWidth / 2 : (chartWidth / (points.length - 1)) * index)
  const yFor = (value: number) => padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight

  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, width, height)
  ctx.strokeStyle = '#E5E7EB'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(padding.left, padding.top)
  ctx.lineTo(padding.left, padding.top + chartHeight)
  ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight)
  ctx.stroke()

  ctx.fillStyle = '#6B7280'
  ctx.font = '12px sans-serif'
  ctx.fillText(`${maxValue}${unit}`, 4, padding.top + 4)
  ctx.fillText(`${minValue}`, 12, padding.top + chartHeight)

  references.forEach((value) => {
    const y = yFor(value)
    ctx.strokeStyle = '#999999'
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(padding.left + chartWidth, y)
    ctx.stroke()
    ctx.setLineDash([])
  })

  series.forEach((item) => {
    ctx.strokeStyle = item.color
    ctx.lineWidth = 2
    ctx.beginPath()
    item.values.forEach((value, index) => {
      const x = xFor(index)
      const y = yFor(value)
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    item.values.forEach((value, index) => {
      ctx.fillStyle = item.color
      ctx.beginPath()
      ctx.arc(xFor(index), yFor(value), 3, 0, Math.PI * 2)
      ctx.fill()
    })
  })

  ctx.fillStyle = '#6B7280'
  points.forEach((point, index) => {
    if (index === 0 || index === points.length - 1 || points.length <= 7) {
      ctx.fillText(point.label, xFor(index) - 14, height - 14)
    }
  })
}

Page({
  bpBundle: null as CanvasBundle | null,
  hrBundle: null as CanvasBundle | null,

  data: {
    fontClass: 'font-medium',
    rangeDays: 7,
    points: [] as TrendPoint[],
    bpEmpty: true,
    hrEmpty: true,
  },

  onReady() {
    this.initCanvas()
  },

  onShow() {
    const tabBar = this.getTabBar && this.getTabBar()
    if (tabBar) {
      tabBar.setData({ selected: 1 })
    }
    this.refresh()
  },

  changeRange(event: WechatMiniprogram.TouchEvent) {
    const dataset = event.currentTarget.dataset as { days?: number }
    this.setData({
      rangeDays: Number(dataset.days || 7),
    }, () => this.refresh())
  },

  refresh() {
    const settings = getSettings()
    const points = buildTrend(getRecords(), this.data.rangeDays)
    this.setData({
      fontClass: `font-${settings.fontSize}`,
      points,
      bpEmpty: points.length < 2,
      hrEmpty: points.length < 2,
    }, () => this.drawCharts())
  },

  initCanvas() {
    const query = wx.createSelectorQuery()
    query.select('#bpCanvas').fields({ node: true, size: true })
    query.select('#hrCanvas').fields({ node: true, size: true })
    query.exec((result) => {
      const systemInfo = wx.getSystemInfoSync()
      const bpResult = result[0] as CanvasNodeResult
      const hrResult = result[1] as CanvasNodeResult

      if (bpResult && bpResult.node) {
        const canvas = bpResult.node as WechatMiniprogram.Canvas
        canvas.width = Number(bpResult.width) * systemInfo.pixelRatio
        canvas.height = Number(bpResult.height) * systemInfo.pixelRatio
        const ctx = canvas.getContext('2d') as unknown as WechatMiniprogram.CanvasContext
        ;(ctx as any).scale(systemInfo.pixelRatio, systemInfo.pixelRatio)
        this.bpBundle = {
          canvas,
          ctx,
          width: Number(bpResult.width),
          height: Number(bpResult.height),
        }
      }

      if (hrResult && hrResult.node) {
        const canvas = hrResult.node as WechatMiniprogram.Canvas
        canvas.width = Number(hrResult.width) * systemInfo.pixelRatio
        canvas.height = Number(hrResult.height) * systemInfo.pixelRatio
        const ctx = canvas.getContext('2d') as unknown as WechatMiniprogram.CanvasContext
        ;(ctx as any).scale(systemInfo.pixelRatio, systemInfo.pixelRatio)
        this.hrBundle = {
          canvas,
          ctx,
          width: Number(hrResult.width),
          height: Number(hrResult.height),
        }
      }

      this.drawCharts()
    })
  },

  drawCharts() {
    const points = this.data.points
    if (points.length < 2) {
      return
    }

    if (this.bpBundle) {
      drawLineChart(this.bpBundle, points, [
        { values: points.map((point) => point.systolic), color: '#FF4D4F' },
        { values: points.map((point) => point.diastolic), color: '#4A90D9' },
      ], 'mmHg', [120, 80])
    }

    if (this.hrBundle) {
      drawLineChart(this.hrBundle, points, [
        { values: points.map((point) => point.heartRate), color: '#52C41A' },
      ], '', [])
    }
  },
})
