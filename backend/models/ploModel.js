const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ploSchema = new Schema({
    code: {
        type: String,
        required: [true, 'Mã PLO là bắt buộc'],
        unique: true
    },

    name: {
        type: String,
        required: [true, 'Tên PLO là bắt buộc']
    },

    detail: {
        type: String,
        required: [true, 'Chi tiết PLO là bắt buộc']
    },

}, { timestamps: true });

module.exports = mongoose.model('PLO', ploSchema);
