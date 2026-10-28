import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { getVideoMetadata, extractThumbnail } from '../services/ffmpegService.js';

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'storage', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
    cb(null, `upload_${Date.now()}_${uuidv4().slice(0, 8)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp4', '.mov', '.webm', '.mkv', '.avi', '.m4v'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext) || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported video format. Allowed formats: ${allowed.join(', ')}`));
    }
  }
});

/**
 * POST /api/upload
 * Handles video file upload and extracts initial metadata & thumbnail
 */
router.post('/', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No video file provided.' });
    }

    const filePath = req.file.path;
    const projectId = `proj_${Date.now()}_${uuidv4().slice(0, 6)}`;
    const thumbsDir = path.join(process.cwd(), 'storage', 'thumbs');
    if (!fs.existsSync(thumbsDir)) fs.mkdirSync(thumbsDir, { recursive: true });

    const thumbFilename = `${projectId}.jpg`;
    const thumbPath = path.join(thumbsDir, thumbFilename);

    let metadata = {};
    try {
      metadata = await getVideoMetadata(filePath);
      const thumbTimestamp = Math.min(2, Math.max(0.5, (metadata.duration || 5) / 4));
      await extractThumbnail(filePath, thumbPath, thumbTimestamp);
    } catch (metaErr) {
      console.warn('Metadata/Thumbnail extraction warning:', metaErr.message);
    }

    res.json({
      success: true,
      projectId,
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        path: filePath,
        url: `/storage/uploads/${req.file.filename}`,
        thumbnailUrl: `/storage/thumbs/${thumbFilename}`,
        duration: metadata.duration || 0,
        width: metadata.width || 0,
        height: metadata.height || 0,
        fps: metadata.fps || 30
      }
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
