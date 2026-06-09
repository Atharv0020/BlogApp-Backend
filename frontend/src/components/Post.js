import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { deletePost, likePost } from '../redux/slices/postSlice';

const Post = ({ post }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLike = () => {
    if (user) {
      dispatch(likePost(post._id));
    } else {
      alert('Please login to like posts');
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      dispatch(deletePost(post._id));
    }
  };

  return (
    <div className="post-card">
      {post.image && (
        <img src={post.image} alt={post.title} className="post-image" />
      )}
      <div className="post-content">
        <h2>{post.title}</h2>
        <p className="post-meta">
          By {post.authorName} | {new Date(post.createdAt).toLocaleDateString()}
        </p>
        <p className="post-text">{post.content.substring(0, 200)}...</p>
        <div className="post-actions">
          <Link to={`/post/${post._id}`} className="read-more">Read More</Link>
          <button onClick={handleLike} className="like-btn">
            ❤️ {post.likeCount} Likes
          </button>
          {user && user.id === post.author && (
            <button onClick={handleDelete} className="delete-btn">
              🗑️ Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Post;