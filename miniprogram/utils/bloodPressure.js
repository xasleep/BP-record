"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecordStatus = getRecordStatus;
exports.getDayStatus = getDayStatus;
exports.groupRecordsByDay = groupRecordsByDay;
const format_1 = require("./format");
function getRecordStatus(record, range) {
    if (record.systolic > range.systolicMax || record.diastolic > range.diastolicMax) {
        return 'high';
    }
    if (record.systolic < range.systolicMin || record.diastolic < range.diastolicMin) {
        return 'low';
    }
    return 'normal';
}
function getDayStatus(records, range) {
    const statuses = records.map((record) => getRecordStatus(record, range));
    if (statuses.includes('high')) {
        return 'high';
    }
    if (statuses.includes('low')) {
        return 'low';
    }
    return 'normal';
}
function groupRecordsByDay(records, range) {
    const grouped = {};
    records.forEach((record) => {
        const dateKey = (0, format_1.getDateKey)(record.timestamp);
        grouped[dateKey] = grouped[dateKey] || [];
        grouped[dateKey].push(record);
    });
    return Object.keys(grouped).reduce((result, dateKey) => {
        result[dateKey] = {
            dateKey,
            records: grouped[dateKey],
            status: getDayStatus(grouped[dateKey], range),
        };
        return result;
    }, {});
}
