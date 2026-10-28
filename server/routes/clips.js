import express from 'express';
import path from 'path';
import fs from 'fs';
import { projectsStore } from './analyze.js';
import { cutAndReframeClip, extractThumbnail } from '../services/ffmpegService.js';
import { writeSubtitleFiles } from '../services/subtitleService.js';

const router = express.Router();

/**
 * POST /api/clips/:id/render
 * Re-render clip with custom adjustments (timings, aspect ratio, captions, layout)
 */
router.post('/:id/render', async (req, res) => {
  try {
    const { id: clipId } = req.params;
    const {
      projectId,
      startTime,
      endTime,
      aspectRatio = '9:16',
      layout = 'blur_bg',
      captionStyle = 'hormozi',
      title,
      subtitles,
      normalizeAudio = true
    } = req.body;

    const project = projectsStore.get(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }

    const clipIndex = project.clips.findIndex(c => c.id === clipId);
    if (clipIndex === -1) {
      return res.status(404).json({ success: false, error: 'Clip not found in project.' });
    }

    const existingClip = project.clips[clipIndex];
    const newStartTime = parseFloat(startTime ?? existingClip.startTime);
    const newEndTime = parseFloat(endTime ?? existingClip.endTime);
    const newSubtitles = subtitles || existingClip.subtitles || [];

    const clipsDir = path.join(process.cwd(), 'storage', 'clips', projectId);
    const thumbsDir = path.join(process.cwd(), 'storage', 'thumbs');
    const clipBasePath = path.join(clipsDir, clipId);
    const clipMp4Path = `${clipBasePath}.mp4`;
    const clipThumbPath = path.join(thumbsDir, `${clipId}.jpg`);

    // Regenerate subtitle files
    const { assPath } = writeSubtitleFiles({
      segments: newSubtitles,
      outputBasePath: clipBasePath,
      style: captionStyle,
      clipStartTime: newStartTime,
      fontSize: 66,
      position: 'bottom'
    });

    // Re-render clip using FFmpeg
    await cutAndReframeClip({
      sourcePath: project.videoPath,
      outputPath: clipMp4Path,
      startTime: newStartTime,
      endTime: newEndTime,
      aspectRatio,
      layout,
      subtitleFile: assPath,
      normalizeAudio
    });

    // Re-extract thumbnail
    await extractThumbnail(clipMp4Path, clipThumbPath, 1.0);

    // Update clip in project
    const updatedClip = {
      ...existingClip,
      title: title || existingClip.title,
      startTime: newStartTime,
      endTime: newEndTime,
      duration: parseFloat((newEndTime - newStartTime).toFixed(2)),
      aspectRatio,
      layout,
      captionStyle,
      subtitles: newSubtitles,
      updatedAt: new Date().toISOString()
    };

    project.clips[clipIndex] = updatedClip;
    projectsStore.set(projectId, project);

    res.json({
      success: true,
      clip: updatedClip,
      message: 'Clip re-rendered successfully!'
    });
  } catch (err) {
    console.error('Clip render error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/clips/:projectId/:id/download
 * Download clip MP4
 */
router.get('/:projectId/:id/download', (req, res) => {
  const { projectId, id: clipId } = req.params;
  const filePath = path.join(process.cwd(), 'storage', 'clips', projectId, `${clipId}.mp4`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'Clip file not found.' });
  }

  const filename = `clipgenius_${clipId}.mp4`;
  res.download(filePath, filename);
});

/**
 * GET /api/clips/:projectId/:id/subtitles
 * Download subtitles (.srt or .vtt)
 */
router.get('/:projectId/:id/subtitles', (req, res) => {
  const { projectId, id: clipId } = req.params;
  const format = req.query.format === 'vtt' ? 'vtt' : 'srt';
  const filePath = path.join(process.cwd(), 'storage', 'clips', projectId, `${clipId}.${format}`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'Subtitle file not found.' });
  }

  res.download(filePath, `subtitles_${clipId}.${format}`);
});

export default router;
