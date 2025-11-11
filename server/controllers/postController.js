const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const Category = require('../models/Category');

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
}

exports.getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.category) {
      // allow either category id or slug
      const categoryFilter =
        mongoose.isValidObjectId(req.query.category)
          ? { _id: req.query.category }
          : { slug: req.query.category };
      const category = await Category.findOne(categoryFilter).lean();
      if (category) {
        filter.category = category._id;
      }
    }

    const [items, total] = await Promise.all([
      Post.find(filter)
        .populate('category', 'name slug')
        .populate('author', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getPostByIdOrSlug = async (req, res, next) => {
  try {
    const { id } = req.params;
    const byId = mongoose.isValidObjectId(id)
      ? { _id: id }
      : { slug: id.toLowerCase() };

    const post = await Post.findOne(byId)
      .populate('category', 'name slug')
      .populate('author', 'name email')
      .lean();

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const validation = handleValidation(req, res);
    if (validation) return;

    const { title, content, category, tags, isPublished, featuredImage, excerpt } = req.body;

    const categoryDoc = await Category.findOne(
      mongoose.isValidObjectId(category) ? { _id: category } : { slug: category }
    );
    if (!categoryDoc) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }

    // author comes from auth in advanced stage; for now optional if provided
    const post = await Post.create({
      title,
      content,
      category: categoryDoc._id,
      tags: Array.isArray(tags) ? tags : [],
      isPublished: !!isPublished,
      featuredImage,
      excerpt,
      author: req.user?._id || new mongoose.Types.ObjectId(), // placeholder if auth not ready
    });

    res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const validation = handleValidation(req, res);
    if (validation) return;

    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.category) {
      const categoryDoc = await Category.findOne(
        mongoose.isValidObjectId(updates.category)
          ? { _id: updates.category }
          : { slug: updates.category }
      );
      if (!categoryDoc) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }
      updates.category = categoryDoc._id;
    }

    const post = await Post.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findByIdAndDelete(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
};

exports.searchPosts = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) {
      return res.json({ success: true, data: [] });
    }
    const regex = new RegExp(q, 'i');
    const posts = await Post.find({
      $or: [{ title: regex }, { content: regex }, { excerpt: regex }, { tags: regex }],
    })
      .limit(20)
      .lean();
    res.json({ success: true, data: posts });
  } catch (err) {
    next(err);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const validation = handleValidation(req, res);
    if (validation) return;

    const { id } = req.params;
    const { content } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    await post.addComment(req.user?._id || new mongoose.Types.ObjectId(), content);
    res.status(201).json({ success: true, message: 'Comment added' });
  } catch (err) {
    next(err);
  }
};


