const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

// GET comments for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).sort({ createdAt: -1 });
    console.log(`Found ${comments.length} comments for post ${req.params.postId}`);
    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// CREATE comment
router.post('/', auth, async (req, res) => {
  try {
    const { postId, text } = req.body;
    
    if (!postId || !text) {
      return res.status(400).json({ msg: 'Post ID and text are required' });
    }
    
    const newComment = new Comment({
      postId,
      userId: req.userId,
      userName: req.userName,
      text
    });
    
    const comment = await newComment.save();
    console.log('Comment created:', comment._id);
    res.json(comment);
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    
    if (comment.userId.toString() !== req.userId) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    await comment.deleteOne();
    res.json({ msg: 'Comment deleted' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;