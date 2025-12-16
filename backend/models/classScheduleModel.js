const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const classScheduleSchema = new Schema({
    
    class: { type: Schema.Types.ObjectId, ref: 'Class'},
    
    session: { type: Schema.Types.ObjectId, ref: 'Session' }, //Noi dung buoi hoc
    
    //Thời gian và địa điểm
    date:{ type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    
    // Thêm teacher (id)
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Thêm teacher dạy thay (id)
    substituteTeacher: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    status: {
        type: String,
        enum: ['temporary', 'fixed', 'completed'],//temporary: buổi tạm, fixed: buổi cố định
        default: 'fixed'
    },
    
    // Bài tập về nhà
    homework: [{
        _id: {
            type: Schema.Types.ObjectId,
            auto: true,
            // Unique ID cho homework để HomeworkSubmission tham chiếu
        },
        assignment: {
            title: { type: String, required: true },
            description: { type: String }, // Mô tả bài tập
            files: [{ type: String }] // Changed from 'file' to 'files' array
        },
        deadline: { type: Date, required: true },
        answerFiles: [{ type: String }], // Changed from 'answerFile' to 'answerFiles' array
        // Removed: userstudy field (deprecated - use HomeworkSubmission model instead)
    }],
    
    // Tài liệu học tập
    material: [{
        title: { type: String, required: true },
        file: { type: String, required: true }
    }],
    
    // Ghi chú
    note: { type: String },
    
    // Bài thi thử
    mocktest: {
        title: { type: String },
        order: { type: Number },
        type: {
            type: String,
            enum: ['ielts', 'toeic', 'cam']
        },
        scores: [{
            studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            reading: { type: Number },
            listening: { type: Number },
            writing: { type: Number },
            speaking: { type: Number }
        }],
        answerFile: { type: String }
    }
}, { timestamps: true });

module.exports = mongoose.model('ClassSchedule', classScheduleSchema);

