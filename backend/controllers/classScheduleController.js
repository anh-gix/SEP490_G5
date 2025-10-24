const ClassSchedule = require("../models/classScheduleModel");
const StudentSchedule = require("../models/studentScheduleModel");
const Class = require("../models/classModel");
const mongoose = require("mongoose");

// =========================
// 📘 LẤY DANH SÁCH LỚP CỦA GIÁO VIÊN
// =========================
exports.getClassesByTeacher = async (req, res) => {
    try {
      const { teacherId } = req.params; // Lấy id từ URL
  
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
        .select("sessionNumber date startTime endTime room")
        .sort({ date: 1 }); // sắp xếp theo ngày tăng dần
  
      if (!schedules.length) {
        return res.status(404).json({ message: "Lớp này chưa có lịch học." });
      }
  
      res.status(200).json(schedules);
    } catch (error) {
      console.error("❌ Lỗi khi lấy lịch học:", error);
      res.status(500).json({ message: "Lỗi server khi lấy lịch học." });
    }
  };
/**
 * ✅ Tạo buổi học mới (ClassSchedule)
 * Khi tạo xong, tự động generate StudentSchedule cho tất cả sinh viên trong lớp
 * ⚙️ Có kiểm tra trùng phòng (room conflict)
 */
exports.createClassSchedule = async (req, res) => {
    try {
      const { classId, sessionNumber, date, startTime, endTime, room } = req.body;
  
      if (!classId || !date || !startTime || !endTime || !room) {
        return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });
      }
  
      // ✅ 1. Kiểm tra trùng phòng
      const sameDaySchedules = await ClassSchedule.find({
        room,
        date: new Date(date),
      });
  
      // Kiểm tra xem khung giờ có bị giao nhau không
      const isConflict = sameDaySchedules.some((schedule) => {
        return (
          (startTime < schedule.endTime && endTime > schedule.startTime)
        );
      });
  
      if (isConflict) {
        return res.status(400).json({
          message: `Phòng ${room} đã được sử dụng trong khung giờ này.`,
        });
      }
  
      // ✅ 2. Tạo buổi học mới trong ClassSchedule
      const newSchedule = await ClassSchedule.create({
        class: classId,
        sessionNumber,
        date,
        startTime,
        endTime,
        room,
      });
  
      // ✅ 3. Lấy danh sách sinh viên trong lớp
      const classInfo = await Class.findById(classId).populate("students");
  
      if (!classInfo || !classInfo.students || classInfo.students.length === 0) {
        return res.status(200).json({
          message: "Buổi học được tạo, nhưng lớp chưa có sinh viên.",
          schedule: newSchedule,
        });
      }
  
      // ✅ 4. Tạo studentSchedule cho từng sinh viên
      const studentSchedules = classInfo.students.map((stuId) => ({
        student: stuId,
        classSchedule: newSchedule._id,
        attendance: { status: "absent" },
      }));
  
      await StudentSchedule.insertMany(studentSchedules);
  
      return res.status(201).json({
        message: "Tạo buổi học và lịch sinh viên thành công.",
        schedule: newSchedule,
        generated: studentSchedules.length,
      });
    } catch (err) {
      console.error("❌ Lỗi khi tạo buổi học:", err);
      res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  };

/**
 * ✅ điểm danh sinh viên
 */
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
  
      // ✅ Lấy ngày hôm nay (chỉ tính phần yyyy-mm-dd)
      const today = new Date().toISOString().split("T")[0];
      const classDate = new Date(classSchedule.date).toISOString().split("T")[0];
  
      // ⚠️ Nếu chưa đến ngày học hoặc đã qua ngày học thì không cho điểm danh
      if (today !== classDate) {
        return res.status(400).json({
          message: `Chỉ được điểm danh vào ngày học (${classDate}). Hôm nay là ${today}.`,
        });
      }
  
      // ✅ Cập nhật điểm danh
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

/**
 * ✅ Lấy danh sách học sinh của 1 buổi học để diểm danh
 */
exports.getAttendanceByClassSchedule = async (req, res) => {
  try {
    const { classScheduleId } = req.params;
    const list = await StudentSchedule.find({ classSchedule: classScheduleId })
      .populate("student", "username")
      .populate("classSchedule");

    res.status(200).json({
      message: "Danh sách điểm danh của buổi học",
      total: list.length,
      list,
    });
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
