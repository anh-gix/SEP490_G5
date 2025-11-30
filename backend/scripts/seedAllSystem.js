require('dotenv').config();
const mongoose = require('mongoose');

// Import models needed for seeding class tables
const Role = require('../models/roleModel');
const User = require('../models/userModel');
const Room = require('../models/room');
const Course = require('../models/courseModel');
const Session = require('../models/sessionModel');
const Class = require('../models/classModel');
const ClassSchedule = require('../models/classScheduleModel');
const StudentSchedule = require('../models/studentScheduleModel');

// Store created classes for reference
const seedData = {
    classes: []
};

async function clearDatabase() {
    console.log('\n🗑️  Clearing existing data for Class, ClassSchedule, StudentSchedule...');
    await StudentSchedule.deleteMany({});
    await ClassSchedule.deleteMany({});
    await Class.deleteMany({});
    console.log('✅ Cleared Class, ClassSchedule, and StudentSchedule tables\n');
}


async function seedClasses() {
    console.log('📝 Seeding Classes...');
    
    // Query existing data from database
    const courses = await Course.find({ status: 'approved' }).lean();
    const rooms = await Room.find().lean();
    
    // Find Teacher and Student roles
    const teacherRole = await Role.findOne({ name: 'Teacher' });
    const studentRole = await Role.findOne({ name: 'Student' });
    
    if (!teacherRole || !studentRole) {
        console.log('⚠️  Không tìm thấy Teacher hoặc Student role. Vui lòng seed roles trước.');
        return;
    }
    
    const teachers = await User.find({ roleId: teacherRole._id }).lean();
    const students = await User.find({ roleId: studentRole._id }).lean();
    
    // Validate data exists
    if (courses.length === 0) {
        console.log('⚠️  Không tìm thấy courses trong database. Vui lòng seed courses trước.');
        return;
    }
    if (teachers.length === 0) {
        console.log('⚠️  Không tìm thấy teachers trong database. Vui lòng seed users với role Teacher trước.');
        return;
    }
    if (students.length === 0) {
        console.log('⚠️  Không tìm thấy students trong database. Vui lòng seed users với role Student trước.');
        return;
    }
    if (rooms.length === 0) {
        console.log('⚠️  Không tìm thấy rooms trong database. Vui lòng seed rooms trước.');
        return;
    }
    
    console.log(`   - Found ${courses.length} courses, ${teachers.length} teachers, ${students.length} students, ${rooms.length} rooms`);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for consistent date comparison
    
    // Lớp đang học: startDate 2 tuần trước, endDate 2 tuần sau
    // Đảm bảo có schedules cả trong quá khứ và tương lai
    const activeClassStartDate = new Date(today);
    activeClassStartDate.setDate(today.getDate() - 14); // 2 tuần trước
    const activeClassEndDate = new Date(today);
    activeClassEndDate.setDate(today.getDate() + 14); // 2 tuần sau
    
    // Lớp chưa học: startDate 1 tuần sau, endDate 5 tuần sau
    // Tất cả schedules sẽ trong tương lai
    const pendingClassStartDate = new Date(today);
    pendingClassStartDate.setDate(today.getDate() + 7); // 1 tuần sau
    const pendingClassEndDate = new Date(today);
    pendingClassEndDate.setDate(today.getDate() + 35); // 5 tuần sau
    
    // Các startDate khác nhau cho 5 lớp cùng course (để session hiện tại khác nhau)
    const class2StartDate = new Date(today);
    class2StartDate.setDate(today.getDate() - 7); // 1 tuần trước
    const class2EndDate = new Date(today);
    class2EndDate.setDate(today.getDate() + 21); // 3 tuần sau
    
    const class3StartDate = new Date(today); // Hôm nay
    const class3EndDate = new Date(today);
    class3EndDate.setDate(today.getDate() + 28); // 4 tuần sau
    
    const class4StartDate = new Date(today);
    class4StartDate.setDate(today.getDate() + 7); // 1 tuần sau
    const class4EndDate = new Date(today);
    class4EndDate.setDate(today.getDate() + 35); // 5 tuần sau
    
    const class5StartDate = new Date(today);
    class5StartDate.setDate(today.getDate() + 14); // 2 tuần sau
    const class5EndDate = new Date(today);
    class5EndDate.setDate(today.getDate() + 42); // 6 tuần sau
    
    const class6StartDate = new Date(today);
    class6StartDate.setDate(today.getDate() + 21); // 3 tuần sau
    const class6EndDate = new Date(today);
    class6EndDate.setDate(today.getDate() + 49); // 7 tuần sau
    
    // Select courses - try to find IELTS Foundation A1 and TOEIC Beginner A1, otherwise use first available
    const course1 = courses.find(c => c.name && c.name.includes('IELTS Foundation A1')) || courses[0];
    const course2 = courses.find(c => c.name && c.name.includes('TOEIC Beginner A1')) || (courses.length > 1 ? courses[1] : courses[0]);
    const course3 = courses.find(c => c.name && c.name.includes('IELTS Elementary A2')) || (courses.length > 2 ? courses[2] : courses[0]);
    
    // Ensure we have enough teachers and students
    if (teachers.length < 2) {
        console.log('⚠️  Cần ít nhất 2 teachers. Chỉ tìm thấy', teachers.length);
        return;
    }
    if (students.length < 10) {
        console.log('⚠️  Cần ít nhất 10 students. Chỉ tìm thấy', students.length);
        return;
    }
    if (rooms.length < 5) {
        console.log('⚠️  Cần ít nhất 5 rooms. Chỉ tìm thấy', rooms.length);
        return;
    }
    
    const classes = [
        {
            name: 'IELTS Foundation A1 - Lớp Đang Học',
            course: course1._id,
            teacher: teachers[0]._id,
            students: [students[0]._id, students[1]._id, students[2]._id],
            room: rooms[0]._id,
            startDate: activeClassStartDate,
            endDate: activeClassEndDate,
            maxStudents: 25,
            status: 'active'
        },
        {
            name: 'TOEIC Beginner A1 - Lớp Chưa Học',
            course: course2._id,
            teacher: teachers[1]._id,
            students: [students[3]._id, students[4]._id],
            room: rooms[1]._id,
            startDate: pendingClassStartDate,
            endDate: pendingClassEndDate,
            maxStudents: 20,
            status: 'pending'
        },
        {
            name: 'IELTS Elementary A2 - Lớp Có Conflict',
            course: course3._id,
            teacher: teachers[1]._id, // Teacher 2 (khác teacher để tránh conflict teacher)
            students: [
                students[0]._id, // Học viên chung với lớp đang học (sẽ bị conflict)
                students[1]._id, // Học viên chung với lớp đang học (sẽ bị conflict)
                students[3]._id  // Học viên mới
            ],
            room: rooms[2]._id, // Phòng khác để tránh conflict room
            startDate: activeClassStartDate, // Cùng thời gian với lớp đang học
            endDate: activeClassEndDate,
            maxStudents: 25,
            status: 'active'
        },
        // 5 lớp mới cùng course với "IELTS Foundation A1 - Lớp Đang Học"
        {
            name: 'IELTS Foundation A1 - Lớp 2',
            course: course1._id, // IELTS Foundation A1 - Nghe (cùng course)
            teacher: teachers[0]._id, // Teacher 1
            students: [students[5]._id, students[6]._id, students[7]._id, students[8]._id],
            room: rooms[1]._id, // Phòng 201
            startDate: class2StartDate, // 1 tuần trước
            endDate: class2EndDate,
            maxStudents: 25,
            status: 'active'
        },
        {
            name: 'IELTS Foundation A1 - Lớp 3',
            course: course1._id, // IELTS Foundation A1 - Nghe (cùng course)
            teacher: teachers[1]._id, // Teacher 2
            students: [students[9]._id, students[Math.min(10, students.length - 1)]._id, students[Math.min(11, students.length - 1)]._id, students[Math.min(12, students.length - 1)]._id],
            room: rooms[2]._id, // Phòng 301
            startDate: class3StartDate, // Hôm nay
            endDate: class3EndDate,
            maxStudents: 25,
            status: 'active'
        },
        {
            name: 'IELTS Foundation A1 - Lớp 4',
            course: course1._id, // IELTS Foundation A1 - Nghe (cùng course)
            teacher: teachers[0]._id, // Teacher 1
            students: [students[Math.min(13, students.length - 1)]._id, students[Math.min(14, students.length - 1)]._id, students[Math.min(15, students.length - 1)]._id, students[Math.min(16, students.length - 1)]._id],
            room: rooms[Math.min(3, rooms.length - 1)]._id, // Phòng Lab 401
            startDate: class4StartDate, // 1 tuần sau
            endDate: class4EndDate,
            maxStudents: 25,
            status: 'pending'
        },
        {
            name: 'IELTS Foundation A1 - Lớp 5',
            course: course1._id, // IELTS Foundation A1 - Nghe (cùng course)
            teacher: teachers[1]._id, // Teacher 2
            students: [students[Math.min(17, students.length - 1)]._id, students[Math.min(18, students.length - 1)]._id, students[Math.min(19, students.length - 1)]._id, students[Math.min(20, students.length - 1)]._id],
            room: rooms[Math.min(4, rooms.length - 1)]._id, // Phòng 501
            startDate: class5StartDate, // 2 tuần sau
            endDate: class5EndDate,
            maxStudents: 25,
            status: 'pending'
        },
        {
            name: 'IELTS Foundation A1 - Lớp 6',
            course: course1._id, // IELTS Foundation A1 - Nghe (cùng course)
            teacher: teachers[0]._id, // Teacher 1
            students: [students[5]._id, students[6]._id], // Dùng lại một số students (không conflict vì lịch khác)
            room: rooms[0]._id, // Phòng 101 (có thể dùng lại nếu lịch khác)
            startDate: class6StartDate, // 3 tuần sau
            endDate: class6EndDate,
            maxStudents: 25,
            status: 'pending'
        }
    ];
    
    const created = await Class.insertMany(classes);
    seedData.classes = created;
    console.log(`✅ Created ${created.length} classes`);
    console.log(`   - Lớp đang học: ${classes[0].name} (${activeClassStartDate.toISOString().split('T')[0]} - ${activeClassEndDate.toISOString().split('T')[0]})`);
    console.log(`   - Lớp chưa học: ${classes[1].name} (${pendingClassStartDate.toISOString().split('T')[0]} - ${pendingClassEndDate.toISOString().split('T')[0]})`);
    console.log(`   - Lớp có conflict: ${classes[2].name} (${activeClassStartDate.toISOString().split('T')[0]} - ${activeClassEndDate.toISOString().split('T')[0]})`);
    console.log(`     ⚠️ Lớp này có học viên chung với lớp đang học và sẽ có lịch trùng thời gian`);
    console.log(`   - 5 lớp cùng course IELTS Foundation A1 - Nghe:`);
    console.log(`     • ${classes[3].name} (${class2StartDate.toISOString().split('T')[0]} - ${class2EndDate.toISOString().split('T')[0]})`);
    console.log(`     • ${classes[4].name} (${class3StartDate.toISOString().split('T')[0]} - ${class3EndDate.toISOString().split('T')[0]})`);
    console.log(`     • ${classes[5].name} (${class4StartDate.toISOString().split('T')[0]} - ${class4EndDate.toISOString().split('T')[0]})`);
    console.log(`     • ${classes[6].name} (${class5StartDate.toISOString().split('T')[0]} - ${class5EndDate.toISOString().split('T')[0]})`);
    console.log(`     • ${classes[7].name} (${class6StartDate.toISOString().split('T')[0]} - ${class6EndDate.toISOString().split('T')[0]})\n`);
}

async function seedClassSchedules() {
    console.log('📝 Seeding Class Schedules...');
    const classSchedules = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for date comparison
    
    // Query existing data from database
    const classes = await Class.find().lean();
    const coursesFromDB = await Course.find().populate('sessions').lean();
    
    // Find Academic Staff role and get a user with that role for createdBy
    const academicStaffRole = await Role.findOne({ name: 'Academic Staff' });
    let academicStaffUser = null;
    if (academicStaffRole) {
        const academicStaffUsers = await User.find({ roleId: academicStaffRole._id }).limit(1).lean();
        if (academicStaffUsers.length > 0) {
            academicStaffUser = academicStaffUsers[0];
        }
    }
    
    if (classes.length === 0) {
        console.log('⚠️  Không tìm thấy classes trong database. Vui lòng seed classes trước.');
        return;
    }
    
    if (!academicStaffUser) {
        console.log('⚠️  Không tìm thấy Academic Staff user. Sẽ sử dụng teacher của lớp làm createdBy.');
    }
    
    // Các pattern lịch học mẫu (mỗi lớp có thể chọn pattern khác nhau)
    // dayOfWeek: 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
    const schedulePatterns = [
        // Pattern 1: Thứ 2, Thứ 3 (2 buổi/tuần) - Dùng cho lớp đang học
        [
            { dayOfWeek: 1, startTime: '08:00', endTime: '10:00' }, // Thứ 2
            { dayOfWeek: 2, startTime: '10:00', endTime: '12:00' }  // Thứ 3
        ],
        // Pattern 2: Thứ 2, Thứ 3, Thứ 5 (3 buổi/tuần)
        [
            { dayOfWeek: 1, startTime: '08:00', endTime: '10:00' }, // Thứ 2
            { dayOfWeek: 2, startTime: '10:00', endTime: '12:00' }, // Thứ 3
            { dayOfWeek: 4, startTime: '14:00', endTime: '16:00' }  // Thứ 5
        ],
        // Pattern 3: Thứ 2, Thứ 3, Thứ 6 (3 buổi/tuần)
        [
            { dayOfWeek: 1, startTime: '08:00', endTime: '10:00' }, // Thứ 2
            { dayOfWeek: 2, startTime: '10:00', endTime: '12:00' }, // Thứ 3
            { dayOfWeek: 5, startTime: '18:00', endTime: '20:00' }  // Thứ 6
        ],
        // Pattern 4: Thứ 2, Thứ 3, Thứ 4 (3 buổi/tuần)
        [
            { dayOfWeek: 1, startTime: '08:00', endTime: '10:00' }, // Thứ 2
            { dayOfWeek: 2, startTime: '10:00', endTime: '12:00' }, // Thứ 3
            { dayOfWeek: 3, startTime: '14:00', endTime: '16:00' }  // Thứ 4
        ],
        // Pattern 5: Thứ 5, Thứ 6 (2 buổi/tuần) - Dùng cho lớp conflict để test khi đổi lịch
        // Lớp conflict sẽ dùng pattern này để có lịch Thứ 5, Thứ 6 (khác với lớp đang học Thứ 2, Thứ 3)
        [
            { dayOfWeek: 4, startTime: '08:00', endTime: '10:00' }, // Thứ 5 - Lịch conflict
            { dayOfWeek: 5, startTime: '10:00', endTime: '12:00' }  // Thứ 6 - Lịch conflict
        ],
        // Pattern 6: Thứ 4, Thứ 5 (2 buổi/tuần) - Cho lớp 2
        [
            { dayOfWeek: 3, startTime: '14:00', endTime: '16:00' }, // Thứ 4
            { dayOfWeek: 4, startTime: '14:00', endTime: '16:00' }  // Thứ 5
        ],
        // Pattern 7: Thứ 5, Thứ 6 (2 buổi/tuần) - Cho lớp 3
        [
            { dayOfWeek: 4, startTime: '18:00', endTime: '20:00' }, // Thứ 5
            { dayOfWeek: 5, startTime: '18:00', endTime: '20:00' }  // Thứ 6
        ],
        // Pattern 8: Thứ 6, Thứ 7 (2 buổi/tuần) - Cho lớp 4
        [
            { dayOfWeek: 5, startTime: '08:00', endTime: '10:00' }, // Thứ 6
            { dayOfWeek: 6, startTime: '10:00', endTime: '12:00' }  // Thứ 7
        ],
        // Pattern 9: Thứ 3, Thứ 5, Chủ nhật (3 buổi/tuần) - Cho lớp 5
        [
            { dayOfWeek: 2, startTime: '14:00', endTime: '16:00' }, // Thứ 3
            { dayOfWeek: 4, startTime: '16:00', endTime: '18:00' }, // Thứ 5
            { dayOfWeek: 0, startTime: '08:00', endTime: '10:00' }  // Chủ nhật
        ],
        // Pattern 10: Thứ 2, Thứ 4, Thứ 6 (3 buổi/tuần) - Cho lớp 6
        [
            { dayOfWeek: 1, startTime: '14:00', endTime: '16:00' }, // Thứ 2
            { dayOfWeek: 3, startTime: '16:00', endTime: '18:00' }, // Thứ 4
            { dayOfWeek: 5, startTime: '14:00', endTime: '16:00' }  // Thứ 6
        ]
    ];
    
    for (let classIndex = 0; classIndex < classes.length; classIndex++) {
        const classItem = classes[classIndex];
        console.log(`  📚 Creating schedules for class: ${classItem.name}`);
        
        // Tìm course từ database (có sessions đã được update)
        const course = coursesFromDB.find(c => c._id.toString() === classItem.course.toString());
        if (!course) {
            console.log(`    ⚠️ Course not found for class ${classItem.name}`);
            continue;
        }
        
        // Lấy sessions từ course (đã populate)
        const courseSessions = course.sessions || [];
        if (!Array.isArray(courseSessions) || courseSessions.length === 0) {
            console.log(`    ⚠️ Course ${course.name} has no sessions`);
            continue;
        }
        
        // Query sessions from database if course.sessions is just IDs
        let sessions = [];
        if (courseSessions.length > 0 && typeof courseSessions[0] === 'object' && courseSessions[0]._id) {
            // Already populated
            sessions = courseSessions;
        } else {
            // Need to query sessions
            sessions = await Session.find({ _id: { $in: courseSessions } }).sort({ order: 1 }).lean();
        }
        
        if (sessions.length === 0) {
            console.log(`    ⚠️ No sessions found for course ${course.name}`);
            continue;
        }
        
        // Lấy số buổi học từ course.numberOfSessions
        const numberOfSessions = course.numberOfSessions || sessions.length;
        
        // Chọn pattern lịch cho lớp này (mỗi lớp có thể khác nhau)
        // Lớp conflict (index 2) sẽ dùng pattern 5 (index 4, trùng với pattern 0) để tạo conflict
        let selectedPattern;
        if (classIndex === 2) {
            // Lớp conflict: dùng pattern 5 (index 4, trùng thời gian với pattern 0 - lớp đang học)
            selectedPattern = schedulePatterns[4];
        } else if (classIndex === 0) {
            // Lớp 0 (IELTS Foundation A1 - Lớp Đang Học): Pattern 0 (Thứ 2, Thứ 3)
            selectedPattern = schedulePatterns[0];
        } else if (classIndex === 3) {
            // Lớp 3 (IELTS Foundation A1 - Lớp 2): Pattern 6 (Thứ 4, Thứ 5)
            selectedPattern = schedulePatterns[6];
        } else if (classIndex === 4) {
            // Lớp 4 (IELTS Foundation A1 - Lớp 3): Pattern 7 (Thứ 5, Thứ 6)
            selectedPattern = schedulePatterns[7];
        } else if (classIndex === 5) {
            // Lớp 5 (IELTS Foundation A1 - Lớp 4): Pattern 8 (Thứ 6, Thứ 7)
            selectedPattern = schedulePatterns[8];
        } else if (classIndex === 6) {
            // Lớp 6 (IELTS Foundation A1 - Lớp 5): Pattern 9 (Thứ 3, Thứ 5, Chủ nhật)
            selectedPattern = schedulePatterns[9];
        } else if (classIndex === 7) {
            // Lớp 7 (IELTS Foundation A1 - Lớp 6): Pattern 10 (Thứ 2, Thứ 4, Thứ 6)
            selectedPattern = schedulePatterns[10];
        } else {
            // Các lớp khác: dùng pattern theo index
            const fallbackIndex = classIndex % schedulePatterns.length;
            selectedPattern = schedulePatterns[fallbackIndex];
        }
        
        // Kiểm tra selectedPattern có tồn tại không
        if (!selectedPattern || !Array.isArray(selectedPattern) || selectedPattern.length === 0) {
            console.log(`    ❌ ERROR: No valid pattern found for class ${classItem.name} (index ${classIndex})`);
            console.log(`    Available patterns: ${schedulePatterns.length}, trying to access pattern at index ${classIndex}`);
            console.log(`    schedulePatterns[10] exists: ${schedulePatterns[10] !== undefined}`);
            continue;
        }
        
        // Tính toán số buổi/tuần từ pattern
        const sessionsPerWeek = selectedPattern.length;
        
        console.log(`    📅 Pattern: ${sessionsPerWeek} buổi/tuần (${selectedPattern.map(p => `Thứ ${p.dayOfWeek === 1 ? '2' : p.dayOfWeek === 2 ? '3' : p.dayOfWeek === 3 ? '4' : p.dayOfWeek === 4 ? '5' : p.dayOfWeek === 5 ? '6' : '7'}`).join(', ')})`);
        console.log(`    📚 Course has ${numberOfSessions} sessions, creating ${numberOfSessions} class schedules`);
        
        // Tính ngày bắt đầu và kết thúc
        const startDate = new Date(classItem.startDate);
        let endDate = new Date(classItem.endDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        
        // Tính toán số tuần cần thiết dựa trên numberOfSessions và sessionsPerWeek
        const weeksNeeded = Math.ceil(numberOfSessions / sessionsPerWeek);
        
        // Tính endDate mới dựa trên số tuần cần thiết (đảm bảo đủ chỗ cho tất cả buổi học)
        const calculatedEndDate = new Date(startDate);
        calculatedEndDate.setDate(startDate.getDate() + (weeksNeeded * 7) + 6); // +6 để đảm bảo có đủ tuần
        
        // Sử dụng endDate lớn hơn (giữa endDate gốc và calculatedEndDate)
        if (calculatedEndDate > endDate) {
            console.log(`    ⚠️ endDate gốc (${endDate.toISOString().split('T')[0]}) không đủ cho ${numberOfSessions} buổi học`);
            console.log(`    📅 Tự động mở rộng endDate đến ${calculatedEndDate.toISOString().split('T')[0]} để đủ ${weeksNeeded} tuần`);
            endDate = calculatedEndDate;
        }
        
        // Tìm ngày đầu tiên của pattern (tìm ngày đầu tiên trong pattern từ startDate hoặc sau đó)
        // Lấy tất cả các dayOfWeek trong pattern và sắp xếp
        const patternDays = selectedPattern.map(p => p.dayOfWeek).sort((a, b) => a - b);
        const firstPatternDay = patternDays[0]; // Ngày đầu tiên trong pattern
        
        // Tìm ngày đầu tiên của pattern từ startDate
        const firstPatternDate = new Date(startDate);
        const currentDayOfWeek = firstPatternDate.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ...
        
        // Tìm ngày đầu tiên trong pattern từ startDate hoặc sau đó
        let daysToAdd = 0;
        let foundInCurrentWeek = false;
        
        // Kiểm tra xem có ngày nào trong pattern trong tuần hiện tại (từ startDate trở đi) không
        for (const patternDay of patternDays) {
            if (patternDay >= currentDayOfWeek) {
                // Tìm thấy ngày trong pattern từ startDate trở đi trong tuần này
                daysToAdd = patternDay - currentDayOfWeek;
                foundInCurrentWeek = true;
                break;
            }
        }
        
        if (!foundInCurrentWeek) {
            // Không tìm thấy ngày nào trong pattern từ startDate trở đi trong tuần này
            // Tìm ngày đầu tiên của pattern trong tuần sau
            daysToAdd = 7 - currentDayOfWeek + firstPatternDay;
        }
        
        firstPatternDate.setDate(firstPatternDate.getDate() + daysToAdd);
        
        // Tính firstMonday (Thứ 2) của tuần chứa firstPatternDate
        // Thứ 2 = dayOfWeek 1
        const firstMonday = new Date(firstPatternDate);
        const firstPatternDayOfWeek = firstMonday.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ...
        
        // Tính số ngày cần lùi lại để về Thứ 2 của tuần đó
        // Trong JavaScript: 0 = Chủ nhật, 1 = Thứ 2, 2 = Thứ 3, ..., 6 = Thứ 7
        // Để từ bất kỳ ngày nào về Thứ 2 của tuần đó:
        // - Nếu là Chủ nhật (0): lùi 6 ngày về Thứ 2 tuần trước (nhưng ta muốn Thứ 2 tuần này, nên +1)
        // - Nếu là Thứ 2 (1): không cần lùi (0)
        // - Nếu là Thứ 3 (2): lùi 1 ngày về Thứ 2
        // - ...
        // - Nếu là Thứ 7 (6): lùi 5 ngày về Thứ 2
        let daysToMonday = 0;
        if (firstPatternDayOfWeek === 0) {
            // Chủ nhật: Thứ 2 tuần này = Chủ nhật + 1 (nhưng đây là Thứ 2 tuần sau)
            // Thực ra, trong tuần, Chủ nhật là ngày cuối, nên Thứ 2 của tuần đó là 6 ngày trước
            daysToMonday = -6;
        } else {
            // Thứ 2 trở đi: lùi (dayOfWeek - 1) ngày
            daysToMonday = -(firstPatternDayOfWeek - 1);
        }
        
        firstMonday.setDate(firstMonday.getDate() + daysToMonday);
        
        // Tạo lịch học - Tạo tất cả schedules trước, sau đó sắp xếp theo ngày và gán session
        const tempSchedules = []; // Tạm thời lưu schedules chưa gán session
        let scheduleCount = 0;
        let currentWeek = 0;
        
        while (scheduleCount < numberOfSessions) {
            // Tạo lịch cho mỗi buổi trong pattern của tuần hiện tại
            for (const patternItem of selectedPattern) {
                if (scheduleCount >= numberOfSessions) break;
                
                // Tính ngày cụ thể: Thứ X của tuần hiện tại
                const scheduleDate = new Date(firstMonday);
                scheduleDate.setDate(firstMonday.getDate() + (currentWeek * 7) + (patternItem.dayOfWeek - 1));
                
                // Kiểm tra nếu vượt quá endDate thì dừng (nhưng đã tính toán endDate đủ rộng)
                if (scheduleDate > endDate) {
                    console.log(`    ⚠️ Reached endDate, stopping schedule creation (đã tạo ${scheduleCount}/${numberOfSessions} buổi)`);
                    break;
                }
                
                // Kiểm tra nếu trước startDate thì bỏ qua
                if (scheduleDate < startDate) {
                    continue;
                }
                
                // Tạo schedule tạm thời (chưa gán session)
                // Use academicStaffUser if available, otherwise use class teacher
                const createdByUser = academicStaffUser ? academicStaffUser._id : classItem.teacher;
                tempSchedules.push({
                    class: classItem._id,
                    date: new Date(scheduleDate), // Tạo copy để tránh reference issue
                    startTime: patternItem.startTime,
                    endTime: patternItem.endTime,
                    room: classItem.room,
                    teacher: classItem.teacher,
                    createdBy: createdByUser,
                    status: 'fixed'
                });
                
                scheduleCount++;
            }
            
            currentWeek++;
            
            // Nếu đã vượt quá endDate, dừng lại
            const nextWeekStart = new Date(firstMonday);
            nextWeekStart.setDate(firstMonday.getDate() + (currentWeek * 7));
            if (nextWeekStart > endDate) {
                break;
            }
        }
        
        // Sắp xếp schedules theo ngày và giờ (đảm bảo thứ tự đúng)
        tempSchedules.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA.getTime() !== dateB.getTime()) {
                return dateA - dateB;
            }
            // Nếu cùng ngày, sắp xếp theo startTime
            return (a.startTime || '').localeCompare(b.startTime || '');
        });
        
        // Gán session theo thứ tự đã sắp xếp
        for (let i = 0; i < tempSchedules.length; i++) {
            const session = sessions[i % sessions.length];
            classSchedules.push({
                ...tempSchedules[i],
                session: session._id
            });
        }
        
        // Cảnh báo nếu không tạo đủ số buổi
        if (scheduleCount < numberOfSessions) {
            console.log(`    ⚠️ CẢNH BÁO: Chỉ tạo được ${scheduleCount}/${numberOfSessions} buổi học do giới hạn thời gian`);
        }
        
        // Log thống kê về schedules (quá khứ/tương lai)
        const pastSchedules = classSchedules.filter(s => {
            const scheduleDate = new Date(s.date);
            scheduleDate.setHours(0, 0, 0, 0);
            return scheduleDate < today && s.class.toString() === classItem._id.toString();
        }).length;
        const futureSchedules = classSchedules.filter(s => {
            const scheduleDate = new Date(s.date);
            scheduleDate.setHours(0, 0, 0, 0);
            return scheduleDate >= today && s.class.toString() === classItem._id.toString();
        }).length;
        
        console.log(`    ✅ Created ${scheduleCount} schedules for class ${classItem.name}`);
        console.log(`       - Schedules quá khứ: ${pastSchedules}, Schedules tương lai: ${futureSchedules}`);
    }
    
    if (classSchedules.length === 0) {
        console.log('⚠️ No class schedules to create!');
        return;
    }
    
    const created = await ClassSchedule.insertMany(classSchedules);
    console.log(`✅ Created ${created.length} class schedules total\n`);
}

async function seedStudentSchedules() {
    console.log('📝 Seeding Student Schedules...');
    const studentSchedules = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Query existing data from database
    const classSchedules = await ClassSchedule.find().lean();
    const classes = await Class.find().lean();
    
    if (classSchedules.length === 0) {
        console.log('⚠️  Không tìm thấy class schedules trong database. Vui lòng seed class schedules trước.');
        return;
    }
    
    if (classes.length === 0) {
        console.log('⚠️  Không tìm thấy classes trong database. Vui lòng seed classes trước.');
        return;
    }
    
    // Tạo student schedules cho TẤT CẢ ClassSchedules
    for (const classSchedule of classSchedules) {
        const classItem = classes.find(c => 
            c._id.toString() === classSchedule.class.toString()
        );
        if (!classItem) {
            console.log(`    ⚠️ Class not found for classSchedule ${classSchedule._id}`);
            continue;
        }
        
        // Tạo StudentSchedule cho tất cả học viên trong lớp
        for (const studentId of classItem.students) {
            // Xác định attendance status dựa trên ngày của schedule
            const scheduleDate = new Date(classSchedule.date);
            scheduleDate.setHours(0, 0, 0, 0);
            const isPastSchedule = scheduleDate < today;
            
            // Tạo StudentSchedule object
            const studentScheduleData = {
                student: studentId,
                classSchedule: classSchedule._id,
                // Không set attendance cho schedules tương lai (để null cho đến khi điểm danh)
            };
            
            // Chỉ set attendance cho schedules quá khứ (để có dữ liệu test)
            if (isPastSchedule) {
                // 70% present, 20% absent, 10% late để có dữ liệu đa dạng
                const rand = Math.random();
                let attendanceStatus;
                if (rand < 0.7) {
                    attendanceStatus = 'present';
                } else if (rand < 0.9) {
                    attendanceStatus = 'absent';
                } else {
                    attendanceStatus = 'late';
                }
                
                const scheduleDateObj = new Date(classSchedule.date);
                studentScheduleData.attendance = {
                    status: attendanceStatus,
                    checkInTime: attendanceStatus === 'present' || attendanceStatus === 'late' 
                        ? new Date(scheduleDateObj.getTime() + (attendanceStatus === 'late' ? 15 * 60000 : 0)) // Late: thêm 15 phút
                        : null,
                    markedBy: classItem.teacher
                };
            }
            // Nếu là schedule tương lai, không set attendance (để null)
            
            studentSchedules.push(studentScheduleData);
        }
    }
    
    if (studentSchedules.length === 0) {
        console.log('⚠️  No student schedules to create!');
        return;
    }
    
    const created = await StudentSchedule.insertMany(studentSchedules);
    console.log(`✅ Created ${created.length} student schedules for ${classSchedules.length} class schedules\n`);
}


async function seed() {
    try {
        console.log('🚀 Starting seed for Class, ClassSchedule, StudentSchedule...\n');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB\n');

        // Clear existing data for class tables only
        await clearDatabase();

        // Seed only class-related tables (using existing data from database)
        await seedClasses();
        await seedClassSchedules();
        await seedStudentSchedules();

        console.log('\n✨ Seed completed successfully!');
        console.log('\n📊 Summary:');
        
        // Query counts from database
        const classCount = await Class.countDocuments();
        const classScheduleCount = await ClassSchedule.countDocuments();
        const studentScheduleCount = await StudentSchedule.countDocuments();
        
        console.log(`  - Classes: ${classCount}`);
        console.log(`  - Class Schedules: ${classScheduleCount}`);
        console.log(`  - Student Schedules: ${studentScheduleCount}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding system:', error);
        process.exit(1);
    }
}

// Run seed
seed();

