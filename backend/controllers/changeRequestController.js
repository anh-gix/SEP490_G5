const ChangeRequest = require('../models/changeRequestModel');
const User = require('../models/userModel');
const Role = require('../models/roleModel');
const ClassSchedule = require('../models/classScheduleModel');
const StudentSchedule = require('../models/studentScheduleModel');
const Class = require('../models/classModel');
const mongoose = require('mongoose');

// =========================
// 📋 LẤY DANH SÁCH TẤT CẢ ĐƠN
// =========================
exports.getAllChangeRequests = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Search by content or sender name/email
    if (search) {
      // First, find users matching the search term
      const User = require('../models/userModel');
      const matchingUsers = await User.find({
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id').lean();
      
      const userIds = matchingUsers.map(u => u._id);
      
      // Search in content or sender
      query.$or = [
        { content: { $regex: search, $options: 'i' } }
      ];
      
      if (userIds.length > 0) {
        query.$or.push({ sender: { $in: userIds } });
      }
    }
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Get total count
    const total = await ChangeRequest.countDocuments(query);
    
    // Get paginated results
    // Sắp xếp theo ngày gửi cũ nhất trước (để xử lý những đơn lâu nhất trước)
    const changeRequests = await ChangeRequest.find(query)
      .populate('sender', 'username email phone')
      .populate('approver', 'username email')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    res.status(200).json({
      success: true,
      message: "Lấy danh sách đơn thành công",
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      changeRequests
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách đơn:", error);
    res.status(500).json({ 
      success: false,
      message: "Lỗi server khi lấy danh sách đơn",
      error: error.message 
    });
  }
};

// =========================
// 📅 LẤY LỊCH HỌC/DẠY CỦA NGƯỜI GỬI ĐƠN
// =========================
exports.getSenderSchedule = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    // Lấy thông tin đơn
    const changeRequest = await ChangeRequest.findById(requestId)
      .populate('sender', 'username email roleId');
    
    if (!changeRequest) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn'
      });
    }
    
    const sender = changeRequest.sender;
    if (!sender) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người gửi đơn'
      });
    }
    
    // Lấy role để xác định là học sinh hay giáo viên
    const role = await Role.findById(sender.roleId);
    const isStudent = role?.name === 'Student';
    const isTeacher = role?.name === 'Teacher';
    
    let schedules = [];
    
    if (isStudent) {
      // Lấy TẤT CẢ StudentSchedule của học sinh (bao gồm cả buổi học bù ở lớp khác)
      const allStudentSchedules = await StudentSchedule.find({
        student: sender._id
      })
      .populate({
        path: 'classSchedule',
        select: 'date startTime endTime class room session status topic teacher createdBy reason',
        populate: [
          {
            path: 'class',
            select: 'name',
            populate: {
              path: 'course',
              select: 'name'
            }
          },
          {
            path: 'room',
            select: 'room_name location'
          },
          {
            path: 'session',
            select: 'title order'
          },
          {
            path: 'teacher',
            select: 'username email'
          }
        ]
      })
      .lean();
      
      // Chuyển đổi StudentSchedule thành format giống ClassSchedule để tương thích với frontend
      schedules = allStudentSchedules
        .filter(ss => ss.classSchedule) // Chỉ lấy những cái có classSchedule hợp lệ
        .map(ss => {
          const classSchedule = ss.classSchedule;
          return {
            _id: classSchedule._id,
            date: classSchedule.date,
            startTime: classSchedule.startTime,
            endTime: classSchedule.endTime,
            status: classSchedule.status,
            topic: classSchedule.topic,
            class: classSchedule.class,
            room: classSchedule.room,
            session: classSchedule.session,
            teacher: classSchedule.teacher,
            createdBy: classSchedule.createdBy,
            reason: classSchedule.reason,
            // Thông tin từ StudentSchedule
            attendance: ss.attendance || null,
            scheduleStatus: ss.scheduleStatus || 'scheduled',
            studentScheduleReason: ss.reason || null
          };
        })
        .sort((a, b) => {
          // Sắp xếp theo date và startTime
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB;
          }
          return (a.startTime || '').localeCompare(b.startTime || '');
        });
    } else if (isTeacher) {
      // Lấy lịch dạy của giáo viên - lấy tất cả lịch dạy (không giới hạn thời gian)
      const teacherClasses = await Class.find({ teacher: sender._id })
        .select('_id name')
        .lean();
      
      if (teacherClasses.length > 0) {
        const classIds = teacherClasses.map(cls => cls._id);
        
        schedules = await ClassSchedule.find({
          class: { $in: classIds },
          status: { $in: ['temporary', 'fixed'] }
        })
        .populate({
          path: 'class',
          select: 'name',
          populate: {
            path: 'course',
            select: 'name'
          }
        })
        .populate('room', 'room_name location')
        .populate('session', 'title order')
        .sort({ date: 1, startTime: 1 })
        .lean();
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Lấy lịch thành công',
      sender: {
        _id: sender._id,
        username: sender.username,
        email: sender.email,
        role: role?.name || 'Unknown'
      },
      schedules
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy lịch:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy lịch",
      error: error.message
    });
  }
};

// =========================
// ✅ CHẤP NHẬN ĐƠN
// =========================
exports.approveChangeRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const { pendingMakeupClasses, pendingClassChange } = req.body;
    const approverId = req.user?._id || req.body.approverId; // Lấy từ token hoặc body
    
    // Lấy thông tin đơn trước khi cập nhật
    const changeRequest = await ChangeRequest.findById(id)
      .populate('sender', 'username email phone')
      .session(session);
    
    if (!changeRequest) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn'
      });
    }
    
    const studentId = changeRequest.sender._id || changeRequest.sender;
    
    // Xử lý buổi học bù nếu có
    if (pendingMakeupClasses && Array.isArray(pendingMakeupClasses) && pendingMakeupClasses.length > 0) {
      console.log(`📚 Xử lý ${pendingMakeupClasses.length} buổi học bù cho học sinh ${studentId}`);
      
      for (const makeup of pendingMakeupClasses) {
        const { absentScheduleId, makeupScheduleId, makeupClassId } = makeup;
        
        if (!absentScheduleId || !makeupScheduleId) {
          console.warn('⚠️ Thiếu thông tin buổi học bù:', makeup);
          continue;
        }
        
        // Kiểm tra ClassSchedule có tồn tại không
        const makeupClassSchedule = await ClassSchedule.findById(makeupScheduleId).session(session);
        const absentClassSchedule = await ClassSchedule.findById(absentScheduleId).session(session);
        
        if (!makeupClassSchedule) {
          console.warn(`⚠️ Không tìm thấy ClassSchedule cho buổi học bù: ${makeupScheduleId}`);
          continue;
        }
        
        if (!absentClassSchedule) {
          console.warn(`⚠️ Không tìm thấy ClassSchedule cho buổi nghỉ: ${absentScheduleId}`);
          continue;
        }
        
        // Kiểm tra xem đã có StudentSchedule cho buổi học bù chưa (tránh duplicate)
        const existingMakeupSchedule = await StudentSchedule.findOne({
          student: studentId,
          classSchedule: makeupScheduleId
        }).session(session);
        
        if (!existingMakeupSchedule) {
          // Tạo StudentSchedule mới cho buổi học bù
          const newStudentSchedule = new StudentSchedule({
            student: studentId,
            classSchedule: makeupScheduleId,
            scheduleStatus: 'rescheduled',
            reason: `Học bù cho buổi nghỉ ngày ${new Date(absentClassSchedule.date).toLocaleDateString('vi-VN')}`
          });
          
          await newStudentSchedule.save({ session });
          console.log(`✅ Đã tạo StudentSchedule cho buổi học bù: ${makeupScheduleId}`);
        } else {
          console.log(`ℹ️ StudentSchedule cho buổi học bù đã tồn tại: ${makeupScheduleId}`);
        }
        
        // Cập nhật StudentSchedule của buổi nghỉ thành cancelled
        const absentStudentSchedule = await StudentSchedule.findOne({
          student: studentId,
          classSchedule: absentScheduleId
        }).session(session);
        
        if (absentStudentSchedule) {
          absentStudentSchedule.scheduleStatus = 'cancelled';
          absentStudentSchedule.reason = `Học bù tại lớp khác (${makeupClassId})`;
          await absentStudentSchedule.save({ session });
          console.log(`✅ Đã cập nhật StudentSchedule buổi nghỉ thành cancelled: ${absentScheduleId}`);
        } else {
          console.warn(`⚠️ Không tìm thấy StudentSchedule cho buổi nghỉ: ${absentScheduleId}`);
        }
      }
    }
    
    // Xử lý đổi lớp nếu có
    if (pendingClassChange) {
      console.log('🔄 Bắt đầu xử lý đổi lớp...');
      
      const { oldClassId, newClassId } = pendingClassChange;
      
      // 1. Validate dữ liệu
      if (!oldClassId || !newClassId) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin lớp cũ hoặc lớp mới'
        });
      }
      
      // Kiểm tra lớp cũ và lớp mới có tồn tại
      const oldClass = await Class.findById(oldClassId).session(session);
      const newClass = await Class.findById(newClassId).session(session);
      
      if (!oldClass) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy lớp cũ'
        });
      }
      
      if (!newClass) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy lớp mới'
        });
      }
      
      // Kiểm tra học viên có trong lớp cũ không
      const studentInOldClass = oldClass.students.some(
        id => id.toString() === studentId.toString()
      );
      
      if (!studentInOldClass) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'Học viên không có trong lớp cũ'
        });
      }
      
      // Kiểm tra lớp mới còn chỗ không (nếu có maxStudents)
      if (newClass.maxStudents) {
        const currentStudentCount = newClass.students ? newClass.students.length : 0;
        if (currentStudentCount >= newClass.maxStudents) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            success: false,
            message: 'Lớp mới đã đầy'
          });
        }
      }
      
      // 2. Lấy session order hiện tại của lớp cũ và lớp mới
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Tìm ClassSchedule gần nhất (date >= today) của lớp cũ
      const oldClassSchedules = await ClassSchedule.find({
        class: oldClassId,
        date: { $gte: today }
      })
        .populate('session', 'order')
        .sort({ date: 1, startTime: 1 })
        .limit(1)
        .session(session)
        .lean();
      
      // Tìm ClassSchedule gần nhất (date >= today) của lớp mới
      const newClassSchedules = await ClassSchedule.find({
        class: newClassId,
        date: { $gte: today }
      })
        .populate('session', 'order')
        .sort({ date: 1, startTime: 1 })
        .limit(1)
        .session(session)
        .lean();
      
      const oldClassSessionOrder = oldClassSchedules.length > 0 && oldClassSchedules[0].session
        ? oldClassSchedules[0].session.order
        : null;
      const newClassSessionOrder = newClassSchedules.length > 0 && newClassSchedules[0].session
        ? newClassSchedules[0].session.order
        : null;
      
      console.log(`📊 Session order - Lớp cũ: ${oldClassSessionOrder}, Lớp mới: ${newClassSessionOrder}`);
      
      // Xác định trường hợp
      let caseType = 1; // Mặc định là trường hợp 1
      if (oldClassSessionOrder !== null && newClassSessionOrder !== null) {
        if (oldClassSessionOrder < newClassSessionOrder) {
          caseType = 2; // Lớp cũ < lớp mới
        } else if (oldClassSessionOrder > newClassSessionOrder) {
          caseType = 3; // Lớp cũ > lớp mới
        }
      }
      
      console.log(`🔍 Trường hợp xử lý: ${caseType}`);
      
      // 3. Xử lý Class model
      // Xóa học viên khỏi lớp cũ
      oldClass.students = oldClass.students.filter(
        id => id.toString() !== studentId.toString()
      );
      await oldClass.save({ session });
      console.log(`✅ Đã xóa học viên khỏi lớp cũ: ${oldClassId}`);
      
      // Thêm học viên vào lớp mới (nếu chưa có)
      const studentInNewClass = newClass.students.some(
        id => id.toString() === studentId.toString()
      );
      if (!studentInNewClass) {
        newClass.students.push(studentId);
        await newClass.save({ session });
        console.log(`✅ Đã thêm học viên vào lớp mới: ${newClassId}`);
      }
      
      // 4. Xử lý StudentSchedule
      // a) Lấy tất cả ClassSchedule của lớp cũ
      const allOldClassSchedules = await ClassSchedule.find({
        class: oldClassId
      })
        .populate('session', 'order')
        .session(session)
        .lean();
      
      const oldClassScheduleIds = allOldClassSchedules.map(s => s._id);
      
      // b) Lấy tất cả StudentSchedule của học viên ở lớp cũ
      const studentSchedules = await StudentSchedule.find({
        student: studentId,
        classSchedule: { $in: oldClassScheduleIds }
      })
        .populate({
          path: 'classSchedule',
          populate: {
            path: 'session',
            select: 'order'
          }
        })
        .session(session)
        .lean();
      
      console.log(`📋 Tìm thấy ${studentSchedules.length} StudentSchedule của học viên ở lớp cũ`);
      
      // c) Lấy tất cả ClassSchedule của lớp mới để match
      const allNewClassSchedules = await ClassSchedule.find({
        class: newClassId
      })
        .populate('session', 'order')
        .session(session)
        .lean();
      
      // Tạo map để tìm ClassSchedule theo session order
      const newClassScheduleMap = new Map();
      allNewClassSchedules.forEach(schedule => {
        if (schedule.session && schedule.session.order !== null && schedule.session.order !== undefined) {
          const order = schedule.session.order;
          if (!newClassScheduleMap.has(order)) {
            newClassScheduleMap.set(order, []);
          }
          newClassScheduleMap.get(order).push(schedule);
        }
      });
      
      // Tạo set các absentScheduleId đã được xử lý trong pendingMakeupClasses (đã cancel riêng)
      const processedAbsentScheduleIds = new Set();
      if (pendingMakeupClasses && Array.isArray(pendingMakeupClasses)) {
        pendingMakeupClasses.forEach(makeup => {
          if (makeup.absentScheduleId) {
            processedAbsentScheduleIds.add(makeup.absentScheduleId.toString());
          }
        });
      }
      console.log(`📋 Đã xử lý ${processedAbsentScheduleIds.size} buổi học bù, các buổi này sẽ không bị cancel lại`);
      
      // d) Xử lý từng StudentSchedule
      let updatedCount = 0;
      let cancelledCount = 0;
      let unchangedCount = 0;
      
      for (const studentSchedule of studentSchedules) {
        const classSchedule = studentSchedule.classSchedule;
        if (!classSchedule) continue;
        
        const sessionOrder = classSchedule.session?.order;
        const hasAttendance = studentSchedule.attendance && studentSchedule.attendance.status !== null;
        const classScheduleId = classSchedule._id?.toString() || classSchedule.toString();
        
        // Kiểm tra buổi học đã diễn ra chưa (date < today)
        const scheduleDate = new Date(classSchedule.date);
        scheduleDate.setHours(0, 0, 0, 0);
        const isPastSchedule = scheduleDate < today;
        
        // Nếu đã có điểm danh hoặc đã diễn ra, giữ nguyên
        if (hasAttendance || isPastSchedule) {
          unchangedCount++;
          console.log(`⏭️ Giữ nguyên StudentSchedule ${studentSchedule._id} (${hasAttendance ? 'đã có điểm danh' : 'đã diễn ra'})`);
          continue;
        }
        
        // Nếu buổi học này đã được xử lý trong pendingMakeupClasses (đã cancel riêng), bỏ qua
        if (processedAbsentScheduleIds.has(classScheduleId)) {
          unchangedCount++;
          console.log(`⏭️ Giữ nguyên StudentSchedule ${studentSchedule._id} (đã được xử lý trong buổi học bù)`);
          continue;
        }
        
        // Xử lý theo từng trường hợp
        if (caseType === 1) {
          // Trường hợp 1: session order bằng nhau
          if (sessionOrder !== null && sessionOrder !== undefined) {
            const matchingSchedules = newClassScheduleMap.get(sessionOrder);
            if (matchingSchedules && matchingSchedules.length > 0) {
              // Lấy ClassSchedule đầu tiên có cùng session order
              const newClassScheduleId = matchingSchedules[0]._id;
              await StudentSchedule.findByIdAndUpdate(
                studentSchedule._id,
                { classSchedule: newClassScheduleId },
                { session }
              );
              updatedCount++;
              console.log(`✅ Updated StudentSchedule ${studentSchedule._id} -> ClassSchedule ${newClassScheduleId} (session ${sessionOrder})`);
            }
          }
        } else if (caseType === 2) {
          // Trường hợp 2: lớp cũ < lớp mới
          // Khi có học bù, chỉ cancel những buổi được chọn để học bù
          // Các buổi khác có sessionOrder < newClassSessionOrder sẽ được giữ nguyên
          // vì học viên đã học ở lớp cũ rồi, không cần cancel
          if (sessionOrder !== null && sessionOrder !== undefined) {
            if (sessionOrder < newClassSessionOrder) {
              // Nếu có pendingMakeupClasses, chỉ cancel những buổi trong danh sách học bù
              // Các buổi khác giữ nguyên (học viên đã học rồi)
              if (pendingMakeupClasses && pendingMakeupClasses.length > 0) {
                // Đã được xử lý ở trên (processedAbsentScheduleIds), nên đến đây là các buổi không cần cancel
                unchangedCount++;
                console.log(`⏭️ Giữ nguyên StudentSchedule ${studentSchedule._id} (session ${sessionOrder} < ${newClassSessionOrder}, không nằm trong danh sách học bù)`);
              } else {
                // Không có học bù, cancel tất cả buổi có sessionOrder < newClassSessionOrder
                await StudentSchedule.findByIdAndUpdate(
                  studentSchedule._id,
                  {
                    scheduleStatus: 'cancelled',
                    reason: 'Đã đổi lớp'
                  },
                  { session }
                );
                cancelledCount++;
                console.log(`🚫 Cancelled StudentSchedule ${studentSchedule._id} (session ${sessionOrder} < ${newClassSessionOrder}, date: ${scheduleDate.toISOString().split('T')[0]})`);
              }
            } else if (sessionOrder >= newClassSessionOrder) {
              // Session order >= lớp mới: update classSchedule
              const matchingSchedules = newClassScheduleMap.get(sessionOrder);
              if (matchingSchedules && matchingSchedules.length > 0) {
                const newClassScheduleId = matchingSchedules[0]._id;
                await StudentSchedule.findByIdAndUpdate(
                  studentSchedule._id,
                  { classSchedule: newClassScheduleId },
                  { session }
                );
                updatedCount++;
                console.log(`✅ Updated StudentSchedule ${studentSchedule._id} -> ClassSchedule ${newClassScheduleId} (session ${sessionOrder})`);
              }
            }
          }
        } else if (caseType === 3) {
          // Trường hợp 3: lớp cũ > lớp mới
          if (sessionOrder !== null && sessionOrder !== undefined) {
            if (sessionOrder < oldClassSessionOrder) {
              // Session order < lớp cũ: không thay đổi gì
              unchangedCount++;
              console.log(`⏭️ Giữ nguyên StudentSchedule ${studentSchedule._id} (session ${sessionOrder} < ${oldClassSessionOrder})`);
            } else if (sessionOrder >= oldClassSessionOrder) {
              // Session order >= lớp cũ: update classSchedule
              const matchingSchedules = newClassScheduleMap.get(sessionOrder);
              if (matchingSchedules && matchingSchedules.length > 0) {
                const newClassScheduleId = matchingSchedules[0]._id;
                await StudentSchedule.findByIdAndUpdate(
                  studentSchedule._id,
                  { classSchedule: newClassScheduleId },
                  { session }
                );
                updatedCount++;
                console.log(`✅ Updated StudentSchedule ${studentSchedule._id} -> ClassSchedule ${newClassScheduleId} (session ${sessionOrder})`);
              }
            }
          }
        }
      }
      
      console.log(`📊 Kết quả xử lý StudentSchedule:`);
      console.log(`   - Updated: ${updatedCount}`);
      console.log(`   - Cancelled: ${cancelledCount}`);
      console.log(`   - Unchanged: ${unchangedCount}`);
      console.log(`✅ Hoàn thành xử lý đổi lớp`);
    }
    
    // Cập nhật trạng thái đơn sử dụng findByIdAndUpdate để tránh lỗi validation
    const updatedChangeRequest = await ChangeRequest.findByIdAndUpdate(
      id,
      {
        status: 'approved',
        approver: approverId,
        approvedDate: new Date()
      },
      { 
        new: true,
        session: session
      }
    )
    .populate('sender', 'username email phone')
    .populate('approver', 'username email');
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({
      success: true,
      message: 'Đã chấp nhận đơn thành công',
      changeRequest: updatedChangeRequest
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Lỗi khi chấp nhận đơn:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi chấp nhận đơn",
      error: error.message
    });
  }
};

// =========================
// ❌ TỪ CHỐI ĐƠN
// =========================
exports.rejectChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { responseContent } = req.body; // Lý do từ chối (không bắt buộc)
    const approverId = req.user?._id || req.body.approverId; // Lấy từ token hoặc body
    
    const changeRequest = await ChangeRequest.findByIdAndUpdate(
      id,
      {
        status: 'rejected',
        approver: approverId,
        approvedDate: new Date(),
        responseContent: responseContent || null
      },
      { new: true }
    )
    .populate('sender', 'username email phone')
    .populate('approver', 'username email');
    
    if (!changeRequest) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Đã từ chối đơn thành công',
      changeRequest
    });
  } catch (error) {
    console.error("❌ Lỗi khi từ chối đơn:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi từ chối đơn",
      error: error.message
    });
  }
};

