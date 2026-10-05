import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Video,
  Layers,
  Wind,
  ZoomIn,
  RotateCw,
  Compass,
  MoveRight,
  Sun,
  Flame,
  Palette,
  Volume2,
  Sliders,
  Check,
} from 'lucide-react';
import { VideoProject, CameraMotion, ColorGradePreset, AmbienceSound, VeoModel, AspectRatio, Resolution } from '../types';
import { CAMERA_MOTIONS, COLOR_GRADES } from '../utils/presets';

interface PromptDirectorProps {
  project: VideoProject;
  onChange: (updated: Partial<VideoProject>) => void;
  onEnhancePrompt: () => Promise<void>;
  isEnhancing: boolean;
}

const MOTION_ICONS: Record<CameraMotion, React.ElementType> = {
  gentle_breeze: Wind,
  slow_zoom: ZoomIn,
  cinematic_orbit: RotateCw,
  drone_aerial: Compass,
  dolly_forward: MoveRight,
  tilt_up: Compass,
  light_flare_breathe: Sun,
};

const QUICK_TAGS = [
  'Alpine breeze',
  'Golden hour flare',
  'Snowy peaks backdrop',
  '35mm film grain',
  'Shallow depth of field',
  'Intimate gentle smile',
  'Meadow wildflowers rustle',
];

export const PromptDirector: React.FC<PromptDirectorProps> = ({
  project,
  onChange,
  onEnhancePrompt,
  isEnhancing,
}) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'camera' | 'style' | 'audio'>('prompt');

  const addTag = (tag: string) => {
    const current = project.prompt.trim();
    if (current.includes(tag)) return;
    const newPrompt = current ? `${current}, ${tag}` : tag;
    onChange({ prompt: newPrompt });
  };

  return (
    <div className="bg-[#12151f] rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col gap-5">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800/80">
        <button
          onClick={() => setActiveTab('prompt')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'prompt'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Director Prompt</span>
        </button>

        <button
          onClick={() => setActiveTab('camera')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'camera'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Camera Motion</span>
        </button>

        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'style'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Color & FX</span>
        </button>

        <button
          onClick={() => setActiveTab('audio')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'audio'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Ambience</span>
        </button>
      </div>

      {/* Tab Content: Prompt */}
      {activeTab === 'prompt' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <span>Scene Prompt</span>
              <span className="text-[10px] text-amber-400/90 font-mono">(Directs Veo 3.1 & Motion)</span>
            </label>

            {/* Direct with Gemini AI */}
            <button
              onClick={onEnhancePrompt}
              disabled={isEnhancing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
              title="Transform into an award-winning cinematic prompt using Gemini"
            >
              <Wand2 className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
              <span>{isEnhancing ? 'Directing...' : 'Direct with Gemini'}</span>
            </button>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={project.prompt}
              onChange={(e) => onChange({ prompt: e.target.value })}
              placeholder="Describe your scene, camera movements, lighting, and mood..."
              className="w-full px-3.5 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 resize-none transition-all"
            />
          </div>

          {/* Quick cinematic modifier pills */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[11px] text-slate-400 self-center mr-1">Quick Add:</span>
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => addTag(tag)}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 hover:text-white transition-colors"
              >
                + {tag}
              </button>
            ))}
          </div>

          {/* Veo Model Selector & Output Format */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">AI Video Model</label>
              <select
                value={project.model}
                onChange={(e) => onChange({ model: e.target.value as VeoModel })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="veo-3.1-lite-generate-preview">Veo 3.1 Lite (Fast & Fluid)</option>
                <option value="veo-3.1-generate-preview">Veo 3.1 Studio (Ultra Cinema)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">Aspect Ratio</label>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onChange({ aspectRatio: '16:9' })}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    project.aspectRatio === '16:9'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  16:9 Cinema
                </button>
                <button
                  onClick={() => onChange({ aspectRatio: '9:16' })}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    project.aspectRatio === '9:16'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  9:16 Reel
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">Resolution</label>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onChange({ resolution: '720p' })}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    project.resolution === '720p'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  720p HD
                </button>
                <button
                  onClick={() => onChange({ resolution: '1080p' })}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    project.resolution === '1080p'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  1080p FHD
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Camera Motion */}
      {activeTab === 'camera' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Select Camera Movement
            </span>
            <span className="text-xs text-amber-400 font-mono">
              Intensity: {project.motionIntensity}/5
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {CAMERA_MOTIONS.map((motion) => {
              const isSelected = project.cameraMotion === motion.id;
              const Icon = MOTION_ICONS[motion.id] || Wind;
              return (
                <div
                  key={motion.id}
                  onClick={() => onChange({ cameraMotion: motion.id })}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-amber-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold">{motion.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 ml-auto" />}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {motion.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Intensity Slider */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-slate-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Motion Velocity / Dynamics</span>
              </label>
              <span className="text-xs font-mono text-slate-300">
                {project.motionIntensity === 1 ? 'Subtle Breathing' : project.motionIntensity === 5 ? 'Dramatic Cinematic' : 'Natural Flow'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={project.motionIntensity}
              onChange={(e) => onChange({ motionIntensity: parseInt(e.target.value, 10) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        </div>
      )}

      {/* Tab Content: Color & Visual FX */}
      {activeTab === 'style' && (
        <div className="flex flex-col gap-4">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Color Grading LUTs
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {COLOR_GRADES.map((grade) => {
              const isSelected = project.colorGrade === grade.id;
              return (
                <div
                  key={grade.id}
                  onClick={() => onChange({ colorGrade: grade.id })}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{grade.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <div
                    className="h-2 rounded-full w-full"
                    style={{
                      background:
                        grade.id === 'golden_alpine'
                          ? 'linear-gradient(90deg, #d97706, #fbbf24, #10b981)'
                          : grade.id === 'teal_orange'
                          ? 'linear-gradient(90deg, #0284c7, #f97316)'
                          : grade.id === 'warm_kodak'
                          ? 'linear-gradient(90deg, #b45309, #d97706, #fef3c7)'
                          : 'linear-gradient(90deg, #475569, #94a3b8)',
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Atmosphere & Optical Elements Toggles */}
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2.5">
            <span className="text-xs font-semibold text-slate-400">Atmosphere & Lens Effects</span>

            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-slate-200">Golden Sunset Lens Flare & Anamorphic Sweep</span>
              </div>
              <input
                type="checkbox"
                checked={project.sunFlareEnabled}
                onChange={(e) => onChange({ sunFlareEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 accent-amber-500"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-slate-200">Floating Alpine Pollen & Flower Petals</span>
              </div>
              <input
                type="checkbox"
                checked={project.particlesEnabled}
                onChange={(e) => onChange({ particlesEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 accent-amber-500"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-slate-200">35mm Film Grain Texture</span>
              </div>
              <input
                type="checkbox"
                checked={project.filmGrainEnabled}
                onChange={(e) => onChange({ filmGrainEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 accent-amber-500"
              />
            </label>
          </div>
        </div>
      )}

      {/* Tab Content: Audio Ambience */}
      {activeTab === 'audio' && (
        <div className="flex flex-col gap-4">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Spatial Environmental Soundscapes
          </span>
          <p className="text-xs text-slate-400">
            Procedurally synthesized ambient soundscapes generated in real-time with Web Audio API. Included in video exports.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { id: 'alpine_meadow', name: 'Alpine Breeze & Birds', desc: 'Gentle mountain wind gusts and distant alpine songbirds' },
              { id: 'warm_strings', name: 'Cinematic Romance Strings', desc: 'Warm, emotional orchestral harmonic chords in D Major' },
              { id: 'gentle_wind', name: 'High Altitude Wind', desc: 'Serene mountain summit wind sweeping through peaks' },
              { id: 'golden_hour', name: 'Golden Hour Drone', desc: 'Warm meditative cinematic resonance' },
              { id: 'muted', name: 'Muted (No Audio)', desc: 'Silent video output' },
            ].map((amb) => {
              const isSelected = project.ambience === amb.id;
              return (
                <div
                  key={amb.id}
                  onClick={() => onChange({ ambience: amb.id as AmbienceSound })}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{amb.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400">{amb.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
