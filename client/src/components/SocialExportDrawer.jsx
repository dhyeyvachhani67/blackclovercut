import React, { useState } from 'react';
import { 
  X, Copy, Check, Download, Share2, 
  Youtube, Instagram, FileText, Sparkles, ExternalLink 
} from 'lucide-react';

export default function SocialExportDrawer({
  clip,
  projectId,
  onClose
}) {
  const [activePlatform, setActivePlatform] = useState('youtube'); // 'youtube' | 'instagram' | 'tiktok'
  const [copiedField, setCopiedField] = useState(null);

  const social = clip.socialMetadata || {};
  const ytData = social.youtube || {
    title: `${clip.title} #shorts`,
    description: `${clip.description}\n\nKey Takeaway: "${clip.hook}"\n\n#shorts #viral #reels`,
    hashtags: ['#shorts', '#viral', '#reels', '#trending']
  };

  const igData = social.instagram || {
    caption: `Save this insight! 📌\n\n"${clip.hook}"\n\nDrop your thoughts below 👇\n\n#reels #viral #creator`,
    hashtags: ['#reels', '#viral', '#explorepage', '#trending']
  };

  const tiktokData = social.tiktok || {
    caption: `${clip.title} 🤯 wait till the end! #fyp #viral #trending`,
    hashtags: ['#fyp', '#viral', '#tiktok', '#trending']
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xl overflow-y-auto">
      <div className="liquid-glass-panel rounded-2xl sm:rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] border border-white/20">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.04] backdrop-blur-md flex-shrink-0 relative z-10">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl liquid-btn-primary flex items-center justify-center shadow-md shadow-emerald-500/30">
              <Share2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Social Media Export Presets
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300/80 hidden xs:block">
                AI-optimized titles, descriptions, and hashtags for each platform
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

        {/* Platform Selector Tabs */}
        <div className="grid grid-cols-3 border-b border-white/10 bg-white/[0.02] flex-shrink-0 p-2 gap-2 relative z-10">
          <button
            onClick={() => setActivePlatform('youtube')}
            className={`py-2.5 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              activePlatform === 'youtube'
                ? 'liquid-pill text-red-400 border-red-500/40 bg-red-500/10'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <Youtube className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
            <span className="hidden xs:inline">YouTube Shorts</span>
            <span className="xs:hidden">Shorts</span>
          </button>

          <button
            onClick={() => setActivePlatform('instagram')}
            className={`py-2.5 sm:py-3 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              activePlatform === 'instagram'
                ? 'border-pink-500 text-pink-400 bg-pink-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-500" />
            <span className="hidden xs:inline">Instagram Reels</span>
            <span className="xs:hidden">Reels</span>
          </button>

          <button
            onClick={() => setActivePlatform('tiktok')}
            className={`py-2.5 sm:py-3 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              activePlatform === 'tiktok'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
            <span>TikTok</span>
          </button>
        </div>

        {/* Preset Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          
          {/* YOUTUBE SHORTS */}
          {activePlatform === 'youtube' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Shorts Title (Under 60 chars)</span>
                  <button
                    onClick={() => copyToClipboard(ytData.title, 'yt_title')}
                    className="text-violet-400 hover:text-violet-300 flex items-center gap-1 font-normal"
                  >
                    {copiedField === 'yt_title' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'yt_title' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 sm:p-3 text-xs text-white font-medium">
                  {ytData.title}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>SEO Description & Call to Action</span>
                  <button
                    onClick={() => copyToClipboard(ytData.description, 'yt_desc')}
                    className="text-violet-400 hover:text-violet-300 flex items-center gap-1 font-normal"
                  >
                    {copiedField === 'yt_desc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'yt_desc' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 sm:p-3 text-xs text-slate-300 whitespace-pre-line max-h-32 overflow-y-auto font-mono">
                  {ytData.description}
                </div>
              </div>
            </div>
          )}

          {/* INSTAGRAM REELS */}
          {activePlatform === 'instagram' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Reels Caption & Engagement Hook</span>
                  <button
                    onClick={() => copyToClipboard(igData.caption, 'ig_caption')}
                    className="text-pink-400 hover:text-pink-300 flex items-center gap-1 font-normal"
                  >
                    {copiedField === 'ig_caption' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'ig_caption' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 sm:p-3 text-xs text-slate-300 whitespace-pre-line max-h-36 overflow-y-auto">
                  {igData.caption}
                </div>
              </div>
            </div>
          )}

          {/* TIKTOK */}
          {activePlatform === 'tiktok' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>TikTok Hook & Viral Sounds Tip</span>
                  <button
                    onClick={() => copyToClipboard(tiktokData.caption, 'tt_caption')}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-normal"
                  >
                    {copiedField === 'tt_caption' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'tt_caption' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 sm:p-3 text-xs text-slate-300 whitespace-pre-line">
                  {tiktokData.caption}
                </div>
              </div>
            </div>
          )}

          {/* Platform Policy Disclaimer */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <span>
              Exports high-definition MP4 files ready for manual upload to preserve your privacy and account security.
            </span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 px-4 sm:px-6 border-t border-slate-800 bg-slate-900/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 flex-shrink-0">
          <a
            href={`/api/clips/${projectId}/${clip.id}/subtitles`}
            download
            className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 py-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Download Subtitles (.srt)</span>
          </a>

          <a
            href={`/api/clips/${projectId}/${clip.id}/download`}
            download
            className="px-4 sm:px-5 py-2.5 rounded-lg gradient-accent hover:opacity-95 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 text-center"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Rendered MP4</span>
          </a>
        </div>

      </div>
    </div>
  );
}
