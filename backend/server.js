const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ===== MONGODB ATLAS CONNECTION =====
const connectDB = async () => {
  try {
    // Try Atlas First
    const atlasURI = 'mongodb+srv://atharvmore0009_db_user:atharv09@am.lsminjv.mongodb.net/blogapp?retryWrites=true&w=majority';
    
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(atlasURI);
    console.log('✅✅✅ MONGODB ATLAS CONNECTED! ✅✅✅');
    console.log('📊 Database: Atlas Cloud (blogapp)');
    
  } catch (atlasError) {
    console.log('❌ Atlas failed:', atlasError.message);
    console.log('🔄 Falling back to Local MongoDB...');
    
    try {
      // Fallback to Local
      await mongoose.connect('mongodb://localhost:27017/blogapp');
      console.log('✅ Local MongoDB Connected!');
      console.log('📊 Database: Local (blogapp)');
    } catch (localError) {
      console.error('❌ Both connections failed!');
      console.error('Local error:', localError.message);
      process.exit(1);
    }
  }
};

// Call connection
connectDB();

// ===== ROUTES =====
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/comments', require('./routes/comments'));

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/posts`);
});