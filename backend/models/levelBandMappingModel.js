const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const levelBandMappingSchema = new Schema({
    type: {
        type: String,
        enum: ['ielts', 'toeic', 'cam'],
        required: true
    },
    level: {
        type: String,
        enum: ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
        required: true
    },
    band: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Đảm bảo type + level là unique
levelBandMappingSchema.index({ type: 1, level: 1 }, { unique: true });

module.exports = mongoose.model('LevelBandMapping', levelBandMappingSchema);

