import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://blogapp-backend-q0re.onrender.com/api';

export const fetchComments = createAsyncThunk('comments/fetchComments', async (postId) => {
  const response = await axios.get(`${API_URL}/comments/post/${postId}`);
  return { postId, comments: response.data };
});

export const addComment = createAsyncThunk('comments/addComment', async (commentData, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return rejectWithValue('Please login to comment');
    }
    const response = await axios.post(`${API_URL}/comments`, commentData, {
      headers: { 'x-auth-token': token }
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.msg || error.message);
  }
});

export const deleteComment = createAsyncThunk('comments/deleteComment', async (id, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return rejectWithValue('No token found');
    }
    await axios.delete(`${API_URL}/comments/${id}`, {
      headers: { 'x-auth-token': token }
    });
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.msg || error.message);
  }
});

const commentSlice = createSlice({
  name: 'comments',
  initialState: {
    comments: {},
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.comments[action.payload.postId] = action.payload.comments;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const postId = action.payload.postId;
        if (!state.comments[postId]) {
          state.comments[postId] = [];
        }
        state.comments[postId].unshift(action.payload);
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        for (let postId in state.comments) {
          state.comments[postId] = state.comments[postId].filter(
            comment => comment._id !== action.payload
          );
        }
      });
  }
});

export default commentSlice.reducer;