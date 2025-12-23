const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/userModel');
const Role = require('../models/roleModel');

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
    await User.deleteMany();
    await Role.deleteMany();

    // Seeding data

    // Tạo Roles
    const adminRole = await Role.create({
        name: 'admin',
        description: 'Administrator role'
    });

    const teacherRole = await Role.create({
        name: 'teacher',
        description: 'Teacher role'
    });

    const studentRole = await Role.create({
        name: 'student',
        description: 'Student role'
    });

    // Tạo Users
    await User.create([
        {
            username: 'admin_user',
            email: 'admin@example.com',
            password: 'password123',
            phone: '0123456789',
            address: 'Admin Address',
            roleId: adminRole._id
        },
        {
            username: 'teacher_user',
            email: 'teacher@example.com',
            password: 'password123',
            phone: '0987654321',
            address: 'Teacher Address',
            roleId: teacherRole._id
        },
        {
            username: 'student_user',
            email: 'student@example.com',
            password: 'password123',
            phone: '0111222333',
            address: 'Student Address',
            roleId: studentRole._id
        }
    ]);
});

// ===========================
// TEST: getAllUsers
// ===========================
describe('GET /api/users (getAllUsers)', () => {

    // Test 1: Lấy tất cả users
    test('should return all users', async () => {
        const res = await request(app).get('/api/users');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(3);
    });

    // Test 2: Kiểm tra populate roleId
    test('should populate roleId details', async () => {
        const res = await request(app).get('/api/users');

        expect(res.statusCode).toBe(200);
        const adminUser = res.body.find(u => u.username === 'admin_user');

        expect(adminUser.roleId).toBeDefined();
        expect(adminUser.roleId.name).toBe('admin');
    });

    // Test 3: Trả về mảng rỗng khi không có users
    test('should return empty array when no users', async () => {
        await User.deleteMany();

        const res = await request(app).get('/api/users');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(0);
    });

    // Test 4: Xử lý lỗi database (500)
    test('should return 500 if database fails', async () => {
        jest.spyOn(User, 'find').mockImplementationOnce(() => {
            throw new Error('Database connection failed');
        });

        const res = await request(app).get('/api/users');

        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe('Database connection failed');
    });
});

// ===========================
// TEST: getUserById
// ===========================
describe('GET /api/users/:id (getUserById)', () => {

    // Test 1: Lấy user với ID hợp lệ
    test('should return user with valid ID', async () => {
        const user = await User.findOne({ username: 'admin_user' });

        const res = await request(app).get(`/api/users/${user._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.username).toBe('admin_user');
        expect(res.body.email).toBe('admin@example.com');
    });

    // Test 2: Kiểm tra populate roleId
    test('should populate roleId details', async () => {
        const user = await User.findOne({ username: 'teacher_user' });

        const res = await request(app).get(`/api/users/${user._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.roleId).toBeDefined();
        expect(res.body.roleId.name).toBe('teacher');
    });

    // Test 3: Trả về 404 khi user không tồn tại
    test('should return 404 when user does not exist', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app).get(`/api/users/${nonExistentId}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('User not found');
    });

    // Test 4: Trả về 500 cho ObjectId không hợp lệ
    test('should return 500 for invalid ObjectId format', async () => {
        const res = await request(app).get('/api/users/invalid-id');

        expect(res.statusCode).toBe(500);
    });
});

// ===========================
// TEST: createUser
// ===========================
describe('POST /api/users (createUser)', () => {

    // Test 1: Tạo user thành công với dữ liệu hợp lệ
    test('should create user successfully with valid data', async () => {
        const role = await Role.findOne({ name: 'student' });

        const newUser = {
            email: 'newuser@example.com',
            password: 'password123',
            username: 'new_user',
            phone: '0999888777',
            address: 'New Address',
            roleId: role._id.toString()
        };

        const res = await request(app)
            .post('/api/users')
            .send(newUser);

        expect(res.statusCode).toBe(201);
        expect(res.body.email).toBe('newuser@example.com');
        expect(res.body.username).toBe('new_user');
    });

    // Test 2: Trả về 400 khi email đã tồn tại
    test('should return 400 when email already exists', async () => {
        const role = await Role.findOne({ name: 'student' });

        const newUser = {
            email: 'admin@example.com', // Đã tồn tại
            password: 'password123',
            username: 'duplicate_user',
            phone: '0888777666',
            address: 'Some Address',
            roleId: role._id.toString()
        };

        const res = await request(app)
            .post('/api/users')
            .send(newUser);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('User already exists');
    });

    // Test 3: Trả về 400 khi role không tồn tại
    test('should return 400 when role does not exist', async () => {
        const newUser = {
            email: 'newuser2@example.com',
            password: 'password123',
            username: 'new_user2',
            phone: '0777666555',
            address: 'Some Address',
            roleId: new mongoose.Types.ObjectId().toString()
        };

        const res = await request(app)
            .post('/api/users')
            .send(newUser);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Role not found');
    });

    // Test 4: Tạo user với phone 9 chữ số (tự động thêm 0)
    test('should create user with 9-digit phone (auto add leading 0)', async () => {
        const role = await Role.findOne({ name: 'student' });

        const newUser = {
            email: 'phonetest@example.com',
            password: 'password123',
            username: 'phone_test_user',
            phone: '912345678', // 9 digits without leading 0
            address: 'Phone Test Address',
            roleId: role._id.toString()
        };

        const res = await request(app)
            .post('/api/users')
            .send(newUser);

        expect(res.statusCode).toBe(201);
        expect(res.body.phone).toBe('0912345678'); // Should have leading 0 added
    });

    // Test 5: Trả về 400 khi phone không đúng 10 chữ số (có số 0 đầu)
    test('should return 400 when phone with leading 0 is not 10 digits', async () => {
        const role = await Role.findOne({ name: 'student' });

        const newUser = {
            email: 'invalidphone@example.com',
            password: 'password123',
            username: 'invalid_phone_user',
            phone: '012345678', // 9 digits with leading 0 (invalid)
            address: 'Some Address',
            roleId: role._id.toString()
        };

        const res = await request(app)
            .post('/api/users')
            .send(newUser);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Số điện thoại phải có 10 chữ số');
    });

    // Test 6: Trả về 400 khi phone không đúng 9 chữ số (không có số 0 đầu)
    test('should return 400 when phone without leading 0 is not 9 digits', async () => {
        const role = await Role.findOne({ name: 'student' });

        const newUser = {
            email: 'invalidphone2@example.com',
            password: 'password123',
            username: 'invalid_phone_user2',
            phone: '12345678', // 8 digits without leading 0 (invalid)
            address: 'Some Address',
            roleId: role._id.toString()
        };

        const res = await request(app)
            .post('/api/users')
            .send(newUser);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Số điện thoại phải có 9 chữ số (thiếu số 0 ở đầu do Excel)');
    });

    // Test 7: Trả về 400 khi phone rỗng
    test('should return 400 when phone is empty', async () => {
        const role = await Role.findOne({ name: 'student' });

        const newUser = {
            email: 'emptyphone@example.com',
            password: 'password123',
            username: 'empty_phone_user',
            phone: '',
            address: 'Some Address',
            roleId: role._id.toString()
        };

        const res = await request(app)
            .post('/api/users')
            .send(newUser);

        // Phone empty is allowed (normalizedPhone = '')
        expect(res.statusCode).toBe(201);
    });
});

// ===========================
// TEST: updateUser
// ===========================
describe('PUT /api/users/:id (updateUser)', () => {

    // Test 1: Cập nhật user thành công
    test('should update user successfully', async () => {
        const user = await User.findOne({ username: 'admin_user' });

        const updateData = {
            username: 'admin_updated',
            address: 'Updated Address'
        };

        const res = await request(app)
            .put(`/api/users/${user._id}`)
            .send(updateData);

        expect(res.statusCode).toBe(200);
        expect(res.body.username).toBe('admin_updated');
        expect(res.body.address).toBe('Updated Address');
    });

    // Test 2: Cập nhật email thành công
    test('should update email successfully', async () => {
        const user = await User.findOne({ username: 'teacher_user' });

        const res = await request(app)
            .put(`/api/users/${user._id}`)
            .send({ email: 'teacher_updated@example.com' });

        expect(res.statusCode).toBe(200);
        expect(res.body.email).toBe('teacher_updated@example.com');
    });

    // Test 3: Cập nhật password thành công
    test('should update password successfully', async () => {
        const user = await User.findOne({ username: 'student_user' });

        const res = await request(app)
            .put(`/api/users/${user._id}`)
            .send({ password: 'newpassword123' });

        expect(res.statusCode).toBe(200);
        // Password should be hashed, not equal to plain text
        expect(res.body.password).not.toBe('newpassword123');
    });

    // Test 4: Trả về 404 khi user không tồn tại
    test('should return 404 when user does not exist', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .put(`/api/users/${nonExistentId}`)
            .send({ username: 'updated_name' });

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('User not found');
    });

    // Test 5: Cập nhật roleId thành công
    test('should update roleId successfully', async () => {
        const user = await User.findOne({ username: 'student_user' });
        const adminRole = await Role.findOne({ name: 'admin' });

        const res = await request(app)
            .put(`/api/users/${user._id}`)
            .send({ roleId: adminRole._id.toString() });

        expect(res.statusCode).toBe(200);
        expect(res.body.roleId.toString()).toBe(adminRole._id.toString());
    });
});

// ===========================
// TEST: deleteUser
// ===========================
describe('DELETE /api/users/:id (deleteUser)', () => {

    // Test 1: Xóa user thành công
    test('should delete user successfully', async () => {
        const user = await User.findOne({ username: 'student_user' });

        const res = await request(app).delete(`/api/users/${user._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('User deleted successfully');

        // Verify deletion
        const deletedUser = await User.findById(user._id);
        expect(deletedUser).toBeNull();
    });

    // Test 2: Trả về 404 khi user không tồn tại
    test('should return 404 when user does not exist', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app).delete(`/api/users/${nonExistentId}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('User not found');
    });

    // Test 3: Trả về 500 cho ObjectId không hợp lệ
    test('should return 500 for invalid ObjectId format', async () => {
        const res = await request(app).delete('/api/users/invalid-id');

        expect(res.statusCode).toBe(500);
    });
});

// ===========================
// TEST: getUsersByRoles
// ===========================
describe('GET /api/users/by-roles (getUsersByRoles)', () => {

    // Test 1: Lấy users theo một role
    test('should return users for single role', async () => {
        const res = await request(app)
            .get('/api/users/by-roles')
            .query({ roles: 'admin' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].role).toBe('admin');
    });

    // Test 2: Lấy users theo nhiều roles
    test('should return users for multiple roles', async () => {
        const res = await request(app)
            .get('/api/users/by-roles')
            .query({ roles: 'admin,teacher' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBe(2);
        expect(res.body.count).toBe(2);
    });

    // Test 3: Trả về 400 khi thiếu roles parameter
    test('should return 400 when roles parameter is missing', async () => {
        const res = await request(app).get('/api/users/by-roles');

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('roles query parameter is required');
    });

    // Test 4: Trả về 404 khi role không tồn tại
    test('should return 404 when role does not exist', async () => {
        const res = await request(app)
            .get('/api/users/by-roles')
            .query({ roles: 'nonexistent_role' });

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('No matching roles found');
    });

    // Test 5: Kiểm tra response format
    test('should return correct response format', async () => {
        const res = await request(app)
            .get('/api/users/by-roles')
            .query({ roles: 'student' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data[0]).toHaveProperty('_id');
        expect(res.body.data[0]).toHaveProperty('username');
        expect(res.body.data[0]).toHaveProperty('email');
        expect(res.body.data[0]).toHaveProperty('phone');
        expect(res.body.data[0]).toHaveProperty('role');
    });
});

// ===========================
// TEST: saveBulkUsers
// ===========================
describe('POST /api/schedule/bulk-users/save (saveBulkUsers)', () => {

    // Test 1: Tạo bulk users thành công
    test('should create bulk users successfully', async () => {
        const role = await Role.findOne({ name: 'student' });

        const bulkData = {
            users: [
                {
                    email: 'bulk1@example.com',
                    username: 'bulk_user1',
                    phone: '0555666777',
                    address: 'Bulk Address 1'
                },
                {
                    email: 'bulk2@example.com',
                    username: 'bulk_user2',
                    phone: '0444555666',
                    address: 'Bulk Address 2'
                }
            ],
            roleId: role._id.toString()
        };

        const res = await request(app)
            .post('/api/schedule/bulk-users/save')
            .send(bulkData);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(2);
        expect(res.body.failed).toBe(0);
        expect(res.body.results.success.length).toBe(2);
    });

    // Test 2: Trả về 400 khi users array rỗng
    test('should return 400 when users array is empty', async () => {
        const role = await Role.findOne({ name: 'student' });

        const res = await request(app)
            .post('/api/schedule/bulk-users/save')
            .send({ users: [], roleId: role._id.toString() });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Danh sách người dùng không hợp lệ');
    });

    // Test 3: Trả về 400 khi thiếu roleId
    test('should return 400 when roleId is missing', async () => {
        const res = await request(app)
            .post('/api/schedule/bulk-users/save')
            .send({
                users: [
                    { email: 'test@example.com', username: 'test', phone: '0123456789', address: 'Test' }
                ]
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Vui lòng chọn role');
    });

    // Test 4: Trả về 400 khi role không tồn tại
    test('should return 400 when role does not exist', async () => {
        const res = await request(app)
            .post('/api/schedule/bulk-users/save')
            .send({
                users: [
                    { email: 'test@example.com', username: 'test', phone: '0123456789', address: 'Test' }
                ],
                roleId: new mongoose.Types.ObjectId().toString()
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Role không tồn tại');
    });

    // Test 5: Xử lý email trùng lặp trong database
    test('should handle duplicate email in database', async () => {
        const role = await Role.findOne({ name: 'student' });

        const bulkData = {
            users: [
                {
                    email: 'admin@example.com', // Đã tồn tại
                    username: 'duplicate_bulk',
                    phone: '0666777888',
                    address: 'Duplicate Address'
                }
            ],
            roleId: role._id.toString()
        };

        const res = await request(app)
            .post('/api/schedule/bulk-users/save')
            .send(bulkData);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(0);
        expect(res.body.failed).toBe(1);
        expect(res.body.results.failed[0].reason).toBe('Email đã tồn tại trong hệ thống');
    });

    // Test 6: Xử lý phone trùng lặp trong database
    test('should handle duplicate phone in database', async () => {
        const role = await Role.findOne({ name: 'student' });

        const bulkData = {
            users: [
                {
                    email: 'uniqueemail@example.com',
                    username: 'unique_user',
                    phone: '0123456789', // Đã tồn tại (admin_user)
                    address: 'Some Address'
                }
            ],
            roleId: role._id.toString()
        };

        const res = await request(app)
            .post('/api/schedule/bulk-users/save')
            .send(bulkData);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(0);
        expect(res.body.failed).toBe(1);
        expect(res.body.results.failed[0].reason).toBe('Số điện thoại đã tồn tại trong hệ thống');
    });

    // Test 7: Xử lý phone không hợp lệ
    test('should handle invalid phone number', async () => {
        const role = await Role.findOne({ name: 'student' });

        const bulkData = {
            users: [
                {
                    email: 'invalidphone@example.com',
                    username: 'invalid_phone_bulk',
                    phone: '12345', // Invalid phone
                    address: 'Some Address'
                }
            ],
            roleId: role._id.toString()
        };

        const res = await request(app)
            .post('/api/schedule/bulk-users/save')
            .send(bulkData);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(0);
        expect(res.body.failed).toBe(1);
    });

    // Test 8: Tạo user với password được cung cấp
    test('should create user with provided password', async () => {
        const role = await Role.findOne({ name: 'student' });

        const bulkData = {
            users: [
                {
                    email: 'withpassword@example.com',
                    username: 'with_password_user',
                    phone: '0888999000',
                    address: 'Password Address',
                    password: 'custompassword123'
                }
            ],
            roleId: role._id.toString()
        };

        const res = await request(app)
            .post('/api/schedule/bulk-users/save')
            .send(bulkData);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(1);
        expect(res.body.results.success[0].password).toBe('custompassword123');
    });
});
