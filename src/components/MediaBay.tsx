import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles, Check, Mountain, Heart, RefreshCw } from 'lucide-react';
import { PRESET_SCENES, PresetScene } from '../utils/presets';
import { VideoProject } from '../types';

interface MediaBayProps {
  project: VideoProject;
  onSelectImage: (dataUrl: string, fileName?: string) => void;
  onSelectPreset: (preset: PresetScene) => void;
}

export const MediaBay: React.FC<MediaBayProps> = ({
  project,
  onSelectImage,
  onSelectPreset,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onSelectImage(result, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onSelectImage(result, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-[#12151f] rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Source Image & Scene Presets
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          {project.imageFileName || 'Alpine Meadow Kiss 2K'}
        </span>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="relative group border-2 border-dashed border-slate-700/80 hover:border-amber-500/80 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-900/50 hover:bg-slate-900/80 transition-all"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="p-2.5 rounded-full bg-slate-800 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-400 mb-2 transition-colors">
          <Upload className="w-5 h-5" />
        </div>
        <p className="text-xs font-medium text-slate-200">
          Drop your photo here or <span className="text-amber-400 underline">browse</span>
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Supports JPG, PNG, WebP (such as your uploaded Alpine Meadow photo)
        </p>
      </div>

      {/* Preset Scenes Shelf */}
      <div>
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Cinematic Scene Presets
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {PRESET_SCENES.map((preset) => {
            const isCurrent = project.title === preset.title;
            return (
              <div
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                  isCurrent
                    ? 'bg-amber-500/15 border-amber-500 text-white'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="p-2 rounded-lg bg-slate-800 text-amber-400 shrink-0">
                  {preset.id.includes('couple') || preset.id.includes('lovers') ? (
                    <Heart className="w-4 h-4 text-pink-400" />
                  ) : (
                    <Mountain className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold truncate">{preset.title}</h4>
                    {isCurrent && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {preset.tagline}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
