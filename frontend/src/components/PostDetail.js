import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts, likePost } from '../redux/slices/postSlice';
import { fetchComments, addComment, deleteComment } from '../redux/slices/commentSlice';

const PostDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { posts } = useSelector((state) => state.posts);
  const { comments } = useSelector((state) => state.comments);
  const [newComment, setNewComment] = useState('');
  
  const post = posts.find(p => p._id === id);
  const postComments = comments[id] || [];

  useEffect(() => {
    if (!post) {
      dispatch(fetchPosts());
    }
    dispatch(fetchComments(id));
  }, [dispatch, id, post]);

  const handleLike = () => {
    if (user) {
      dispatch(likePost(id));
    } else {
      alert('Please login to like posts');
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      dispatch(addComment({ postId: id, text: newComment }));
      setNewComment('');
    }
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Delete this comment?')) {
      dispatch(deleteComment(commentId));
    }
  };

  if (!post) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="post-detail">
      <h1>{post.title}</h1>
      <p className="post-meta">
        By {post.authorName} | {new Date(post.createdAt).toLocaleDateString()}
      </p>
      {post.image && <img src={post.image} alt={post.title} className="detail-image" />}
      <p className="post-full-text">{post.content}</p>
      
      <button onClick={handleLike} className="like-btn-large">
        ❤️ {post.likeCount} Likes
      </button>

      <div className="comments-section">
        <h3>Comments ({postComments.length})</h3>
        
        {user && (
          <form onSubmit={handleAddComment} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              required
            />
            <button type="submit">Post Comment</button>
          </form>
        )}

        <div className="comments-list">
          {postComments.map((comment) => (
            <div key={comment._id} className="comment">
              <div className="comment-header">
                <strong>{comment.userName}</strong>
                <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                {user && user.id === comment.userId && (
                  <button onClick={() => handleDeleteComment(comment._id)} className="delete-comment">
                    Delete
                  </button>
                )}
              </div>
              <p>{comment.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;