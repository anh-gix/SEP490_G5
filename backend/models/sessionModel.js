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
        type: String

    },
    clos: [{
        type: Schema.Types.ObjectId,
        ref: 'CLO'
    }],
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
