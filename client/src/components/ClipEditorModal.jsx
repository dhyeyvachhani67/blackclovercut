import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Play, Pause, RotateCcw, Volume2, VolumeX, 
  Scissors, Type, Smartphone, Sparkles, Check, 
  Sliders, Download, Music, AlertCircle, Loader2 
} from 'lucide-react';
import { formatTime, formatTimeWithMs } from '../utils/formatters';

export default function ClipEditorModal({
  clip,
  projectId,
  onClose,
  onSaveClip
}) {
  const [activeTab, setActiveTab] = useState('trim'); // 'trim' | 'subtitles' | 'framing' | 'audio'
  
  // Trimming State
  const [startTime, setStartTime] = useState(clip.startTime || 0);
  const [endTime, setEndTime] = useState(clip.endTime || 30);
  const [title, setTitle] = useState(clip.title || '');

  // Subtitle & Style State
  const [captionStyle, setCaptionStyle] = useState(clip.captionStyle || 'hormozi');
  const [captionPosition, setCaptionPosition] = useState('bottom'); // 'bottom' | 'center' | 'top'
  const [captionFontSize, setCaptionFontSize] = useState(24);
  const [subtitles, setSubtitles] = useState(clip.subtitles ? JSON.parse(JSON.stringify(clip.subtitles)) : []);

  // Video Framing State
  const [aspectRatio, setAspectRatio] = useState(clip.aspectRatio || '9:16');
  const [layout, setLayout] = useState(clip.layout || 'blur_bg');

  // Audio State
  const [normalizeAudio, setNormalizeAudio] = useState(true);
  const [bgMusic, setBgMusic] = useState('none');

  // Player State
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderSuccess, setRenderSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const duration = Math.max(1, endTime - startTime);

  // Sync playhead with video element
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Find active subtitle segment for current playhead
  const currentAbsTime = startTime + currentTime;
  const activeSubtitle = subtitles.find(s => currentAbsTime >= s.start && currentAbsTime <= s.end);

  // Subtitle Styling Classes
  const getCaptionStyles = () => {
    let classes = 'font-black tracking-wide text-center uppercase drop-shadow-[0_4px_4px_rgba(0,0,0,0.9)] ';
    if (captionStyle === 'hormozi') {
      classes += 'text-yellow-400 font-sans stroke-black stroke-2';
    } else if (captionStyle === 'mrbeast') {
      classes += 'text-emerald-400 font-sans tracking-tight';
    } else if (captionStyle === 'minimal') {
      classes += 'text-white font-sans normal-case tracking-normal bg-black/60 px-3 py-1 rounded-md';
    } else {
      classes += 'text-amber-200 font-serif italic normal-case';
    }
    return classes;
  };

  const getPositionClass = () => {
    if (captionPosition === 'top') return 'top-8 sm:top-12';
    if (captionPosition === 'center') return 'top-1/2 -translate-y-1/2';
    return 'bottom-10 sm:bottom-16';
  };

  // Handle re-render
  const handleSaveAndRender = async () => {
    setIsRendering(true);
    setErrorMessage(null);
    setRenderSuccess(false);

    try {
      const res = await fetch(`/api/clips/${clip.id}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          startTime,
          endTime,
          aspectRatio,
          layout,
          captionStyle,
          title,
          subtitles,
          normalizeAudio
        })
      });

      const data = await res.json();
      if (data.success) {
        setRenderSuccess(true);
        if (onSaveClip) onSaveClip(data.clip);
        setTimeout(() => setRenderSuccess(false), 3000);
      } else {
        setErrorMessage(data.error || 'Failed to re-render clip.');
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/70 backdrop-blur-xl overflow-y-auto">
      <div className="liquid-glass-panel rounded-none sm:rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col h-full sm:h-auto max-h-screen sm:max-h-[92vh] border border-white/20">
        
        {/* Modal Top Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.04] backdrop-blur-md flex-shrink-0 relative z-10">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl liquid-btn-primary flex items-center justify-center shadow-md shadow-emerald-500/30">
              <Sliders className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 sm:gap-2">
                <span>Clip Studio Editor</span>
                <span className="text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full liquid-badge text-emerald-300 font-mono font-bold">
                  {aspectRatio}
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300/80 hidden xs:block">
                Trim, reframe, style subtitles & re-render
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full liquid-pill text-slate-300 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Content: Split Player / Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto min-h-0 relative z-10">
          
          {/* Video Player Preview (Mobile: Compact top section, Desktop: Left 5 cols) */}
          <div className="lg:col-span-5 p-4 sm:p-6 bg-black/35 backdrop-blur-md flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-white/10 flex-shrink-0">
            
            {/* Player Container */}
            <div 
              className={`relative bg-black rounded-xl overflow-hidden border border-slate-800 shadow-2xl max-h-[220px] sm:max-h-[380px] md:max-h-[440px] flex items-center justify-center ${
                aspectRatio === '9:16' 
                  ? 'aspect-[9/16] w-36 sm:w-56 md:w-64' 
                  : aspectRatio === '1:1' 
                  ? 'aspect-square w-48 sm:w-64' 
                  : 'aspect-video w-full max-w-xs sm:max-w-md'
              }`}
            >
              <video
                ref={videoRef}
                src={clip.videoUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Subtitle Animated Overlay */}
              {activeSubtitle && (
                <div className={`absolute left-2 right-2 sm:left-4 sm:right-4 z-20 flex justify-center pointer-events-none ${getPositionClass()}`}>
                  <div 
                    className={getCaptionStyles()}
                    style={{ fontSize: `${Math.max(14, captionFontSize - 6)}px` }}
                  >
                    {activeSubtitle.text}
                  </div>
                </div>
              )}

              {/* Center Play Button Overlay */}
              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group z-10"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full gradient-accent flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5 fill-white" />
                  </div>
                </button>
              )}
            </div>

            {/* Video Controls Bar */}
            <div className="w-full max-w-xs mt-3 flex items-center justify-between text-xs text-slate-300">
              <button
                onClick={togglePlay}
                className="p-1.5 rounded hover:bg-slate-800 text-white"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <div className="font-mono text-[11px] text-slate-400">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 rounded hover:bg-slate-800 text-white"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

          </div>

          {/* Controls Tabs Column (Mobile: Bottom scrollable, Desktop: Right 7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between overflow-y-auto">
            
            {/* Horizontal Scrollable Tabs Header */}
            <div className="flex border-b border-white/10 px-3 sm:px-6 pt-3 gap-2 bg-white/[0.02] overflow-x-auto no-scrollbar whitespace-nowrap">
              <button
                onClick={() => setActiveTab('trim')}
                className={`flex items-center gap-1.5 pb-2.5 px-3.5 text-xs sm:text-sm font-semibold rounded-full transition-all flex-shrink-0 ${
                  activeTab === 'trim'
                    ? 'liquid-pill text-emerald-300 border-emerald-400/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Scissors className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                <span>Trimmer</span>
              </button>

              <button
                onClick={() => setActiveTab('subtitles')}
                className={`flex items-center gap-1.5 pb-2.5 px-3.5 text-xs sm:text-sm font-semibold rounded-full transition-all flex-shrink-0 ${
                  activeTab === 'subtitles'
                    ? 'liquid-pill text-emerald-300 border-emerald-400/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                <span>Captions</span>
              </button>

              <button
                onClick={() => setActiveTab('framing')}
                className={`flex items-center gap-1.5 pb-2.5 px-3.5 text-xs sm:text-sm font-semibold rounded-full transition-all flex-shrink-0 ${
                  activeTab === 'framing'
                    ? 'liquid-pill text-emerald-300 border-emerald-400/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                <span>Framing</span>
              </button>

              <button
                onClick={() => setActiveTab('audio')}
                className={`flex items-center gap-1.5 pb-2.5 px-3.5 text-xs sm:text-sm font-semibold rounded-full transition-all flex-shrink-0 ${
                  activeTab === 'audio'
                    ? 'liquid-pill text-emerald-300 border-emerald-400/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                <span>Audio</span>
              </button>
            </div>

            {/* Tab Body Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 overflow-y-auto">
              
              {/* TAB 1: TRIMMER */}
              {activeTab === 'trim' && (
                <div className="space-y-4 sm:space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Clip Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                        <span>Start Timestamp</span>
                        <span className="font-mono text-violet-400">{formatTimeWithMs(startTime)}</span>
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={startTime}
                        onChange={(e) => setStartTime(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-violet-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                        <span>End Timestamp</span>
                        <span className="font-mono text-violet-400">{formatTimeWithMs(endTime)}</span>
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min={startTime + 5}
                        value={endTime}
                        onChange={(e) => setEndTime(parseFloat(e.target.value) || startTime + 5)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-500/20 text-xs text-slate-300 flex items-center justify-between">
                    <span>Calculated Duration:</span>
                    <span className="font-mono font-bold text-violet-300">
                      {duration.toFixed(1)} seconds
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 2: SUBTITLES & STYLING */}
              {activeTab === 'subtitles' && (
                <div className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Caption Preset</label>
                      <select
                        value={captionStyle}
                        onChange={(e) => setCaptionStyle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                      >
                        <option value="hormozi">Hormozi Pop (Yellow/White)</option>
                        <option value="mrbeast">MrBeast Pop (Neon Green)</option>
                        <option value="minimal">Minimalist Clean (White)</option>
                        <option value="cinematic">Cinematic Gold (Serif)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Position</label>
                      <select
                        value={captionPosition}
                        onChange={(e) => setCaptionPosition(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                      >
                        <option value="bottom">Bottom (Standard)</option>
                        <option value="center">Center Highlight</option>
                        <option value="top">Top Header</option>
                      </select>
                    </div>
                  </div>

                  {/* Subtitle Line Editor */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Editable Caption Lines</span>
                      <span className="text-[11px] text-slate-500">{subtitles.length} lines</span>
                    </label>

                    <div className="space-y-2 max-h-36 sm:max-h-44 overflow-y-auto pr-1">
                      {subtitles.map((sub, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] font-mono text-slate-500 w-12 flex-shrink-0">
                            {formatTime(sub.start)}
                          </span>
                          <input
                            type="text"
                            value={sub.text}
                            onChange={(e) => {
                              const updated = [...subtitles];
                              updated[idx].text = e.target.value;
                              setSubtitles(updated);
                            }}
                            className="w-full bg-transparent text-xs text-slate-200 focus:outline-none focus:border-b border-violet-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: FRAMING & ASPECT */}
              {activeTab === 'framing' && (
                <div className="space-y-4 sm:space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Aspect Ratio</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                      {[
                        { id: '9:16', label: '9:16 Vertical', desc: 'Shorts & Reels' },
                        { id: '1:1', label: '1:1 Square', desc: 'Feed & LinkedIn' },
                        { id: '16:9', label: '16:9 Landscape', desc: 'YouTube Standard' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setAspectRatio(item.id)}
                          className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all ${
                            aspectRatio === item.id
                              ? 'bg-violet-600/20 border-violet-500 text-white'
                              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="font-bold text-xs">{item.label}</div>
                          <div className="text-[10px] text-slate-400">{item.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Vertical Layout Mode</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <button
                        onClick={() => setLayout('blur_bg')}
                        className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all ${
                          layout === 'blur_bg'
                            ? 'bg-violet-600/20 border-violet-500 text-white'
                            : 'bg-slate-900/50 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="font-bold text-xs">Opus Blur Fill</div>
                        <div className="text-[10px] text-slate-400">Blurred background + centered video</div>
                      </button>

                      <button
                        onClick={() => setLayout('smart_crop')}
                        className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all ${
                          layout === 'smart_crop'
                            ? 'bg-violet-600/20 border-violet-500 text-white'
                            : 'bg-slate-900/50 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="font-bold text-xs">Center Crop</div>
                        <div className="text-[10px] text-slate-400">Cropped strictly to center subject</div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: AUDIO & MUSIC */}
              {activeTab === 'audio' && (
                <div className="space-y-4 sm:space-y-5">
                  <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="pr-2">
                      <div className="text-xs font-bold text-white">Audio Normalization</div>
                      <div className="text-[10px] text-slate-400">Balances speech to mobile speaker standards</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={normalizeAudio}
                      onChange={(e) => setNormalizeAudio(e.target.checked)}
                      className="w-4 h-4 accent-violet-600 rounded flex-shrink-0"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Optional Background Track</label>
                    <select
                      value={bgMusic}
                      onChange={(e) => setBgMusic(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                    >
                      <option value="none">None (Keep Original Audio Only)</option>
                      <option value="podcast_ambient">Podcast Ambient (Soft Chill)</option>
                      <option value="energetic_beats">Energetic Motivation Beat</option>
                      <option value="lofi_relax">Lofi Focus (Subtle)</option>
                    </select>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Render & Save Bar with Liquid Glass */}
            <div className="p-3 sm:p-4 px-4 sm:px-6 border-t border-white/10 bg-white/[0.03] backdrop-blur-md flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 flex-shrink-0">
              <div className="text-center sm:text-left">
                {renderSuccess && (
                  <span className="text-xs text-emerald-300 flex items-center justify-center sm:justify-start gap-1.5 font-semibold">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Clip re-rendered successfully!
                  </span>
                )}
                {errorMessage && (
                  <span className="text-xs text-rose-300 flex items-center justify-center sm:justify-start gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    {errorMessage}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 sm:gap-3 justify-end">
                <button
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl liquid-btn-glass text-xs font-semibold text-slate-300 transition-all text-center"
                >
                  Close
                </button>

                <button
                  onClick={handleSaveAndRender}
                  disabled={isRendering}
                  className="flex-1 sm:flex-none px-5 py-2.5 liquid-btn-primary text-xs font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg"
                >
                  {isRendering ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Re-Rendering...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Apply Changes & Render</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
