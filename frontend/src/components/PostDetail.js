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
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
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

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to comment');
      return;
    }
    
    if (!commentText.trim()) {
      alert('Please enter a comment');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const result = await dispatch(addComment({ postId: id, text: commentText }));
      
      if (result.payload && result.payload._id) {
        setCommentText('');
        alert('Comment added successfully!');
      } else {
        alert('Failed to add comment');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setSubmitting(false);
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
        
        {user ? (
          <form onSubmit={handleAddComment} className="comment-form">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              required
              rows="3"
            />
            <button type="submit" disabled={submitting}>
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <p>Please login to comment</p>
        )}

        <div className="comments-list">
          {postComments.length === 0 ? (
            <p>No comments yet. Be the first to comment!</p>
          ) : (
            postComments.map((comment) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;