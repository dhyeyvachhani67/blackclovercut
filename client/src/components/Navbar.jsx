import React from 'react';
import { Sparkles, Scissors, FolderGit2, Settings, Zap, PlaySquare } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onReset }) {
  const navItems = [
    { id: 'create', label: 'Generate Clips', shortLabel: 'Generate', icon: Zap },
    { id: 'projects', label: 'My Projects', shortLabel: 'Projects', icon: FolderGit2 },
    { id: 'samples', label: 'Sample Videos', shortLabel: 'Samples', icon: PlaySquare },
    { id: 'settings', label: 'Settings', shortLabel: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Top Liquid Glass Header */}
      <header className="sticky top-0 z-40 w-full liquid-glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo - BlackClovercut AI */}
          <div 
            onClick={onReset}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group flex-shrink-0"
          >
            {/* Clover Emblem with Liquid Glass Halo */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl liquid-btn-primary flex items-center justify-center shadow-lg shadow-emerald-500/35 group-hover:scale-105 transition-all duration-300 relative">
              <Scissors className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300 border-2 border-black/80 shadow-md animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-white font-sans drop-shadow-sm">
                  BlackClovercut <span className="gradient-text-clover font-black">AI</span>
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full liquid-badge text-emerald-300">
                  PRO
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-300/80 hidden sm:block">
                Turn Long Videos into Viral Short Clips
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 sm:gap-2.5">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'liquid-pill text-emerald-300 shadow-md shadow-emerald-950/40 border-emerald-400/40'
                      : 'text-slate-300/80 hover:text-white hover:bg-white/[0.06] rounded-full'
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status Badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-200 liquid-pill px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="font-semibold hidden xs:inline text-emerald-200">Engine Online</span>
              <span className="font-semibold xs:hidden text-emerald-200">Ready</span>
            </div>
          </div>

        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 liquid-glass-nav px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb">
        {navItems.map((item) => {
          const IconComp = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
                isActive
                  ? 'text-emerald-300 liquid-pill bg-white/[0.1]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <IconComp className={`w-5 h-5 ${isActive ? 'text-emerald-400' : ''}`} />
              <span className="text-[10px] font-semibold mt-0.5">
                {item.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
