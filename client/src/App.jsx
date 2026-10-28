import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import VideoInputSection from './components/VideoInputSection';
import ProcessingStepper from './components/ProcessingStepper';
import ClipCard from './components/ClipCard';
import ClipEditorModal from './components/ClipEditorModal';
import SocialExportDrawer from './components/SocialExportDrawer';
import ProjectsView from './components/ProjectsView';
import SettingsView from './components/SettingsView';
import SampleVideosModal from './components/SampleVideosModal';
import { 
  Sparkles, Layers, Sliders, Film, ArrowLeft, 
  Flame, CheckCircle2, RotateCcw, X, Play 
} from 'lucide-react';
import { formatTime } from './utils/formatters';

export default function App() {
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'projects' | 'samples' | 'settings'
  const [allProjects, setAllProjects] = useState([]);
  const [samples, setSamples] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(null);
  const [pollProjectId, setPollProjectId] = useState(null);

  // Modals & Drawers
  const [editorClip, setEditorClip] = useState(null);
  const [exportClip, setExportClip] = useState(null);
  const [quickPlayClip, setQuickPlayClip] = useState(null);

  // Fetch projects and samples on initial mount
  const fetchProjectsAndSamples = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success) {
        setAllProjects(data.projects || []);
        setSamples(data.samples || []);
      }
    } catch (err) {
      console.warn('Could not fetch projects:', err);
    }
  };

  useEffect(() => {
    fetchProjectsAndSamples();
  }, []);

  // Polling for pipeline progress
  useEffect(() => {
    if (!pollProjectId || !isProcessing) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/analyze/progress/${pollProjectId}`);
        const data = await res.json();

        if (data.success && data.progress) {
          setProgress(data.progress);

          if (data.progress.stage === 'completed' || data.progress.percent >= 100) {
            setIsProcessing(false);
            clearInterval(interval);

            // Fetch the completed project
            const projRes = await fetch(`/api/projects/${pollProjectId}`);
            const projData = await projRes.json();
            if (projData.success && projData.project) {
              setCurrentProject(projData.project);
              fetchProjectsAndSamples();
            }
          } else if (data.progress.stage === 'error') {
            // Stop polling but keep isProcessing visible so user sees the explanation and actions
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.warn('Polling error:', err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pollProjectId, isProcessing]);

  // Start analysis trigger
  const handleStartAnalysis = async (params) => {
    setIsProcessing(true);
    setProgress({ stage: 'validating', percent: 10, message: 'Initiating video analysis...' });
    setCurrentProject(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();

      if (data.success && data.projectId) {
        setPollProjectId(data.projectId);
      } else {
        setIsProcessing(false);
        alert(data.error || 'Failed to start analysis.');
      }
    } catch (err) {
      setIsProcessing(false);
      alert(err.message);
    }
  };

  // Select sample video
  const handleSelectSample = (sample) => {
    setActiveTab('create');
    handleStartAnalysis({
      sampleId: sample.id,
      clippingStyle: 'auto',
      targetDuration: '30-60',
      clipCount: 5,
      aspectRatio: '9:16',
      captionStyle: 'hormozi'
    });
  };

  // Update clip in current project after editing
  const handleSaveClip = (updatedClip) => {
    if (!currentProject) return;
    const newClips = currentProject.clips.map(c => c.id === updatedClip.id ? updatedClip : c);
    setCurrentProject({ ...currentProject, clips: newClips });
  };

  // Delete project
  const handleDeleteProject = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      fetchProjectsAndSamples();
      if (currentProject?.id === id) {
        setCurrentProject(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-emerald-500 selection:text-black">
      
      {/* Living Liquid Fluid Ambient Mesh & Caustics Engine */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden liquid-caustic-mesh">
        {/* Blob 1: Emerald Clover Liquid Wave */}
        <div className="absolute -top-32 -left-32 w-[38rem] h-[38rem] rounded-full bg-gradient-to-br from-emerald-500/35 via-teal-400/25 to-emerald-700/15 blur-[120px] animate-liquid-1" />
        
        {/* Blob 2: Cyan & Electric Azure Ripple */}
        <div className="absolute top-1/4 -right-32 w-[42rem] h-[42rem] rounded-full bg-gradient-to-tr from-cyan-500/30 via-sky-500/20 to-blue-600/15 blur-[140px] animate-liquid-2" />
        
        {/* Blob 3: Royal Violet & Neon Orchid Swirl */}
        <div className="absolute -bottom-24 left-1/4 w-[40rem] h-[40rem] rounded-full bg-gradient-to-tl from-violet-600/30 via-indigo-500/25 to-purple-800/15 blur-[130px] animate-liquid-3" />

        {/* Blob 4: Pulsing Liquid Caustic Core */}
        <div className="absolute top-1/2 left-1/3 w-[26rem] h-[26rem] rounded-full bg-emerald-400/20 blur-[100px] animate-liquid-pulse" />
        
        {/* Delicate Glass Noise / Caustic Grid Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:28px_28px] opacity-40" />
      </div>
      
      {/* Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'create' && currentProject) {
            // Keep viewing current project
          }
        }} 
        onReset={() => {
          setActiveTab('create');
          setCurrentProject(null);
          setIsProcessing(false);
        }}
      />

      {/* Main Container with responsive padding (extra bottom padding on mobile for bottom nav) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-10 pb-24 md:pb-12">
        
        {/* VIEW 1: CREATE / RESULTS VIEW */}
        {activeTab === 'create' && (
          <div className="space-y-10">
            
            {/* If currently processing, show the live stepper */}
            {isProcessing && (
              <ProcessingStepper 
                progress={progress} 
                onReset={() => {
                  setIsProcessing(false);
                  setProgress(null);
                  setPollProjectId(null);
                }}
              />
            )}

            {/* If not processing and no project is currently loaded, show input section */}
            {!isProcessing && !currentProject && (
              <VideoInputSection
                onStartAnalysis={handleStartAnalysis}
                samples={samples}
                onSelectSample={handleSelectSample}
                isProcessing={isProcessing}
              />
            )}

            {/* If analysis finished and we have a project loaded with clips */}
            {!isProcessing && currentProject && (
              <div className="space-y-8">
                
                {/* Project Header Banner */}
                <div className="liquid-glass-panel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 glow-clover">
                  <div className="space-y-2 relative z-10">
                    <button
                      onClick={() => setCurrentProject(null)}
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-emerald-200 font-semibold mb-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Upload Another Video</span>
                    </button>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      {currentProject.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                      <span>Source Duration: {formatTime(currentProject.duration)}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {currentProject.clips?.length || 0} Viral Clips Generated
                      </span>
                      <span>•</span>
                      <span className="text-cyan-300 font-mono">9:16 Vertical Subtitled</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
                    <button
                      onClick={() => setCurrentProject(null)}
                      className="liquid-btn-glass px-4 py-2.5 text-slate-200 text-xs font-semibold flex items-center gap-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>New Video</span>
                    </button>
                  </div>
                </div>

                {/* Clips Grid */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-yellow-400" />
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        Generated Viral Shorts (Ranked by Hook & Retention)
                      </h3>
                    </div>
                    <span className="text-xs text-slate-400">
                      Click any clip to preview, edit subtitles, or export
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentProject.clips?.map((clip) => (
                      <ClipCard
                        key={clip.id}
                        clip={clip}
                        projectId={currentProject.id}
                        onOpenEditor={(c) => setEditorClip(c)}
                        onOpenExport={(c) => setExportClip(c)}
                        onQuickPlay={(c) => setQuickPlayClip(c)}
                      />
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* VIEW 2: MY PROJECTS */}
        {activeTab === 'projects' && (
          <ProjectsView
            projects={allProjects}
            onOpenProject={(proj) => {
              setCurrentProject(proj);
              setActiveTab('create');
            }}
            onDeleteProject={handleDeleteProject}
          />
        )}

        {/* VIEW 3: SAMPLE VIDEOS */}
        {activeTab === 'samples' && (
          <SampleVideosModal
            samples={samples}
            onSelectSample={handleSelectSample}
          />
        )}

        {/* VIEW 4: SETTINGS */}
        {activeTab === 'settings' && (
          <SettingsView />
        )}

      </main>

      {/* MODAL 1: Clip Studio Editor */}
      {editorClip && currentProject && (
        <ClipEditorModal
          clip={editorClip}
          projectId={currentProject.id}
          onClose={() => setEditorClip(null)}
          onSaveClip={handleSaveClip}
        />
      )}

      {/* MODAL 2: Social Export Presets Drawer */}
      {exportClip && currentProject && (
        <SocialExportDrawer
          clip={exportClip}
          projectId={currentProject.id}
          onClose={() => setExportClip(null)}
        />
      )}

      {/* MODAL 3: Quick Video Player with Liquid Glass */}
      {quickPlayClip && (
        <div 
          onClick={() => setQuickPlayClip(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="liquid-glass-panel rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl relative border border-white/20"
          >
            <div className="absolute top-3 right-3 z-30">
              <button
                onClick={() => setQuickPlayClip(null)}
                className="w-8 h-8 rounded-full liquid-pill text-white flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-[9/16] w-full bg-black/40">
              <video
                src={quickPlayClip.videoUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-4 bg-white/[0.03] backdrop-blur-md border-t border-white/10 space-y-1.5 relative z-10">
              <h4 className="text-sm font-bold text-white line-clamp-1">
                {quickPlayClip.title}
              </h4>
              <p className="text-xs text-emerald-300/90 line-clamp-2">
                "{quickPlayClip.hook}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.06] py-6 text-center text-xs text-slate-500 glass-nav mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">BlackClovercut AI</span>
            <span>—</span>
            <span>Turn Long Videos into Viral Short Clips</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>9:16 Vertical Video Engine</span>
            <span>•</span>
            <span>Powered by FFmpeg & Speech Intelligence</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
