const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String
    },
    program: {
        type: Schema.Types.ObjectId,
        ref: 'Program',
        required: true
    },
    // Thêm type (ielts, toeic, cam)
    type: {
        type: String,
        enum: ['ielts', 'toeic', 'cam'],
        required: true
    },
    // Thêm level
    level: {
        type: String,
        enum: ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
        required: true
    },
    // Thêm band (map với level)
    // IELTS: A1 (0-2.5), A2 (3.0-3.5), B1 (4.0-5.0), B2 (5.5-6.5), C1 (7.0-8.0), C2 (8.5-9.0)
    // TOEIC: A1 (0-250), A2 (251-500), B1 (501-700), B2 (701-900), C1 (901-990), C2 (990+)
    // CAM: Pre-A1 (Starter), A1 (Mover)
    band: {
        type: String
    },
    // Thêm học phí
    tuitionFee: {
        type: Number,
        default: 0
    },
    clos: [{
        type: Schema.Types.ObjectId,
        ref: 'CLO'
    }],
    sessions: [{
        type: Schema.Types.ObjectId,
        ref: 'Session'
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    submittedAt: {
        type: Date
    },
    revisionReason: {
        type: String
    },
    status: {
        type: String,
        enum: ['draft', 'pending_approval', 'approved', 'needs_revision', 'archived'],
        default: 'draft'
    }
}, { timestamps: true });

// Pre-save hook để tự động set band từ database nếu chưa có
courseSchema.pre('save', async function(next) {
    // Chỉ set band nếu có type và level nhưng chưa có band
    if (this.type && this.level && !this.band) {
        try {
            const LevelBandMapping = mongoose.model('LevelBandMapping');
            const mapping = await LevelBandMapping.findOne({ 
                type: this.type, 
                level: this.level 
            });
            if (mapping) {
                this.band = mapping.band;
            }
        } catch (error) {
            // Nếu không tìm thấy mapping, để band là null
            console.warn(`No mapping found for type: ${this.type}, level: ${this.level}`);
        }
    }
    next();
});

// Static method để lấy band từ database
courseSchema.statics.getBandByLevel = async function(type, level) {
    const LevelBandMapping = mongoose.model('LevelBandMapping');
    const mapping = await LevelBandMapping.findOne({ type, level });
    return mapping ? mapping.band : null;
};

// Static method để lấy tất cả mappings
courseSchema.statics.getAllMappings = async function() {
    const LevelBandMapping = mongoose.model('LevelBandMapping');
    return await LevelBandMapping.find().sort({ type: 1, level: 1 });
};

// Method để cập nhật band từ database
courseSchema.methods.updateBandFromDB = async function() {
    if (this.type && this.level) {
        const LevelBandMapping = mongoose.model('LevelBandMapping');
        const mapping = await LevelBandMapping.findOne({ 
            type: this.type, 
            level: this.level 
        });
        if (mapping) {
            this.band = mapping.band;
            await this.save();
            return this.band;
        }
    }
    return null;
};

module.exports = mongoose.model('Course', courseSchema);
