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
const ChangeRequest = require('../models/changeRequestModel');

// Store created classes for reference
const seedData = {
    classes: []
};

async function clearDatabase() {
    console.log('\n🗑️  Clearing existing data for Class, ClassSchedule, StudentSchedule, ChangeRequest...');
    await StudentSchedule.deleteMany({});
    await ClassSchedule.deleteMany({});
    await Class.deleteMany({});
    await ChangeRequest.deleteMany({});
    console.log('✅ Cleared Class, ClassSchedule, StudentSchedule, and ChangeRequest tables\n');
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

async function seedChangeRequests() {
    console.log('📝 Seeding Change Requests...');
    const changeRequests = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Query existing data from database
    const classes = await Class.find().lean();
    const classSchedules = await ClassSchedule.find().lean();
    const studentSchedules = await StudentSchedule.find().lean();
    
    // Find roles
    const teacherRole = await Role.findOne({ name: 'Teacher' });
    const studentRole = await Role.findOne({ name: 'Student' });
    const academicStaffRole = await Role.findOne({ name: 'Academic Staff' });
    const centerHeadRole = await Role.findOne({ name: 'Center Head' });
    
    if (!teacherRole || !studentRole) {
        console.log('⚠️  Không tìm thấy Teacher hoặc Student role. Vui lòng seed roles trước.');
        return;
    }
    
    // Query users by role
    const teachers = await User.find({ roleId: teacherRole._id }).lean();
    const students = await User.find({ roleId: studentRole._id }).lean();
    let academicStaffUsers = [];
    if (academicStaffRole) {
        academicStaffUsers = await User.find({ roleId: academicStaffRole._id }).lean();
    }
    let centerHeadUsers = [];
    if (centerHeadRole) {
        centerHeadUsers = await User.find({ roleId: centerHeadRole._id }).lean();
    }
    
    // Validate data exists
    if (classes.length === 0) {
        console.log('⚠️  Không tìm thấy classes trong database. Vui lòng seed classes trước.');
        return;
    }
    if (classSchedules.length === 0) {
        console.log('⚠️  Không tìm thấy class schedules trong database. Vui lòng seed class schedules trước.');
        return;
    }
    if (studentSchedules.length === 0) {
        console.log('⚠️  Không tìm thấy student schedules trong database. Vui lòng seed student schedules trước.');
        return;
    }
    if (teachers.length === 0) {
        console.log('⚠️  Không tìm thấy teachers trong database.');
        return;
    }
    if (students.length === 0) {
        console.log('⚠️  Không tìm thấy students trong database.');
        return;
    }
    
    // Get Academic Staff user for approver (if available)
    const approver = academicStaffUsers.length > 0 ? academicStaffUsers[0] : null;
    
    // Filter FUTURE student schedules for makeup_class
    // Chỉ lấy các buổi học TƯƠNG LAI (chưa diễn ra, chưa có attendance)
    // Các buổi học quá khứ đã bị đánh vắng mặt rồi, không thể xin học bù
    const futureStudentSchedules = studentSchedules.filter(ss => {
        const classSchedule = classSchedules.find(cs => cs._id.toString() === ss.classSchedule.toString());
        if (!classSchedule) return false;
        const scheduleDate = new Date(classSchedule.date);
        scheduleDate.setHours(0, 0, 0, 0);
        // Chỉ lấy các buổi học TƯƠNG LAI (scheduleDate >= today)
        // Các buổi học này chưa diễn ra, chưa có attendance, nên có thể xin học bù
        return scheduleDate >= today;
    });
    
    console.log(`   - Found ${classes.length} classes, ${classSchedules.length} class schedules, ${futureStudentSchedules.length} future student schedules`);
    console.log(`   - Found ${teachers.length} teachers, ${students.length} students, ${academicStaffUsers.length} academic staff, ${centerHeadUsers.length} center heads`);
    
    // Helper function to generate approved date (1-7 days ago)
    const getApprovedDate = (daysAgo) => {
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);
        date.setHours(14, 0, 0, 0); // Set to 2 PM
        return date;
    };
    
    // ============================================
    // 1. CREATE_CLASS requests (20-25 requests)
    // ============================================
    const createClassContents = [
        'Yêu cầu tạo lớp mới IELTS Foundation A1 với 20 học viên, học vào Thứ 2 và Thứ 4 hàng tuần từ 18:00-20:00',
        'Đề nghị mở lớp TOEIC Intermediate B1, thời gian học Thứ 3, Thứ 5, Thứ 7 từ 14:00-16:00, số lượng học viên tối đa 25',
        'Xin phép tạo lớp IELTS Advanced C1, lịch học Thứ 2, Thứ 4, Thứ 6 từ 08:00-10:00, dự kiến 15 học viên',
        'Yêu cầu mở lớp TOEIC Advanced B2, học vào Thứ 2, Thứ 4, Thứ 6 từ 19:00-21:00, tối đa 20 học viên',
        'Đề nghị tạo lớp IELTS Intermediate B1, lịch học Thứ 3, Thứ 5 từ 09:00-11:00, dự kiến 18 học viên',
        'Xin phép mở lớp Business English C1, học Thứ 2, Thứ 3, Thứ 5, Thứ 6 từ 17:00-19:00, tối đa 22 học viên',
        'Yêu cầu tạo lớp Conversation English A2, lịch học Thứ 4, Thứ 7 từ 10:00-12:00, dự kiến 16 học viên',
        'Đề nghị mở lớp IELTS Foundation A2, học Thứ 2, Thứ 4 từ 14:00-16:00, số lượng học viên tối đa 20',
        'Xin phép tạo lớp TOEIC Foundation A1, lịch học Thứ 3, Thứ 5, Thứ 7 từ 18:00-20:00, dự kiến 22 học viên',
        'Yêu cầu mở lớp IELTS Upper Intermediate B2, học vào Thứ 2, Thứ 4, Thứ 6 từ 08:30-10:30, tối đa 18 học viên',
        'Đề nghị tạo lớp TOEIC Intermediate B2, lịch học Thứ 3, Thứ 5 từ 15:00-17:00, dự kiến 20 học viên',
        'Xin phép mở lớp Academic Writing B2, học Thứ 2, Thứ 4 từ 19:00-21:00, tối đa 15 học viên',
        'Yêu cầu tạo lớp Speaking Practice A2, lịch học Thứ 5, Thứ 7 từ 09:00-11:00, dự kiến 16 học viên',
        'Đề nghị mở lớp Listening Skills B1, học Thứ 2, Thứ 3, Thứ 5 từ 14:00-16:00, số lượng học viên tối đa 24',
        'Xin phép tạo lớp Reading Comprehension B2, lịch học Thứ 4, Thứ 6 từ 17:00-19:00, dự kiến 18 học viên',
        'Yêu cầu mở lớp Grammar Advanced C1, học vào Thứ 2, Thứ 4, Thứ 6 từ 08:00-10:00, tối đa 20 học viên',
        'Đề nghị tạo lớp Vocabulary Building B1, lịch học Thứ 3, Thứ 5 từ 10:00-12:00, dự kiến 22 học viên',
        'Xin phép mở lớp Pronunciation Practice A2, học Thứ 6, Chủ nhật từ 14:00-16:00, tối đa 16 học viên',
        'Yêu cầu tạo lớp Exam Preparation IELTS, lịch học Thứ 2, Thứ 4, Thứ 6 từ 18:00-20:00, dự kiến 20 học viên',
        'Đề nghị mở lớp Exam Preparation TOEIC, học Thứ 3, Thứ 5, Thứ 7 từ 15:00-17:00, số lượng học viên tối đa 25',
        'Xin phép tạo lớp Kids English A1, lịch học Thứ 7, Chủ nhật từ 09:00-11:00, dự kiến 15 học viên',
        'Yêu cầu mở lớp Teen English B1, học Thứ 2, Thứ 4 từ 17:00-19:00, tối đa 20 học viên',
        'Đề nghị tạo lớp Professional English B2, lịch học Thứ 3, Thứ 5 từ 18:30-20:30, dự kiến 18 học viên',
        'Xin phép mở lớp Medical English C1, học Thứ 2, Thứ 4, Thứ 6 từ 19:00-21:00, tối đa 12 học viên',
        'Yêu cầu tạo lớp Legal English C1, lịch học Thứ 3, Thứ 5 từ 14:00-16:00, dự kiến 14 học viên'
    ];
    
    // Chỉ cho phép Center Head gửi yêu cầu tạo lớp
    const createClassSenders = [];
    if (centerHeadUsers.length === 0) {
        console.log('⚠️  Không tìm thấy Center Head users. Không thể tạo CREATE_CLASS requests.');
    } else {
        // Chỉ lấy Center Head users làm senders
        for (let i = 0; i < centerHeadUsers.length; i++) {
            createClassSenders.push(centerHeadUsers[i % centerHeadUsers.length]);
        }
        // Nếu cần nhiều requests hơn số Center Head, cycle through
        const neededSenders = Math.min(25, createClassContents.length);
        while (createClassSenders.length < neededSenders && centerHeadUsers.length > 0) {
            createClassSenders.push(centerHeadUsers[createClassSenders.length % centerHeadUsers.length]);
        }
    }
    
    const createClassCount = Math.min(25, createClassSenders.length, createClassContents.length);
    for (let i = 0; i < createClassCount; i++) {
        const sender = createClassSenders[i % createClassSenders.length];
        let status = 'pending';
        let approverId = null;
        let approvedDate = null;
        let responseContent = null;
        
        // Distribute status: ~30% rejected, ~70% pending (no approved)
        // Reject approximately every 3rd request (indices 2, 5, 8, 11, 14, 17, 20, 23)
        if (approver && (i % 3 === 2 || i === 5 || i === 8 || i === 11 || i === 14 || i === 17 || i === 20 || i === 23)) {
            status = 'rejected';
            approverId = approver._id;
            approvedDate = getApprovedDate(Math.floor(Math.random() * 7) + 1); // 1-7 days ago
            const rejectionReasons = [
                'Đơn bị từ chối do không đủ số lượng học viên đăng ký tối thiểu.',
                'Đơn bị từ chối do không có phòng học phù hợp trong thời gian yêu cầu.',
                'Đơn bị từ chối do không có giáo viên phù hợp trong thời gian yêu cầu.',
                'Đơn bị từ chối do lịch học trùng với các lớp hiện có.',
                'Đơn bị từ chối do không đủ điều kiện mở lớp mới tại thời điểm này.'
            ];
            responseContent = rejectionReasons[Math.floor(Math.random() * rejectionReasons.length)];
        }
        // Rest are pending
        
        changeRequests.push({
            sender: sender._id,
            type: 'create_class',
            excelFile: null, // No excel files for seed data
            content: createClassContents[i],
            status: status,
            approver: approverId,
            approvedDate: approvedDate,
            responseContent: responseContent
        });
    }
    
    // ============================================
    // 2. CHANGE_CLASS requests (20-25 requests)
    // ============================================
    const changeClassContents = [
        'Xin chuyển từ lớp IELTS Foundation A1 - Lớp Đang Học sang lớp IELTS Foundation A1 - Lớp 2 do lịch học phù hợp hơn',
        'Yêu cầu đổi lớp vì lịch học hiện tại trùng với công việc, muốn chuyển sang lớp có lịch học buổi tối',
        'Đề nghị chuyển lớp do không theo kịp tiến độ học, muốn chuyển sang lớp có trình độ phù hợp hơn',
        'Xin chuyển lớp vì muốn học cùng bạn bè ở lớp khác, lớp đích có lịch học tương tự',
        'Yêu cầu đổi lớp do giáo viên hiện tại không phù hợp với phong cách học của em',
        'Đề nghị chuyển lớp vì lịch học hiện tại quá sớm, muốn chuyển sang lớp học buổi chiều',
        'Xin đổi lớp do lớp hiện tại quá đông, muốn chuyển sang lớp có ít học viên hơn để được quan tâm tốt hơn',
        'Yêu cầu chuyển lớp vì muốn học với giáo viên khác có phương pháp dạy phù hợp hơn',
        'Xin chuyển lớp do lịch học hiện tại không phù hợp với lịch làm việc mới của em',
        'Đề nghị đổi lớp vì muốn học vào buổi sáng thay vì buổi tối',
        'Yêu cầu chuyển lớp do lớp hiện tại quá xa nhà, muốn chuyển sang lớp gần hơn',
        'Xin đổi lớp vì muốn học cùng nhóm bạn mới, lớp đích có trình độ tương đương',
        'Đề nghị chuyển lớp do không hài lòng với chất lượng giảng dạy của giáo viên hiện tại',
        'Yêu cầu đổi lớp vì lịch học hiện tại trùng với lịch học của con, cần điều chỉnh',
        'Xin chuyển lớp do muốn học vào cuối tuần thay vì các ngày trong tuần',
        'Đề nghị đổi lớp vì lớp hiện tại có quá nhiều học viên, khó tập trung',
        'Yêu cầu chuyển lớp do muốn học với giáo viên bản ngữ thay vì giáo viên Việt Nam',
        'Xin đổi lớp vì lịch học hiện tại không phù hợp với lịch thi của em',
        'Đề nghị chuyển lớp do muốn học lớp có tốc độ nhanh hơn, phù hợp với khả năng',
        'Yêu cầu đổi lớp vì muốn học lớp có nhiều hoạt động thực hành hơn',
        'Xin chuyển lớp do lớp hiện tại quá dễ, muốn chuyển sang lớp có trình độ cao hơn',
        'Đề nghị đổi lớp vì muốn học lớp có ít học viên hơn để được hỗ trợ tốt hơn',
        'Yêu cầu chuyển lớp do lịch học hiện tại trùng với lịch tập thể thao',
        'Xin đổi lớp vì muốn học lớp có giáo trình mới hơn, cập nhật hơn',
        'Đề nghị chuyển lớp do muốn học lớp có môi trường học tập tích cực hơn'
    ];
    
    // Tạo mapping: studentId -> [classes that student is enrolled in]
    // Chỉ lấy các học sinh đang học ít nhất 1 lớp
    const studentClassesMap = {};
    const studentsWithClasses = [];
    
    for (const student of students) {
        const studentId = student._id.toString();
        const enrolledClasses = classes.filter(classItem => {
            // Kiểm tra xem student có trong danh sách students của lớp không
            return classItem.students && classItem.students.some(s => s.toString() === studentId);
        });
        
        if (enrolledClasses.length > 0) {
            studentClassesMap[studentId] = enrolledClasses;
            studentsWithClasses.push(student);
        }
    }
    
    console.log(`   - Found ${studentsWithClasses.length} students enrolled in classes`);
    
    if (studentsWithClasses.length === 0) {
        console.log('⚠️  Không tìm thấy học sinh nào đang học lớp. Không thể tạo CHANGE_CLASS requests.');
    } else {
        // Mở rộng danh sách học sinh bằng cách lặp lại để có đủ số lượng requests
        const expandedStudentsWithClasses = [];
        for (let i = 0; i < Math.min(25, studentsWithClasses.length * 3); i++) {
            expandedStudentsWithClasses.push(studentsWithClasses[i % studentsWithClasses.length]);
        }
        
        const changeClassCount = Math.min(25, expandedStudentsWithClasses.length, changeClassContents.length);
        for (let i = 0; i < changeClassCount; i++) {
            const sender = expandedStudentsWithClasses[i % expandedStudentsWithClasses.length];
            const senderId = sender._id.toString();
            
            // Lấy danh sách lớp mà học sinh này đang học
            const enrolledClasses = studentClassesMap[senderId] || [];
            if (enrolledClasses.length === 0) {
                console.log(`    ⚠️ Student ${sender.username || sender._id} không có lớp đang học, bỏ qua`);
                continue;
            }
            
            // Chọn một lớp từ danh sách lớp mà học sinh đang học
            // Sử dụng modulo để phân bổ đều các lớp
            const classItem = enrolledClasses[i % enrolledClasses.length];
            
            let status = 'pending';
            let approverId = null;
            let approvedDate = null;
            let responseContent = null;
            
            // Distribute status: ~30% rejected, ~70% pending (no approved)
            // Reject approximately every 3rd request
            if (approver && (i % 3 === 2 || i === 5 || i === 8 || i === 11 || i === 14 || i === 17 || i === 20 || i === 23)) {
                status = 'rejected';
                approverId = approver._id;
                approvedDate = getApprovedDate(Math.floor(Math.random() * 7) + 1); // 1-7 days ago
                const rejectionReasons = [
                    'Đơn bị từ chối do lớp đích đã đầy. Vui lòng chọn lớp khác.',
                    'Đơn bị từ chối do không đủ điều kiện chuyển lớp. Vui lòng liên hệ phòng đào tạo.',
                    'Đơn bị từ chối do lớp đích không phù hợp với trình độ hiện tại của học viên.',
                    'Đơn bị từ chối do lịch học của lớp đích trùng với lịch học khác của học viên.',
                    'Đơn bị từ chối do đã quá thời hạn cho phép chuyển lớp trong học kỳ này.'
                ];
                responseContent = rejectionReasons[Math.floor(Math.random() * rejectionReasons.length)];
            }
            // Rest are pending
            
            changeRequests.push({
                sender: sender._id,
                type: 'change_class',
                classId: classItem._id,
                content: changeClassContents[i],
                status: status,
                approver: approverId,
                approvedDate: approvedDate,
                responseContent: responseContent
            });
        }
    }
    
    // ============================================
    // 3. MAKEUP_CLASS requests (20-25 requests)
    // ============================================
    const makeupClassContents = [
        'Xin học bù buổi học sắp tới do sẽ bị ốm, có giấy xác nhận của bác sĩ',
        'Yêu cầu học bù buổi học tới do có việc đột xuất trong gia đình, không thể tham gia',
        'Đề nghị học bù buổi học sắp tới do đi công tác, muốn bù vào buổi học khác trong tuần',
        'Xin học bù buổi học tới do tham gia kỳ thi quan trọng, có giấy xác nhận',
        'Yêu cầu học bù do nghỉ phép có phép, muốn bù vào buổi học cuối tuần',
        'Đề nghị học bù buổi học sắp tới do có việc gia đình quan trọng, không thể tham gia',
        'Xin học bù buổi học tới do đi khám sức khỏe, có giấy hẹn khám',
        'Yêu cầu học bù buổi học sắp tới do tham gia sự kiện gia đình quan trọng',
        'Xin học bù do nghỉ buổi học tới vì đi du lịch cùng gia đình, có giấy xác nhận',
        'Đề nghị học bù buổi học sắp tới do tham gia cuộc thi thể thao của trường',
        'Yêu cầu học bù buổi học tới do đi thăm người thân ốm ở bệnh viện',
        'Xin học bù do nghỉ buổi học tới vì tham gia hoạt động tình nguyện, có giấy xác nhận',
        'Đề nghị học bù buổi học sắp tới do tham gia kỳ thi học sinh giỏi',
        'Yêu cầu học bù buổi học tới do đi dự đám cưới người thân',
        'Xin học bù do nghỉ buổi học tới vì tham gia hội thảo học thuật, có giấy mời',
        'Đề nghị học bù buổi học sắp tới do tham gia cuộc thi ngoại ngữ',
        'Yêu cầu học bù buổi học tới do đi khám răng định kỳ',
        'Xin học bù do nghỉ buổi học tới vì tham gia hoạt động ngoại khóa của trường',
        'Đề nghị học bù buổi học sắp tới do tham gia kỳ thi chứng chỉ quốc tế',
        'Yêu cầu học bù buổi học tới do đi thăm ông bà ở quê',
        'Xin học bù do nghỉ buổi học tới vì tham gia hội thảo về du học',
        'Đề nghị học bù buổi học sắp tới do tham gia cuộc thi hùng biện tiếng Anh',
        'Yêu cầu học bù buổi học tới do đi khám mắt định kỳ',
        'Xin học bù do nghỉ buổi học tới vì tham gia hoạt động từ thiện',
        'Đề nghị học bù buổi học sắp tới do tham gia kỳ thi tốt nghiệp THPT'
    ];
    
    // Use FUTURE student schedules - đảm bảo studentSchedule thuộc về sender
    // Nhóm futureStudentSchedules theo student
    const studentSchedulesByStudent = {};
    futureStudentSchedules.forEach(ss => {
        const studentId = ss.student.toString();
        if (!studentSchedulesByStudent[studentId]) {
            studentSchedulesByStudent[studentId] = [];
        }
        studentSchedulesByStudent[studentId].push(ss);
    });
    
    // Tìm các học sinh có ít nhất 1 buổi học tương lai
    const studentsWithFutureSchedules = students.filter(s => {
        const studentId = s._id.toString();
        return studentSchedulesByStudent[studentId] && studentSchedulesByStudent[studentId].length > 0;
    });
    
    console.log(`   - Found ${studentsWithFutureSchedules.length} students with future schedules`);
    
    // Expand to use more students by cycling through
    const expandedStudentsWithFutureSchedules = [];
    for (let i = 0; i < Math.min(25, studentsWithFutureSchedules.length * 3); i++) {
        expandedStudentsWithFutureSchedules.push(studentsWithFutureSchedules[i % studentsWithFutureSchedules.length]);
    }
    
    const makeupClassCount = Math.min(25, expandedStudentsWithFutureSchedules.length, makeupClassContents.length);
    for (let i = 0; i < makeupClassCount; i++) {
        const sender = expandedStudentsWithFutureSchedules[i % expandedStudentsWithFutureSchedules.length];
        const senderId = sender._id.toString();
        
        // Lấy một studentSchedule của học sinh này (đảm bảo khớp)
        const studentSchedulesForThisStudent = studentSchedulesByStudent[senderId] || [];
        if (studentSchedulesForThisStudent.length === 0) {
            console.log(`    ⚠️ Student ${sender.username || sender._id} không có buổi học tương lai, bỏ qua`);
            continue;
        }
        
        // Lấy buổi học của học sinh này (cycle through available schedules)
        const studentSchedule = studentSchedulesForThisStudent[i % studentSchedulesForThisStudent.length];
        
        // Validation: Đảm bảo studentSchedule thực sự là FUTURE schedule (chưa diễn ra)
        const classScheduleForValidation = classSchedules.find(cs => 
            cs._id.toString() === studentSchedule.classSchedule.toString()
        );
        if (!classScheduleForValidation) {
            console.log(`    ⚠️ Không tìm thấy classSchedule cho studentSchedule ${studentSchedule._id}, bỏ qua`);
            continue;
        }
        
        const scheduleDateForValidation = new Date(classScheduleForValidation.date);
        scheduleDateForValidation.setHours(0, 0, 0, 0);
        
        // Đảm bảo buổi học là TƯƠNG LAI (chưa diễn ra, chưa có attendance)
        // Chỉ cho phép yêu cầu học bù cho các buổi học chưa diễn ra
        if (scheduleDateForValidation < today) {
            console.log(`    ⚠️ StudentSchedule ${studentSchedule._id} có ngày ${scheduleDateForValidation.toISOString().split('T')[0]} là quá khứ (cần >= ${today.toISOString().split('T')[0]}), bỏ qua`);
            continue;
        }
        
        let status = 'pending';
        let approverId = null;
        let approvedDate = null;
        let responseContent = null;
        
        // Distribute status: ~30% rejected, ~70% pending (no approved)
        // Reject approximately every 3rd request
        if (approver && (i % 3 === 2 || i === 5 || i === 8 || i === 11 || i === 14 || i === 17 || i === 20 || i === 23)) {
            status = 'rejected';
            approverId = approver._id;
            approvedDate = getApprovedDate(Math.floor(Math.random() * 7) + 1); // 1-7 days ago
            const rejectionReasons = [
                'Đơn bị từ chối do không có lịch học bù phù hợp trong thời gian yêu cầu.',
                'Đơn bị từ chối do đã quá thời hạn yêu cầu học bù (quá 2 tuần).',
                'Đơn bị từ chối do không có giấy xác nhận hợp lệ cho lý do nghỉ học.',
                'Đơn bị từ chối do số lượng buổi học bù đã vượt quá quy định của học kỳ.',
                'Đơn bị từ chối do không có giáo viên và phòng học phù hợp để sắp xếp học bù.'
            ];
            responseContent = rejectionReasons[Math.floor(Math.random() * rejectionReasons.length)];
        }
        // Rest are pending
        
        changeRequests.push({
            sender: sender._id,
            type: 'makeup_class',
            studentScheduleId: studentSchedule._id,
            content: makeupClassContents[i],
            status: status,
            approver: approverId,
            approvedDate: approvedDate,
            responseContent: responseContent
        });
    }
    
    // ============================================
    // 4. REPLACE_TEACHER requests (20-25 requests)
    // ============================================
    const replaceTeacherContents = [
        'Yêu cầu thay giáo viên cho buổi học ngày mai do giáo viên hiện tại có việc đột xuất',
        'Xin thay giáo viên cho buổi học tuần tới vì giáo viên hiện tại bị ốm',
        'Đề nghị thay giáo viên cho buổi học sắp tới do giáo viên có lịch trùng với hội thảo',
        'Yêu cầu thay giáo viên do giáo viên hiện tại có việc gia đình quan trọng',
        'Xin thay giáo viên cho buổi học cuối tuần do giáo viên có lịch đi công tác',
        'Đề nghị thay giáo viên do giáo viên hiện tại cần nghỉ phép có phép',
        'Yêu cầu thay giáo viên cho buổi học tới do giáo viên có lịch khám sức khỏe',
        'Xin thay giáo viên cho buổi học ngày mai do giáo viên có việc đột xuất trong gia đình',
        'Đề nghị thay giáo viên cho buổi học tuần tới vì giáo viên hiện tại đi công tác nước ngoài',
        'Yêu cầu thay giáo viên do giáo viên hiện tại tham gia hội thảo quốc tế',
        'Xin thay giáo viên cho buổi học sắp tới do giáo viên có lịch thi chứng chỉ',
        'Đề nghị thay giáo viên do giáo viên hiện tại cần nghỉ phép để chăm sóc người thân ốm',
        'Yêu cầu thay giáo viên cho buổi học cuối tuần do giáo viên có lịch đi du lịch đã đặt trước',
        'Xin thay giáo viên cho buổi học tới do giáo viên có lịch khám răng định kỳ',
        'Đề nghị thay giáo viên do giáo viên hiện tại tham gia khóa đào tạo nâng cao',
        'Yêu cầu thay giáo viên cho buổi học ngày mai do giáo viên có việc đột xuất tại cơ quan',
        'Xin thay giáo viên cho buổi học tuần tới vì giáo viên hiện tại đi dự đám cưới',
        'Đề nghị thay giáo viên do giáo viên hiện tại cần nghỉ phép để tham gia sự kiện gia đình',
        'Yêu cầu thay giáo viên cho buổi học sắp tới do giáo viên có lịch họp phụ huynh',
        'Xin thay giáo viên cho buổi học cuối tuần do giáo viên có lịch đi khám sức khỏe tổng quát',
        'Đề nghị thay giáo viên do giáo viên hiện tại tham gia cuộc thi giáo viên giỏi',
        'Yêu cầu thay giáo viên cho buổi học tới do giáo viên có lịch đi công tác đột xuất',
        'Xin thay giáo viên cho buổi học ngày mai do giáo viên có việc gia đình cần giải quyết gấp',
        'Đề nghị thay giáo viên do giáo viên hiện tại cần nghỉ phép để đi thăm người thân',
        'Yêu cầu thay giáo viên cho buổi học tuần tới do giáo viên có lịch trùng với kỳ thi quan trọng'
    ];
    
    // Use different class schedules and teachers/academic staff as senders
    const classSchedulesForReplace = [];
    for (let i = 0; i < Math.min(25, classSchedules.length * 3); i++) {
        classSchedulesForReplace.push(classSchedules[i % classSchedules.length]);
    }
    const replaceTeacherSenders = [];
    // Collect more senders - cycle through all available
    for (let i = 0; i < teachers.length; i++) {
        replaceTeacherSenders.push(teachers[i % teachers.length]);
    }
    for (let i = 0; i < academicStaffUsers.length; i++) {
        replaceTeacherSenders.push(academicStaffUsers[i % academicStaffUsers.length]);
    }
    
    const replaceTeacherCount = Math.min(25, classSchedulesForReplace.length, replaceTeacherSenders.length, replaceTeacherContents.length);
    for (let i = 0; i < replaceTeacherCount; i++) {
        const sender = replaceTeacherSenders[i % replaceTeacherSenders.length];
        const classSchedule = classSchedulesForReplace[i % classSchedulesForReplace.length];
        let status = 'pending';
        let approverId = null;
        let approvedDate = null;
        let responseContent = null;
        
        // Distribute status: ~30% rejected, ~70% pending (no approved)
        // Reject approximately every 3rd request
        if (approver && (i % 3 === 2 || i === 5 || i === 8 || i === 11 || i === 14 || i === 17 || i === 20 || i === 23)) {
            status = 'rejected';
            approverId = approver._id;
            approvedDate = getApprovedDate(Math.floor(Math.random() * 7) + 1); // 1-7 days ago
            const rejectionReasons = [
                'Đơn bị từ chối do không tìm được giáo viên thay thế phù hợp trong thời gian yêu cầu.',
                'Đơn bị từ chối do thời gian yêu cầu quá gấp, không đủ thời gian sắp xếp.',
                'Đơn bị từ chối do không có giáo viên thay thế có trình độ phù hợp với lớp học.',
                'Đơn bị từ chối do giáo viên thay thế không có lịch trống trong thời gian yêu cầu.',
                'Đơn bị từ chối do đã có quá nhiều yêu cầu thay giáo viên trong tuần này.'
            ];
            responseContent = rejectionReasons[Math.floor(Math.random() * rejectionReasons.length)];
        }
        // Rest are pending
        
        changeRequests.push({
            sender: sender._id,
            type: 'replace_teacher',
            classScheduleId: classSchedule._id,
            content: replaceTeacherContents[i],
            status: status,
            approver: approverId,
            approvedDate: approvedDate,
            responseContent: responseContent
        });
    }
    
    if (changeRequests.length === 0) {
        console.log('⚠️  No change requests to create!');
        return;
    }
    
    const created = await ChangeRequest.insertMany(changeRequests);
    
    // Log statistics
    const pendingCount = created.filter(cr => cr.status === 'pending').length;
    const approvedCount = created.filter(cr => cr.status === 'approved').length;
    const rejectedCount = created.filter(cr => cr.status === 'rejected').length;
    
    const createClassTypeCount = created.filter(cr => cr.type === 'create_class').length;
    const changeClassTypeCount = created.filter(cr => cr.type === 'change_class').length;
    const makeupClassTypeCount = created.filter(cr => cr.type === 'makeup_class').length;
    const replaceTeacherTypeCount = created.filter(cr => cr.type === 'replace_teacher').length;
    
    console.log(`✅ Created ${created.length} change requests`);
    console.log(`   - By type: create_class (${createClassTypeCount}), change_class (${changeClassTypeCount}), makeup_class (${makeupClassTypeCount}), replace_teacher (${replaceTeacherTypeCount})`);
    console.log(`   - By status: pending (${pendingCount}), approved (${approvedCount}), rejected (${rejectedCount})\n`);
}

async function seed() {
    try {
        console.log('🚀 Starting seed for Class, ClassSchedule, StudentSchedule, ChangeRequest...\n');
        
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
        await seedChangeRequests();

        console.log('\n✨ Seed completed successfully!');
        console.log('\n📊 Summary:');
        
        // Query counts from database
        const classCount = await Class.countDocuments();
        const classScheduleCount = await ClassSchedule.countDocuments();
        const studentScheduleCount = await StudentSchedule.countDocuments();
        const changeRequestCount = await ChangeRequest.countDocuments();
        
        console.log(`  - Classes: ${classCount}`);
        console.log(`  - Class Schedules: ${classScheduleCount}`);
        console.log(`  - Student Schedules: ${studentScheduleCount}`);
        console.log(`  - Change Requests: ${changeRequestCount}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding system:', error);
        process.exit(1);
    }
}

// Run seed
seed();

