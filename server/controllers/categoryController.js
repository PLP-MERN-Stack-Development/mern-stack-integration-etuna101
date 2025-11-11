const { validationResult } = require('express-validator');
const Category = require('../models/Category');

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
}

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const validation = handleValidation(req, res);
    if (validation) return;
    const { name, description } = req.body;
    const existing = await Category.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }
    const category = await Category.create({ name, description });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};


