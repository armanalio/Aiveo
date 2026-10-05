import { AmbienceSound } from '../types';

class AudioSynthesizerEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private droneOscillators: OscillatorNode[] = [];
  private birdTimer: any = null;
  private isPlaying = false;
  private currentType: AmbienceSound = 'muted';

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getAudioContext(): AudioContext | null {
    this.initContext();
    return this.ctx;
  }

  public getMasterDestination(): AudioNode | null {
    this.initContext();
    return this.masterGain;
  }

  public play(type: AmbienceSound, volume = 0.4) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (type === 'muted') {
      this.stop();
      return;
    }

    if (this.isPlaying && this.currentType === type) {
      // Just adjust volume smoothly
      this.masterGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.5);
      return;
    }

    this.stop();
    this.currentType = type;
    this.isPlaying = true;

    const now = this.ctx.currentTime;
    this.masterGain.gain.setValueAtTime(0.001, now);
    this.masterGain.gain.linearRampToValueAtTime(volume, now + 1.2);

    if (type === 'alpine_meadow' || type === 'gentle_wind') {
      this.startWind(type === 'alpine_meadow');
    } else if (type === 'warm_strings') {
      this.startStrings();
    } else if (type === 'golden_hour') {
      this.startGoldenDrone();
    }
  }

  private startWind(withBirds = false) {
    if (!this.ctx || !this.masterGain) return;

    // Create pink noise buffer for realistic organic mountain wind
    const bufferSize = this.ctx.sampleRate * 3;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to simulate breeze sweeping through alpine peaks and grass
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    filter.Q.setValueAtTime(2, this.ctx.currentTime);

    // LFO to make wind swell gently
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime); // 5.5 sec wind swells
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(280, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(windGain);
    windGain.connect(this.masterGain);
    whiteNoise.start();

    this.noiseNode = whiteNoise;
    this.filterNode = filter;
    this.droneOscillators.push(lfo);

    if (withBirds) {
      this.scheduleBirdsong();
    }
  }

  private scheduleBirdsong() {
    if (!this.isPlaying) return;
    const delay = 3500 + Math.random() * 5000;
    this.birdTimer = setTimeout(() => {
      this.playBirdChirp();
      this.scheduleBirdsong();
    }, delay);
  }

  private playBirdChirp() {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    const baseFreq = 2200 + Math.random() * 800;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.4, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 0.16);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  private startStrings() {
    if (!this.ctx || !this.masterGain) return;
    // Warm cinematic chord (D Major 9: D3, A3, F#4, C#5)
    const freqs = [146.83, 220.00, 369.99, 554.37];
    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Gentle vibrato detune
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(3.5 + idx * 0.2, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(1.5, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.detune);
      lfo.start();

      gain.gain.setValueAtTime(0.12 / freqs.length, this.ctx.currentTime);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();

      this.droneOscillators.push(osc, lfo);
    });
  }

  private startGoldenDrone() {
    if (!this.ctx || !this.masterGain) return;
    const freqs = [110.0, 164.81, 246.94]; // A2, E3, B3
    freqs.forEach((freq) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      this.droneOscillators.push(osc);
    });
  }

  public stop() {
    if (this.birdTimer) {
      clearTimeout(this.birdTimer);
      this.birdTimer = null;
    }
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    }
    setTimeout(() => {
      this.droneOscillators.forEach((osc) => {
        try { osc.stop(); osc.disconnect(); } catch (_) {}
      });
      this.droneOscillators = [];
      if (this.noiseNode) {
        try { this.noiseNode.stop(); this.noiseNode.disconnect(); } catch (_) {}
        this.noiseNode = null;
      }
      this.isPlaying = false;
      this.currentType = 'muted';
    }, 350);
  }

  public setVolume(vol: number) {
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.1);
    }
  }
}

export const audioEngine = new AudioSynthesizerEngine();
