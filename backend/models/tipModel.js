const mongoose = require('mongoose');

const tipItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  }
}, { _id: true });

const tipCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Listening', 'Reading', 'Speaking', 'Writing', 'Grammar', 'Vocabulary', 'General']
  },
  items: [tipItemSchema]
}, { _id: true });

const TipSchema = new mongoose.Schema({
  section: {
    type: String,
    required: true,
    enum: ['General', 'Toeic', 'Ielts'],
    index: true
  },
  categories: [tipCategorySchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better query performance
TipSchema.index({ section: 1, 'categories.name': 1 });

module.exports = mongoose.model('Tip', TipSchema);
