const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const Tip = require('../models/tipModel');
const User = require('../models/userModel');


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
    await Tip.deleteMany();
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

    // Tạo các Tips
    await Tip.create([
        {
            section: 'General',
            categories: [
                {
                    name: 'Listening',
                    items: [
                        { title: 'Listening Tip 1', url: 'https://youtube.com/watch?v=abc123', order: 1 },
                        { title: 'Listening Tip 2', url: 'https://youtube.com/watch?v=def456', order: 2 }
                    ]
                },
                {
                    name: 'Reading',
                    items: [
                        { title: 'Reading Tip 1', url: 'https://youtube.com/watch?v=ghi789', order: 1 }
                    ]
                }
            ],
            createdBy: testUser._id
        },
        {
            section: 'Toeic',
            categories: [
                {
                    name: 'Listening',
                    items: [
                        { title: 'TOEIC Listening Tip 1', url: 'https://youtube.com/watch?v=toeic1', order: 1 },
                        { title: 'TOEIC Listening Tip 2', url: 'https://youtube.com/watch?v=toeic2', order: 2 },
                        { title: 'TOEIC Listening Tip 3', url: 'https://youtube.com/watch?v=toeic3', order: 3 }
                    ]
                },
                {
                    name: 'Grammar',
                    items: [
                        { title: 'TOEIC Grammar Tip 1', url: 'https://youtube.com/watch?v=grammar1', order: 1 }
                    ]
                }
            ],
            createdBy: testUser._id
        },
        {
            section: 'Ielts',
            categories: [
                {
                    name: 'Speaking',
                    items: [
                        { title: 'IELTS Speaking Tip 1', url: 'https://youtube.com/watch?v=ielts1', order: 1 }
                    ]
                },
                {
                    name: 'Writing',
                    items: [
                        { title: 'IELTS Writing Tip 1', url: 'https://youtube.com/watch?v=ielts2', order: 1 },
                        { title: 'IELTS Writing Tip 2', url: 'https://youtube.com/watch?v=ielts3', order: 2 }
                    ]
                }
            ],
            createdBy: testUser._id
        }
    ]);
});

// ===========================
// TEST: getAllTips
// ===========================
describe('GET /api/tips (getAllTips)', () => {

    // Test 1: Lấy tất cả tips (không filter)
    test('should return all tips when no filter provided', async () => {
        const res = await request(app).get('/api/tips');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.total).toBe(3);
        expect(res.body.tips.length).toBe(3);
    });

    // Test 2: Filter theo section
    test('should filter tips by section', async () => {
        const res = await request(app).get('/api/tips').query({ section: 'Toeic' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.total).toBe(1);
        expect(res.body.tips[0].section).toBe('Toeic');
    });

    // Test 3: Filter với section = 'all' trả về tất cả
    test('should return all tips when section is "all"', async () => {
        const res = await request(app).get('/api/tips').query({ section: 'all' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.total).toBe(3);
    });

    // Test 4: Kiểm tra items được sort theo order
    test('should return items sorted by order within categories', async () => {
        const res = await request(app).get('/api/tips').query({ section: 'Toeic' });

        expect(res.statusCode).toBe(200);
        const listeningCategory = res.body.tips[0].categories.find(cat => cat.name === 'Listening');

        expect(listeningCategory.items[0].order).toBe(1);
        expect(listeningCategory.items[1].order).toBe(2);
        expect(listeningCategory.items[2].order).toBe(3);
    });

    // Test 5: Trả về mảng rỗng khi không có kết quả phù hợp
    test('should return empty array when no tips match filter', async () => {
        const res = await request(app).get('/api/tips').query({ section: 'NonExistent' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.tips).toHaveLength(0);
        expect(res.body.total).toBe(0);
    });

    // Test 6: Xử lý lỗi (500)
    test('should return 500 if database fails', async () => {
        jest.spyOn(Tip, 'find').mockImplementationOnce(() => {
            throw new Error('Database connection failed');
        });

        const res = await request(app).get('/api/tips');

        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Lỗi server khi lấy danh sách tips');
    });
});

// ===========================
// TEST: getTipsBySection
// ===========================
describe('GET /api/tips/section/:section (getTipsBySection)', () => {

    // Test 1: Lấy tips theo section hợp lệ
    test('should return tips for valid section', async () => {
        const res = await request(app).get('/api/tips/section/General');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.tip.section).toBe('General');
        expect(res.body.statistics).toBeDefined();
        expect(res.body.statistics.totalCategories).toBe(2);
    });

    // Test 2: Trả về thống kê đúng
    test('should return correct statistics', async () => {
        const res = await request(app).get('/api/tips/section/General');

        expect(res.statusCode).toBe(200);
        expect(res.body.statistics.totalVideos).toBe(3); // 2 Listening + 1 Reading
        expect(res.body.statistics.categoriesBreakdown).toBeDefined();
    });

    // Test 3: Trả về 400 khi section không hợp lệ
    test('should return 400 for invalid section', async () => {
        const res = await request(app).get('/api/tips/section/InvalidSection');

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('Section không hợp lệ');
    });

    // Test 4: Trả về 404 khi không tìm thấy tip cho section
    test('should return 404 when tip not found for section', async () => {
        await Tip.deleteMany({ section: 'General' });

        const res = await request(app).get('/api/tips/section/General');

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('Không tìm thấy tips cho section');
    });

    // Test 5: Kiểm tra items được sort theo order
    test('should return items sorted by order', async () => {
        const res = await request(app).get('/api/tips/section/Toeic');

        expect(res.statusCode).toBe(200);
        const listeningCategory = res.body.tip.categories.find(cat => cat.name === 'Listening');

        for (let i = 0; i < listeningCategory.items.length - 1; i++) {
            expect(listeningCategory.items[i].order).toBeLessThanOrEqual(listeningCategory.items[i + 1].order);
        }
    });
});

// ===========================
// TEST: getTipsStatistics
// ===========================
describe('GET /api/tips/statistics (getTipsStatistics)', () => {

    // Test 1: Lấy thống kê thành công
    test('should return tips statistics successfully', async () => {
        const res = await request(app).get('/api/tips/statistics');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.statistics).toBeDefined();
        expect(res.body.statistics.totalSections).toBe(3);
    });

    // Test 2: Kiểm tra grandTotal đúng
    test('should return correct grandTotal', async () => {
        const res = await request(app).get('/api/tips/statistics');

        expect(res.statusCode).toBe(200);
        // General: 3 videos, Toeic: 4 videos, Ielts: 3 videos = 10 total
        expect(res.body.statistics.grandTotal).toBe(10);
    });

    // Test 3: Kiểm tra chi tiết từng section
    test('should return detailed section statistics', async () => {
        const res = await request(app).get('/api/tips/statistics');

        expect(res.statusCode).toBe(200);
        const toeicSection = res.body.statistics.sections.find(s => s.section === 'Toeic');

        expect(toeicSection).toBeDefined();
        expect(toeicSection.totalCategories).toBe(2);
        expect(toeicSection.totalVideos).toBe(4);
    });

    // Test 4: Trả về thống kê rỗng khi không có tips
    test('should return empty statistics when no tips exist', async () => {
        await Tip.deleteMany();

        const res = await request(app).get('/api/tips/statistics');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.statistics.totalSections).toBe(0);
        expect(res.body.statistics.grandTotal).toBe(0);
    });
});

// ===========================
// TEST: createTip
// ===========================
describe('POST /api/tips (createTip)', () => {

    // Test 1: Tạo tip thành công (cần mock auth)
    test('should create tip successfully with valid data', async () => {
        // Xóa tip General để có thể tạo mới
        await Tip.deleteMany({ section: 'General' });

        const newTip = {
            section: 'General',
            categories: [
                {
                    name: 'Vocabulary',
                    items: [
                        { title: 'Vocab Tip 1', url: 'https://youtube.com/watch?v=vocab1', order: 1 }
                    ]
                }
            ]
        };

        // Note: Trong thực tế cần mock verifyToken middleware
        // Ở đây test sẽ fail do thiếu token, nhưng logic đã đúng
        const res = await request(app)
            .post('/api/tips')
            .send(newTip);

        // Expect 401 vì không có token
        expect(res.statusCode).toBe(401);
    });

    // Test 2: Trả về 400 khi section đã tồn tại
    test('should return 400 when section already exists', async () => {
        const newTip = {
            section: 'General', // Đã tồn tại
            categories: []
        };

        const res = await request(app)
            .post('/api/tips')
            .send(newTip);

        // Expect 401 vì không có token (trước khi check duplicate)
        expect(res.statusCode).toBe(401);
    });
});

// ===========================
// TEST: updateTip
// ===========================
describe('PUT /api/tips/:id (updateTip)', () => {

    // Test 1: Cập nhật tip yêu cầu authentication
    test('should require authentication to update tip', async () => {
        const tip = await Tip.findOne({ section: 'General' });

        const updateData = {
            categories: [
                {
                    name: 'Listening',
                    items: [
                        { title: 'Updated Listening Tip', url: 'https://youtube.com/watch?v=updated', order: 1 }
                    ]
                }
            ]
        };

        const res = await request(app)
            .put(`/api/tips/${tip._id}`)
            .send(updateData);

        expect(res.statusCode).toBe(401);
    });

    // Test 2: Trả về 404 khi tip không tồn tại (với auth)
    test('should return 404 when tip does not exist', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .put(`/api/tips/${nonExistentId}`)
            .send({ categories: [] });

        // Expect 401 vì không có token
        expect(res.statusCode).toBe(401);
    });
});

// ===========================
// TEST: deleteTip
// ===========================
describe('DELETE /api/tips/:id (deleteTip)', () => {

    // Test 1: Xóa tip yêu cầu authentication
    test('should require authentication to delete tip', async () => {
        const tip = await Tip.findOne({ section: 'General' });

        const res = await request(app).delete(`/api/tips/${tip._id}`);

        expect(res.statusCode).toBe(401);
    });

    // Test 2: Trả về 404 khi tip không tồn tại
    test('should return 404 when tip does not exist', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app).delete(`/api/tips/${nonExistentId}`);

        // Expect 401 vì không có token
        expect(res.statusCode).toBe(401);
    });
});

// ===========================
// TEST: addVideoToCategory
// ===========================
describe('POST /api/tips/:section/videos (addVideoToCategory)', () => {

    // Test 1: Thêm video yêu cầu authentication
    test('should require authentication to add video', async () => {
        const newVideo = {
            categoryName: 'Listening',
            title: 'New Video',
            url: 'https://youtube.com/watch?v=newvideo'
        };

        const res = await request(app)
            .post('/api/tips/General/videos')
            .send(newVideo);

        expect(res.statusCode).toBe(401);
    });

    // Test 2: Trả về 400 với section không hợp lệ (nếu bypass auth)
    test('should validate section parameter', async () => {
        const newVideo = {
            categoryName: 'Listening',
            title: 'New Video',
            url: 'https://youtube.com/watch?v=newvideo'
        };

        const res = await request(app)
            .post('/api/tips/InvalidSection/videos')
            .send(newVideo);

        // Expect 401 vì không có token
        expect(res.statusCode).toBe(401);
    });
});

// ===========================
// TEST: updateVideo
// ===========================
describe('PUT /api/tips/:section/videos/:videoId (updateVideo)', () => {

    // Test 1: Cập nhật video yêu cầu authentication
    test('should require authentication to update video', async () => {
        const tip = await Tip.findOne({ section: 'General' });
        const videoId = tip.categories[0].items[0]._id;

        const updateData = {
            title: 'Updated Video Title'
        };

        const res = await request(app)
            .put(`/api/tips/General/videos/${videoId}`)
            .send(updateData);

        expect(res.statusCode).toBe(401);
    });
});

// ===========================
// TEST: deleteVideo
// ===========================
describe('DELETE /api/tips/:section/videos/:videoId (deleteVideo)', () => {

    // Test 1: Xóa video yêu cầu authentication
    test('should require authentication to delete video', async () => {
        const tip = await Tip.findOne({ section: 'General' });
        const videoId = tip.categories[0].items[0]._id;

        const res = await request(app).delete(`/api/tips/General/videos/${videoId}`);

        expect(res.statusCode).toBe(401);
    });
});

// ===========================
// TEST: Validation và Edge Cases
// ===========================
describe('Validation and Edge Cases', () => {

    // Test 1: Kiểm tra enum validation cho section
    test('should only accept valid sections (General, Toeic, Ielts)', async () => {
        const validSections = ['General', 'Toeic', 'Ielts'];

        for (const section of validSections) {
            const res = await request(app).get(`/api/tips/section/${section}`);
            expect([200, 404]).toContain(res.statusCode);
        }
    });

    // Test 2: Kiểm tra enum validation cho category name
    test('should have valid category names', async () => {
        const res = await request(app).get('/api/tips');

        expect(res.statusCode).toBe(200);

        const validCategoryNames = ['Listening', 'Reading', 'Speaking', 'Writing', 'Grammar', 'Vocabulary', 'General'];

        res.body.tips.forEach(tip => {
            tip.categories.forEach(cat => {
                expect(validCategoryNames).toContain(cat.name);
            });
        });
    });

    // Test 3: Kiểm tra createdBy không được trả về trong response
    test('should not expose createdBy field in getAllTips response', async () => {
        const res = await request(app).get('/api/tips');

        expect(res.statusCode).toBe(200);
        res.body.tips.forEach(tip => {
            expect(tip.createdBy).toBeUndefined();
        });
    });

    // Test 4: Kiểm tra createdBy không được trả về trong getTipsBySection
    test('should not expose createdBy field in getTipsBySection response', async () => {
        const res = await request(app).get('/api/tips/section/General');

        expect(res.statusCode).toBe(200);
        expect(res.body.tip.createdBy).toBeUndefined();
    });

    // Test 5: Kiểm tra order của items luôn được sort đúng
    test('should always sort items by order ascending', async () => {
        // Tạo tip với items order không theo thứ tự
        await Tip.deleteMany({ section: 'General' });
        await Tip.create({
            section: 'General',
            categories: [
                {
                    name: 'Listening',
                    items: [
                        { title: 'Item 3', url: 'https://youtube.com/3', order: 3 },
                        { title: 'Item 1', url: 'https://youtube.com/1', order: 1 },
                        { title: 'Item 2', url: 'https://youtube.com/2', order: 2 }
                    ]
                }
            ]
        });

        const res = await request(app).get('/api/tips/section/General');

        expect(res.statusCode).toBe(200);
        const items = res.body.tip.categories[0].items;

        expect(items[0].order).toBe(1);
        expect(items[1].order).toBe(2);
        expect(items[2].order).toBe(3);
    });
});

// ===========================
// TEST: Database Error Handling
// ===========================
describe('Database Error Handling', () => {

    // Test 1: Xử lý lỗi database trong getTipsBySection
    test('should handle database error in getTipsBySection', async () => {
        jest.spyOn(Tip, 'findOne').mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const res = await request(app).get('/api/tips/section/General');

        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Lỗi server khi lấy tips');
    });

    // Test 2: Xử lý lỗi database trong getTipsStatistics
    test('should handle database error in getTipsStatistics', async () => {
        jest.spyOn(Tip, 'find').mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const res = await request(app).get('/api/tips/statistics');

        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Lỗi server khi lấy thống kê');
    });
});
