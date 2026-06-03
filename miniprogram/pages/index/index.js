"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bloodPressure_1 = require("../../utils/bloodPressure");
const format_1 = require("../../utils/format");
const storage_1 = require("../../utils/storage");
function buildCalendar(year, month, records) {
    const settings = (0, storage_1.getSettings)();
    const dayMap = (0, bloodPressure_1.groupRecordsByDay)(records, settings.range);
    const firstDate = new Date(year, month, 1);
    const start = new Date(year, month, 1 - firstDate.getDay());
    const todayKey = (0, format_1.getDateKey)(Date.now());
    const days = [];
    for (let index = 0; index < 42; index += 1) {
        const current = new Date(start);
        current.setDate(start.getDate() + index);
        const dateKey = (0, format_1.getDateKey)(current.getTime());
        const summary = dayMap[dateKey];
        days.push({
            dateKey,
            day: current.getDate(),
            isCurrentMonth: current.getMonth() === month,
            isToday: dateKey === todayKey,
            hasRecord: Boolean(summary),
            status: summary ? summary.status : '',
        });
    }
    return days;
}
Page({
    data: {
        fontClass: 'font-medium',
        weekdays: ['日', '一', '二', '三', '四', '五', '六'],
        displayYear: new Date().getFullYear(),
        displayMonth: new Date().getMonth(),
        monthTitle: '',
        calendarDays: [],
        recentRecords: [],
    },
    onShow() {
        const tabBar = this.getTabBar && this.getTabBar();
        if (tabBar) {
            tabBar.setData({ selected: 0 });
        }
        this.refresh();
    },
    refresh() {
        const settings = (0, storage_1.getSettings)();
        const records = (0, storage_1.getRecords)();
        const displayYear = this.data.displayYear;
        const displayMonth = this.data.displayMonth;
        const recentRecords = records.slice(0, 3).map((record) => ({
            ...record,
            dateText: (0, format_1.formatDate)(record.timestamp),
            timeText: (0, format_1.formatTime)(record.timestamp),
            status: (0, bloodPressure_1.getRecordStatus)(record, settings.range),
        }));
        this.setData({
            fontClass: `font-${settings.fontSize}`,
            monthTitle: `${displayYear}年${displayMonth + 1}月`,
            calendarDays: buildCalendar(displayYear, displayMonth, records),
            recentRecords,
        });
    },
    prevMonth() {
        const date = new Date(this.data.displayYear, this.data.displayMonth - 1, 1);
        this.setData({
            displayYear: date.getFullYear(),
            displayMonth: date.getMonth(),
        }, () => this.refresh());
    },
    nextMonth() {
        const date = new Date(this.data.displayYear, this.data.displayMonth + 1, 1);
        this.setData({
            displayYear: date.getFullYear(),
            displayMonth: date.getMonth(),
        }, () => this.refresh());
    },
    onDayTap(event) {
        const dataset = event.currentTarget.dataset;
        const hasRecord = dataset.hasRecord === true || dataset.hasRecord === 'true';
        if (!hasRecord || !dataset.date) {
            return;
        }
        wx.navigateTo({
            url: `/pages/history/history?date=${dataset.date}`,
        });
    },
    goRecord() {
        wx.navigateTo({
            url: '/pages/record/record',
        });
    },
    goHistory() {
        wx.navigateTo({
            url: '/pages/history/history',
        });
    },
});
