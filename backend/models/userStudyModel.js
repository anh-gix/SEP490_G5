const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userStudySchema = new Schema({
    // Bài tập về nhà của học sinh
    userhomework: [{
        submissionDate: { type: Date, required: true },
        submitter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        file: { type: String, required: true },
        status: {
            type: String,
            enum: ['pending', 'submitted', 'graded', 'late'],
            default: 'pending'
        },
        gradingFile: { type: String }
    }],
    
    // Bài thi thử của học sinh
    usermocktest: [{
        title: { type: String, required: true },
        type: {
            type: String,
            enum: ['ielts', 'toeic', 'cam'],
            required: true
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
    }]
}, { timestamps: true });

module.exports = mongoose.model('UserStudy', userStudySchema);

