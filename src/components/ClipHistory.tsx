import React from 'react';
import { Film, Play, Download, Trash2, Sparkles, Clock } from 'lucide-react';
import { GeneratedClip } from '../types';

interface ClipHistoryProps {
  clips: GeneratedClip[];
  activeClipId?: string | null;
  onSelectClip: (clip: GeneratedClip) => void;
  onDeleteClip: (id: string) => void;
}

export const ClipHistory: React.FC<ClipHistoryProps> = ({
  clips,
  activeClipId,
  onSelectClip,
  onDeleteClip,
}) => {
  if (clips.length === 0) {
    return (
      <div className="bg-[#12151f] rounded-2xl border border-slate-800 p-6 text-center shadow-xl">
        <Film className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <h4 className="text-xs font-semibold text-slate-300">No Generated Clips Yet</h4>
        <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1">
          Click &quot;Export Clip&quot; or &quot;Generate with Veo 3.1&quot; to produce your cinematic video clips.
        </p>
      </div>
    );
  }

  const downloadClip = (clip: GeneratedClip, e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = clip.videoUrl;
    a.download = `${clip.title.toLowerCase().replace(/\s+/g, '_')}_${clip.id}.${clip.sourceType === 'veo' ? 'mp4' : 'webm'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-[#12151f] rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Reel & Production History ({clips.length})
          </h3>
        </div>
        <span className="text-[11px] text-slate-500">Auto-saved to session</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {clips.map((clip) => {
          const isActive = clip.id === activeClipId;
          return (
            <div
              key={clip.id}
              onClick={() => onSelectClip(clip)}
              className={`group relative rounded-xl border overflow-hidden cursor-pointer bg-slate-900 transition-all ${
                isActive
                  ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-lg'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Thumbnail with overlay */}
              <div className="relative aspect-video bg-black overflow-hidden">
                <img
                  src={clip.thumbnailUrl}
                  alt={clip.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Badge: Source Type */}
                <div className="absolute top-2 left-2 z-10">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                      clip.sourceType === 'veo'
                        ? 'bg-amber-500/90 text-slate-950'
                        : 'bg-slate-800/80 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {clip.sourceType === 'veo' ? (
                      <>
                        <Sparkles className="w-2.5 h-2.5 fill-current" />
                        <span>Veo 3.1</span>
                      </>
                    ) : (
                      <span>Fast Render</span>
                    )}
                  </span>
                </div>

                {/* Duration & Resolution */}
                <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 text-[10px] font-mono text-slate-300">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>{clip.duration}s</span>
                  <span>•</span>
                  <span>{clip.resolution}</span>
                </div>

                {/* Play hover icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <div className="p-2.5 rounded-full bg-amber-500 text-slate-950 shadow-lg">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Clip Details */}
              <div className="p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-200 truncate">{clip.title}</h4>
                  <p className="text-[11px] text-slate-400 truncate">{clip.prompt}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => downloadClip(clip, e)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Download Video File"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClip(clip.id);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete Clip"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
