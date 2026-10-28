import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import os from 'os';
import dotenv from 'dotenv';

import uploadRoutes from './routes/upload.js';
import analyzeRoutes from './routes/analyze.js';
import clipsRoutes from './routes/clips.js';
import projectsRoutes from './routes/projects.js';
import settingsRoutes from './routes/settings.js';
import { ensureSampleVideoFiles } from './services/samplesService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Enable CORS and body parsers for all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure required directories exist
const storageDirs = ['uploads', 'clips', 'thumbs', 'audio', 'samples'];
storageDirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), 'storage', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Serve static storage files (videos, thumbnails, subtitles)
app.use('/storage', express.static(path.join(process.cwd(), 'storage'), {
  setHeaders: (res) => {
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// API Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/clips', clipsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'BlackClovercut AI Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// SEO Robots & Sitemap endpoints
app.get('/robots.txt', (req, res) => {
  const p = path.join(process.cwd(), 'public', 'robots.txt');
  if (fs.existsSync(p)) return res.type('text/plain').sendFile(p);
  res.type('text/plain').send('User-agent: *\nAllow: /\nSitemap: https://blackclovercut.ai/sitemap.xml');
});

app.get('/sitemap.xml', (req, res) => {
  const p = path.join(process.cwd(), 'public', 'sitemap.xml');
  if (fs.existsSync(p)) return res.type('application/xml').sendFile(p);
  res.status(404).end();
});

// Serve frontend in production or if dist exists
const distDir = path.join(process.cwd(), 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/storage')) {
      res.sendFile(path.join(distDir, 'index.html'));
    }
  });
}

function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

// Start server on 0.0.0.0 so all network interfaces can access it
const server = app.listen(PORT, HOST, async () => {
  const localIps = getLocalIpAddresses();
  console.log(`\n======================================================`);
  console.log(`🍀 BlackClovercut AI Server is running and accessible to all!`);
  console.log(`🏠 Local Machine:   http://localhost:${PORT}`);
  localIps.forEach(ip => {
    console.log(`🌐 Local Network:   http://${ip}:${PORT}`);
  });
  console.log(`📡 API endpoint:    http://localhost:${PORT}/api`);
  console.log(`📁 Storage:         http://localhost:${PORT}/storage`);
  console.log(`======================================================\n`);

  // Asynchronously ensure sample demo video files exist
  try {
    console.log('⚡ Initializing built-in creator sample assets...');
    await ensureSampleVideoFiles(process.cwd());
    console.log('✅ Creator sample assets initialized.');
  } catch (err) {
    console.warn('⚠️ Sample assets initialization note:', err.message);
  }
});

export default app;
