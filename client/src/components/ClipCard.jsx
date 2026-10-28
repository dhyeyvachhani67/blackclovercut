import React from 'react';
import { 
  Play, Download, Share2, Sliders, Flame, Sparkles, 
  FileText, Clock, Smartphone, MessageSquare, Scissors 
} from 'lucide-react';
import { formatTime, getScoreBadge } from '../utils/formatters';

export default function ClipCard({
  clip,
  projectId,
  onOpenEditor,
  onOpenExport,
  onQuickPlay
}) {
  const scoreInfo = getScoreBadge(clip.engagementScore || 85);

  return (
    <div className="liquid-glass-card rounded-3xl overflow-hidden group flex flex-col justify-between relative shadow-xl">
      
      {/* Top Glass Media Preview */}
      <div className="relative aspect-[9/12] w-full bg-slate-950/60 overflow-hidden cursor-pointer" onClick={() => onQuickPlay(clip)}>
        {clip.thumbnailUrl ? (
          <img 
            src={clip.thumbnailUrl} 
            alt={clip.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900/60">
            <Smartphone className="w-12 h-12 text-slate-700" />
          </div>
        )}

        {/* Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/60 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          {/* Viral Score Badge with Liquid Glass */}
          <div className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 liquid-badge shadow-lg ${scoreInfo.color}`}>
            <Flame className={`w-3.5 h-3.5 ${scoreInfo.flame} animate-pulse`} />
            <span>{clip.engagementScore || 88}% Potential</span>
          </div>

          {/* 9:16 Aspect Badge */}
          <span className="px-2.5 py-0.5 rounded-full liquid-badge text-slate-200 text-[10px] font-mono uppercase">
            {clip.aspectRatio || '9:16'}
          </span>
        </div>

        {/* Center Hover Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <div className="w-14 h-14 rounded-full liquid-btn-primary flex items-center justify-center shadow-xl shadow-emerald-500/50 scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-6 h-6 text-white ml-0.5 fill-white drop-shadow" />
          </div>
        </div>

        {/* Bottom Time & Hook Banner */}
        <div className="absolute bottom-3 left-3 right-3 pointer-events-none z-10">
          <div className="flex items-center gap-2 text-[11px] text-slate-300 font-mono mb-1.5">
            <span className="liquid-badge px-2.5 py-0.5 rounded-full text-white font-medium">
              {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
            </span>
            <span className="liquid-badge px-2.5 py-0.5 rounded-full text-emerald-300 font-bold border-emerald-400/40">
              {clip.duration}s
            </span>
          </div>

          <p className="text-xs text-white/95 font-medium line-clamp-2 drop-shadow-md bg-black/40 backdrop-blur-md p-2.5 rounded-xl border border-white/15">
            "{clip.hook || clip.title}"
          </p>
        </div>

      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 space-y-3.5 flex-1 flex flex-col justify-between relative z-10">
        
        <div className="space-y-2.5">
          <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1 drop-shadow-sm">
            {clip.title}
          </h4>

          {/* AI Reason for selection */}
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-[11px] text-slate-300 space-y-1.5 backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[10px] uppercase tracking-wider">
              <Scissors className="w-3 h-3 text-emerald-400" />
              <span>BlackClover AI Pick</span>
            </div>
            <p className="line-clamp-2 text-slate-200/90 leading-relaxed">
              {clip.reason}
            </p>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="pt-3 border-t border-white/10 space-y-2">
          
          <div className="grid grid-cols-2 gap-2">
            {/* Studio Editor Button */}
            <button
              onClick={() => onOpenEditor(clip)}
              className="py-2.5 px-3 rounded-xl liquid-btn-glass text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Edit Studio</span>
            </button>

            {/* Social Export Button */}
            <button
              onClick={() => onOpenExport(clip)}
              className="py-2.5 px-3 rounded-xl liquid-btn-glass text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 border-emerald-500/30 hover:border-emerald-400/50 transition-all"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Preset</span>
            </button>
          </div>

          {/* Quick Downloads */}
          <div className="flex items-center gap-2">
            <a
              href={`/api/clips/${projectId}/${clip.id}/download`}
              download
              className="flex-1 py-2 px-3 rounded-xl liquid-pill text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download MP4</span>
            </a>

            <a
              href={`/api/clips/${projectId}/${clip.id}/subtitles`}
              download
              title="Download Subtitles (.srt)"
              className="p-2 rounded-xl liquid-pill text-slate-300 hover:text-white transition-colors flex items-center justify-center"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
            </a>
          </div>

        </div>

      </div>

    </div>
  );
}
