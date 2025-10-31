const ClassSchedule = require("../models/classScheduleModel");
const StudentSchedule = require("../models/studentScheduleModel");
const Class = require("../models/classModel");
const Room = require("../models/room");
const mongoose = require("mongoose");

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
      .select("sessionNumber date startTime endTime room")
      .populate("room", "room_name") // ✅ thêm populate phòng học
      .sort({ date: 1 });

    if (!schedules.length) {
      return res.status(404).json({ message: "Lớp này chưa có lịch học." });
    }

    res.status(200).json(schedules);
  } catch (error) {
    console.error("❌ Lỗi khi lấy lịch học:", error);
    res.status(500).json({ message: "Lỗi server khi lấy lịch học." });
  }
};

// =========================
// 🆕 TẠO BUỔI HỌC MỚI
// =========================
exports.createClassSchedule = async (req, res) => {
  try {
    const { classId, sessionNumber, date, startTime, endTime, room } = req.body;

    if (!classId || !date || !startTime || !endTime || !room) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });
    }

    // ✅ 1. Kiểm tra trùng phòng theo ngày & giờ
    const sameDaySchedules = await ClassSchedule.find({
      room: new mongoose.Types.ObjectId(room),
      date: new Date(date),
    });

    const isConflict = sameDaySchedules.some((schedule) => {
      return startTime < schedule.endTime && endTime > schedule.startTime;
    });

    if (isConflict) {
      return res.status(400).json({
        message: `Phòng học đã được sử dụng trong khung giờ này.`,
      });
    }

    // ✅ 2. Tạo buổi học mới
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

    // ✅ 4. Tạo StudentSchedule cho từng sinh viên
    const studentSchedules = classInfo.students.map((stuId) => ({
      student: stuId,
      classSchedule: newSchedule._id,
      attendance: { status: "absent" },
    }));

    await StudentSchedule.insertMany(studentSchedules);

    // ✅ 5. Populate thông tin phòng khi trả về
    const populatedSchedule = await ClassSchedule.findById(newSchedule._id)
      .populate("room", "room_name location status");

    return res.status(201).json({
      message: "Tạo buổi học và lịch sinh viên thành công.",
      schedule: populatedSchedule,
      generated: studentSchedules.length,
    });
  } catch (err) {
    console.error("❌ Lỗi khi tạo buổi học:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
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
// ✅ LẤY DANH SÁCH ĐIỂM DANH THEO BUỔI HỌC
// =========================
exports.getAttendanceByClassSchedule = async (req, res) => {
  try {
    const { classScheduleId } = req.params;
    const list = await StudentSchedule.find({ classSchedule: classScheduleId })
      .populate("student", "username")
      .populate({
        path: "classSchedule",
        populate: { path: "room", select: "room_name location" }, // ✅ thêm populate room
      });

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
