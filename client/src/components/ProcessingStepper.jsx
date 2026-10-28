import React from 'react';
import { 
  CheckCircle2, Loader2, Sparkles, Film, Mic, 
  BrainCircuit, Scissors, Smartphone, AlertCircle, RotateCcw, Upload,
  Cookie, ShieldAlert, ExternalLink, Youtube
} from 'lucide-react';

const STAGES = [
  { id: 'validating', label: 'Video Validation', icon: Film, desc: 'Probing streams, dimensions & codecs' },
  { id: 'audio_extraction', label: 'Audio Extraction', icon: Mic, desc: 'Isolating 16kHz speech & silence gaps' },
  { id: 'speech_analysis', label: 'Speech & Cadence', icon: BrainCircuit, desc: 'Transcribing speech & sentence boundaries' },
  { id: 'moment_extraction', label: 'AI Hook Extraction', icon: Scissors, desc: 'Calculating viral potential & hooks' },
  { id: 'rendering_clips', label: 'Vertical Reframing', icon: Smartphone, desc: 'Cutting 9:16 clips & burning captions' }
];

export default function ProcessingStepper({ progress, onReset }) {
  const currentStage = progress?.stage || 'validating';
  const percent = progress?.percent || 10;
  const message = progress?.message || 'Processing video streams...';
  const isError = currentStage === 'error';

  // Detect YouTube bot-block specifically from the error message
  const isBotError = isError && (
    message.includes('bot') ||
    message.includes('blocked') ||
    message.includes('Sign in') ||
    message.includes('cookie') ||
    message.includes('YouTube blocked')
  );

  const getStageStatus = (stageId, index) => {
    const stageIndexMap = {
      'idle': -1,
      'validating': 0,
      'downloading': 0,
      'probing': 0,
      'audio_extraction': 1,
      'speech_analysis': 2,
      'moment_extraction': 3,
      'rendering_clips': 4,
      'completed': 5,
      'error': -1
    };

    const curIndex = stageIndexMap[currentStage] ?? 0;
    if (currentStage === 'completed') return 'completed';
    if (isError) return 'error';
    if (index < curIndex) return 'completed';
    if (index === curIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className={`liquid-glass-panel rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto shadow-2xl space-y-6 ${
      isError ? 'border-rose-500/50 shadow-rose-950/40' : 'border-white/20 glow-clover'
    }`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border border-white/30 ${
            isError ? 'bg-rose-500/25 text-rose-300' : 'liquid-btn-primary text-white'
          }`}>
            {isError ? <AlertCircle className="w-5 h-5" /> : <Scissors className="w-5 h-5 animate-pulse" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{isError ? 'Processing Interrupted' : 'BlackClovercut AI Pipeline Processing'}</span>
              {!isError && (
                <span className="text-xs px-3 py-0.5 rounded-full liquid-badge text-emerald-300 font-mono font-bold">
                  {percent}%
                </span>
              )}
            </h3>
            <p className={`text-xs ${isError ? 'text-rose-300' : 'text-slate-300/90'}`}>
              {message}
            </p>
          </div>
        </div>

        {/* Status Badge / Action */}
        <div className="flex items-center gap-2">
          {isError ? (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-xs font-semibold text-slate-200 border border-white/10 transition-colors backdrop-blur-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 glass-pill px-3 py-1.5 rounded-xl border border-white/10">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Generating Shorts...</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar (hidden on error) */}
      {!isError ? (
        <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden p-0.5 border border-white/10 backdrop-blur-md">
          <div 
            className="h-full rounded-full gradient-clover transition-all duration-500 relative"
            style={{ width: `${Math.max(5, percent)}%` }}
          >
            <div className="absolute inset-0 bg-white/25 animate-pulse" />
          </div>
        </div>
      ) : (
        /* Error Alert Box */
        <div className="p-5 rounded-2xl border space-y-4 backdrop-blur-md bg-rose-950/20 border-rose-500/30">

          {isBotError ? (
            /* ── YOUTUBE BOT DETECTION SPECIFIC ERROR ── */
            <>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-white text-sm flex items-center gap-2">
                    YouTube Bot Detection Block
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 uppercase tracking-wide">HTTP 429</span>
                  </h4>
                  <p className="text-rose-200/90 text-xs leading-relaxed">
                    YouTube is blocking automated downloads on this IP. This is common on shared networks and ISPs. It is <strong className="text-white">not a bug</strong> — it's YouTube's anti-scraping protection.
                  </p>
                </div>
              </div>

              {/* Fix Options */}
              <div className="space-y-2.5">
                <p className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider">How to fix it — choose one:</p>

                <div className="space-y-2">
                  {/* Option 1: Upload directly */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                    <div>
                      <p className="text-xs font-bold text-emerald-200">⚡ Fastest: Upload the video file directly</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Download the video from YouTube (via browser → right-click → Save) or use a YouTube downloader site, then drag-and-drop it in the <strong className="text-white">"Upload Video File"</strong> tab.</p>
                    </div>
                  </div>

                  {/* Option 2: cookies.txt */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="w-5 h-5 rounded-full bg-white/10 text-slate-300 text-[11px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                    <div>
                      <p className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Cookie className="w-3.5 h-3.5 text-amber-400" />
                        Export YouTube cookies (advanced)
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        In Chrome, install <strong className="text-white">"Get cookies.txt LOCALLY"</strong> extension → visit YouTube while logged in → export cookies.txt → save it as <code className="text-emerald-300 font-mono bg-black/30 px-1 rounded">storage/youtube-cookies.txt</code> in the app folder, then retry.
                      </p>
                    </div>
                  </div>

                  {/* Option 3: Try with different IP */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="w-5 h-5 rounded-full bg-white/10 text-slate-300 text-[11px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">Try a VPN or mobile hotspot</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Switch your network connection to a VPN or mobile hotspot and retry. YouTube rate-limits by IP address.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="pt-1 flex flex-wrap gap-2">
                <button
                  onClick={onReset}
                  className="px-4 py-2.5 rounded-xl liquid-btn-primary text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Switch to Upload Video File</span>
                </button>
                <a
                  href="https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl liquid-btn-glass text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cookie Guide (yt-dlp docs)</span>
                </a>
              </div>
            </>
          ) : (
            /* ── GENERIC ERROR ── */
            <>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-white text-sm">Processing Error</h4>
                  <p className="text-rose-200 leading-relaxed">{message}</p>
                  <p className="text-slate-400 pt-1">
                    YouTube or external servers occasionally rate-limit automated download requests. You can bypass this completely by downloading the video and uploading it directly in the <strong className="text-white">Upload Video File</strong> tab.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={onReset}
                  className="px-4 py-2.5 rounded-xl liquid-btn-primary text-white text-xs font-bold flex items-center gap-1.5 shadow-lg"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Switch to Direct Video Upload</span>
                </button>
                <button
                  onClick={onReset}
                  className="px-4 py-2 rounded-xl liquid-btn-glass text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Try Again</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
        {STAGES.map((stg, idx) => {
          const status = getStageStatus(stg.id, idx);
          const IconComponent = stg.icon;

          return (
            <div 
              key={stg.id}
              className={`p-3.5 rounded-xl border transition-all ${
                status === 'completed'
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 backdrop-blur-md shadow-sm'
                  : status === 'current'
                  ? 'bg-emerald-500/15 border-emerald-400 text-white shadow-lg shadow-emerald-500/20 backdrop-blur-md'
                  : status === 'error'
                  ? 'bg-rose-950/20 border-rose-900/40 text-slate-500'
                  : 'bg-white/[0.02] border-white/5 text-slate-500 backdrop-blur-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  status === 'completed' 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : status === 'current' 
                    ? 'bg-emerald-500/25 text-emerald-300 animate-bounce' 
                    : 'bg-white/[0.05] text-slate-500'
                }`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                {status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {status === 'current' && <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />}
              </div>

              <h4 className="text-xs font-bold leading-tight line-clamp-1">
                {stg.label}
              </h4>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                {stg.desc}
              </p>
            </div>
          );
        })}
      </div>

    </div>
  );
}
