/**
 * Helper functions for Class Update Logic
 * Phase 3, 4, 5: Teacher/Room/Student updates and Pending class functions
 */

const mongoose = require('mongoose');
const Class = require('../models/classModel');
const ClassSchedule = require('../models/classScheduleModel');
const StudentSchedule = require('../models/studentScheduleModel');
const HomeworkSubmission = require('../models/homeworkSubmissionModel');
const Course = require('../models/courseModel');

/**
 * Helper: Convert date string to UTC midnight
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {Date} Date object at UTC midnight
 */
const toUTCMidnight = (dateString) => {
  const parts = dateString.split('-');
  if (parts.length !== 3) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
};

/**
 * Phase 3: Teacher/Room/Student Update Functions for Active Class
 */

/**
 * Update teacher for active class
 * @param {ObjectId} classId - Class ID
 * @param {ObjectId} newTeacherId - New teacher ID
 * @param {Function} checkTeacherConflicts - Conflict checking function
 * @param {Object} session - MongoDB transaction session
 * @returns {Promise<{success: boolean, updatedScheduleCount?: number, conflicts?: Array, message?: string}>}
 */
const updateTeacherForActiveClass = async (classId, newTeacherId, checkTeacherConflicts, session) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Load all future schedules
    const futureSchedules = await ClassSchedule.find({
      class: classId,
      date: { $gte: today }
    })
      .select('date startTime endTime')
      .session(session)
      .lean();

    if (futureSchedules.length === 0) {
      // No future schedules, just update class
      await Class.findByIdAndUpdate(classId, { teacher: newTeacherId }, { session });
      return {
        success: true,
        message: 'Cập nhật giáo viên thành công (không có buổi học tương lai)',
        updatedScheduleCount: 0
      };
    }

    // Extract schedule info for conflict check
    const scheduleInfo = futureSchedules.map(s => ({
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime
    }));

    // Check conflicts
    const conflictResult = await checkTeacherConflicts(newTeacherId, scheduleInfo, classId);

    if (conflictResult.hasConflict) {
      return {
        success: false,
        message: 'Giáo viên có xung đột lịch dạy',
        conflicts: conflictResult.conflicts
      };
    }

    // No conflict - proceed with update
    // Update class
    await Class.findByIdAndUpdate(classId, { teacher: newTeacherId }, { session });

    // Bulk update all future schedules
    const scheduleIds = futureSchedules.map(s => s._id);
    const updateResult = await ClassSchedule.updateMany(
      { _id: { $in: scheduleIds } },
      { $set: { teacher: newTeacherId } },
      { session }
    );

    console.log(`✅ Updated teacher for ${updateResult.modifiedCount} future schedules`);

    return {
      success: true,
      message: 'Cập nhật giáo viên thành công',
      updatedScheduleCount: updateResult.modifiedCount
    };
  } catch (error) {
    console.error('Error in updateTeacherForActiveClass:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Update room for active class
 * Note: Only updates class.room, not schedule.room (schedules keep their individual rooms)
 */
const updateRoomForActiveClass = async (classId, newRoomId, checkRoomConflicts, session) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all future schedules to check conflicts
    const futureSchedules = await ClassSchedule.find({
      class: classId,
      date: { $gte: today }
    })
      .select('date startTime endTime')
      .session(session)
      .lean();

    if (futureSchedules.length > 0) {
      const scheduleInfo = futureSchedules.map(s => ({
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime
      }));

      const conflictResult = await checkRoomConflicts(newRoomId, scheduleInfo, classId);

      if (conflictResult.hasConflict) {
        return {
          success: false,
          message: 'Phòng học có xung đột lịch sử dụng',
          conflicts: conflictResult.conflicts
        };
      }
    }

    // Update only class.room (not schedule.room)
    await Class.findByIdAndUpdate(classId, { room: newRoomId }, { session });

    return {
      success: true,
      message: 'Cập nhật phòng học thành công'
    };
  } catch (error) {
    console.error('Error in updateRoomForActiveClass:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Add students to active class
 */
const addStudentsToActiveClass = async (classId, newStudentIds, checkStudentConflicts, session) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Load all future schedules
    const futureSchedules = await ClassSchedule.find({
      class: classId,
      date: { $gte: today }
    })
      .select('_id date startTime endTime')
      .session(session)
      .lean();

    if (futureSchedules.length === 0) {
      // No future schedules, just add students to class
      await Class.findByIdAndUpdate(
        classId,
        { $addToSet: { students: { $each: newStudentIds } } },
        { session }
      );
      return {
        success: true,
        message: 'Thêm học viên thành công (không có buổi học tương lai)',
        addedStudentCount: newStudentIds.length,
        createdStudentScheduleCount: 0
      };
    }

    // Check conflicts
    const scheduleInfo = futureSchedules.map(s => ({
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime
    }));

    const conflictResult = await checkStudentConflicts(newStudentIds, scheduleInfo, classId);

    if (conflictResult.hasConflict) {
      return {
        success: false,
        message: 'Một số học viên có xung đột lịch học',
        conflicts: conflictResult.conflicts
      };
    }

    // No conflict - proceed
    // Add students to class
    await Class.findByIdAndUpdate(
      classId,
      { $addToSet: { students: { $each: newStudentIds } } },
      { session }
    );

    // Create StudentSchedule for all new students x all future schedules
    const studentSchedulesToCreate = [];
    for (const studentId of newStudentIds) {
      for (const schedule of futureSchedules) {
        studentSchedulesToCreate.push({
          student: studentId,
          classSchedule: schedule._id,
          scheduleStatus: 'scheduled'
        });
      }
    }

    // Batch insert
    if (studentSchedulesToCreate.length > 0) {
      await StudentSchedule.insertMany(studentSchedulesToCreate, { session });
    }

    console.log(`✅ Created ${studentSchedulesToCreate.length} StudentSchedule records`);

    return {
      success: true,
      message: 'Thêm học viên thành công',
      addedStudentCount: newStudentIds.length,
      createdStudentScheduleCount: studentSchedulesToCreate.length
    };
  } catch (error) {
    console.error('Error in addStudentsToActiveClass:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Phase 4: Pending Class Special Functions
 */

/**
 * Remove students from pending class
 */
const removeStudentsFromPendingClass = async (classId, studentIdsToRemove, session) => {
  try {
    // Get all ClassSchedule IDs for this class
    const classSchedules = await ClassSchedule.find({ class: classId })
      .select('_id')
      .session(session)
      .lean();
    const classScheduleIds = classSchedules.map(s => s._id);

    // Delete StudentSchedule records for these students in this class
    const deleteResult = await StudentSchedule.deleteMany({
      student: { $in: studentIdsToRemove },
      classSchedule: { $in: classScheduleIds }
    }).session(session);

    // Remove students from class.students array
    await Class.findByIdAndUpdate(
      classId,
      { $pull: { students: { $in: studentIdsToRemove } } },
      { session }
    );

    console.log(`✅ Removed ${studentIdsToRemove.length} students, deleted ${deleteResult.deletedCount} StudentSchedule records`);

    return {
      success: true,
      message: 'Xóa học viên thành công',
      removedStudentCount: studentIdsToRemove.length,
      deletedStudentScheduleCount: deleteResult.deletedCount
    };
  } catch (error) {
    console.error('Error in removeStudentsFromPendingClass:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Regenerate all schedules when course changes
 */
const regenerateAllSchedules = async (classId, newCourseId, classData, session) => {
  try {
    // Get all old ClassSchedule IDs
    const oldSchedules = await ClassSchedule.find({ class: classId })
      .select('_id')
      .session(session)
      .lean();
    const oldScheduleIds = oldSchedules.map(s => s._id);

    // Delete CASCADE
    if (oldScheduleIds.length > 0) {
      await HomeworkSubmission.deleteMany({ classSchedule: { $in: oldScheduleIds } }).session(session);
      await StudentSchedule.deleteMany({ classSchedule: { $in: oldScheduleIds } }).session(session);
      await ClassSchedule.deleteMany({ class: classId }).session(session);
      console.log(`✅ Deleted ${oldScheduleIds.length} old schedules and related data`);
    }

    // Update class with new course
    await Class.findByIdAndUpdate(classId, { course: newCourseId }, { session });

    // Load new course data
    const courseData = await Course.findById(newCourseId)
      .populate('sessions', 'order _id')
      .select('numberOfSessions sessions')
      .session(session)
      .lean();

    if (!courseData) {
      return { success: false, message: 'Không tìm thấy khóa học mới' };
    }

    const numberOfSessions = courseData.numberOfSessions || courseData.sessions?.length || 0;

    if (numberOfSessions === 0) {
      return {
        success: true,
        message: 'Cập nhật khóa học thành công (khóa học mới không có sessions)',
        deletedScheduleCount: oldScheduleIds.length,
        createdScheduleCount: 0
      };
    }

    // Need scheduleEntries and startDate from classData to generate new schedules
    if (!classData.scheduleEntries || classData.scheduleEntries.length === 0 || !classData.startDate) {
      return {
        success: true,
        message: 'Cập nhật khóa học thành công. Vui lòng thêm lịch học và ngày khai giảng để tạo schedules.',
        deletedScheduleCount: oldScheduleIds.length,
        createdScheduleCount: 0
      };
    }

    // Generate new schedules using existing pattern
    // (Reuse logic from createClass - generate dates based on scheduleEntries)
    const courseSessions = (courseData.sessions || []).sort((a, b) => (a.order || 0) - (b.order || 0));

    // This would require importing the schedule generation logic
    // For now, return success and let user manually create schedules
    // TODO: Implement full schedule generation here

    return {
      success: true,
      message: 'Cập nhật khóa học thành công. Vui lòng kiểm tra lại lịch học.',
      deletedScheduleCount: oldScheduleIds.length,
      createdScheduleCount: 0,
      warning: 'Cần tạo lại lịch học thủ công hoặc sử dụng tính năng generate schedules'
    };
  } catch (error) {
    console.error('Error in regenerateAllSchedules:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Recalculate schedule dates when startDate changes
 */
const recalculateScheduleDates = async (classId, newStartDate, session) => {
  try {
    // Load class data to get necessary info
    const classData = await Class.findById(classId)
      .select('course teacher room students')
      .session(session)
      .lean();

    if (!classData) {
      return {
        success: false,
        message: 'Không tìm thấy lớp học'
      };
    }

    // Load existing schedules to extract pattern
    const existingSchedules = await ClassSchedule.find({ class: classId })
      .sort({ date: 1 })
      .select('date startTime endTime room teacher session')
      .session(session)
      .lean();

    if (existingSchedules.length === 0) {
      // No schedules to recalculate, just update startDate
      await Class.findByIdAndUpdate(classId, { startDate: newStartDate }, { session });
      return {
        success: true,
        message: 'Cập nhật ngày khai giảng thành công (không có schedules)',
        recalculatedScheduleCount: 0
      };
    }

    // Extract schedule pattern from existing schedules
    const dayNames = ['CN', '2', '3', '4', '5', '6', '7'];
    const scheduleMap = new Map();

    existingSchedules.forEach(schedule => {
      if (!schedule.date || !schedule.startTime || !schedule.endTime) return;

      const date = new Date(schedule.date);
      if (isNaN(date.getTime())) return;

      const dayOfWeek = date.getDay();
      const day = dayNames[dayOfWeek];
      const startTime = schedule.startTime.trim();
      const endTime = schedule.endTime.trim();

      const key = `${day}-${startTime}-${endTime}`;
      if (!scheduleMap.has(key)) {
        scheduleMap.set(key, { day, startTime, endTime });
      }
    });

    const scheduleEntries = Array.from(scheduleMap.values()).sort((a, b) => {
      const dayOrder = { 'CN': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6 };
      return dayOrder[a.day] - dayOrder[b.day];
    });

    if (scheduleEntries.length === 0) {
      return {
        success: false,
        message: 'Không thể trích xuất pattern từ schedules hiện có'
      };
    }

    console.log('📋 Extracted schedule pattern:', scheduleEntries);

    // Get course info
    const Course = require('../models/courseModel');
    const courseData = await Course.findById(classData.course)
      .populate('sessions', 'order _id')
      .select('numberOfSessions sessions')
      .session(session)
      .lean();

    if (!courseData) {
      return {
        success: false,
        message: 'Không tìm thấy khóa học'
      };
    }

    const numberOfSessions = courseData.numberOfSessions || existingSchedules.length;
    const courseSessions = (courseData.sessions || []).sort((a, b) => (a.order || 0) - (b.order || 0));

    // Delete old schedules and related data
    const oldScheduleIds = existingSchedules.map(s => s._id);
    const HomeworkSubmission = require('../models/homeworkSubmissionModel');
    const StudentSchedule = require('../models/studentScheduleModel');

    if (oldScheduleIds.length > 0) {
      await HomeworkSubmission.deleteMany({ classSchedule: { $in: oldScheduleIds } }).session(session);
      await StudentSchedule.deleteMany({ classSchedule: { $in: oldScheduleIds } }).session(session);
      await ClassSchedule.deleteMany({ class: classId }).session(session);
      console.log(`🗑️ Deleted ${oldScheduleIds.length} old schedules and related data`);
    }

    // Generate new schedules using the same logic as createClass
    const getDayOfWeekNumber = (dayStr) => {
      const dayMap = {
        'CN': 0,
        '2': 1,
        '3': 2,
        '4': 3,
        '5': 4,
        '6': 5,
        '7': 6
      };
      return dayMap[dayStr] !== undefined ? dayMap[dayStr] : null;
    };

    const findNextDayOfWeek = (startDate, targetDayOfWeek) => {
      const start = new Date(startDate);
      const currentDay = start.getDay();
      let daysToAdd = (targetDayOfWeek - currentDay + 7) % 7;
      if (daysToAdd === 0 && start.getTime() < new Date().getTime()) {
        daysToAdd = 7;
      }
      const result = new Date(start);
      result.setDate(start.getDate() + daysToAdd);
      return result;
    };

    // Find first occurrence of each day of week
    const firstOccurrences = {};
    scheduleEntries.forEach(entry => {
      const dayOfWeek = getDayOfWeekNumber(entry.day);
      if (dayOfWeek !== null && !firstOccurrences[dayOfWeek]) {
        firstOccurrences[dayOfWeek] = findNextDayOfWeek(newStartDate, dayOfWeek);
      }
    });

    // Generate new ClassSchedule entries
    const newSchedules = [];
    let entryIndex = 0;
    let weekOffset = 0;

    for (let i = 0; i < numberOfSessions; i++) {
      const entry = scheduleEntries[entryIndex % scheduleEntries.length];
      const dayOfWeek = getDayOfWeekNumber(entry.day);

      if (dayOfWeek === null) {
        entryIndex++;
        continue;
      }

      const firstOccurrence = firstOccurrences[dayOfWeek];
      const sessionDate = new Date(firstOccurrence);
      sessionDate.setDate(firstOccurrence.getDate() + (weekOffset * 7));

      const sessionIndex = i < courseSessions.length ? i : i % courseSessions.length;
      const sessionId = courseSessions[sessionIndex]?._id || null;

      newSchedules.push({
        class: classId,
        session: sessionId,
        date: sessionDate,
        startTime: entry.startTime,
        endTime: entry.endTime,
        room: classData.room,
        teacher: classData.teacher,
        createdBy: classData.teacher,
        status: 'fixed'
      });

      entryIndex++;
      if (entryIndex % scheduleEntries.length === 0) {
        weekOffset++;
      }
    }

    // Create new schedules
    const createdSchedules = await ClassSchedule.insertMany(newSchedules, { session });
    console.log(`✅ Created ${createdSchedules.length} new schedules`);

    // Create StudentSchedule entries
    if (classData.students && classData.students.length > 0) {
      const studentSchedules = [];
      createdSchedules.forEach(schedule => {
        classData.students.forEach(studentId => {
          studentSchedules.push({
            student: studentId,
            classSchedule: schedule._id
          });
        });
      });

      if (studentSchedules.length > 0) {
        await StudentSchedule.insertMany(studentSchedules, { session });
        console.log(`✅ Created ${studentSchedules.length} student schedule entries`);
      }
    }

    // Update class startDate
    await Class.findByIdAndUpdate(classId, { startDate: newStartDate }, { session });

    return {
      success: true,
      message: 'Đã tạo lại toàn bộ lịch học với ngày khai giảng mới',
      recalculatedScheduleCount: createdSchedules.length,
      deletedScheduleCount: oldScheduleIds.length
    };
  } catch (error) {
    console.error('Error in recalculateScheduleDates:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Update teacher for pending class (updates ALL schedules, not just future)
 */
const updateTeacherForPendingClass = async (classId, newTeacherId, checkTeacherConflicts, session) => {
  try {
    // Load ALL schedules (not just future)
    const allSchedules = await ClassSchedule.find({ class: classId })
      .select('date startTime endTime')
      .session(session)
      .lean();

    if (allSchedules.length === 0) {
      await Class.findByIdAndUpdate(classId, { teacher: newTeacherId }, { session });
      return {
        success: true,
        message: 'Cập nhật giáo viên thành công (không có buổi học)',
        updatedScheduleCount: 0
      };
    }

    const scheduleInfo = allSchedules.map(s => ({
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime
    }));

    const conflictResult = await checkTeacherConflicts(newTeacherId, scheduleInfo, classId);

    if (conflictResult.hasConflict) {
      return {
        success: false,
        message: 'Giáo viên có xung đột lịch dạy',
        conflicts: conflictResult.conflicts
      };
    }

    await Class.findByIdAndUpdate(classId, { teacher: newTeacherId }, { session });

    const scheduleIds = allSchedules.map(s => s._id);
    const updateResult = await ClassSchedule.updateMany(
      { _id: { $in: scheduleIds } },
      { $set: { teacher: newTeacherId } },
      { session }
    );

    console.log(`✅ Updated teacher for ${updateResult.modifiedCount} schedules`);

    return {
      success: true,
      message: 'Cập nhật giáo viên thành công',
      updatedScheduleCount: updateResult.modifiedCount
    };
  } catch (error) {
    console.error('Error in updateTeacherForPendingClass:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Add students to pending class (create StudentSchedule for ALL schedules)
 */
const addStudentsToPendingClass = async (classId, newStudentIds, checkStudentConflicts, session) => {
  try {
    const allSchedules = await ClassSchedule.find({ class: classId })
      .select('_id date startTime endTime')
      .session(session)
      .lean();

    if (allSchedules.length === 0) {
      await Class.findByIdAndUpdate(
        classId,
        { $addToSet: { students: { $each: newStudentIds } } },
        { session }
      );
      return {
        success: true,
        message: 'Thêm học viên thành công (không có buổi học)',
        addedStudentCount: newStudentIds.length,
        createdStudentScheduleCount: 0
      };
    }

    const scheduleInfo = allSchedules.map(s => ({
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime
    }));

    const conflictResult = await checkStudentConflicts(newStudentIds, scheduleInfo, classId);

    if (conflictResult.hasConflict) {
      return {
        success: false,
        message: 'Một số học viên có xung đột lịch học',
        conflicts: conflictResult.conflicts
      };
    }

    await Class.findByIdAndUpdate(
      classId,
      { $addToSet: { students: { $each: newStudentIds } } },
      { session }
    );

    const studentSchedulesToCreate = [];
    for (const studentId of newStudentIds) {
      for (const schedule of allSchedules) {
        studentSchedulesToCreate.push({
          student: studentId,
          classSchedule: schedule._id,
          scheduleStatus: 'scheduled'
        });
      }
    }

    if (studentSchedulesToCreate.length > 0) {
      await StudentSchedule.insertMany(studentSchedulesToCreate, { session });
    }

    console.log(`✅ Created ${studentSchedulesToCreate.length} StudentSchedule records`);

    return {
      success: true,
      message: 'Thêm học viên thành công',
      addedStudentCount: newStudentIds.length,
      createdStudentScheduleCount: studentSchedulesToCreate.length
    };
  } catch (error) {
    console.error('Error in addStudentsToPendingClass:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

module.exports = {
  updateTeacherForActiveClass,
  updateRoomForActiveClass,
  addStudentsToActiveClass,
  removeStudentsFromPendingClass,
  regenerateAllSchedules,
  recalculateScheduleDates,
  updateTeacherForPendingClass,
  addStudentsToPendingClass
};
