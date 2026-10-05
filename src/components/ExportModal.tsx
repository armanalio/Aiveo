import React, { useState } from 'react';
import { X, Download, Film, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { VideoProject, GeneratedClip } from '../types';
import { VideoRendererEngine } from '../utils/videoSynthesizer';

interface ExportModalProps {
  project: VideoProject;
  isOpen: boolean;
  onClose: () => void;
  onExportSuccess: (clip: GeneratedClip) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  project,
  isOpen,
  onClose,
  onExportSuccess,
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [exportedResult, setExportedResult] = useState<{ url: string; blob: Blob } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsExporting(true);
    setProgress(0);
    setError(null);

    try {
      // Create temporary offscreen rendering canvas
      const offscreen = document.createElement('canvas');
      const isPortrait = project.aspectRatio === '9:16';
      if (project.resolution === '1080p') {
        offscreen.width = isPortrait ? 1080 : 1920;
        offscreen.height = isPortrait ? 1920 : 1080;
      } else {
        offscreen.width = isPortrait ? 720 : 1280;
        offscreen.height = isPortrait ? 1280 : 720;
      }

      const engine = new VideoRendererEngine(offscreen);
      await engine.loadImage(project.imageDataUrl);

      const result = await engine.exportVideo(project, (pct) => {
        setProgress(pct);
      });

      setExportedResult(result);

      // Save to session history
      const newClip: GeneratedClip = {
        id: `clip_${Date.now()}`,
        title: project.title,
        timestamp: Date.now(),
        duration: project.durationSeconds,
        sourceType: 'synthesizer',
        videoUrl: result.url,
        thumbnailUrl: project.imageDataUrl,
        prompt: project.prompt,
        aspectRatio: project.aspectRatio,
        resolution: project.resolution,
      };
      onExportSuccess(newClip);
    } catch (err: any) {
      console.error('Export error:', err);
      setError(err.message || 'Failed to export video.');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadFile = () => {
    if (!exportedResult) return;
    const a = document.createElement('a');
    a.href = exportedResult.url;
    a.download = `${project.title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#12151f] border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Export Video Clip</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Summary */}
        <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs flex flex-col gap-2">
          <div className="flex justify-between text-slate-300">
            <span>Duration:</span>
            <span className="font-mono text-amber-400 font-semibold">{project.durationSeconds}s @ 30 FPS</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Aspect & Resolution:</span>
            <span className="font-mono text-slate-100">{project.aspectRatio} ({project.resolution})</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Audio Ambience:</span>
            <span className="text-emerald-400 font-medium capitalize">{project.ambience.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Motion Style:</span>
            <span className="capitalize text-slate-100">{project.cameraMotion.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Progress or Result */}
        {isExporting ? (
          <div className="flex flex-col gap-3 py-4">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                Synthesizing video frames & spatial audio...
              </span>
              <span className="font-mono text-amber-400 font-bold">{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : exportedResult ? (
          <div className="flex flex-col gap-3 py-2">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5" />
              <span>Video rendered successfully!</span>
            </div>
            <video
              src={exportedResult.url}
              controls
              autoPlay
              loop
              className="w-full rounded-xl border border-slate-800 max-h-56 bg-black object-contain"
            />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Cancel
          </button>

          {exportedResult ? (
            <button
              onClick={downloadFile}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Save & Download Video</span>
            </button>
          ) : (
            <button
              onClick={handleStartExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50"
            >
              <Film className="w-4 h-4" />
              <span>Start Fast Render</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
