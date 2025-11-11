// Category.js - Mongoose model for categories
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      trim: true,
      unique: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
  },
  { timestamps: true }
);

CategorySchema.pre('save', function (next) {
  if (!this.isModified('name')) {
    return next();
  }
  this.slug = this.name
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
  next();
});

module.exports = mongoose.model('Category', CategorySchema);


