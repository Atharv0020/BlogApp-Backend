const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

// Get comments for a post
router.get('/post/:postId', async (req, res) => {
  const comments = await Comment.find({ postId: req.params.postId }).sort({ createdAt: -1 });
  res.json(comments);
});

// Add comment
router.post('/', auth, async (req, res) => {
  const { postId, text } = req.body;
  const comment = new Comment({
    postId,
    userId: req.userId,
    userName: req.userName,
    text
  });
  await comment.save();
  res.json(comment);
});

// Delete comment
router.delete('/:id', auth, async (req, res) => {
  await Comment.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;