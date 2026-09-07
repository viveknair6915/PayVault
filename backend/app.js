const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Security Middleware
app.use(helmet());

// CORS configuration
const configuredClientUrls = (process.env.CLIENT_URL || '')
  .split(',')
  .map((u) => u.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. mobile apps, curl, health probes)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/+$/, '');

      // Allow localhost / 127.0.0.1 on any port (5173, 5174, 3000, etc.)
      const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin);

      // Allow any Vercel deployment (*.vercel.app) or Render service (*.onrender.com)
      const isVercelOrRender = /^https:\/\/[a-zA-Z0-9-_.]+\.(vercel\.app|onrender\.com)$/.test(cleanOrigin);

      // Allow explicitly configured CLIENT_URL(s)
      const isConfigured =
        configuredClientUrls.includes('*') ||
        configuredClientUrls.includes(cleanOrigin);

      if (
        process.env.NODE_ENV !== 'production' ||
        isLocalhost ||
        isVercelOrRender ||
        isConfigured ||
        configuredClientUrls.length === 0
      ) {
        callback(null, origin);
      } else {
        callback(new Error(`CORS policy: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Rate limiting for Auth endpoints to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
  skip: () => process.env.NODE_ENV === 'test',
});

// Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Root Status API
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'PayVault API',
    message: 'PayVault Multi-Payment Management System API is operational',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PayVault API is operational',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`,
  });
});

// Global Central Error Handler
app.use(errorHandler);

module.exports = app;
