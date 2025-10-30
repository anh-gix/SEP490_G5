const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const classScheduleSchema = new Schema({
    
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    
    session: { type: Schema.Types.ObjectId, ref: 'Session' }, 
    
    topic: { type: String, required: true }, // "Dạy bù Buổi 5", "Luyện tập ngoài giờ"
    
    //Thời gian và địa điểm
    date:{ type: Date, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Lý do
    reason: { type: String, required: true }, // "Học bù do nghỉ lễ", "Dạy bù ngoài giờ"
    rejectionReason: { type: String }, // Lý do từ chối
    
    
    status: {
        type: String,
        enum: ['draft', 'pending_approval', 'approved', 'rejected'],
        default: 'draft'
    }
}, { timestamps: true });

module.exports = mongoose.model('ClassSchedule', classScheduleSchema);

