require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import all models
const Permission = require('../models/permissionModel');
const Role = require('../models/roleModel');
const User = require('../models/userModel');
const Program = require('../models/programModel');
const PLO = require('../models/ploModel');
const Room = require('../models/room');
const CLO = require('../models/cloModel');
const Course = require('../models/courseModel');
const Session = require('../models/sessionModel');
const Class = require('../models/classModel');
const ClassSchedule = require('../models/classScheduleModel');
const StudentSchedule = require('../models/studentScheduleModel');
const Exam = require('../models/examModel');
const Submission = require('../models/submissionModel');

// Store created IDs for linking
const seedData = {
    permissions: [],
    roles: [],
    users: [],
    programs: [],
    programMap: {}, // Map for type_level -> programId
    plos: [],
    rooms: [],
    clos: [],
    courses: [],
    sessions: [],
    classes: [],
    classSchedules: []
};

async function clearDatabase() {
    console.log('\n🗑️  Clearing existing data...');
    await Submission.deleteMany({});
    await StudentSchedule.deleteMany({});
    await ClassSchedule.deleteMany({});
    await Class.deleteMany({});
    await Exam.deleteMany({});
    await Session.deleteMany({});
    await Course.deleteMany({});
    await CLO.deleteMany({});
    await Room.deleteMany({});
    await PLO.deleteMany({});
    await Program.deleteMany({});
    await User.deleteMany({});
    await Role.deleteMany({});
    await Permission.deleteMany({});
    
    // Xóa collection levelbandmappings nếu còn tồn tại (model đã bị xóa)
    try {
        await mongoose.connection.db.collection('levelbandmappings').drop();
        console.log('✅ Dropped levelbandmappings collection');
    } catch (err) {
        // Collection không tồn tại hoặc đã bị xóa, bỏ qua lỗi
        if (err.code !== 26) { // 26 = namespace not found
            console.log(`⚠️  Could not drop levelbandmappings: ${err.message}`);
        }
    }
    
    console.log('✅ Database cleared\n');
}

async function seedPermissions() {
    console.log('📝 Seeding Permissions...');
    const permissions = [
        { name: 'Center Head', description: 'Quyền trưởng trung tâm' },
        { name: 'Subject Leader', description: 'Quyền trưởng bộ môn' },
        { name: 'Academic Staff', description: 'Quyền giáo vụ' },
        { name: 'Teacher', description: 'Quyền giảng viên' },
        { name: 'Student', description: 'Quyền học viên' }
    ];
    
    const created = await Permission.insertMany(permissions);
    seedData.permissions = created;
    console.log(`✅ Created ${created.length} permissions\n`);
}


async function seedRoles() {
    console.log('📝 Seeding Roles...');
    const roles = [
        { 
            name: 'Center Head', 
            description: 'Quản lý toàn bộ trung tâm',
            permissionId: seedData.permissions[0]._id
        },
        { 
            name: 'Subject Leader', 
            description: 'Quản lý bộ môn',
            permissionId: seedData.permissions[1]._id
        },
        { 
            name: 'Academic Staff', 
            description: 'Quản lý lớp học và lịch học',
            permissionId: seedData.permissions[2]._id
        },
        { 
            name: 'Teacher', 
            description: 'Giảng dạy',
            permissionId: seedData.permissions[3]._id
        },
        { 
            name: 'Student', 
            description: 'Học tập',
            permissionId: seedData.permissions[4]._id
        }
    ];
    
    const created = await Role.insertMany(roles);
    seedData.roles = created;
    console.log(`✅ Created ${created.length} roles\n`);
}

async function seedUsers() {
    console.log('📝 Seeding Users...');
    const plainPassword = '123456';
    
    // Hash password trước khi tạo users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    
    const users = [
        // Trưởng trung tâm
        {
            email: 'centerhead@example.com',
            username: 'centerhead',
            password: hashedPassword,
            phone: '0900000001',
            address: '123 Đường ABC, Quận 1, TP.HCM',
            roleId: seedData.roles[0]._id
        },
        // Trưởng bộ môn
        {
            email: 'subjectleader@example.com',
            username: 'subjectleader',
            password: hashedPassword,
            phone: '0900000002',
            address: '124 Đường ABC, Quận 1, TP.HCM',
            roleId: seedData.roles[1]._id
        },
        // Giáo vụ
        {
            email: 'academicstaff@example.com',
            username: 'academicstaff',
            password: hashedPassword,
            phone: '0900000003',
            address: '125 Đường ABC, Quận 1, TP.HCM',
            roleId: seedData.roles[2]._id
        },
        // Giảng viên 1
        {
            email: 'teacher1@example.com',
            username: 'teacher1',
            password: hashedPassword,
            phone: '0900000004',
            address: '126 Đường ABC, Quận 1, TP.HCM',
            roleId: seedData.roles[3]._id
        },
        // Giảng viên 2
        {
            email: 'teacher2@example.com',
            username: 'teacher2',
            password: hashedPassword,
            phone: '0900000005',
            address: '127 Đường ABC, Quận 1, TP.HCM',
            roleId: seedData.roles[3]._id
        },
        // 5 Học viên
        {
            email: 'student1@example.com',
            username: 'student1',
            password: hashedPassword,
            phone: '0900000006',
            address: '128 Đường ABC, Quận 1, TP.HCM',
            roleId: seedData.roles[4]._id
        },
        {
            email: 'student2@example.com',
            username: 'student2',
            password: hashedPassword,
            phone: '0900000007',
            address: '129 Đường ABC, Quận 1, TP.HCM',
            roleId: seedData.roles[4]._id
        },
        {
            email: 'student3@example.com',
            username: 'student3',
            password: hashedPassword,
            phone: '0900000008',
            address: '130 Đường ABC, Quận 1, TP.HCM',
            roleId: seedData.roles[4]._id
        },
        {
            email: 'student4@example.com',
            username: 'student4',
            password: hashedPassword,
            phone: '0900000009',
            address: '131 Đường ABC, Quận 1, TP.HCM',
            roleId: seedData.roles[4]._id
        },
        {
            email: 'student5@example.com',
            username: 'student5',
            password: hashedPassword,
            phone: '0900000010',
            address: '132 Đường ABC, Quận 1, TP.HCM',
            roleId: seedData.roles[4]._id
        }
    ];
    
    const created = await User.insertMany(users);
    seedData.users = created;
    console.log(`✅ Created ${created.length} users\n`);
}

async function seedPrograms() {
    console.log('📝 Seeding Programs...');
    
    // Mapping band values
    const mappingMap = {
        'ielts_A1': '0-2.5',
        'ielts_A2': '3.0-3.5',
        'ielts_B1': '4.0-5.0',
        'ielts_B2': '5.5-6.5',
        'ielts_C1': '7.0-8.0',
        'ielts_C2': '8.5-9.0',
        'toeic_A1': '0-250',
        'toeic_A2': '251-500',
        'toeic_B1': '501-700',
        'toeic_B2': '701-900',
        'toeic_C1': '901-990',
        'toeic_C2': '990+',
        'cam_Pre-A1': 'Starter',
        'cam_A1': 'Mover'
    };
    
    // Tuition fees
    const tuitionFeeMap = {
        'ielts_A1': 3000000,
        'ielts_A2': 3500000,
        'ielts_B1': 5000000,
        'ielts_B2': 6000000,
        'ielts_C1': 7000000,
        'ielts_C2': 8000000,
        'toeic_A1': 2500000,
        'toeic_A2': 3000000,
        'toeic_B1': 4000000,
        'toeic_B2': 5000000,
        'toeic_C1': 6000000,
        'toeic_C2': 7000000,
        'cam_Pre-A1': 2000000,
        'cam_A1': 2500000
    };
    
    const programs = [
        // IELTS programs
        {
            code: 'IELTS_A1',
            program_name: 'IELTS Foundation A1',
            description: 'Chương trình IELTS cơ bản - Level A1',
            type: 'ielts',
            level: 'A1',
            band: mappingMap['ielts_A1'],
            tuitionFee: tuitionFeeMap['ielts_A1'],
            status: 'active'
        },
        {
            code: 'IELTS_A2',
            program_name: 'IELTS Elementary A2',
            description: 'Chương trình IELTS sơ cấp - Level A2',
            type: 'ielts',
            level: 'A2',
            band: mappingMap['ielts_A2'],
            tuitionFee: tuitionFeeMap['ielts_A2'],
            status: 'active'
        },
        {
            code: 'IELTS_B1',
            program_name: 'IELTS Intermediate B1',
            description: 'Chương trình IELTS trung cấp - Level B1',
            type: 'ielts',
            level: 'B1',
            band: mappingMap['ielts_B1'],
            tuitionFee: tuitionFeeMap['ielts_B1'],
            status: 'active'
        },
        {
            code: 'IELTS_B2',
            program_name: 'IELTS Upper Intermediate B2',
            description: 'Chương trình IELTS trung cấp cao - Level B2',
            type: 'ielts',
            level: 'B2',
            band: mappingMap['ielts_B2'],
            tuitionFee: tuitionFeeMap['ielts_B2'],
            status: 'active'
        },
        {
            code: 'IELTS_C1',
            program_name: 'IELTS Advanced C1',
            description: 'Chương trình IELTS nâng cao - Level C1',
            type: 'ielts',
            level: 'C1',
            band: mappingMap['ielts_C1'],
            tuitionFee: tuitionFeeMap['ielts_C1'],
            status: 'active'
        },
        {
            code: 'IELTS_C2',
            program_name: 'IELTS Proficiency C2',
            description: 'Chương trình IELTS thành thạo - Level C2',
            type: 'ielts',
            level: 'C2',
            band: mappingMap['ielts_C2'],
            tuitionFee: tuitionFeeMap['ielts_C2'],
            status: 'active'
        },
        // TOEIC programs
        {
            code: 'TOEIC_A1',
            program_name: 'TOEIC Beginner A1',
            description: 'Chương trình TOEIC cho người mới bắt đầu - Level A1',
            type: 'toeic',
            level: 'A1',
            band: mappingMap['toeic_A1'],
            tuitionFee: tuitionFeeMap['toeic_A1'],
            status: 'active'
        },
        {
            code: 'TOEIC_A2',
            program_name: 'TOEIC Elementary A2',
            description: 'Chương trình TOEIC sơ cấp - Level A2',
            type: 'toeic',
            level: 'A2',
            band: mappingMap['toeic_A2'],
            tuitionFee: tuitionFeeMap['toeic_A2'],
            status: 'active'
        },
        {
            code: 'TOEIC_B1',
            program_name: 'TOEIC Intermediate B1',
            description: 'Chương trình TOEIC trung cấp - Level B1',
            type: 'toeic',
            level: 'B1',
            band: mappingMap['toeic_B1'],
            tuitionFee: tuitionFeeMap['toeic_B1'],
            status: 'active'
        },
        {
            code: 'TOEIC_B2',
            program_name: 'TOEIC Upper Intermediate B2',
            description: 'Chương trình TOEIC trung cấp cao - Level B2',
            type: 'toeic',
            level: 'B2',
            band: mappingMap['toeic_B2'],
            tuitionFee: tuitionFeeMap['toeic_B2'],
            status: 'active'
        },
        {
            code: 'TOEIC_C1',
            program_name: 'TOEIC Advanced C1',
            description: 'Chương trình TOEIC nâng cao - Level C1',
            type: 'toeic',
            level: 'C1',
            band: mappingMap['toeic_C1'],
            tuitionFee: tuitionFeeMap['toeic_C1'],
            status: 'active'
        },
        {
            code: 'TOEIC_C2',
            program_name: 'TOEIC Proficiency C2',
            description: 'Chương trình TOEIC thành thạo - Level C2',
            type: 'toeic',
            level: 'C2',
            band: mappingMap['toeic_C2'],
            tuitionFee: tuitionFeeMap['toeic_C2'],
            status: 'active'
        },
        // CAM programs
        {
            code: 'CAM_Pre-A1',
            program_name: 'CAM Starter Pre-A1',
            description: 'Chương trình CAM Starter cho trẻ em - Level Pre-A1',
            type: 'cam',
            level: 'Pre-A1',
            band: mappingMap['cam_Pre-A1'],
            tuitionFee: tuitionFeeMap['cam_Pre-A1'],
            status: 'active'
        },
        {
            code: 'CAM_A1',
            program_name: 'CAM Mover A1',
            description: 'Chương trình CAM Mover cho trẻ em - Level A1',
            type: 'cam',
            level: 'A1',
            band: mappingMap['cam_A1'],
            tuitionFee: tuitionFeeMap['cam_A1'],
            status: 'active'
        }
    ];
    
    const created = await Program.insertMany(programs);
    seedData.programs = created;
    
    // Create a map for easy lookup by type+level
    seedData.programMap = {};
    created.forEach(prog => {
        const key = `${prog.type}_${prog.level}`;
        seedData.programMap[key] = prog._id;
    });
    
    console.log(`✅ Created ${created.length} programs\n`);
}

async function seedPLOs() {
    console.log('📝 Seeding PLOs...');
    const plos = [
        // PLOs cho Program 1 (Tiếng Anh Giao tiếp)
        { code: 'PLO001', name: 'Giao tiếp cơ bản', detail: 'Học viên có thể giao tiếp cơ bản trong các tình huống hàng ngày' },
        { code: 'PLO002', name: 'Nghe hiểu', detail: 'Học viên có thể nghe và hiểu các đoạn hội thoại đơn giản' },
        { code: 'PLO003', name: 'Đọc hiểu', detail: 'Học viên có thể đọc và hiểu các văn bản cơ bản' },
        { code: 'PLO004', name: 'Viết cơ bản', detail: 'Học viên có thể viết các câu và đoạn văn đơn giản' },
        
        // PLOs cho Program 2 (TOEIC/IELTS)
        { code: 'PLO005', name: 'Kỹ năng thi TOEIC', detail: 'Học viên có thể đạt điểm TOEIC từ 500-990' },
        { code: 'PLO006', name: 'Kỹ năng thi IELTS', detail: 'Học viên có thể đạt band điểm IELTS từ 4.0-9.0' },
        { code: 'PLO007', name: 'Kỹ năng nghe', detail: 'Học viên có thể nghe hiểu các bài thi TOEIC/IELTS' },
        { code: 'PLO008', name: 'Kỹ năng đọc', detail: 'Học viên có thể đọc hiểu các bài thi TOEIC/IELTS' }
    ];
    
    const created = await PLO.insertMany(plos);
    seedData.plos = created;
    
    // Update Programs with PLOs - assign to CAM and IELTS/TOEIC programs
    // CAM programs get PLOs 0-3, IELTS/TOEIC programs get PLOs 4-7
    const camPrograms = seedData.programs.filter(p => p.type === 'cam');
    const ieltsToeicPrograms = seedData.programs.filter(p => p.type === 'ielts' || p.type === 'toeic');
    
    for (const prog of camPrograms) {
        await Program.findByIdAndUpdate(prog._id, {
            plos: [created[0]._id, created[1]._id, created[2]._id, created[3]._id]
        });
    }
    
    for (const prog of ieltsToeicPrograms) {
        await Program.findByIdAndUpdate(prog._id, {
            plos: [created[4]._id, created[5]._id, created[6]._id, created[7]._id]
        });
    }
    
    console.log(`✅ Created ${created.length} PLOs\n`);
}

async function seedRooms() {
    console.log('📝 Seeding Rooms...');
    const rooms = [
        {
            room_name: 'Phòng 101',
            capacity: 30,
            location: 'Tầng 1',
            description: 'Phòng học tiêu chuẩn',
            status: 'available'
        },
        {
            room_name: 'Phòng 201',
            capacity: 25,
            location: 'Tầng 2',
            description: 'Phòng học nhỏ',
            status: 'available'
        },
        {
            room_name: 'Phòng 301',
            capacity: 40,
            location: 'Tầng 3',
            description: 'Phòng học lớn',
            status: 'available'
        },
        {
            room_name: 'Phòng Lab 401',
            capacity: 20,
            location: 'Tầng 4',
            description: 'Phòng lab máy tính',
            status: 'available'
        },
        {
            room_name: 'Phòng 501',
            capacity: 35,
            location: 'Tầng 5',
            description: 'Phòng học đa năng',
            status: 'available'
        }
    ];
    
    const created = await Room.insertMany(rooms);
    seedData.rooms = created;
    console.log(`✅ Created ${created.length} rooms\n`);
}

async function seedCLOs() {
    console.log('📝 Seeding CLOs...');
    // CLOs sẽ được tạo và link với courses sau
    // Tạm thời tạo một số CLOs cơ bản
    const clos = [
        // CLOs cho IELTS courses
        { code: 'CLO001', name: 'Nghe hiểu IELTS', detail: 'Học viên có thể nghe hiểu các bài nghe IELTS', mappedPLOs: [seedData.plos[6]._id] },
        { code: 'CLO002', name: 'Đọc hiểu IELTS', detail: 'Học viên có thể đọc hiểu các bài đọc IELTS', mappedPLOs: [seedData.plos[7]._id] },
        { code: 'CLO003', name: 'Viết IELTS', detail: 'Học viên có thể viết bài essay IELTS', mappedPLOs: [seedData.plos[5]._id] },
        
        // CLOs cho TOEIC courses
        { code: 'CLO004', name: 'Nghe hiểu TOEIC', detail: 'Học viên có thể nghe hiểu các bài nghe TOEIC', mappedPLOs: [seedData.plos[6]._id] },
        { code: 'CLO005', name: 'Đọc hiểu TOEIC', detail: 'Học viên có thể đọc hiểu các bài đọc TOEIC', mappedPLOs: [seedData.plos[7]._id] },
        
        // CLOs cho CAM courses
        { code: 'CLO006', name: 'Giao tiếp cơ bản', detail: 'Học viên có thể giao tiếp cơ bản', mappedPLOs: [seedData.plos[0]._id] },
        { code: 'CLO007', name: 'Nghe nói cơ bản', detail: 'Học viên có thể nghe và nói cơ bản', mappedPLOs: [seedData.plos[1]._id, seedData.plos[0]._id] }
    ];
    
    const created = await CLO.insertMany(clos);
    seedData.clos = created;
    console.log(`✅ Created ${created.length} CLOs\n`);
}

async function seedCourses() {
    console.log('📝 Seeding Courses...');
    
    const courses = [
        // IELTS courses - each course references the program by type+level
        {
            name: 'IELTS Foundation A1 - Nghe',
            description: 'Khóa học IELTS cơ bản - Kỹ năng Nghe',
            program: seedData.programMap['ielts_A1'],
            clos: [seedData.clos[0]._id, seedData.clos[1]._id],
            createdBy: seedData.users[1]._id, // Subject Leader
            status: 'approved',
            numberOfSessions: 5
        },
        {
            name: 'IELTS Foundation A1 - Nói',
            description: 'Khóa học IELTS cơ bản - Kỹ năng Nói',
            program: seedData.programMap['ielts_A1'],
            clos: [seedData.clos[0]._id, seedData.clos[1]._id],
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 5
        },
        {
            name: 'IELTS Intermediate B1 - Nghe',
            description: 'Khóa học IELTS trung cấp - Kỹ năng Nghe',
            program: seedData.programMap['ielts_B1'],
            clos: [seedData.clos[0]._id, seedData.clos[1]._id, seedData.clos[2]._id],
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 5
        },
        {
            name: 'IELTS Intermediate B1 - Viết',
            description: 'Khóa học IELTS trung cấp - Kỹ năng Viết',
            program: seedData.programMap['ielts_B1'],
            type: 'ielts',
            clos: [seedData.clos[0]._id, seedData.clos[1]._id, seedData.clos[2]._id],
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 5
        },
        {
            name: 'IELTS Advanced C1 - Đọc',
            description: 'Khóa học IELTS nâng cao - Kỹ năng Đọc',
            program: seedData.programMap['ielts_C1'],
            clos: [seedData.clos[0]._id, seedData.clos[1]._id, seedData.clos[2]._id],
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 5
        },
        {
            name: 'IELTS Elementary A2 - Nghe',
            description: 'Khóa học IELTS sơ cấp - Kỹ năng Nghe',
            program: seedData.programMap['ielts_A2'],
            clos: [seedData.clos[0]._id, seedData.clos[1]._id],
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 5
        },
        {
            name: 'IELTS Upper Intermediate B2 - Viết',
            description: 'Khóa học IELTS trung cấp cao - Kỹ năng Viết',
            program: seedData.programMap['ielts_B2'],
            clos: [seedData.clos[0]._id, seedData.clos[1]._id, seedData.clos[2]._id],
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 5
        },
        {
            name: 'IELTS Proficiency C2 - Nói',
            description: 'Khóa học IELTS thành thạo - Kỹ năng Nói',
            program: seedData.programMap['ielts_C2'],
            clos: [seedData.clos[0]._id, seedData.clos[1]._id, seedData.clos[2]._id],
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 5
        },
        // TOEIC courses
        {
            name: 'TOEIC Beginner A1 - Nghe',
            description: 'Khóa học TOEIC cho người mới bắt đầu - Kỹ năng Nghe',
            program: seedData.programMap['toeic_A1'],
            clos: [seedData.clos[3]._id, seedData.clos[4]._id],
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 3
        },
        {
            name: 'TOEIC Intermediate B1 - Đọc',
            description: 'Khóa học TOEIC trung cấp - Kỹ năng Đọc',
            program: seedData.programMap['toeic_B1'],
            clos: [seedData.clos[3]._id, seedData.clos[4]._id],
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 3
        },
        {
            name: 'TOEIC Elementary A2 - Nghe',
            description: 'Khóa học TOEIC sơ cấp - Kỹ năng Nghe',
            program: seedData.programMap['toeic_A2'],
            clos: [seedData.clos[3]._id, seedData.clos[4]._id],
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 3
        },
        {
            name: 'TOEIC Upper Intermediate B2 - Đọc',
            description: 'Khóa học TOEIC trung cấp cao - Kỹ năng Đọc',
            program: seedData.programMap['toeic_B2'],
            clos: [seedData.clos[3]._id, seedData.clos[4]._id],
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 3
        },
        {
            name: 'TOEIC Advanced C1 - Nghe',
            description: 'Khóa học TOEIC nâng cao - Kỹ năng Nghe',
            program: seedData.programMap['toeic_C1'],
            clos: [seedData.clos[3]._id, seedData.clos[4]._id],
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 3
        },
        {
            name: 'TOEIC Proficiency C2 - Đọc',
            description: 'Khóa học TOEIC thành thạo - Kỹ năng Đọc',
            program: seedData.programMap['toeic_C2'],
            clos: [seedData.clos[3]._id, seedData.clos[4]._id],
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 3
        },
        // CAM courses
        {
            name: 'CAM Starter Pre-A1 - Giao tiếp',
            description: 'Khóa học CAM Starter cho trẻ em - Giao tiếp cơ bản',
            program: seedData.programMap['cam_Pre-A1'],
            clos: [seedData.clos[5]._id], // CLO006 - Giao tiếp cơ bản
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 3
        },
        {
            name: 'CAM Mover A1 - Nghe nói',
            description: 'Khóa học CAM Mover cho trẻ em - Nghe và Nói',
            program: seedData.programMap['cam_A1'],
            clos: [seedData.clos[5]._id, seedData.clos[6]._id], // CLO006 và CLO007
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 3
        }
    ];
    
    const created = await Course.insertMany(courses);
    seedData.courses = created;
    console.log(`✅ Created ${created.length} courses\n`);
}

async function seedSessions() {
    console.log('📝 Seeding Sessions...');
    const sessions = [];
    
    // Tạo sessions cho mỗi course dựa trên numberOfSessions
    const coursesWithProgram = await Course.find({ _id: { $in: seedData.courses.map(c => c._id) } })
        .populate('program', 'type');
    
    for (const course of coursesWithProgram) {
        // Sử dụng numberOfSessions từ course thay vì logic hardcoded
        const sessionCount = course.numberOfSessions || 3; // Default to 3 if not set
        
        for (let i = 1; i <= sessionCount; i++) {
            sessions.push({
                title: `Buổi ${i} - ${course.name}`,
                order: i,
                content: `Nội dung buổi học ${i} của khóa ${course.name}`,
                learningType: i % 2 === 0 ? 'practice' : 'theory',
                clos: course.clos.slice(0, Math.min(2, course.clos.length)) // Link 1-2 CLOs
            });
        }
    }
    
    const created = await Session.insertMany(sessions);
    seedData.sessions = created;
    
    // Update courses with sessions
    let sessionIndex = 0;
    for (const course of coursesWithProgram) {
        const sessionCount = course.numberOfSessions || 3; // Default to 3 if not set
        const courseSessions = created.slice(sessionIndex, sessionIndex + sessionCount);
        await Course.findByIdAndUpdate(course._id, {
            sessions: courseSessions.map(s => s._id)
        });
        sessionIndex += sessionCount;
    }
    
    console.log(`✅ Created ${created.length} sessions\n`);
}

async function seedClasses() {
    console.log('📝 Seeding Classes...');
    const today = new Date();
    
    // Thu ngắn thời gian xuống khoảng 1 tháng
    const startDate1 = new Date(today);
    startDate1.setDate(today.getDate() + 7); // Bắt đầu sau 1 tuần
    const endDate1 = new Date(startDate1);
    endDate1.setMonth(startDate1.getMonth() + 1); // Kết thúc sau 1 tháng
    
    const startDate2 = new Date(today);
    startDate2.setDate(today.getDate() + 14); // Bắt đầu sau 2 tuần
    const endDate2 = new Date(startDate2);
    endDate2.setMonth(startDate2.getMonth() + 1); // Kết thúc sau 1 tháng
    
    const startDate3 = new Date(today);
    startDate3.setDate(today.getDate() + 3); // Bắt đầu sau 3 ngày
    const endDate3 = new Date(startDate3);
    endDate3.setMonth(startDate3.getMonth() + 1); // Kết thúc sau 1 tháng
    
    const classes = [
        {
            name: 'IELTS Foundation A1 - Lớp 1',
            course: seedData.courses[0]._id,
            teacher: seedData.users[3]._id, // Teacher 1
            students: [seedData.users[5]._id, seedData.users[6]._id, seedData.users[7]._id],
            room: seedData.rooms[0]._id,
            startDate: startDate1,
            endDate: endDate1,
            maxStudents: 25,
            status: 'active'
        },
        {
            name: 'TOEIC Beginner A1 - Lớp 1',
            course: seedData.courses[3]._id,
            teacher: seedData.users[4]._id, // Teacher 2
            students: [seedData.users[8]._id, seedData.users[9]._id],
            room: seedData.rooms[1]._id,
            startDate: startDate2,
            endDate: endDate2,
            maxStudents: 20,
            status: 'pending'
        },
        {
            name: 'CAM Starter Pre-A1 - Lớp 1',
            course: seedData.courses[5]._id,
            teacher: seedData.users[3]._id, // Teacher 1
            students: [seedData.users[5]._id, seedData.users[6]._id, seedData.users[7]._id, seedData.users[8]._id],
            room: seedData.rooms[2]._id,
            startDate: startDate3,
            endDate: endDate3,
            maxStudents: 15,
            status: 'active'
        }
    ];
    
    const created = await Class.insertMany(classes);
    seedData.classes = created;
    console.log(`✅ Created ${created.length} classes\n`);
}

async function seedClassSchedules() {
    console.log('📝 Seeding Class Schedules...');
    const classSchedules = [];
    
    // Các khung giờ có thể chọn (tối đa 4 buổi/tuần)
    const timeSlots = [
        { startTime: '08:00', endTime: '10:00' },
        { startTime: '10:30', endTime: '12:30' },
        { startTime: '14:00', endTime: '16:00' },
        { startTime: '18:00', endTime: '20:00' }
    ];
    
    // Các ngày trong tuần (0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7)
    const daysOfWeek = [1, 3, 5, 6]; // Thứ 2, 4, 6, 7 (tối đa 4 buổi/tuần)
    
    // Reload courses từ database để có sessions đã được update
    // (seedData.courses chưa có sessions vì sessions được update sau khi seedSessions)
    const coursesFromDB = await Course.find().lean();
    
    for (const classItem of seedData.classes) {
        console.log(`  📚 Creating schedules for class: ${classItem.name}`);
        
        // Tìm course từ database (có sessions đã được update)
        const course = coursesFromDB.find(c => c._id.toString() === classItem.course.toString());
        if (!course) {
            console.log(`    ⚠️ Course not found for class ${classItem.name}`);
            continue;
        }
        
        // Lấy sessions từ course (có thể là ObjectId hoặc đã populate)
        const courseSessionIds = course.sessions || [];
        if (!Array.isArray(courseSessionIds) || courseSessionIds.length === 0) {
            console.log(`    ⚠️ Course ${course.name} has no sessions (sessions: ${JSON.stringify(courseSessionIds)})`);
            continue;
        }
        
        // Tìm sessions từ seedData.sessions
        const courseSessions = seedData.sessions.filter(s => 
            courseSessionIds.some(csId => {
                const csIdStr = csId.toString ? csId.toString() : String(csId);
                const sIdStr = s._id.toString ? s._id.toString() : String(s._id);
                return csIdStr === sIdStr;
            })
        );
        
        if (courseSessions.length === 0) {
            console.log(`    ⚠️ No sessions found for course ${course.name} (course has ${courseSessionIds.length} session IDs, but none match)`);
            continue;
        }
        
        // Lấy số buổi học từ course.numberOfSessions
        const numberOfSessions = course.numberOfSessions || courseSessions.length;
        
        // Tính số tuần từ startDate đến endDate
        const startDate = new Date(classItem.startDate);
        const endDate = new Date(classItem.endDate);
        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const weeks = Math.ceil(daysDiff / 7);
        
        console.log(`    📅 Start: ${startDate.toISOString().split('T')[0]}, End: ${endDate.toISOString().split('T')[0]}, Days: ${daysDiff}, Weeks: ${weeks}`);
        console.log(`    📚 Course has ${numberOfSessions} sessions, creating ${numberOfSessions} class schedules`);
        
        // Tạo đúng số buổi học dựa trên course.numberOfSessions
        // Phân bổ đều trong khoảng thời gian từ startDate đến endDate
        let sessionIndex = 0;
        let scheduleCount = 0;
        
        // Tạo đúng numberOfSessions buổi học
        for (let i = 0; i < numberOfSessions; i++) {
            // Tính ngày cụ thể: phân bổ đều trong khoảng thời gian
            let scheduleDate;
            if (numberOfSessions === 1) {
                // Nếu chỉ có 1 buổi, đặt ở giữa khoảng thời gian
                scheduleDate = new Date(startDate.getTime() + (endDate.getTime() - startDate.getTime()) / 2);
            } else {
                // Phân bổ đều: buổi đầu gần startDate, buổi cuối gần endDate
                const progress = i / (numberOfSessions - 1);
                scheduleDate = new Date(startDate.getTime() + (endDate.getTime() - startDate.getTime()) * progress);
            }
            
            // Chọn ngày trong tuần và khung giờ
            const dayIndex = i % daysOfWeek.length;
            const dayOfWeek = daysOfWeek[dayIndex];
            const timeSlot = timeSlots[dayIndex % timeSlots.length];
            
            // Điều chỉnh để rơi vào ngày trong tuần phù hợp
            const currentDayOfWeek = scheduleDate.getDay();
            let dayOffset = dayOfWeek - currentDayOfWeek;
            if (dayOffset < 0) dayOffset += 7;
            if (dayOffset > 3) dayOffset -= 7; // Ưu tiên ngày gần nhất
            
            scheduleDate.setDate(scheduleDate.getDate() + dayOffset);
            
            // Đảm bảo không vượt quá endDate
            if (scheduleDate > endDate) {
                scheduleDate = new Date(endDate);
                scheduleDate.setDate(scheduleDate.getDate() - 1); // Lùi 1 ngày nếu vượt quá
            }
            
            // Đảm bảo không trước startDate
            if (scheduleDate < startDate) {
                scheduleDate = new Date(startDate);
            }
            
            // Lấy session tương ứng theo thứ tự
            const session = courseSessions[sessionIndex % courseSessions.length];
            sessionIndex++;
            
            classSchedules.push({
                class: classItem._id,
                session: session._id,
                date: scheduleDate,
                startTime: timeSlot.startTime,
                endTime: timeSlot.endTime,
                room: classItem.room,
                teacher: classItem.teacher,
                createdBy: seedData.users[2]._id, // Academic Staff
                reason: `Lịch học buổi ${i + 1}`,
                status: 'approved'
            });
            
            scheduleCount++;
        }
        
        console.log(`    ✅ Created ${scheduleCount} schedules for class ${classItem.name}`);
    }
    
    if (classSchedules.length === 0) {
        console.log('⚠️ No class schedules to create!');
        seedData.classSchedules = [];
        return;
    }
    
    const created = await ClassSchedule.insertMany(classSchedules);
    seedData.classSchedules = created;
    console.log(`✅ Created ${created.length} class schedules total\n`);
}

async function seedStudentSchedules() {
    console.log('📝 Seeding Student Schedules...');
    const studentSchedules = [];
    
    // Tạo student schedules cho một số học viên
    for (const classSchedule of seedData.classSchedules.slice(0, 5)) {
        const classItem = seedData.classes.find(c => 
            c._id.toString() === classSchedule.class.toString()
        );
        if (!classItem) continue;
        
        // Mỗi class schedule có 2-3 học viên tham gia
        const students = classItem.students.slice(0, Math.min(3, classItem.students.length));
        
        for (const studentId of students) {
            studentSchedules.push({
                student: studentId,
                classSchedule: classSchedule._id,
                attendance: {
                    status: Math.random() > 0.3 ? 'present' : 'absent',
                    checkInTime: classSchedule.date,
                    markedBy: classItem.teacher
                }
            });
        }
    }
    
    const created = await StudentSchedule.insertMany(studentSchedules);
    console.log(`✅ Created ${created.length} student schedules\n`);
}

async function seedExams() {
    console.log('📝 Seeding Exams...');
    const exams = [
        {
            title: 'IELTS Practice Test 1',
            description: 'Bài thi thử IELTS',
            createdBy: seedData.users[1]._id, // Subject Leader
            userId: seedData.users[5]._id, // Student 1
            examType: 'practice',
            level: 'Academic',
            totalDuration: 180,
            sections: [
                {
                    type: 'listening',
                    instructions: 'Listen to the audio and answer the questions',
                    duration: 30,
                    questionCount: 40,
                    maxScore: 40,
                    score: 28
                },
                {
                    type: 'reading',
                    instructions: 'Read the passages and answer the questions',
                    duration: 60,
                    questionCount: 40,
                    maxScore: 40,
                    score: 32
                }
            ],
            isPublished: true
        }
    ];
    
    const created = await Exam.insertMany(exams);
    console.log(`✅ Created ${created.length} exams\n`);
}

async function seed() {
    try {
        console.log('🚀 Starting system seed...\n');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB\n');

        // Clear existing data
        await clearDatabase();

        // Seed in order
        await seedPermissions();
        await seedRoles();
        await seedUsers();
        await seedPrograms();
        await seedPLOs();
        await seedRooms();
        await seedCLOs();
        await seedCourses();
        await seedSessions();
        await seedClasses();
        await seedClassSchedules();
        await seedStudentSchedules();
        await seedExams();

        console.log('\n✨ Seed completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`  - Permissions: ${seedData.permissions.length}`);
        console.log(`  - Roles: ${seedData.roles.length}`);
        console.log(`  - Users: ${seedData.users.length}`);
        console.log(`  - Programs: ${seedData.programs.length}`);
        console.log(`  - PLOs: ${seedData.plos.length}`);
        console.log(`  - Rooms: ${seedData.rooms.length}`);
        console.log(`  - CLOs: ${seedData.clos.length}`);
        console.log(`  - Courses: ${seedData.courses.length}`);
        console.log(`  - Sessions: ${seedData.sessions.length}`);
        console.log(`  - Classes: ${seedData.classes.length}`);
        console.log(`  - Class Schedules: ${seedData.classSchedules.length}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding system:', error);
        process.exit(1);
    }
}

// Run seed
seed();

