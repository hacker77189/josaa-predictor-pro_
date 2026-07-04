const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error('Missing required environment variables: MONGO_URI and JWT_SECRET must be set');
  process.exit(1);
}

const app = express();

const isServerless = process.env.VERCEL || process.env.NETLIFY;

if (!isServerless) {
  app.use(helmet());
  app.use(compression());
}

if (!isServerless) {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:5173', 'http://localhost:5000'],
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));

let dbConnected = false;
const connectDB = async () => {
  if (dbConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    dbConnected = true;
    if (!isServerless) console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

app.use(async (req, res, next) => {
  if (!dbConnected) {
    try {
      await connectDB();
    } catch {
      return res.status(503).json({ success: false, error: 'Database connection unavailable' });
    }
  }
  next();
});

app.use('/api', require('./routes/apiRoutes'));
app.use('/api/users', require('./routes/authRoutes'));

app.use(errorHandler);

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      mongoose.connection.close(false).then(() => {
        console.log('MongoDB connection closed.');
        process.exit(0);
      });
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}
