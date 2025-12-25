const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const Exam = require('../models/examModel');
const Submission = require('../models/submissionModel');
const User = require('../models/userModel');
const Role = require('../models/roleModel');
const Permission = require('../models/permissionModel');
const jwt = require('jsonwebtoken');

jest.setTimeout(30000);

let mongoServer;
let testUser;
let studentUser;
let subjectLeaderUser;
let testToken;
let studentToken;
let subjectLeaderToken;
let studentRole;
let subjectLeaderRole;
let testPermission;

// Helper function to generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { _id: user._id, email: user.email, roleId: user.roleId },
        process.env.JWT_SECRET || 'test-secret-key',
        { expiresIn: '1d' }
    );
};

// Ket noi DB ao truoc tat ca cac test
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.disconnect();
    await mongoose.connect(mongoServer.getUri());
});

// Don dep DB va ngat ket noi sau khi xong
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// Xoa du lieu cu va tao du lieu moi truoc moi test case
beforeEach(async () => {
    // Xoa sach du lieu cu
    await Exam.deleteMany();
    await Submission.deleteMany();
    await User.deleteMany();
    await Role.deleteMany();
    await Permission.deleteMany();

    // Tao Permission truoc
    testPermission = await Permission.create({
        name: 'test_permission',
        description: 'Test permission for tests',
        permissions: {}
    });

    // Tao Roles
    studentRole = await Role.create({
        name: 'student',
        description: 'Student role',
        permissionId: testPermission._id
    });

    subjectLeaderRole = await Role.create({
        name: 'subject_leader',
        description: 'Subject Leader role',
        permissionId: testPermission._id
    });

    const adminRole = await Role.create({
        name: 'admin',
        description: 'Admin role',
        permissionId: testPermission._id
    });

    // Tao Users
    testUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        address: 'Test Address',
        roleId: adminRole._id
    });

    studentUser = await User.create({
        username: 'student1',
        email: 'student@example.com',
        password: 'password123',
        phone: '0987654321',
        address: 'Student Address',
        roleId: studentRole._id
    });

    subjectLeaderUser = await User.create({
        username: 'subjectleader1',
        email: 'leader@example.com',
        password: 'password123',
        phone: '0123456789',
        address: 'Leader Address',
        roleId: subjectLeaderRole._id
    });

    // Generate tokens
    testToken = generateToken(testUser);
    studentToken = generateToken(studentUser);
    subjectLeaderToken = generateToken(subjectLeaderUser);

    // Tao cac Exam
    await Exam.create([
        {
            title: 'IELTS Practice Test 1',
            description: 'Full IELTS practice test',
            createdBy: testUser._id,
            examType: 'ielts',
            totalDuration: 180,
            isPublished: true,
            status: 'approved',
            sections: [
                {
                    type: 'listening',
                    part: 1,
                    duration: 30,
                    questionCount: 10,
                    instructions: 'Listen carefully',
                    audioUrls: ['/uploads/audio1.mp3'],
                    answerKey: [
                        {
                            questionNumber: 1,
                            questionTitle: 'Question 1',
                            questionType: 'multiple_choice',
                            questionAnswer: [
                                { key: 'A', text: 'Answer A' },
                                { key: 'B', text: 'Answer B' },
                                { key: 'C', text: 'Answer C' }
                            ],
                            correctAnswer: ['A'],
                            maxScore: 1
                        }
                    ],
                    maxScore: 10
                },
                {
                    type: 'reading',
                    part: 1,
                    duration: 60,
                    questionCount: 13,
                    instructions: 'Read the passage',
                    fileUrl: '/uploads/reading1.pdf',
                    answerKey: [
                        {
                            questionNumber: 1,
                            questionTitle: 'Reading Question 1',
                            questionType: 'true_false',
                            questionAnswer: [],
                            correctAnswer: ['TRUE'],
                            maxScore: 1
                        }
                    ],
                    maxScore: 13
                }
            ]
        },
        {
            title: 'Cambridge Test Draft',
            description: 'Cambridge practice test - draft',
            createdBy: subjectLeaderUser._id,
            examType: 'cambridge',
            totalDuration: 120,
            isPublished: false,
            status: 'draft',
            sections: []
        },
        {
            title: 'TOEIC Practice Test',
            description: 'TOEIC test for business',
            createdBy: testUser._id,
            examType: 'toeic',
            totalDuration: 120,
            isPublished: true,
            status: 'approved',
            sections: [
                {
                    type: 'listening',
                    part: 1,
                    duration: 45,
                    questionCount: 100,
                    instructions: 'TOEIC Listening',
                    audioUrls: ['/uploads/toeic-audio.mp3'],
                    answerKey: [],
                    maxScore: 100
                }
            ]
        }
    ]);
});

// ===========================
// TEST: getAllExamsForManagement
// ===========================
describe('GET /api/exams/management (getAllExamsForManagement)', () => {

    test('should return all exams with stats for management', async () => {
        const res = await request(app)
            .get('/api/exams/management')
            .set('Authorization', `Bearer ${testToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.count).toBe(3);
        expect(res.body.data.length).toBe(3);
        expect(res.body.stats).toBeDefined();
        expect(res.body.stats.total).toBe(3);
        expect(res.body.stats.published).toBe(2);
        expect(res.body.stats.draft).toBe(1);
    });

    test('should populate createdBy field', async () => {
        const res = await request(app)
            .get('/api/exams/management')
            .set('Authorization', `Bearer ${testToken}`);

        expect(res.statusCode).toBe(200);
        const exam = res.body.data.find(e => e.title === 'IELTS Practice Test 1');
        expect(exam.createdBy).toBeDefined();
        expect(exam.createdBy.username).toBe('testuser');
    });

    test('should return 500 if database fails', async () => {
        jest.spyOn(Exam, 'find').mockImplementationOnce(() => {
            throw new Error('Database connection failed');
        });

        const res = await request(app)
            .get('/api/exams/management')
            .set('Authorization', `Bearer ${testToken}`);

        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
    });
});

// ===========================
// TEST: getExamByIdForManagement
// ===========================
describe('GET /api/exams/management/:id (getExamByIdForManagement)', () => {

    test('should return exam with valid ID', async () => {
        const exam = await Exam.findOne({ title: 'IELTS Practice Test 1' });

        const res = await request(app)
            .get(`/api/exams/management/${exam._id}`)
            .set('Authorization', `Bearer ${testToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.title).toBe('IELTS Practice Test 1');
        expect(res.body.data.submissionCount).toBeDefined();
    });

    test('should return 404 when exam not found', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .get(`/api/exams/management/${nonExistentId}`)
            .set('Authorization', `Bearer ${testToken}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Không tìm thấy bài thi');
    });

    test('should return 500 for invalid ObjectId format', async () => {
        const res = await request(app)
            .get('/api/exams/management/invalid-id')
            .set('Authorization', `Bearer ${testToken}`);

        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
    });
});

// ===========================
// TEST: createExamForManagement
// ===========================
describe('POST /api/exams/management (createExamForManagement)', () => {

    test('should create exam successfully with valid data', async () => {
        const newExam = {
            title: 'New IELTS Test',
            description: 'A new test',
            examType: 'ielts',
            totalDuration: 180,
            createdBy: testUser._id.toString()
        };

        const res = await request(app)
            .post('/api/exams/management')
            .set('Authorization', `Bearer ${testToken}`)
            .send(newExam);

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Tạo đề thi thành công');
        expect(res.body.data.title).toBe('New IELTS Test');
        expect(res.body.data.isPublished).toBe(false);
    });

    test('should return 400 when title is missing', async () => {
        const newExam = {
            description: 'Test without title',
            examType: 'ielts'
        };

        const res = await request(app)
            .post('/api/exams/management')
            .set('Authorization', `Bearer ${testToken}`)
            .send(newExam);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Tiêu đề là bắt buộc');
    });

    test('should create exam with sections', async () => {
        const newExam = {
            title: 'Test with Sections',
            examType: 'ielts',
            createdBy: testUser._id.toString(),
            sections: [
                {
                    type: 'reading',
                    part: 1,
                    duration: 20,
                    questionCount: 2,
                    fileUrl: '/uploads/test.pdf',
                    answerKey: [
                        {
                            questionNumber: 1,
                            questionTitle: 'Q1',
                            questionType: 'multiple_choice',
                            questionAnswer: [{ key: 'A', text: 'A' }],
                            correctAnswer: ['A'],
                            maxScore: 1
                        },
                        {
                            questionNumber: 2,
                            questionTitle: 'Q2',
                            questionType: 'multiple_choice',
                            questionAnswer: [{ key: 'B', text: 'B' }],
                            correctAnswer: ['B'],
                            maxScore: 1
                        }
                    ]
                }
            ]
        };

        const res = await request(app)
            .post('/api/exams/management')
            .set('Authorization', `Bearer ${testToken}`)
            .send(newExam);

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.sections).toHaveLength(1);
    });

    test('should return 400 when section validation fails - missing type', async () => {
        const newExam = {
            title: 'Invalid Section Test',
            createdBy: testUser._id.toString(),
            sections: [
                {
                    part: 1,
                    duration: 20,
                    questionCount: 1,
                    answerKey: [
                        {
                            questionNumber: 1,
                            questionTitle: 'Q1',
                            questionType: 'multiple_choice',
                            correctAnswer: ['A'],
                            maxScore: 1
                        }
                    ]
                }
            ]
        };

        const res = await request(app)
            .post('/api/exams/management')
            .set('Authorization', `Bearer ${testToken}`)
            .send(newExam);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test('should return 400 when answerKey count does not match questionCount', async () => {
        const newExam = {
            title: 'Mismatched Question Count',
            createdBy: testUser._id.toString(),
            sections: [
                {
                    type: 'reading',
                    part: 1,
                    duration: 20,
                    questionCount: 5, // Expects 5 questions
                    fileUrl: '/uploads/test.pdf',
                    answerKey: [
                        // Only 1 question provided
                        {
                            questionNumber: 1,
                            questionTitle: 'Q1',
                            questionType: 'multiple_choice',
                            correctAnswer: ['A'],
                            maxScore: 1
                        }
                    ]
                }
            ]
        };

        const res = await request(app)
            .post('/api/exams/management')
            .set('Authorization', `Bearer ${testToken}`)
            .send(newExam);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.errors).toBeDefined();
    });
});

// ===========================
// TEST: updateExamForManagement
// ===========================
describe('PUT /api/exams/management/:id (updateExamForManagement)', () => {

    test('should update exam successfully', async () => {
        const exam = await Exam.findOne({ title: 'Cambridge Test Draft' });

        const updateData = {
            title: 'Cambridge Test Updated',
            description: 'Updated description'
        };

        const res = await request(app)
            .put(`/api/exams/management/${exam._id}`)
            .set('Authorization', `Bearer ${testToken}`)
            .send(updateData);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Cập nhật đề thi thành công');
        expect(res.body.data.title).toBe('Cambridge Test Updated');
    });

    test('should return 404 when exam not found', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .put(`/api/exams/management/${nonExistentId}`)
            .set('Authorization', `Bearer ${testToken}`)
            .send({ title: 'Updated' });

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Không tìm thấy bài thi');
    });

    test('should return 400 when trying to update approved exam', async () => {
        const exam = await Exam.findOne({ title: 'IELTS Practice Test 1' });

        const res = await request(app)
            .put(`/api/exams/management/${exam._id}`)
            .set('Authorization', `Bearer ${testToken}`)
            .send({ title: 'Try to update approved' });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test('should update exam with needs_revision status', async () => {
        // First change status to needs_revision
        await Exam.findOneAndUpdate(
            { title: 'Cambridge Test Draft' },
            { status: 'needs_revision' }
        );

        const exam = await Exam.findOne({ title: 'Cambridge Test Draft' });

        const res = await request(app)
            .put(`/api/exams/management/${exam._id}`)
            .set('Authorization', `Bearer ${testToken}`)
            .send({ title: 'Revised Exam' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });
});

// ===========================
// TEST: deleteExamForManagement
// ===========================
describe('DELETE /api/exams/management/:id (deleteExamForManagement)', () => {

    test('should delete exam successfully when no submissions', async () => {
        const exam = await Exam.findOne({ title: 'Cambridge Test Draft' });

        const res = await request(app)
            .delete(`/api/exams/management/${exam._id}`)
            .set('Authorization', `Bearer ${testToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Xóa bài thi thành công');

        // Verify deletion
        const deletedExam = await Exam.findById(exam._id);
        expect(deletedExam).toBeNull();
    });

    test('should return 404 when exam not found', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .delete(`/api/exams/management/${nonExistentId}`)
            .set('Authorization', `Bearer ${testToken}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Không tìm thấy bài thi');
    });

    test('should return 400 when exam has submissions', async () => {
        const exam = await Exam.findOne({ title: 'IELTS Practice Test 1' });

        // Create a submission
        await Submission.create({
            examId: exam._id,
            studentId: studentUser._id,
            status: 'in-progress',
            sections: []
        });

        const res = await request(app)
            .delete(`/api/exams/management/${exam._id}`)
            .set('Authorization', `Bearer ${testToken}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('Không thể xóa bài thi đã có');
    });
});

// ===========================
// TEST: publishExamForManagement
// ===========================
describe('POST /api/exams/management/:id/publish (publishExamForManagement)', () => {

    test('should publish exam successfully', async () => {
        const exam = await Exam.findOne({ title: 'Cambridge Test Draft' });

        const res = await request(app)
            .post(`/api/exams/management/${exam._id}/publish`)
            .set('Authorization', `Bearer ${testToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Xuất bản bài thi thành công');
        expect(res.body.data.isPublished).toBe(true);
    });

    test('should return 404 when exam not found', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .post(`/api/exams/management/${nonExistentId}/publish`)
            .set('Authorization', `Bearer ${testToken}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
    });

    test('should return 400 when exam already published', async () => {
        const exam = await Exam.findOne({ title: 'IELTS Practice Test 1' });

        const res = await request(app)
            .post(`/api/exams/management/${exam._id}/publish`)
            .set('Authorization', `Bearer ${testToken}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Bài thi đã được xuất bản');
    });
});

// ===========================
// TEST: unpublishExamForManagement
// ===========================
describe('POST /api/exams/management/:id/unpublish (unpublishExamForManagement)', () => {

    test('should unpublish exam successfully', async () => {
        const exam = await Exam.findOne({ title: 'IELTS Practice Test 1' });

        const res = await request(app)
            .post(`/api/exams/management/${exam._id}/unpublish`)
            .set('Authorization', `Bearer ${testToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Hủy xuất bản bài thi thành công');
        expect(res.body.data.isPublished).toBe(false);
    });

    test('should return 404 when exam not found', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .post(`/api/exams/management/${nonExistentId}/unpublish`)
            .set('Authorization', `Bearer ${testToken}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
    });

    test('should return 400 when exam not published', async () => {
        const exam = await Exam.findOne({ title: 'Cambridge Test Draft' });

        const res = await request(app)
            .post(`/api/exams/management/${exam._id}/unpublish`)
            .set('Authorization', `Bearer ${testToken}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Bài thi chưa được xuất bản');
    });
});

// ===========================
// TEST: getExamSubmissionStatus
// ===========================
describe('GET /api/exams/management/:id/submission-status (getExamSubmissionStatus)', () => {

    test('should return submission status for draft exam with sections', async () => {
        // Create exam with sections in draft status
        const exam = await Exam.create({
            title: 'Draft with Sections',
            status: 'draft',
            createdBy: testUser._id,
            sections: [
                {
                    type: 'reading',
                    part: 1,
                    duration: 20,
                    questionCount: 1
                }
            ]
        });

        const res = await request(app)
            .get(`/api/exams/management/${exam._id}/submission-status`)
            .set('Authorization', `Bearer ${testToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.canSubmit).toBe(true);
        expect(res.body.data.hasSections).toBe(true);
    });

    test('should return canSubmit false for exam without sections', async () => {
        const exam = await Exam.findOne({ title: 'Cambridge Test Draft' });

        const res = await request(app)
            .get(`/api/exams/management/${exam._id}/submission-status`)
            .set('Authorization', `Bearer ${testToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.canSubmit).toBe(false);
        expect(res.body.data.hasSections).toBe(false);
    });

    test('should return 404 when exam not found', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .get(`/api/exams/management/${nonExistentId}/submission-status`)
            .set('Authorization', `Bearer ${testToken}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
    });
});

// ===========================
// TEST: getAllExams (Student)
// ===========================
describe('GET /api/exams (getAllExams - Student)', () => {

    test('should return only published exams', async () => {
        const res = await request(app).get('/api/exams');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2); // Only published exams
        res.body.forEach(exam => {
            expect(exam.isPublished).toBe(true);
        });
    });

    test('should not include unpublished exams', async () => {
        const res = await request(app).get('/api/exams');

        expect(res.statusCode).toBe(200);
        const draftExam = res.body.find(e => e.title === 'Cambridge Test Draft');
        expect(draftExam).toBeUndefined();
    });
});

// ===========================
// TEST: getExamById (Student)
// ===========================
describe('GET /api/exams/:id (getExamById - Student)', () => {

    test('should return exam with valid ID', async () => {
        const exam = await Exam.findOne({ title: 'IELTS Practice Test 1' });

        const res = await request(app)
            .get(`/api/exams/${exam._id}`)
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe('IELTS Practice Test 1');
    });

    test('should return 404 when exam not found', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .get(`/api/exams/${nonExistentId}`)
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Không tìm thấy bài thi');
    });
});

// ===========================
// TEST: startExam (Student)
// ===========================
describe('POST /api/exams/start (startExam)', () => {

    test('should start exam successfully', async () => {
        const exam = await Exam.findOne({ title: 'IELTS Practice Test 1' });

        const res = await request(app)
            .post('/api/exams/start')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ examId: exam._id.toString() });

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe('Bắt đầu làm bài thành công');
        expect(res.body.submission).toBeDefined();
        expect(res.body.submission.status).toBe('in-progress');
    });

    test('should return existing submission if already started', async () => {
        const exam = await Exam.findOne({ title: 'IELTS Practice Test 1' });

        // First start
        await request(app)
            .post('/api/exams/start')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ examId: exam._id.toString() });

        // Second start - should return existing
        const res = await request(app)
            .post('/api/exams/start')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ examId: exam._id.toString() });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Đã có bài làm, tiếp tục làm bài');
    });

    test('should return 400 when examId is missing', async () => {
        const res = await request(app)
            .post('/api/exams/start')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Vui lòng cung cấp examId');
    });

    test('should return 404 when exam not found', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .post('/api/exams/start')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ examId: nonExistentId.toString() });

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Không tìm thấy bài thi');
    });

    test('should return 403 when exam not published', async () => {
        const exam = await Exam.findOne({ title: 'Cambridge Test Draft' });

        const res = await request(app)
            .post('/api/exams/start')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ examId: exam._id.toString() });

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe('Bài thi chưa được công bố');
    });
});

// ===========================
// TEST: createNewSubmission (Student)
// ===========================
describe('POST /api/exams/create-new-submission (createNewSubmission)', () => {

    test('should create new submission successfully', async () => {
        const exam = await Exam.findOne({ title: 'IELTS Practice Test 1' });

        const res = await request(app)
            .post('/api/exams/create-new-submission')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ examId: exam._id.toString() });

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe('Tạo bài làm mới thành công');
        expect(res.body.submission).toBeDefined();
    });

    test('should create multiple submissions for same exam', async () => {
        const exam = await Exam.findOne({ title: 'IELTS Practice Test 1' });

        // First submission
        await request(app)
            .post('/api/exams/create-new-submission')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ examId: exam._id.toString() });

        // Second submission
        const res = await request(app)
            .post('/api/exams/create-new-submission')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ examId: exam._id.toString() });

        expect(res.statusCode).toBe(201);

        // Verify 2 submissions exist
        const submissions = await Submission.find({ examId: exam._id, studentId: studentUser._id });
        expect(submissions.length).toBe(2);
    });

    test('should return 403 when exam not published', async () => {
        const exam = await Exam.findOne({ title: 'Cambridge Test Draft' });

        const res = await request(app)
            .post('/api/exams/create-new-submission')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ examId: exam._id.toString() });

        expect(res.statusCode).toBe(403);
    });
});

// ===========================
// TEST: getExamSubmissions (Student)
// ===========================
describe('GET /api/exams/:examId/submissions (getExamSubmissions)', () => {

    test('should return submissions for exam', async () => {
        const exam = await Exam.findOne({ title: 'IELTS Practice Test 1' });

        // Create submission
        await Submission.create({
            examId: exam._id,
            studentId: studentUser._id,
            status: 'in-progress',
            sections: []
        });

        const res = await request(app)
            .get(`/api/exams/${exam._id}/submissions`)
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.count).toBe(1);
        expect(res.body.submissions).toHaveLength(1);
    });

    test('should return empty array when no submissions', async () => {
        const exam = await Exam.findOne({ title: 'TOEIC Practice Test' });

        const res = await request(app)
            .get(`/api/exams/${exam._id}/submissions`)
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.count).toBe(0);
        expect(res.body.submissions).toHaveLength(0);
    });

    test('should return 404 when exam not found', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .get(`/api/exams/${nonExistentId}/submissions`)
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toBe(404);
    });
});

// ===========================
// TEST: getMySubmittedExams (Subject Leader)
// ===========================
describe('GET /api/exams/my-exams (getMySubmittedExams)', () => {

    test('should return exams created by subject leader', async () => {
        const res = await request(app)
            .get('/api/exams/my-exams')
            .set('Authorization', `Bearer ${subjectLeaderToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
        expect(res.body.stats).toBeDefined();
    });

    test('should filter by status', async () => {
        const res = await request(app)
            .get('/api/exams/my-exams')
            .set('Authorization', `Bearer ${subjectLeaderToken}`)
            .query({ status: 'draft' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test('should search by title', async () => {
        const res = await request(app)
            .get('/api/exams/my-exams')
            .set('Authorization', `Bearer ${subjectLeaderToken}`)
            .query({ search: 'Cambridge' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });
});

// ===========================
// TEST: withdrawExamSubmission (Subject Leader)
// ===========================
describe('POST /api/exams/management/:id/withdraw (withdrawExamSubmission)', () => {

    test('should withdraw pending exam successfully', async () => {
        // Create exam with pending_approval status
        const exam = await Exam.create({
            title: 'Pending Exam',
            status: 'pending_approval',
            createdBy: subjectLeaderUser._id,
            sections: []
        });

        const res = await request(app)
            .post(`/api/exams/management/${exam._id}/withdraw`)
            .set('Authorization', `Bearer ${subjectLeaderToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Rút lại đề thi thành công');
        expect(res.body.data.status).toBe('draft');
    });

    test('should return 404 when exam not found', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .post(`/api/exams/management/${nonExistentId}/withdraw`)
            .set('Authorization', `Bearer ${subjectLeaderToken}`);

        expect(res.statusCode).toBe(404);
    });

    test('should return 403 when not owner', async () => {
        // Exam created by testUser, not subjectLeaderUser
        const exam = await Exam.findOne({ title: 'IELTS Practice Test 1' });

        // Change to pending_approval
        exam.status = 'pending_approval';
        await exam.save();

        const res = await request(app)
            .post(`/api/exams/management/${exam._id}/withdraw`)
            .set('Authorization', `Bearer ${subjectLeaderToken}`);

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe('Bạn không có quyền rút lại đề thi này');
    });

    test('should return 400 when exam not pending', async () => {
        const exam = await Exam.findOne({ title: 'Cambridge Test Draft' });

        const res = await request(app)
            .post(`/api/exams/management/${exam._id}/withdraw`)
            .set('Authorization', `Bearer ${subjectLeaderToken}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Chỉ có thể rút lại đề thi đang chờ duyệt');
    });
});

// ===========================
// TEST: deleteExamFileForManagement
// ===========================
describe('POST /api/exams/management/delete-exam-file (deleteExamFileForManagement)', () => {

    test('should return 400 when examId is missing', async () => {
        const res = await request(app)
            .post('/api/exams/management/delete-exam-file')
            .set('Authorization', `Bearer ${testToken}`)
            .send({ sectionIndex: 0, fileType: 'pdf' });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Thiếu examId');
    });

    test('should return 404 when exam not found', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .post('/api/exams/management/delete-exam-file')
            .set('Authorization', `Bearer ${testToken}`)
            .send({ examId: nonExistentId.toString(), sectionIndex: 0, fileType: 'pdf' });

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
    });

    test('should return 400 when section index is invalid', async () => {
        const exam = await Exam.findOne({ title: 'IELTS Practice Test 1' });

        const res = await request(app)
            .post('/api/exams/management/delete-exam-file')
            .set('Authorization', `Bearer ${testToken}`)
            .send({ examId: exam._id.toString(), sectionIndex: 999, fileType: 'pdf' });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Section index không hợp lệ');
    });
});

// ===========================
// TEST: submitExamForApproval (Deprecated)
// ===========================
describe('POST /api/exams/management/:id/submit-for-approval (submitExamForApproval)', () => {

    test('should return 410 deprecated status', async () => {
        const exam = await Exam.findOne({ title: 'Cambridge Test Draft' });

        const res = await request(app)
            .post(`/api/exams/management/${exam._id}/submit-for-approval`)
            .set('Authorization', `Bearer ${subjectLeaderToken}`);

        expect(res.statusCode).toBe(410);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('deprecated');
    });
});

// ===========================
// TEST: getReadingSection (Student)
// ===========================
describe('GET /api/exams/:examId/submissions/:submissionId/reading (getReadingSection)', () => {

    test('should return reading section data', async () => {
        const exam = await Exam.findOne({ title: 'IELTS Practice Test 1' });

        // Create submission
        const submission = await Submission.create({
            examId: exam._id,
            studentId: studentUser._id,
            status: 'in-progress',
            sections: []
        });

        const res = await request(app)
            .get(`/api/exams/${exam._id}/submissions/${submission._id}/reading`)
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.sectionType).toBe('reading');
        expect(res.body.parts).toBeDefined();
        expect(Array.isArray(res.body.parts)).toBe(true);
    });

    test('should return 404 when exam not found', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .get(`/api/exams/${nonExistentId}/submissions/${nonExistentId}/reading`)
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toBe(404);
    });

    test('should return 404 when submission not found', async () => {
        const exam = await Exam.findOne({ title: 'IELTS Practice Test 1' });
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .get(`/api/exams/${exam._id}/submissions/${nonExistentId}/reading`)
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Không tìm thấy bài làm');
    });
});

// ===========================
// TEST: getListeningSection (Student)
// ===========================
describe('GET /api/exams/:examId/submissions/:submissionId/listening (getListeningSection)', () => {

    test('should return listening section data', async () => {
        const exam = await Exam.findOne({ title: 'IELTS Practice Test 1' });

        const submission = await Submission.create({
            examId: exam._id,
            studentId: studentUser._id,
            status: 'in-progress',
            sections: []
        });

        const res = await request(app)
            .get(`/api/exams/${exam._id}/submissions/${submission._id}/listening`)
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.sectionType).toBe('listening');
        expect(res.body.parts).toBeDefined();
    });

    test('should include audioUrls for listening sections', async () => {
        const exam = await Exam.findOne({ title: 'IELTS Practice Test 1' });

        const submission = await Submission.create({
            examId: exam._id,
            studentId: studentUser._id,
            status: 'in-progress',
            sections: []
        });

        const res = await request(app)
            .get(`/api/exams/${exam._id}/submissions/${submission._id}/listening`)
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.parts[0].section.audioUrls).toBeDefined();
    });
});

// ===========================
// TEST: Error handling
// ===========================
describe('Error Handling', () => {

    test('should handle database errors gracefully', async () => {
        jest.spyOn(Exam, 'find').mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const res = await request(app)
            .get('/api/exams/management')
            .set('Authorization', `Bearer ${testToken}`);

        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
    });

    test('should handle invalid ObjectId', async () => {
        const res = await request(app)
            .get('/api/exams/management/not-valid-id')
            .set('Authorization', `Bearer ${testToken}`);

        expect(res.statusCode).toBe(500);
    });
});
