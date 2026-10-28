import { spawn } from 'child_process';
import fs from 'fs';
import { FFMPEG_BIN } from './ffmpegService.js';

/**
 * Detect silence intervals in an audio file using FFmpeg
 */
export function detectSilence(audioPath, noiseThreshold = '-30dB', minSilenceDuration = 0.4) {
  return new Promise((resolve) => {
    const args = [
      '-i', audioPath,
      '-af', `silencedetect=noise=${noiseThreshold}:duration=${minSilenceDuration}`,
      '-f', 'null',
      '-'
    ];

    const child = spawn(FFMPEG_BIN, args);
    let output = '';

    child.stderr.on('data', (d) => {
      output += d.toString();
    });

    child.on('close', () => {
      const silences = [];
      const silenceStartRegex = /silence_start:\s*([\d\.]+)/g;
      const silenceEndRegex = /silence_end:\s*([\d\.]+)\s*\|\s*silence_duration:\s*([\d\.]+)/g;

      let startMatch;
      const starts = [];
      while ((startMatch = silenceStartRegex.exec(output)) !== null) {
        starts.push(parseFloat(startMatch[1]));
      }

      let endMatch;
      let i = 0;
      while ((endMatch = silenceEndRegex.exec(output)) !== null) {
        const start = starts[i] || 0;
        const end = parseFloat(endMatch[1]);
        const dur = parseFloat(endMatch[2]);
        silences.push({ start, end, duration: dur });
        i++;
      }

      resolve(silences);
    });

    child.on('error', () => {
      resolve([]);
    });
  });
}

/**
 * Align sentences to natural boundaries (avoid cutting mid-sentence)
 */
export function snapToSentenceBoundaries(targetStart, targetEnd, transcriptSegments, totalDuration) {
  if (!transcriptSegments || transcriptSegments.length === 0) {
    return {
      startTime: Math.max(0, targetStart),
      endTime: Math.min(totalDuration, targetEnd)
    };
  }

  // Find the segment that best encapsulates targetStart
  let bestStart = targetStart;
  let minStartDiff = Infinity;
  for (const seg of transcriptSegments) {
    const diff = Math.abs(seg.start - targetStart);
    if (diff < minStartDiff && seg.start <= targetStart + 3) {
      minStartDiff = diff;
      bestStart = seg.start;
    }
  }

  // Find the segment that best encapsulates targetEnd
  let bestEnd = targetEnd;
  let minEndDiff = Infinity;
  for (const seg of transcriptSegments) {
    const diff = Math.abs(seg.end - targetEnd);
    if (diff < minEndDiff && seg.end >= targetEnd - 3) {
      minEndDiff = diff;
      bestEnd = seg.end;
    }
  }

  // Ensure minimum duration (15s) and bounds
  if (bestEnd - bestStart < 15) {
    bestEnd = Math.min(totalDuration, bestStart + 25);
  }

  return {
    startTime: Math.max(0, parseFloat(bestStart.toFixed(2))),
    endTime: Math.min(totalDuration, parseFloat(bestEnd.toFixed(2)))
  };
}

/**
 * Split sentence text into word-level timestamps
 */
export function generateWordTimestamps(sentenceText, startSec, endSec) {
  const words = sentenceText.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const totalDur = Math.max(0.2, endSec - startSec);
  const durPerWord = totalDur / words.length;

  return words.map((word, index) => {
    const wStart = startSec + index * durPerWord;
    const wEnd = wStart + durPerWord;
    return {
      word,
      start: parseFloat(wStart.toFixed(2)),
      end: parseFloat(wEnd.toFixed(2))
    };
  });
}
