const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentOnlineLearning = new Schema({
    courseId: {type: Schema.Types.ObjectId, ref: 'Course', required: true },
    studentId: {type: Schema.Types.ObjectId, ref: 'Student', required: true },
    sessionProgress: [{
        sessionId: { type: Schema.Types.ObjectId, ref: 'camSession', required: true },
        isCompleted: { 
            video: { type: Boolean, default: false },
            quiz: { type: Boolean, default: false },
            vocabulary: { type: Boolean, default: false }
        },
    }]
}, { timestamps: true });

module.exports = mongoose.model('StudentOnlineLearning', studentOnlineLearning);