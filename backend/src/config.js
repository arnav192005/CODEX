const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  isProd,
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'dev_only_change_this_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  dbPath: path.resolve(process.cwd(), process.env.DB_PATH || './data/codex.db'),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@codex.local',
  adminPassword: process.env.ADMIN_PASSWORD || 'ChangeMe123!'
};
