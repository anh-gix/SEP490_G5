const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        required: true
    },
    content: {
        type: String

    },
    learningType: {
        type: String,
        enum: ['theory', 'mocktest'],
        default: 'theory'
    },

    // Lưu _id của CLO trong course (CLO là embedded trong Course)
    clos: [{
        type: Schema.Types.ObjectId
    }],
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
