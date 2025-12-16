const ClassSchedule = require('../models/classScheduleModel');
const StudentSchedule = require('../models/studentScheduleModel');
const HomeworkSubmission = require('../models/homeworkSubmissionModel');
const Course = require('../models/courseModel');
const Class = require('../models/classModel');
const mongoose = require('mongoose');

/**
 * Lấy preview các buổi học sẽ bị xóa nếu thêm buổi học mới
 * @param {string} classId - ID của lớp học
 * @param {string} courseId - ID của course (optional, sẽ lấy từ class nếu không có)
 * @returns {Promise<Object>} Preview information
 */
async function getSchedulesToDeletePreview(classId, courseId = null) {
  try {
    // 1. Lấy class để biết courseId nếu chưa có
    if (!courseId) {
      const classData = await Class.findById(classId).select('course').lean();
      if (!classData || !classData.course) {
        return {
          canAdd: false,
          errorMessage: 'Không tìm thấy lớp học hoặc lớp chưa có course'
        };
      }
      courseId = classData.course;
    }

    // 2. Lấy course để biết numberOfSessions
    const courseData = await Course.findById(courseId)
      .populate('sessions', 'order')
      .select('numberOfSessions sessions')
      .lean();

    if (!courseData) {
      return {
        canAdd: false,
        errorMessage: 'Không tìm thấy course'
      };
    }

    // Tính numberOfSessions: ưu tiên field numberOfSessions, nếu không có thì dùng sessions.length
    const numberOfSessions = courseData.numberOfSessions || (courseData.sessions ? courseData.sessions.length : 0);

    if (!numberOfSessions || numberOfSessions === 0) {
      return {
        canAdd: true,
        totalSchedules: 0,
        attendedCount: 0,
        numberOfSessions: 0,
        schedulesToDelete: []
      };
    }

    // 3. Lấy tất cả schedules của lớp, sắp xếp theo date tăng dần
    const allSchedules = await ClassSchedule.find({ class: classId })
      .sort({ date: 1 })
      .lean();

    if (allSchedules.length === 0) {
      return {
        canAdd: true,
        totalSchedules: 0,
        attendedCount: 0,
        numberOfSessions,
        schedulesToDelete: []
      };
    }

    // 4. Kiểm tra attendance cho tất cả schedules (tối ưu: 1 query)
    const allScheduleIds = allSchedules.map(s => s._id);
    const studentSchedulesWithAttendance = await StudentSchedule.find({
      classSchedule: { $in: allScheduleIds },
      'attendance.status': { $ne: null }
    }).select('classSchedule').lean();

    // Tạo Set các scheduleId có attendance
    const scheduleIdsWithAttendance = new Set(
      studentSchedulesWithAttendance.map(s => s.classSchedule.toString())
    );

    // 5. Phân loại: đã học vs chưa học
    const schedulesWithAttendance = [];
    const schedulesWithoutAttendance = [];

    for (const schedule of allSchedules) {
      if (scheduleIdsWithAttendance.has(schedule._id.toString())) {
        schedulesWithAttendance.push(schedule); // Đã học - KHÔNG XÓA
      } else {
        schedulesWithoutAttendance.push(schedule); // Chưa học - CÓ THỂ XÓA
      }
    }

    const attendedCount = schedulesWithAttendance.length;
    const totalSchedules = allSchedules.length;

    // 6. Tính toán: nếu thêm 1 buổi mới, sẽ có bao nhiêu buổi bị xóa
    // Lưu ý: Cần xử lý cả trường hợp hiện tại đã vượt quá numberOfSessions
    const newTotalSchedules = totalSchedules + 1;
    
    console.log('🔍 [PREVIEW DEBUG] Calculation:', {
      totalSchedules,
      newTotalSchedules,
      attendedCount,
      unattendedCount: schedulesWithoutAttendance.length,
      numberOfSessions
    });

    // Edge case: Nếu số buổi đã học >= numberOfSessions
    if (attendedCount >= numberOfSessions) {
      return {
        canAdd: false,
        errorMessage: `Không thể thêm buổi học. Lớp đã có ${attendedCount} buổi đã học, đã đạt giới hạn ${numberOfSessions} buổi của khóa học.`,
        totalSchedules,
        attendedCount,
        numberOfSessions,
        schedulesToDelete: []
      };
    }

    // Nếu vượt quá numberOfSessions sau khi thêm (hoặc đã vượt quá rồi)
    // Tính số buổi cần xóa dựa trên số buổi SAU KHI THÊM (newTotalSchedules)
    if (newTotalSchedules > numberOfSessions) {
      // Số buổi đã học phải giữ lại (không xóa được)
      const unattendedToKeep = numberOfSessions - attendedCount;
      
      // Số buổi chưa học SAU KHI THÊM = số buổi chưa học hiện tại + 1 buổi mới
      const unattendedAfterAdd = schedulesWithoutAttendance.length + 1;
      
      // Số buổi chưa học cần xóa = số buổi chưa học sau khi thêm - số buổi chưa học cần giữ lại
      const toDelete = unattendedAfterAdd - unattendedToKeep;
      // Hoặc đơn giản hơn: toDelete = newTotalSchedules - numberOfSessions
      // Vì: newTotalSchedules = attendedCount + unattendedAfterAdd
      //     numberOfSessions = attendedCount + unattendedToKeep
      //     => toDelete = (attendedCount + unattendedAfterAdd) - (attendedCount + unattendedToKeep)
      //     => toDelete = unattendedAfterAdd - unattendedToKeep
      //     => toDelete = newTotalSchedules - numberOfSessions

      console.log('🔍 [PREVIEW DEBUG] Delete calculation:', {
        totalSchedules,
        newTotalSchedules,
        attendedCount,
        unattendedCount: schedulesWithoutAttendance.length,
        unattendedAfterAdd,
        unattendedToKeep,
        numberOfSessions,
        toDelete,
        explanation: `Cần xóa ${toDelete} buổi để từ ${newTotalSchedules} buổi về ${numberOfSessions} buổi`
      });

      if (toDelete > 0 && schedulesWithoutAttendance.length > 0) {
        // Sắp xếp buổi chưa học theo date giảm dần (mới nhất trước)
        const sortedUnattended = [...schedulesWithoutAttendance].sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB - dateA; // Giảm dần
        });

        // Lấy các buổi sẽ bị xóa (từ đầu danh sách - mới nhất)
        const schedulesToDelete = sortedUnattended.slice(0, toDelete).map(s => ({
          _id: s._id,
          date: s.date,
          startTime: s.startTime,
          endTime: s.endTime
        }));

        return {
          canAdd: true,
          totalSchedules: newTotalSchedules,
          attendedCount,
          numberOfSessions,
          schedulesToDelete,
          deletedCount: toDelete
        };
      } else if (toDelete > 0 && schedulesWithoutAttendance.length === 0) {
        // Edge case: Cần xóa nhưng không có buổi chưa học nào để xóa
        // (Không nên xảy ra vì đã check attendedCount >= numberOfSessions ở trên)
        console.log('⚠️ [PREVIEW DEBUG] Cần xóa nhưng không có buổi chưa học để xóa');
        return {
          canAdd: false,
          errorMessage: `Không thể thêm buổi học. Cần xóa ${toDelete} buổi nhưng không có buổi chưa học nào để xóa.`,
          totalSchedules: newTotalSchedules,
          attendedCount,
          numberOfSessions,
          schedulesToDelete: []
        };
      } else {
        // toDelete <= 0 hoặc không có buổi chưa học
        console.log('🔍 [PREVIEW DEBUG] Không cần xóa hoặc không có buổi để xóa');
      }
    }

    // Không cần xóa buổi nào (newTotalSchedules <= numberOfSessions)
    console.log('🔍 [PREVIEW DEBUG] Không cần xóa buổi nào');
    return {
      canAdd: true,
      totalSchedules: newTotalSchedules,
      attendedCount,
      numberOfSessions,
      schedulesToDelete: [],
      deletedCount: 0
    };
  } catch (error) {
    console.error('Error in getSchedulesToDeletePreview:', error);
    return {
      canAdd: false,
      errorMessage: `Lỗi khi kiểm tra: ${error.message}`
    };
  }
}

/**
 * Cleanup schedules sau khi thêm buổi học mới
 * Xóa các buổi học chưa học (không có attendance) từ mới nhất về cũ nhất
 * Sau đó gán lại session cho TẤT CẢ buổi học còn lại
 * @param {string} classId - ID của lớp học
 * @param {string} courseId - ID của course (optional, sẽ lấy từ class nếu không có)
 * @returns {Promise<Object>} Cleanup result
 */
async function cleanupSchedulesAfterAdding(classId, courseId = null) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Lấy class để biết courseId nếu chưa có
    if (!courseId) {
      const classData = await Class.findById(classId).select('course').session(session).lean();
      if (!classData || !classData.course) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'Không tìm thấy lớp học hoặc lớp chưa có course'
        };
      }
      courseId = classData.course;
    }

    // 2. Lấy course để biết numberOfSessions và sessions
    const courseData = await Course.findById(courseId)
      .populate('sessions', 'order')
      .select('numberOfSessions sessions')
      .session(session)
      .lean();

    if (!courseData) {
      await session.abortTransaction();
      session.endSession();
      return {
        success: false,
        message: 'Không tìm thấy course'
      };
    }

    // Tính numberOfSessions: ưu tiên field numberOfSessions, nếu không có thì dùng sessions.length
    const numberOfSessions = courseData.numberOfSessions || (courseData.sessions ? courseData.sessions.length : 0);

    if (!numberOfSessions || numberOfSessions === 0) {
      await session.commitTransaction();
      session.endSession();
      return {
        success: true,
        message: 'Không có numberOfSessions, bỏ qua cleanup',
        deletedCount: 0
      };
    }

    // 3. Lấy tất cả schedules của lớp, sắp xếp theo date tăng dần
    console.log('🔍 [CLEANUP] Đang lấy tất cả schedules của lớp...');
    const allSchedules = await ClassSchedule.find({ class: classId })
      .sort({ date: 1 })
      .session(session)
      .lean();

    console.log(`📊 [CLEANUP] Tổng số schedules hiện tại: ${allSchedules.length}`);
    if (allSchedules.length > 0) {
      console.log('📅 Danh sách schedules:');
      allSchedules.forEach((schedule, index) => {
        const scheduleDate = new Date(schedule.date);
        console.log(`   ${index + 1}. ${scheduleDate.toLocaleDateString('vi-VN')} - ${schedule.startTime} đến ${schedule.endTime} (ID: ${schedule._id})`);
      });
    }

    if (allSchedules.length === 0) {
      await session.commitTransaction();
      session.endSession();
      return {
        success: true,
        message: 'Không có schedules để cleanup',
        deletedCount: 0
      };
    }

    // 4. Kiểm tra attendance cho tất cả schedules (tối ưu: 1 query)
    console.log('🔍 [CLEANUP] Đang kiểm tra attendance...');
    const allScheduleIds = allSchedules.map(s => s._id);
    const studentSchedulesWithAttendance = await StudentSchedule.find({
      classSchedule: { $in: allScheduleIds },
      'attendance.status': { $ne: null }
    }).select('classSchedule').session(session).lean();

    // Tạo Set các scheduleId có attendance
    const scheduleIdsWithAttendance = new Set(
      studentSchedulesWithAttendance.map(s => s.classSchedule.toString())
    );

    console.log(`📊 [CLEANUP] Số schedules có attendance: ${scheduleIdsWithAttendance.size}`);

    // 5. Phân loại: đã học vs chưa học
    const schedulesWithAttendance = [];
    const schedulesWithoutAttendance = [];

    for (const schedule of allSchedules) {
      if (scheduleIdsWithAttendance.has(schedule._id.toString())) {
        schedulesWithAttendance.push(schedule); // Đã học - KHÔNG XÓA
      } else {
        schedulesWithoutAttendance.push(schedule); // Chưa học - CÓ THỂ XÓA
      }
    }

    console.log(`📊 [CLEANUP] Phân loại:`);
    console.log(`   - Buổi đã học (KHÔNG XÓA): ${schedulesWithAttendance.length}`);
    if (schedulesWithAttendance.length > 0) {
      schedulesWithAttendance.forEach((schedule, index) => {
        const scheduleDate = new Date(schedule.date);
        console.log(`      ${index + 1}. ${scheduleDate.toLocaleDateString('vi-VN')} - ${schedule.startTime} đến ${schedule.endTime}`);
      });
    }
    console.log(`   - Buổi chưa học (CÓ THỂ XÓA): ${schedulesWithoutAttendance.length}`);
    if (schedulesWithoutAttendance.length > 0) {
      schedulesWithoutAttendance.forEach((schedule, index) => {
        const scheduleDate = new Date(schedule.date);
        console.log(`      ${index + 1}. ${scheduleDate.toLocaleDateString('vi-VN')} - ${schedule.startTime} đến ${schedule.endTime}`);
      });
    }

    const totalSchedules = allSchedules.length;
    const attendedCount = schedulesWithAttendance.length;
    const unattendedCount = schedulesWithoutAttendance.length;

    console.log('🔍 [CLEANUP DEBUG] Schedule counts:', {
      totalSchedules,
      attendedCount,
      unattendedCount,
      numberOfSessions
    });

    // 6. Tính toán số buổi cần xóa
    let deletedCount = 0;
    if (totalSchedules > numberOfSessions) {
      const unattendedToKeep = Math.max(0, numberOfSessions - attendedCount);
      const toDelete = schedulesWithoutAttendance.length - unattendedToKeep;

      console.log('🔍 [CLEANUP DEBUG] Calculation:', {
        unattendedToKeep,
        toDelete,
        schedulesWithoutAttendanceCount: schedulesWithoutAttendance.length
      });

      if (toDelete > 0) {
        // Sắp xếp buổi chưa học theo date giảm dần (mới nhất trước)
        schedulesWithoutAttendance.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB - dateA; // Giảm dần
        });

        // Lấy các buổi cần xóa (từ đầu danh sách - mới nhất)
        const schedulesToDelete = schedulesWithoutAttendance.slice(0, toDelete);
        const scheduleIdsToDelete = schedulesToDelete.map(s => s._id);

        console.log('🔍 [CLEANUP DEBUG] Schedules to delete:', {
          count: schedulesToDelete.length,
          schedules: schedulesToDelete.map(s => ({
            _id: s._id,
            date: s.date,
            startTime: s.startTime,
            endTime: s.endTime
          }))
        });

        // 7. Xóa cascade trong transaction
        // 7.1. Delete HomeworkSubmissions
        const deletedHomework = await HomeworkSubmission.deleteMany({
          classSchedule: { $in: scheduleIdsToDelete }
        }).session(session);
        console.log(`🔍 [CLEANUP DEBUG] Deleted ${deletedHomework.deletedCount} HomeworkSubmissions`);

        // 7.2. Delete StudentSchedules
        const deletedStudentSchedules = await StudentSchedule.deleteMany({
          classSchedule: { $in: scheduleIdsToDelete }
        }).session(session);
        console.log(`🔍 [CLEANUP DEBUG] Deleted ${deletedStudentSchedules.deletedCount} StudentSchedules`);

        // 7.3. Delete ClassSchedules
        const deletedClassSchedules = await ClassSchedule.deleteMany({
          _id: { $in: scheduleIdsToDelete }
        }).session(session);
        console.log(`🔍 [CLEANUP DEBUG] Deleted ${deletedClassSchedules.deletedCount} ClassSchedules`);

        deletedCount = deletedClassSchedules.deletedCount || toDelete;
        console.log(`✅ Đã xóa ${deletedCount} buổi học chưa học để đảm bảo tổng số buổi = ${numberOfSessions}`);
      } else {
        console.log('🔍 [CLEANUP DEBUG] No schedules to delete (toDelete <= 0)');
      }
    } else {
      console.log('🔍 [CLEANUP DEBUG] No cleanup needed (totalSchedules <= numberOfSessions)');
    }

    // 8. Gán lại session cho TẤT CẢ buổi học còn lại
    console.log('');
    console.log('🔄 ========== GÁN LẠI SESSION ==========');
    // Lấy lại danh sách schedules sau khi xóa (nếu có xóa)
    const remainingSchedules = await ClassSchedule.find({ class: classId })
      .sort({ date: 1 }) // Sắp xếp theo date tăng dần
      .session(session)
      .lean();

    console.log(`📊 Số buổi học còn lại: ${remainingSchedules.length}`);

    if (remainingSchedules.length > 0 && courseData.sessions && courseData.sessions.length > 0) {
      // Sắp xếp course sessions theo order
      const courseSessions = [...courseData.sessions].sort((a, b) => (a.order || 0) - (b.order || 0));

      console.log(`📚 Course có ${courseSessions.length} sessions (theo order):`);
      courseSessions.forEach((s, index) => {
        console.log(`   ${index + 1}. Session ${s.order || index + 1} (ID: ${s._id})`);
      });
      console.log('');

      // Gán session cho từng buổi học theo thứ tự
      const updatePromises = remainingSchedules.map((schedule, index) => {
        // Lấy session theo index (nếu vượt quá thì lặp lại)
        const sessionIndex = index < courseSessions.length 
          ? index 
          : index % courseSessions.length;
        const sessionId = courseSessions[sessionIndex]?._id || null;
        const sessionOrder = courseSessions[sessionIndex]?.order || sessionIndex + 1;

        const scheduleDate = new Date(schedule.date);
        console.log(`   Buổi ${index + 1}: ${scheduleDate.toLocaleDateString('vi-VN')} - ${schedule.startTime} → Session ${sessionOrder} (ID: ${sessionId})`);

        return ClassSchedule.findByIdAndUpdate(
          schedule._id,
          { session: sessionId },
          { session }
        );
      });

      await Promise.all(updatePromises);
      console.log(`✅ Đã gán lại session cho ${remainingSchedules.length} buổi học`);
    } else {
      console.log('⚠️ Không có sessions để gán hoặc không có buổi học còn lại');
    }
    console.log('==========================================');

    await session.commitTransaction();
    session.endSession();

    console.log('🔍 [CLEANUP DEBUG] Final result:', {
      deletedCount,
      totalSchedulesBefore: totalSchedules,
      totalSchedulesAfter: remainingSchedules.length,
      reassignedSessions: remainingSchedules.length
    });

    return {
      success: true,
      message: 'Cleanup thành công',
      deletedCount,
      totalSchedules: remainingSchedules.length,
      reassignedSessions: remainingSchedules.length
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error in cleanupSchedulesAfterAdding:', error);
    return {
      success: false,
      message: `Lỗi khi cleanup: ${error.message}`,
      error: error.message
    };
  }
}

module.exports = {
  getSchedulesToDeletePreview,
  cleanupSchedulesAfterAdding
};

