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
const ChangeRequest = require('../models/changeRequestModel');

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
    await ChangeRequest.deleteMany({});
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
        },
        // Thêm 20 students mới cho 5 lớp cùng course
        {
            email: 'student6@example.com',
            username: 'student6',
            password: hashedPassword,
            phone: '0900000011',
            address: '133 Đường ABC, Quận 1, TP.HCM',
            roleId: seedData.roles[4]._id
        },
        {
            email: 'student7@example.com',
            username: 'student7',
            password: hashedPassword,
            phone: '0900000012',
            address: '134 Đường ABC, Quận 1, TP.HCM',
            roleId: seedData.roles[4]._id
        },
        {
            email: 'student8@example.com',
            username: 'student8',
            password: hashedPassword,
            phone: '0900000013',
            address: '135 Đường ABC, Quận 1, TP.HCM',
            roleId: seedData.roles[4]._id
        },
        {
            email: 'student9@example.com',
            username: 'student9',
            password: hashedPassword,
            phone: '0900000014',
            address: '136 Đường ABC, Quận 1, TP.HCM',
            roleId: seedData.roles[4]._id
        },
        {
            email: 'student10@example.com',
            username: 'student10',
            password: hashedPassword,
            phone: '0900000015',
            address: '137 Đường ABC, Quận 1, TP.HCM',
            roleId: seedData.roles[4]._id
        },
        {
            email: 'student11@example.com',
            username: 'student11',
            password: hashedPassword,
            phone: '0900000016',
            address: '138 Đường ABC, Quận 1, TP.HCM',
            roleId: seedData.roles[4]._id
        },
        {
            email: 'student12@example.com',
            username: 'student12',
            password: hashedPassword,
            phone: '0900000017',
            address: '139 Đường ABC, Quận 1, TP.HCM',
            roleId: seedData.roles[4]._id
        },
        {
            email: 'student13@example.com',
            username: 'student13',
            password: hashedPassword,
            phone: '0900000018',
            address: '140 Đường ABC, Quận 1, TP.HCM',
            roleId: seedData.roles[4]._id
        },
        {
            email: 'student14@example.com',
            username: 'student14',
            password: hashedPassword,
            phone: '0900000019',
            address: '141 Đường ABC, Quận 1, TP.HCM',
            roleId: seedData.roles[4]._id
        },
        {
            email: 'student15@example.com',
            username: 'student15',
            password: hashedPassword,
            phone: '0900000020',
            address: '142 Đường ABC, Quận 1, TP.HCM',
            roleId: seedData.roles[4]._id
        },
        {
            email: 'student16@example.com',
            username: 'student16',
            password: hashedPassword,
            phone: '0900000021',
            address: '143 Đường ABC, Quận 1, TP.HCM',
            roleId: seedData.roles[4]._id
        },
        {
            email: 'student17@example.com',
            username: 'student17',
            password: hashedPassword,
            phone: '0900000022',
            address: '144 Đường ABC, Quận 1, TP.HCM',
            roleId: seedData.roles[4]._id
        },
        {
            email: 'student18@example.com',
            username: 'student18',
            password: hashedPassword,
            phone: '0900000023',
            address: '145 Đường ABC, Quận 1, TP.HCM',
            roleId: seedData.roles[4]._id
        },
        {
            email: 'student19@example.com',
            username: 'student19',
            password: hashedPassword,
            phone: '0900000024',
            address: '146 Đường ABC, Quận 1, TP.HCM',
            roleId: seedData.roles[4]._id
        },
        {
            email: 'student20@example.com',
            username: 'student20',
            password: hashedPassword,
            phone: '0900000025',
            address: '147 Đường ABC, Quận 1, TP.HCM',
            roleId: seedData.roles[4]._id
        },
        {
            email: 'student21@example.com',
            username: 'student21',
            password: hashedPassword,
            phone: '0900000026',
            address: '148 Đường ABC, Quận 1, TP.HCM',
            roleId: seedData.roles[4]._id
        },
        {
            email: 'student22@example.com',
            username: 'student22',
            password: hashedPassword,
            phone: '0900000027',
            address: '149 Đường ABC, Quận 1, TP.HCM',
            roleId: seedData.roles[4]._id
        },
        {
            email: 'student23@example.com',
            username: 'student23',
            password: hashedPassword,
            phone: '0900000028',
            address: '150 Đường ABC, Quận 1, TP.HCM',
            roleId: seedData.roles[4]._id
        },
        {
            email: 'student24@example.com',
            username: 'student24',
            password: hashedPassword,
            phone: '0900000029',
            address: '151 Đường ABC, Quận 1, TP.HCM',
            roleId: seedData.roles[4]._id
        },
        {
            email: 'student25@example.com',
            username: 'student25',
            password: hashedPassword,
            phone: '0900000030',
            address: '152 Đường ABC, Quận 1, TP.HCM',
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
            numberOfSessions: 12
        },
        {
            name: 'IELTS Foundation A1 - Nói',
            description: 'Khóa học IELTS cơ bản - Kỹ năng Nói',
            program: seedData.programMap['ielts_A1'],
            clos: [seedData.clos[0]._id, seedData.clos[1]._id],
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 12
        },
        {
            name: 'IELTS Intermediate B1 - Nghe',
            description: 'Khóa học IELTS trung cấp - Kỹ năng Nghe',
            program: seedData.programMap['ielts_B1'],
            clos: [seedData.clos[0]._id, seedData.clos[1]._id, seedData.clos[2]._id],
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 12
        },
        {
            name: 'IELTS Intermediate B1 - Viết',
            description: 'Khóa học IELTS trung cấp - Kỹ năng Viết',
            program: seedData.programMap['ielts_B1'],
            type: 'ielts',
            clos: [seedData.clos[0]._id, seedData.clos[1]._id, seedData.clos[2]._id],
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 12
        },
        {
            name: 'IELTS Advanced C1 - Đọc',
            description: 'Khóa học IELTS nâng cao - Kỹ năng Đọc',
            program: seedData.programMap['ielts_C1'],
            clos: [seedData.clos[0]._id, seedData.clos[1]._id, seedData.clos[2]._id],
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 12
        },
        {
            name: 'IELTS Elementary A2 - Nghe',
            description: 'Khóa học IELTS sơ cấp - Kỹ năng Nghe',
            program: seedData.programMap['ielts_A2'],
            clos: [seedData.clos[0]._id, seedData.clos[1]._id],
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 12
        },
        {
            name: 'IELTS Upper Intermediate B2 - Viết',
            description: 'Khóa học IELTS trung cấp cao - Kỹ năng Viết',
            program: seedData.programMap['ielts_B2'],
            clos: [seedData.clos[0]._id, seedData.clos[1]._id, seedData.clos[2]._id],
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 12
        },
        {
            name: 'IELTS Proficiency C2 - Nói',
            description: 'Khóa học IELTS thành thạo - Kỹ năng Nói',
            program: seedData.programMap['ielts_C2'],
            clos: [seedData.clos[0]._id, seedData.clos[1]._id, seedData.clos[2]._id],
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 12
        },
        // TOEIC courses
        {
            name: 'TOEIC Beginner A1 - Nghe',
            description: 'Khóa học TOEIC cho người mới bắt đầu - Kỹ năng Nghe',
            program: seedData.programMap['toeic_A1'],
            clos: [seedData.clos[3]._id, seedData.clos[4]._id],
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 10
        },
        {
            name: 'TOEIC Intermediate B1 - Đọc',
            description: 'Khóa học TOEIC trung cấp - Kỹ năng Đọc',
            program: seedData.programMap['toeic_B1'],
            clos: [seedData.clos[3]._id, seedData.clos[4]._id],
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 10
        },
        {
            name: 'TOEIC Elementary A2 - Nghe',
            description: 'Khóa học TOEIC sơ cấp - Kỹ năng Nghe',
            program: seedData.programMap['toeic_A2'],
            clos: [seedData.clos[3]._id, seedData.clos[4]._id],
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 10
        },
        {
            name: 'TOEIC Upper Intermediate B2 - Đọc',
            description: 'Khóa học TOEIC trung cấp cao - Kỹ năng Đọc',
            program: seedData.programMap['toeic_B2'],
            clos: [seedData.clos[3]._id, seedData.clos[4]._id],
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 10
        },
        {
            name: 'TOEIC Advanced C1 - Nghe',
            description: 'Khóa học TOEIC nâng cao - Kỹ năng Nghe',
            program: seedData.programMap['toeic_C1'],
            clos: [seedData.clos[3]._id, seedData.clos[4]._id],
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 10
        },
        {
            name: 'TOEIC Proficiency C2 - Đọc',
            description: 'Khóa học TOEIC thành thạo - Kỹ năng Đọc',
            program: seedData.programMap['toeic_C2'],
            clos: [seedData.clos[3]._id, seedData.clos[4]._id],
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 10
        },
        // CAM courses
        {
            name: 'CAM Starter Pre-A1 - Giao tiếp',
            description: 'Khóa học CAM Starter cho trẻ em - Giao tiếp cơ bản',
            program: seedData.programMap['cam_Pre-A1'],
            clos: [seedData.clos[5]._id], // CLO006 - Giao tiếp cơ bản
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 8
        },
        {
            name: 'CAM Mover A1 - Nghe nói',
            description: 'Khóa học CAM Mover cho trẻ em - Nghe và Nói',
            program: seedData.programMap['cam_A1'],
            clos: [seedData.clos[5]._id, seedData.clos[6]._id], // CLO006 và CLO007
            createdBy: seedData.users[1]._id,
            status: 'approved',
            numberOfSessions: 8
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
    
    const classes = [
        {
            name: 'IELTS Foundation A1 - Lớp Đang Học',
            course: seedData.courses[0]._id, // IELTS Foundation A1 - Nghe (5 sessions)
            teacher: seedData.users[3]._id, // Teacher 1
            students: [seedData.users[5]._id, seedData.users[6]._id, seedData.users[7]._id],
            room: seedData.rooms[0]._id,
            startDate: activeClassStartDate,
            endDate: activeClassEndDate,
            maxStudents: 25,
            status: 'active'
        },
        {
            name: 'TOEIC Beginner A1 - Lớp Chưa Học',
            course: seedData.courses[8]._id, // TOEIC Beginner A1 - Nghe (3 sessions)
            teacher: seedData.users[4]._id, // Teacher 2
            students: [seedData.users[8]._id, seedData.users[9]._id],
            room: seedData.rooms[1]._id,
            startDate: pendingClassStartDate,
            endDate: pendingClassEndDate,
            maxStudents: 20,
            status: 'pending'
        },
        {
            name: 'IELTS Elementary A2 - Lớp Có Conflict',
            course: seedData.courses[5]._id, // IELTS Elementary A2 - Nghe (12 sessions)
            teacher: seedData.users[4]._id, // Teacher 2 (khác teacher để tránh conflict teacher)
            students: [
                seedData.users[5]._id, // Học viên chung với lớp đang học (sẽ bị conflict)
                seedData.users[6]._id, // Học viên chung với lớp đang học (sẽ bị conflict)
                seedData.users[8]._id  // Học viên mới
            ],
            room: seedData.rooms[2]._id, // Phòng khác để tránh conflict room
            startDate: activeClassStartDate, // Cùng thời gian với lớp đang học
            endDate: activeClassEndDate,
            maxStudents: 25,
            status: 'active'
        },
        // 5 lớp mới cùng course với "IELTS Foundation A1 - Lớp Đang Học"
        {
            name: 'IELTS Foundation A1 - Lớp 2',
            course: seedData.courses[0]._id, // IELTS Foundation A1 - Nghe (cùng course)
            teacher: seedData.users[3]._id, // Teacher 1
            students: [seedData.users[10]._id, seedData.users[11]._id, seedData.users[12]._id, seedData.users[13]._id],
            room: seedData.rooms[1]._id, // Phòng 201
            startDate: class2StartDate, // 1 tuần trước
            endDate: class2EndDate,
            maxStudents: 25,
            status: 'active'
        },
        {
            name: 'IELTS Foundation A1 - Lớp 3',
            course: seedData.courses[0]._id, // IELTS Foundation A1 - Nghe (cùng course)
            teacher: seedData.users[4]._id, // Teacher 2
            students: [seedData.users[14]._id, seedData.users[15]._id, seedData.users[16]._id, seedData.users[17]._id],
            room: seedData.rooms[2]._id, // Phòng 301
            startDate: class3StartDate, // Hôm nay
            endDate: class3EndDate,
            maxStudents: 25,
            status: 'active'
        },
        {
            name: 'IELTS Foundation A1 - Lớp 4',
            course: seedData.courses[0]._id, // IELTS Foundation A1 - Nghe (cùng course)
            teacher: seedData.users[3]._id, // Teacher 1
            students: [seedData.users[18]._id, seedData.users[19]._id, seedData.users[20]._id, seedData.users[21]._id],
            room: seedData.rooms[3]._id, // Phòng Lab 401
            startDate: class4StartDate, // 1 tuần sau
            endDate: class4EndDate,
            maxStudents: 25,
            status: 'pending'
        },
        {
            name: 'IELTS Foundation A1 - Lớp 5',
            course: seedData.courses[0]._id, // IELTS Foundation A1 - Nghe (cùng course)
            teacher: seedData.users[4]._id, // Teacher 2
            students: [seedData.users[22]._id, seedData.users[23]._id, seedData.users[24]._id, seedData.users[25]._id],
            room: seedData.rooms[4]._id, // Phòng 501
            startDate: class5StartDate, // 2 tuần sau
            endDate: class5EndDate,
            maxStudents: 25,
            status: 'pending'
        },
        {
            name: 'IELTS Foundation A1 - Lớp 6',
            course: seedData.courses[0]._id, // IELTS Foundation A1 - Nghe (cùng course)
            teacher: seedData.users[3]._id, // Teacher 1
            students: [seedData.users[10]._id, seedData.users[11]._id], // Dùng lại một số students (không conflict vì lịch khác)
            room: seedData.rooms[0]._id, // Phòng 101 (có thể dùng lại nếu lịch khác)
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
    
    // Reload courses từ database để có sessions đã được update
    const coursesFromDB = await Course.find().lean();
    
    for (let classIndex = 0; classIndex < seedData.classes.length; classIndex++) {
        const classItem = seedData.classes[classIndex];
        console.log(`  📚 Creating schedules for class: ${classItem.name}`);
        
        // Tìm course từ database (có sessions đã được update)
        const course = coursesFromDB.find(c => c._id.toString() === classItem.course.toString());
        if (!course) {
            console.log(`    ⚠️ Course not found for class ${classItem.name}`);
            continue;
        }
        
        // Lấy sessions từ course
        const courseSessionIds = course.sessions || [];
        if (!Array.isArray(courseSessionIds) || courseSessionIds.length === 0) {
            console.log(`    ⚠️ Course ${course.name} has no sessions`);
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
            console.log(`    ⚠️ No sessions found for course ${course.name}`);
            continue;
        }
        
        // Lấy số buổi học từ course.numberOfSessions
        const numberOfSessions = course.numberOfSessions || courseSessions.length;
        
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
        
        // Tạo lịch học
        let sessionIndex = 0;
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
                
                // Lấy session tương ứng theo thứ tự
                const session = courseSessions[sessionIndex % courseSessions.length];
                
                classSchedules.push({
                    class: classItem._id,
                    session: session._id,
                    date: scheduleDate,
                    startTime: patternItem.startTime,
                    endTime: patternItem.endTime,
                    room: classItem.room,
                    teacher: classItem.teacher,
                    createdBy: seedData.users[2]._id, // Academic Staff
                    reason: `Lịch học buổi ${scheduleCount + 1}`,
                    status: 'fixed'
                });
                
                sessionIndex++;
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Tạo student schedules cho TẤT CẢ ClassSchedules của cả 2 lớp
    for (const classSchedule of seedData.classSchedules) {
        const classItem = seedData.classes.find(c => 
            c._id.toString() === classSchedule.class.toString()
        );
        if (!classItem) continue;
        
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
    
    const created = await StudentSchedule.insertMany(studentSchedules);
    console.log(`✅ Created ${created.length} student schedules for ${seedData.classSchedules.length} class schedules\n`);
}

async function seedChangeRequests() {
    console.log('📝 Seeding Change Requests...');
    
    // Lấy danh sách học sinh và giáo viên
    const teacherRoleId = seedData.roles[3]._id; // Teacher role
    const studentRoleId = seedData.roles[4]._id; // Student role
    
    const teachers = seedData.users.filter(user => 
        user.roleId.toString() === teacherRoleId.toString()
    );
    const students = seedData.users.filter(user => 
        user.roleId.toString() === studentRoleId.toString()
    );
    
    console.log(`  - Found ${teachers.length} teachers and ${students.length} students`);
    
    // Mảng mẫu nội dung đơn
    const contentTemplates = [
        'Xin phép đổi buổi học vì lý do cá nhân',
        'Xin chuyển sang lớp khác do xung đột lịch học',
        'Xin đổi buổi học do có việc đột xuất',
        'Xin phép đổi lịch học vì lý do sức khỏe',
        'Xin chuyển lớp do không phù hợp với trình độ hiện tại',
        'Xin đổi buổi học để phù hợp với lịch làm việc',
        'Xin phép đổi lịch dạy vì có việc gia đình',
        'Xin đổi buổi dạy do xung đột lịch cá nhân',
        'Xin chuyển sang lớp khác có thời gian phù hợp hơn',
        'Xin đổi buổi học để tránh trùng với lịch thi'
    ];
    
    const changeRequests = [];
    const today = new Date();
    
    // Tạo đơn cho mỗi học sinh (ít nhất 1 đơn)
    for (const student of students) {
        const requestCount = Math.random() < 0.3 ? 2 : 1; // 30% có 2 đơn, 70% có 1 đơn
        
        for (let i = 0; i < requestCount; i++) {
            const randomContent = contentTemplates[Math.floor(Math.random() * contentTemplates.length)];
            const daysAgo = Math.floor(Math.random() * 30); // Đơn gửi trong vòng 30 ngày qua
            const createdAt = new Date(today);
            createdAt.setDate(createdAt.getDate() - daysAgo);
            createdAt.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60), 0, 0);
            
            changeRequests.push({
                sender: student._id,
                content: randomContent,
                status: 'pending',
                approver: null,
                approvedDate: null,
                responseContent: null,
                createdAt: createdAt,
                updatedAt: createdAt
            });
        }
    }
    
    // Tạo đơn cho mỗi giáo viên (ít nhất 1 đơn)
    for (const teacher of teachers) {
        const requestCount = Math.random() < 0.3 ? 2 : 1; // 30% có 2 đơn, 70% có 1 đơn
        
        for (let i = 0; i < requestCount; i++) {
            const randomContent = contentTemplates[Math.floor(Math.random() * contentTemplates.length)];
            const daysAgo = Math.floor(Math.random() * 30); // Đơn gửi trong vòng 30 ngày qua
            const createdAt = new Date(today);
            createdAt.setDate(createdAt.getDate() - daysAgo);
            createdAt.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60), 0, 0);
            
            changeRequests.push({
                sender: teacher._id,
                content: randomContent,
                status: 'pending',
                approver: null,
                approvedDate: null,
                responseContent: null,
                createdAt: createdAt,
                updatedAt: createdAt
            });
        }
    }
    
    if (changeRequests.length === 0) {
        console.log('⚠️  No change requests to create!');
        return;
    }
    
    const created = await ChangeRequest.insertMany(changeRequests);
    console.log(`✅ Created ${created.length} change requests`);
    console.log(`   - From ${students.length} students and ${teachers.length} teachers\n`);
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
        await seedChangeRequests();
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
        
        // Count change requests
        const changeRequestCount = await ChangeRequest.countDocuments();
        console.log(`  - Change Requests: ${changeRequestCount}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding system:', error);
        process.exit(1);
    }
}

// Run seed
seed();

