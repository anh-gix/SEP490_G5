const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const WorkRequest = require('../models/workRequestModel');
const Program = require('../models/programModel');
const Course = require('../models/courseModel');
const Exam = require('../models/examModel');
const User = require('../models/userModel');
const Role = require('../models/roleModel');

jest.setTimeout(30000);

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
    await WorkRequest.deleteMany();
    await Program.deleteMany();
    await Course.deleteMany();
    await User.deleteMany();
    await Role.deleteMany();
    if (mongoose.models.Exam) {
        await Exam.deleteMany();
    }

    // Seeding data

    // Tạo Roles
    const centerHeadRole = await Role.create({
        name: 'center_head',
        description: 'Center Head role'
    });

    const subjectLeaderRole = await Role.create({
        name: 'subject_leader',
        description: 'Subject Leader role'
    });

    // Tạo Users
    const centerHead = await User.create({
        username: 'center_head',
        email: 'centerhead@example.com',
        password: 'password123',
        phone: '0123456789',
        address: 'Center Head Address',
        roleId: centerHeadRole._id
    });

    const subjectLeader = await User.create({
        username: 'subject_leader',
        email: 'subjectleader@example.com',
        password: 'password123',
        phone: '0987654321',
        address: 'Subject Leader Address',
        roleId: subjectLeaderRole._id
    });

    // Tạo Program draft (có thể submit)
    const programDraft = await Program.create({
        program_name: 'Draft Program',
        code: 'DRAFT-001',
        type: 'ielts',
        level: 'B1',
        band: '4.0-5.0',
        status: 'draft',
        isActive: false,
        createdBy: subjectLeader._id,
        plos: [
            { code: 'PLO1', name: 'Listening', detail: 'Listening skills' }
        ]
    });

    // Tạo Course completed cho program draft
    await Course.create({
        name: 'IELTS Course',
        courseCode: 'IELTS101',
        learningType: 'offline',
        status: 'completed',
        isActive: true,
        program: programDraft._id,
        createdBy: subjectLeader._id,
        description: 'IELTS Course',
        numberOfSessions: 20
    });

    // Tạo Program approved (có thể tạo edit request)
    const programApproved = await Program.create({
        program_name: 'Approved Program',
        code: 'APPROVED-001',
        type: 'toeic',
        level: 'B2',
        band: '701-900',
        status: 'approved',
        isActive: true,
        createdBy: subjectLeader._id,
        plos: [
            { code: 'PLO1', name: 'Business English', detail: 'Business skills' }
        ]
    });

    // Tạo Course cho approved program
    await Course.create({
        name: 'TOEIC Course',
        courseCode: 'TOEIC101',
        learningType: 'online',
        status: 'completed',
        isActive: true,
        program: programApproved._id,
        createdBy: subjectLeader._id,
        description: 'TOEIC Course',
        numberOfSessions: 25
    });

    // Tạo WorkRequest pending (bottom-up)
    await WorkRequest.create({
        direction: 'bottom_up',
        requestType: 'program',
        entityType: 'Program',
        entityId: programApproved._id,
        requestedBy: subjectLeader._id,
        status: 'pending',
        requestNote: 'Please approve this program',
        history: [{
            action: 'submitted',
            performedBy: subjectLeader._id,
            performedAt: new Date()
        }]
    });

    // Tạo WorkRequest top-down pending
    await WorkRequest.create({
        direction: 'top_down',
        requestType: 'create_program',
        requestedBy: centerHead._id,
        assignedTo: subjectLeader._id,
        status: 'pending',
        requestNote: 'Please create a new CAM program',
        history: [{
            action: 'assigned',
            performedBy: centerHead._id,
            performedAt: new Date()
        }]
    });
});

// ===========================
// TEST: getAllRequests
// ===========================
describe('GET /api/work-requests (getAllRequests)', () => {

    // Test 1: Lấy tất cả work requests
    test('should return all work requests', async () => {
        const res = await request(app).get('/api/work-requests');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBe(2);
        expect(res.body.pagination).toBeDefined();
    });

    // Test 2: Filter theo direction
    test('should filter by direction', async () => {
        const res = await request(app)
            .get('/api/work-requests')
            .query({ direction: 'bottom_up' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].direction).toBe('bottom_up');
    });

    // Test 3: Filter theo status
    test('should filter by status', async () => {
        const res = await request(app)
            .get('/api/work-requests')
            .query({ status: 'pending' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.every(r => r.status === 'pending')).toBe(true);
    });

    // Test 4: Filter theo requestType
    test('should filter by requestType', async () => {
        const res = await request(app)
            .get('/api/work-requests')
            .query({ requestType: 'program' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBe(1);
    });

    // Test 5: Pagination
    test('should support pagination', async () => {
        const res = await request(app)
            .get('/api/work-requests')
            .query({ page: 1, limit: 1 });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBe(1);
        expect(res.body.pagination.page).toBe(1);
        expect(res.body.pagination.limit).toBe(1);
        expect(res.body.pagination.totalPages).toBe(2);
    });

    // Test 6: Kiểm tra populate
    test('should populate user details', async () => {
        const res = await request(app).get('/api/work-requests');

        expect(res.statusCode).toBe(200);
        expect(res.body.data[0].requestedBy).toBeDefined();
    });
});

// ===========================
// TEST: getRequestById
// ===========================
describe('GET /api/work-requests/:id (getRequestById)', () => {

    // Test 1: Lấy request với ID hợp lệ
    test('should return request with valid ID', async () => {
        const workRequest = await WorkRequest.findOne({ requestType: 'program' });

        const res = await request(app).get(`/api/work-requests/${workRequest._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.requestType).toBe('program');
    });

    // Test 2: Trả về 404 khi request không tồn tại
    test('should return 404 when request does not exist', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app).get(`/api/work-requests/${nonExistentId}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Work request not found');
    });

    // Test 3: Trả về 500 cho ObjectId không hợp lệ
    test('should return 500 for invalid ObjectId format', async () => {
        const res = await request(app).get('/api/work-requests/invalid-id');

        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
    });
});

// ===========================
// TEST: getMyRequests
// ===========================
describe('GET /api/work-requests/my-requests (getMyRequests)', () => {

    // Test 1: Lấy requests của user
    test('should return requests created by user', async () => {
        const subjectLeader = await User.findOne({ username: 'subject_leader' });

        const res = await request(app)
            .get('/api/work-requests/my-requests')
            .query({ userId: subjectLeader._id.toString() });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBe(1);
    });

    // Test 2: Trả về 400 khi thiếu userId
    test('should return 400 when userId is missing', async () => {
        const res = await request(app).get('/api/work-requests/my-requests');

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('userId is required in query parameters');
    });

    // Test 3: Filter theo status
    test('should filter by status', async () => {
        const subjectLeader = await User.findOne({ username: 'subject_leader' });

        const res = await request(app)
            .get('/api/work-requests/my-requests')
            .query({ userId: subjectLeader._id.toString(), status: 'pending' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });
});

// ===========================
// TEST: getAssignedToMe
// ===========================
describe('GET /api/work-requests/assigned-to-me (getAssignedToMe)', () => {

    // Test 1: Lấy requests được assign cho user
    test('should return requests assigned to user', async () => {
        const subjectLeader = await User.findOne({ username: 'subject_leader' });

        const res = await request(app)
            .get('/api/work-requests/assigned-to-me')
            .query({ userId: subjectLeader._id.toString() });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].requestType).toBe('create_program');
    });

    // Test 2: Trả về 400 khi thiếu userId
    test('should return 400 when userId is missing', async () => {
        const res = await request(app).get('/api/work-requests/assigned-to-me');

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('userId is required in query parameters');
    });

    // Test 3: Trả về mảng rỗng khi không có requests được assign
    test('should return empty array when no assigned requests', async () => {
        const centerHead = await User.findOne({ username: 'center_head' });

        const res = await request(app)
            .get('/api/work-requests/assigned-to-me')
            .query({ userId: centerHead._id.toString() });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBe(0);
    });
});

// ===========================
// TEST: submitProgram
// ===========================
describe('POST /api/work-requests/submit/program/:programId (submitProgram)', () => {

    // Test 1: Submit program thành công
    test('should submit program successfully', async () => {
        const program = await Program.findOne({ code: 'DRAFT-001' });
        const subjectLeader = await User.findOne({ username: 'subject_leader' });

        const res = await request(app)
            .post(`/api/work-requests/submit/program/${program._id}`)
            .send({
                userId: subjectLeader._id.toString(),
                note: 'Please review this program'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Program submitted for approval successfully');

        // Verify program status updated
        const updatedProgram = await Program.findById(program._id);
        expect(updatedProgram.status).toBe('pending_approval');
    });

    // Test 2: Trả về 400 khi thiếu userId
    test('should return 400 when userId is missing', async () => {
        const program = await Program.findOne({ code: 'DRAFT-001' });

        const res = await request(app)
            .post(`/api/work-requests/submit/program/${program._id}`)
            .send({ note: 'Test note' });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('userId is required in request body');
    });

    // Test 3: Trả về 500 khi program không tồn tại
    test('should return 500 when program does not exist', async () => {
        const subjectLeader = await User.findOne({ username: 'subject_leader' });
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .post(`/api/work-requests/submit/program/${nonExistentId}`)
            .send({ userId: subjectLeader._id.toString() });

        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
    });

    // Test 4: Trả về 500 khi program không ở trạng thái submittable
    test('should return 500 when program is not in submittable state', async () => {
        const program = await Program.findOne({ code: 'APPROVED-001' }); // status: approved
        const subjectLeader = await User.findOne({ username: 'subject_leader' });

        const res = await request(app)
            .post(`/api/work-requests/submit/program/${program._id}`)
            .send({ userId: subjectLeader._id.toString() });

        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
    });

    // Test 5: Trả về 400 khi đã có pending request
    test('should return 400 when program already has pending request', async () => {
        const program = await Program.findOne({ code: 'DRAFT-001' });
        const subjectLeader = await User.findOne({ username: 'subject_leader' });

        // Submit lần đầu
        await request(app)
            .post(`/api/work-requests/submit/program/${program._id}`)
            .send({ userId: subjectLeader._id.toString() });

        // Submit lần thứ 2
        const res = await request(app)
            .post(`/api/work-requests/submit/program/${program._id}`)
            .send({ userId: subjectLeader._id.toString() });

        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
    });
});

// ===========================
// TEST: approveRequest
// ===========================
describe('POST /api/work-requests/:id/approve (approveRequest)', () => {

    // Test 1: Approve request thành công
    test('should approve request successfully', async () => {
        const workRequest = await WorkRequest.findOne({ requestType: 'program', status: 'pending' });
        const centerHead = await User.findOne({ username: 'center_head' });

        const res = await request(app)
            .post(`/api/work-requests/${workRequest._id}/approve`)
            .send({
                userId: centerHead._id.toString(),
                note: 'Approved'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);

        // Verify request status updated
        const updatedRequest = await WorkRequest.findById(workRequest._id);
        expect(updatedRequest.status).toBe('approved');
    });

    // Test 2: Trả về 400 khi thiếu userId
    test('should return 400 when userId is missing', async () => {
        const workRequest = await WorkRequest.findOne({ requestType: 'program' });

        const res = await request(app)
            .post(`/api/work-requests/${workRequest._id}/approve`)
            .send({ note: 'Test' });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('userId is required in request body');
    });

    // Test 3: Trả về 404 khi request không tồn tại
    test('should return 404 when request does not exist', async () => {
        const centerHead = await User.findOne({ username: 'center_head' });
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .post(`/api/work-requests/${nonExistentId}/approve`)
            .send({ userId: centerHead._id.toString() });

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Work request not found');
    });

    // Test 4: Trả về 400 khi request không ở trạng thái pending
    test('should return 400 when request is not pending', async () => {
        const workRequest = await WorkRequest.findOne({ requestType: 'program' });
        const centerHead = await User.findOne({ username: 'center_head' });

        // Approve lần đầu
        await request(app)
            .post(`/api/work-requests/${workRequest._id}/approve`)
            .send({ userId: centerHead._id.toString() });

        // Approve lần thứ 2
        const res = await request(app)
            .post(`/api/work-requests/${workRequest._id}/approve`)
            .send({ userId: centerHead._id.toString() });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

// ===========================
// TEST: rejectRequest
// ===========================
describe('POST /api/work-requests/:id/reject (rejectRequest)', () => {

    // Test 1: Reject request thành công
    test('should reject request successfully', async () => {
        const workRequest = await WorkRequest.findOne({ requestType: 'program', status: 'pending' });
        const centerHead = await User.findOne({ username: 'center_head' });

        const res = await request(app)
            .post(`/api/work-requests/${workRequest._id}/reject`)
            .send({
                userId: centerHead._id.toString(),
                rejectionReason: 'Need more PLOs'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);

        // Verify request status updated
        const updatedRequest = await WorkRequest.findById(workRequest._id);
        expect(updatedRequest.status).toBe('rejected');
        expect(updatedRequest.rejectionReason).toBe('Need more PLOs');
    });

    // Test 2: Trả về 400 khi thiếu userId
    test('should return 400 when userId is missing', async () => {
        const workRequest = await WorkRequest.findOne({ requestType: 'program' });

        const res = await request(app)
            .post(`/api/work-requests/${workRequest._id}/reject`)
            .send({ rejectionReason: 'Test reason' });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('userId is required in request body');
    });

    // Test 3: Trả về 400 khi thiếu rejectionReason
    test('should return 400 when rejectionReason is missing', async () => {
        const workRequest = await WorkRequest.findOne({ requestType: 'program' });
        const centerHead = await User.findOne({ username: 'center_head' });

        const res = await request(app)
            .post(`/api/work-requests/${workRequest._id}/reject`)
            .send({ userId: centerHead._id.toString() });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Rejection reason is required');
    });

    // Test 4: Trả về 404 khi request không tồn tại
    test('should return 404 when request does not exist', async () => {
        const centerHead = await User.findOne({ username: 'center_head' });
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .post(`/api/work-requests/${nonExistentId}/reject`)
            .send({
                userId: centerHead._id.toString(),
                rejectionReason: 'Test reason'
            });

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
    });
});

// ===========================
// TEST: cancelRequest
// ===========================
describe('DELETE /api/work-requests/:id/cancel (cancelRequest)', () => {

    // Test 1: Cancel bottom-up request thành công
    test('should cancel bottom-up request successfully', async () => {
        const workRequest = await WorkRequest.findOne({ direction: 'bottom_up', status: 'pending' });
        const subjectLeader = await User.findOne({ username: 'subject_leader' });

        const res = await request(app)
            .delete(`/api/work-requests/${workRequest._id}/cancel`)
            .send({ userId: subjectLeader._id.toString() });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Request cancelled successfully');

        // Verify request deleted
        const deletedRequest = await WorkRequest.findById(workRequest._id);
        expect(deletedRequest).toBeNull();
    });

    // Test 2: Trả về 400 khi thiếu userId
    test('should return 400 when userId is missing', async () => {
        const workRequest = await WorkRequest.findOne({ direction: 'bottom_up' });

        const res = await request(app)
            .delete(`/api/work-requests/${workRequest._id}/cancel`)
            .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('userId is required in request body');
    });

    // Test 3: Trả về 404 khi request không tồn tại
    test('should return 404 when request does not exist', async () => {
        const subjectLeader = await User.findOne({ username: 'subject_leader' });
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .delete(`/api/work-requests/${nonExistentId}/cancel`)
            .send({ userId: subjectLeader._id.toString() });

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
    });

    // Test 4: Trả về 403 khi không phải người tạo request
    test('should return 403 when user is not the request creator', async () => {
        const workRequest = await WorkRequest.findOne({ direction: 'bottom_up' });
        const centerHead = await User.findOne({ username: 'center_head' });

        const res = await request(app)
            .delete(`/api/work-requests/${workRequest._id}/cancel`)
            .send({ userId: centerHead._id.toString() });

        expect(res.statusCode).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Only the request creator can cancel this request');
    });
});

// ===========================
// TEST: createTopDownRequest
// ===========================
describe('POST /api/work-requests/create (createTopDownRequest)', () => {

    // Test 1: Tạo top-down request thành công
    test('should create top-down request successfully', async () => {
        const centerHead = await User.findOne({ username: 'center_head' });
        const subjectLeader = await User.findOne({ username: 'subject_leader' });

        const res = await request(app)
            .post('/api/work-requests/create')
            .send({
                requestType: 'create_program',
                assignedTo: subjectLeader._id.toString(),
                requestedBy: centerHead._id.toString(),
                requestNote: 'Please create a new TOEFL program'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.direction).toBe('top_down');
        expect(res.body.data.requestType).toBe('create_program');
    });

    // Test 2: Trả về 400 khi thiếu required fields
    test('should return 400 when required fields are missing', async () => {
        const res = await request(app)
            .post('/api/work-requests/create')
            .send({
                requestType: 'create_program'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('requestType, assignedTo, and requestedBy are required');
    });

    // Test 3: Trả về 400 khi requestType không hợp lệ
    test('should return 400 when requestType is invalid', async () => {
        const centerHead = await User.findOne({ username: 'center_head' });
        const subjectLeader = await User.findOne({ username: 'subject_leader' });

        const res = await request(app)
            .post('/api/work-requests/create')
            .send({
                requestType: 'invalid_type',
                assignedTo: subjectLeader._id.toString(),
                requestedBy: centerHead._id.toString()
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid requestType for top-down workflow');
    });

    // Test 4: Tạo edit_program request thành công
    test('should create edit_program request successfully', async () => {
        const centerHead = await User.findOne({ username: 'center_head' });
        const subjectLeader = await User.findOne({ username: 'subject_leader' });
        const program = await Program.findOne({ code: 'APPROVED-001' });

        const res = await request(app)
            .post('/api/work-requests/create')
            .send({
                requestType: 'edit_program',
                assignedTo: subjectLeader._id.toString(),
                requestedBy: centerHead._id.toString(),
                entityId: program._id.toString(),
                requestNote: 'Please add new courses'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.requestType).toBe('edit_program');
    });

    // Test 5: Trả về 400 khi tạo edit_program cho program chưa approved
    test('should return 400 when creating edit_program for non-approved program', async () => {
        const centerHead = await User.findOne({ username: 'center_head' });
        const subjectLeader = await User.findOne({ username: 'subject_leader' });
        const program = await Program.findOne({ code: 'DRAFT-001' }); // status: draft

        const res = await request(app)
            .post('/api/work-requests/create')
            .send({
                requestType: 'edit_program',
                assignedTo: subjectLeader._id.toString(),
                requestedBy: centerHead._id.toString(),
                entityId: program._id.toString()
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

// ===========================
// TEST: startProcessing
// ===========================
describe('POST /api/work-requests/:id/start-processing (startProcessing)', () => {

    // Test 1: Start processing thành công
    test('should start processing successfully', async () => {
        const workRequest = await WorkRequest.findOne({ direction: 'top_down', status: 'pending' });
        const subjectLeader = await User.findOne({ username: 'subject_leader' });

        const res = await request(app)
            .post(`/api/work-requests/${workRequest._id}/start-processing`)
            .send({
                userId: subjectLeader._id.toString(),
                programCode: 'NEW-001',
                programName: 'New Program',
                programType: 'cam'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);

        // Verify request status updated
        const updatedRequest = await WorkRequest.findById(workRequest._id);
        expect(updatedRequest.status).toBe('in_progress');
    });

    // Test 2: Trả về 400 khi thiếu userId
    test('should return 400 when userId is missing', async () => {
        const workRequest = await WorkRequest.findOne({ direction: 'top_down' });

        const res = await request(app)
            .post(`/api/work-requests/${workRequest._id}/start-processing`)
            .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('userId is required in request body');
    });

    // Test 3: Trả về 404 khi request không tồn tại
    test('should return 404 when request does not exist', async () => {
        const subjectLeader = await User.findOne({ username: 'subject_leader' });
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .post(`/api/work-requests/${nonExistentId}/start-processing`)
            .send({ userId: subjectLeader._id.toString() });

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
    });

    // Test 4: Trả về 400 khi request là bottom_up
    test('should return 400 when request is bottom_up', async () => {
        const workRequest = await WorkRequest.findOne({ direction: 'bottom_up' });
        const subjectLeader = await User.findOne({ username: 'subject_leader' });

        const res = await request(app)
            .post(`/api/work-requests/${workRequest._id}/start-processing`)
            .send({ userId: subjectLeader._id.toString() });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Only top-down requests can be processed');
    });

    // Test 5: Trả về 403 khi không phải assignee
    test('should return 403 when user is not assignee', async () => {
        const workRequest = await WorkRequest.findOne({ direction: 'top_down' });
        const centerHead = await User.findOne({ username: 'center_head' });

        const res = await request(app)
            .post(`/api/work-requests/${workRequest._id}/start-processing`)
            .send({ userId: centerHead._id.toString() });

        expect(res.statusCode).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('You are not assigned to this request');
    });
});

// ===========================
// TEST: getStats
// ===========================
describe('GET /api/work-requests/statistics (getStats)', () => {

    // Test 1: Lấy statistics thành công
    test('should return statistics successfully', async () => {
        const res = await request(app).get('/api/work-requests/statistics');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.pending).toBeDefined();
        expect(res.body.data.total).toBeDefined();
    });

    // Test 2: Filter statistics theo direction
    test('should filter statistics by direction', async () => {
        const res = await request(app)
            .get('/api/work-requests/statistics')
            .query({ direction: 'bottom_up' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    // Test 3: Kiểm tra byDirection breakdown
    test('should include byDirection breakdown', async () => {
        const res = await request(app).get('/api/work-requests/statistics');

        expect(res.statusCode).toBe(200);
        expect(res.body.byDirection).toBeDefined();
        expect(res.body.byDirection.bottom_up).toBeDefined();
        expect(res.body.byDirection.top_down).toBeDefined();
    });
});

// ===========================
// TEST: revokeApproval
// ===========================
describe('POST /api/work-requests/:id/revoke (revokeApproval)', () => {

    // Test 1: Trả về 400 khi thiếu userId
    test('should return 400 when userId is missing', async () => {
        const workRequest = await WorkRequest.findOne({ direction: 'bottom_up' });

        const res = await request(app)
            .post(`/api/work-requests/${workRequest._id}/revoke`)
            .send({ reason: 'Test reason' });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('userId is required in request body');
    });

    // Test 2: Trả về 400 khi thiếu reason
    test('should return 400 when reason is missing', async () => {
        const workRequest = await WorkRequest.findOne({ direction: 'bottom_up' });
        const centerHead = await User.findOne({ username: 'center_head' });

        const res = await request(app)
            .post(`/api/work-requests/${workRequest._id}/revoke`)
            .send({ userId: centerHead._id.toString() });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Revocation reason is required');
    });

    // Test 3: Trả về 404 khi request không tồn tại
    test('should return 404 when request does not exist', async () => {
        const centerHead = await User.findOne({ username: 'center_head' });
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .post(`/api/work-requests/${nonExistentId}/revoke`)
            .send({
                userId: centerHead._id.toString(),
                reason: 'Test reason'
            });

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
    });

    // Test 4: Trả về 400 khi request chưa approved
    test('should return 400 when request is not approved', async () => {
        const workRequest = await WorkRequest.findOne({ direction: 'bottom_up', status: 'pending' });
        const centerHead = await User.findOne({ username: 'center_head' });

        const res = await request(app)
            .post(`/api/work-requests/${workRequest._id}/revoke`)
            .send({
                userId: centerHead._id.toString(),
                reason: 'Test reason'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Can only revoke approved requests');
    });
});

// ===========================
// TEST: checkProgramEditStatus
// ===========================
describe('GET /api/work-requests/program/:programId/edit-status (checkProgramEditStatus)', () => {

    // Test 1: Trả về hasActiveEditRequest=false khi không có edit request
    test('should return hasActiveEditRequest=false when no edit request', async () => {
        const program = await Program.findOne({ code: 'APPROVED-001' });

        const res = await request(app).get(`/api/work-requests/program/${program._id}/edit-status`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.hasActiveEditRequest).toBe(false);
        expect(res.body.activeRequest).toBeNull();
    });

    // Test 2: Trả về hasActiveEditRequest=true khi có edit request
    test('should return hasActiveEditRequest=true when has edit request', async () => {
        const program = await Program.findOne({ code: 'APPROVED-001' });
        const centerHead = await User.findOne({ username: 'center_head' });
        const subjectLeader = await User.findOne({ username: 'subject_leader' });

        // Tạo edit_program request
        await WorkRequest.create({
            direction: 'top_down',
            requestType: 'edit_program',
            entityType: 'Program',
            entityId: program._id,
            requestedBy: centerHead._id,
            assignedTo: subjectLeader._id,
            status: 'in_progress'
        });

        const res = await request(app).get(`/api/work-requests/program/${program._id}/edit-status`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.hasActiveEditRequest).toBe(true);
        expect(res.body.activeRequest).toBeDefined();
    });
});

// ===========================
// TEST: withdrawProgramSubmission
// ===========================
describe('POST /api/work-requests/withdraw/program/:programId (withdrawProgramSubmission)', () => {

    // Test 1: Trả về 400 khi thiếu userId
    test('should return 400 when userId is missing', async () => {
        const program = await Program.findOne({ code: 'DRAFT-001' });

        const res = await request(app)
            .post(`/api/work-requests/withdraw/program/${program._id}`)
            .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('userId is required in request body');
    });

    // Test 2: Trả về 404 khi program không tồn tại
    test('should return 404 when program does not exist', async () => {
        const subjectLeader = await User.findOne({ username: 'subject_leader' });
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .post(`/api/work-requests/withdraw/program/${nonExistentId}`)
            .send({ userId: subjectLeader._id.toString() });

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Program not found');
    });

    // Test 3: Trả về 400 khi program không ở trạng thái pending_approval
    test('should return 400 when program is not pending_approval', async () => {
        const program = await Program.findOne({ code: 'DRAFT-001' }); // status: draft
        const subjectLeader = await User.findOne({ username: 'subject_leader' });

        const res = await request(app)
            .post(`/api/work-requests/withdraw/program/${program._id}`)
            .send({ userId: subjectLeader._id.toString() });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });
});
