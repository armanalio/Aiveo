import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Compass,
  Sparkles,
  Download,
  Film,
  Layers,
} from 'lucide-react';
import { VideoProject, GeneratedClip } from '../types';
import { VideoRendererEngine } from '../utils/videoSynthesizer';
import { audioEngine } from '../utils/audioEngine';
import { CAMERA_MOTIONS, COLOR_GRADES } from '../utils/presets';

interface VideoPlayerProps {
  project: VideoProject;
  activeClip?: GeneratedClip | null;
  onExportClick: () => void;
  onGenerateVeoClick: () => void;
  isGeneratingVeo?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  project,
  activeClip,
  onExportClick,
  onGenerateVeoClick,
  isGeneratingVeo = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoElemRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<VideoRendererEngine | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showHud, setShowHud] = useState<boolean>(true);

  const duration = project.durationSeconds || 5;

  // Initialize Canvas Engine
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    // Set internal resolution based on project resolution
    const isPortrait = project.aspectRatio === '9:16';
    if (project.resolution === '1080p') {
      canvas.width = isPortrait ? 1080 : 1920;
      canvas.height = isPortrait ? 1920 : 1080;
    } else {
      canvas.width = isPortrait ? 720 : 1280;
      canvas.height = isPortrait ? 1280 : 720;
    }

    const engine = new VideoRendererEngine(canvas);
    engineRef.current = engine;

    if (project.imageDataUrl) {
      engine.loadImage(project.imageDataUrl).then(() => {
        engine.renderFrame(project, progress);
      }).catch(err => console.error('Failed to load image into canvas engine:', err));
    }
  }, [project.imageDataUrl, project.aspectRatio, project.resolution]);

  // Re-render when visual attributes change
  useEffect(() => {
    if (engineRef.current && !activeClip) {
      engineRef.current.renderFrame(project, progress);
    }
  }, [
    project.cameraMotion,
    project.colorGrade,
    project.motionIntensity,
    project.sunFlareEnabled,
    project.particlesEnabled,
    project.filmGrainEnabled,
  ]);

  // Handle Ambience Audio playback
  useEffect(() => {
    if (isPlaying && !isMuted && !activeClip) {
      audioEngine.play(project.ambience, 0.4);
    } else {
      audioEngine.stop();
    }
    return () => {
      audioEngine.stop();
    };
  }, [isPlaying, isMuted, project.ambience, activeClip]);

  // Animation Loop for Canvas Rendering
  useEffect(() => {
    if (activeClip) return; // If an exported/generated MP4 is playing, video element handles it
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isPlaying) {
        setProgress((prev) => {
          const step = (delta * playbackRate) / duration;
          const next = prev + step;
          if (next >= 1) {
            // Loop playback smoothly
            if (engineRef.current) engineRef.current.renderFrame(project, 0);
            return 0;
          }
          if (engineRef.current) {
            engineRef.current.renderFrame(project, next);
          }
          return next;
        });
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, playbackRate, duration, project, activeClip]);

  // Time formatting
  const currentTimeSec = (progress * duration).toFixed(1);
  const totalTimeSec = duration.toFixed(1);

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setProgress(val);
    if (engineRef.current && !activeClip) {
      engineRef.current.renderFrame(project, val);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.warn(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.warn(err));
      setIsFullscreen(false);
    }
  };

  const currentMotion = CAMERA_MOTIONS.find((m) => m.id === project.cameraMotion) || CAMERA_MOTIONS[0];
  const currentColor = COLOR_GRADES.find((c) => c.id === project.colorGrade) || COLOR_GRADES[0];

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col bg-[#0b0d13] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group select-none"
    >
      {/* Top Header Bar inside Video Container */}
      <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            {activeClip ? (activeClip.sourceType === 'veo' ? 'Veo 3.1 AI Video' : 'Rendered Clip') : 'Real-time Preview'}
          </div>
          <span className="text-xs text-slate-300 font-mono hidden sm:inline-block">
            {project.aspectRatio} • {project.resolution} • 30fps
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHud(!showHud)}
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              showHud
                ? 'bg-slate-700/60 text-slate-100'
                : 'bg-black/40 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Director HUD"
          >
            <Compass className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-black/40 text-slate-300 hover:text-white transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="relative w-full aspect-video flex items-center justify-center bg-black overflow-hidden">
        {activeClip ? (
          <video
            ref={videoElemRef}
            src={activeClip.videoUrl}
            className="w-full h-full object-contain"
            autoPlay
            loop
            playsInline
            muted={isMuted}
          />
        ) : (
          <canvas
            ref={canvasRef}
            className={`w-full h-full object-contain transition-all duration-300 ${
              project.aspectRatio === '9:16' ? 'max-w-[56.25vh]' : 'w-full'
            }`}
          />
        )}

        {/* Cinematic Director HUD Overlay */}
        {showHud && (
          <div className="absolute top-14 left-4 z-20 pointer-events-none flex flex-col gap-1.5 text-[11px] font-mono text-amber-200/90 drop-shadow-md">
            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded border border-amber-500/20">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Camera: {currentMotion.name}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded border border-amber-500/20">
              <Film className="w-3.5 h-3.5 text-amber-400" />
              <span>Grade: {currentColor.name}</span>
            </div>
            {project.particlesEnabled && (
              <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded border border-amber-500/20 text-emerald-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Atmospheric Pollen & Petals: ON</span>
              </div>
            )}
          </div>
        )}

        {/* Center Play/Pause button trigger overlay */}
        <div
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer bg-black/0 hover:bg-black/10 transition-colors"
        >
          {!isPlaying && (
            <div className="p-4 rounded-full bg-amber-500/90 text-slate-950 shadow-2xl backdrop-blur-md hover:scale-110 transition-transform">
              <Play className="w-8 h-8 fill-current ml-1" />
            </div>
          )}
        </div>
      </div>

      {/* Scrubber & Timeline Progress Bar */}
      <div className="relative px-4 pt-3 pb-1 bg-[#12151f]">
        <input
          type="range"
          min="0"
          max="1"
          step="0.005"
          value={progress}
          onChange={handleScrub}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:h-2 transition-all"
        />
        {/* Progress track highlight */}
        <div
          className="absolute left-4 top-3 h-1.5 bg-gradient-to-r from-amber-500 to-amber-300 rounded-lg pointer-events-none"
          style={{ width: `calc((100% - 2rem) * ${progress})` }}
        />
      </div>

      {/* Bottom Control Dock */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#12151f] border-t border-slate-800/80">
        {/* Playback & Time Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-transform active:scale-95 shadow-md shadow-amber-500/20"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <button
            onClick={() => {
              setProgress(0);
              if (engineRef.current && !activeClip) engineRef.current.renderFrame(project, 0);
            }}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Replay from start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Timecode display */}
          <div className="px-3 py-1 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
            <span className="text-amber-400 font-medium">00:0{currentTimeSec}</span>
            <span className="text-slate-600 mx-1">/</span>
            <span>00:0{totalTimeSec}</span>
          </div>

          {/* Speed Selector */}
          <button
            onClick={() => {
              const rates = [0.5, 1, 1.5, 2];
              const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
              setPlaybackRate(rates[nextIdx]);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors"
            title="Playback Speed"
          >
            {playbackRate}x
          </button>

          {/* Audio Ambience Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-lg transition-colors ${
              isMuted
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
            }`}
            title={isMuted ? 'Unmute Ambience' : 'Mute Ambience'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Action Buttons: Export & Veo AI */}
        <div className="flex items-center gap-2">
          {/* Quick Render / Export Button */}
          <button
            onClick={onExportClick}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all active:scale-95 shadow"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Clip</span>
          </button>

          {/* Generate with Google Veo 3.1 AI Button */}
          <button
            onClick={onGenerateVeoClick}
            disabled={isGeneratingVeo}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/25 active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 fill-current animate-pulse" />
            <span>{isGeneratingVeo ? 'Generating Veo 3.1...' : 'Generate with Veo 3.1'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
