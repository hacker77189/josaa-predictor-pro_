const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorHandler');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error('Missing required environment variables: MONGO_URI and JWT_SECRET must be set');
  process.exit(1);
}

app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:5173', 'http://localhost:5000'],
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));

let connectPromise = null;
const getDb = () => {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (connectPromise) return connectPromise;
  connectPromise = mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 20000,
    connectTimeoutMS: 20000
  }).catch(err => {
    connectPromise = null;
    console.error('MongoDB connection error:', err.message);
    throw err;
  });
  return connectPromise;
};

const mongoMiddleware = async (req, res, next) => {
  const publicPaths = ['/api/health'];
  const isPublic = publicPaths.some(p => req.path.startsWith(p));
  try {
    if (!isPublic) await getDb();
  } catch {
    return res.status(503).json({ success: false, error: 'Database unavailable' });
  }
  next();
};

mongoose.connection.on('error', err => console.error('MongoDB runtime error:', err.message));
mongoose.connection.on('connected', () => { console.log('MongoDB connected'); connectPromise = null; });
mongoose.connection.on('disconnected', () => { connectPromise = null; });

app.use(mongoMiddleware);
app.use('/api', require('./routes/apiRoutes'));
app.use('/api/users', require('./routes/authRoutes'));

app.use(errorHandler);

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  getDb().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });

  const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    mongoose.connection.close(false).then(() => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}
