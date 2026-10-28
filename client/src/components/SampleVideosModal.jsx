import React from 'react';
import { PlaySquare, Play, Sparkles, ArrowRight, Clock, User, CheckCircle2 } from 'lucide-react';
import { formatTime } from '../utils/formatters';

export default function SampleVideosModal({
  samples,
  onSelectSample
}) {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <PlaySquare className="w-5 h-5 text-emerald-400" />
          <span>Pre-Loaded Creator Templates & Samples</span>
        </h2>
        <p className="text-xs text-slate-300">
          Test BlackClovercut AI instantly with pre-loaded, transcribed, and structured podcast & interview content.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {samples?.map((sample) => (
          <div
            key={sample.id}
            className="liquid-glass-card hover:border-emerald-400/60 rounded-3xl p-5 transition-all flex flex-col justify-between group space-y-4 shadow-xl"
          >
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full liquid-badge text-emerald-300 text-xs font-bold">
                  {sample.category}
                </span>
                <span className="text-xs font-mono text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  {formatTime(sample.duration)}
                </span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                {sample.title}
              </h3>

              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>{sample.speaker}</span>
              </div>

              <p className="text-xs text-slate-300/80 leading-relaxed">
                {sample.description}
              </p>

              {/* Sample transcript excerpt */}
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5 text-xs text-slate-200 backdrop-blur-md">
                <div className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
                  Sample Transcript Hook:
                </div>
                <p className="italic text-slate-300 line-clamp-2">
                  "{sample.transcripts[0]?.text}"
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectSample(sample)}
              className="w-full py-2.5 rounded-xl liquid-btn-primary text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all relative z-10"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Analyze This Sample Video</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
