import { spawn, execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Path resolution for FFmpeg / FFprobe on Windows and cross-platform
const KNOWN_FFMPEG = 'C:\\Users\\NRI INFOTECH\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.2-full_build\\bin\\ffmpeg.exe';
const KNOWN_FFPROBE = 'C:\\Users\\NRI INFOTECH\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.2-full_build\\bin\\ffprobe.exe';

export const FFMPEG_BIN = fs.existsSync(KNOWN_FFMPEG) ? KNOWN_FFMPEG : 'ffmpeg';
export const FFPROBE_BIN = fs.existsSync(KNOWN_FFPROBE) ? KNOWN_FFPROBE : 'ffprobe';

/**
 * Execute ffprobe to extract video metadata
 */
export function getVideoMetadata(filePath) {
  return new Promise((resolve, reject) => {
    const args = [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      filePath
    ];

    execFile(FFPROBE_BIN, args, (err, stdout, stderr) => {
      if (err) {
        return reject(new Error(`Failed to probe video: ${stderr || err.message}`));
      }

      try {
        const data = JSON.parse(stdout);
        const videoStream = data.streams?.find(s => s.codec_type === 'video') || {};
        const audioStream = data.streams?.find(s => s.codec_type === 'audio') || {};

        const duration = parseFloat(data.format?.duration || videoStream.duration || 0);
        const width = parseInt(videoStream.width || 0, 10);
        const height = parseInt(videoStream.height || 0, 10);
        const bitrate = parseInt(data.format?.bit_rate || 0, 10);
        const fps = evalFps(videoStream.r_frame_rate || videoStream.avg_frame_rate || '30/1');

        resolve({
          duration,
          width,
          height,
          bitrate,
          fps,
          codec: videoStream.codec_name,
          audioCodec: audioStream.codec_name,
          format: data.format?.format_name,
          sizeBytes: parseInt(data.format?.size || 0, 10)
        });
      } catch (parseErr) {
        reject(parseErr);
      }
    });
  });
}

function evalFps(fpsStr) {
  if (!fpsStr) return 30;
  if (fpsStr.includes('/')) {
    const [num, den] = fpsStr.split('/').map(Number);
    return den ? Math.round((num / den) * 100) / 100 : 30;
  }
  return parseFloat(fpsStr) || 30;
}

/**
 * Extract a thumbnail at a specific timestamp (in seconds)
 */
export function extractThumbnail(videoPath, outputPath, timestamp = 2) {
  return new Promise((resolve, reject) => {
    const args = [
      '-y',
      '-ss', timestamp.toString(),
      '-i', videoPath,
      '-vframes', '1',
      '-q:v', '2',
      outputPath
    ];

    execFile(FFMPEG_BIN, args, (err, stdout, stderr) => {
      if (err) return reject(new Error(`Thumbnail extraction failed: ${stderr || err.message}`));
      resolve(outputPath);
    });
  });
}

/**
 * Extract mono 16kHz WAV audio for speech transcription
 */
export function extractAudio(videoPath, audioOutputPath) {
  return new Promise((resolve, reject) => {
    const args = [
      '-y',
      '-i', videoPath,
      '-vn',
      '-acodec', 'pcm_s16le',
      '-ar', '16000',
      '-ac', '1',
      audioOutputPath
    ];

    execFile(FFMPEG_BIN, args, (err, stdout, stderr) => {
      if (err) return reject(new Error(`Audio extraction failed: ${stderr || err.message}`));
      resolve(audioOutputPath);
    });
  });
}

/**
 * Cut and reframe a clip with professional options:
 * - aspect ratio (9:16 vertical, 1:1 square, 16:9 landscape)
 * - layout: 'blur_bg' (blurred background letterbox fill) or 'smart_crop' (center cropped)
 * - optional subtitle burning (ASS / SRT file)
 * - optional audio normalization (loudnorm)
 * - optional background music overlay
 */
export function cutAndReframeClip({
  sourcePath,
  outputPath,
  startTime,
  endTime,
  aspectRatio = '9:16',
  layout = 'blur_bg', // 'blur_bg' | 'smart_crop'
  subtitleFile = null,
  normalizeAudio = true,
  bgMusicPath = null,
  bgMusicVolume = 0.12,
  onProgress = null
}) {
  return new Promise((resolve, reject) => {
    const duration = endTime - startTime;
    const args = [
      '-y',
      '-ss', startTime.toFixed(3),
      '-to', endTime.toFixed(3),
      '-i', sourcePath
    ];

    let hasBgMusic = false;
    if (bgMusicPath && fs.existsSync(bgMusicPath)) {
      hasBgMusic = true;
      args.push('-stream_loop', '-1', '-i', bgMusicPath);
    }

    // Build video filter
    let vf = '';
    if (aspectRatio === '9:16') {
      if (layout === 'blur_bg') {
        // Opus Clip style: blurred background fill + centered clear foreground
        vf = '[0:v]split=2[bg_src][fg_src];[bg_src]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5[bg];[fg_src]scale=1080:1920:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2';
      } else {
        // Smart center crop
        vf = '[0:v]crop=ih*9/16:ih:(iw-ow)/2:0,scale=1080:1920';
      }
    } else if (aspectRatio === '1:1') {
      if (layout === 'blur_bg') {
        vf = '[0:v]split=2[bg_src][fg_src];[bg_src]scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080,boxblur=20:5[bg];[fg_src]scale=1080:1080:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2';
      } else {
        vf = '[0:v]crop=min(iw\\,ih):min(iw\\,ih):(iw-ow)/2:(ih-oh)/2,scale=1080:1080';
      }
    } else {
      // 16:9
      vf = '[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black';
    }

    // Subtitle burning if provided
    if (subtitleFile && fs.existsSync(subtitleFile)) {
      // Windows FFmpeg requires escaped backslashes or forward slashes in filter path
      const escapedSub = subtitleFile.replace(/\\/g, '/').replace(/:/g, '\\:');
      if (subtitleFile.endsWith('.ass')) {
        vf += `,ass='${escapedSub}'`;
      } else {
        vf += `,subtitles='${escapedSub}'`;
      }
    }

    let filterComplex = vf;
    if (filterComplex.includes('[')) {
      // Filter complex format
      filterComplex += '[vout]';
    }

    // Audio filter
    let afParts = [];
    if (normalizeAudio) {
      afParts.push('loudnorm=I=-16:TP=-1.5:LRA=11');
    }

    if (hasBgMusic) {
      // Mix main audio with bg music (ducked down)
      const musicVol = bgMusicVolume || 0.12;
      const afComplex = `[0:a]${afParts.length ? afParts.join(',') + ',' : ''}volume=1.0[main_a];[1:a]volume=${musicVol}[bg_a];[main_a][bg_a]amix=inputs=2:duration=first:dropout_transition=2[aout]`;
      args.push('-filter_complex', `${filterComplex};${afComplex}`, '-map', '[vout]', '-map', '[aout]');
    } else {
      if (filterComplex.includes('[vout]')) {
        args.push('-filter_complex', filterComplex, '-map', '[vout]', '-map', '0:a?');
      } else {
        args.push('-vf', filterComplex);
      }
      if (afParts.length > 0) {
        args.push('-af', afParts.join(','));
      }
    }

    // Encoding parameters
    args.push(
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '21',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-movflags', '+faststart',
      outputPath
    );

    const child = spawn(FFMPEG_BIN, args);
    let stderrLog = '';

    child.stderr.on('data', (chunk) => {
      stderrLog += chunk.toString();
      if (onProgress && duration > 0) {
        const timeMatch = chunk.toString().match(/time=(\d+):(\d+):(\d+\.\d+)/);
        if (timeMatch) {
          const currentSec = parseInt(timeMatch[1], 10) * 3600 + parseInt(timeMatch[2], 10) * 60 + parseFloat(timeMatch[3]);
          const pct = Math.min(100, Math.round((currentSec / duration) * 100));
          onProgress(pct);
        }
      }
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(outputPath);
      } else {
        reject(new Error(`FFmpeg rendering failed (code ${code}): ${stderrLog.slice(-500)}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}
