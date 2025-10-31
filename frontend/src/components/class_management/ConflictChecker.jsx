// ConflictChecker utility for detecting schedule conflicts

const ConflictChecker = {
  // Check for conflicts between schedules
  checkConflicts: (newSchedules, existingSchedules) => {
    const conflicts = [];

    newSchedules.forEach(newSchedule => {
      // Check teacher conflicts
      const teacherConflicts = ConflictChecker.checkTeacherConflict(newSchedule, existingSchedules);
      conflicts.push(...teacherConflicts);

      // Check room conflicts
      const roomConflicts = ConflictChecker.checkRoomConflict(newSchedule, existingSchedules);
      conflicts.push(...roomConflicts);

      // Check class conflicts (students can't have overlapping schedules)
      const classConflicts = ConflictChecker.checkClassConflict(newSchedule, existingSchedules);
      conflicts.push(...classConflicts);
    });

    return conflicts;
  },

  // Check if teacher has overlapping schedules
  checkTeacherConflict: (schedule, existingSchedules) => {
    const conflicts = [];
    const scheduleDate = schedule.date;
    const scheduleStart = schedule.startTime;
    const scheduleEnd = schedule.endTime;
    const teacherId = schedule.teacherId;

    const overlapping = existingSchedules.filter(existing => {
      // Skip if it's the same schedule (for edit mode)
      if (existing.id === schedule.id) return false;

      return (
        existing.date === scheduleDate &&
        existing.teacherId === teacherId &&
        ConflictChecker.timeOverlaps(scheduleStart, scheduleEnd, existing.startTime, existing.endTime) &&
        existing.status !== 'cancelled'
      );
    });

    overlapping.forEach(conflict => {
      conflicts.push({
        type: 'teacher',
        message: `Giảng viên ${schedule.teacherName} đã có lịch dạy lớp ${conflict.className} vào ${conflict.startTime} - ${conflict.endTime}`,
        scheduleId: schedule.id,
        conflictScheduleId: conflict.id,
        severity: 'high'
      });
    });

    return conflicts;
  },

  // Check if room is already occupied
  checkRoomConflict: (schedule, existingSchedules) => {
    const conflicts = [];
    const scheduleDate = schedule.date;
    const scheduleStart = schedule.startTime;
    const scheduleEnd = schedule.endTime;
    const roomId = schedule.roomId;

    const overlapping = existingSchedules.filter(existing => {
      // Skip if it's the same schedule (for edit mode)
      if (existing.id === schedule.id) return false;

      return (
        existing.date === scheduleDate &&
        existing.roomId === roomId &&
        ConflictChecker.timeOverlaps(scheduleStart, scheduleEnd, existing.startTime, existing.endTime) &&
        existing.status !== 'cancelled'
      );
    });

    overlapping.forEach(conflict => {
      conflicts.push({
        type: 'room',
        message: `Phòng ${schedule.roomName} đã có lớp ${conflict.className} học vào ${conflict.startTime} - ${conflict.endTime}`,
        scheduleId: schedule.id,
        conflictScheduleId: conflict.id,
        severity: 'high'
      });
    });

    return conflicts;
  },

  // Check if class already has schedule at that time
  checkClassConflict: (schedule, existingSchedules) => {
    const conflicts = [];
    const scheduleDate = schedule.date;
    const scheduleStart = schedule.startTime;
    const scheduleEnd = schedule.endTime;
    const classId = schedule.classId;

    const overlapping = existingSchedules.filter(existing => {
      // Skip if it's the same schedule (for edit mode)
      if (existing.id === schedule.id) return false;

      return (
        existing.date === scheduleDate &&
        existing.classId === classId &&
        ConflictChecker.timeOverlaps(scheduleStart, scheduleEnd, existing.startTime, existing.endTime) &&
        existing.status !== 'cancelled'
      );
    });

    overlapping.forEach(conflict => {
      conflicts.push({
        type: 'class',
        message: `Lớp ${schedule.className} đã có lịch học vào ${conflict.startTime} - ${conflict.endTime} tại ${conflict.roomName}`,
        scheduleId: schedule.id,
        conflictScheduleId: conflict.id,
        severity: 'high'
      });
    });

    return conflicts;
  },

  // Check if two time ranges overlap
  timeOverlaps: (start1, end1, start2, end2) => {
    const convertToMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const start1Minutes = convertToMinutes(start1);
    const end1Minutes = convertToMinutes(end1);
    const start2Minutes = convertToMinutes(start2);
    const end2Minutes = convertToMinutes(end2);

    // Check if ranges overlap
    return (
      (start1Minutes < end2Minutes && end1Minutes > start2Minutes) ||
      (start2Minutes < end1Minutes && end2Minutes > start1Minutes)
    );
  },

  // Get conflict summary
  getConflictSummary: (conflicts) => {
    const summary = {
      total: conflicts.length,
      byType: {
        teacher: conflicts.filter(c => c.type === 'teacher').length,
        room: conflicts.filter(c => c.type === 'room').length,
        class: conflicts.filter(c => c.type === 'class').length
      },
      bySeverity: {
        high: conflicts.filter(c => c.severity === 'high').length,
        medium: conflicts.filter(c => c.severity === 'medium').length,
        low: conflicts.filter(c => c.severity === 'low').length
      }
    };

    return summary;
  }
};

export default ConflictChecker;
