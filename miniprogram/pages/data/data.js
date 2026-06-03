"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const format_1 = require("../../utils/format");
const storage_1 = require("../../utils/storage");
const STATUS_TEXT = {
    normal: '正常',
    high: '偏高',
    low: '偏低',
    empty: '暂无',
};
function average(values) {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}
function compact(values) {
    return values.filter((value) => typeof value === 'number');
}
function buildTrend(records, days) {
    const dateKeys = Array.from({ length: days }, (_item, index) => (0, format_1.daysAgoKey)(days - 1 - index));
    return dateKeys.map((dateKey) => {
        const dayRecords = records.filter((record) => {
            const date = new Date(record.timestamp);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            return key === dateKey;
        });
        return {
            dateKey,
            label: dateKey.slice(5).replace('-', '/'),
            systolic: dayRecords.length ? Math.round(average(dayRecords.map((record) => record.systolic))) : null,
            diastolic: dayRecords.length ? Math.round(average(dayRecords.map((record) => record.diastolic))) : null,
            heartRate: dayRecords.length ? Math.round(average(dayRecords.map((record) => record.heartRate))) : null,
        };
    });
}
function resolveStatus(systolic, diastolic) {
    if (systolic === null || diastolic === null) {
        return 'empty';
    }
    const settings = (0, storage_1.getSettings)();
    if (systolic > settings.range.systolicMax || diastolic > settings.range.diastolicMax) {
        return 'high';
    }
    if (systolic < settings.range.systolicMin || diastolic < settings.range.diastolicMin) {
        return 'low';
    }
    return 'normal';
}
function drawGrid(ctx, width, height, padding, ticks, yFor) {
    const chartWidth = width - padding.left - padding.right;
    ctx.strokeStyle = '#E7EDF5';
    ctx.lineWidth = 1;
    ticks.forEach((tick) => {
        const y = yFor(tick);
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartWidth, y);
        ctx.stroke();
    });
    ctx.strokeStyle = '#D6DEE9';
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(padding.left + chartWidth, height - padding.bottom);
    ctx.stroke();
}
function drawLabels(ctx, points, height, padding, visibleTicks, yFor, xFor, labelStep) {
    ctx.fillStyle = '#5D6B86';
    ctx.font = '15px sans-serif';
    visibleTicks.forEach((tick) => {
        ctx.fillText(`${tick}`, 6, yFor(tick) + 5);
    });
    ctx.fillStyle = '#253A63';
    ctx.font = '14px sans-serif';
    points.forEach((point, index) => {
        const shouldShow = points.length <= 7 || index === 0 || index === points.length - 1 || index % labelStep === 0;
        if (!shouldShow) {
            return;
        }
        ctx.save();
        ctx.translate(xFor(index), height - padding.bottom + 32);
        ctx.rotate(-Math.PI / 4);
        ctx.textAlign = 'right';
        ctx.fillText(point.label, 0, 0);
        ctx.restore();
    });
}
function drawReferences(ctx, references, padding, width, yFor) {
    const chartWidth = width - padding.left - padding.right;
    references.forEach((value) => {
        const y = yFor(value);
        ctx.strokeStyle = '#9099A8';
        ctx.lineWidth = 1;
        ctx.setLineDash([7, 7]);
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartWidth, y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#788294';
        ctx.font = '12px sans-serif';
        ctx.fillText(`${value}`, padding.left + 4, y - 6);
    });
}
function drawSeries(ctx, series, xFor, yFor) {
    series.forEach((item) => {
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.beginPath();
        let started = false;
        item.values.forEach((value, index) => {
            if (value === null) {
                started = false;
                return;
            }
            const x = xFor(index);
            const y = yFor(value);
            if (!started) {
                ctx.moveTo(x, y);
                started = true;
            }
            else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        item.values.forEach((value, index) => {
            if (value === null) {
                return;
            }
            ctx.fillStyle = item.color;
            ctx.beginPath();
            ctx.arc(xFor(index), yFor(value), 4, 0, Math.PI * 2);
            ctx.fill();
        });
    });
}
function drawLineChart(bundle, points, series, options) {
    const ctx = bundle.ctx;
    const width = bundle.width;
    const height = bundle.height;
    const padding = {
        top: 22,
        right: 18,
        bottom: 74,
        left: 48,
    };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const valueRange = options.yMax - options.yMin;
    const xFor = (index) => padding.left + (points.length === 1 ? chartWidth / 2 : (chartWidth / (points.length - 1)) * index);
    const yFor = (value) => padding.top + chartHeight - ((value - options.yMin) / valueRange) * chartHeight;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    drawGrid(ctx, width, height, padding, options.ticks, yFor);
    drawReferences(ctx, options.references, padding, width, yFor);
    drawSeries(ctx, series, xFor, yFor);
    drawLabels(ctx, points, height, padding, options.visibleTicks, yFor, xFor, options.labelStep);
}
Page({
    bpBundle: null,
    hrBundle: null,
    data: {
        fontClass: 'font-medium',
        rangeDays: 7,
        points: [],
        bpEmpty: true,
        hrEmpty: true,
        averageSystolic: '--',
        averageDiastolic: '--',
        overviewStatus: 'empty',
        overviewStatusText: STATUS_TEXT.empty,
    },
    onReady() {
        this.refresh();
    },
    onShow() {
        const tabBar = this.getTabBar && this.getTabBar();
        if (tabBar) {
            tabBar.setData({ selected: 1 });
        }
        this.refresh();
    },
    changeRange(event) {
        const dataset = event.currentTarget.dataset;
        this.setData({
            rangeDays: Number(dataset.days || 7),
        }, () => this.refresh());
    },
    refresh() {
        const settings = (0, storage_1.getSettings)();
        const points = buildTrend((0, storage_1.getRecords)(), this.data.rangeDays);
        const systolicValues = compact(points.map((point) => point.systolic));
        const diastolicValues = compact(points.map((point) => point.diastolic));
        const heartRateValues = compact(points.map((point) => point.heartRate));
        const averageSystolic = systolicValues.length ? Math.round(average(systolicValues)) : null;
        const averageDiastolic = diastolicValues.length ? Math.round(average(diastolicValues)) : null;
        const overviewStatus = resolveStatus(averageSystolic, averageDiastolic);
        this.setData({
            fontClass: `font-${settings.fontSize}`,
            points,
            bpEmpty: systolicValues.length < 2 || diastolicValues.length < 2,
            hrEmpty: heartRateValues.length < 2,
            averageSystolic: averageSystolic === null ? '--' : `${averageSystolic}`,
            averageDiastolic: averageDiastolic === null ? '--' : `${averageDiastolic}`,
            overviewStatus,
            overviewStatusText: STATUS_TEXT[overviewStatus],
        }, () => {
            this.initCanvas();
        });
    },
    initCanvas() {
        const query = wx.createSelectorQuery();
        query.select('#bpCanvas').fields({ node: true, size: true });
        query.select('#hrCanvas').fields({ node: true, size: true });
        query.exec((result) => {
            const systemInfo = wx.getSystemInfoSync();
            const bpResult = result[0];
            const hrResult = result[1];
            if (bpResult && bpResult.node && bpResult.width && bpResult.height) {
                const canvas = bpResult.node;
                canvas.width = bpResult.width * systemInfo.pixelRatio;
                canvas.height = bpResult.height * systemInfo.pixelRatio;
                const ctx = canvas.getContext('2d');
                ctx.scale(systemInfo.pixelRatio, systemInfo.pixelRatio);
                this.bpBundle = {
                    canvas,
                    ctx,
                    width: bpResult.width,
                    height: bpResult.height,
                };
            }
            if (hrResult && hrResult.node && hrResult.width && hrResult.height) {
                const canvas = hrResult.node;
                canvas.width = hrResult.width * systemInfo.pixelRatio;
                canvas.height = hrResult.height * systemInfo.pixelRatio;
                const ctx = canvas.getContext('2d');
                ctx.scale(systemInfo.pixelRatio, systemInfo.pixelRatio);
                this.hrBundle = {
                    canvas,
                    ctx,
                    width: hrResult.width,
                    height: hrResult.height,
                };
            }
            this.drawCharts();
        });
    },
    drawCharts() {
        const points = this.data.points;
        const labelStep = this.data.rangeDays === 7 ? 1 : 5;
        if (!this.data.bpEmpty && this.bpBundle) {
            drawLineChart(this.bpBundle, points, [
                { values: points.map((point) => point.systolic), color: '#FF3B3F' },
                { values: points.map((point) => point.diastolic), color: '#2F7BF2' },
            ], {
                ticks: [40, 80, 120, 160, 180],
                visibleTicks: [120, 80],
                references: [120, 80],
                yMin: 40,
                yMax: 180,
                labelStep,
            });
        }
        if (!this.data.hrEmpty && this.hrBundle) {
            drawLineChart(this.hrBundle, points, [
                { values: points.map((point) => point.heartRate), color: '#52C41A' },
            ], {
                ticks: [40, 60, 80, 100, 120, 140],
                visibleTicks: [40, 140],
                references: [],
                yMin: 40,
                yMax: 140,
                labelStep,
            });
        }
    },
});
