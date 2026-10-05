import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, AlertCircle, Loader2, CheckCircle2, Download, Film, Key } from 'lucide-react';
import { VideoProject, GeneratedClip } from '../types';

interface VeoGenerationModalProps {
  project: VideoProject;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (clip: GeneratedClip) => void;
  onFallbackToFastRender: () => void;
}

export const VeoGenerationModal: React.FC<VeoGenerationModalProps> = ({
  project,
  isOpen,
  onClose,
  onSuccess,
  onFallbackToFastRender,
}) => {
  const [step, setStep] = useState<'initiating' | 'polling' | 'downloading' | 'completed' | 'error'>('initiating');
  const [statusMessage, setStatusMessage] = useState<string>('Submitting scene to Google Veo 3.1...');
  const [operationName, setOperationName] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState<number>(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const pollTimerRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      setStep('initiating');
      setErrorDetails(null);
      setGeneratedVideoUrl(null);
      return;
    }

    startVeoGeneration();

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isOpen]);

  const startVeoGeneration = async () => {
    try {
      setStep('initiating');
      setStatusMessage('Submitting scene and camera prompts to Google Veo 3.1...');
      setErrorDetails(null);

      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: project.prompt,
          imageBase64: project.imageDataUrl,
          mimeType: 'image/jpeg',
          model: project.model,
          resolution: project.resolution,
          aspectRatio: project.aspectRatio,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to start Veo video generation');
      }

      setOperationName(data.operationName);
      setStep('polling');
      setStatusMessage('Google Veo neural diffusion model synthesizing video frames...');
      beginPolling(data.operationName);
    } catch (err: any) {
      console.error('Veo generation error:', err);
      setStep('error');
      setErrorDetails(err.message || 'Error occurred while contacting Google Veo 3.1.');
    }
  };

  const beginPolling = (opName: string) => {
    let count = 0;
    pollTimerRef.current = setInterval(async () => {
      count++;
      setPollCount(count);

      try {
        const res = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: opName }),
        });

        const status = await res.json();

        if (status.done) {
          clearInterval(pollTimerRef.current);
          if (status.error) {
            setStep('error');
            setErrorDetails(status.error.message || 'Generation error reported by Veo.');
            return;
          }

          // Video is ready, download MP4
          downloadVideo(opName);
        } else {
          // Dynamic status updates based on elapsed seconds
          const elapsedSec = count * 4;
          if (elapsedSec < 20) {
            setStatusMessage(`Synthesizing motion dynamics & golden hour lighting (${elapsedSec}s elapsed)...`);
          } else if (elapsedSec < 45) {
            setStatusMessage(`Rendering 35mm camera trajectory & meadow breeze (${elapsedSec}s elapsed)...`);
          } else {
            setStatusMessage(`Finalizing high-definition video encoding (${elapsedSec}s elapsed)...`);
          }
        }
      } catch (err: any) {
        console.warn('Status poll warning:', err);
      }
    }, 4000);
  };

  const downloadVideo = async (opName: string) => {
    try {
      setStep('downloading');
      setStatusMessage('Streaming completed MP4 video directly from Google servers...');

      const res = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName: opName }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to stream video file.');
      }

      const blob = await res.blob();
      const videoUrl = URL.createObjectURL(blob);
      setGeneratedVideoUrl(videoUrl);
      setStep('completed');
      setStatusMessage('Google Veo 3.1 video generation complete!');

      const clip: GeneratedClip = {
        id: `veo_${Date.now()}`,
        title: project.title,
        timestamp: Date.now(),
        duration: project.durationSeconds,
        sourceType: 'veo',
        videoUrl: videoUrl,
        thumbnailUrl: project.imageDataUrl,
        prompt: project.prompt,
        model: project.model,
        aspectRatio: project.aspectRatio,
        resolution: project.resolution,
      };

      onSuccess(clip);
    } catch (err: any) {
      console.error('Download error:', err);
      setStep('error');
      setErrorDetails(err.message || 'Failed to stream video.');
    }
  };

  const downloadLocalFile = () => {
    if (!generatedVideoUrl) return;
    const a = document.createElement('a');
    a.href = generatedVideoUrl;
    a.download = `veo_cinematic_${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#12151f] border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <h3 className="text-base font-bold text-white">Google Veo 3.1 Studio</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status display */}
        {step !== 'completed' && step !== 'error' && (
          <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
              <Film className="w-7 h-7 text-amber-400 absolute inset-0 m-auto" />
            </div>
            <div className="flex flex-col gap-1 max-w-xs">
              <span className="text-sm font-semibold text-slate-100">{statusMessage}</span>
              <span className="text-xs text-slate-400 font-mono">
                Model: {project.model === 'veo-3.1-generate-preview' ? 'Veo 3.1 Studio' : 'Veo 3.1 Lite'}
              </span>
            </div>
          </div>
        )}

        {step === 'completed' && generatedVideoUrl && (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5" />
              <span>Veo 3.1 Video Successfully Created!</span>
            </div>
            <video
              src={generatedVideoUrl}
              controls
              autoPlay
              loop
              className="w-full rounded-xl border border-slate-800 max-h-60 bg-black object-contain"
            />
          </div>
        )}

        {step === 'error' && (
          <div className="flex flex-col gap-3 py-2">
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed">
              <Key className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <strong className="font-semibold block text-amber-200 mb-1">
                  API Key or Quota Notice
                </strong>
                <p className="text-slate-300">{errorDetails}</p>
                <p className="mt-2 text-slate-400">
                  Google Veo models require a Gemini API Key. You can use our built-in 60fps
                  Cinematic Synthesizer right now to render and export high-definition video instantly!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer buttons */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            {step === 'completed' ? 'Close' : 'Cancel'}
          </button>

          {step === 'completed' ? (
            <button
              onClick={downloadLocalFile}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download Veo MP4</span>
            </button>
          ) : step === 'error' ? (
            <button
              onClick={() => {
                onClose();
                onFallbackToFastRender();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <Film className="w-4 h-4" />
              <span>Render with Realtime Engine</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
