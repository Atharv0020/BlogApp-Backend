import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://blogapp-backend-q0re.onrender.com/api';

// Fetch all posts
export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  const response = await axios.get(`${API_URL}/posts`);
  return response.data;
});

// Create a post
export const createPost = createAsyncThunk('posts/createPost', async (postData) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/posts`, postData, {
    headers: { 'x-auth-token': token }
  });
  return response.data;
});

// Delete a post
export const deletePost = createAsyncThunk('posts/deletePost', async (id) => {
  const token = localStorage.getItem('token');
  await axios.delete(`${API_URL}/posts/${id}`, {
    headers: { 'x-auth-token': token }
  });
  return id;
});

// Like a post
export const likePost = createAsyncThunk('posts/likePost', async (id) => {
  const token = localStorage.getItem('token');
  const response = await axios.put(`${API_URL}/posts/like/${id}`, {}, {
    headers: { 'x-auth-token': token }
  });
  return { id, data: response.data };
});

const postSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state) => {
        state.loading = false;
        state.error = 'Failed to fetch posts';
      })
      // Create post
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })
      // Delete post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(post => post._id !== action.payload);
      })
      // Like post
      .addCase(likePost.fulfilled, (state, action) => {
        const post = state.posts.find(p => p._id === action.payload.id);
        if (post) {
          post.likeCount = action.payload.data.likeCount;
        }
      });
  }
});

export default postSlice.reducer;