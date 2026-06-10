import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://blog-backend.onrender.com/api';

export const fetchComments = createAsyncThunk('comments/fetchComments', async (postId) => {
  const response = await axios.get(`${API_URL}/comments/post/${postId}`);
  return { postId, comments: response.data };
});

export const addComment = createAsyncThunk('comments/addComment', async (commentData) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/comments`, commentData, {
    headers: { 'x-auth-token': token }
  });
  return response.data;
});

export const deleteComment = createAsyncThunk('comments/deleteComment', async (id) => {
  const token = localStorage.getItem('token');
  await axios.delete(`${API_URL}/comments/${id}`, {
    headers: { 'x-auth-token': token }
  });
  return id;
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