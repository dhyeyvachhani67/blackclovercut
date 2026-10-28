import { spawn, execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { FFMPEG_BIN } from './ffmpegService.js';

const KNOWN_YTDLP = 'C:\\Users\\NRI INFOTECH\\AppData\\Local\\Microsoft\\WinGet\\Packages\\yt-dlp.yt-dlp_Microsoft.Winget.Source_8wekyb3d8bbwe\\yt-dlp.exe';
export const YTDLP_BIN = fs.existsSync(KNOWN_YTDLP) ? KNOWN_YTDLP : 'yt-dlp';

// Common browser sources to try for cookie extraction (in preference order)
const BROWSER_COOKIE_SOURCES = ['chrome', 'edge', 'firefox', 'brave', 'opera'];

// Realistic browser user-agent to reduce bot detection
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// Path where users can drop a cookies.txt file for manual YouTube auth
export const COOKIES_FILE = path.join(process.cwd(), 'storage', 'youtube-cookies.txt');

/**
 * Checks if the error is a YouTube bot/sign-in challenge
 */
function isBotError(text) {
  if (!text) return false;
  return (
    text.includes('Sign in to confirm') ||
    text.includes('not a bot') ||
    text.includes('cookies') ||
    text.includes('bot') ||
    text.includes('429') ||
    text.includes('Too Many Requests') ||
    text.includes('DPAPI') ||
    text.includes('HTTP Error 429')
  );
}

/**
 * Build standard yt-dlp args that reduce bot detection.
 * If storage/youtube-cookies.txt exists, injects it.
 */
function buildAntiDetectArgs(extraArgs = []) {
  const args = [
    '--user-agent', USER_AGENT,
    '--add-header', 'Accept-Language:en-US,en;q=0.9',
    '--add-header', 'Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    '--no-check-certificates',
    '--no-warnings',
    ...extraArgs
  ];

  // If a manual cookies file is present, always use it
  if (fs.existsSync(COOKIES_FILE) && fs.statSync(COOKIES_FILE).size > 0) {
    console.log(`[yt-dlp] Using cookie file: ${COOKIES_FILE}`);
    args.unshift(COOKIES_FILE);
    args.unshift('--cookies');
  }

  return args;
}

/**
 * Run yt-dlp with given args and return { stdout, stderr, code }
 */
function runYtdlp(args) {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    const child = spawn(YTDLP_BIN, args);
    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });
    child.on('close', (code) => resolve({ stdout, stderr, code }));
    child.on('error', (err) => resolve({ stdout, stderr: err.message, code: -1 }));
  });
}

/**
 * Fetch video metadata using yt-dlp, with automatic fallback to oEmbed.
 */
export function getYouTubeInfo(url) {
  return new Promise(async (resolve, reject) => {
    // Try 1: with anti-detect args + cookie file (if present)
    const args1 = [...buildAntiDetectArgs(), '--no-playlist', '--dump-single-json', '--socket-timeout', '15', url];
    const r1 = await runYtdlp(args1);
    if (r1.code === 0 && r1.stdout.trim()) {
      try {
        const data = JSON.parse(r1.stdout);
        return resolve(extractMetadata(data));
      } catch (_) {}
    }

    // Try 2: Simple fallback without cookies
    const args2 = [
      '--dump-single-json',
      '--no-playlist',
      '--no-warnings',
      '--no-check-certificates',
      '--user-agent', USER_AGENT,
      '--socket-timeout', '15',
      url
    ];
    const r2 = await runYtdlp(args2);
    if (r2.code === 0 && r2.stdout.trim()) {
      try {
        const data = JSON.parse(r2.stdout);
        return resolve(extractMetadata(data));
      } catch (_) {}
    }

    // Try 3: oEmbed API fallback (never blocked by YouTube bot-detection!)
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const resp = await fetch(oembedUrl);
      if (resp.ok) {
        const odata = await resp.json();
        const idMatch = url.match(/(?:v=|\/embed\/|\.be\/)([a-zA-Z0-9_-]{11})/);
        const videoId = idMatch ? idMatch[1] : 'youtube_video';
        return resolve({
          id: videoId,
          title: odata.title || 'YouTube Video',
          duration: 120, // Default duration placeholder until download
          thumbnail: odata.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          uploader: odata.author_name || 'YouTube Creator',
          description: `Video by ${odata.author_name}`,
          isOembedFallback: true
        });
      }
    } catch (oembedErr) {
      console.warn('oEmbed fallback error:', oembedErr.message);
    }

    const errText = r1.stderr || r2.stderr || 'Could not fetch metadata';
    if (isBotError(errText)) {
      return reject(new Error('BOT_DETECTED'));
    }
    reject(new Error(`Failed to fetch YouTube metadata: ${errText.slice(0, 200)}`));
  });
}

function extractMetadata(data) {
  return {
    id: data.id,
    title: data.title,
    duration: data.duration,
    thumbnail: data.thumbnail,
    uploader: data.uploader || data.channel,
    description: data.description?.slice(0, 300) || '',
    viewCount: data.view_count
  };
}

/**
 * Download YouTube video with automatic cookie injection and multi-strategy fallback.
 * Strategy order:
 *   1. Browser cookies (chrome/edge/firefox) + smart format
 *   2. No cookies, lower quality
 *   3. Worst quality (last resort)
 */
export function downloadYouTubeVideo({ url, outputDir, onProgress }) {
  return new Promise(async (resolve, reject) => {
    const fileId = `yt_${Date.now()}_${uuidv4().slice(0, 6)}`;
    const outputTemplate = path.join(outputDir, `${fileId}.%(ext)s`);
    const ffmpegDir = path.dirname(FFMPEG_BIN);

    const baseDownloadArgs = [
      '--no-playlist',
      '--ffmpeg-location', ffmpegDir,
      '--merge-output-format', 'mp4',
      '--socket-timeout', '60',
      '--retries', '3',
      '--fragment-retries', '3',
      '-o', outputTemplate,
    ];

    const formatArg = ['-f', 'bv*[ext=mp4][height<=720]+ba*[ext=m4a]/b[ext=mp4]/bestvideo+bestaudio/best'];
    const formatArgFallback = ['-f', 'bestvideo[height<=480]+bestaudio/best[height<=480]/worst'];

    // Strategy 1: Browser cookies + 720p
    const strategy1 = [
      ...buildAntiDetectArgs(),
      ...baseDownloadArgs,
      ...formatArg,
      url
    ];

    // Strategy 2: No cookies, 720p, with user-agent only
    const strategy2 = [
      '--user-agent', USER_AGENT,
      '--add-header', 'Accept-Language:en-US,en;q=0.9',
      '--no-check-certificates',
      '--no-warnings',
      ...baseDownloadArgs,
      ...formatArg,
      url
    ];

    // Strategy 3: No cookies, lowest quality, no restrictions
    const strategy3 = [
      '--user-agent', USER_AGENT,
      '--no-check-certificates',
      '--no-warnings',
      ...baseDownloadArgs,
      ...formatArgFallback,
      url
    ];

    const strategies = [
      { name: 'Browser cookies + 720p', args: strategy1 },
      { name: 'User-agent only + 720p', args: strategy2 },
      { name: 'Fallback + 480p', args: strategy3 },
    ];

    let lastError = '';

    for (const { name, args } of strategies) {
      console.log(`[yt-dlp] Trying strategy: ${name}`);

      const result = await new Promise((res) => {
        const child = spawn(YTDLP_BIN, args);
        let stderr = '';

        child.stdout.on('data', (chunk) => {
          const str = chunk.toString();
          if (onProgress) {
            const match = str.match(/(\d+\.?\d*)%/);
            if (match) onProgress(parseFloat(match[1]));
          }
        });

        child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

        child.on('close', (code) => res({ code, stderr }));
        child.on('error', (err) => res({ code: -1, stderr: err.message }));
      });

      lastError = result.stderr || '';

      // Check if any output files were created
      const foundFile = await resolveOutputFile(outputDir, fileId, ffmpegDir);
      if (foundFile) {
        console.log(`[yt-dlp] Strategy "${name}" succeeded: ${foundFile}`);
        return resolve({
          filePath: foundFile,
          filename: path.basename(foundFile),
          transcripts: []
        });
      }

      // If it's a bot error, no point retrying without cookies
      if (isBotError(lastError) && name.includes('Browser cookies')) {
        console.log('[yt-dlp] Bot detection on strategy 1, trying without cookies...');
        continue;
      }

      if (isBotError(lastError)) {
        // All strategies hit bot wall — surface a clear error
        break;
      }
    }

    // All strategies failed
    if (isBotError(lastError)) {
      return reject(new Error(
        'YOUTUBE_BOT_DETECTED: YouTube is blocking automated downloads on this network. ' +
        'Please upload the video file directly using the "Upload Video File" tab instead.'
      ));
    }

    const clean = lastError
      .replace(/ERROR:/g, '')
      .split('\n')
      .filter(l => l.trim())
      .slice(-3)
      .join(' ') || 'Unknown download error';

    reject(new Error(`YouTube download could not be completed: ${clean}`));
  });
}

/**
 * After yt-dlp runs, find and optionally merge the output file(s).
 */
async function resolveOutputFile(outputDir, fileId, ffmpegDir) {
  const targetMp4 = path.join(outputDir, `${fileId}.mp4`);

  if (fs.existsSync(targetMp4)) return targetMp4;

  const filesInDir = fs.readdirSync(outputDir).filter(f => f.startsWith(fileId));
  const videoTrack = filesInDir.find(f => /\.(mp4|webm|mkv)/.test(f));
  const audioTrack = filesInDir.find(f => /\.(m4a|opus)/.test(f));

  if (videoTrack && audioTrack && videoTrack !== audioTrack) {
    const videoFull = path.join(outputDir, videoTrack);
    const audioFull = path.join(outputDir, audioTrack);
    try {
      await mergeStreamsWithFfmpeg(videoFull, audioFull, targetMp4);
      try { fs.unlinkSync(videoFull); } catch (_) {}
      try { fs.unlinkSync(audioFull); } catch (_) {}
      return targetMp4;
    } catch (_) {}
  }

  if (videoTrack) return path.join(outputDir, videoTrack);

  return null;
}

function mergeStreamsWithFfmpeg(videoPath, audioPath, outputPath) {
  return new Promise((resolve, reject) => {
    const args = ['-y', '-i', videoPath, '-i', audioPath, '-c', 'copy', outputPath];
    execFile(FFMPEG_BIN, args, (err) => {
      if (err) return reject(err);
      resolve(outputPath);
    });
  });
}
