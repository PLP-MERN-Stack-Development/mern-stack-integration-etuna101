const express = require('express');
const { body, param, query } = require('express-validator');
const postController = require('../controllers/postController');

const router = express.Router();

// GET /api/posts
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('category').optional().isString(),
  ],
  postController.getPosts
);

// GET /api/posts/:id (id or slug)
router.get('/:id', [param('id').isString()], postController.getPostByIdOrSlug);

// POST /api/posts
router.post(
  '/',
  [
    body('title').isString().trim().isLength({ min: 3, max: 100 }),
    body('content').isString().isLength({ min: 1 }),
    body('category').isString(),
    body('tags').optional().isArray(),
    body('isPublished').optional().isBoolean(),
    body('featuredImage').optional().isString(),
    body('excerpt').optional().isString().isLength({ max: 200 }),
  ],
  postController.createPost
);

// PUT /api/posts/:id
router.put(
  '/:id',
  [
    param('id').isMongoId(),
    body('title').optional().isString().trim().isLength({ min: 3, max: 100 }),
    body('content').optional().isString().isLength({ min: 1 }),
    body('category').optional().isString(),
    body('tags').optional().isArray(),
    body('isPublished').optional().isBoolean(),
    body('featuredImage').optional().isString(),
    body('excerpt').optional().isString().isLength({ max: 200 }),
  ],
  postController.updatePost
);

// DELETE /api/posts/:id
router.delete('/:id', [param('id').isMongoId()], postController.deletePost);

// POST /api/posts/:id/comments
router.post(
  '/:id/comments',
  [param('id').isMongoId(), body('content').isString().isLength({ min: 1 })],
  postController.addComment
);

// GET /api/posts/search?q=
router.get('/search', [query('q').isString()], postController.searchPosts);

module.exports = router;


