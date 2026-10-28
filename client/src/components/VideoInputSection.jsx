import React, { useState, useRef } from 'react';
import { 
  Upload, Link2, Sparkles, CheckCircle2, AlertCircle, Film, 
  Clock, Maximize2, Sliders, Type, Play, Info, ArrowRight,
  TrendingUp, Award, Layers, Volume2, Youtube, User, Scissors,
  Zap, Flame, Mic, BrainCircuit, Cpu, BookOpen, Laugh, Dumbbell, ChevronRight
} from 'lucide-react';
import { formatTime, formatFileSize } from '../utils/formatters';

export default function VideoInputSection({
  onStartAnalysis,
  samples,
  onSelectSample,
  isProcessing
}) {
  const [inputMode, setInputMode] = useState('url'); // 'url' | 'upload'
  const [videoUrl, setVideoUrl] = useState('');
  const [urlStatus, setUrlStatus] = useState(null);
  const [urlChecking, setUrlChecking] = useState(false);

  // Uploaded video state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  // Configuration options
  const [clippingStyle, setClippingStyle] = useState('auto');
  const [targetDuration, setTargetDuration] = useState('30-60');
  const [customDurationSec, setCustomDurationSec] = useState(45);
  const [clipCount, setClipCount] = useState(5);
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [captionStyle, setCaptionStyle] = useState('hormozi');

  // Handle URL Inspection
  const handleVerifyUrl = async (e) => {
    e?.preventDefault();
    if (!videoUrl.trim()) return;

    setUrlChecking(true);
    setUrlStatus(null);

    try {
      const res = await fetch('/api/analyze/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl.trim() })
      });
      const data = await res.json();
      setUrlStatus(data);
    } catch (err) {
      setUrlStatus({
        success: false,
        error: 'Unable to reach the validation service. Please check your internet connection or use direct file upload.'
      });
    } finally {
      setUrlChecking(false);
    }
  };

  // Handle File Upload
  const handleFileSelect = async (file) => {
    if (!file) return;

    const allowed = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska', 'video/avi'];
    if (!allowed.some(t => file.type.includes(t.split('/')[1]) || file.name.endsWith('.mp4') || file.name.endsWith('.mov') || file.name.endsWith('.webm'))) {
      setUploadError('Please select a valid video file (MP4, WebM, MOV, MKV).');
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      setUploadError('File size exceeds the 500MB limit for this demo.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    setUploadProgress(10);

    const formData = new FormData();
    formData.append('video', file);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload');

      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          const percent = Math.round((evt.loaded / evt.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        setIsUploading(false);
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          if (data.success) {
            setUploadedFile(data);
          } else {
            setUploadError(data.error || 'Upload failed.');
          }
        } else {
          setUploadError(`Upload failed with status code ${xhr.status}.`);
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        setUploadError('Network error during file upload.');
      };

      xhr.send(formData);
    } catch (err) {
      setIsUploading(false);
      setUploadError(err.message);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Initiate Analysis
  const handleTriggerAnalysis = () => {
    if (inputMode === 'upload') {
      if (!uploadedFile) return;
      onStartAnalysis({
        projectId: uploadedFile.projectId,
        videoPath: uploadedFile.file.path,
        videoUrl: uploadedFile.file.url,
        title: uploadedFile.file.originalName,
        clippingStyle,
        targetDuration,
        customDurationSec,
        clipCount,
        aspectRatio,
        captionStyle
      });
    } else {
      if (!videoUrl) return;
      onStartAnalysis({
        videoUrl: videoUrl.trim(),
        title: urlStatus?.title || '',
        clippingStyle,
        targetDuration,
        customDurationSec,
        clipCount,
        aspectRatio,
        captionStyle
      });
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Hero Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-3.5 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md shadow-sm">
          <Scissors className="w-3.5 h-3.5 text-emerald-400" />
          <span>BlackClovercut AI • Automated Shorts & Reels</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-sans leading-tight">
          Turn Long Videos Into <span className="gradient-text-clover">Viral Short Clips</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          Drop any YouTube URL, podcast, or video file. Our AI identifies the most engaging punchlines, reframes them into 9:16 vertical shorts, and animates bold captions.
        </p>
      </div>

      {/* Main Liquid Glass Input Card */}
      <div className="liquid-glass-panel rounded-3xl p-5 sm:p-8 max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
        
        {/* Subtle glass top highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent z-10" />

        {/* Input Mode Tabs */}
        <div className="flex border-b border-white/10 pb-4 mb-6 gap-2 sm:gap-4 relative z-10">
          <button
            onClick={() => setInputMode('url')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm md:text-base font-semibold transition-all duration-300 ${
              inputMode === 'url'
                ? 'liquid-pill text-emerald-300 border-emerald-400/50 shadow-lg shadow-emerald-950/40'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>Paste Video URL</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hidden xs:inline">
              YouTube
            </span>
          </button>

          <button
            onClick={() => setInputMode('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm md:text-base font-semibold transition-all duration-300 ${
              inputMode === 'upload'
                ? 'liquid-pill text-emerald-300 border-emerald-400/50 shadow-lg shadow-emerald-950/40'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Video File</span>
          </button>
        </div>

        {/* Tab 1: URL Input */}
        {inputMode === 'url' && (
          <div className="space-y-4 relative z-10">
            <form onSubmit={handleVerifyUrl} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Youtube className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    if (urlStatus) setUrlStatus(null);
                  }}
                  placeholder="https://www.youtube.com/watch?v=... or direct MP4 link"
                  className="w-full liquid-glass-input rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={urlChecking || !videoUrl.trim()}
                className="px-5 py-3 rounded-xl liquid-btn-glass text-slate-200 text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {urlChecking ? 'Checking with yt-dlp...' : 'Inspect Link'}
              </button>
            </form>

            {/* URL Status / Preview Card */}
            {urlStatus && (
              <div className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-3 liquid-glass-card ${
                urlStatus.success 
                  ? 'border-emerald-500/40 text-slate-200' 
                  : 'border-rose-500/40 text-rose-300 bg-rose-950/20'
              }`}>
                {urlStatus.title ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {urlStatus.thumbnail ? (
                        <img 
                          src={urlStatus.thumbnail} 
                          alt="Thumbnail" 
                          className="w-24 h-14 rounded-lg object-cover border border-white/10 shadow-md"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-red-600/20 flex items-center justify-center text-red-400 border border-white/10">
                          <Youtube className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase border border-emerald-500/30">
                            YouTube Verified
                          </span>
                          {urlStatus.duration && (
                            <span className="text-[11px] font-mono text-slate-400">
                              {formatTime(urlStatus.duration)}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-white line-clamp-1 mt-0.5">
                          {urlStatus.title}
                        </h4>
                        {urlStatus.uploader && (
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-500" />
                            <span>{urlStatus.uploader}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Ready to Ingest & Clip
                      </span>
                      <button
                        type="button"
                        onClick={() => setInputMode('upload')}
                        className="text-[11px] text-slate-400 hover:text-emerald-300 underline"
                      >
                        or switch to file upload
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold text-white">
                        {urlStatus.platform || 'Video Link'} Status
                      </p>
                      <p className="text-slate-300 leading-relaxed">
                        {urlStatus.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: File Upload */}
        {inputMode === 'upload' && (
          <div className="space-y-4">
            {!uploadedFile ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 group glass-card ${
                  isUploading
                    ? 'border-emerald-500/50 bg-emerald-950/20'
                    : 'border-white/15 hover:border-emerald-400/60 hover:bg-white/[0.03]'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                  className="hidden"
                />

                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-transform">
                  <Upload className="w-8 h-8 text-emerald-400" />
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                  Drag & drop your video here, or <span className="text-emerald-400 underline">browse files</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mb-3">
                  Supports MP4, WebM, MOV, and MKV (up to 500MB)
                </p>

                {isUploading && (
                  <div className="max-w-xs mx-auto mt-4 space-y-2">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Uploading video...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-card rounded-xl p-5 border border-emerald-500/30 flex flex-col sm:flex-row items-center gap-5 justify-between">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-24 h-16 rounded-lg bg-black overflow-hidden relative border border-white/10 flex-shrink-0">
                    {uploadedFile.file.thumbnailUrl ? (
                      <img 
                        src={uploadedFile.file.thumbnailUrl} 
                        alt="Thumbnail" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800">
                        <Film className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[10px] text-white font-mono">
                      {formatTime(uploadedFile.file.duration)}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                      {uploadedFile.file.originalName}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>{formatFileSize(uploadedFile.file.size)}</span>
                      <span>•</span>
                      <span>{uploadedFile.file.width}x{uploadedFile.file.height}</span>
                      <span>•</span>
                      <span>{uploadedFile.file.fps} FPS</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Uploaded & Verified
                  </span>
                  <button
                    onClick={() => { setUploadedFile(null); setUploadProgress(0); }}
                    className="text-xs text-slate-400 hover:text-rose-400 underline"
                  >
                    Change video
                  </button>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        )}

        {/* Configuration Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Clipping Style */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              Clipping Style
            </label>
            <select
              value={clippingStyle}
              onChange={(e) => setClippingStyle(e.target.value)}
              className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
            >
              <option value="auto" className="bg-[#0b1324] text-white">Auto-Detect Best Style</option>
              <option value="podcast" className="bg-[#0b1324] text-white">Podcast (Conversational)</option>
              <option value="educational" className="bg-[#0b1324] text-white">Educational & How-To</option>
              <option value="motivational" className="bg-[#0b1324] text-white">Motivational & Mindset</option>
              <option value="comedy" className="bg-[#0b1324] text-white">Comedy & Punchlines</option>
              <option value="storytelling" className="bg-[#0b1324] text-white">Storytelling & Suspense</option>
              <option value="gaming" className="bg-[#0b1324] text-white">Gaming & Reactions</option>
            </select>
          </div>

          {/* Clip Duration */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Target Duration
            </label>
            <select
              value={targetDuration}
              onChange={(e) => setTargetDuration(e.target.value)}
              className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
            >
              <option value="15-30" className="bg-[#0b1324] text-white">15 – 30s (Shorts & Reels)</option>
              <option value="30-60" className="bg-[#0b1324] text-white">30 – 60s (Recommended)</option>
              <option value="60-90" className="bg-[#0b1324] text-white">60 – 90s (In-depth)</option>
              <option value="custom" className="bg-[#0b1324] text-white">Custom Duration</option>
            </select>
            {targetDuration === 'custom' && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="range"
                  min="15"
                  max="90"
                  value={customDurationSec}
                  onChange={(e) => setCustomDurationSec(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <span className="text-xs text-emerald-300 font-mono">{customDurationSec}s</span>
              </div>
            )}
          </div>

          {/* Clip Count */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Number of Clips
            </label>
            <select
              value={clipCount}
              onChange={(e) => setClipCount(Number(e.target.value))}
              className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
            >
              <option value={3} className="bg-[#0b1324] text-white">3 Clips (Fastest)</option>
              <option value={5} className="bg-[#0b1324] text-white">5 Clips (Standard)</option>
              <option value={10} className="bg-[#0b1324] text-white">10 Clips (Deep Batch)</option>
            </select>
          </div>

          {/* Caption Style */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-emerald-400" />
              Subtitle Preset
            </label>
            <select
              value={captionStyle}
              onChange={(e) => setCaptionStyle(e.target.value)}
              className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
            >
              <option value="hormozi" className="bg-[#0b1324] text-white">Hormozi Pop (Yellow/White)</option>
              <option value="mrbeast" className="bg-[#0b1324] text-white">MrBeast Pop (Neon Green)</option>
              <option value="minimal" className="bg-[#0b1324] text-white">Minimalist Clean (White)</option>
              <option value="cinematic" className="bg-[#0b1324] text-white">Cinematic Gold (Serif)</option>
            </select>
          </div>

        </div>

        {/* CTA Analyze Button */}
        <div className="mt-8 relative z-10">
          <button
            onClick={handleTriggerAnalysis}
            disabled={isProcessing || (inputMode === 'upload' && !uploadedFile) || (inputMode === 'url' && !videoUrl.trim())}
            className="w-full py-4 liquid-btn-primary text-white font-black text-base tracking-wide flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed group transition-all"
          >
            <Scissors className="w-5 h-5 text-emerald-200 group-hover:rotate-12 transition-transform" />
            <span className="drop-shadow-md">BlackClovercut: Analyze & Generate Viral Clips</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>

      {/* Pre-loaded Sample Videos — Redesigned Creator Showcase */}
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <h3 className="text-base font-black text-white tracking-tight">
                1-Click Creator Demos
              </h3>
            </div>
            <p className="text-xs text-slate-400 ml-8">
              No upload required — instantly generate viral shorts from these pre-loaded videos
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px] font-semibold self-start sm:self-auto whitespace-nowrap">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
            </span>
            AI Ready
          </div>
        </div>

        {/* Sample Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {samples?.map((sample, idx) => {
            // Per-card accent color themes
            const themes = [
              {
                accent: 'from-emerald-500/20 via-teal-500/10 to-transparent',
                border: 'hover:border-emerald-400/60',
                badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                glow: 'hover:shadow-emerald-500/20',
                icon: Cpu,
                iconColor: 'text-emerald-400',
                iconBg: 'bg-emerald-500/15 border-emerald-500/30',
                barColor: 'bg-emerald-500',
                ctaColor: 'text-emerald-300',
                rimLine: 'from-emerald-400/60',
              },
              {
                accent: 'from-violet-500/20 via-indigo-500/10 to-transparent',
                border: 'hover:border-violet-400/60',
                badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
                glow: 'hover:shadow-violet-500/20',
                icon: Dumbbell,
                iconColor: 'text-violet-400',
                iconBg: 'bg-violet-500/15 border-violet-500/30',
                barColor: 'bg-violet-500',
                ctaColor: 'text-violet-300',
                rimLine: 'from-violet-400/60',
              },
              {
                accent: 'from-amber-500/20 via-orange-500/10 to-transparent',
                border: 'hover:border-amber-400/60',
                badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                glow: 'hover:shadow-amber-500/20',
                icon: BookOpen,
                iconColor: 'text-amber-400',
                iconBg: 'bg-amber-500/15 border-amber-500/30',
                barColor: 'bg-amber-500',
                ctaColor: 'text-amber-300',
                rimLine: 'from-amber-400/60',
              },
            ];
            const t = themes[idx % themes.length];
            const IconComp = t.icon;
            const hook = sample.transcripts?.[0]?.text || '';

            return (
              <div
                key={sample.id}
                onClick={() => onSelectSample(sample)}
                className={`group relative cursor-pointer rounded-3xl overflow-hidden flex flex-col transition-all duration-300 ${t.border} hover:-translate-y-1.5 hover:shadow-2xl ${t.glow}`}
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 40%, rgba(12,18,32,0.55) 100%)',
                  backdropFilter: 'blur(22px) saturate(200%) contrast(106%)',
                  WebkitBackdropFilter: 'blur(22px) saturate(200%) contrast(106%)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  boxShadow: 'inset 0 1.2px 1px 0 rgba(255,255,255,0.4), inset 0 -1px 1px 0 rgba(0,0,0,0.3), 0 16px 40px -12px rgba(0,0,0,0.65)',
                }}
              >
                {/* Top specular rim highlight */}
                <div className={`absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r ${t.rimLine} via-white/40 to-transparent pointer-events-none z-10`} />

                {/* Accent color sweep background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${t.accent} pointer-events-none`} />

                {/* Card Content */}
                <div className="relative z-10 flex flex-col h-full p-5">

                  {/* Header row: icon + category badge + duration */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border flex-shrink-0 ${t.iconBg}`}>
                      <IconComp className={`w-5 h-5 ${t.iconColor}`} />
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${t.badge}`}>
                        {sample.category}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className={`text-sm font-extrabold text-white leading-snug mb-1.5 group-hover:${t.ctaColor.replace('text-', 'text-')} transition-colors line-clamp-2`}>
                    {sample.title}
                  </h4>

                  {/* Speaker */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-4 h-4 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                      <User className="w-2.5 h-2.5 text-slate-300" />
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium truncate">{sample.speaker}</span>
                  </div>

                  {/* Hook Quote */}
                  {hook && (
                    <div className="mb-4 px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 backdrop-blur-md">
                      <div className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-1">Hook Preview</div>
                      <p className={`text-xs font-semibold leading-relaxed line-clamp-2 ${t.ctaColor}`}>
                        "{hook}"
                      </p>
                    </div>
                  )}

                  {/* Stats Row */}
                  <div className="flex items-center gap-3 mb-4 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="font-mono">{formatTime(sample.duration)}</span>
                    </div>
                    <div className="w-px h-3 bg-white/15" />
                    <div className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-400" />
                      <span>Viral Ready</span>
                    </div>
                    <div className="w-px h-3 bg-white/15" />
                    <div className="flex items-center gap-1">
                      <Mic className="w-3 h-3" />
                      <span>Transcribed</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="mt-auto">
                    <div
                      className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all duration-200
                        group-hover:scale-[1.02]
                        ${idx === 0 ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 group-hover:bg-emerald-500/30 group-hover:border-emerald-400/60' : ''}
                        ${idx === 1 ? 'bg-violet-500/20 text-violet-200 border border-violet-500/40 group-hover:bg-violet-500/30 group-hover:border-violet-400/60' : ''}
                        ${idx === 2 ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 group-hover:bg-amber-500/30 group-hover:border-amber-400/60' : ''}
                      `}
                      style={{ backdropFilter: 'blur(8px)' }}
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>Generate Shorts Now</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom micro-note */}
        <p className="text-center text-[11px] text-slate-500">
          Sample videos are synthetic, locally-generated demo files. No internet required to generate shorts from them.
        </p>
      </div>

    </div>
  );
}
