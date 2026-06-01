export interface AudioLikeNode {
  stop?: (when?: number) => void;
  disconnect?: () => void;
}

export interface PreviewAudioBundle {
  config?: {
    audio?: {
      notes: boolean;
      metronome: boolean;
      harmony: boolean;
      harmonyTone?: string;
    };
  };
  songInfo?: { duration?: number };
  openMidis?: number[];
  backingEvents?: Array<{ t: number; end: number; midis: number[] }>;
  notes?: Array<{
    t: number;
    s: number;
    f: number;
    sus?: number;
    bn?: number;
    mt?: boolean;
  }>;
  beats?: Array<{ time: number; measure?: number }>;
}

export interface PreviewAudioConfig {
  notes: boolean;
  metronome: boolean;
  harmony: boolean;
  harmonyTone: string;
}

export interface AudioEnvironment {
  AudioContext: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
}

export type AudioContextLike = InstanceType<typeof AudioContext>;

export const AUDIO_LOOKAHEAD_SECONDS = 0.2;

export const audioState = {
  ctx: null as AudioContextLike | null,
  nodes: [] as AudioLikeNode[],
};

export function stopAudio() {
  for (const node of audioState.nodes) {
    try {
      node.stop?.(0);
    } catch (_err) {
      // Ignore already-stopped nodes.
    }
    try {
      node.disconnect?.();
    } catch (_err) {
      // Ignore disconnect errors.
    }
  }
  audioState.nodes = [];
}

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function bendSemitones(bn: number): number {
  const value = Number(bn) || 0;
  if (value === 0.5) return 1;
  if (value === 1) return 2;
  if (value === 1.5) return 3;
  if (value === 2) return 4;
  return value * 2;
}

export function schedulePluckedString(
  ctx: AudioContextLike,
  when: number,
  freq: number,
  dur: number,
  gainScale: number,
  bendSemis: number,
) {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const preGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc1.type = "triangle";
  osc2.type = "sine";
  const f1 = freq;
  const f2 = freq * 2;
  osc1.frequency.setValueAtTime(f1, when);
  osc2.frequency.setValueAtTime(f2, when);
  osc2.detune.setValueAtTime(7, when);

  if (bendSemis > 0) {
    const ratio = Math.pow(2, bendSemis / 12);
    const bendStart = when + 0.045;
    const bendEnd = when + Math.min(0.22, Math.max(0.1, dur * 0.4));
    osc1.frequency.setValueAtTime(f1, bendStart);
    osc1.frequency.exponentialRampToValueAtTime(f1 * ratio, bendEnd);
    osc2.frequency.setValueAtTime(f2, bendStart);
    osc2.frequency.exponentialRampToValueAtTime(f2 * ratio, bendEnd);
  }

  preGain.gain.setValueAtTime(0.6, when);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(2400, when);
  filter.frequency.exponentialRampToValueAtTime(
    800,
    when + Math.max(0.08, dur),
  );
  filter.Q.setValueAtTime(1.4, when);

  const amp = 0.38 * (gainScale || 1);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(amp, when + 0.008);
  gain.gain.exponentialRampToValueAtTime(amp * 0.5, when + 0.07);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(0.12, dur));

  osc1.connect(preGain);
  osc2.connect(preGain);
  preGain.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(when);
  osc2.start(when);
  const stopAt = when + Math.max(0.14, dur) + 0.03;
  osc1.stop(stopAt);
  osc2.stop(stopAt);
  audioState.nodes.push(osc1, osc2, preGain, filter, gain);
}

export function scheduleHarmonyPad(
  ctx: AudioContextLike,
  when: number,
  midis: number[],
  dur: number,
  tone: string,
) {
  if (!midis.length) return;
  const selectedTone = tone || "pad";

  if (selectedTone === "organ") {
    const RATIOS = [1, 2, 3, 4, 5, 6, 8];
    const VOLS = [0.8, 0.5, 0.35, 0.25, 0.18, 0.12, 0.08];
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.13 / Math.max(1, midis.length), when);
    master.connect(ctx.destination);
    audioState.nodes.push(master);
    midis.slice(0, 4).forEach((midi) => {
      RATIOS.forEach((ratio, ratioIndex) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(midiToFreq(midi) * ratio, when);
        gain.gain.setValueAtTime(VOLS[ratioIndex], when);
        osc.connect(gain);
        gain.connect(master);
        osc.start(when);
        osc.stop(when + dur);
        audioState.nodes.push(osc, gain);
      });
    });
    return;
  }

  if (selectedTone === "epiano") {
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, when);
    master.gain.exponentialRampToValueAtTime(0.28, when + 0.003);
    master.gain.exponentialRampToValueAtTime(
      0.09,
      when + Math.min(0.38, dur * 0.35),
    );
    master.gain.linearRampToValueAtTime(
      0.06,
      when + Math.max(0.39, dur - 0.06),
    );
    master.gain.linearRampToValueAtTime(0.0001, when + dur);
    master.connect(ctx.destination);
    audioState.nodes.push(master);
    midis.slice(0, 4).forEach((midi) => {
      const osc = ctx.createOscillator();
      const bell = ctx.createOscillator();
      const gain = ctx.createGain();
      const bellGain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(midiToFreq(midi), when);
      bell.type = "sine";
      bell.frequency.setValueAtTime(midiToFreq(midi) * 2, when);
      gain.gain.setValueAtTime(0.65, when);
      bellGain.gain.setValueAtTime(0.09, when);
      osc.connect(gain);
      gain.connect(master);
      bell.connect(bellGain);
      bellGain.connect(master);
      osc.start(when);
      osc.stop(when + dur + 0.05);
      bell.start(when);
      bell.stop(when + dur + 0.05);
      audioState.nodes.push(osc, bell, gain, bellGain);
    });
    return;
  }

  const master = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1900, when);
  filter.Q.setValueAtTime(0.7, when);
  master.gain.setValueAtTime(0.0001, when);
  master.gain.exponentialRampToValueAtTime(0.24, when + 0.012);
  master.gain.linearRampToValueAtTime(0.18, when + Math.max(0.08, dur - 0.16));
  master.gain.linearRampToValueAtTime(0.0001, when + dur);
  filter.connect(master);
  master.connect(ctx.destination);
  audioState.nodes.push(filter, master);

  midis.slice(0, 5).forEach((midi, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = index === 0 ? "triangle" : "sawtooth";
    osc.frequency.setValueAtTime(midiToFreq(midi), when);
    osc.detune.setValueAtTime((index - 2) * 3, when);
    gain.gain.setValueAtTime(index === 0 ? 0.48 : 0.22, when);
    osc.connect(gain);
    gain.connect(filter);
    osc.start(when);
    osc.stop(when + dur + 0.05);
    audioState.nodes.push(osc, gain);
  });
}

export function scheduleClick(
  ctx: AudioContextLike,
  when: number,
  accent: boolean,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  osc.type = "square";
  osc.frequency.setValueAtTime(accent ? 1760 : 1120, when);
  filter.type = "highpass";
  filter.frequency.setValueAtTime(650, when);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(accent ? 0.14 : 0.09, when + 0.002);
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    when + (accent ? 0.055 : 0.04),
  );
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(when);
  osc.stop(when + 0.07);
  audioState.nodes.push(osc, filter, gain);
}

export function schedulePreviewAudio(
  bundle: PreviewAudioBundle,
  fromTime: number,
  delaySeconds: number,
  readConfigAudio: () => PreviewAudioConfig,
  openAudioContext: () => AudioContextLike,
) {
  const audio = (bundle?.config?.audio ||
    readConfigAudio()) as PreviewAudioConfig;
  if (!audio.notes && !audio.metronome && !audio.harmony) return;
  audioState.ctx = audioState.ctx || openAudioContext();
  if (audioState.ctx.state === "suspended")
    audioState.ctx.resume().catch(() => {});
  const ctx = audioState.ctx;
  const base =
    ctx.currentTime +
    (Number.isFinite(delaySeconds) ? delaySeconds : AUDIO_LOOKAHEAD_SECONDS);
  const startFrom = Math.max(0, Number(fromTime) || 0);
  const duration = bundle?.songInfo?.duration || 0;
  const opens = bundle?.openMidis?.length ? bundle.openMidis : [];

  if (audio.harmony) {
    for (const ev of bundle.backingEvents || []) {
      if (ev.end < startFrom || ev.t > duration + 0.1) continue;
      const start = Math.max(ev.t, startFrom);
      const end = Math.min(ev.end, duration);
      scheduleHarmonyPad(
        ctx,
        base + (start - startFrom),
        ev.midis || [],
        Math.max(0.2, end - start),
        audio.harmonyTone || "pad",
      );
    }
  }

  if (audio.notes) {
    for (const note of bundle.notes || []) {
      if (note.t < startFrom || note.t > duration + 0.1) continue;
      if (note.s < 0 || note.s >= opens.length || note.f < 0) continue;
      schedulePluckedString(
        ctx,
        base + (note.t - startFrom),
        midiToFreq(opens[note.s] + note.f),
        Math.max(0.1, Math.min(0.85, note.sus || 0.24)),
        audio.harmony ? 0.9 : 1.25,
        bendSemitones(note.bn || 0),
      );
    }
  }

  if (audio.metronome) {
    for (const beat of bundle.beats || []) {
      if (beat.time < startFrom || beat.time > duration + 0.1) continue;
      scheduleClick(
        ctx,
        base + (beat.time - startFrom),
        (beat.measure || -1) >= 0,
      );
    }
  }
}
