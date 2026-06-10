import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://blogapp-backend-q0re.onrender.com/api';

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  const response = await axios.get(`${API_URL}/posts`);
  return response.data;
});

export const createPost = createAsyncThunk('posts/createPost', async (postData, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return rejectWithValue('No token found. Please login.');
    }
    const response = await axios.post(`${API_URL}/posts`, postData, {
      headers: { 'x-auth-token': token }
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.msg || error.message);
  }
});

export const deletePost = createAsyncThunk('posts/deletePost', async (id, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return rejectWithValue('No token found');
    }
    await axios.delete(`${API_URL}/posts/${id}`, {
      headers: { 'x-auth-token': token }
    });
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.msg || error.message);
  }
});

export const likePost = createAsyncThunk('posts/likePost', async (id, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return rejectWithValue('Please login to like posts');
    }
    const response = await axios.put(`${API_URL}/posts/like/${id}`, {}, {
      headers: { 'x-auth-token': token }
    });
    return { id, data: response.data };
  } catch (error) {
    return rejectWithValue(error.response?.data?.msg || error.message);
  }
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
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(post => post._id !== action.payload);
      })
      // Like Post
      .addCase(likePost.fulfilled, (state, action) => {
        const post = state.posts.find(p => p._id === action.payload.id);
        if (post) {
          post.likeCount = action.payload.data.likeCount;
        }
      });
  }
});

export default postSlice.reducer;