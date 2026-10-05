import { CameraMotionConfig, ColorGradeConfig, CameraMotion, ColorGradePreset } from '../types';

export const CAMERA_MOTIONS: CameraMotionConfig[] = [
  {
    id: 'gentle_breeze',
    name: 'Alpine Breeze & Sway',
    description: 'Gentle organic breathing motion, hair swaying, wildflowers rustling in wind',
    icon: 'Wind',
    panX: 0.02,
    panY: 0.015,
    zoomStart: 1.0,
    zoomEnd: 1.08,
    rotationMax: 0.4,
  },
  {
    id: 'slow_zoom',
    name: 'Intimate Cinematic Zoom',
    description: 'Slow, emotional push-in focusing on the couple and golden rim light',
    icon: 'ZoomIn',
    panX: 0.0,
    panY: -0.02,
    zoomStart: 1.0,
    zoomEnd: 1.18,
    rotationMax: 0.0,
  },
  {
    id: 'cinematic_orbit',
    name: 'Arc Orbit & Mountains',
    description: 'Smooth arc camera motion pivoting from wildflowers to snow-capped peaks',
    icon: 'RotateCw',
    panX: 0.06,
    panY: -0.01,
    zoomStart: 1.02,
    zoomEnd: 1.12,
    rotationMax: 1.2,
  },
  {
    id: 'drone_aerial',
    name: 'Drone Pullback Reveal',
    description: 'Elevates and drifts back to reveal the vast alpine mountain range',
    icon: 'Compass',
    panX: 0.0,
    panY: 0.05,
    zoomStart: 1.15,
    zoomEnd: 0.98,
    rotationMax: 0.3,
  },
  {
    id: 'dolly_forward',
    name: 'Gliding Meadow Dolly',
    description: 'Forward tracking through wildflowers toward the embracing couple',
    icon: 'MoveRight',
    panX: -0.03,
    panY: -0.03,
    zoomStart: 0.98,
    zoomEnd: 1.14,
    rotationMax: 0.2,
  },
  {
    id: 'light_flare_breathe',
    name: 'Golden Flare & Drift',
    description: 'Dreamy light flares, sunburst pulses, and gentle camera floating',
    icon: 'Sun',
    panX: 0.03,
    panY: 0.02,
    zoomStart: 1.0,
    zoomEnd: 1.06,
    rotationMax: 0.6,
  },
];

export const COLOR_GRADES: ColorGradeConfig[] = [
  {
    id: 'golden_alpine',
    name: 'Alpine Golden Hour',
    filterCss: 'brightness(1.05) contrast(1.08) saturate(1.18) sepia(0.12)',
    warmth: 0.25,
    contrast: 1.08,
    saturation: 1.2,
    vignette: 0.25,
    flareColor: 'rgba(255, 185, 80, 0.45)',
  },
  {
    id: 'warm_kodak',
    name: 'Kodak Portra 400',
    filterCss: 'brightness(1.02) contrast(1.05) saturate(1.1) sepia(0.18)',
    warmth: 0.3,
    contrast: 1.05,
    saturation: 1.1,
    vignette: 0.35,
    flareColor: 'rgba(255, 160, 60, 0.4)',
  },
  {
    id: 'teal_orange',
    name: 'Cinematic Teal & Gold',
    filterCss: 'contrast(1.15) saturate(1.25) hue-rotate(-5deg)',
    warmth: 0.15,
    contrast: 1.18,
    saturation: 1.25,
    vignette: 0.4,
    flareColor: 'rgba(255, 190, 100, 0.5)',
  },
  {
    id: 'dreamy_pastel',
    name: 'Ethereal Romance',
    filterCss: 'brightness(1.1) contrast(0.95) saturate(1.08)',
    warmth: 0.2,
    contrast: 0.98,
    saturation: 1.1,
    vignette: 0.15,
    flareColor: 'rgba(255, 220, 180, 0.55)',
  },
  {
    id: 'moody_contrast',
    name: 'Dramatic Mountain Dusk',
    filterCss: 'brightness(0.96) contrast(1.22) saturate(1.12)',
    warmth: 0.1,
    contrast: 1.22,
    saturation: 1.15,
    vignette: 0.5,
    flareColor: 'rgba(255, 140, 50, 0.35)',
  },
  {
    id: 'film_grain_vintage',
    name: 'Vintage 35mm Motion',
    filterCss: 'brightness(1.0) contrast(1.12) saturate(1.02) sepia(0.25)',
    warmth: 0.28,
    contrast: 1.12,
    saturation: 1.05,
    vignette: 0.45,
    flareColor: 'rgba(240, 170, 70, 0.38)',
  },
];

/**
 * Procedurally generates an ultra-high resolution (1920x1080) artwork 
 * replicating the exact composition of the uploaded couple kissing in the alpine meadow
 * with golden hour lighting, snow-capped peaks, and wildflowers.
 */
export function generateAlpineMeadowImage(): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const w = canvas.width;
  const h = canvas.height;

  // 1. Sky & Sun Gradient (Golden hour sunset)
  const skyGrad = ctx.createLinearGradient(0, 0, w, h * 0.7);
  skyGrad.addColorStop(0, '#6ba2cc'); // Alpine high sky blue
  skyGrad.addColorStop(0.35, '#a3c7dc'); // Soft blue
  skyGrad.addColorStop(0.65, '#f4d2a3'); // Warm peach haze
  skyGrad.addColorStop(0.85, '#fce4c4'); // Bright sun glow
  skyGrad.addColorStop(1, '#e3b888'); // Golden horizon
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Glowing Golden Sun in upper right
  const sunX = w * 0.92;
  const sunY = h * 0.18;
  const sunGlow = ctx.createRadialGradient(sunX, sunY, 20, sunX, sunY, 800);
  sunGlow.addColorStop(0, 'rgba(255, 255, 245, 0.95)');
  sunGlow.addColorStop(0.15, 'rgba(255, 235, 170, 0.75)');
  sunGlow.addColorStop(0.4, 'rgba(255, 195, 110, 0.35)');
  sunGlow.addColorStop(0.7, 'rgba(255, 160, 70, 0.1)');
  sunGlow.addColorStop(1, 'rgba(255, 140, 50, 0)');
  ctx.fillStyle = sunGlow;
  ctx.fillRect(0, 0, w, h);

  // 3. Majestic Snow-Capped Alpine Mountain Peaks (Background)
  // Far mountain range (purplish misty snow peaks)
  ctx.fillStyle = '#7a7e8e';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.42);
  ctx.lineTo(w * 0.08, h * 0.32);
  ctx.lineTo(w * 0.18, h * 0.24); // Sharp snow peak left
  ctx.lineTo(w * 0.28, h * 0.35);
  ctx.lineTo(w * 0.38, h * 0.28);
  ctx.lineTo(w * 0.48, h * 0.20); // Central jagged peak
  ctx.lineTo(w * 0.58, h * 0.33);
  ctx.lineTo(w * 0.68, h * 0.26);
  ctx.lineTo(w * 0.78, h * 0.38);
  ctx.lineTo(w, h * 0.32);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Snow on mountain peaks (pure alpine snow with golden rim light)
  ctx.fillStyle = '#e8eff7';
  ctx.beginPath();
  ctx.moveTo(w * 0.18, h * 0.24);
  ctx.lineTo(w * 0.14, h * 0.29);
  ctx.lineTo(w * 0.16, h * 0.33);
  ctx.lineTo(w * 0.21, h * 0.31);
  ctx.lineTo(w * 0.23, h * 0.28);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(w * 0.48, h * 0.20);
  ctx.lineTo(w * 0.42, h * 0.28);
  ctx.lineTo(w * 0.45, h * 0.32);
  ctx.lineTo(w * 0.51, h * 0.34);
  ctx.lineTo(w * 0.54, h * 0.26);
  ctx.closePath();
  ctx.fill();

  // Mountain shading & atmospheric mist
  const mistGrad = ctx.createLinearGradient(0, h * 0.2, 0, h * 0.55);
  mistGrad.addColorStop(0, 'rgba(245, 220, 190, 0.1)');
  mistGrad.addColorStop(0.6, 'rgba(230, 200, 170, 0.4)');
  mistGrad.addColorStop(1, 'rgba(180, 195, 175, 0.7)');
  ctx.fillStyle = mistGrad;
  ctx.fillRect(0, h * 0.2, w, h * 0.35);

  // 4. Rolling Green Alpine Hills (Midground)
  // Left rolling ridge with pine tree silhouettes
  ctx.fillStyle = '#4c6340';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.48);
  ctx.bezierCurveTo(w * 0.12, h * 0.46, w * 0.22, h * 0.55, w * 0.35, h * 0.53);
  ctx.bezierCurveTo(w * 0.45, h * 0.52, w * 0.6, h * 0.58, w, h * 0.48);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Pine tree silhouettes along left ridge
  ctx.fillStyle = '#2d4026';
  for (let i = 0; i < 28; i++) {
    const tx = w * (0.02 + i * 0.012);
    const ty = h * (0.47 + Math.sin(i * 0.5) * 0.02);
    const th = 28 + Math.random() * 20;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx - 6, ty + th);
    ctx.lineTo(tx + 6, ty + th);
    ctx.closePath();
    ctx.fill();
  }

  // Right sun-drenched rolling grassy slope
  const rightHillGrad = ctx.createLinearGradient(w * 0.5, h * 0.35, w, h * 0.7);
  rightHillGrad.addColorStop(0, '#9ab54a'); // Sunlit golden green
  rightHillGrad.addColorStop(0.5, '#7b9c3e');
  rightHillGrad.addColorStop(1, '#53752e');
  ctx.fillStyle = rightHillGrad;
  ctx.beginPath();
  ctx.moveTo(w * 0.45, h * 0.52);
  ctx.bezierCurveTo(w * 0.65, h * 0.44, w * 0.85, h * 0.38, w, h * 0.35);
  ctx.lineTo(w, h);
  ctx.lineTo(w * 0.45, h);
  ctx.closePath();
  ctx.fill();

  // 5. Foreground Lush Green Meadow with Golden Hour Glow
  const fgMeadowGrad = ctx.createLinearGradient(0, h * 0.52, 0, h);
  fgMeadowGrad.addColorStop(0, '#678c35');
  fgMeadowGrad.addColorStop(0.35, '#567a29');
  fgMeadowGrad.addColorStop(0.7, '#42621c');
  fgMeadowGrad.addColorStop(1, '#2c4510');
  ctx.fillStyle = fgMeadowGrad;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.58);
  ctx.bezierCurveTo(w * 0.3, h * 0.63, w * 0.7, h * 0.50, w, h * 0.54);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Golden hour rim light wash on meadow slope
  const meadowLight = ctx.createRadialGradient(w * 0.85, h * 0.5, 40, w * 0.85, h * 0.5, 750);
  meadowLight.addColorStop(0, 'rgba(255, 230, 140, 0.45)');
  meadowLight.addColorStop(0.5, 'rgba(240, 195, 90, 0.2)');
  meadowLight.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = meadowLight;
  ctx.fillRect(0, h * 0.4, w, h * 0.6);

  // 6. The Embracing Couple (Sitting in meadow, kissing)
  // Center slightly offset to mid-screen (approx w * 0.5, h * 0.62)
  const cx = w * 0.51;
  const cy = h * 0.55;

  ctx.save();
  // Man's body (Dark charcoal/olive jacket, sitting, leaning slightly left)
  ctx.fillStyle = '#3a3832';
  ctx.beginPath();
  ctx.moveTo(cx + 8, cy - 30); // Shoulder/neck
  ctx.lineTo(cx + 85, cy + 10); // Back/shoulder
  ctx.lineTo(cx + 120, cy + 120); // Arm/back
  ctx.lineTo(cx + 140, cy + 240); // Lower torso
  ctx.lineTo(cx + 30, cy + 300); // Thigh
  ctx.lineTo(cx - 70, cy + 300); // Lap
  ctx.lineTo(cx - 30, cy + 140); // Front chest
  ctx.closePath();
  ctx.fill();

  // Man's blue denim jeans leg stretched out
  ctx.fillStyle = '#2d3b48';
  ctx.beginPath();
  ctx.moveTo(cx - 40, cy + 280);
  ctx.lineTo(cx - 180, cy + 320);
  ctx.lineTo(cx - 240, cy + 340);
  ctx.lineTo(cx - 220, cy + 360);
  ctx.lineTo(cx - 130, cy + 355);
  ctx.lineTo(cx + 5, cy + 315);
  ctx.closePath();
  ctx.fill();

  // Man's head and neck (profile facing left)
  ctx.fillStyle = '#b8896c'; // Skin tone
  ctx.beginPath();
  ctx.arc(cx + 42, cy - 65, 34, 0, Math.PI * 2);
  ctx.fill();

  // Man's jawline & beard (bearded jaw in profile kissing)
  ctx.fillStyle = '#2c221e';
  ctx.beginPath();
  ctx.moveTo(cx + 25, cy - 50);
  ctx.lineTo(cx - 2, cy - 48); // Lips meeting
  ctx.lineTo(cx + 5, cy - 36); // Chin
  ctx.lineTo(cx + 38, cy - 32); // Beard line
  ctx.lineTo(cx + 52, cy - 55);
  ctx.closePath();
  ctx.fill();

  // Man's dark hair
  ctx.beginPath();
  ctx.arc(cx + 48, cy - 78, 32, Math.PI * 0.8, Math.PI * 2.1);
  ctx.fill();

  // Woman's body (Cream/white sweater with warm camel stripes, light blue denim jeans)
  // Woman sitting in his lap/arms facing right
  ctx.fillStyle = '#f5efe4'; // Cream wool sweater
  ctx.beginPath();
  ctx.moveTo(cx - 4, cy - 25); // Neckline
  ctx.lineTo(cx - 85, cy + 20); // Shoulder
  ctx.lineTo(cx - 120, cy + 130); // Back
  ctx.lineTo(cx - 70, cy + 240); // Waist/hip
  ctx.lineTo(cx + 10, cy + 250);
  ctx.lineTo(cx + 25, cy + 120); // Front
  ctx.closePath();
  ctx.fill();

  // Camel horizontal stripes on her sweater
  ctx.strokeStyle = '#c8a379';
  ctx.lineWidth = 9;
  for (let s = 0; s < 6; s++) {
    const sy = cy + 45 + s * 24;
    ctx.beginPath();
    ctx.moveTo(cx - 105 + s * 4, sy);
    ctx.lineTo(cx + 18, sy + 6);
    ctx.stroke();
  }

  // Woman's blue jeans
  ctx.fillStyle = '#517498'; // Classic mid-wash denim
  ctx.beginPath();
  ctx.moveTo(cx - 65, cy + 240);
  ctx.lineTo(cx - 30, cy + 320);
  ctx.bezierCurveTo(cx + 40, cy + 300, cx + 130, cy + 250, cx + 180, cy + 265);
  ctx.lineTo(cx + 230, cy + 340);
  ctx.lineTo(cx + 170, cy + 355);
  ctx.lineTo(cx + 10, cy + 325);
  ctx.lineTo(cx - 60, cy + 310);
  ctx.closePath();
  ctx.fill();

  // Woman's head, face & hair (profile facing right, lips meeting his)
  ctx.fillStyle = '#dca787'; // Warm feminine skin tone
  ctx.beginPath();
  ctx.arc(cx - 28, cy - 64, 30, 0, Math.PI * 2);
  ctx.fill();

  // Delicate nose & lips touching man's lips
  ctx.fillStyle = '#d29675';
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy - 70); // Nose bridge
  ctx.lineTo(cx + 2, cy - 58); // Nose tip
  ctx.lineTo(cx - 6, cy - 54);
  ctx.lineTo(cx + 4, cy - 47); // Upper lip kiss contact
  ctx.lineTo(cx + 2, cy - 42); // Lower lip
  ctx.lineTo(cx - 10, cy - 38); // Chin
  ctx.lineTo(cx - 22, cy - 55);
  ctx.closePath();
  ctx.fill();

  // Woman's dark hair in a messy romantic bun with soft wind wisps
  ctx.fillStyle = '#221915';
  ctx.beginPath();
  ctx.arc(cx - 44, cy - 72, 33, 0, Math.PI * 2);
  ctx.fill();
  // Bun on top/back
  ctx.beginPath();
  ctx.arc(cx - 72, cy - 84, 18, 0, Math.PI * 2);
  ctx.fill();

  // Woman's arm reaching gently around man's neck/collar
  ctx.fillStyle = '#f5efe4';
  ctx.beginPath();
  ctx.moveTo(cx - 65, cy + 18);
  ctx.lineTo(cx - 10, cy - 10);
  ctx.lineTo(cx + 45, cy - 18); // Hand on his jacket shoulder
  ctx.lineTo(cx + 48, cy - 8);
  ctx.lineTo(cx - 5, cy + 6);
  ctx.lineTo(cx - 55, cy + 40);
  ctx.closePath();
  ctx.fill();

  // Delicate hand with fingers on his collar
  ctx.fillStyle = '#dfaf92';
  ctx.beginPath();
  ctx.arc(cx + 44, cy - 14, 10, 0, Math.PI * 2);
  ctx.fill();

  // Man's arm tenderly wrapped around her waist
  ctx.fillStyle = '#3a3832';
  ctx.beginPath();
  ctx.moveTo(cx + 70, cy + 110);
  ctx.lineTo(cx - 20, cy + 160);
  ctx.lineTo(cx - 60, cy + 175); // Hand on her rib/back
  ctx.lineTo(cx - 60, cy + 195);
  ctx.lineTo(cx - 15, cy + 185);
  ctx.lineTo(cx + 75, cy + 145);
  ctx.closePath();
  ctx.fill();
  // Man's hand
  ctx.fillStyle = '#b8896c';
  ctx.beginPath();
  ctx.arc(cx - 60, cy + 184, 12, 0, Math.PI * 2);
  ctx.fill();

  // Golden Hour Rim Light on hair and shoulders (sun backlighting!)
  ctx.strokeStyle = 'rgba(255, 235, 170, 0.85)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  // Hair rim glow
  ctx.arc(cx - 44, cy - 72, 35, Math.PI * 0.9, Math.PI * 1.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx - 72, cy - 84, 20, Math.PI * 0.8, Math.PI * 2.2);
  ctx.stroke();
  // Man's hair rim
  ctx.beginPath();
  ctx.arc(cx + 48, cy - 78, 34, Math.PI * 1.5, Math.PI * 2.2);
  ctx.stroke();

  // Shoulder rim light
  ctx.beginPath();
  ctx.moveTo(cx - 85, cy + 20);
  ctx.lineTo(cx - 120, cy + 130);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 85, cy + 10);
  ctx.lineTo(cx + 120, cy + 120);
  ctx.stroke();

  ctx.restore();

  // 7. Foreground Grass Blades and Blooming Alpine Wildflowers
  // Clustered around the couple and foreground edge
  const randomSeed = (s: number) => {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };

  // Grass blades in wind
  for (let i = 0; i < 450; i++) {
    const gx = (i / 450) * w + (randomSeed(i * 3) - 0.5) * 40;
    const gy = h * 0.68 + randomSeed(i * 7) * (h * 0.32);
    const bladeH = 40 + randomSeed(i * 11) * 70;
    const lean = 15 + Math.sin(i * 0.2) * 12; // Leaning gently in breeze

    ctx.strokeStyle = i % 2 === 0 ? '#638c2f' : (i % 3 === 0 ? '#86a83e' : '#496b1e');
    ctx.lineWidth = 2.5 + randomSeed(i * 5) * 2;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.quadraticCurveTo(gx + lean * 0.5, gy - bladeH * 0.6, gx + lean, gy - bladeH);
    ctx.stroke();
  }

  // Alpine Wildflowers (white edelweiss, pink clover, yellow buttercups)
  for (let f = 0; f < 85; f++) {
    const fx = randomSeed(f * 13) * w;
    const fy = h * 0.65 + randomSeed(f * 17) * (h * 0.35);
    const flowerType = f % 3;

    if (flowerType === 0) {
      // White alpine blossoms with golden center
      ctx.fillStyle = 'rgba(255, 255, 250, 0.9)';
      for (let p = 0; p < 5; p++) {
        const ang = (p * Math.PI * 2) / 5;
        ctx.beginPath();
        ctx.arc(fx + Math.cos(ang) * 6, fy + Math.sin(ang) * 6, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.arc(fx, fy, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (flowerType === 1) {
      // Pink mountain clover
      ctx.fillStyle = 'rgba(224, 115, 155, 0.85)';
      ctx.beginPath();
      ctx.arc(fx, fy, 6, 0, Math.PI * 2);
      ctx.arc(fx + 3, fy - 3, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Golden mountain buttercup
      ctx.fillStyle = 'rgba(255, 215, 50, 0.9)';
      ctx.beginPath();
      ctx.arc(fx, fy, 5.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 8. Cinematic Anamorphic Lens Flare & Sun Dust Motes
  const flareGrad = ctx.createLinearGradient(sunX, sunY, w * 0.3, h * 0.7);
  flareGrad.addColorStop(0, 'rgba(255, 240, 200, 0.3)');
  flareGrad.addColorStop(0.3, 'rgba(255, 200, 100, 0.15)');
  flareGrad.addColorStop(0.6, 'rgba(255, 160, 60, 0.08)');
  flareGrad.addColorStop(1, 'rgba(255, 120, 40, 0)');
  ctx.fillStyle = flareGrad;
  ctx.fillRect(0, 0, w, h);

  // Hexagonal flare ghost elements along sun optical axis
  const flarePoints = [
    { dist: 0.25, r: 45, color: 'rgba(255, 220, 140, 0.25)' },
    { dist: 0.45, r: 85, color: 'rgba(255, 180, 80, 0.18)' },
    { dist: 0.65, r: 35, color: 'rgba(200, 240, 255, 0.22)' },
    { dist: 0.85, r: 110, color: 'rgba(255, 160, 90, 0.12)' },
  ];
  flarePoints.forEach((fp) => {
    const px = sunX - (sunX - w * 0.2) * fp.dist;
    const py = sunY + (h * 0.8 - sunY) * fp.dist;
    ctx.fillStyle = fp.color;
    ctx.beginPath();
    ctx.arc(px, py, fp.r, 0, Math.PI * 2);
    ctx.fill();
  });

  return canvas.toDataURL('image/jpeg', 0.92);
}

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

export const PRESET_SCENES: PresetScene[] = [
  {
    id: 'alpine_couple_kiss',
    title: 'Alpine Meadow Kiss (Golden Hour)',
    category: 'Romantic & Cinematic',
    tagline: 'Sun-drenched alpine romance with swaying meadow grass and snow mountains',
    defaultPrompt: 'Young couple tenderly embracing and kissing in a sun-drenched alpine meadow at sunset, soft mountain breeze gently rustling hair and wildflowers, golden hour lens flare, snow-capped peaks in soft background, 35mm film grain, photorealistic',
    cameraMotion: 'gentle_breeze',
    colorGrade: 'golden_alpine',
    generator: generateAlpineMeadowImage,
  },
  {
    id: 'mountain_drone_reveal',
    title: 'Majestic Peaks Drone Ascend',
    category: 'Epic Nature',
    tagline: 'Sweeping aerial camera rising above rugged alpine ridge lines',
    defaultPrompt: 'Cinematic drone ascending smoothly over dramatic alpine peaks, golden sunset clouds parting to reveal emerald valleys and glaciated cliffs, 8k resolution, IMAX quality',
    cameraMotion: 'drone_aerial',
    colorGrade: 'teal_orange',
  },
  {
    id: 'lovers_intimate_zoom',
    title: 'Intimate Embrace & Light Flare',
    category: 'Romantic & Cinematic',
    tagline: 'Slow push-in with warm sunlight rays breaking over shoulders',
    defaultPrompt: 'Slow intimate cinematic zoom on couple embracing on mountain hillside, warm sunlight streaming through hair, emotional gentle smile, shallow depth of field, photorealistic',
    cameraMotion: 'slow_zoom',
    colorGrade: 'warm_kodak',
  },
  {
    id: 'wildflower_meadow_arc',
    title: 'Wildflower Field 360 Arc',
    category: 'Atmospheric',
    tagline: 'Low gliding orbit through blooming clover and summer mountain breeze',
    defaultPrompt: 'Smooth low-angle camera orbiting through blooming alpine wildflowers, sunlight flaring through grass blades, cinematic slow-motion 60fps aesthetic',
    cameraMotion: 'cinematic_orbit',
    colorGrade: 'dreamy_pastel',
  },
];
