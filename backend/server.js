const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// ========== CORS CONFIGURATION (FIXED) ==========
const allowedOrigins = [
  'https://blog-app-backend-dako.vercel.app',
  'https://blog-app-backend.vercel.app',
  'https://blog-app-frontend.vercel.app',
  'http://localhost:3000',
  'http://localhost:5000'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log('Blocked origin:', origin);
      return callback(null, false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== MONGODB CONNECTION ==========
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://atharvmore0009_db_user:atharv09@am.lsminjv.mongodb.net/blogapp?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully!');
  console.log('📊 Database: MongoDB Atlas');
})
.catch(err => {
  console.log('❌ MongoDB Error:', err.message);
  console.log('⚠️ Continuing with limited functionality...');
});

// ========== DEBUG ROUTE (Check if routes are loaded) ==========
app.get('/debug-routes', (req, res) => {
  const fs = require('fs');
  try {
    const routesDir = path.join(__dirname, 'routes');
    const files = fs.existsSync(routesDir) ? fs.readdirSync(routesDir) : [];
    res.json({
      message: 'Debug information',
      routesDirectory: routesDir,
      directoryExists: fs.existsSync(routesDir),
      files: files,
      currentDirectory: __dirname,
      nodeVersion: process.version
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// ========== API ROUTES ==========
console.log('📡 Loading API routes...');

// Auth routes
try {
  app.use('/api/auth', require('./routes/auth'));
  console.log('✅ /api/auth routes loaded');
} catch (err) {
  console.log('❌ Failed to load /api/auth:', err.message);
}

// Posts routes
try {
  app.use('/api/posts', require('./routes/posts'));
  console.log('✅ /api/posts routes loaded');
} catch (err) {
  console.log('❌ Failed to load /api/posts:', err.message);
}

// Comments routes
try {
  app.use('/api/comments', require('./routes/comments'));
  console.log('✅ /api/comments routes loaded');
} catch (err) {
  console.log('❌ Failed to load /api/comments:', err.message);
}

// ========== TEST ENDPOINTS ==========

// Root test endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Backend is working!',
    status: 'online',
    timestamp: new Date().toISOString(),
    endpoints: {
      posts: '/api/posts',
      auth: '/api/auth',
      comments: '/api/comments'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /debug-routes',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/posts',
      'POST /api/posts',
      'GET /api/comments/post/:postId',
      'POST /api/comments'
    ]
  });
});

// ========== ERROR HANDLING MIDDLEWARE ==========
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});