const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

// Get comments for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD COMMENT - THIS IS THE FIXED VERSION
router.post('/', auth, async (req, res) => {
  try {
    const { postId, text } = req.body;
    
    console.log('Received comment request:');
    console.log('postId:', postId);
    console.log('text:', text);
    console.log('userId:', req.userId);
    console.log('userName:', req.userName);
    
    // Validation
    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
    }
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Comment text is required' });
    }
    
    // Create comment
    const comment = new Comment({
      postId: postId,
      userId: req.userId,
      userName: req.userName || 'Anonymous',
      text: text.trim()
    });
    
    const savedComment = await comment.save();
    console.log('Comment saved successfully:', savedComment._id);
    
    res.status(201).json(savedComment);
  } catch (err) {
    console.error('Error saving comment:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    if (comment.userId !== req.userId) {
      return res.status(401).json({ error: 'Not authorized' });
    }
    
    await comment.deleteOne();
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;