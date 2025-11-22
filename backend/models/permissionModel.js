const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const permissionSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    permissions: {
        type: Map,
        of: [String], // Array of allowed actions
        default: {}
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Permission', permissionSchema);

