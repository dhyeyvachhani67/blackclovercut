import fs from 'fs';
import path from 'path';

/**
 * Format seconds to ASS timestamp: h:mm:ss.cc
 */
export function formatAssTime(seconds) {
  const s = Math.max(0, seconds);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = Math.floor(s % 60);
  const centis = Math.floor((s % 1) * 100);

  return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
}

/**
 * Format seconds to SRT timestamp: hh:mm:ss,ms
 */
export function formatSrtTime(seconds) {
  const s = Math.max(0, seconds);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = Math.floor(s % 60);
  const ms = Math.floor((s % 1) * 1000);

  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

/**
 * Format seconds to WebVTT timestamp: hh:mm:ss.ms
 */
export function formatVttTime(seconds) {
  const s = Math.max(0, seconds);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = Math.floor(s % 60);
  const ms = Math.floor((s % 1) * 1000);

  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

/**
 * Generate ASS subtitle file content with styled captions
 */
export function generateAssSubtitles({
  segments,
  style = 'hormozi', // 'hormozi' | 'mrbeast' | 'minimal' | 'cinematic'
  clipStartTime = 0,
  fontSize = 68,
  position = 'bottom', // 'top' | 'center' | 'bottom'
}) {
  // Determine alignment code in ASS numpad:
  // 2 = bottom-center, 5 = middle-center, 8 = top-center
  let alignment = 2;
  let marginV = 220; // default margin from bottom
  if (position === 'top') {
    alignment = 8;
    marginV = 160;
  } else if (position === 'center') {
    alignment = 5;
    marginV = 0;
  }

  // Styles palette in ASS BGR hex: &H00BBGGRR&
  let primaryColor = '&H0000FFFF&'; // Yellow
  let secondaryColor = '&H00FFFFFF&'; // White
  let outlineColor = '&H00000000&'; // Black
  let backColor = '&H80000000&';
  let fontName = 'Montserrat, Arial Black, Impact, sans-serif';
  let bold = 1;
  let outline = 5;
  let shadow = 2;

  if (style === 'mrbeast') {
    primaryColor = '&H0000FF00&'; // Bright Lime Green
    secondaryColor = '&H00FFFF00&'; // Cyan
    outline = 6;
  } else if (style === 'minimal') {
    primaryColor = '&H00FFFFFF&'; // Pure White
    secondaryColor = '&H00CCCCCC&';
    outline = 3;
    shadow = 1;
    fontName = 'Inter, Arial, sans-serif';
  } else if (style === 'cinematic') {
    primaryColor = '&H0033D1FF&'; // Gold/Amber
    secondaryColor = '&H00FFFFFF&';
    outline = 4;
    shadow = 3;
    fontName = 'Georgia, Times New Roman, serif';
  }

  let ass = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${fontName},${fontSize},${primaryColor},${secondaryColor},${outlineColor},${backColor},${bold},0,0,0,100,100,0,0,1,${outline},${shadow},${alignment},40,40,${marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  // Write events with word-by-word karaoke or line segments
  for (const seg of segments) {
    const segStart = Math.max(0, seg.start - clipStartTime);
    const segEnd = Math.max(segStart + 0.3, seg.end - clipStartTime);

    let text = seg.text.trim();
    if (style === 'hormozi' || style === 'mrbeast') {
      text = text.toUpperCase();
    }

    // If word timestamps exist, add word-level highlight
    if (seg.words && seg.words.length > 0) {
      let karaokeText = '';
      for (const w of seg.words) {
        const wordDurCentis = Math.max(10, Math.round(((w.end || seg.end) - (w.start || seg.start)) * 100));
        const wordText = (style === 'hormozi' || style === 'mrbeast') ? w.word.toUpperCase() : w.word;
        karaokeText += `{\\k${wordDurCentis}}${wordText} `;
      }
      text = karaokeText.trim();
    }

    ass += `Dialogue: 0,${formatAssTime(segStart)},${formatAssTime(segEnd)},Default,,0,0,0,,${text}\n`;
  }

  return ass;
}

/**
 * Generate standard SRT subtitle format
 */
export function generateSrtSubtitles(segments, clipStartTime = 0) {
  let srt = '';
  let index = 1;

  for (const seg of segments) {
    const start = Math.max(0, seg.start - clipStartTime);
    const end = Math.max(start + 0.3, seg.end - clipStartTime);

    srt += `${index}\n`;
    srt += `${formatSrtTime(start)} --> ${formatSrtTime(end)}\n`;
    srt += `${seg.text.trim()}\n\n`;
    index++;
  }

  return srt;
}

/**
 * Generate WebVTT subtitle format for web players
 */
export function generateVttSubtitles(segments, clipStartTime = 0) {
  let vtt = 'WEBVTT\n\n';

  for (const seg of segments) {
    const start = Math.max(0, seg.start - clipStartTime);
    const end = Math.max(start + 0.3, seg.end - clipStartTime);

    vtt += `${formatVttTime(start)} --> ${formatVttTime(end)}\n`;
    vtt += `${seg.text.trim()}\n\n`;
  }

  return vtt;
}

/**
 * Write ASS, SRT and VTT subtitle files to disk
 */
export function writeSubtitleFiles({
  segments,
  outputBasePath,
  style = 'hormozi',
  clipStartTime = 0,
  fontSize = 68,
  position = 'bottom'
}) {
  const assPath = `${outputBasePath}.ass`;
  const srtPath = `${outputBasePath}.srt`;
  const vttPath = `${outputBasePath}.vtt`;

  const assContent = generateAssSubtitles({ segments, style, clipStartTime, fontSize, position });
  const srtContent = generateSrtSubtitles(segments, clipStartTime);
  const vttContent = generateVttSubtitles(segments, clipStartTime);

  fs.writeFileSync(assPath, assContent, 'utf-8');
  fs.writeFileSync(srtPath, srtContent, 'utf-8');
  fs.writeFileSync(vttPath, vttContent, 'utf-8');

  return { assPath, srtPath, vttPath };
}
