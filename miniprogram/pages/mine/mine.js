"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("../../utils/storage");
function isRangeValid(range) {
    return range.systolicMin > 0
        && range.systolicMax > range.systolicMin
        && range.diastolicMin > 0
        && range.diastolicMax > range.diastolicMin;
}
Page({
    data: {
        fontClass: 'font-medium',
        fontSize: 'medium',
        range: storage_1.DEFAULT_SETTINGS.range,
    },
    onShow() {
        this.loadSettings();
    },
    loadSettings() {
        const settings = (0, storage_1.getSettings)();
        this.setData({
            fontSize: settings.fontSize,
            fontClass: `font-${settings.fontSize}`,
            range: settings.range,
        });
    },
    onRangeInput(event) {
        const dataset = event.currentTarget.dataset;
        if (!dataset.field) {
            return;
        }
        const nextRange = {
            ...this.data.range,
            [dataset.field]: Number(event.detail.value),
        };
        this.setData({
            range: nextRange,
        });
        this.persist({
            range: nextRange,
            fontSize: this.data.fontSize,
        }, false);
    },
    changeFontSize(event) {
        const dataset = event.currentTarget.dataset;
        const fontSize = dataset.size || 'medium';
        this.setData({
            fontSize,
            fontClass: `font-${fontSize}`,
        });
        this.persist({
            range: this.data.range,
            fontSize,
        }, true);
    },
    restoreDefaults() {
        this.persist(storage_1.DEFAULT_SETTINGS, true);
        this.setData({
            range: storage_1.DEFAULT_SETTINGS.range,
            fontSize: storage_1.DEFAULT_SETTINGS.fontSize,
            fontClass: `font-${storage_1.DEFAULT_SETTINGS.fontSize}`,
        });
    },
    persist(settings, showSuccess) {
        if (!isRangeValid(settings.range)) {
            wx.showToast({
                title: '请检查上下限',
                icon: 'none',
            });
            return;
        }
        if (!(0, storage_1.saveSettings)(settings)) {
            wx.showToast({
                title: '保存失败',
                icon: 'none',
            });
            return;
        }
        if (showSuccess) {
            wx.showToast({
                title: '已保存',
                icon: 'success',
                duration: 800,
            });
        }
    },
});
