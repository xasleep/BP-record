"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pad2 = pad2;
exports.getDateKey = getDateKey;
exports.formatDate = formatDate;
exports.formatFullDate = formatFullDate;
exports.formatTime = formatTime;
exports.daysAgoKey = daysAgoKey;
function pad2(value) {
    return value < 10 ? `0${value}` : `${value}`;
}
function getDateKey(timestamp) {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
}
function formatFullDate(timestamp) {
    const date = new Date(timestamp);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}
function daysAgoKey(offset) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    return getDateKey(date.getTime());
}
