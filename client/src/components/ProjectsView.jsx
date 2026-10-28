import React from 'react';
import { FolderGit2, Film, Clock, Layers, Trash2, ArrowRight } from 'lucide-react';
import { formatTime } from '../utils/formatters';

export default function ProjectsView({
  projects,
  onOpenProject,
  onDeleteProject
}) {
  if (!projects || projects.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
          <FolderGit2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white">No Projects Saved Yet</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Upload a video or try one of the creator samples to start generating viral short clips.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">My Projects</h2>
          <p className="text-xs text-slate-300">All your analyzed videos and generated shorts</p>
        </div>
        <span className="text-xs text-emerald-300 font-mono liquid-badge px-3 py-1 rounded-full">
          {projects.length} Projects
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="liquid-glass-card hover:border-emerald-400/60 rounded-3xl overflow-hidden transition-all flex flex-col justify-between group shadow-xl"
          >
            <div>
              <div className="relative aspect-video w-full bg-slate-950/60 overflow-hidden">
                {proj.thumbnailUrl ? (
                  <img src={proj.thumbnailUrl} alt={proj.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-700">
                    <Film className="w-8 h-8" />
                  </div>
                )}
                <span className="absolute bottom-2 right-2 liquid-badge px-2.5 py-0.5 rounded-full text-[10px] text-white font-mono">
                  {formatTime(proj.duration)}
                </span>
              </div>

              <div className="p-5 space-y-2 relative z-10">
                <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-emerald-300 transition-colors">
                  {proj.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{proj.clips?.length || 0} Clips</span>
                  </span>
                  <span>•</span>
                  <span>{new Date(proj.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="p-4 pt-0 flex items-center justify-between border-t border-white/10 mt-2 relative z-10">
              <button
                onClick={() => onOpenProject(proj)}
                className="py-1.5 px-3 rounded-full liquid-pill text-xs text-emerald-300 hover:text-white font-semibold flex items-center gap-1.5 transition-all"
              >
                <span>View Clips</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onDeleteProject(proj.id)}
                className="p-1.5 rounded-full liquid-pill text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
                title="Delete project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
