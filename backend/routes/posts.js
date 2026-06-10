const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// Handle OPTIONS preflight
router.options('/', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-auth-token');
  res.sendStatus(200);
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create post
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, image } = req.body;
    const newPost = new Post({
      title,
      content,
      image,
      author: req.userId,
      authorName: req.userName
    });
    const post = await newPost.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    if (post.author.toString() !== req.userId) return res.status(401).json({ msg: 'Not authorized' });
    await post.deleteOne();
    res.json({ msg: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Like post
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    
    if (post.likes.includes(req.userId)) {
      post.likes = post.likes.filter(like => like.toString() !== req.userId);
    } else {
      post.likes.push(req.userId);
    }
    post.likeCount = post.likes.length;
    await post.save();
    
    res.json({ likeCount: post.likeCount, liked: post.likes.includes(req.userId) });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;