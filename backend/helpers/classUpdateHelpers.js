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
    // Load class to get scheduleEntries pattern
    const classData = await Class.findById(classId)
      .select('scheduleEntries')
      .session(session)
      .lean();

    if (!classData || !classData.scheduleEntries || classData.scheduleEntries.length === 0) {
      // No pattern, just update startDate
      await Class.findByIdAndUpdate(classId, { startDate: newStartDate }, { session });
      return {
        success: true,
        message: 'Cập nhật ngày khai giảng thành công (không có pattern lịch học)',
        recalculatedScheduleCount: 0
      };
    }

    // Load all schedules sorted by date
    const allSchedules = await ClassSchedule.find({ class: classId })
      .sort({ date: 1 })
      .select('_id date')
      .session(session)
      .lean();

    if (allSchedules.length === 0) {
      await Class.findByIdAndUpdate(classId, { startDate: newStartDate }, { session });
      return {
        success: true,
        message: 'Cập nhật ngày khai giảng thành công (không có schedules)',
        recalculatedScheduleCount: 0
      };
    }

    // Calculate interval between schedules
    // This logic depends on how schedules were originally created
    // For simplicity, we'll shift all dates by the same offset
    const oldStartDate = new Date(allSchedules[0].date);
    oldStartDate.setHours(0, 0, 0, 0);

    // Convert newStartDate to UTC midnight
    const newStart = toUTCMidnight(newStartDate);

    const daysDiff = Math.floor((newStart.getTime() - oldStartDate.getTime()) / (24 * 60 * 60 * 1000));

    // Bulk update: shift all dates by daysDiff (keep as UTC)
    const bulkOps = allSchedules.map(schedule => {
      const oldDate = new Date(schedule.date);

      // Calculate new date in UTC
      const newDate = new Date(Date.UTC(
        oldDate.getUTCFullYear(),
        oldDate.getUTCMonth(),
        oldDate.getUTCDate() + daysDiff,
        0, 0, 0, 0
      ));

      return {
        updateOne: {
          filter: { _id: schedule._id },
          update: { $set: { date: newDate } }
        }
      };
    });

    await ClassSchedule.bulkWrite(bulkOps, { session });

    // Update class startDate
    await Class.findByIdAndUpdate(classId, { startDate: newStartDate }, { session });

    console.log(`✅ Recalculated ${allSchedules.length} schedule dates`);

    return {
      success: true,
      message: 'Cập nhật ngày khai giảng thành công',
      recalculatedScheduleCount: allSchedules.length
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
