import { VideoProject, CameraMotionConfig } from '../types';
import { CAMERA_MOTIONS, COLOR_GRADES } from './presets';
import { audioEngine } from './audioEngine';

export interface RenderState {
  progress: number; // 0 to 1
  currentTime: number; // seconds
}

export class VideoRendererEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private sourceImage: HTMLImageElement | null = null;
  private isLoaded = false;
  private animFrameId: number | null = null;
  private particles: Array<{
    x: number;
    y: number;
    size: number;
    vx: number;
    vy: number;
    alpha: number;
    color: string;
    rotation: number;
    vRot: number;
    type: 'pollen' | 'petal' | 'flare';
  }> = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not get 2d context');
    this.ctx = context;
    this.initParticles(80);
  }

  private initParticles(count: number) {
    this.particles = [];
    const colors = [
      'rgba(255, 235, 160, 0.7)', // golden pollen
      'rgba(255, 215, 120, 0.6)',
      'rgba(255, 255, 240, 0.8)',
      'rgba(240, 160, 180, 0.65)', // pink petal
    ];

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random(),
        y: Math.random(),
        size: 1.5 + Math.random() * 4.5,
        vx: 0.0004 + Math.random() * 0.0012, // drifting right with wind
        vy: -0.0003 + (Math.random() - 0.5) * 0.0006, // subtle vertical float
        alpha: 0.2 + Math.random() * 0.7,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.04,
        type: i % 5 === 0 ? 'petal' : 'pollen',
      });
    }
  }

  public async loadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.referrerPolicy = 'no-referrer';
      img.onload = () => {
        this.sourceImage = img;
        this.isLoaded = true;
        resolve();
      };
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  }

  public renderFrame(project: VideoProject, progress: number) {
    if (!this.isLoaded || !this.sourceImage) {
      // Draw placeholder background
      this.ctx.fillStyle = '#0f1117';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      return;
    }

    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const img = this.sourceImage;

    // Find camera motion config
    const motionConfig = CAMERA_MOTIONS.find((m) => m.id === project.cameraMotion) || CAMERA_MOTIONS[0];
    const colorConfig = COLOR_GRADES.find((c) => c.id === project.colorGrade) || COLOR_GRADES[0];

    // Calculate smooth Ken Burns interpolation
    // Easing: smooth sine curve for natural film motion
    const easeProgress = Math.sin(progress * Math.PI * 0.5);
    const intensity = project.motionIntensity || 3;
    const intensityFactor = intensity / 3;

    const zoom = motionConfig.zoomStart + (motionConfig.zoomEnd - motionConfig.zoomStart) * easeProgress * intensityFactor;
    const panX = motionConfig.panX * easeProgress * intensityFactor * cw;
    const panY = motionConfig.panY * easeProgress * intensityFactor * ch;
    const rot = (motionConfig.rotationMax * easeProgress * intensityFactor * Math.PI) / 180;

    // Clear canvas
    this.ctx.save();
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, cw, ch);

    // Apply Camera Transform
    this.ctx.translate(cw * 0.5 + panX, ch * 0.5 + panY);
    this.ctx.rotate(rot);
    this.ctx.scale(zoom, zoom);

    // Maintain aspect ratio cover
    const imgAspect = img.width / img.height;
    const canvasAspect = cw / ch;
    let drawW = cw;
    let drawH = ch;

    if (imgAspect > canvasAspect) {
      drawH = ch;
      drawW = ch * imgAspect;
    } else {
      drawW = cw;
      drawH = cw / imgAspect;
    }

    // Apply color grade filter via canvas context
    this.ctx.filter = colorConfig.filterCss;
    this.ctx.drawImage(img, -drawW * 0.5, -drawH * 0.5, drawW, drawH);
    this.ctx.filter = 'none';

    this.ctx.restore();

    // 2. Cinematic Golden Sun Flare & Light Sweep
    if (project.sunFlareEnabled) {
      this.renderSunFlare(cw, ch, progress, colorConfig.flareColor);
    }

    // 3. Floating Atmospheric Meadow Particles
    if (project.particlesEnabled) {
      this.renderParticles(cw, ch, progress);
    }

    // 4. Subtle Vignette
    if (colorConfig.vignette > 0) {
      this.renderVignette(cw, ch, colorConfig.vignette);
    }

    // 5. Film Grain Texture
    if (project.filmGrainEnabled) {
      this.renderFilmGrain(cw, ch);
    }
  }

  private renderSunFlare(cw: number, ch: number, progress: number, flareColor: string) {
    const pulse = 1 + Math.sin(progress * Math.PI * 4) * 0.15;
    const sunX = cw * (0.88 - progress * 0.05);
    const sunY = ch * (0.16 + progress * 0.03);

    const grad = this.ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, cw * 0.65 * pulse);
    grad.addColorStop(0, 'rgba(255, 250, 220, 0.45)');
    grad.addColorStop(0.3, flareColor);
    grad.addColorStop(0.7, 'rgba(255, 160, 60, 0.08)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'screen';
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, cw, ch);

    // Warm horizontal anamorphic flare streak
    const streakGrad = this.ctx.createLinearGradient(0, sunY, cw, sunY);
    streakGrad.addColorStop(0, 'rgba(255, 200, 100, 0)');
    streakGrad.addColorStop(0.65, 'rgba(255, 230, 150, 0.28)');
    streakGrad.addColorStop(0.9, 'rgba(255, 180, 80, 0.35)');
    streakGrad.addColorStop(1, 'rgba(255, 150, 50, 0)');

    this.ctx.fillStyle = streakGrad;
    this.ctx.fillRect(0, sunY - 4 * pulse, cw, 8 * pulse);
    this.ctx.restore();
  }

  private renderParticles(cw: number, ch: number, progress: number) {
    this.ctx.save();
    const windSpeed = 1 + progress * 0.3;

    for (const p of this.particles) {
      p.x += p.vx * windSpeed;
      p.y += p.vy + Math.sin(progress * 8 + p.x * 10) * 0.0003;
      p.rotation += p.vRot;

      if (p.x > 1.05) p.x = -0.05;
      if (p.y < -0.05) p.y = 1.05;
      if (p.y > 1.05) p.y = -0.05;

      const px = p.x * cw;
      const py = p.y * ch;

      this.ctx.save();
      this.ctx.translate(px, py);
      this.ctx.rotate(p.rotation);

      if (p.type === 'petal') {
        // Little soft oval petal
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.alpha;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, p.size * 1.5, p.size * 0.8, 0, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // Glowing round pollen dot
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.alpha;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }
    this.ctx.restore();
  }

  private renderVignette(cw: number, ch: number, intensity: number) {
    const radius = Math.max(cw, ch) * 0.75;
    const grad = this.ctx.createRadialGradient(cw * 0.5, ch * 0.5, radius * 0.4, cw * 0.5, ch * 0.5, radius);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, `rgba(0, 0, 0, ${intensity * 0.85})`);

    this.ctx.save();
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, cw, ch);
    this.ctx.restore();
  }

  private renderFilmGrain(cw: number, ch: number) {
    this.ctx.save();
    this.ctx.globalAlpha = 0.04;
    this.ctx.fillStyle = '#ffffff';

    // Fast noise scatter
    const grainStep = 4;
    for (let x = 0; x < cw; x += grainStep * 2) {
      for (let y = 0; y < ch; y += grainStep * 2) {
        if (Math.random() > 0.5) {
          this.ctx.fillRect(x, y, grainStep, grainStep);
        }
      }
    }
    this.ctx.restore();
  }

  /**
   * Records the canvas animation into a high-quality video blob (WebM/MP4)
   * with mixed audio ambience, perfectly exportable and playable on any platform.
   */
  public async exportVideo(
    project: VideoProject,
    onProgress: (pct: number) => void
  ): Promise<{ blob: Blob; url: string }> {
    const durationMs = project.durationSeconds * 1000;
    const fps = 30;
    const totalFrames = Math.floor((project.durationSeconds) * fps);

    // Audio stream mixing
    const audioCtx = audioEngine.getAudioContext();
    const stream = this.canvas.captureStream(fps);

    if (project.ambience !== 'muted' && audioCtx) {
      const dest = audioCtx.createMediaStreamDestination();
      const master = audioEngine.getMasterDestination();
      if (master) {
        master.connect(dest);
        const audioTracks = dest.stream.getAudioTracks();
        if (audioTracks.length > 0) {
          stream.addTrack(audioTracks[0]);
        }
      }
    }

    // Determine mime type
    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/mp4';
      }
    }

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 6000000, // 6 Mbps high quality
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    return new Promise(async (resolve, reject) => {
      recorder.onstop = () => {
        const finalBlob = new Blob(chunks, { type: mimeType.split(';')[0] });
        const videoUrl = URL.createObjectURL(finalBlob);
        resolve({ blob: finalBlob, url: videoUrl });
      };

      recorder.onerror = (e) => reject(e);

      recorder.start();

      const startTime = performance.now();
      let frame = 0;

      const recordStep = () => {
        if (frame >= totalFrames) {
          recorder.stop();
          return;
        }

        const progress = frame / totalFrames;
        this.renderFrame(project, progress);
        onProgress(Math.round(progress * 100));

        frame++;
        setTimeout(recordStep, 1000 / fps);
      };

      recordStep();
    });
  }
}
