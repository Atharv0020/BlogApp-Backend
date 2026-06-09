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
    res.status(500).send('Server error');
  }
});

// Add comment
router.post('/', auth, async (req, res) => {
  try {
    const { postId, text } = req.body;
    
    const newComment = new Comment({
      postId,
      userId: req.userId,
      userName: req.userName,
      text
    });
    
    const comment = await newComment.save();
    res.json(comment);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Delete comment
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
    res.status(500).send('Server error');
  }
});

module.exports = router;