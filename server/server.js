const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const dns = require('dns');

// Prioritize IPv4 addresses so cloud containers don't route to unreachable IPv6 interfaces
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const { connectDB, getDBStatus } = require('./config/db');
const { seedDB } = require('./seed');
const { migrateMemoryPasswords } = require('./controllers/authController');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(origin) ||
      /\.(vercel\.app|onrender\.com|railway\.app)$/.test(origin) ||
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'AgriLink Farm-to-Table MERN Portal',
    db: getDBStatus()
  });
});

// Serve static frontend in production if client build exists
const clientDistCandidates = [
  path.resolve(__dirname, '../client/dist'),
  path.resolve(__dirname, 'client/dist'),
  path.resolve(process.cwd(), 'client/dist')
];
const clientDist = clientDistCandidates.find(p => fs.existsSync(p));

if (clientDist) {
  console.log(`📁 Serving client static assets from: ${clientDist}`);
  app.use(express.static(clientDist, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('index.html') || filePath.endsWith('sw.js')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      } else if (filePath.includes('assets')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  }));

  // Never return index.html for missing static assets
  app.use('/assets', (req, res) => {
    res.status(404).type('text/plain').send('Asset not found');
  });

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  if (err.message === 'Origin is not allowed by CORS') {
    return res.status(403).json({ message: err.message });
  }
  console.error('Unhandled server error:', err.message);
  return res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedDB();
  await migrateMemoryPasswords();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);

    // 24/7 Anti-Sleep Keep-Alive for Free Cloud Hosting
    const keepAliveUrl = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL;
    if (keepAliveUrl || process.env.KEEP_ALIVE === 'true') {
      const target = keepAliveUrl ? `${keepAliveUrl.replace(/\/$/, '')}/api/health` : `http://localhost:${PORT}/api/health`;
      const intervalMinutes = 14;
      console.log(`⏱️ 24/7 Keep-Alive active: pinging ${target} every ${intervalMinutes} minutes`);
      setInterval(() => {
        try {
          const clientModule = target.startsWith('https') ? require('https') : require('http');
          clientModule.get(target, (res) => {
            console.log(`[Keep-Alive 24/7 Ping] ${new Date().toLocaleTimeString()} -> Status ${res.statusCode}`);
          }).on('error', (err) => {
            console.warn('[Keep-Alive Ping Note]:', err.message);
          });
        } catch (e) {
          console.warn('[Keep-Alive Exception]:', e.message);
        }
      }, intervalMinutes * 60 * 1000);
    }
  });

  server.on('error', (error) => {
    console.error(`Could not start server on port ${PORT}:`, error.message);
    process.exit(1);
  });
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Server startup failed:', error);
    process.exit(1);
  });
}

module.exports = { app, startServer };
