"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const format_1 = require("../../utils/format");
const storage_1 = require("../../utils/storage");
function parsePositiveInteger(value) {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}
function buildTimestamp(dateValue, timeValue) {
    const dateParts = dateValue.split('-').map((part) => Number(part));
    const timeParts = timeValue.split(':').map((part) => Number(part));
    if (dateParts.length !== 3 || timeParts.length !== 2) {
        return NaN;
    }
    const [year, month, day] = dateParts;
    const [hour, minute] = timeParts;
    return new Date(year, month - 1, day, hour, minute, 0, 0).getTime();
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
    onLoad(options) {
        const editingId = options.id || '';
        if (editingId) {
            this.loadRecord(editingId);
            return;
        }
        this.setNow();
    },
    onShow() {
        const settings = (0, storage_1.getSettings)();
        this.setData({
            fontClass: `font-${settings.fontSize}`,
        });
    },
    setNow() {
        const now = Date.now();
        this.setData({
            recordDate: (0, format_1.getDateKey)(now),
            recordTime: (0, format_1.formatTime)(now),
        });
    },
    loadRecord(id) {
        const record = (0, storage_1.getRecordById)(id);
        if (!record) {
            wx.showToast({
                title: '记录不存在',
                icon: 'none',
            });
            setTimeout(() => {
                wx.navigateBack({ delta: 1 });
            }, 900);
            return;
        }
        wx.setNavigationBarTitle({
            title: '编辑记录',
        });
        this.setData({
            editingId: id,
            recordDate: (0, format_1.getDateKey)(record.timestamp),
            recordTime: (0, format_1.formatTime)(record.timestamp),
            systolic: `${record.systolic}`,
            diastolic: `${record.diastolic}`,
            heartRate: `${record.heartRate}`,
            medication: record.medication,
            submitText: '保存修改',
        });
    },
    onDateChange(event) {
        this.setData({
            recordDate: String(event.detail.value),
        });
    },
    onTimeChange(event) {
        this.setData({
            recordTime: String(event.detail.value),
        });
    },
    onSystolicInput(event) {
        this.setData({
            systolic: event.detail.value,
        });
    },
    onDiastolicInput(event) {
        this.setData({
            diastolic: event.detail.value,
        });
    },
    onHeartRateInput(event) {
        this.setData({
            heartRate: event.detail.value,
        });
    },
    onMedicationInput(event) {
        this.setData({
            medication: event.detail.value,
        });
    },
    submitRecord() {
        const systolic = parsePositiveInteger(this.data.systolic);
        const diastolic = parsePositiveInteger(this.data.diastolic);
        const heartRate = parsePositiveInteger(this.data.heartRate);
        if (!systolic || !diastolic || !heartRate) {
            wx.showToast({
                title: '请填写有效数字',
                icon: 'none',
            });
            return;
        }
        if (heartRate < 30 || heartRate > 250) {
            wx.showToast({
                title: '心率需在30-250',
                icon: 'none',
            });
            return;
        }
        const timestamp = buildTimestamp(this.data.recordDate, this.data.recordTime);
        if (!Number.isFinite(timestamp)) {
            wx.showToast({
                title: '请选择测量时间',
                icon: 'none',
            });
            return;
        }
        const record = {
            id: this.data.editingId || `${timestamp}`,
            systolic,
            diastolic,
            heartRate,
            medication: this.data.medication.trim(),
            timestamp,
        };
        const saved = this.data.editingId ? (0, storage_1.updateRecord)(record) : (0, storage_1.addRecord)(record);
        if (!saved) {
            wx.showToast({
                title: '保存失败',
                icon: 'none',
            });
            return;
        }
        wx.showToast({
            title: '已保存',
            icon: 'success',
            duration: 900,
        });
        setTimeout(() => {
            wx.navigateBack({
                delta: 1,
            });
        }, 900);
    },
});
