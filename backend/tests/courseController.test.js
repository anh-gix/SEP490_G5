const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const Course = require('../models/courseModel');
const Program = require('../models/programModel');
const User = require('../models/userModel');


jest.setTimeout(10000);

let mongoServer;

//Kết nối DB ảo trước tất cả các test
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.disconnect();
    await mongoose.connect(mongoServer.getUri());
});

// Dọn dẹp DB và ngắt kết nối sau khi xong
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// Xóa dữ liệu cũ và tạo dữ liệu mới trước mỗi test case
beforeEach(async () => {
    // Xóa sạch dữ liệu cũ
    await Course.deleteMany();
    await Program.deleteMany();
    await User.deleteMany();

    // Seeeding data 

    // Tạo User
    const testUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        address: 'Test Address',
        roleId: new mongoose.Types.ObjectId()
    });

    // Tạo Program
    const programA = await Program.create({
        program_name: 'IELTS Preparation',
        code: 'IELTS-B1',
        type: 'ielts',
        level: 'B1',
        band: '4.0-5.0',
        status: 'approved',
        isActive: true,
        createdBy: testUser._id,
        plos: [
            { code: 'PLO1', name: 'Listening Skills', detail: 'Improve listening comprehension' },
            { code: 'PLO2', name: 'Speaking Skills', detail: 'Develop speaking fluency' }
        ]
    });

    const programB = await Program.create({
        program_name: 'TOEIC Preparation',
        code: 'TOEIC-B2',
        type: 'toeic',
        level: 'B2',
        band: '701-900',
        status: 'approved',
        isActive: true,
        createdBy: testUser._id,
        plos: [
            { code: 'PLO1', name: 'Business English', detail: 'Business communication skills' }
        ]
    });

    // Tạo các Course
    await Course.create([
        {
            name: 'IELTS Foundation',
            courseCode: 'IELTS101',
            learningType: 'offline',
            status: 'active',
            isActive: true,
            program: programA._id,
            createdBy: testUser._id,
            description: 'Basic IELTS course',
            numberOfSessions: 20,
            clos: [
                {
                    code: 'CLO1',
                    name: 'Basic Listening',
                    detail: 'Understand basic conversations',
                    mappedPLOs: [programA.plos[0]._id]
                }
            ]
        },
        {
            name: 'IELTS Advanced',
            courseCode: 'IELTS202',
            learningType: 'online',
            status: 'draft',
            isActive: false,
            program: programA._id,
            createdBy: testUser._id,
            description: 'Advanced IELTS course',
            numberOfSessions: 30,
            clos: []
        },
        {
            name: 'TOEIC Business',
            courseCode: 'TOEIC101',
            learningType: 'hybrid',
            status: 'completed',
            isActive: true,
            program: programB._id,
            createdBy: testUser._id,
            description: 'TOEIC for business professionals',
            numberOfSessions: 25,
            clos: []
        }
    ]);
});

describe('GET /api/courses (getAllCourse)', () => {

    test('should return all courses when no filter provided', async () => {
        const res = await request(app).get('/api/courses');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.count).toBe(3);
        expect(res.body.data.length).toBe(3);
    });

    test('should filter courses by status', async () => {
        const res = await request(app).get('/api/courses').query({ status: 'draft' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.count).toBe(1);
        expect(res.body.data[0].name).toBe('IELTS Advanced');
    });

    // Test 3: Search theo tên (Name)
    test('should search courses by name (regex)', async () => {
        const res = await request(app).get('/api/courses').query({ search: 'Foundation' });

        expect(res.statusCode).toBe(200);
        expect(res.body.count).toBe(1);
        expect(res.body.data[0].name).toBe('IELTS Foundation');
    });

    // Test 4: Search theo mã môn (courseCode)
    test('should search courses by courseCode', async () => {
        const res = await request(app).get('/api/courses').query({ search: 'TOEIC' });

        expect(res.statusCode).toBe(200);
        expect(res.body.count).toBe(1);
        expect(res.body.data[0].courseCode).toBe('TOEIC101');
    });

    // Test 5: Kết hợp nhiều điều kiện (Status + Search)
    test('should filter by both status and search term', async () => {
        // Tìm khóa học có status 'active' VÀ tên chứa 'Advanced'
        // Thực tế: IELTS Advanced là draft, nên hy vọng 0 kết quả
        const res = await request(app).get('/api/courses').query({
            status: 'active',
            search: 'Advanced'
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.count).toBe(0);
    });

    // Test 6: Filter theo Program
    test('should filter courses by program', async () => {
        const program = await Program.findOne({ type: 'toeic' });
        const res = await request(app).get('/api/courses').query({ program: program._id.toString() });

        expect(res.statusCode).toBe(200);
        expect(res.body.count).toBe(1);
        expect(res.body.data[0].courseCode).toBe('TOEIC101');
    });

    // Test 7: Kiểm tra Populate (Xem có lấy được thông tin Program không)
    test('should populate program details', async () => {
        const res = await request(app).get('/api/courses');

        expect(res.statusCode).toBe(200);
        const course = res.body.data.find(c => c.courseCode === 'IELTS101');

        expect(course.program).toHaveProperty('program_name', 'IELTS Preparation');
        expect(course.program).toHaveProperty('code', 'IELTS-B1');
        expect(course.program).toHaveProperty('type', 'ielts');
    });

    // Test 8: Trả về mảng rỗng khi không có kết quả
    test('should return empty array when no courses match filters', async () => {
        const res = await request(app).get('/api/courses').query({ status: 'nonexistent' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(0);
        expect(res.body.count).toBe(0);
    });

    // Test 9: Xử lý lỗi (500)
    test('should return 500 if database fails', async () => {
        jest.spyOn(Course, 'find').mockImplementationOnce(() => {
            throw new Error('Database connection failed');
        });

        const res = await request(app).get('/api/courses');

        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Lỗi máy chủ');
    });
});

// ===========================
// TEST: getCourseById
// ===========================
describe('GET /api/courses/:id (getCourseById)', () => {

    // Test 1: Lấy course với ID hợp lệ và populate đầy đủ
    test('should return course with valid ID and populate all fields', async () => {
        const course = await Course.findOne({ courseCode: 'IELTS101' });

        const res = await request(app).get(`/api/courses/${course._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.courseCode).toBe('IELTS101');
        expect(res.body.data.name).toBe('IELTS Foundation');
        expect(res.body.data.learningType).toBe('offline');

        // Check populated fields
        expect(res.body.data.program).toBeDefined();
        expect(res.body.data.program.program_name).toBe('IELTS Preparation');
        expect(res.body.data.createdBy).toBeDefined();
        expect(res.body.data.createdBy.username).toBe('testuser');

        // Check CLOs
        expect(res.body.data.clos).toHaveLength(1);
        expect(res.body.data.clos[0].code).toBe('CLO1');
    });

    // Test 2: Trả về 404 khi course ID không tồn tại
    test('should return 404 when course ID does not exist', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app).get(`/api/courses/${nonExistentId}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Không tìm thấy giáo trình');
    });

    // Test 3: Trả về 404 cho ObjectId không hợp lệ
    test('should return 500 for invalid ObjectId format', async () => {
        const res = await request(app).get('/api/courses/invalid-id');

        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
    });

    // Test 4: Populate sessions và camSessions arrays
    test('should populate sessions and camSessions arrays', async () => {
        const course = await Course.findOne({ courseCode: 'IELTS101' });

        const res = await request(app).get(`/api/courses/${course._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        // Vì chưa tạo sessions trong test data, nên trả về mảng rỗng
        expect(res.body.data.sessions).toEqual([]);
        expect(res.body.data.camSessions).toEqual([]);
    });

    // Test 5: Xử lý course có CLOs rỗng
    test('should handle course with empty CLOs array', async () => {
        const course = await Course.findOne({ courseCode: 'IELTS202' });

        const res = await request(app).get(`/api/courses/${course._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.clos).toEqual([]);
    });
});

// ===========================
// TEST: createCourse
// ===========================
describe('POST /api/courses (createCourse)', () => {

    // Test 1: Tạo course thành công với dữ liệu hợp lệ
    test('should create course successfully with valid data', async () => {
        const program = await Program.findOne({ type: 'ielts' });
        const user = await User.findOne({ username: 'testuser' });

        const newCourse = {
            courseCode: 'IELTS303',
            name: 'IELTS Master',
            learningType: 'online',
            program: program._id.toString(),
            createdBy: user._id.toString(),
            description: 'Master level IELTS course',
            numberOfSessions: 40
        };

        const res = await request(app)
            .post('/api/courses')
            .send(newCourse);

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Tạo giáo trình thành công');
        expect(res.body.data.courseCode).toBe('IELTS303');
        expect(res.body.data.status).toBe('draft');
    });

    // Test 2: Trả về 400 khi thiếu courseCode
    test('should return 400 when courseCode is missing', async () => {
        const program = await Program.findOne({ type: 'ielts' });
        const user = await User.findOne({ username: 'testuser' });

        const newCourse = {
            name: 'IELTS Test',
            learningType: 'online',
            program: program._id.toString(),
            createdBy: user._id.toString()
        };

        const res = await request(app)
            .post('/api/courses')
            .send(newCourse);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Mã môn học, tên giáo trình và chương trình là bắt buộc');
    });

    // Test 3: Trả về 400 khi thiếu name
    test('should return 400 when name is missing', async () => {
        const program = await Program.findOne({ type: 'ielts' });
        const user = await User.findOne({ username: 'testuser' });

        const newCourse = {
            courseCode: 'TEST999',
            learningType: 'online',
            program: program._id.toString(),
            createdBy: user._id.toString()
        };

        const res = await request(app)
            .post('/api/courses')
            .send(newCourse);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    // Test 4: Trả về 400 khi thiếu createdBy
    test('should return 400 when createdBy is missing', async () => {
        const program = await Program.findOne({ type: 'ielts' });

        const newCourse = {
            courseCode: 'TEST999',
            name: 'Test Course',
            learningType: 'online',
            program: program._id.toString()
        };

        const res = await request(app)
            .post('/api/courses')
            .send(newCourse);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Thiếu thông tin người tạo (createdBy)');
    });

    // Test 5: Trả về 404 khi program không tồn tại
    test('should return 404 when program does not exist', async () => {
        const user = await User.findOne({ username: 'testuser' });

        const newCourse = {
            courseCode: 'TEST999',
            name: 'Test Course',
            learningType: 'online',
            program: new mongoose.Types.ObjectId().toString(),
            createdBy: user._id.toString()
        };

        const res = await request(app)
            .post('/api/courses')
            .send(newCourse);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Không tìm thấy chương trình');
    });

    // Test 6: Trả về 400 khi courseCode đã tồn tại
    test('should return 400 when courseCode already exists', async () => {
        const program = await Program.findOne({ type: 'ielts' });
        const user = await User.findOne({ username: 'testuser' });

        const newCourse = {
            courseCode: 'IELTS101', // Đã tồn tại
            name: 'Duplicate Course',
            learningType: 'online',
            program: program._id.toString(),
            createdBy: user._id.toString()
        };

        const res = await request(app)
            .post('/api/courses')
            .send(newCourse);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Mã môn học đã tồn tại');
    });

    // Test 7: Tạo course với CLOs
    test('should create course with CLOs successfully', async () => {
        const program = await Program.findOne({ type: 'ielts' });
        const user = await User.findOne({ username: 'testuser' });

        const newCourse = {
            courseCode: 'IELTS404',
            name: 'IELTS with CLOs',
            learningType: 'offline',
            program: program._id.toString(),
            createdBy: user._id.toString(),
            clos: [
                { code: 'CLO1', name: 'Reading', detail: 'Reading comprehension' },
                { code: 'CLO2', name: 'Writing', detail: 'Writing skills' }
            ]
        };

        const res = await request(app)
            .post('/api/courses')
            .send(newCourse);

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.clos).toHaveLength(2);
    });

    // Test 8: Trả về 400 khi CLO có mã trùng
    test('should return 400 when CLOs have duplicate codes', async () => {
        const program = await Program.findOne({ type: 'ielts' });
        const user = await User.findOne({ username: 'testuser' });

        const newCourse = {
            courseCode: 'IELTS505',
            name: 'Duplicate CLO Course',
            learningType: 'online',
            program: program._id.toString(),
            createdBy: user._id.toString(),
            clos: [
                { code: 'CLO1', name: 'Reading', detail: 'Reading skills' },
                { code: 'CLO1', name: 'Writing', detail: 'Writing skills' } // Trùng mã CLO1
            ]
        };

        const res = await request(app)
            .post('/api/courses')
            .send(newCourse);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('Mã CLO bị trùng');
    });

    // Test 9: Trả về 400 khi CLO thiếu trường bắt buộc
    test('should return 400 when CLO is missing required fields', async () => {
        const program = await Program.findOne({ type: 'ielts' });
        const user = await User.findOne({ username: 'testuser' });

        const newCourse = {
            courseCode: 'IELTS606',
            name: 'Invalid CLO Course',
            learningType: 'online',
            program: program._id.toString(),
            createdBy: user._id.toString(),
            clos: [
                { code: 'CLO1', name: 'Reading' } // Thiếu detail
            ]
        };

        const res = await request(app)
            .post('/api/courses')
            .send(newCourse);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Mỗi CLO phải có đầy đủ code, name và detail');
    });
});

// ===========================
// TEST: updateCourse
// ===========================
describe('PUT /api/courses/:id (updateCourse)', () => {

    // Test 1: Cập nhật course thành công
    test('should update course successfully', async () => {
        const course = await Course.findOne({ courseCode: 'IELTS101' });

        const updateData = {
            name: 'IELTS Foundation Updated',
            description: 'Updated description'
        };

        const res = await request(app)
            .put(`/api/courses/${course._id}`)
            .send(updateData);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Cập nhật giáo trình thành công');
        expect(res.body.data.name).toBe('IELTS Foundation Updated');
        expect(res.body.data.description).toBe('Updated description');
    });

    // Test 2: Trả về 404 khi course không tồn tại
    test('should return 404 when course does not exist', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .put(`/api/courses/${nonExistentId}`)
            .send({ name: 'Updated Name' });

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Không tìm thấy giáo trình');
    });

    // Test 3: Trả về 400 khi đổi courseCode sang mã đã tồn tại
    test('should return 400 when changing to existing courseCode', async () => {
        const course = await Course.findOne({ courseCode: 'IELTS101' });

        const res = await request(app)
            .put(`/api/courses/${course._id}`)
            .send({ courseCode: 'TOEIC101' }); // Đã tồn tại

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Mã môn học đã tồn tại');
    });

    // Test 4: Cập nhật status thành công
    test('should update course status successfully', async () => {
        const course = await Course.findOne({ courseCode: 'IELTS202' });

        const res = await request(app)
            .put(`/api/courses/${course._id}`)
            .send({ status: 'completed' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe('completed');
    });

    // Test 5: Cập nhật CLOs thành công
    test('should update CLOs successfully', async () => {
        const course = await Course.findOne({ courseCode: 'IELTS202' });

        const newClos = [
            { code: 'CLO1', name: 'New CLO', detail: 'New CLO detail' }
        ];

        const res = await request(app)
            .put(`/api/courses/${course._id}`)
            .send({ clos: newClos });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.clos).toHaveLength(1);
        expect(res.body.data.clos[0].code).toBe('CLO1');
    });

    // Test 6: Trả về 400 khi lastCompletedStep ngoài phạm vi
    test('should return 400 when lastCompletedStep is out of range', async () => {
        const course = await Course.findOne({ courseCode: 'IELTS101' });

        const res = await request(app)
            .put(`/api/courses/${course._id}`)
            .send({ lastCompletedStep: 10 });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('lastCompletedStep phải từ 0 đến 5');
    });
});

// ===========================
// TEST: deleteCourse
// ===========================
describe('DELETE /api/courses/:id (deleteCourse)', () => {

    // Test 1: Xóa course thành công
    test('should delete course successfully', async () => {
        const course = await Course.findOne({ courseCode: 'IELTS202' });

        const res = await request(app).delete(`/api/courses/${course._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Xóa giáo trình thành công');

        // Verify deletion
        const deletedCourse = await Course.findById(course._id);
        expect(deletedCourse).toBeNull();
    });

    // Test 2: Trả về 404 khi course không tồn tại
    test('should return 404 when course does not exist', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app).delete(`/api/courses/${nonExistentId}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Không tìm thấy giáo trình');
    });
});

// ===========================
// TEST: getAllTypes
// ===========================
describe('GET /api/courses/all-types (getAllTypes)', () => {

    // Test 1: Lấy tất cả types từ programs đã approved
    test('should return all unique types from approved programs', async () => {
        const res = await request(app).get('/api/courses/all-types');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.types).toBeDefined();
        expect(Array.isArray(res.body.types)).toBe(true);
        expect(res.body.types).toContain('ielts');
        expect(res.body.types).toContain('toeic');
    });

    // Test 2: Trả về mảng rỗng khi không có program approved
    test('should return empty array when no approved programs', async () => {
        await Program.updateMany({}, { status: 'draft' });

        const res = await request(app).get('/api/courses/all-types');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.types).toEqual([]);
    });
});

// ===========================
// TEST: getAllLevels
// ===========================
describe('GET /api/courses/all-levels (getAllLevels)', () => {

    // Test 1: Lấy tất cả levels từ programs đã approved
    test('should return all unique levels from approved programs', async () => {
        const res = await request(app).get('/api/courses/all-levels');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.levels).toBeDefined();
        expect(Array.isArray(res.body.levels)).toBe(true);
        expect(res.body.levels).toContain('B1');
        expect(res.body.levels).toContain('B2');
    });

    // Test 2: Levels được sắp xếp đúng thứ tự
    test('should return levels sorted in correct order', async () => {
        // Thêm program với các levels khác nhau
        const user = await User.findOne({ username: 'testuser' });
        await Program.create([
            { code: 'TEST-A1', program_name: 'Test A1', type: 'ielts', level: 'A1', status: 'approved', createdBy: user._id },
            { code: 'TEST-C1', program_name: 'Test C1', type: 'ielts', level: 'C1', status: 'approved', createdBy: user._id }
        ]);

        const res = await request(app).get('/api/courses/all-levels');

        expect(res.statusCode).toBe(200);
        const levels = res.body.levels;
        const levelOrder = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

        // Kiểm tra thứ tự
        for (let i = 0; i < levels.length - 1; i++) {
            const currentIndex = levelOrder.indexOf(levels[i]);
            const nextIndex = levelOrder.indexOf(levels[i + 1]);
            expect(currentIndex).toBeLessThanOrEqual(nextIndex);
        }
    });
});

// ===========================
// TEST: getLevelsByType
// ===========================
describe('GET /api/courses/levels (getLevelsByType)', () => {

    // Test 1: Lấy levels theo type
    test('should return levels for specific type', async () => {
        const res = await request(app).get('/api/courses/levels').query({ type: 'ielts' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.levels).toContain('B1');
    });

    // Test 2: Trả về 400 khi thiếu type
    test('should return 400 when type is missing', async () => {
        const res = await request(app).get('/api/courses/levels');

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Thiếu tham số type');
    });

    // Test 3: Trả về mảng rỗng khi type không có levels
    test('should return empty array when type has no approved programs', async () => {
        const res = await request(app).get('/api/courses/levels').query({ type: 'cam' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.levels).toEqual([]);
    });
});

// ===========================
// TEST: getCoursesByProgramId
// ===========================
describe('GET /api/courses/by-program-id (getCoursesByProgramId)', () => {

    // Test 1: Lấy courses theo program ID
    test('should return courses for specific program ID', async () => {
        const program = await Program.findOne({ type: 'ielts' });

        const res = await request(app)
            .get('/api/courses/by-program-id')
            .query({ programIds: program._id.toString() });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        // Chỉ trả về courses có status 'completed' hoặc 'active'
        expect(res.body.courses.length).toBeGreaterThanOrEqual(1);
    });

    // Test 2: Trả về 400 khi thiếu programIds
    test('should return 400 when programIds is missing', async () => {
        const res = await request(app).get('/api/courses/by-program-id');

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Thiếu tham số programIds');
    });

    // Test 3: Lấy courses theo nhiều program IDs
    test('should return courses for multiple program IDs', async () => {
        const programs = await Program.find();
        const programIds = programs.map(p => p._id.toString()).join(',');

        const res = await request(app)
            .get('/api/courses/by-program-id')
            .query({ programIds });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });
});

// ===========================
// TEST: archiveCourse
// ===========================
describe('PATCH /api/courses/:id/archive (archiveCourse)', () => {

    // Test 1: Lưu trữ course thành công
    test('should archive course successfully', async () => {
        const course = await Course.findOne({ courseCode: 'IELTS101' });

        const res = await request(app).patch(`/api/courses/${course._id}/archive`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Lưu trữ giáo trình thành công');
        expect(res.body.data.status).toBe('archived');
    });

    // Test 2: Trả về 404 khi course không tồn tại
    test('should return 404 when course does not exist', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app).patch(`/api/courses/${nonExistentId}/archive`);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Không tìm thấy giáo trình');
    });
});

// ===========================
// TEST: getProgramPLOs
// ===========================
describe('GET /api/courses/:id/program-plos (getProgramPLOs)', () => {

    // Test 1: Lấy PLOs của program thành công
    test('should return program PLOs successfully', async () => {
        const course = await Course.findOne({ courseCode: 'IELTS101' });

        const res = await request(app).get(`/api/courses/${course._id}/program-plos`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.programName).toBe('IELTS Preparation');
        expect(res.body.data.plos).toBeDefined();
        expect(res.body.data.plos.length).toBeGreaterThanOrEqual(1);
    });

    // Test 2: Trả về 404 khi course không tồn tại
    test('should return 404 when course does not exist', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app).get(`/api/courses/${nonExistentId}/program-plos`);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Không tìm thấy giáo trình');
    });
});

// ===========================
// TEST: activateCourse
// ===========================
describe('PATCH /api/courses/:id/activate (activateCourse)', () => {

    // Test 1: Activate course thành công với status completed
    test('should activate course with completed status', async () => {
        const course = await Course.findOne({ courseCode: 'TOEIC101' });

        const res = await request(app).patch(`/api/courses/${course._id}/activate`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Đã activate khóa học thành công');
        expect(res.body.course.isActive).toBe(true);
    });

    // Test 2: Trả về 400 khi course status là draft
    test('should return 400 when course status is draft', async () => {
        const course = await Course.findOne({ courseCode: 'IELTS202' });

        const res = await request(app).patch(`/api/courses/${course._id}/activate`);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('Không thể activate khóa học');
    });

    // Test 3: Trả về 404 khi course không tồn tại
    test('should return 404 when course does not exist', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app).patch(`/api/courses/${nonExistentId}/activate`);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Không tìm thấy khóa học');
    });
});

// ===========================
// TEST: getCourseMaterials
// ===========================
describe('GET /api/courses/:courseId/materials (getCourseMaterials)', () => {

    // Test 1: Lấy materials của course thành công (mảng rỗng)
    test('should return course materials successfully', async () => {
        const course = await Course.findOne({ courseCode: 'IELTS101' });

        const res = await request(app).get(`/api/courses/${course._id}/materials`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.courseName).toBe('IELTS Foundation');
        expect(res.body.materials).toBeDefined();
        expect(Array.isArray(res.body.materials)).toBe(true);
    });

    // Test 2: Trả về 404 khi course không tồn tại
    test('should return 404 when course does not exist', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app).get(`/api/courses/${nonExistentId}/materials`);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Không tìm thấy khóa học');
    });
});

// ===========================
// TEST: getBandByTypeAndLevel
// ===========================
describe('GET /api/courses/band (getBandByTypeAndLevel)', () => {

    // Test 1: Trả về 400 khi thiếu type
    test('should return 400 when type is missing', async () => {
        const res = await request(app).get('/api/courses/band').query({ level: 'B1' });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Thiếu tham số type hoặc level');
    });

    // Test 2: Trả về 400 khi thiếu level
    test('should return 400 when level is missing', async () => {
        const res = await request(app).get('/api/courses/band').query({ type: 'ielts' });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Thiếu tham số type hoặc level');
    });

    // Test 3: Trả về null khi không tìm thấy program phù hợp
    test('should return null band when no matching program found', async () => {
        const res = await request(app).get('/api/courses/band').query({
            type: 'cam',
            level: 'C2'
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.band).toBeNull();
    });
});

// ===========================
// TEST: getCourseMappings
// ===========================
describe('GET /api/courses/mappings (getCourseMappings)', () => {

    // Test 1: Lấy mappings từ programs active
    test('should return mappings from active programs', async () => {
        const res = await request(app).get('/api/courses/mappings');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.mappings).toBeDefined();
        expect(Array.isArray(res.body.mappings)).toBe(true);
    });
});

// ===========================
// TEST: getTypesByLevel
// ===========================
describe('GET /api/courses/types-by-level (getTypesByLevel)', () => {

    // Test 1: Lấy types theo level
    test('should return types for specific level', async () => {
        const res = await request(app).get('/api/courses/types-by-level').query({ level: 'B1' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.types).toContain('ielts');
    });

    // Test 2: Trả về 400 khi thiếu level
    test('should return 400 when level is missing', async () => {
        const res = await request(app).get('/api/courses/types-by-level');

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Thiếu tham số level');
    });
});
