"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SETTINGS = void 0;
exports.getRecords = getRecords;
exports.saveRecords = saveRecords;
exports.addRecord = addRecord;
exports.getSettings = getSettings;
exports.saveSettings = saveSettings;
const RECORDS_KEY = 'bp_records';
const SETTINGS_KEY = 'bp_settings';
exports.DEFAULT_SETTINGS = {
    range: {
        systolicMin: 90,
        systolicMax: 129,
        diastolicMin: 60,
        diastolicMax: 89,
    },
    fontSize: 'medium',
};
function getRecords() {
    try {
        const records = wx.getStorageSync(RECORDS_KEY);
        return Array.isArray(records)
            ? records.sort((a, b) => b.timestamp - a.timestamp)
            : [];
    }
    catch (error) {
        return [];
    }
}
function saveRecords(records) {
    try {
        wx.setStorageSync(RECORDS_KEY, records);
        return true;
    }
    catch (error) {
        return false;
    }
}
function addRecord(record) {
    const records = getRecords();
    return saveRecords([record, ...records]);
}
function getSettings() {
    try {
        const stored = wx.getStorageSync(SETTINGS_KEY);
        if (!stored || typeof stored !== 'object') {
            return exports.DEFAULT_SETTINGS;
        }
        return {
            range: {
                ...exports.DEFAULT_SETTINGS.range,
                ...stored.range,
            },
            fontSize: stored.fontSize || exports.DEFAULT_SETTINGS.fontSize,
        };
    }
    catch (error) {
        return exports.DEFAULT_SETTINGS;
    }
}
function saveSettings(settings) {
    try {
        wx.setStorageSync(SETTINGS_KEY, settings);
        return true;
    }
    catch (error) {
        return false;
    }
}
