"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bloodPressure_1 = require("../../utils/bloodPressure");
const format_1 = require("../../utils/format");
const storage_1 = require("../../utils/storage");
const STATUS_TEXT = {
    normal: '正常',
    high: '偏高',
    low: '偏低',
};
Page({
    data: {
        fontClass: 'font-medium',
        filterDate: '',
        dateTitle: '',
        records: [],
    },
    onLoad(options) {
        this.setData({
            filterDate: options.date || '',
        });
    },
    onShow() {
        this.refresh();
    },
    refresh() {
        const settings = (0, storage_1.getSettings)();
        const filterDate = this.data.filterDate;
        const records = (0, storage_1.getRecords)()
            .filter((record) => !filterDate || (0, format_1.getDateKey)(record.timestamp) === filterDate)
            .map((record) => {
            const status = (0, bloodPressure_1.getRecordStatus)(record, settings.range);
            return {
                ...record,
                dateText: (0, format_1.formatFullDate)(record.timestamp),
                timeText: (0, format_1.formatTime)(record.timestamp),
                status,
                statusText: STATUS_TEXT[status],
            };
        });
        this.setData({
            fontClass: `font-${settings.fontSize}`,
            dateTitle: filterDate ? filterDate.replace(/-/g, '/') : '',
            records,
        });
    },
    clearFilter() {
        this.setData({
            filterDate: '',
        }, () => this.refresh());
    },
});
