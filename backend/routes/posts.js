const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// GET all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    console.log(`Found ${posts.length} posts`);
    res.json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// GET single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// CREATE post
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating post for user:', req.userId);
    console.log('Post data:', req.body);
    
    const { title, content, image } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ msg: 'Title and content are required' });
    }
    
    const newPost = new Post({
      title,
      content,
      image: image || '',
      author: req.userId,
      authorName: req.userName,
      likes: [],
      likeCount: 0
    });
    
    const post = await newPost.save();
    console.log('Post created successfully:', post._id);
    res.json(post);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// DELETE post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    if (post.author.toString() !== req.userId) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    await post.deleteOne();
    res.json({ msg: 'Post deleted' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// LIKE/UNLIKE post
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    const userId = req.userId;
    const alreadyLiked = post.likes.includes(userId);
    
    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter(id => id.toString() !== userId);
      post.likeCount = post.likes.length;
      console.log(`User ${userId} unliked post ${req.params.id}`);
    } else {
      // Like
      post.likes.push(userId);
      post.likeCount = post.likes.length;
      console.log(`User ${userId} liked post ${req.params.id}`);
    }
    
    await post.save();
    res.json({ 
      likeCount: post.likeCount, 
      liked: !alreadyLiked 
    });
  } catch (err) {
    console.error('Error liking post:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;