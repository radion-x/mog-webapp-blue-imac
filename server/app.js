const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-auth-token',
    'x-user-id',
    'x-email',
    'x-assessment-id'
  ]
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
const connectDB = async () => {
  try {
    // Log which database we're connecting to (without exposing full credentials)
    const dbURI = process.env.MONGODB_URI;
    const isLocalDB = dbURI.includes('localhost');
    console.log(`Connecting to ${isLocalDB ? 'LOCAL' : 'PRODUCTION'} MongoDB database...`);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      }
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Send a ping to confirm a successful connection
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Connect to MongoDB before starting the server
connectDB().then(() => {
  // Routes
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/assessment', require('./routes/assessment'));
  app.use('/api/history', require('./routes/history'));
  app.use('/api/treatment-history', require('./routes/history')); // Backward compatibility
  app.use('/api/appointments', require('./routes/appointments'));
  app.use('/api/documents', require('./routes/documents'));
  app.use('/api/admin', require('./routes/admin'));

  // Serve uploaded files
  app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'OK',
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
      message: 'Something went wrong!',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });

  const PORT = process.env.PORT || 5005;

  // Create HTTP server
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  // Handle server errors
  server.on('error', (error) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    switch (error.code) {
      case 'EACCES':
        console.error(`Port ${PORT} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  });

  // Handle process termination
  process.on('SIGTERM', () => {
    console.info('SIGTERM signal received.');
    server.close(() => {
      console.log('Server closed.');
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed.');
        process.exit(0);
      });
    });
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
