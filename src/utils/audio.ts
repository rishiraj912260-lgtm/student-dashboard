// Zero-dependency Web Audio API synthesizer for study timer chime & ambient sound
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playTimerCompletionChime(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Harmonic bell tones (fundamental + gentle overtones)
    const frequencies = [528, 792, 1056]; // Solfeggio 528Hz base
    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const amp = 0.15 / (idx + 1);
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + 3.0);
    });
  } catch (err) {
    console.warn('Audio chime could not play:', err);
  }
}

// Ambient noise generator (Rain / Brown noise generator)
let ambientSource: AudioNode | null = null;
let ambientGain: GainNode | null = null;

export function setAmbientSound(type: 'none' | 'rain' | 'whitenoise', volume = 0.05): void {
  try {
    const ctx = getAudioContext();

    // Stop existing
    if (ambientSource) {
      try {
        (ambientSource as AudioBufferSourceNode).stop();
      } catch {
        // ignore
      }
      ambientSource.disconnect();
      ambientSource = null;
    }
    if (ambientGain) {
      ambientGain.disconnect();
      ambientGain = null;
    }

    if (type === 'none') return;

    // Generate 5-second seamless loop buffer
    const bufferSize = ctx.sampleRate * 5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'rain') {
        // Brown noise / pink noise filter for rain texture
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 2.5; // Gain compensation
      } else {
        // Soft white noise
        data[i] = white * 0.4;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);

    // Filter to make sound organic
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(type === 'rain' ? 800 : 3000, ctx.currentTime);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start();
    ambientSource = source;
    ambientGain = gainNode;
  } catch (err) {
    console.warn('Ambient sound setup failed:', err);
  }
}
