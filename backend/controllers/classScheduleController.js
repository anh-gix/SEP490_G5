const ClassSchedule = require("../models/classScheduleModel");
const StudentSchedule = require("../models/studentScheduleModel");
const Class = require("../models/classModel");
const Room = require("../models/room");
const Course = require("../models/courseModel");
const mongoose = require("mongoose");
const { getSchedulesToDeletePreview, cleanupSchedulesAfterAdding } = require("../helpers/scheduleCleanup");

// =========================
// 📘 LẤY DANH SÁCH LỚP CỦA GIÁO VIÊN
// =========================
exports.getClassesByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const classes = await Class.find({ teacherId }).select("name subject createdAt");
    if (!classes.length) {
      return res.status(404).json({ message: "Giáo viên này chưa có lớp nào." });
    }

    res.status(200).json(classes);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách lớp:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách lớp." });
  }
};

// =========================
// 🗓️ LẤY LỊCH HỌC THEO LỚP
// =========================
exports.getSchedulesByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const schedules = await ClassSchedule.find({ class: classId })
      .select("session date startTime endTime room")
      .populate("room", "room_name") // ✅ thêm populate phòng học
      .sort({ date: 1 });

    if (!schedules.length) {
      return res.status(404).json({ message: "Lớp này chưa có lịch học." });
    }

    console.log(schedules);
    
    res.status(200).json(schedules);
  } catch (error) {
    console.error("❌ Lỗi khi lấy lịch học:", error);
    res.status(500).json({ message: "Lỗi server khi lấy lịch học." });
  }
};

// =========================
// ✅ VALIDATE: KIỂM TRA CONFLICT TRƯỚC KHI THÊM BUỔI HỌC
// =========================
exports.validateAddClassSchedule = async (req, res) => {
  try {
    const { classId, date, startTime, endTime, room, excludeScheduleId } = req.body;

    if (!classId || !date || !startTime || !endTime || !room) {
      return res.status(400).json({ 
        success: false,
        message: "Thiếu thông tin bắt buộc." 
      });
    }

    const conflicts = {
      teacher: [],
      room: [],
      students: [],
      hasConflict: false
    };

    // Lấy thông tin lớp học
    const classData = await Class.findById(classId)
      .select('name teacher teacherId students room')
      .populate('teacher', 'username email')
      .populate('students', 'username email')
      .lean();

    if (!classData) {
      return res.status(404).json({ 
        success: false,
        message: "Không tìm thấy lớp học." 
      });
    }
    
    const currentClassName = classData.name || 'N/A';

    const teacherId = classData.teacher || classData.teacherId;
    const students = classData.students || [];
    
    // Parse date string (YYYY-MM-DD) và tạo Date object ở local timezone
    // Tránh vấn đề timezone khi parse date string
    const dateParts = date.split('-');
    if (dateParts.length !== 3) {
      return res.status(400).json({ 
        success: false,
        message: "Định dạng ngày không hợp lệ. Phải là YYYY-MM-DD." 
      });
    }
    
    const scheduleDate = new Date(
      parseInt(dateParts[0]), // year
      parseInt(dateParts[1]) - 1, // month (0-indexed)
      parseInt(dateParts[2]) // day
    );
    scheduleDate.setHours(0, 0, 0, 0);
    
    console.log('📅 Parse date từ string:', date);
    console.log('  - Date parts:', dateParts);
    console.log('  - Date object (local):', scheduleDate.toLocaleString('vi-VN'));
    console.log('  - Date object (UTC):', scheduleDate.toISOString());

    // Helper function để check time overlap
    // Chuyển đổi thời gian từ string "HH:MM" sang phút để so sánh chính xác
    const hasTimeOverlap = (start1, end1, start2, end2) => {
      const timeToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const parts = timeStr.split(':');
        if (parts.length !== 2) return 0;
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        return hours * 60 + minutes;
      };
      
      const start1Min = timeToMinutes(start1);
      const end1Min = timeToMinutes(end1);
      const start2Min = timeToMinutes(start2);
      const end2Min = timeToMinutes(end2);
      
      // Hai khoảng thời gian overlap nếu: start1 < end2 VÀ end1 > start2
      // Lưu ý: Nếu một lớp kết thúc đúng lúc lớp kia bắt đầu (ví dụ: 08:00-10:00 và 10:00-12:00)
      // thì KHÔNG có overlap vì sử dụng > và < (không có =)
      return start1Min < end2Min && end1Min > start2Min;
    };

    // Helper function để format date
    const formatDateLocal = (dateInput) => {
      if (!dateInput) return null;
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return null;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const newDateStr = formatDateLocal(scheduleDate);

    // Log lịch học của lớp hiện tại
    console.log('\n📚 ========== LỊCH HỌC CỦA LỚP HIỆN TẠI ==========');
    console.log(`  - Tên lớp: ${currentClassName}`);
    console.log(`  - ClassId: ${classId}`);
    const currentClassAllSchedules = await ClassSchedule.find({
      class: new mongoose.Types.ObjectId(classId),
      status: { $in: ['temporary', 'fixed'] }
    })
      .select('date startTime endTime status')
      .sort({ date: 1, startTime: 1 })
      .lean();
    
    console.log(`  - Tổng số buổi học: ${currentClassAllSchedules.length}`);
    if (currentClassAllSchedules.length > 0) {
      console.log('  - Chi tiết các buổi học:');
      currentClassAllSchedules.forEach((schedule, idx) => {
        const scheduleDateStr = formatDateLocal(schedule.date);
        const dayOfWeek = new Date(schedule.date).getDay();
        const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        console.log(`    [${idx + 1}] ${scheduleDateStr} (${dayNames[dayOfWeek]}) - ${schedule.startTime} - ${schedule.endTime} [${schedule.status}]`);
      });
    } else {
      console.log('  - Lớp này chưa có buổi học nào');
    }
    console.log('  ============================================\n');

    console.log('\n🔍 ========== VALIDATE SCHEDULE - START ==========');
    console.log('📋 Thông tin buổi học cần validate:');
    console.log('  - ClassId:', classId);
    console.log('  - Date:', newDateStr);
    console.log('  - Time:', `${startTime} - ${endTime}`);
    console.log('  - Room:', room);
    console.log('  - ExcludeScheduleId:', excludeScheduleId || 'Không có (thêm mới)');
    console.log('  - TeacherId:', teacherId?.toString() || 'Chưa có');
    console.log('  - Số học sinh:', students.length);

    // ✅ 0. KIỂM TRA CONFLICT VỚI CÁC BUỔI HỌC HIỆN TẠI CỦA LỚP (cùng ngày, trùng giờ)
    console.log('\n📚 KIỂM TRA CONFLICT VỚI CÁC BUỔI HỌC HIỆN TẠI CỦA LỚP:');
    const currentClassSchedulesOnSameDate = await ClassSchedule.find({
      class: new mongoose.Types.ObjectId(classId),
      date: scheduleDate,
      status: { $in: ['temporary', 'fixed'] }
    })
      .select('_id date startTime endTime')
      .lean();
    
    // Nếu có excludeScheduleId (đang update), loại trừ schedule đó
    const schedulesToCheck = excludeScheduleId
      ? currentClassSchedulesOnSameDate.filter(s => s._id.toString() !== excludeScheduleId)
      : currentClassSchedulesOnSameDate;
    
    console.log(`  - Tìm thấy ${schedulesToCheck.length} buổi học của lớp hiện tại vào ngày ${newDateStr}`);
    
    schedulesToCheck.forEach((schedule, idx) => {
      const hasOverlap = hasTimeOverlap(startTime, endTime, schedule.startTime, schedule.endTime);
      console.log(`  [${idx + 1}] Schedule ID: ${schedule._id}`);
      console.log(`      - Thời gian: ${schedule.startTime} - ${schedule.endTime}`);
      console.log(`      - Trùng giờ với ${startTime}-${endTime}: ${hasOverlap ? 'CÓ ⚠️' : 'KHÔNG ✓'}`);
      
      if (hasOverlap) {
        conflicts.room.push({
          roomId: room.toString(),
          className: currentClassName,
          date: formatDateLocal(schedule.date),
          time: `${schedule.startTime} - ${schedule.endTime}`,
          conflictingTime: `${startTime} - ${endTime}`,
          isCurrentClass: true // Đánh dấu đây là conflict với chính lớp hiện tại
        });
        conflicts.hasConflict = true;
        console.log(`      ⚠️ CONFLICT VỚI BUỔI HỌC HIỆN TẠI CỦA LỚP được phát hiện!`);
      }
    });
    
    if (schedulesToCheck.length === 0 || schedulesToCheck.every(s => !hasTimeOverlap(startTime, endTime, s.startTime, s.endTime))) {
      console.log('  ✓ Không có conflict với các buổi học hiện tại của lớp');
    }

    // Build query for room schedules, excluding current schedule if updating
    // Loại trừ tất cả schedules của lớp hiện tại để tránh báo conflict trùng lặp
    const roomScheduleQuery = {
      room: new mongoose.Types.ObjectId(room),
      date: scheduleDate,
      status: { $in: ['temporary', 'fixed'] }
    };
    
    // Loại trừ tất cả schedules của lớp hiện tại (đã kiểm tra ở trên)
    const currentClassScheduleIds = schedulesToCheck.map(s => s._id);
    if (currentClassScheduleIds.length > 0) {
      roomScheduleQuery._id = { $nin: currentClassScheduleIds };
    } else if (excludeScheduleId) {
      // Nếu không có schedules của lớp hiện tại, chỉ loại trừ schedule cụ thể nếu có
      roomScheduleQuery._id = { $ne: new mongoose.Types.ObjectId(excludeScheduleId) };
    }

    // 1. Kiểm tra conflict PHÒNG HỌC (bao gồm cả lớp hiện tại - một lớp không thể có 2 buổi cùng thứ cùng giờ)
    const roomSchedules = await ClassSchedule.find(roomScheduleQuery)
      .populate('class', 'name')
      .select('date startTime endTime class')
      .lean();

    console.log('\n🏢 KIỂM TRA PHÒNG HỌC:');
    console.log('  - Query:', JSON.stringify(roomScheduleQuery, null, 2));
    console.log('  - Tìm thấy', roomSchedules.length, 'buổi học trong phòng này vào ngày', newDateStr);
    
    roomSchedules.forEach((schedule, idx) => {
      const scheduleClassId = schedule.class?._id?.toString() || schedule.class?.toString() || null;
      const isCurrentClass = scheduleClassId === classId.toString();
      const hasOverlap = hasTimeOverlap(startTime, endTime, schedule.startTime, schedule.endTime);
      
      console.log(`  [${idx + 1}] Schedule ID: ${schedule._id}`);
      console.log(`      - Lớp: ${schedule.class?.name || 'N/A'} (ID: ${scheduleClassId})`);
      console.log(`      - Thời gian: ${schedule.startTime} - ${schedule.endTime}`);
      console.log(`      - Lớp hiện tại: ${isCurrentClass ? 'CÓ' : 'KHÔNG'}`);
      console.log(`      - Trùng giờ: ${hasOverlap ? 'CÓ ⚠️' : 'KHÔNG ✓'}`);
      
      if (hasOverlap) {
        // Kiểm tra xem có phải là lớp hiện tại không
        conflicts.room.push({
          roomId: room.toString(),
          className: schedule.class?.name || 'N/A',
          date: formatDateLocal(schedule.date),
          time: `${schedule.startTime} - ${schedule.endTime}`,
          conflictingTime: `${startTime} - ${endTime}`,
          isCurrentClass: isCurrentClass // Đánh dấu để frontend có thể hiển thị khác
        });
        conflicts.hasConflict = true;
        console.log(`      ⚠️ CONFLICT PHÒNG HỌC được phát hiện!`);
      }
    });
    
    if (conflicts.room.length === 0) {
      console.log('  ✓ Không có conflict phòng học');
    }

    // 2. Kiểm tra conflict GIÁO VIÊN
    console.log('\n👨‍🏫 KIỂM TRA GIÁO VIÊN:');
    if (teacherId) {
      console.log('  - TeacherId:', teacherId.toString());
      
      // Lấy tất cả lớp khác của giáo viên (trừ lớp hiện tại)
      const teacherClasses = await Class.find({
        $or: [
          { teacher: teacherId },
          { teacherId: teacherId }
        ],
        _id: { $ne: classId }
      }).select('_id name').lean();

      console.log('  - Tìm thấy', teacherClasses.length, 'lớp khác của giáo viên này');
      teacherClasses.forEach((cls, idx) => {
        console.log(`    [${idx + 1}] ${cls.name} (ID: ${cls._id})`);
      });

      if (teacherClasses.length > 0) {
        const teacherClassIds = teacherClasses.map(c => c._id);

        // Build query for teacher schedules, excluding current schedule if updating
        const teacherScheduleQuery = {
          class: { $in: teacherClassIds },
          date: scheduleDate,
          status: { $in: ['temporary', 'fixed'] }
        };
        if (excludeScheduleId) {
          teacherScheduleQuery._id = { $ne: new mongoose.Types.ObjectId(excludeScheduleId) };
        }

        // Lấy lịch học của giáo viên trong ngày đó
        const teacherSchedules = await ClassSchedule.find(teacherScheduleQuery)
          .populate('class', 'name')
          .select('date startTime endTime class')
          .lean();

        console.log('  - Tìm thấy', teacherSchedules.length, 'buổi học của giáo viên vào ngày', newDateStr);
        
        teacherSchedules.forEach((schedule, idx) => {
          const hasOverlap = hasTimeOverlap(startTime, endTime, schedule.startTime, schedule.endTime);
          
          console.log(`  [${idx + 1}] Schedule ID: ${schedule._id}`);
          console.log(`      - Lớp: ${schedule.class?.name || 'N/A'}`);
          console.log(`      - Thời gian: ${schedule.startTime} - ${schedule.endTime}`);
          console.log(`      - Trùng giờ: ${hasOverlap ? 'CÓ ⚠️' : 'KHÔNG ✓'}`);
          
          if (hasOverlap) {
            conflicts.teacher.push({
              teacherId: teacherId.toString(),
              className: schedule.class?.name || 'N/A',
              date: formatDateLocal(schedule.date),
              time: `${schedule.startTime} - ${schedule.endTime}`,
              conflictingTime: `${startTime} - ${endTime}`
            });
            conflicts.hasConflict = true;
            console.log(`      ⚠️ CONFLICT GIÁO VIÊN được phát hiện!`);
          }
        });
      } else {
        console.log('  ✓ Giáo viên không có lớp nào khác');
      }
    } else {
      console.log('  ⚠️ Lớp học chưa có giáo viên');
    }
    
    if (conflicts.teacher.length === 0 && teacherId) {
      console.log('  ✓ Không có conflict giáo viên');
    }

    // 3. Kiểm tra conflict SINH VIÊN
    console.log('\n👥 KIỂM TRA HỌC SINH:');
    if (students.length > 0) {
      console.log('  - Số học sinh trong lớp:', students.length);
      
      // Log lịch học của từng sinh viên
      console.log('\n  📅 ========== LỊCH HỌC CỦA TỪNG SINH VIÊN ==========');
      for (let idx = 0; idx < students.length; idx++) {
        const student = students[idx];
        const studentId = student._id?.toString() || student.toString();
        const studentName = student.username || student.fullName || `Học sinh ${idx + 1}`;
        
        console.log(`\n  👤 [${idx + 1}] ${studentName} (ID: ${studentId}):`);
        
        // Tìm tất cả lớp mà học sinh này tham gia
        const studentAllClasses = await Class.find({
          students: new mongoose.Types.ObjectId(studentId)
        })
          .select('_id name')
          .lean();
        
        console.log(`      - Tham gia ${studentAllClasses.length} lớp:`);
        studentAllClasses.forEach((cls, cIdx) => {
          const isCurrentClass = cls._id.toString() === classId.toString();
          console.log(`        [${cIdx + 1}] ${cls.name} (ID: ${cls._id})${isCurrentClass ? ' ← Lớp hiện tại' : ''}`);
        });
        
        // Lấy tất cả schedules của học sinh này từ tất cả các lớp
        const studentAllClassIds = studentAllClasses.map(c => c._id);
        const studentAllSchedules = await ClassSchedule.find({
          class: { $in: studentAllClassIds },
          status: { $in: ['temporary', 'fixed'] }
        })
          .populate('class', 'name')
          .select('date startTime endTime class status')
          .sort({ date: 1, startTime: 1 })
          .lean();
        
        console.log(`      - Tổng số buổi học: ${studentAllSchedules.length}`);
        if (studentAllSchedules.length > 0) {
          console.log(`      - Chi tiết các buổi học:`);
          studentAllSchedules.forEach((schedule, sIdx) => {
            const scheduleDateStr = formatDateLocal(schedule.date);
            const dayOfWeek = new Date(schedule.date).getDay();
            const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
            const scheduleClassName = schedule.class?.name || 'N/A';
            const isCurrentClassSchedule = schedule.class?._id?.toString() === classId.toString();
            console.log(`        [${sIdx + 1}] ${scheduleDateStr} (${dayNames[dayOfWeek]}) - ${schedule.startTime} - ${schedule.endTime} [${schedule.status}]`);
            console.log(`            Lớp: ${scheduleClassName}${isCurrentClassSchedule ? ' ← Lớp hiện tại' : ''}`);
          });
        } else {
          console.log(`      - Học sinh này chưa có buổi học nào`);
        }
      }
      console.log('  ============================================\n');
      
      students.forEach((student, idx) => {
        const studentId = student._id?.toString() || student.toString();
        const studentName = student.username || student.fullName || `Học sinh ${idx + 1}`;
        console.log(`    [${idx + 1}] ${studentName} (ID: ${studentId})`);
      });
      
      // Lấy tất cả lớp khác của sinh viên (trừ lớp hiện tại)
      const studentClasses = await Class.find({
        students: { $in: students },
        _id: { $ne: classId }
      }).select('_id name students').lean();

      console.log('  - Tìm thấy', studentClasses.length, 'lớp khác có học sinh trùng');
      studentClasses.forEach((cls, idx) => {
        console.log(`    [${idx + 1}] ${cls.name} (ID: ${cls._id}) - ${cls.students.length} học sinh`);
      });

      if (studentClasses.length > 0) {
        const studentClassIds = studentClasses.map(c => c._id);

        // Build query for student schedules, excluding all schedules of current class
        // Loại trừ tất cả schedules của lớp hiện tại để tránh báo conflict với chính lớp đang chỉnh sửa
        const currentClassSchedulesForStudents = await ClassSchedule.find({
          class: new mongoose.Types.ObjectId(classId),
          date: scheduleDate,
          status: { $in: ['temporary', 'fixed'] }
        }).select('_id').lean();
        
        const currentClassScheduleIdsForStudents = currentClassSchedulesForStudents.map(s => s._id);
        
        const studentScheduleQuery = {
          class: { $in: studentClassIds },
          date: scheduleDate,
          status: { $in: ['temporary', 'fixed'] }
        };
        
        // Loại trừ tất cả schedules của lớp hiện tại
        if (currentClassScheduleIdsForStudents.length > 0) {
          studentScheduleQuery._id = { $nin: currentClassScheduleIdsForStudents };
        } else if (excludeScheduleId) {
          // Nếu không có schedules của lớp hiện tại, chỉ loại trừ schedule cụ thể nếu có
          studentScheduleQuery._id = { $ne: new mongoose.Types.ObjectId(excludeScheduleId) };
        }

        // Lấy lịch học của sinh viên trong ngày đó
        const studentSchedules = await ClassSchedule.find(studentScheduleQuery)
          .populate('class', 'name')
          .select('date startTime endTime class')
          .lean();

        console.log(`\n  🔍 DEBUG: Kiểm tra conflict học sinh cho ngày ${newDateStr}:`);
        console.log(`    - Đã loại trừ ${currentClassScheduleIdsForStudents.length} schedules của lớp hiện tại vào ngày này`);
        console.log(`    - Tìm thấy ${studentSchedules.length} schedules của các lớp khác vào ngày này`);
        console.log(`    - Thời gian đang validate: ${startTime} - ${endTime}`);
        
        // Group conflicts by student
        const studentConflictMap = new Map();

        studentSchedules.forEach((schedule, idx) => {
          const hasOverlap = hasTimeOverlap(startTime, endTime, schedule.startTime, schedule.endTime);
          const scheduleClassId = schedule.class?._id?.toString() || schedule.class?.toString() || null;
          const scheduleClassName = schedule.class?.name || 'N/A';
          const isCurrentClass = scheduleClassId === classId.toString();
          const scheduleDateStr = formatDateLocal(schedule.date);
          
          console.log(`\n    [${idx + 1}] Schedule ID: ${schedule._id}`);
          console.log(`        - Lớp: ${scheduleClassName} (ID: ${scheduleClassId})`);
          console.log(`        - Ngày: ${scheduleDateStr}`);
          console.log(`        - Thời gian: ${schedule.startTime} - ${schedule.endTime}`);
          console.log(`        - Có phải lớp hiện tại?: ${isCurrentClass ? 'CÓ ⚠️' : 'KHÔNG ✓'}`);
          console.log(`        - Trùng giờ với ${startTime}-${endTime}?: ${hasOverlap ? 'CÓ ⚠️' : 'KHÔNG ✓'}`);
          
          if (hasOverlap) {
            // Tìm lớp nào có schedule này
            if (!scheduleClassId) {
              console.log(`        ⚠️ Không có classId, bỏ qua`);
              return;
            }

            // Kiểm tra xem có phải là lớp hiện tại không
            if (isCurrentClass) {
              console.log(`        ❌ PHÁT HIỆN: Schedule này thuộc về CHÍNH LỚP HIỆN TẠI!`);
              console.log(`        ❌ Đây là lý do tại sao báo conflict với chính lớp đang chỉnh sửa!`);
              console.log(`        ❌ Schedule này KHÔNG NÊN được tìm thấy vì đã loại trừ ở query!`);
              return; // Bỏ qua conflict với chính lớp hiện tại
            }

            // Tìm lớp trong studentClasses có ID trùng với scheduleClassId
            const conflictingClass = studentClasses.find(cls => cls._id.toString() === scheduleClassId);
            if (!conflictingClass) {
              return;
            }

            // Tìm sinh viên nào trong lớp hiện tại cũng có trong lớp conflict
            conflictingClass.students.forEach(studentIdInConflictClass => {
              const studentIdInConflictClassStr = studentIdInConflictClass.toString();
              
              // Check if this student is also in the current class và lấy thông tin sinh viên
              const studentInCurrentClass = students.find(s => {
                const studentIdStr = s._id?.toString() || s.toString();
                return studentIdStr === studentIdInConflictClassStr;
              });

              if (studentInCurrentClass) {
                const studentName = studentInCurrentClass.username || studentInCurrentClass.fullName || `Sinh viên ${studentIdInConflictClassStr}`;
                
                if (!studentConflictMap.has(studentIdInConflictClassStr)) {
                  studentConflictMap.set(studentIdInConflictClassStr, {
                    studentId: studentIdInConflictClassStr,
                    studentName: studentName,
                    conflicts: []
                  });
                }
                studentConflictMap.get(studentIdInConflictClassStr).conflicts.push({
                  className: schedule.class?.name || conflictingClass.name || 'N/A',
                  date: formatDateLocal(schedule.date),
                  time: `${schedule.startTime} - ${schedule.endTime}`,
                  conflictingTime: `${startTime} - ${endTime}`
                });
                conflicts.hasConflict = true;
              }
            });
          }
        });

        // Convert map to array
        studentConflictMap.forEach((studentConflict) => {
          conflicts.students.push(studentConflict);
        });
        
        if (studentConflictMap.size === 0) {
          console.log('  ✓ Không có học sinh nào bị conflict');
        } else {
          console.log(`  ⚠️ Có ${studentConflictMap.size} học sinh bị conflict`);
        }
      } else {
        console.log('  ✓ Học sinh không có lớp nào khác');
      }
    } else {
      console.log('  ⚠️ Lớp học chưa có học sinh');
    }
    
    if (conflicts.students.length === 0 && students.length > 0) {
      console.log('  ✓ Không có conflict học sinh');
    }

    console.log('\n📊 KẾT QUẢ VALIDATION:');
    console.log('  - Có conflict:', conflicts.hasConflict ? 'CÓ ⚠️' : 'KHÔNG ✓');
    console.log('  - Conflict phòng học:', conflicts.room.length);
    console.log('  - Conflict giáo viên:', conflicts.teacher.length);
    console.log('  - Conflict học sinh:', conflicts.students.length);
    console.log('========== VALIDATE SCHEDULE - END ==========\n');

    res.status(200).json({
      success: true,
      conflicts: conflicts,
      message: conflicts.hasConflict 
        ? "Có xung đột lịch học được phát hiện." 
        : "Không có xung đột lịch học."
    });

  } catch (err) {
    console.error("❌ Lỗi khi validate:", err);
    res.status(500).json({ 
      success: false,
      message: "Lỗi server", 
      error: err.message 
    });
  }
};

// =========================
// 🔍 PREVIEW: XEM TRƯỚC KHI THÊM BUỔI HỌC
// =========================
exports.previewAddClassSchedule = async (req, res) => {
  try {
    const { classId, date, startTime, endTime, room, repeatWeekly, selectedDay } = req.body;

    if (!classId || !date || !startTime || !endTime || !room) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });
    }

    // Khai báo dayNames để dùng chung trong function
    const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

    // Lấy thông tin class và course
    const classInfo = await Class.findById(classId).select("course teacher teacherId").lean();
    if (!classInfo || !classInfo.course) {
      return res.status(400).json({
        message: "Lớp học chưa có course được gán.",
      });
    }

    // Lấy course để biết numberOfSessions
    const courseData = await Course.findById(classInfo.course)
      .select('numberOfSessions')
      .lean();
    
    const courseNumberOfSessions = courseData?.numberOfSessions || 0;

    // Lấy room info
    const roomData = await Room.findById(room).select("room_name location").lean();

    // Tính toán các ngày sẽ tạo nếu repeatWeekly = true
    const datesToCreate = [];
    if (repeatWeekly) {
      // Parse date từ string YYYY-MM-DD, tránh timezone issues
      const dateParts = date.split('-');
      const firstDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      firstDate.setHours(0, 0, 0, 0);
      
      // Debug: Kiểm tra thứ của ngày đầu tiên
      const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      console.log('[DEBUG Backend] Parse date:');
      console.log('   - Date string nhận được:', date);
      console.log('   - Date object:', firstDate.toLocaleDateString('vi-VN'));
      console.log('   - Thứ của ngày:', dayNames[firstDate.getDay()]);
      console.log('');
      
      // Lấy số buổi hiện tại
      const currentSchedulesCount = await ClassSchedule.countDocuments({ class: classId });
      
      // Tính số buổi cần tạo để đạt numberOfSessions
      // Logic: Tạo buổi học cho đến khi đạt numberOfSessions
      // Nhưng cần kiểm tra xem có thể thêm không (dựa trên số buổi đã học)
      const allSchedules = await ClassSchedule.find({ class: classId }).lean();
      const allScheduleIds = allSchedules.map(s => s._id);
      const studentSchedulesWithAttendance = await StudentSchedule.find({
        classSchedule: { $in: allScheduleIds },
        'attendance.status': { $ne: null }
      }).select('classSchedule').lean();
      const scheduleIdsWithAttendance = new Set(
        studentSchedulesWithAttendance.map(s => s.classSchedule.toString())
      );
      const attendedCount = allSchedules.filter(
        s => scheduleIdsWithAttendance.has(s._id.toString())
      ).length;
      
      // Kiểm tra xem có thể thêm buổi không
      if (attendedCount >= courseNumberOfSessions) {
        // Đã đủ số buổi đã học, không thể thêm
        datesToCreate.length = 0;
      } else {
        // Khi "Lặp lại vào các tuần", tạo số buổi bằng với numberOfSessions
        // Cleanup sẽ tự động xóa các buổi thừa để giữ đúng numberOfSessions
        const schedulesNeeded = courseNumberOfSessions;
        
        // Tạo các ngày cho các tuần tiếp theo (mỗi tuần 1 buổi)
        for (let week = 0; week < schedulesNeeded; week++) {
          const scheduleDate = new Date(firstDate);
          scheduleDate.setDate(firstDate.getDate() + (week * 7));
          
          // Format date để tránh timezone issues (dùng local time, không dùng UTC)
          const year = scheduleDate.getFullYear();
          const month = String(scheduleDate.getMonth() + 1).padStart(2, '0');
          const day = String(scheduleDate.getDate()).padStart(2, '0');
          const dateString = `${year}-${month}-${day}`;
          
          datesToCreate.push(dateString);
        }
      }
      
    } else {
      datesToCreate.push(date);
    }

    // ========== LOGGING: Preview ==========
    console.log('📋 ========== PREVIEW: THÊM BUỔI HỌC ==========');
    console.log('📅 Thông tin buổi học sẽ được thêm:');
    console.log('   - Lớp học ID:', classId);
    console.log('   - Lặp lại vào các tuần:', repeatWeekly ? 'Có' : 'Không');
    console.log('   - Số buổi sẽ được tạo:', datesToCreate.length);
    
    // Parse và hiển thị thứ của ngày đầu tiên nhận được
    // dayNames được khai báo ở đầu function để dùng chung
    const dayMap = { 'CN': 'Chủ Nhật', '2': 'Thứ Hai', '3': 'Thứ Ba', '4': 'Thứ Tư', '5': 'Thứ Năm', '6': 'Thứ Sáu', '7': 'Thứ Bảy' };
    const dateParts = date.split('-');
    const receivedDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    const receivedDayOfWeek = receivedDate.getDay();
    
    console.log('   - Thứ được chọn từ frontend:', selectedDay ? dayMap[selectedDay] || selectedDay : 'Không có');
    console.log('   - Ngày đầu tiên nhận được từ frontend:', date, `(${dayNames[receivedDayOfWeek]})`);
    if (selectedDay) {
      const expectedDay = dayMap[selectedDay];
      const actualDay = dayNames[receivedDayOfWeek];
      if (expectedDay !== actualDay) {
        console.log(`   - ⚠️ CẢNH BÁO: Thứ được chọn (${expectedDay}) KHÔNG KHỚP với thứ của ngày nhận được (${actualDay})!`);
      } else {
        console.log(`   - ✅ Thứ được chọn (${expectedDay}) KHỚP với thứ của ngày nhận được (${actualDay})`);
      }
    }
    
    if (datesToCreate.length > 0) {
      const firstDateObj = new Date(datesToCreate[0]);
      const firstDayOfWeek = firstDateObj.getDay();
      console.log('   - Ngày đầu tiên sẽ được tạo:', datesToCreate[0], `(${dayNames[firstDayOfWeek]})`);
      
      if (datesToCreate.length > 1) {
        const lastDateObj = new Date(datesToCreate[datesToCreate.length - 1]);
        const lastDayOfWeek = lastDateObj.getDay();
        console.log('   - Ngày cuối cùng sẽ được tạo:', datesToCreate[datesToCreate.length - 1], `(${dayNames[lastDayOfWeek]})`);
      }
    } else {
      console.log('   - ⚠️ Không có buổi nào sẽ được tạo (lớp đã đủ số buổi)');
    }
    console.log('   - Giờ bắt đầu:', startTime);
    console.log('   - Giờ kết thúc:', endTime);
    console.log('   - Phòng học:', roomData?.room_name || room);
    console.log('');
    
    if (datesToCreate.length > 1) {
      console.log('📅 Danh sách các ngày sẽ được tạo:');
      datesToCreate.forEach((d, idx) => {
        const dateParts = d.split('-');
        const dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
        const dayOfWeek = dateObj.getDay();
        console.log(`   ${idx + 1}. ${dateObj.toLocaleDateString('vi-VN')} (${dayNames[dayOfWeek]})`);
      });
      console.log('');
    }
    
    // Nếu không có buổi nào sẽ được tạo, return sớm
    if (datesToCreate.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Lớp đã đủ số buổi học. Không cần thêm buổi học mới.",
        preview: {
          canAdd: false,
          totalSchedules: await ClassSchedule.countDocuments({ class: classId }),
          attendedCount: 0,
          numberOfSessions: courseNumberOfSessions,
          schedulesToDelete: []
        }
      });
    }

    // Tính toán preview cho tất cả buổi sẽ được tạo
    const currentSchedulesCount = await ClassSchedule.countDocuments({ class: classId });
    const finalTotalSchedules = currentSchedulesCount + datesToCreate.length;
    
    // Lấy preview với số buổi sẽ thêm
    const basePreview = await getSchedulesToDeletePreview(classId, classInfo.course);
    
    // Tính toán lại với số buổi thực tế sẽ thêm
    const attendedCount = basePreview.attendedCount || 0;
    const numberOfSessions = basePreview.numberOfSessions || 0;
    
    console.log('🔍 Preview kết quả:');
    console.log(`   - Số buổi hiện tại: ${currentSchedulesCount}`);
    console.log(`   - Số buổi sẽ được tạo: ${datesToCreate.length}`);
    console.log(`   - Tổng số buổi sau khi thêm: ${finalTotalSchedules}`);
    console.log(`   - Số buổi đã học: ${attendedCount}`);
    console.log(`   - numberOfSessions của course: ${numberOfSessions}`);
    console.log('');
    console.log('📋 THỨ TỰ THỰC HIỆN:');
    console.log('   1️⃣  THÊM các buổi học mới trước');
    console.log('   2️⃣  Sau đó CLEANUP sẽ xóa các buổi thừa (từ dưới lên - các buổi mới nhất)');
    console.log('   3️⃣  Cuối cùng gán lại session cho tất cả buổi còn lại');
    console.log('');
    
    // ========== TÍNH TOÁN PREVIEW: TẠO 3 BẢNG ==========
    // 1. Bảng TRƯỚC KHI XÓA: Tất cả buổi hiện tại + buổi mới sẽ tạo
    // 2. Bảng SẼ XÓA: Các buổi mới nhất sẽ bị xóa (từ dưới lên)
    // 3. Bảng SAU KHI XÓA: Các buổi sẽ còn lại
    
    // Lấy tất cả schedules hiện tại
    const allCurrentSchedules = await ClassSchedule.find({ class: classId })
      .sort({ date: 1, startTime: 1 })
      .lean();
    
    const allCurrentScheduleIds = allCurrentSchedules.map(s => s._id);
    const studentSchedulesWithAttendance = await StudentSchedule.find({
      classSchedule: { $in: allCurrentScheduleIds },
      'attendance.status': { $ne: null }
    }).select('classSchedule').lean();
    
    const scheduleIdsWithAttendance = new Set(
      studentSchedulesWithAttendance.map(s => s.classSchedule.toString())
    );
    
    // Tạo danh sách TẤT CẢ buổi (hiện tại + mới sẽ tạo)
    const allSchedulesAfterAdd = [];
    
    // 1. Thêm tất cả buổi hiện tại
    allCurrentSchedules.forEach(schedule => {
      const hasAttendance = scheduleIdsWithAttendance.has(schedule._id.toString());
      allSchedulesAfterAdd.push({
        _id: schedule._id,
        date: schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        room: schedule.room,
        isNew: false,
        hasAttendance: hasAttendance
      });
    });
    
    // 2. Thêm tất cả buổi mới sẽ tạo
    datesToCreate.forEach((dateStr, idx) => {
      const dateParts = dateStr.split('-');
      const newScheduleDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      newScheduleDate.setHours(0, 0, 0, 0);
      allSchedulesAfterAdd.push({
        _id: `NEW_${idx}`,
        date: newScheduleDate,
        startTime: startTime,
        endTime: endTime,
        room: room,
        isNew: true,
        hasAttendance: false // Buổi mới chưa có attendance
      });
    });
    
    // 3. Sắp xếp tất cả buổi theo date (tăng dần)
    allSchedulesAfterAdd.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }
      // Nếu cùng ngày, sắp xếp theo startTime
      return (a.startTime || '').localeCompare(b.startTime || '');
    });
    
    // Tính số buổi sẽ bị xóa
    const totalToDelete = finalTotalSchedules > numberOfSessions ? finalTotalSchedules - numberOfSessions : 0;
    
    // Xác định các buổi sẽ bị xóa (các buổi mới nhất, không có attendance)
    const schedulesToDelete = [];
    if (totalToDelete > 0) {
      // Lấy các buổi không có attendance (có thể xóa)
      const deletableSchedules = allSchedulesAfterAdd.filter(s => !s.hasAttendance);
      
      // Sắp xếp theo date giảm dần (mới nhất trước) để xóa từ dưới lên
      deletableSchedules.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateB - dateA; // Giảm dần
        }
        return (b.startTime || '').localeCompare(a.startTime || '');
      });
      
      // Lấy các buổi mới nhất để xóa
      schedulesToDelete.push(...deletableSchedules.slice(0, totalToDelete));
    }
    
    // Tạo danh sách các buổi sẽ còn lại (sau khi xóa)
    const schedulesToDeleteIds = new Set(
      schedulesToDelete.map(s => s._id.toString())
    );
    const schedulesAfterDelete = allSchedulesAfterAdd.filter(
      s => !schedulesToDeleteIds.has(s._id.toString())
    );
    
    // ========== HIỂN THỊ 3 BẢNG ==========
    console.log('');
    console.log('📊 ========== BẢNG 1: TRƯỚC KHI XÓA ==========');
    console.log(`Tổng số buổi: ${allSchedulesAfterAdd.length} (${allCurrentSchedules.length} buổi hiện tại + ${datesToCreate.length} buổi mới sẽ tạo)`);
    console.log('');
    allSchedulesAfterAdd.forEach((schedule, index) => {
      const scheduleDate = new Date(schedule.date);
      const dateStr = scheduleDate.toLocaleDateString('vi-VN');
      const dayOfWeek = dayNames[scheduleDate.getDay()];
      const isNewMarker = schedule.isNew ? ' ⭐ MỚI' : '';
      const hasAttendanceMarker = schedule.hasAttendance ? ' ✓ Đã học' : '';
      const willDeleteMarker = schedulesToDeleteIds.has(schedule._id.toString()) ? ' ❌ SẼ XÓA' : '';
      console.log(`   ${index + 1}. ${dateStr} (${dayOfWeek}) - ${schedule.startTime} đến ${schedule.endTime}${isNewMarker}${hasAttendanceMarker}${willDeleteMarker}`);
    });
    console.log('==========================================');
    console.log('');
    
    if (schedulesToDelete.length > 0) {
      console.log('🗑️  ========== BẢNG 2: CÁC BUỔI SẼ BỊ XÓA ==========');
      console.log(`Tổng số buổi sẽ bị xóa: ${schedulesToDelete.length} (từ dưới lên - các buổi mới nhất)`);
      console.log('');
      schedulesToDelete.forEach((schedule, index) => {
        const scheduleDate = new Date(schedule.date);
        const dateStr = scheduleDate.toLocaleDateString('vi-VN');
        const dayOfWeek = dayNames[scheduleDate.getDay()];
        const isNewMarker = schedule.isNew ? ' ⭐ MỚI' : ' (Hiện tại)';
        console.log(`   ${index + 1}. ${dateStr} (${dayOfWeek}) - ${schedule.startTime} đến ${schedule.endTime}${isNewMarker}`);
      });
      console.log('==========================================');
      console.log('');
    } else {
      console.log('✅ Không có buổi nào sẽ bị xóa');
      console.log('');
    }
    
    console.log('✅ ========== BẢNG 3: SAU KHI XÓA ==========');
    console.log(`Tổng số buổi sẽ còn lại: ${schedulesAfterDelete.length} (đúng với numberOfSessions = ${numberOfSessions})`);
    console.log('');
    
    // Lấy course sessions để hiển thị session assignment
    const courseDataForSessions = await Course.findById(classInfo.course)
      .populate('sessions', 'order')
      .select('sessions')
      .lean();
    
    const courseSessions = courseDataForSessions && courseDataForSessions.sessions 
      ? [...courseDataForSessions.sessions].sort((a, b) => (a.order || 0) - (b.order || 0))
      : [];
    
    schedulesAfterDelete.forEach((schedule, index) => {
      const scheduleDate = new Date(schedule.date);
      const dateStr = scheduleDate.toLocaleDateString('vi-VN');
      const dayOfWeek = dayNames[scheduleDate.getDay()];
      const isNewMarker = schedule.isNew ? ' ⭐ MỚI' : '';
      const hasAttendanceMarker = schedule.hasAttendance ? ' ✓ Đã học' : '';
      const sessionIndex = index < courseSessions.length ? index : index % courseSessions.length;
      const sessionOrder = courseSessions[sessionIndex]?.order || sessionIndex + 1;
      console.log(`   ${index + 1}. ${dateStr} (${dayOfWeek}) - ${schedule.startTime} đến ${schedule.endTime} → Session ${sessionOrder}${isNewMarker}${hasAttendanceMarker}`);
    });
    console.log('==========================================');
    console.log('');

    // Kiểm tra xem có thể thêm buổi không
    if (attendedCount >= numberOfSessions) {
      return res.status(400).json({
        success: false,
        message: `Không thể thêm buổi học. Lớp đã có ${attendedCount} buổi đã học, đã đạt giới hạn ${numberOfSessions} buổi của khóa học.`,
        preview: {
          totalSchedules: currentSchedulesCount,
          attendedCount: attendedCount,
          numberOfSessions: numberOfSessions
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: "Preview thành công",
      preview: {
        schedulesToAdd: datesToCreate.map(d => ({
          date: d,
          startTime,
          endTime,
          room: roomData?.room_name || room
        })),
        totalSchedules: finalTotalSchedules,
        attendedCount: attendedCount,
        numberOfSessions: numberOfSessions,
        schedulesToDelete: schedulesToDelete || [],
        deletedCount: schedulesToDelete.length || 0
      }
    });
  } catch (err) {
    console.error("❌ Lỗi khi preview:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// =========================
// 🆕 TẠO BUỔI HỌC MỚI
// =========================
exports.createClassSchedule = async (req, res) => {
  try {
    const { classId, sessionNumber, date, startTime, endTime, room, repeatWeekly, selectedDay } = req.body;

    if (!classId || !date || !startTime || !endTime || !room) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });
    }

    // ✅ 1.5. Validation: Kiểm tra số buổi đã học và preview các buổi sẽ bị xóa
    const classInfo = await Class.findById(classId).select("course").lean();
    if (!classInfo || !classInfo.course) {
      return res.status(400).json({
        message: "Lớp học chưa có course được gán.",
      });
    }

    // Lấy course để biết numberOfSessions
    const courseData = await Course.findById(classInfo.course)
      .select('numberOfSessions')
      .lean();
    const courseNumberOfSessions = courseData?.numberOfSessions || 0;

    // Tính toán các ngày sẽ tạo nếu repeatWeekly = true
    const datesToCreate = [];
    if (repeatWeekly) {
      // Parse date từ string YYYY-MM-DD, tránh timezone issues
      const dateParts = date.split('-');
      const firstDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      firstDate.setHours(0, 0, 0, 0);
      
      // Khi "Lặp lại vào các tuần", tạo số buổi bằng với numberOfSessions
      // Cleanup sẽ tự động xóa các buổi thừa để giữ đúng numberOfSessions
      const schedulesNeeded = courseNumberOfSessions;
      
      // Tạo các ngày cho các tuần tiếp theo (mỗi tuần 1 buổi)
      for (let week = 0; week < schedulesNeeded; week++) {
        const scheduleDate = new Date(firstDate);
        scheduleDate.setDate(firstDate.getDate() + (week * 7));
        
        // Format date để tránh timezone issues (dùng local time, không dùng UTC)
        const year = scheduleDate.getFullYear();
        const month = String(scheduleDate.getMonth() + 1).padStart(2, '0');
        const day = String(scheduleDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        datesToCreate.push(dateString);
      }
    } else {
      // Chỉ tạo 1 buổi
      datesToCreate.push(date);
    }

    // ========== LOGGING: Preview trước khi thêm ==========
    console.log('📋 ========== TẠO BUỔI HỌC ==========');
    console.log('📅 Thông tin buổi học sẽ được thêm:');
    console.log('   - Lớp học ID:', classId);
    console.log('   - Lặp lại vào các tuần:', repeatWeekly ? 'Có' : 'Không');
    console.log('   - Số buổi sẽ được tạo:', datesToCreate.length);
    console.log('   - Ngày đầu tiên:', datesToCreate[0]);
    if (datesToCreate.length > 1) {
      console.log('   - Ngày cuối cùng:', datesToCreate[datesToCreate.length - 1]);
    }
    console.log('   - Giờ bắt đầu:', startTime);
    console.log('   - Giờ kết thúc:', endTime);
    console.log('   - Phòng học ID:', room);
    console.log('');

    // Validation: Kiểm tra xem có thể thêm không (dựa trên số buổi sẽ tạo)
    // Lấy số buổi hiện tại
    const currentSchedulesCount = await ClassSchedule.countDocuments({ class: classId });
    const finalTotalSchedules = currentSchedulesCount + datesToCreate.length;
    
    // Lấy preview để kiểm tra
    const allSchedules = await ClassSchedule.find({ class: classId }).lean();
    const allScheduleIds = allSchedules.map(s => s._id);
    const studentSchedulesWithAttendance = await StudentSchedule.find({
      classSchedule: { $in: allScheduleIds },
      'attendance.status': { $ne: null }
    }).select('classSchedule').lean();
    const scheduleIdsWithAttendance = new Set(
      studentSchedulesWithAttendance.map(s => s.classSchedule.toString())
    );
    const attendedCount = allSchedules.filter(
      s => scheduleIdsWithAttendance.has(s._id.toString())
    ).length;

    if (attendedCount >= courseNumberOfSessions) {
      return res.status(400).json({
        success: false,
        message: `Không thể thêm buổi học. Lớp đã có ${attendedCount} buổi đã học, đã đạt giới hạn ${courseNumberOfSessions} buổi của khóa học.`,
        cleanupInfo: {
          totalSchedules: currentSchedulesCount,
          attendedCount: attendedCount,
          numberOfSessions: courseNumberOfSessions
        }
      });
    }

    const preview = await getSchedulesToDeletePreview(classId, classInfo.course);
    
    console.log('🔍 Preview kết quả:');
    console.log('   - Có thể thêm:', preview.canAdd);
    console.log('   - Tổng số buổi hiện tại:', preview.totalSchedules || 0);
    console.log('   - Số buổi đã học:', preview.attendedCount || 0);
    console.log('   - Số buổi chưa học:', (preview.totalSchedules || 0) - (preview.attendedCount || 0));
    console.log('   - numberOfSessions của course:', preview.numberOfSessions || 0);
    
    if (preview.schedulesToDelete && preview.schedulesToDelete.length > 0) {
      console.log('   - Sẽ xóa các buổi sau:');
      preview.schedulesToDelete.forEach((schedule, index) => {
        const scheduleDate = new Date(schedule.date);
        console.log(`      ${index + 1}. ${scheduleDate.toLocaleDateString('vi-VN')} - ${schedule.startTime} đến ${schedule.endTime} (ID: ${schedule._id})`);
      });
    } else {
      console.log('   - Không có buổi nào sẽ bị xóa');
    }
    console.log('==========================================');
    
    if (!preview.canAdd) {
      console.log('❌ KHÔNG THỂ THÊM: Số buổi đã học >= numberOfSessions');
      return res.status(400).json({
        success: false,
        message: preview.errorMessage || "Không thể thêm buổi học.",
        cleanupInfo: {
          totalSchedules: preview.totalSchedules,
          attendedCount: preview.attendedCount,
          numberOfSessions: preview.numberOfSessions
        }
      });
    }

    // ✅ 2. Lấy thông tin class để có teacher và createdBy
    const classData = await Class.findById(classId).select("teacher teacherId").lean();
    if (!classData) {
      return res.status(404).json({ message: "Không tìm thấy lớp học." });
    }

    const teacherId = classData.teacher || classData.teacherId;
    const createdById = req.user?._id || teacherId; // Ưu tiên user đang đăng nhập, nếu không có thì dùng teacher

    // ✅ 3. Tạo các buổi học mới (có thể nhiều buổi nếu repeatWeekly = true)
    const createdSchedules = [];
    
    for (const dateStr of datesToCreate) {
      const newSchedule = await ClassSchedule.create({
        class: classId,
        sessionNumber,
        date: dateStr,
        startTime,
        endTime,
        room,
        teacher: teacherId,
        createdBy: createdById,
        reason: `Buổi học thêm mới - ${new Date(dateStr).toLocaleDateString('vi-VN')}`,
        status: 'fixed'
      });
      createdSchedules.push(newSchedule);
    }

    // ✅ 4. Lấy danh sách sinh viên trong lớp
    const classInfoWithStudents = await Class.findById(classId).populate("students");

    if (!classInfoWithStudents || !classInfoWithStudents.students || classInfoWithStudents.students.length === 0) {
      // Vẫn cleanup ngay cả khi không có students
      const cleanupResult = await cleanupSchedulesAfterAdding(classId, classInfo.course);
      
      return res.status(200).json({
        message: `Đã tạo ${createdSchedules.length} buổi học, nhưng lớp chưa có sinh viên.`,
        schedules: createdSchedules,
        cleanupInfo: cleanupResult.success ? {
          deletedCount: cleanupResult.deletedCount,
          reassignedSessions: cleanupResult.reassignedSessions
        } : null
      });
    }

    // ✅ 5. Tạo StudentSchedule cho từng sinh viên cho TẤT CẢ các buổi mới
    const studentSchedules = [];
    for (const schedule of createdSchedules) {
      for (const stuId of classInfoWithStudents.students) {
        studentSchedules.push({
          student: stuId,
          classSchedule: schedule._id,
          // Không set attendance - để null cho đến khi giáo viên điểm danh
        });
      }
    }

    await StudentSchedule.insertMany(studentSchedules);

    // ✅ 6. Cleanup: Xóa các buổi thừa và gán lại session
    console.log('');
    console.log('🧹 ========== BẮT ĐẦU CLEANUP ==========');
    console.log('📊 Trước cleanup:');
    console.log(`   - Đã tạo ${createdSchedules.length} buổi học mới`);
    createdSchedules.forEach((schedule, index) => {
      const scheduleDate = new Date(schedule.date);
      console.log(`      ${index + 1}. ${scheduleDate.toLocaleDateString('vi-VN')} - ${schedule.startTime} đến ${schedule.endTime} (ID: ${schedule._id})`);
    });
    console.log('   - Đang kiểm tra và cleanup...');
    console.log('');
    
    const cleanupResult = await cleanupSchedulesAfterAdding(classId, classInfo.course);
    
    console.log('');
    console.log('✅ ========== KẾT QUẢ CLEANUP ==========');
    console.log('   - Thành công:', cleanupResult.success);
    console.log('   - Số buổi đã xóa:', cleanupResult.deletedCount || 0);
    console.log('   - Số buổi đã gán lại session:', cleanupResult.reassignedSessions || 0);
    console.log('   - Tổng số buổi sau cleanup:', cleanupResult.totalSchedules || 0);
    console.log('==========================================');
    console.log('');

    // ✅ 7. Populate thông tin phòng khi trả về
    const populatedSchedules = await ClassSchedule.find({
      _id: { $in: createdSchedules.map(s => s._id) }
    })
      .populate("room", "room_name location status")
      .sort({ date: 1 });

    // Chuẩn bị cleanupInfo với thông tin về các buổi đã bị xóa
    const cleanupInfo = cleanupResult.success ? {
      deletedCount: cleanupResult.deletedCount || 0,
      reassignedSessions: cleanupResult.reassignedSessions || 0,
      totalSchedules: cleanupResult.totalSchedules || 0
    } : null;

    return res.status(201).json({
      success: true,
      message: `Đã tạo ${createdSchedules.length} buổi học và lịch sinh viên thành công.`,
      schedules: populatedSchedules,
      generated: studentSchedules.length,
      cleanupInfo
    });
  } catch (err) {
    console.error("❌ Lỗi khi tạo buổi học:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// =========================
// ✅ ĐIỂM DANH SINH VIÊN
// =========================
// =========================
// 📋 LẤY DANH SÁCH ĐIỂM DANH CỦA MỘT BUỔI HỌC
// =========================
exports.getAttendanceByClassSchedule = async (req, res) => {
  try {
    const { id } = req.params; // classScheduleId
    
    // Validate ID format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ"
      });
    }
    
    // Optimize query: chỉ lấy các fields cần thiết và không populate quá nhiều
    const list = await StudentSchedule.find({ classSchedule: id })
      .select("student attendance classSchedule")
      .populate("student", "username email")
      .lean(); // Use lean() for better performance

    res.status(200).json({
      success: true,
      message: "Danh sách điểm danh của buổi học",
      total: list.length,
      attendances: list,
      list, // Giữ lại để backward compatibility
    });
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách điểm danh:", err);
    res.status(500).json({ 
      success: false,
      message: "Lỗi server khi lấy danh sách điểm danh", 
      error: err.message 
    });
  }
};

// =========================
// ✅ ĐIỂM DANH SINH VIÊN
// =========================
exports.markAttendance = async (req, res) => {
  try {
    const { studentScheduleId } = req.params;
    const { status, teacherId } = req.body;

    const studentSchedule = await StudentSchedule.findById(studentScheduleId)
      .populate("classSchedule");

    if (!studentSchedule)
      return res.status(404).json({ message: "Không tìm thấy lịch học của sinh viên này" });

    const classSchedule = studentSchedule.classSchedule;
    if (!classSchedule)
      return res.status(404).json({ message: "Không tìm thấy buổi học tương ứng" });

    const today = new Date().toISOString().split("T")[0];
    const classDate = new Date(classSchedule.date).toISOString().split("T")[0];

    if (today !== classDate) {
      return res.status(400).json({
        message: `Chỉ được điểm danh vào ngày học (${classDate}). Hôm nay là ${today}.`,
      });
    }

    studentSchedule.attendance = {
      status,
      markedAt: new Date(),
      markedBy: teacherId,
    };

    await studentSchedule.save();

    res.json({
      message: "Điểm danh thành công",
      studentSchedule,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi điểm danh", error });
  }
};

// =========================
// 📚 LẤY STUDENTSCHEDULE THEO CLASS SCHEDULE IDs
// =========================
exports.getStudentSchedulesByClassSchedules = async (req, res) => {
  try {
    const { classScheduleIds } = req.body;
    
    if (!classScheduleIds || !Array.isArray(classScheduleIds) || classScheduleIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách classScheduleIds'
      });
    }

    // Tìm tất cả StudentSchedule có classSchedule trong danh sách
    const studentSchedules = await StudentSchedule.find({
      classSchedule: { $in: classScheduleIds }
    })
      .populate('student', 'username email phone')
      .populate({
        path: 'classSchedule',
        select: 'date startTime endTime room class session status',
        populate: [
          {
            path: 'class',
            select: 'name'
          },
          {
            path: 'room',
            select: 'room_name location capacity'
          },
          {
            path: 'session',
            select: 'title order'
          }
        ]
      })
      .lean();

    res.status(200).json({
      success: true,
      message: 'Lấy StudentSchedule thành công',
      total: studentSchedules.length,
      studentSchedules
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy StudentSchedule:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy StudentSchedule',
      error: error.message
    });
  }
};

// =========================
// 📚 LẤY LỊCH HỌC CỦA HỌC SINH
// =========================
exports.getStudentSchedule = async (req, res) => {
  try {
    const { studentId } = req.params;
    const Class = require("../models/classModel");
    const Course = require("../models/courseModel");

    // Tìm tất cả StudentSchedule của học sinh và populate các thông tin cần thiết
    const studentSchedules = await StudentSchedule.find({ student: studentId })
      .populate({
        path: "classSchedule",
        select: "date startTime endTime room class topic session status",
        populate: [
          {
            path: "class",
            select: "name subject teacherId course",
            populate: {
              path: "teacherId",
              select: "username email",
            },
          },
          {
            path: "room",
            select: "room_name location",
          },
          {
            path: "session",
            select: "title order",
          },
        ],
      })
      .lean(); // Sử dụng lean() để có thể sort dễ dàng hơn

    // Sắp xếp theo ngày và giờ bắt đầu
    studentSchedules.sort((a, b) => {
      if (!a.classSchedule || !b.classSchedule) return 0;
      const dateA = new Date(a.classSchedule.date);
      const dateB = new Date(b.classSchedule.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }
      // Nếu cùng ngày, sắp xếp theo startTime
      return (a.classSchedule.startTime || "").localeCompare(b.classSchedule.startTime || "");
    });

    // Nếu không có lịch học, trả về mảng rỗng thay vì lỗi 404
    if (!studentSchedules || studentSchedules.length === 0) {
      return res.status(200).json({
        message: "Học sinh này chưa có lịch học nào.",
        total: 0,
        schedules: [],
      });
    }

    // Nhóm schedules theo class để lấy course sessions một lần
    const classSessionsMap = {};
    
    // Format dữ liệu để trả về đúng định dạng yêu cầu
    const formattedSchedules = await Promise.all(
      studentSchedules
        .filter((ss) => ss.classSchedule) // Lọc những schedule hợp lệ
        .map(async (ss) => {
          const classSchedule = ss.classSchedule;
          const classInfo = classSchedule.class;
          const teacher = classInfo?.teacherId;
          const room = classSchedule.room;

          // Nếu không có session, thử lấy từ course
          let sessionTitle = classSchedule.session?.title;
          if (!sessionTitle && classInfo?.course) {
            const classId = classInfo._id?.toString();
            
            // Lấy course sessions nếu chưa có trong map
            if (!classSessionsMap[classId]) {
              try {
                const classData = await Class.findById(classId)
                  .populate({
                    path: "course",
                    select: "sessions",
                    populate: {
                      path: "sessions",
                      select: "title order",
                    },
                  })
                  .lean();
                
                if (classData?.course?.sessions) {
                  const courseSessions = [...classData.course.sessions].sort(
                    (a, b) => (a.order || 0) - (b.order || 0)
                  );
                  
                  // Lấy tất cả ClassSchedule của lớp này để xác định thứ tự
                  const ClassSchedule = require("../models/classScheduleModel");
                  const allClassSchedules = await ClassSchedule.find({ class: classId })
                    .sort({ date: 1, startTime: 1 })
                    .lean();
                  
                  // Tìm index của schedule hiện tại
                  const scheduleIndex = allClassSchedules.findIndex(
                    (s) => s._id.toString() === classSchedule._id.toString()
                  );
                  
                  if (scheduleIndex >= 0 && courseSessions.length > 0) {
                    const sessionIndex = scheduleIndex % courseSessions.length;
                    sessionTitle = courseSessions[sessionIndex]?.title;
                  }
                  
                  classSessionsMap[classId] = { courseSessions, allClassSchedules };
                }
              } catch (err) {
                console.error("Error getting course sessions:", err);
              }
            } else {
              // Đã có trong map, sử dụng lại
              const { courseSessions, allClassSchedules } = classSessionsMap[classId];
              const scheduleIndex = allClassSchedules.findIndex(
                (s) => s._id.toString() === classSchedule._id.toString()
              );
              
              if (scheduleIndex >= 0 && courseSessions.length > 0) {
                const sessionIndex = scheduleIndex % courseSessions.length;
                sessionTitle = courseSessions[sessionIndex]?.title;
              }
            }
          }

          // Get className - try classInfo first, if null try to get from classSchedule.class directly
          let className = classInfo?.name;
          if (!className && classSchedule.class) {
            // If classInfo is null but classSchedule.class exists, it might be an ObjectId
            // Try to populate it if it's not already populated
            if (typeof classSchedule.class === 'object' && classSchedule.class.name) {
              className = classSchedule.class.name;
            }
          }
          
          return {
            _id: ss._id,
            startTime: classSchedule.startTime,
            endTime: classSchedule.endTime,
            className: className || "N/A",
            subject: classInfo?.subject || "N/A",
            teacher: teacher
              ? {
                  _id: teacher._id,
                  username: teacher.username,
                  email: teacher.email,
                }
              : null,
            room: room
              ? {
                  _id: room._id,
                  room_name: room.room_name,
                  location: room.location,
                }
              : null,
            date: classSchedule.date,
            topic: classSchedule.topic,
            sessionTitle: sessionTitle || classSchedule.topic || null,
            status: classSchedule.status || "fixed",
            attendance: ss.attendance,
            scheduleStatus: ss.scheduleStatus || "scheduled",
            reason: ss.reason || null,
          };
        })
    );

    res.status(200).json({
      message: "Lấy lịch học của học sinh thành công.",
      total: formattedSchedules.length,
      schedules: formattedSchedules,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy lịch học của học sinh:", error);
    res.status(500).json({
      message: "Lỗi server khi lấy lịch học của học sinh.",
      error: error.message,
    });
  }
};

// =========================
// 📚 LẤY DANH SÁCH CLASS SCHEDULE CÓ CÙNG SESSION VÀ SAU HÔM NAY
// =========================
exports.getClassSchedulesBySession = async (req, res) => {
  try {
    const { sessionId, sessionOrder, dateAfter } = req.query;
    
    if (!sessionId && !sessionOrder) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp sessionId hoặc sessionOrder'
      });
    }

    const today = dateAfter ? new Date(dateAfter) : new Date();
    today.setHours(0, 0, 0, 0);

    // Tạo query để tìm ClassSchedule
    const query = {
      date: { $gte: today },
      status: { $in: ['fixed', 'temporary'] }
    };

    // Nếu có sessionId, tìm theo session ID
    if (sessionId) {
      query.session = sessionId;
    }

    // Tìm tất cả ClassSchedule thỏa mãn điều kiện
    let classSchedules = await ClassSchedule.find(query)
      .populate('session', 'title order')
      .populate('class', 'name')
      .populate('room', 'room_name')
      .populate({
        path: 'class',
        populate: {
          path: 'course',
          select: 'name'
        }
      })
      .sort({ date: 1, startTime: 1 })
      .lean();

    // Nếu có sessionOrder, filter thêm theo order
    if (sessionOrder !== undefined && sessionOrder !== null) {
      classSchedules = classSchedules.filter(schedule => {
        return schedule.session && schedule.session.order === parseInt(sessionOrder);
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách ClassSchedule thành công',
      total: classSchedules.length,
      classSchedules
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách ClassSchedule:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách ClassSchedule',
      error: error.message
    });
  }
};

// =========================
// 👨‍🏫 LẤY LỊCH DẠY CỦA GIÁO VIÊN
// =========================
exports.getTeacherSchedule = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // ✅ Bước 1: Tìm tất cả lớp của giáo viên này
    const teacherClasses = await Class.find({ teacherId }).select("_id name subject");
    
    if (!teacherClasses || teacherClasses.length === 0) {
      return res.status(200).json({
        message: "Giáo viên này chưa có lớp nào.",
        total: 0,
        schedules: [],
      });
    }

    // ✅ Bước 2: Lấy danh sách classIds
    const classIds = teacherClasses.map((cls) => cls._id);

    // ✅ Bước 3: Tìm tất cả ClassSchedule của các lớp này
    const classSchedules = await ClassSchedule.find({ class: { $in: classIds } })
      .populate({
        path: "class",
        select: "name subject teacherId",
      })
      .populate({
        path: "room",
        select: "room_name location",
      })
      .lean();

    // ✅ Bước 4: Sắp xếp theo ngày và giờ bắt đầu
    classSchedules.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }
      // Nếu cùng ngày, sắp xếp theo startTime
      return (a.startTime || "").localeCompare(b.startTime || "");
    });

    // ✅ Bước 5: Nếu không có lịch dạy, trả về mảng rỗng
    if (!classSchedules || classSchedules.length === 0) {
      return res.status(200).json({
        message: "Giáo viên này chưa có lịch dạy nào.",
        total: 0,
        schedules: [],
      });
    }

    // ✅ Bước 6: Format dữ liệu để trả về đúng định dạng yêu cầu
    const formattedSchedules = classSchedules.map((schedule) => {
      const classInfo = schedule.class;
      const room = schedule.room;

      return {
        _id: schedule._id,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        className: classInfo?.name || "N/A",
        classId: schedule.class?._id?.toString() || schedule.class?.toString() || null,
        subject: classInfo?.subject || "N/A",
        room: room
          ? {
              _id: room._id,
              room_name: room.room_name,
              location: room.location,
            }
          : null,
        date: schedule.date,
        topic: schedule.topic,
        status: schedule.status,
      };
    });

    res.status(200).json({
      message: "Lấy lịch dạy của giáo viên thành công.",
      total: formattedSchedules.length,
      schedules: formattedSchedules,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy lịch dạy của giáo viên:", error);
    res.status(500).json({
      message: "Lỗi server khi lấy lịch dạy của giáo viên.",
      error: error.message,
    });
  }
};

// =========================
// ✅ VALIDATE SCHEDULE CONFLICT: KIỂM TRA CONFLICT VỚI TEACHER VÀ ROOM (KHÔNG CẦN CLASSID)
// =========================
exports.validateScheduleConflictSimple = async (req, res) => {
  try {
    const { date, startTime, endTime, room, teacher, studentId, excludeScheduleId } = req.body;

    if (!date || !startTime || !endTime || !room) {
      return res.status(400).json({ 
        success: false,
        message: "Thiếu thông tin bắt buộc: date, startTime, endTime, room" 
      });
    }

    const conflicts = {
      teacher: [],
      room: [],
      students: [],
      hasConflict: false
    };

    // Parse date string (YYYY-MM-DD) và tạo Date object ở local timezone
    const dateParts = date.split('-');
    if (dateParts.length !== 3) {
      return res.status(400).json({ 
        success: false,
        message: "Định dạng ngày không hợp lệ. Phải là YYYY-MM-DD." 
      });
    }
    
    // Parse date string (YYYY-MM-DD) và tạo Date range để tránh vấn đề timezone
    // Tạo start và end của ngày ở UTC để đảm bảo query chính xác
    const scheduleDateStart = new Date(
      Date.UTC(
        parseInt(dateParts[0]), // year
        parseInt(dateParts[1]) - 1, // month (0-indexed)
        parseInt(dateParts[2]) // day
      )
    );
    const scheduleDateEnd = new Date(scheduleDateStart);
    scheduleDateEnd.setUTCDate(scheduleDateEnd.getUTCDate() + 1); // Ngày tiếp theo

    // Helper function để check time overlap
    const hasTimeOverlap = (start1, end1, start2, end2) => {
      const timeToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const parts = timeStr.split(':');
        if (parts.length !== 2) return 0;
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        return hours * 60 + minutes;
      };
      
      const start1Min = timeToMinutes(start1);
      const end1Min = timeToMinutes(end1);
      const start2Min = timeToMinutes(start2);
      const end2Min = timeToMinutes(end2);
      
      return start1Min < end2Min && end1Min > start2Min;
    };

    // Helper function để format date (sử dụng UTC để tránh lệch timezone)
    const formatDateLocal = (dateInput) => {
      if (!dateInput) return null;
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return null;
      // Sử dụng UTC để tránh lệch timezone khi format date từ database
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // 1. Kiểm tra conflict PHÒNG HỌC
    // Sử dụng range query để tránh vấn đề timezone
    const roomScheduleQuery = {
      room: new mongoose.Types.ObjectId(room),
      date: {
        $gte: scheduleDateStart,
        $lt: scheduleDateEnd
      },
      status: { $in: ['temporary', 'fixed'] }
    };

    // Exclude current schedule if provided
    if (excludeScheduleId) {
      roomScheduleQuery._id = { $ne: new mongoose.Types.ObjectId(excludeScheduleId) };
    }

    const roomSchedules = await ClassSchedule.find(roomScheduleQuery)
      .populate('class', 'name')
      .select('date startTime endTime class')
      .lean();

    roomSchedules.forEach((schedule) => {
      if (hasTimeOverlap(startTime, endTime, schedule.startTime, schedule.endTime)) {
        conflicts.room.push({
          roomId: room.toString(),
          className: schedule.class?.name || 'N/A',
          date: formatDateLocal(schedule.date),
          time: `${schedule.startTime} - ${schedule.endTime}`,
          conflictingTime: `${startTime} - ${endTime}`
        });
        conflicts.hasConflict = true;
      }
    });

    // 2. Kiểm tra conflict GIÁO VIÊN (nếu có)
    if (teacher) {
      const teacherClasses = await Class.find({
        $or: [
          { teacher: teacher },
          { teacherId: teacher }
        ]
      }).select('_id name').lean();

      if (teacherClasses.length > 0) {
        const teacherClassIds = teacherClasses.map(c => c._id);

        const teacherScheduleQuery = {
          class: { $in: teacherClassIds },
          date: {
            $gte: scheduleDateStart,
            $lt: scheduleDateEnd
          },
          status: { $in: ['temporary', 'fixed'] }
        };

        // Exclude current schedule if provided
        if (excludeScheduleId) {
          teacherScheduleQuery._id = { $ne: new mongoose.Types.ObjectId(excludeScheduleId) };
        }

        const teacherSchedules = await ClassSchedule.find(teacherScheduleQuery)
          .populate('class', 'name')
          .select('date startTime endTime class')
          .lean();

        console.log('🔍 Kiểm tra conflict giáo viên:', {
          teacherId: teacher,
          date: date,
          excludeScheduleId: excludeScheduleId,
          foundSchedules: teacherSchedules.length,
          schedules: teacherSchedules.map(s => ({
            id: s._id,
            className: s.class?.name,
            date: formatDateLocal(s.date),
            time: `${s.startTime} - ${s.endTime}`
          }))
        });

        teacherSchedules.forEach((schedule) => {
          if (hasTimeOverlap(startTime, endTime, schedule.startTime, schedule.endTime)) {
            conflicts.teacher.push({
              teacherId: teacher.toString(),
              className: schedule.class?.name || 'N/A',
              date: formatDateLocal(schedule.date),
              time: `${schedule.startTime} - ${schedule.endTime}`,
              conflictingTime: `${startTime} - ${endTime}`
            });
            conflicts.hasConflict = true;
          }
        });
      }
    }

    // 3. Kiểm tra conflict với LỊCH HỌC CỦA HỌC SINH (nếu có studentId)
    if (studentId) {
      const studentSchedules = await StudentSchedule.find({ student: studentId })
        .populate({
          path: 'classSchedule',
          select: 'date startTime endTime class',
          populate: {
            path: 'class',
            select: 'name'
          }
        })
        .lean();

      // Format date của buổi học bù mới
      const makeupDateStr = formatDateLocal(scheduleDateStart);

      studentSchedules.forEach(studentSchedule => {
        if (!studentSchedule.classSchedule) return;
        
        const scheduleDate = new Date(studentSchedule.classSchedule.date);
        const scheduleDateStr = formatDateLocal(scheduleDate);
        
        // Kiểm tra cùng ngày và trùng giờ
        if (scheduleDateStr === makeupDateStr &&
            hasTimeOverlap(startTime, endTime, 
              studentSchedule.classSchedule.startTime, 
              studentSchedule.classSchedule.endTime)) {
          conflicts.students.push({
            studentId: studentId.toString(),
            className: studentSchedule.classSchedule.class?.name || 'N/A',
            date: scheduleDateStr,
            time: `${studentSchedule.classSchedule.startTime} - ${studentSchedule.classSchedule.endTime}`,
            conflictingTime: `${startTime} - ${endTime}`
          });
          conflicts.hasConflict = true;
        }
      });
    }

    return res.status(200).json({
      success: true,
      hasConflict: conflicts.hasConflict,
      conflicts: conflicts
    });
  } catch (error) {
    console.error("❌ Lỗi khi validate conflict:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi validate conflict",
      error: error.message
    });
  }
};

// =========================
// ✅ TẠO BUỔI HỌC BÙ MỚI (KHÔNG CẦN CLASSID)
// =========================
exports.createMakeupClassSchedule = async (req, res) => {
  try {
    const { date, startTime, endTime, room, teacher, session, reason, createdBy } = req.body;

    if (!date || !startTime || !endTime || !room || !teacher) {
      return res.status(400).json({ 
        success: false,
        message: "Thiếu thông tin bắt buộc: date, startTime, endTime, room, teacher" 
      });
    }

    // Parse date string (YYYY-MM-DD) và tạo Date object ở local timezone
    const dateParts = date.split('-');
    if (dateParts.length !== 3) {
      return res.status(400).json({ 
        success: false,
        message: "Định dạng ngày không hợp lệ. Phải là YYYY-MM-DD." 
      });
    }
    
    const scheduleDate = new Date(
      parseInt(dateParts[0]), // year
      parseInt(dateParts[1]) - 1, // month (0-indexed)
      parseInt(dateParts[2]) // day
    );
    scheduleDate.setHours(0, 0, 0, 0);

    // Kiểm tra conflict với room và teacher
    const roomConflict = await ClassSchedule.findOne({
      room: new mongoose.Types.ObjectId(room),
      date: scheduleDate,
      status: { $in: ['temporary', 'fixed'] },
      $or: [
        { $and: [{ startTime: { $lte: startTime } }, { endTime: { $gt: startTime } }] },
        { $and: [{ startTime: { $lt: endTime } }, { endTime: { $gte: endTime } }] },
        { $and: [{ startTime: { $gte: startTime } }, { endTime: { $lte: endTime } }] }
      ]
    }).lean();

    if (roomConflict) {
      return res.status(400).json({
        success: false,
        message: "Phòng học đã được sử dụng vào thời gian này"
      });
    }

    // Kiểm tra conflict với teacher
    const teacherClasses = await Class.find({
      $or: [
        { teacher: teacher },
        { teacherId: teacher }
      ]
    }).select('_id').lean();

    if (teacherClasses.length > 0) {
      const teacherClassIds = teacherClasses.map(c => c._id);
      const teacherConflict = await ClassSchedule.findOne({
        class: { $in: teacherClassIds },
        date: scheduleDate,
        status: { $in: ['temporary', 'fixed'] },
        $or: [
          { $and: [{ startTime: { $lte: startTime } }, { endTime: { $gt: startTime } }] },
          { $and: [{ startTime: { $lt: endTime } }, { endTime: { $gte: endTime } }] },
          { $and: [{ startTime: { $gte: startTime } }, { endTime: { $lte: endTime } }] }
        ]
      }).lean();

      if (teacherConflict) {
        return res.status(400).json({
          success: false,
          message: "Giáo viên đã có lớp khác vào thời gian này"
        });
      }
    }

    // Tạo ClassSchedule mới (không có classId)
    const newSchedule = await ClassSchedule.create({
      class: null, // Không có classId cho buổi học bù
      session: session ? new mongoose.Types.ObjectId(session) : null, // Session từ buổi nghỉ (nếu có)
      date: scheduleDate,
      startTime,
      endTime,
      room: new mongoose.Types.ObjectId(room),
      teacher: new mongoose.Types.ObjectId(teacher),
      createdBy: createdBy ? new mongoose.Types.ObjectId(createdBy) : new mongoose.Types.ObjectId(teacher),
      reason: reason || 'Buổi học bù',
      status: 'temporary' // Buổi học bù là temporary
    });

    // Populate để trả về đầy đủ thông tin
    const populatedSchedule = await ClassSchedule.findById(newSchedule._id)
      .populate('room', 'room_name location')
      .populate('teacher', 'username email fullName')
      .populate('session', 'title order content')
      .lean();

    return res.status(201).json({
      success: true,
      message: "Đã tạo buổi học bù thành công",
      schedule: populatedSchedule
    });
  } catch (error) {
    console.error("❌ Lỗi khi tạo buổi học bù:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo buổi học bù",
      error: error.message
    });
  }
};

// =========================
// ✅ VALIDATE HỌC BÙ: KIỂM TRA CONFLICT VỚI BUỔI HỌC CỦA HỌC SINH
// =========================
exports.validateMakeupClassSchedule = async (req, res) => {
  try {
    const { makeupClassScheduleId, studentId } = req.body;

    if (!makeupClassScheduleId || !studentId) {
      return res.status(400).json({ 
        success: false,
        message: "Thiếu thông tin bắt buộc: makeupClassScheduleId và studentId" 
      });
    }

    // 1. Lấy thông tin buổi học bù
    const makeupSchedule = await ClassSchedule.findById(makeupClassScheduleId)
      .populate('class', 'name')
      .select('date startTime endTime class')
      .lean();

    if (!makeupSchedule) {
      return res.status(404).json({ 
        success: false,
        message: "Không tìm thấy buổi học bù" 
      });
    }

    // Parse date và format
    const makeupDate = new Date(makeupSchedule.date);
    makeupDate.setHours(0, 0, 0, 0);
    
    // Helper function để format date (sử dụng UTC để tránh lệch timezone)
    const formatDateLocal = (dateInput) => {
      if (!dateInput) return null;
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return null;
      // Sử dụng UTC để tránh lệch timezone khi format date từ database
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const makeupDateStr = formatDateLocal(makeupDate);

    // Helper function để check time overlap
    const hasTimeOverlap = (start1, end1, start2, end2) => {
      const timeToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const parts = timeStr.split(':');
        if (parts.length !== 2) return 0;
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        return hours * 60 + minutes;
      };
      
      const start1Min = timeToMinutes(start1);
      const end1Min = timeToMinutes(end1);
      const start2Min = timeToMinutes(start2);
      const end2Min = timeToMinutes(end2);
      
      return start1Min < end2Min && end1Min > start2Min;
    };

    // 2. Lấy tất cả buổi học của học sinh
    const studentSchedules = await StudentSchedule.find({ student: studentId })
      .populate({
        path: 'classSchedule',
        select: 'date startTime endTime class',
        populate: {
          path: 'class',
          select: 'name'
        }
      })
      .lean();

    // 3. Kiểm tra conflict
    const conflicts = [];
    
    studentSchedules.forEach(studentSchedule => {
      if (!studentSchedule.classSchedule) return;
      
      const scheduleDate = new Date(studentSchedule.classSchedule.date);
      scheduleDate.setHours(0, 0, 0, 0);
      const scheduleDateStr = formatDateLocal(scheduleDate);
      
      // Kiểm tra cùng ngày và trùng giờ
      if (scheduleDateStr === makeupDateStr && 
          hasTimeOverlap(
            makeupSchedule.startTime, 
            makeupSchedule.endTime,
            studentSchedule.classSchedule.startTime,
            studentSchedule.classSchedule.endTime
          )) {
        conflicts.push({
          className: studentSchedule.classSchedule.class?.name || 'N/A',
          date: scheduleDateStr,
          time: `${studentSchedule.classSchedule.startTime} - ${studentSchedule.classSchedule.endTime}`
        });
      }
    });

    const hasConflict = conflicts.length > 0;

    return res.status(200).json({
      success: true,
      hasConflict,
      conflicts: conflicts,
      message: hasConflict 
        ? `Học sinh đã có ${conflicts.length} buổi học khác vào cùng thời gian với buổi học bù` 
        : "Không có conflict với lịch học của học sinh"
    });

  } catch (err) {
    console.error("❌ Lỗi khi validate học bù:", err);
    res.status(500).json({ 
      success: false,
      message: "Lỗi server khi validate học bù", 
      error: err.message 
    });
  }
};

// =========================
// 👨‍🏫 XẾP NGƯỜI DẠY THAY CHO BUỔI HỌC
// =========================
exports.assignSubstituteTeacher = async (req, res) => {
  try {
    const { id: scheduleId } = req.params;
    const { substituteTeacherId } = req.body;

    if (!substituteTeacherId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin giáo viên dạy thay'
      });
    }

    // Lấy ClassSchedule
    const classSchedule = await ClassSchedule.findById(scheduleId)
      .populate('class', 'name teacher')
      .populate('room', 'room_name')
      .populate('teacher', 'username');

    if (!classSchedule) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy buổi học'
      });
    }

    // Kiểm tra xem buổi học có phải là quá khứ không
    const scheduleDate = new Date(classSchedule.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    scheduleDate.setHours(0, 0, 0, 0);
    
    if (scheduleDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xếp người dạy thay cho buổi học đã qua'
      });
    }

    // Lưu giáo viên gốc (giữ nguyên teacher)
    const originalTeacher = classSchedule.teacher;

    // Lấy tất cả lớp của giáo viên dạy thay
    const substituteTeacherClasses = await Class.find({
      $or: [
        { teacher: substituteTeacherId },
        { teacherId: substituteTeacherId }
      ]
    }).select('_id name').lean();

    if (substituteTeacherClasses.length > 0) {
      const substituteTeacherClassIds = substituteTeacherClasses.map(c => c._id);

      // Kiểm tra xung đột thời gian
      const hasTimeOverlap = (start1, end1, start2, end2) => {
        const timeToMinutes = (timeStr) => {
          if (!timeStr) return 0;
          const parts = timeStr.split(':');
          if (parts.length !== 2) return 0;
          const hours = parseInt(parts[0], 10);
          const minutes = parseInt(parts[1], 10);
          return hours * 60 + minutes;
        };
        
        const start1Min = timeToMinutes(start1);
        const end1Min = timeToMinutes(end1);
        const start2Min = timeToMinutes(start2);
        const end2Min = timeToMinutes(end2);
        
        return start1Min < end2Min && end1Min > start2Min;
      };

      const conflictSchedule = await ClassSchedule.findOne({
        class: { $in: substituteTeacherClassIds },
        date: scheduleDate,
        status: { $in: ['temporary', 'fixed'] },
        _id: { $ne: new mongoose.Types.ObjectId(scheduleId) },
        $or: [
          { $and: [{ startTime: { $lte: classSchedule.startTime } }, { endTime: { $gt: classSchedule.startTime } }] },
          { $and: [{ startTime: { $lt: classSchedule.endTime } }, { endTime: { $gte: classSchedule.endTime } }] },
          { $and: [{ startTime: { $gte: classSchedule.startTime } }, { endTime: { $lte: classSchedule.endTime } }] }
        ]
      })
        .populate('class', 'name')
        .lean();

      if (conflictSchedule) {
        return res.status(400).json({
          success: false,
          message: `Giáo viên dạy thay đã có lớp khác (${conflictSchedule.class?.name || 'N/A'}) vào thời gian này`,
          hasConflict: true
        });
      }
    }

    // Gán giáo viên dạy thay vào substituteTeacher
    // teacher giữ nguyên là giáo viên gốc
    classSchedule.substituteTeacher = new mongoose.Types.ObjectId(substituteTeacherId);

    // Thêm note để ghi nhận việc có giáo viên dạy thay
    const substituteNote = `Giáo viên dạy thay: ${substituteTeacherId} (Giáo viên gốc: ${originalTeacher._id || originalTeacher})`;
    if (classSchedule.note) {
      classSchedule.note += `\n${substituteNote}`;
    } else {
      classSchedule.note = substituteNote;
    }

    await classSchedule.save();

    // Populate để trả về đầy đủ thông tin
    const updatedSchedule = await ClassSchedule.findById(classSchedule._id)
      .populate('class', 'name')
      .populate('room', 'room_name location')
      .populate('teacher', 'username email')
      .populate('substituteTeacher', 'username email')
      .populate('session', 'title order')
      .lean();

    res.status(200).json({
      success: true,
      message: 'Đã xếp người dạy thay thành công',
      schedule: updatedSchedule
    });
  } catch (error) {
    console.error('❌ Lỗi khi xếp người dạy thay:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xếp người dạy thay',
      error: error.message
    });
  }
};