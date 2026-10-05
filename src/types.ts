export type VeoModel = 'veo-3.1-lite-generate-preview' | 'veo-3.1-generate-preview';

export type AspectRatio = '16:9' | '9:16';
export type Resolution = '720p' | '1080p';

export type CameraMotion = 
  | 'gentle_breeze'
  | 'slow_zoom'
  | 'cinematic_orbit'
  | 'drone_aerial'
  | 'dolly_forward'
  | 'tilt_up'
  | 'light_flare_breathe';

export interface CameraMotionConfig {
  id: CameraMotion;
  name: string;
  description: string;
  icon: string;
  panX: number;
  panY: number;
  zoomStart: number;
  zoomEnd: number;
  rotationMax: number;
}

export type ColorGradePreset = 
  | 'golden_alpine'
  | 'warm_kodak'
  | 'teal_orange'
  | 'dreamy_pastel'
  | 'moody_contrast'
  | 'film_grain_vintage';

export interface ColorGradeConfig {
  id: ColorGradePreset;
  name: string;
  filterCss: string;
  warmth: number; // 0 to 1
  contrast: number; // 0.8 to 1.4
  saturation: number; // 0.8 to 1.5
  vignette: number; // 0 to 0.8
  flareColor: string;
}

export type AmbienceSound = 
  | 'alpine_meadow'
  | 'warm_strings'
  | 'gentle_wind'
  | 'golden_hour'
  | 'muted';

export interface PresetScene {
  id: string;
  title: string;
  category: string;
  tagline: string;
  defaultPrompt: string;
  cameraMotion: CameraMotion;
  colorGrade: ColorGradePreset;
  generator?: () => string;
}

export interface VideoProject {
  id: string;
  title: string;
  prompt: string;
  enhancedPrompt?: string;
  imageDataUrl: string;
  imageFileName?: string;
  model: VeoModel;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  durationSeconds: number;
  cameraMotion: CameraMotion;
  motionIntensity: number; // 1 to 5
  colorGrade: ColorGradePreset;
  ambience: AmbienceSound;
  particlesEnabled: boolean;
  sunFlareEnabled: boolean;
  filmGrainEnabled: boolean;
}

export interface GeneratedClip {
  id: string;
  title: string;
  timestamp: number;
  duration: number;
  sourceType: 'veo' | 'synthesizer';
  videoUrl: string; // blob or server stream
  thumbnailUrl: string;
  prompt: string;
  model?: string;
  aspectRatio: AspectRatio;
  resolution: Resolution;
}
