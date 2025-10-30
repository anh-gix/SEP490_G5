const mongoose = require('mongoose');

module.exports = {
    Program: require('./programModel'),
    Course: require('./courseModel'),
    ClassSchedule: require('./classScheduleModel'),
    CLO: require('./cloModel'),
    PLO: require('./ploModel'),
    Session: require('./sessionModel'),
    User: require('./userModel'),
    Role: require('./roleModel'),
    // Thêm các mô hình khác ở đây nếu cần
};