import React, { useState, useEffect } from 'react';
import {
  Film,
  Sparkles,
  Download,
  Layers,
  Wand2,
  Settings,
  HelpCircle,
  Play,
  RotateCcw,
  CheckCircle,
  Video,
} from 'lucide-react';
import { VideoProject, GeneratedClip, PresetScene } from './types';
import { PRESET_SCENES, generateAlpineMeadowImage } from './utils/presets';
import { VideoPlayer } from './components/VideoPlayer';
import { PromptDirector } from './components/PromptDirector';
import { MediaBay } from './components/MediaBay';
import { ExportModal } from './components/ExportModal';
import { VeoGenerationModal } from './components/VeoGenerationModal';
import { ClipHistory } from './components/ClipHistory';

export default function App() {
  // Initialize default project based on user's Alpine Meadow Kiss photo
  const defaultScene = PRESET_SCENES[0];
  const [project, setProject] = useState<VideoProject>({
    id: 'proj_alpine_meadow',
    title: 'Alpine Meadow Kiss (Golden Hour)',
    prompt: defaultScene.defaultPrompt,
    imageDataUrl: '',
    imageFileName: 'Couple_embracing_in_alpine_meadow_2K_20261005090231.jpg',
    model: 'veo-3.1-lite-generate-preview',
    aspectRatio: '16:9',
    resolution: '720p',
    durationSeconds: 5,
    cameraMotion: 'gentle_breeze',
    motionIntensity: 3,
    colorGrade: 'golden_alpine',
    ambience: 'alpine_meadow',
    particlesEnabled: true,
    sunFlareEnabled: true,
    filmGrainEnabled: true,
  });

  const [activeClip, setActiveClip] = useState<GeneratedClip | null>(null);
  const [clips, setClips] = useState<GeneratedClip[]>([]);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isVeoModalOpen, setIsVeoModalOpen] = useState<boolean>(false);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  // Initialize preloaded Alpine Meadow artwork on mount
  useEffect(() => {
    const initialImg = generateAlpineMeadowImage();
    setProject((prev) => ({
      ...prev,
      imageDataUrl: initialImg,
    }));

    // Check API connection
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(data.hasApiKey);
      })
      .catch((err) => {
        console.warn('API status check error:', err);
      });
  }, []);

  // Update project state
  const handleProjectChange = (updated: Partial<VideoProject>) => {
    setProject((prev) => ({ ...prev, ...updated }));
    // If user changes prompt or style, switch back to live interactive player
    if (activeClip) {
      setActiveClip(null);
    }
  };

  // Image change handler
  const handleSelectImage = (dataUrl: string, fileName?: string) => {
    setProject((prev) => ({
      ...prev,
      imageDataUrl: dataUrl,
      imageFileName: fileName || 'custom_upload.jpg',
    }));
    setActiveClip(null);
  };

  // Preset selector handler
  const handleSelectPreset = (preset: PresetScene) => {
    const imgUrl = preset.generator ? preset.generator() : project.imageDataUrl;
    setProject((prev) => ({
      ...prev,
      title: preset.title,
      prompt: preset.defaultPrompt,
      cameraMotion: preset.cameraMotion,
      colorGrade: preset.colorGrade,
      imageDataUrl: imgUrl || prev.imageDataUrl,
      imageFileName: `${preset.id}.jpg`,
    }));
    setActiveClip(null);
  };

  // Gemini AI Prompt Enhancer
  const handleEnhancePrompt = async () => {
    setIsEnhancingPrompt(true);
    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: project.prompt,
          cameraMotion: project.cameraMotion,
          mood: project.colorGrade,
        }),
      });
      const data = await res.json();
      if (data.enhancedPrompt) {
        setProject((prev) => ({
          ...prev,
          prompt: data.enhancedPrompt,
          enhancedPrompt: data.enhancedPrompt,
        }));
      }
    } catch (err) {
      console.warn('Failed to enhance prompt with Gemini:', err);
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  // When a video is exported or generated with Veo
  const handleClipGenerated = (newClip: GeneratedClip) => {
    setClips((prev) => [newClip, ...prev]);
    setActiveClip(newClip);
  };

  const handleDeleteClip = (id: string) => {
    setClips((prev) => prev.filter((c) => c.id !== id));
    if (activeClip?.id === id) {
      setActiveClip(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0c0e15]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 shadow-lg shadow-amber-500/20">
              <Film className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white">
                  VEO MOTION STUDIO
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-semibold text-amber-400">
                  <Sparkles className="w-2.5 h-2.5 fill-current" />
                  Veo 3.1 & 60fps Synthesizer
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Transform photos into cinematic videos with AI camera motions & golden hour lighting
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all active:scale-95 shadow"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Fast Export</span>
            </button>

            <button
              onClick={() => setIsVeoModalOpen(true)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Make Video</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Player & Reel (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Active clip alert banner if viewing saved video */}
          {activeClip && (
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400" />
                <span>
                  Viewing generated clip: <strong>{activeClip.title}</strong> ({activeClip.sourceType === 'veo' ? 'Veo 3.1 AI' : 'Fast Render'})
                </span>
              </div>
              <button
                onClick={() => setActiveClip(null)}
                className="text-xs font-semibold text-amber-400 hover:text-white underline ml-2"
              >
                Back to Live Director
              </button>
            </div>
          )}

          {/* Master Video Viewport */}
          <VideoPlayer
            project={project}
            activeClip={activeClip}
            onExportClick={() => setIsExportOpen(true)}
            onGenerateVeoClick={() => setIsVeoModalOpen(true)}
          />

          {/* Clip Library & History */}
          <ClipHistory
            clips={clips}
            activeClipId={activeClip?.id}
            onSelectClip={(c) => setActiveClip(c)}
            onDeleteClip={handleDeleteClip}
          />
        </div>

        {/* Right Column: Director Desk & Media Bay (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Media Bay: Image source & presets */}
          <MediaBay
            project={project}
            onSelectImage={handleSelectImage}
            onSelectPreset={handleSelectPreset}
          />

          {/* Director & Prompt Controls */}
          <PromptDirector
            project={project}
            onChange={handleProjectChange}
            onEnhancePrompt={handleEnhancePrompt}
            isEnhancing={isEnhancingPrompt}
          />
        </div>
      </main>

      {/* Modals */}
      <ExportModal
        project={project}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExportSuccess={handleClipGenerated}
      />

      <VeoGenerationModal
        project={project}
        isOpen={isVeoModalOpen}
        onClose={() => setIsVeoModalOpen(false)}
        onSuccess={handleClipGenerated}
        onFallbackToFastRender={() => setIsExportOpen(true)}
      />
    </div>
  );
}
