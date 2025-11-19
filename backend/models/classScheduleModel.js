const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const classScheduleSchema = new Schema({
    
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    
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
    
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Lý do
    reason: { type: String, required: true }, // "Học bù do nghỉ lễ", "Dạy bù ngoài giờ"   
    
    status: {
        type: String,
        enum: ['draft', 'pending_approval', 'approved', 'rejected'],
        default: 'draft'
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
            file: { type: String, required: true }
        },
        deadline: { type: Date, required: true },
        answerFile: { type: String }
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
            score: { type: Number, required: true },
            skillType: {
                type: String,
                enum: ['reading', 'listening', 'writing', 'speaking'],
                required: true
            }
        }]
    }
}, { timestamps: true });

module.exports = mongoose.model('ClassSchedule', classScheduleSchema);

