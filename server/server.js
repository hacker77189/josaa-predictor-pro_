const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

const isServerless = process.env.VERCEL || process.env.NETLIFY;

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error('Missing required environment variables: MONGO_URI and JWT_SECRET must be set');
  if (!isServerless) process.exit(1);
}

if (!isServerless) {
  app.use(helmet());
  app.use(compression());
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:5173', 'http://localhost:5000'],
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 25000,
  connectTimeoutMS: 25000,
  bufferTimeoutMS: 30000
}).catch(err => console.error('MongoDB connection error:', err.message));

mongoose.connection.on('error', err => console.error('MongoDB runtime error:', err.message));
mongoose.connection.on('connected', () => console.error('MongoDB connected'));

const mongoReady = () => mongoose.connection.readyState === 1;
const waitForMongo = () => {
  if (mongoReady()) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('MongoDB connection timeout')), 30000);
    mongoose.connection.once('connected', () => { clearTimeout(timeout); resolve(); });
    mongoose.connection.once('error', (err) => { clearTimeout(timeout); reject(err); });
  });
};

app.use(async (req, res, next) => {
  if (!mongoReady()) {
    try {
      await waitForMongo();
    } catch (err) {
      return res.status(503).json({ success: false, error: 'Database unavailable', detail: err.message });
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
