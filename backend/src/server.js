const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { port, corsOrigin, env } = require('./config');
const db = require('./db');
const authRoutes = require('./routes/auth.routes');
const materialsRoutes = require('./routes/materials.routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env === 'production' ? 'combined' : 'dev'));
app.use(
  cors({
    origin: corsOrigin === '*' ? true : corsOrigin,
    credentials: true
  })
);

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use(
  '/api/auth',
  rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get('/api/health', (req, res) => {
  const now = new Date().toISOString();
  res.json({ status: 'ok', env, time: now });
});

app.use('/api/auth', authRoutes);
app.use('/api/materials', materialsRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  await db.ensureAdminUser();

  app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
