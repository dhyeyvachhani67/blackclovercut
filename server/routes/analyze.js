import express from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { getVideoMetadata, extractAudio, extractThumbnail, cutAndReframeClip } from '../services/ffmpegService.js';
import { detectSilence } from '../services/audioAnalysisService.js';
import { analyzeVideoTranscript } from '../services/aiAnalysisService.js';
import { writeSubtitleFiles } from '../services/subtitleService.js';
import { SAMPLE_VIDEOS } from '../services/samplesService.js';
import { getYouTubeInfo, downloadYouTubeVideo } from '../services/youtubeService.js';

const router = express.Router();

export const projectsStore = new Map();
export const progressStore = new Map();

/**
 * POST /api/analyze/url
 * Inspects and validates video links
 */
router.post('/url', async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({ success: false, error: 'Please enter a valid video URL.' });
  }

  const trimmed = url.trim();

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    const isDirectVideo = /\.(mp4|webm|mov|mkv)(\?.*)?$/i.test(parsed.pathname);

    // If it's YouTube, fetch metadata and enable direct download
    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      try {
        const info = await getYouTubeInfo(trimmed);
        return res.json({
          success: true,
          supported: true,
          platform: 'YouTube',
          url: trimmed,
          canDownload: true,
          title: info.title,
          duration: info.duration,
          thumbnail: info.thumbnail,
          uploader: info.uploader,
          message: `Ready to analyze "${info.title}" (${Math.round(info.duration)}s). Click 'Analyze Video' to download and generate viral short clips.`
        });
      } catch (ytErr) {
        return res.json({
          success: true,
          supported: true,
          platform: 'YouTube',
          url: trimmed,
          canDownload: true,
          message: 'YouTube URL verified. Click "Analyze Video" to automatically download and process it, or upload the MP4 file directly for the fastest speed.',
          recommendedAction: 'proceed_or_upload'
        });
      }
    }

    if (isDirectVideo) {
      return res.json({
        success: true,
        supported: true,
        platform: 'Direct Video Stream',
        url: trimmed,
        canDownload: true,
        message: 'Direct video feed recognized. Ready for analysis.'
      });
    }

    return res.json({
      success: true,
      supported: true,
      platform: 'Web Video',
      url: trimmed,
      canDownload: true,
      message: 'Video link recognized. Click Analyze Video to begin processing.'
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: 'Invalid URL format.' });
  }
});

/**
 * GET /api/analyze/progress/:projectId
 */
router.get('/progress/:projectId', (req, res) => {
  const { projectId } = req.params;
  const prog = progressStore.get(projectId) || { stage: 'idle', percent: 0, message: 'Ready' };
  res.json({ success: true, progress: prog });
});

/**
 * POST /api/analyze
 */
router.post('/', async (req, res) => {
  try {
    const {
      projectId: incomingProjectId,
      videoPath: incomingVideoPath,
      videoUrl,
      title: incomingTitle,
      clippingStyle = 'auto',
      targetDuration = '30-60',
      customDurationSec = 45,
      clipCount = 5,
      apiKey = null,
      sampleId = null,
      aspectRatio = '9:16',
      captionStyle = 'hormozi'
    } = req.body;

    const projectId = incomingProjectId || `proj_${Date.now()}_${uuidv4().slice(0, 6)}`;
    
    const updateProgress = (stage, percent, message) => {
      progressStore.set(projectId, {
        stage,
        percent,
        message,
        updatedAt: Date.now()
      });
    };

    updateProgress('validating', 5, 'Validating video input source...');

    res.json({
      success: true,
      projectId,
      message: 'Video analysis pipeline initiated successfully.'
    });

    // Execute background workflow
    (async () => {
      try {
        const baseStorageDir = process.cwd();
        const uploadsDir = path.join(baseStorageDir, 'storage', 'uploads');
        const clipsDir = path.join(baseStorageDir, 'storage', 'clips', projectId);
        const audioDir = path.join(baseStorageDir, 'storage', 'audio');
        const thumbsDir = path.join(baseStorageDir, 'storage', 'thumbs');

        [uploadsDir, clipsDir, audioDir, thumbsDir].forEach(d => {
          if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
        });

        let videoFullPath = incomingVideoPath;
        let originalTitle = incomingTitle || 'Source Video';
        let sampleData = null;
        let preExtractedTranscripts = [];

        // CASE 1: Built-in Sample
        if (sampleId) {
          sampleData = SAMPLE_VIDEOS.find(s => s.id === sampleId);
          if (sampleData) {
            videoFullPath = path.join(baseStorageDir, sampleData.videoPath);
            originalTitle = sampleData.title;
            preExtractedTranscripts = sampleData.transcripts || [];
          }
        } 
        // CASE 2: YouTube or Web URL
        else if (videoUrl && !videoFullPath) {
          updateProgress('downloading', 10, 'Connecting to YouTube via yt-dlp (trying browser cookies)...');
          try {
            const ytResult = await downloadYouTubeVideo({
              url: videoUrl,
              outputDir: uploadsDir,
              onProgress: (p) => {
                const downloadPct = Math.min(25, 10 + Math.floor((p / 100) * 15));
                updateProgress('downloading', downloadPct, `Downloading video streams... (${Math.round(p)}%)`);
              }
            });

            videoFullPath = ytResult.filePath;
            if (!incomingTitle) {
              originalTitle = path.basename(videoFullPath);
            }
            if (ytResult.transcripts && ytResult.transcripts.length > 0) {
              preExtractedTranscripts = ytResult.transcripts;
            }
            updateProgress('downloading', 25, 'Video stream downloaded and merged successfully!');
          } catch (dlErr) {
            // Surface a clear, actionable error for YouTube bot detection
            if (dlErr.message && dlErr.message.includes('YOUTUBE_BOT_DETECTED')) {
              throw new Error(
                'YouTube blocked the download (bot detection). ' +
                'To fix this: open YouTube in Chrome, copy the video URL, then switch to the ' +
                '"Upload Video File" tab and upload the MP4 directly. ' +
                'Alternatively, install the "cookies.txt" extension in Chrome, export cookies, ' +
                'and place the file at storage/youtube-cookies.txt for automatic authentication.'
              );
            }
            throw dlErr;
          }
        }

        // Validate video file existence
        if (!videoFullPath || !fs.existsSync(videoFullPath)) {
          const alt = path.join(uploadsDir, path.basename(videoFullPath || ''));
          if (fs.existsSync(alt)) {
            videoFullPath = alt;
          } else {
            throw new Error('Video source could not be resolved on the server.');
          }
        }

        // 1. Probing metadata
        updateProgress('probing', 28, 'Probing video dimensions, audio codecs, and duration...');
        const metadata = await getVideoMetadata(videoFullPath);
        const duration = metadata.duration || (sampleData ? sampleData.duration : 60);

        // Thumbnail extraction
        const mainThumbPath = path.join(thumbsDir, `${projectId}.jpg`);
        if (!fs.existsSync(mainThumbPath)) {
          await extractThumbnail(videoFullPath, mainThumbPath, Math.min(2, duration / 4));
        }

        // 2. Audio Extraction
        updateProgress('audio_extraction', 38, 'Extracting 16kHz audio stream via FFmpeg...');
        const audioPath = path.join(audioDir, `${projectId}.wav`);
        await extractAudio(videoFullPath, audioPath);

        // 3. Audio & Silence Analysis
        updateProgress('speech_analysis', 48, 'Detecting speech intervals and sentence boundaries...');
        const silences = await detectSilence(audioPath);

        let transcriptSegments = preExtractedTranscripts;
        if (!transcriptSegments || transcriptSegments.length === 0) {
          transcriptSegments = generateTranscriptFromSilences(silences, duration);
        }

        // 4. AI Viral Highlight & Hook Extraction
        updateProgress('moment_extraction', 62, 'AI extracting hooks, powerful punchlines, and virality scores...');
        const extractedClips = await analyzeVideoTranscript({
          transcriptSegments,
          totalDuration: duration,
          clippingStyle,
          targetDuration,
          customDurationSec,
          clipCount: parseInt(clipCount, 10) || 5,
          apiKey
        });

        // 5. Automatic Clip Cutting, 9:16 Reframing & Subtitle Rendering
        updateProgress('rendering_clips', 75, `Rendering ${extractedClips.length} vertical 9:16 clips with animated captions...`);

        const renderedClips = [];
        for (let i = 0; i < extractedClips.length; i++) {
          const clip = extractedClips[i];
          const clipId = `clip_${projectId}_${i + 1}`;
          const clipBasePath = path.join(clipsDir, clipId);
          const clipMp4Path = `${clipBasePath}.mp4`;
          const clipThumbPath = path.join(thumbsDir, `${clipId}.jpg`);

          // Generate ASS, SRT, VTT subtitles
          const { assPath, srtPath, vttPath } = writeSubtitleFiles({
            segments: clip.subtitles,
            outputBasePath: clipBasePath,
            style: captionStyle,
            clipStartTime: clip.startTime,
            fontSize: 66,
            position: 'bottom'
          });

          // Render via FFmpeg
          try {
            await cutAndReframeClip({
              sourcePath: videoFullPath,
              outputPath: clipMp4Path,
              startTime: clip.startTime,
              endTime: clip.endTime,
              aspectRatio: aspectRatio || '9:16',
              layout: 'blur_bg',
              subtitleFile: assPath,
              normalizeAudio: true,
              onProgress: (p) => {
                const totalPct = 75 + Math.floor((i / extractedClips.length) * 23) + Math.floor((p / 100) * (23 / extractedClips.length));
                updateProgress('rendering_clips', Math.min(99, totalPct), `Rendering Clip ${i + 1}/${extractedClips.length}... (${p}%)`);
              }
            });

            await extractThumbnail(clipMp4Path, clipThumbPath, 1.0);

            renderedClips.push({
              ...clip,
              id: clipId,
              videoUrl: `/storage/clips/${projectId}/${clipId}.mp4`,
              thumbnailUrl: `/storage/thumbs/${clipId}.jpg`,
              subtitlesSrtUrl: `/storage/clips/${projectId}/${clipId}.srt`,
              subtitlesVttUrl: `/storage/clips/${projectId}/${clipId}.vtt`,
              aspectRatio: aspectRatio || '9:16',
              captionStyle: captionStyle || 'hormozi'
            });
          } catch (renderErr) {
            console.error(`Error rendering clip ${clipId}:`, renderErr);
          }
        }

        // Save project state
        const projectData = {
          id: projectId,
          title: originalTitle,
          videoPath: videoFullPath,
          videoUrl: `/storage/uploads/${path.basename(videoFullPath)}`,
          thumbnailUrl: `/storage/thumbs/${projectId}.jpg`,
          duration,
          metadata,
          clippingStyle,
          targetDuration,
          clipsCount: renderedClips.length,
          clips: renderedClips,
          createdAt: new Date().toISOString()
        };

        projectsStore.set(projectId, projectData);
        updateProgress('completed', 100, `Successfully generated ${renderedClips.length} viral clips!`);
      } catch (err) {
        console.error('Workflow error:', err);
        updateProgress('error', 0, `Analysis failed: ${err.message}`);
      }
    })();

  } catch (err) {
    console.error('Analyze route error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

function generateTranscriptFromSilences(silences, duration) {
  const segments = [];
  let curStart = 0;

  if (!silences || silences.length === 0) {
    const chunk = 5;
    for (let t = 0; t < duration; t += chunk) {
      segments.push({
        start: t,
        end: Math.min(duration, t + chunk),
        text: `Highlight statement and discussion at timestamp ${Math.floor(t)}s.`
      });
    }
    return segments;
  }

  silences.forEach((sil, idx) => {
    if (sil.start > curStart + 1) {
      segments.push({
        start: parseFloat(curStart.toFixed(2)),
        end: parseFloat(sil.start.toFixed(2)),
        text: `Key speaker insight and conversation segment ${idx + 1}.`
      });
    }
    curStart = sil.end;
  });

  if (curStart < duration - 1) {
    segments.push({
      start: parseFloat(curStart.toFixed(2)),
      end: parseFloat(duration.toFixed(2)),
      text: `Concluding takeaway and final powerful statement.`
    });
  }

  return segments;
}

export default router;
