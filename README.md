# BlackClovercut AI — Turn Long Videos into Viral Short Clips

> **AI-Powered Video Clip Generator for YouTube Shorts, Instagram Reels & TikTok with Ultra-Glassmorphism UI.**

BlackClovercut AI is a modern web application that transforms long-form videos (podcasts, interviews, livestreams, educational lectures) into short-form vertical videos with animated captions, viral scores, and social media export presets.

---

## 🌐 Access Options (Access to All)

| Access Type | URL / Address | Who Can Access |
|---|---|---|
| **Public Global HTTPS (Anywhere)** | **https://non-emotional-custody-encoding.trycloudflare.com** | Anyone in the world (Mobile, iPhone, Android, Mac, PC) |
| **Local Wi-Fi / LAN Network** | **http://10.61.113.190:5000** | Any phone, tablet, or laptop connected to your Wi-Fi |
| **Local Machine** | **http://localhost:5000** | This computer |

---

## 🚀 Key Features

### 1. Dual Video Ingestion
- **Direct File Upload**: Drag-and-drop support for MP4, WebM, MOV, and MKV files up to 500MB with real-time upload progress.
- **YouTube Ingestion via yt-dlp**: Automatically downloads YouTube streams and merges them cleanly with FFmpeg without subtitle rate-limits.
- **Pre-loaded Creator Samples**: 3 instant 1-click test videos (AI Podcast, Mindset & Wealth, Creator Productivity) with pre-analyzed transcripts so you can test end-to-end processing without uploading large files.

### 2. Intelligent AI Analysis Pipeline
- **Audio Stream Extraction**: Extracts 16kHz mono audio via FFmpeg.
- **Silence & Cadence Detection**: Identifies speech clusters and silence gaps (`silencedetect`) to ensure clips never cut mid-sentence.
- **Viral Moment & Hook Scoring**: Detects strong opening questions, curiosity gaps, emotional peaks, and punchline conclusions in the first 1–3 seconds.
- **AI Virality Score**: Provides an estimated engagement score (e.g. 94/100) with clear explanation of why the moment was selected.
- **Built-in Offline Engine + Optional Cloud LLM**: Functions immediately using the local NLP heuristic parser, with optional support for Google Gemini (Gemini 2.5 Flash) and OpenAI API keys configured via the Settings page.

### 3. Professional 9:16 Vertical Video Processing
- **Smart 9:16 Reframing**:
  - *Opus Blur Fill*: Blurred background letterbox + crisp centered speaker foreground.
  - *Center Crop*: Direct 9:16 crop.
- **Alternative Formats**: 1:1 Square (Instagram Feed/LinkedIn) and 16:9 Landscape.
- **Audio Loudness Normalization**: Runs EBU R128 `loudnorm` filter to meet social platform audio standards.
- **Dynamic Animated Subtitles**: Word-by-word karaoke ASS captions burned into the video or exported as `.srt` and `.vtt`.

### 4. Integrated Clip Studio Editor
- **Live 9:16 Video Player**: Interactive video playback with synchronized real-time subtitle overlays.
- **Timeline Trimmer**: Adjustable start/end timestamps with live duration calculation.
- **Caption Stylizer**:
  - *Hormozi Pop*: Bold yellow and white uppercase text with thick black outline.
  - *MrBeast Pop*: Neon green and cyan text.
  - *Minimalist Clean*: Modern white sans-serif with subtle background box.
  - *Cinematic Gold*: Elegant serif with gold accents.
- **Positioning**: Bottom, Center Highlight, or Top Header.
- **Line-by-Line Subtitle Editor**: Directly tweak words and timings.
- **Re-render Engine**: Applies changes with FFmpeg and delivers updated MP4 files instantly.

### 5. Social Media Export Presets
- **YouTube Shorts**: High-CTR title, SEO description, trending hashtags (`#shorts #viral #trending`).
- **Instagram Reels**: Hook opening line, caption with call-to-action, engagement hashtags.
- **TikTok**: Punchy title, viral sounds tip, fyp hashtags.
- **1-Click Copy**: Copy metadata to clipboard with visual confirmation.
- **One-Click Downloads**: High-definition MP4 and `.srt` subtitle files.

---

## 🏃 Getting Started & One-Click Launchers

1. **Start Server**: Double-click `start-server.bat`
2. **Start Global Public Tunnel**: Double-click `start-public-tunnel.bat`
