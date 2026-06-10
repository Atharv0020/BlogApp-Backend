import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://blogapp-backend-q0re.onrender.com/api';

export const fetchComments = createAsyncThunk('comments/fetchComments', async (postId) => {
  const response = await axios.get(`${API_URL}/comments/post/${postId}`);
  return { postId, comments: response.data };
});

export const addComment = createAsyncThunk('comments/addComment', async ({ postId, text }) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_URL}/comments`,
    { postId, text },
    { headers: { 'x-auth-token': token } }
  );
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
  initialState: { comments: {}, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.comments[action.payload.postId] = action.payload.comments;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const postId = action.payload.postId;
        if (!state.comments[postId]) state.comments[postId] = [];
        state.comments[postId] = [action.payload, ...state.comments[postId]];
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        for (let postId in state.comments) {
          state.comments[postId] = state.comments[postId].filter(c => c._id !== action.payload);
        }
      });
  }
});

export default commentSlice.reducer;