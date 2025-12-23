const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const Program = require('../models/programModel');
const Course = require('../models/courseModel');
const User = require('../models/userModel');
const Session = require('../models/sessionModel');
const CamSession = require('../models/camSession');

jest.setTimeout(10000);

let mongoServer;

// Kết nối DB ảo trước tất cả các test
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
    await Program.deleteMany();
    await Course.deleteMany();
    await User.deleteMany();

    // Seeding data

    // Tạo User
    const testUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        address: 'Test Address',
        roleId: new mongoose.Types.ObjectId()
    });

    // Tạo Programs
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

    const programDraft = await Program.create({
        program_name: 'CAM Program Draft',
        code: 'CAM-A1',
        type: 'cam',
        level: 'A1',
        band: 'Starters',
        status: 'draft',
        isActive: false,
        createdBy: testUser._id,
        plos: []
    });

    // Tạo các Course cho programs
    await Course.create([
        {
            name: 'IELTS Foundation',
            courseCode: 'IELTS101',
            learningType: 'offline',
            status: 'completed',
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

// ===========================
// TEST: getAllPrograms
// ===========================
describe('GET /api/programs (getAllPrograms)', () => {

    // Test 1: Lấy tất cả programs (không bao gồm draft, needs_revision, pending_approval)
    test('should return all programs excluding draft/needs_revision/pending_approval', async () => {
        const res = await request(app).get('/api/programs');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        // Chỉ trả về 2 programs approved (không trả về draft)
        expect(res.body.count).toBe(2);
        expect(res.body.data.length).toBe(2);
    });

    // Test 2: Kiểm tra populate createdBy
    test('should populate createdBy details', async () => {
        const res = await request(app).get('/api/programs');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        const program = res.body.data.find(p => p.code === 'IELTS-B1');

        expect(program.createdBy).toBeDefined();
        expect(program.createdBy.username).toBe('testuser');
        expect(program.createdBy.email).toBe('test@example.com');
    });

    // Test 3: Kiểm tra courseCount trong response
    test('should include courseCount for each program', async () => {
        const res = await request(app).get('/api/programs');

        expect(res.statusCode).toBe(200);
        const ieltsProgram = res.body.data.find(p => p.code === 'IELTS-B1');
        const toeicProgram = res.body.data.find(p => p.code === 'TOEIC-B2');

        expect(ieltsProgram.courseCount).toBe(2);
        expect(toeicProgram.courseCount).toBe(1);
    });

    // Test 4: Trả về mảng rỗng khi không có program approved
    test('should return empty array when no approved programs', async () => {
        await Program.updateMany({}, { status: 'draft' });

        const res = await request(app).get('/api/programs');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(0);
        expect(res.body.count).toBe(0);
    });

    // Test 5: Xử lý lỗi (500)
    test('should return 500 if database fails', async () => {
        jest.spyOn(Program, 'find').mockImplementationOnce(() => {
            throw new Error('Database connection failed');
        });

        const res = await request(app).get('/api/programs');

        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Lỗi khi lấy danh sách chương trình');
    });
});

// ===========================
// TEST: getMyPrograms
// ===========================
describe('GET /api/programs/my-programs (getMyPrograms)', () => {

    // Test 1: Lấy programs của teacher theo teacherId trong query
    test('should return programs created by specific teacher', async () => {
        const user = await User.findOne({ username: 'testuser' });

        const res = await request(app)
            .get('/api/programs/my-programs')
            .query({ teacherId: user._id.toString() });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.count).toBe(3); // Tất cả 3 programs đều do testuser tạo
    });

    // Test 2: Trả về mảng rỗng khi không có teacherId
    test('should return empty array when no teacherId provided', async () => {
        const res = await request(app).get('/api/programs/my-programs');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(0);
        expect(res.body.message).toBe('Chưa có thông tin teacher để lọc');
    });

    // Test 3: Trả về mảng rỗng khi teacherId không có programs
    test('should return empty array when teacher has no programs', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .get('/api/programs/my-programs')
            .query({ teacherId: nonExistentId.toString() });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(0);
    });

    // Test 4: Kiểm tra courseCount trong response
    test('should include courseCount for each program', async () => {
        const user = await User.findOne({ username: 'testuser' });

        const res = await request(app)
            .get('/api/programs/my-programs')
            .query({ teacherId: user._id.toString() });

        expect(res.statusCode).toBe(200);
        const ieltsProgram = res.body.data.find(p => p.code === 'IELTS-B1');

        expect(ieltsProgram.courseCount).toBe(2);
    });
});

// ===========================
// TEST: getProgramById
// ===========================
describe('GET /api/programs/:id (getProgramById)', () => {

    // Test 1: Lấy program với ID hợp lệ
    test('should return program with valid ID', async () => {
        const program = await Program.findOne({ code: 'IELTS-B1' });

        const res = await request(app).get(`/api/programs/${program._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.code).toBe('IELTS-B1');
        expect(res.body.data.program_name).toBe('IELTS Preparation');
        expect(res.body.data.type).toBe('ielts');
    });

    // Test 2: Kiểm tra populate createdBy
    test('should populate createdBy details', async () => {
        const program = await Program.findOne({ code: 'IELTS-B1' });

        const res = await request(app).get(`/api/programs/${program._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.createdBy).toBeDefined();
        expect(res.body.data.createdBy.username).toBe('testuser');
    });

    // Test 3: Kiểm tra courses được trả về
    test('should include courses belonging to program', async () => {
        const program = await Program.findOne({ code: 'IELTS-B1' });

        const res = await request(app).get(`/api/programs/${program._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.courses).toBeDefined();
        expect(res.body.data.courses.length).toBe(2);
    });

    // Test 4: Trả về 404 khi program không tồn tại
    test('should return 404 when program does not exist', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app).get(`/api/programs/${nonExistentId}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Không tìm thấy chương trình');
    });

    // Test 5: Trả về 500 cho ObjectId không hợp lệ
    test('should return 500 for invalid ObjectId format', async () => {
        const res = await request(app).get('/api/programs/invalid-id');

        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
    });
});

// ===========================
// TEST: createProgram
// ===========================
describe('POST /api/programs (createProgram)', () => {

    // Test 1: Tạo program thành công với dữ liệu hợp lệ
    test('should create program successfully with valid data', async () => {
        const user = await User.findOne({ username: 'testuser' });

        const newProgram = {
            code: 'IELTS-C1',
            program_name: 'IELTS Advanced Master',
            type: 'ielts',
            level: 'C1',
            description: 'Advanced IELTS program',
            createdBy: user._id.toString()
        };

        const res = await request(app)
            .post('/api/programs')
            .send(newProgram);

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Tạo chương trình thành công');
        expect(res.body.data.code).toBe('IELTS-C1');
        expect(res.body.data.status).toBe('draft');
    });

    // Test 2: Trả về 400 khi thiếu code
    test('should return 400 when code is missing', async () => {
        const user = await User.findOne({ username: 'testuser' });

        const newProgram = {
            program_name: 'Test Program',
            type: 'ielts',
            level: 'B1',
            createdBy: user._id.toString()
        };

        const res = await request(app)
            .post('/api/programs')
            .send(newProgram);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Mã chương trình, tên, loại và cấp độ là bắt buộc');
    });

    // Test 3: Trả về 400 khi thiếu program_name
    test('should return 400 when program_name is missing', async () => {
        const user = await User.findOne({ username: 'testuser' });

        const newProgram = {
            code: 'TEST-B1',
            type: 'ielts',
            level: 'B1',
            createdBy: user._id.toString()
        };

        const res = await request(app)
            .post('/api/programs')
            .send(newProgram);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    // Test 4: Trả về 400 khi thiếu createdBy
    test('should return 400 when createdBy is missing', async () => {
        const newProgram = {
            code: 'TEST-B1',
            program_name: 'Test Program',
            type: 'ielts',
            level: 'B1'
        };

        const res = await request(app)
            .post('/api/programs')
            .send(newProgram);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Thiếu thông tin người tạo (createdBy)');
    });

    // Test 5: Trả về 400 khi code đã tồn tại
    test('should return 400 when code already exists', async () => {
        const user = await User.findOne({ username: 'testuser' });

        const newProgram = {
            code: 'IELTS-B1', // Đã tồn tại
            program_name: 'Duplicate Program',
            type: 'ielts',
            level: 'B1',
            createdBy: user._id.toString()
        };

        const res = await request(app)
            .post('/api/programs')
            .send(newProgram);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Mã chương trình đã tồn tại');
    });

    // Test 6: Tạo program với PLOs
    test('should create program with PLOs successfully', async () => {
        const user = await User.findOne({ username: 'testuser' });

        const newProgram = {
            code: 'IELTS-A2',
            program_name: 'IELTS Beginner',
            type: 'ielts',
            level: 'A2',
            createdBy: user._id.toString(),
            plos: [
                { code: 'PLO1', name: 'Reading', detail: 'Reading comprehension' },
                { code: 'PLO2', name: 'Writing', detail: 'Writing skills' }
            ]
        };

        const res = await request(app)
            .post('/api/programs')
            .send(newProgram);

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.plos).toHaveLength(2);
    });

    // Test 7: Trả về 400 khi PLOs có mã trùng
    test('should return 400 when PLOs have duplicate codes', async () => {
        const user = await User.findOne({ username: 'testuser' });

        const newProgram = {
            code: 'TEST-PLO',
            program_name: 'Test PLO Program',
            type: 'ielts',
            level: 'B1',
            createdBy: user._id.toString(),
            plos: [
                { code: 'PLO1', name: 'Reading', detail: 'Reading skills' },
                { code: 'PLO1', name: 'Writing', detail: 'Writing skills' } // Trùng mã
            ]
        };

        const res = await request(app)
            .post('/api/programs')
            .send(newProgram);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('Mã PLO bị trùng');
    });

    // Test 8: Trả về 400 khi PLO thiếu trường bắt buộc
    test('should return 400 when PLO is missing required fields', async () => {
        const user = await User.findOne({ username: 'testuser' });

        const newProgram = {
            code: 'TEST-PLO2',
            program_name: 'Test PLO Program 2',
            type: 'ielts',
            level: 'B1',
            createdBy: user._id.toString(),
            plos: [
                { code: 'PLO1', name: 'Reading' } // Thiếu detail
            ]
        };

        const res = await request(app)
            .post('/api/programs')
            .send(newProgram);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Mỗi PLO phải có đầy đủ code, name và detail');
    });

    // Test 9: Tự động tính band khi không cung cấp
    test('should auto-calculate band when not provided', async () => {
        const user = await User.findOne({ username: 'testuser' });

        const newProgram = {
            code: 'IELTS-B2-NEW',
            program_name: 'IELTS B2 New',
            type: 'ielts',
            level: 'B2',
            createdBy: user._id.toString()
        };

        const res = await request(app)
            .post('/api/programs')
            .send(newProgram);

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.band).toBeDefined();
    });
});

// ===========================
// TEST: updateProgram
// ===========================
describe('PUT /api/programs/:id (updateProgram)', () => {

    // Test 1: Cập nhật program thành công
    test('should update program successfully', async () => {
        const program = await Program.findOne({ code: 'IELTS-B1' });

        const updateData = {
            program_name: 'IELTS Preparation Updated',
            description: 'Updated description'
        };

        const res = await request(app)
            .put(`/api/programs/${program._id}`)
            .send(updateData);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Cập nhật chương trình thành công');
        expect(res.body.data.program_name).toBe('IELTS Preparation Updated');
        expect(res.body.data.description).toBe('Updated description');
    });

    // Test 2: Trả về 404 khi program không tồn tại
    test('should return 404 when program does not exist', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .put(`/api/programs/${nonExistentId}`)
            .send({ program_name: 'Updated Name' });

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Không tìm thấy chương trình');
    });

    // Test 3: Trả về 400 khi đổi code sang mã đã tồn tại
    test('should return 400 when changing to existing code', async () => {
        const program = await Program.findOne({ code: 'IELTS-B1' });

        const res = await request(app)
            .put(`/api/programs/${program._id}`)
            .send({ code: 'TOEIC-B2' }); // Đã tồn tại

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Mã chương trình đã tồn tại');
    });

    // Test 4: Cập nhật PLOs thành công
    test('should update PLOs successfully', async () => {
        const program = await Program.findOne({ code: 'CAM-A1' });

        const newPlos = [
            { code: 'PLO1', name: 'New PLO', detail: 'New PLO detail' }
        ];

        const res = await request(app)
            .put(`/api/programs/${program._id}`)
            .send({ plos: newPlos });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.plos).toHaveLength(1);
        expect(res.body.data.plos[0].code).toBe('PLO1');
    });

    // Test 5: Trả về 400 khi PLOs có mã trùng
    test('should return 400 when updating with duplicate PLO codes', async () => {
        const program = await Program.findOne({ code: 'IELTS-B1' });

        const res = await request(app)
            .put(`/api/programs/${program._id}`)
            .send({
                plos: [
                    { code: 'PLO1', name: 'Reading', detail: 'Reading skills' },
                    { code: 'PLO1', name: 'Writing', detail: 'Writing skills' }
                ]
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('Mã PLO bị trùng');
    });

    // Test 6: Tự động tính lại band khi thay đổi type hoặc level
    test('should auto-recalculate band when type or level changes', async () => {
        const program = await Program.findOne({ code: 'IELTS-B1' });

        const res = await request(app)
            .put(`/api/programs/${program._id}`)
            .send({ level: 'C1' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.level).toBe('C1');
        expect(res.body.data.band).toBeDefined();
    });
});

// ===========================
// TEST: deleteProgram
// ===========================
describe('DELETE /api/programs/:id (deleteProgram)', () => {

    // Test 1: Xóa program draft thành công
    test('should delete draft program successfully', async () => {
        const program = await Program.findOne({ code: 'CAM-A1' });

        const res = await request(app).delete(`/api/programs/${program._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Đã xóa chương trình và toàn bộ dữ liệu liên quan thành công');

        // Verify deletion
        const deletedProgram = await Program.findById(program._id);
        expect(deletedProgram).toBeNull();
    });

    // Test 2: Trả về 404 khi program không tồn tại
    test('should return 404 when program does not exist', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app).delete(`/api/programs/${nonExistentId}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Không tìm thấy chương trình');
    });

    // Test 3: Trả về 400 khi xóa program không phải draft
    test('should return 400 when deleting non-draft program', async () => {
        const program = await Program.findOne({ code: 'IELTS-B1' }); // status: approved

        const res = await request(app).delete(`/api/programs/${program._id}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('Không thể xóa chương trình này');
    });

    // Test 4: Xóa cascade - xóa cả courses liên quan
    test('should delete related courses when deleting program', async () => {
        // Tạo program mới và course
        const user = await User.findOne({ username: 'testuser' });
        const newProgram = await Program.create({
            program_name: 'Delete Test',
            code: 'DELETE-TEST',
            type: 'ielts',
            level: 'A1',
            status: 'draft',
            createdBy: user._id
        });

        await Course.create({
            name: 'Course to Delete',
            courseCode: 'DEL101',
            learningType: 'online',
            status: 'draft',
            program: newProgram._id,
            createdBy: user._id
        });

        const res = await request(app).delete(`/api/programs/${newProgram._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.deletedData.courses).toBe(1);

        // Verify course is deleted
        const course = await Course.findOne({ courseCode: 'DEL101' });
        expect(course).toBeNull();
    });
});

// ===========================
// TEST: getProgramPLOs
// ===========================
describe('GET /api/programs/:id/plos (getProgramPLOs)', () => {

    // Test 1: Lấy PLOs của program thành công
    test('should return program PLOs successfully', async () => {
        const program = await Program.findOne({ code: 'IELTS-B1' });

        const res = await request(app).get(`/api/programs/${program._id}/plos`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.length).toBe(2);
        expect(res.body.data[0].code).toBe('PLO1');
    });

    // Test 2: Trả về 404 khi program không tồn tại
    test('should return 404 when program does not exist', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app).get(`/api/programs/${nonExistentId}/plos`);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Không tìm thấy chương trình');
    });

    // Test 3: Trả về mảng rỗng khi program không có PLOs
    test('should return empty array when program has no PLOs', async () => {
        const program = await Program.findOne({ code: 'CAM-A1' });

        const res = await request(app).get(`/api/programs/${program._id}/plos`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual([]);
    });
});

// ===========================
// TEST: getProgramSubmissionStatus
// ===========================
describe('GET /api/programs/:id/submission-status (getProgramSubmissionStatus)', () => {

    // Test 1: Kiểm tra submission status của program có thể submit
    test('should return canSubmit=true for valid draft program', async () => {
        const user = await User.findOne({ username: 'testuser' });

        // Tạo program draft với PLOs và course completed
        const program = await Program.create({
            program_name: 'Submittable Program',
            code: 'SUBMIT-TEST',
            type: 'ielts',
            level: 'B1',
            status: 'draft',
            createdBy: user._id,
            plos: [{ code: 'PLO1', name: 'Test', detail: 'Test detail' }]
        });

        await Course.create({
            name: 'Completed Course',
            courseCode: 'COMP101',
            learningType: 'online',
            status: 'completed',
            program: program._id,
            createdBy: user._id
        });

        const res = await request(app).get(`/api/programs/${program._id}/submission-status`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.canSubmit).toBe(true);
        expect(res.body.data.totalCourses).toBe(1);
        expect(res.body.data.completedCourses).toBe(1);
    });

    // Test 2: Trả về canSubmit=false khi program không có PLOs
    test('should return canSubmit=false when program has no PLOs', async () => {
        const program = await Program.findOne({ code: 'CAM-A1' });

        const res = await request(app).get(`/api/programs/${program._id}/submission-status`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.canSubmit).toBe(false);
        expect(res.body.data.hasPLOs).toBe(false);
    });

    // Test 3: Trả về 404 khi program không tồn tại
    test('should return 404 when program does not exist', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app).get(`/api/programs/${nonExistentId}/submission-status`);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Không tìm thấy chương trình');
    });

    // Test 4: Trả về canSubmit=false khi còn courses draft
    test('should return canSubmit=false when has draft courses', async () => {
        const user = await User.findOne({ username: 'testuser' });

        const program = await Program.create({
            program_name: 'Has Draft Courses',
            code: 'DRAFT-COURSE',
            type: 'ielts',
            level: 'B1',
            status: 'draft',
            createdBy: user._id,
            plos: [{ code: 'PLO1', name: 'Test', detail: 'Test detail' }]
        });

        await Course.create({
            name: 'Draft Course',
            courseCode: 'DRAFT101',
            learningType: 'online',
            status: 'draft',
            program: program._id,
            createdBy: user._id
        });

        const res = await request(app).get(`/api/programs/${program._id}/submission-status`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.canSubmit).toBe(false);
        expect(res.body.data.draftCourses.length).toBe(1);
    });
});

// ===========================
// TEST: updateProgramActiveStatus
// ===========================
describe('PATCH /api/programs/:id/active (updateProgramActiveStatus)', () => {

    // Test 1: Cập nhật isActive thành công cho program approved
    test('should update isActive successfully for approved program', async () => {
        const program = await Program.findOne({ code: 'IELTS-B1' });

        const res = await request(app)
            .patch(`/api/programs/${program._id}/active`)
            .send({ isActive: false });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.isActive).toBe(false);
    });

    // Test 2: Trả về 400 khi isActive không phải boolean
    test('should return 400 when isActive is not boolean', async () => {
        const program = await Program.findOne({ code: 'IELTS-B1' });

        const res = await request(app)
            .patch(`/api/programs/${program._id}/active`)
            .send({ isActive: 'true' }); // String thay vì boolean

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('isActive phải là true hoặc false');
    });

    // Test 3: Trả về 404 khi program không tồn tại
    test('should return 404 when program does not exist', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .patch(`/api/programs/${nonExistentId}/active`)
            .send({ isActive: true });

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Không tìm thấy chương trình');
    });

    // Test 4: Trả về 400 khi program chưa approved
    test('should return 400 when program is not approved', async () => {
        const program = await Program.findOne({ code: 'CAM-A1' }); // status: draft

        const res = await request(app)
            .patch(`/api/programs/${program._id}/active`)
            .send({ isActive: true });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Chỉ có thể thay đổi trạng thái hoạt động của chương trình đã được duyệt');
    });
});

// ===========================
// TEST: getBandOptions
// ===========================
describe('GET /api/programs/band-options/:type (getBandOptions)', () => {

    // Test 1: Lấy band options cho IELTS
    test('should return band options for ielts', async () => {
        const res = await request(app).get('/api/programs/band-options/ielts');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.type).toBe('ielts');
        expect(res.body.data.bandOptions).toBeDefined();
    });

    // Test 2: Lấy band options cho TOEIC
    test('should return band options for toeic', async () => {
        const res = await request(app).get('/api/programs/band-options/toeic');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.type).toBe('toeic');
    });

    // Test 3: Lấy band options cho CAM
    test('should return band options for cam', async () => {
        const res = await request(app).get('/api/programs/band-options/cam');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.type).toBe('cam');
    });

    // Test 4: Trả về 400 cho type không hợp lệ
    test('should return 400 for invalid type', async () => {
        const res = await request(app).get('/api/programs/band-options/invalid');

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Type không hợp lệ. Chỉ chấp nhận: ielts, toeic, cam');
    });
});

// ===========================
// TEST: canDeactivateProgram
// ===========================
describe('GET /api/programs/:id/can-deactivate (canDeactivateProgram)', () => {

    // Test 1: Trả về canDeactivate=true khi tất cả courses đã inactive
    test('should return canDeactivate=true when all courses are inactive', async () => {
        const program = await Program.findOne({ code: 'IELTS-B1' });

        // Deactivate tất cả courses
        await Course.updateMany({ program: program._id }, { isActive: false });

        const res = await request(app).get(`/api/programs/${program._id}/can-deactivate`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.canDeactivate).toBe(true);
    });

    // Test 2: Trả về canDeactivate=false khi còn courses active
    test('should return canDeactivate=false when has active courses', async () => {
        const program = await Program.findOne({ code: 'IELTS-B1' });

        const res = await request(app).get(`/api/programs/${program._id}/can-deactivate`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.canDeactivate).toBe(false);
        expect(res.body.activeCourses).toBeDefined();
    });

    // Test 3: Trả về 404 khi program không tồn tại
    test('should return 404 when program does not exist', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app).get(`/api/programs/${nonExistentId}/can-deactivate`);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Không tìm thấy chương trình đào tạo');
    });

    // Test 4: Trả về canDeactivate=true khi program đã inactive
    test('should return canDeactivate=true when program already inactive', async () => {
        const program = await Program.findOne({ code: 'CAM-A1' }); // isActive: false

        const res = await request(app).get(`/api/programs/${program._id}/can-deactivate`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.canDeactivate).toBe(true);
    });
});

// ===========================
// TEST: deactivateProgram
// ===========================
describe('PATCH /api/programs/:id/deactivate (deactivateProgram)', () => {

    // Test 1: Deactivate program thành công khi tất cả courses inactive
    test('should deactivate program successfully when all courses inactive', async () => {
        const program = await Program.findOne({ code: 'IELTS-B1' });

        // Deactivate tất cả courses trước
        await Course.updateMany({ program: program._id }, { isActive: false });

        const res = await request(app).patch(`/api/programs/${program._id}/deactivate`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.program.isActive).toBe(false);
    });

    // Test 2: Trả về 400 khi còn courses active và không có force
    test('should return 400 when has active courses without force', async () => {
        const program = await Program.findOne({ code: 'IELTS-B1' });

        const res = await request(app).patch(`/api/programs/${program._id}/deactivate`);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('Không thể deactivate');
    });

    // Test 3: Deactivate với force=true
    test('should deactivate program with force=true', async () => {
        const program = await Program.findOne({ code: 'IELTS-B1' });

        const res = await request(app)
            .patch(`/api/programs/${program._id}/deactivate`)
            .send({ force: true });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.program.isActive).toBe(false);
        expect(res.body.coursesDeactivated).toBeGreaterThan(0);
    });

    // Test 4: Trả về 404 khi program không tồn tại
    test('should return 404 when program does not exist', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app).patch(`/api/programs/${nonExistentId}/deactivate`);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
    });

    // Test 5: Trả về 400 khi program đã inactive
    test('should return 400 when program already inactive', async () => {
        const program = await Program.findOne({ code: 'CAM-A1' });

        const res = await request(app).patch(`/api/programs/${program._id}/deactivate`);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Chương trình đào tạo đã ở trạng thái inactive');
    });
});

// ===========================
// TEST: activateProgram
// ===========================
describe('PATCH /api/programs/:id/activate (activateProgram)', () => {

    // Test 1: Activate program approved thành công
    test('should activate approved program successfully', async () => {
        const program = await Program.findOne({ code: 'IELTS-B1' });

        // Deactivate trước
        await Program.findByIdAndUpdate(program._id, { isActive: false });

        const res = await request(app).patch(`/api/programs/${program._id}/activate`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.program.isActive).toBe(true);
    });

    // Test 2: Trả về 400 khi program chưa approved
    test('should return 400 when program is not approved', async () => {
        const program = await Program.findOne({ code: 'CAM-A1' }); // status: draft

        const res = await request(app).patch(`/api/programs/${program._id}/activate`);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('Không thể activate chương trình');
    });

    // Test 3: Trả về 404 khi program không tồn tại
    test('should return 404 when program does not exist', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app).patch(`/api/programs/${nonExistentId}/activate`);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Không tìm thấy chương trình đào tạo');
    });
});
