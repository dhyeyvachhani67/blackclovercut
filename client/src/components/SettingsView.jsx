import React, { useState, useEffect } from 'react';
import { Settings, Key, Sparkles, Check, Sliders, Shield, Trash2, Smartphone, Scissors, Cookie, AlertCircle, ExternalLink, Upload, FileText, Search, Globe, Star, Eye } from 'lucide-react';

export default function SettingsView() {
  const [settings, setSettings] = useState({
    geminiApiKey: '',
    openaiApiKey: '',
    defaultAspectRatio: '9:16',
    defaultCaptionStyle: 'hormozi',
    defaultClippingStyle: 'auto',
    autoNormalizeAudio: true,
    watermarkEnabled: false,
    watermarkText: 'BlackClovercut AI',
    hasYouTubeCookies: false,
    youtubeCookiesSize: 0
  });
  const [cookieInput, setCookieInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('clips creates');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) setSettings(prev => ({ ...prev, ...data.settings }));
      })
      .catch(console.error);
  }, []);

  const handleCookieFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setCookieInput(evt.target.result || '');
    };
    reader.readAsText(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const payload = {
        ...settings,
        youtubeCookies: cookieInput.trim() ? cookieInput : undefined
      };

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        if (cookieInput.trim()) {
          setSettings(prev => ({ ...prev, hasYouTubeCookies: true }));
          setCookieInput('');
        }
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearCookies = async () => {
    if (!confirm('Remove saved YouTube cookies?')) return;
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearCookies: true })
      });
      setSettings(prev => ({ ...prev, hasYouTubeCookies: false, youtubeCookiesSize: 0 }));
      setCookieInput('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Scissors className="w-5 h-5 text-emerald-400" />
          <span>BlackClovercut AI Settings</span>
        </h2>
        <p className="text-xs text-slate-400">
          Configure AI reasoning keys, export defaults, and processing preferences
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* AI Models Liquid Glass Card */}
        <div className="liquid-glass-panel rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/10 pb-3 relative z-10">
            <Key className="w-4 h-4 text-emerald-400" />
            <span>AI Reasoning & Cloud API Keys (Optional)</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed relative z-10">
            BlackClovercut AI features a built-in intelligent NLP heuristic engine that works completely offline. Supplying a Gemini or OpenAI API key is optional and unlocks deeper semantic reasoning and custom prompt tweaking.
          </p>

          <div className="space-y-3 relative z-10">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">
                Google Gemini API Key
              </label>
              <input
                type="password"
                value={settings.geminiApiKey || ''}
                onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                placeholder="AIzaSy..."
                className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">
                OpenAI API Key (Optional)
              </label>
              <input
                type="password"
                value={settings.openaiApiKey || ''}
                onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* YouTube Authentication & Bot-Bypass Card */}
        <div className="liquid-glass-panel rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 relative z-10">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Cookie className="w-4 h-4 text-amber-400" />
              <span>YouTube Authentication & Bot-Bypass</span>
            </div>

            {settings.hasYouTubeCookies ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                <Check className="w-3.5 h-3.5" />
                Cookies Active ({Math.round((settings.youtubeCookiesSize || 0) / 1024)} KB)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">
                No Cookies Added
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed relative z-10">
            YouTube frequently serves a <em>"Sign in to confirm you're not a bot"</em> challenge when downloading videos over datacenter/shared networks. Supplying exported cookies proves to YouTube that a legitimate user account is backing the request.
          </p>

          <div className="space-y-3 relative z-10">
            {/* Direct Upload Note */}
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5 text-xs text-slate-300">
              <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-300">Zero-setup alternative:</span> You can bypass all YouTube bot blocks without cookies by downloading the MP4 in your browser and uploading it directly on the <strong className="text-white">Upload Video File</strong> tab.
              </div>
            </div>

            {/* Cookie Paste / File Drop */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  Paste cookies.txt Content or Upload File
                </label>
                <label className="cursor-pointer text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 text-[11px]">
                  <Upload className="w-3 h-3" />
                  <span>Choose cookies.txt</span>
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleCookieFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <textarea
                value={cookieInput}
                onChange={(e) => setCookieInput(e.target.value)}
                placeholder="# Netscape HTTP Cookie File&#10;.youtube.com  TRUE  /  TRUE  1793189800  SID  s%3A...&#10;# Export via 'Get cookies.txt LOCALLY' Chrome extension"
                rows={3}
                className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
            </div>

            {settings.hasYouTubeCookies && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-emerald-400/90 font-mono">
                  Saved to storage/youtube-cookies.txt
                </span>
                <button
                  type="button"
                  onClick={handleClearCookies}
                  className="text-xs text-rose-400 hover:text-rose-300 underline font-medium"
                >
                  Clear Saved Cookies
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Video & Export Defaults Liquid Glass Card */}
        <div className="liquid-glass-panel rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/10 pb-3 relative z-10">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Export & Video Defaults</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Default Aspect Ratio</label>
              <select
                value={settings.defaultAspectRatio}
                onChange={(e) => setSettings({ ...settings, defaultAspectRatio: e.target.value })}
                className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="9:16" className="bg-[#0b1324] text-white">9:16 Vertical (Shorts & Reels)</option>
                <option value="1:1" className="bg-[#0b1324] text-white">1:1 Square</option>
                <option value="16:9" className="bg-[#0b1324] text-white">16:9 Landscape</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Default Caption Style</label>
              <select
                value={settings.defaultCaptionStyle}
                onChange={(e) => setSettings({ ...settings, defaultCaptionStyle: e.target.value })}
                className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="hormozi" className="bg-[#0b1324] text-white">Hormozi Pop (Yellow/White)</option>
                <option value="mrbeast" className="bg-[#0b1324] text-white">MrBeast Pop (Green/Cyan)</option>
                <option value="minimal" className="bg-[#0b1324] text-white">Minimalist Clean (White)</option>
                <option value="cinematic" className="bg-[#0b1324] text-white">Cinematic Gold</option>
              </select>
            </div>
          </div>

          <div className="pt-2 relative z-10">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-200">
              <input
                type="checkbox"
                checked={settings.autoNormalizeAudio}
                onChange={(e) => setSettings({ ...settings, autoNormalizeAudio: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <span>Automatically apply loudness normalization (loudnorm) to all exported clips</span>
            </label>
          </div>
        </div>

        {/* Live Google Search Ranking & SERP Preview Card */}
        <div className="liquid-glass-panel rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 relative z-10">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Google Search Result & SEO Ranking Preview</span>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 font-bold uppercase tracking-wider">
              Google SERP #1
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed relative z-10">
            Preview how <strong className="text-white font-bold">BlackClovercut AI</strong> appears on Google Search when creators search for keywords like <code className="text-emerald-300 font-mono">"clips creates"</code>, <code className="text-emerald-300 font-mono">"clips creator"</code>, or <code className="text-emerald-300 font-mono">"black clover ai"</code>:
          </p>

          {/* Interactive Search Query Bar */}
          <div className="relative z-10 flex items-center gap-2 bg-[#202124] rounded-full px-4 py-2.5 border border-white/10 shadow-inner">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search query on Google..."
              className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none flex-1 font-sans"
            />
            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">Google Search Simulator</span>
          </div>

          {/* Realistic Google Search Result Card (Authentic Google Dark UI) */}
          <div className="relative z-10 p-5 rounded-2xl bg-[#202124] border border-[#3c4043] space-y-2.5 shadow-xl font-sans text-left">
            
            {/* Header: Favicon + Breadcrumb + Verified */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                <Scissors className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="leading-tight text-xs">
                <div className="font-semibold text-[#dadce0] flex items-center gap-1.5">
                  <span>BlackClovercut AI</span>
                  <span className="text-[10px] text-slate-400">· Official Site</span>
                </div>
                <div className="text-[#bdc1c6] text-[11px] truncate">
                  https://blackclovercut.ai <span className="text-slate-400">› clips-creator › {searchQuery.toLowerCase().replace(/\s+/g, '-')}</span>
                </div>
              </div>
            </div>

            {/* Clickable Blue Title with Clover AI branding */}
            <h3 className="text-lg sm:text-xl font-medium text-[#8ab4f8] hover:underline cursor-pointer leading-snug">
              BlackClovercut AI — #1 AI Video Clips Creator for YouTube Shorts & Reels
            </h3>

            {/* Google Rating Rich Snippet */}
            <div className="flex items-center gap-2 text-xs text-[#bdc1c6] pt-0.5">
              <div className="flex items-center text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
              </div>
              <span className="text-[#dadce0] font-bold">4.9</span>
              <span>(1,420 votes)</span>
              <span>·</span>
              <span className="text-emerald-400 font-semibold">Free</span>
              <span>·</span>
              <span>Video Editing & Viral Shorts</span>
            </div>

            {/* Google Snippet Description highlighting the search query */}
            <p className="text-xs sm:text-sm text-[#bdc1c6] leading-relaxed">
              <strong className="text-white font-semibold">BlackClovercut AI</strong> automatically turns long videos, podcasts, and interviews into high-retention short clips. When creator searches for <strong className="text-[#8ab4f8]">{searchQuery || 'clips creates'}</strong>, BlackClovercut detects the best punchlines, reframes 9:16 vertical shorts, and animates subtitles.
            </p>

            {/* Google Sitelinks Rich Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#3c4043]/80">
              <div className="space-y-0.5">
                <div className="text-sm font-medium text-[#8ab4f8] hover:underline cursor-pointer flex items-center gap-1">
                  <span>⚡ 1-Click Viral Clips</span>
                </div>
                <p className="text-[11px] text-[#9aa0a6] leading-normal">
                  Extract high-retention moments from YouTube URLs or MP4 uploads in seconds.
                </p>
              </div>

              <div className="space-y-0.5">
                <div className="text-sm font-medium text-[#8ab4f8] hover:underline cursor-pointer flex items-center gap-1">
                  <span>🎬 YouTube to Shorts</span>
                </div>
                <p className="text-[11px] text-[#9aa0a6] leading-normal">
                  Auto 9:16 vertical blur-fill & center crop for Instagram Reels & TikTok.
                </p>
              </div>

              <div className="space-y-0.5">
                <div className="text-sm font-medium text-[#8ab4f8] hover:underline cursor-pointer flex items-center gap-1">
                  <span>💬 Animated Subtitles</span>
                </div>
                <p className="text-[11px] text-[#9aa0a6] leading-normal">
                  Word-by-word karaoke style (Hormozi, MrBeast, Minimal & Gold presets).
                </p>
              </div>

              <div className="space-y-0.5">
                <div className="text-sm font-medium text-[#8ab4f8] hover:underline cursor-pointer flex items-center gap-1">
                  <span>📊 AI Hook & Retention Score</span>
                </div>
                <p className="text-[11px] text-[#9aa0a6] leading-normal">
                  Intelligent scoring (0–100%) explaining why each short moment was chosen.
                </p>
              </div>
            </div>

          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 relative z-10">
            <span>Indexed tags: title, description, schema.org WebApplication, robots.txt, sitemap.xml</span>
            <span className="text-emerald-400 font-semibold">Schema.org Validated ✓</span>
          </div>
        </div>

        {/* Security & Retention Policy */}
        <div className="liquid-glass-panel rounded-3xl p-6 sm:p-7 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/10 pb-3 relative z-10">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Data Security & Local Storage Policy</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed relative z-10">
            All videos and clips are stored securely in your local application directory (<code className="text-emerald-300 font-mono">/storage</code>). We do not send your raw video files to third parties. Only process videos you own or are legally authorized to publish.
          </p>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between relative z-10">
          <div>
            {savedSuccess && (
              <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                Settings updated successfully!
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-7 py-3 rounded-xl liquid-btn-primary text-xs font-bold text-white transition-all shadow-lg"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

      </form>
    </div>
  );
}
