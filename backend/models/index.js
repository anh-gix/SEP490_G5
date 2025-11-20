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
    Permission: require('./permissionModel'),
    Class: require('./classModel'),
    StudentSchedule: require('./studentScheduleModel'),
    Room: require('./room'),
    Exam: require('./examModel'),
    Submission: require('./submissionModel'),
    HomeworkSubmission: require('./homeworkSubmissionModel')
};