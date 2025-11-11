const express = require('express');
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

// GET /api/categories
router.get('/', categoryController.getCategories);

// POST /api/categories
router.post(
  '/',
  [body('name').isString().trim().isLength({ min: 2, max: 50 }), body('description').optional().isString()],
  categoryController.createCategory
);

module.exports = router;


