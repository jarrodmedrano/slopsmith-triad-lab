export type Instrument = "guitar" | "bass";

export interface TuningPreset {
  id: string;
  label: string;
  tuning: number[];
  setup?: string;
}

export interface StringSetup {
  label: string;
  instrument: Instrument;
  stringCount: number;
  openMidis: number[];
  tuning: number[];
  tuningPreset: string;
}

export interface TriadConfig {
  lesson: string;
  instrument: Instrument;
  stringCount: number;
  key: string;
  progression: string;
  stringSet: string;
  tuningPreset: string;
  bpm: number;
  bars: number;
  startFret: number;
  inversionMode: string;
  qualities: string[];
  view: string;
  audio: {
    notes: boolean;
    metronome: boolean;
    harmony: boolean;
    harmonyTone: string;
  };
  tuning: number[];
  openMidis: number[];
}

export interface TriadNote {
  t: number;
  s: number;
  f: number;
  sus: number;
  ho: boolean;
  po: boolean;
  pm: boolean;
  hm: boolean;
  hp: boolean;
  mt: boolean;
  vb: boolean;
  tr: boolean;
  ac: boolean;
  tp: boolean;
  sl: number;
  slu: number;
  bn: number;
}

export interface ChordEntry {
  t: number;
  id: number;
  hd: boolean;
  notes: TriadNote[];
}

export interface ChordTemplate {
  id: number;
  name: string;
  displayName: string;
  frets: number[];
  fingers: number[];
  arp: boolean;
}

export interface Anchor {
  time: number;
  fret: number;
  width: number;
}

export interface Beat {
  time: number;
  measure: number;
}

export interface Section {
  name: string;
  number: number;
  time: number;
}

export interface TriadChart {
  notes: TriadNote[];
  chords: ChordEntry[];
  chordTemplates: ChordTemplate[];
  handShapes: unknown[];
  anchors: Anchor[];
  beats: Beat[];
  sections: Section[];
  duration: number;
}

export interface TriadExercise {
  session: {
    key: string;
    lesson: string;
    instrument: Instrument;
    stringCount: number;
    progression: string;
    bpm: number;
    bars: number;
    startFret: number;
    inversionMode: string;
    stringSet: string;
    tuningPreset: string;
    qualities: string[];
    audio: TriadConfig["audio"];
    tuning: number[];
    openMidis: number[];
  };
  chart: TriadChart;
  summary: string;
}

export interface TriadBundle {
  currentTime: number;
  config: TriadExercise["session"];
  songInfo: {
    title: string;
    artist: string;
    arrangement: string;
    tuning: number[];
    capo: number;
    duration: number;
    format: string;
  };
  isReady: boolean;
  notes: TriadNote[];
  chords: ChordEntry[];
  anchors: Anchor[];
  beats: Beat[];
  sections: Section[];
  backingEvents: Array<{
    t: number;
    end: number;
    name: string;
    midis: number[];
  }>;
  chordTemplates: ChordTemplate[];
  handShapes: unknown[];
  stringCount: number;
  tuning: number[];
  openMidis: number[];
  capo: number;
  lyrics: unknown[];
  toneChanges: unknown[];
  toneBase: string;
  mastery: number;
  hasPhraseData: boolean;
  inverted: boolean;
  lefty: boolean;
  renderScale: number;
  lyricsVisible: boolean;
  project: null;
  fretX: null;
  getNoteState: () => null;
  getNoteStateProvider: () => null;
}

export const KEY_ORDER = [
  "C",
  "C#",
  "D",
  "Eb",
  "E",
  "F",
  "F#",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
] as const;

export const KEY_TO_PC: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

export const QUALITY_INTERVALS: Record<string, number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
};

export const QUALITY_LABEL: Record<string, string> = {
  maj: "Maj",
  min: "Min",
  dim: "Dim",
  aug: "Aug",
};

export const STRING_SETUPS: Record<string, StringSetup> = {
  guitar_6_standard: {
    label: "6-string guitar — standard",
    instrument: "guitar",
    stringCount: 6,
    openMidis: [40, 45, 50, 55, 59, 64],
    tuning: [0, 0, 0, 0, 0, 0],
    tuningPreset: "standard",
  },
  guitar_6_drop_d: {
    label: "6-string guitar — Drop D",
    instrument: "guitar",
    stringCount: 6,
    openMidis: [38, 45, 50, 55, 59, 64],
    tuning: [-2, 0, 0, 0, 0, 0],
    tuningPreset: "drop_d",
  },
  guitar_7_standard: {
    label: "7-string guitar — standard",
    instrument: "guitar",
    stringCount: 7,
    openMidis: [35, 40, 45, 50, 55, 59, 64],
    tuning: [0, 0, 0, 0, 0, 0, 0],
    tuningPreset: "standard",
  },
  guitar_8_standard: {
    label: "8-string guitar — standard",
    instrument: "guitar",
    stringCount: 8,
    openMidis: [30, 35, 40, 45, 50, 55, 59, 64],
    tuning: [2, 0, 0, 0, 0, 0, 0, 0],
    tuningPreset: "standard",
  },
  bass_4_standard: {
    label: "4-string bass — standard",
    instrument: "bass",
    stringCount: 4,
    openMidis: [28, 33, 38, 43],
    tuning: [0, 0, 0, 0],
    tuningPreset: "standard",
  },
  bass_5_standard: {
    label: "5-string bass — standard low B",
    instrument: "bass",
    stringCount: 5,
    openMidis: [23, 28, 33, 38, 43],
    tuning: [0, 0, 0, 0, 0],
    tuningPreset: "standard_low_b",
  },
  bass_6_standard: {
    label: "6-string bass — standard (B-E-A-D-G-C)",
    instrument: "bass",
    stringCount: 6,
    openMidis: [23, 28, 33, 38, 43, 48],
    tuning: [0, 0, 0, 0, 0, 0],
    tuningPreset: "standard",
  },
};

export const OPEN_MIDIS = STRING_SETUPS.guitar_6_standard.openMidis.slice();

export const TUNING_PRESETS: Record<string, TuningPreset[]> = {
  guitar_6: [
    {
      id: "standard",
      label: "Standard (E A D G B E)",
      tuning: [0, 0, 0, 0, 0, 0],
      setup: "guitar_6_standard",
    },
    {
      id: "drop_d",
      label: "Drop D (D A D G B E)",
      tuning: [-2, 0, 0, 0, 0, 0],
      setup: "guitar_6_drop_d",
    },
    {
      id: "eb_standard",
      label: "Eb Standard (down 1/2 step)",
      tuning: [-1, -1, -1, -1, -1, -1],
    },
    {
      id: "d_standard",
      label: "D Standard (down 1 step)",
      tuning: [-2, -2, -2, -2, -2, -2],
    },
    { id: "dadgad", label: "DADGAD", tuning: [-2, 0, 0, 0, -2, -2] },
    {
      id: "open_g",
      label: "Open G (D G D G B D)",
      tuning: [-2, -2, 0, 0, 0, -2],
    },
    {
      id: "open_d",
      label: "Open D (D A D F# A D)",
      tuning: [-2, 0, 0, -1, -2, -2],
    },
  ],
  guitar_7: [
    {
      id: "standard",
      label: "Standard (B E A D G B E)",
      tuning: [0, 0, 0, 0, 0, 0, 0],
      setup: "guitar_7_standard",
    },
    {
      id: "drop_a",
      label: "Drop A (A E A D G B E)",
      tuning: [-2, 0, 0, 0, 0, 0, 0],
    },
  ],
  guitar_8: [
    {
      id: "standard",
      label: "Standard (F# B E A D G B E)",
      tuning: [2, 0, 0, 0, 0, 0, 0, 0],
      setup: "guitar_8_standard",
    },
    {
      id: "drop_e",
      label: "Drop E (E B E A D G B E)",
      tuning: [0, 0, 0, 0, 0, 0, 0, 0],
    },
  ],
  bass_4: [
    {
      id: "standard",
      label: "Standard (E A D G)",
      tuning: [0, 0, 0, 0],
      setup: "bass_4_standard",
    },
    { id: "drop_d", label: "Drop D (D A D G)", tuning: [-2, 0, 0, 0] },
    {
      id: "eb_standard",
      label: "Eb Standard (down 1/2 step)",
      tuning: [-1, -1, -1, -1],
    },
    { id: "bead", label: "BEAD (low B)", tuning: [-5, -5, -5, -5] },
  ],
  bass_5: [
    {
      id: "standard",
      label: "Standard low B (B E A D G)",
      tuning: [0, 0, 0, 0, 0],
      setup: "bass_5_standard",
    },
    {
      id: "standard_hc",
      label: "Standard high C (E A D G C)",
      tuning: [5, 0, 0, 0, 0],
    },
    { id: "drop_a", label: "Drop A (A E A D G)", tuning: [-2, 0, 0, 0, 0] },
  ],
  bass_6: [
    {
      id: "standard",
      label: "Standard (B E A D G C)",
      tuning: [0, 0, 0, 0, 0, 0],
      setup: "bass_6_standard",
    },
  ],
};

export const NOTATION_KEY_SIGNATURES: Record<string, number> = {
  C: 0,
  G: 1,
  D: 2,
  A: 3,
  E: 4,
  B: 5,
  "F#": 6,
  "C#": 7,
  F: -1,
  Bb: -2,
  Eb: -3,
  Ab: -4,
  Db: -5,
  Gb: -6,
  Cb: -7,
  "D#": -3,
  "G#": -4,
  "A#": -2,
};

export function clamp(value: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, value));
}

export function choose<T>(items: T[], index: number): T | null {
  if (!items.length) return null;
  return items[((index % items.length) + items.length) % items.length];
}

export function baseOpenMidisForInstrument(
  instrument: Instrument,
  stringCount: number,
): number[] {
  const bases: Record<Instrument, Record<number, number[]>> = {
    guitar: {
      4: [45, 50, 55, 59],
      5: [40, 45, 50, 55, 59],
      6: [40, 45, 50, 55, 59, 64],
      7: [35, 40, 45, 50, 55, 59, 64],
      8: [30, 35, 40, 45, 50, 55, 59, 64],
    },
    bass: {
      4: [28, 33, 38, 43],
      5: [23, 28, 33, 38, 43],
      6: [23, 28, 33, 38, 43, 48],
    },
  };
  const family = bases[instrument] || bases.guitar;
  return (family[stringCount] || family[6] || family[4]).slice();
}

export function openMidisFromTuning(
  instrument: Instrument,
  stringCount: number,
  tuning?: number[],
): number[] {
  const base = baseOpenMidisForInstrument(instrument, stringCount);
  return base.map((midi, index) => midi + (Number(tuning?.[index]) || 0));
}

export function tuningKey(instrument: Instrument, stringCount: number): string {
  return `${instrument}_${stringCount}`;
}

export function availableStringCounts(instrument: Instrument): number[] {
  return Object.keys(TUNING_PRESETS)
    .filter((key) => key.startsWith(`${instrument}_`))
    .map((key) => Number.parseInt(key.split("_")[1] || "", 10))
    .filter((count) => Number.isFinite(count))
    .sort((a, b) => a - b);
}

export function availableTuningPresets(
  instrument: Instrument,
  stringCount: number,
): TuningPreset[] {
  return TUNING_PRESETS[tuningKey(instrument, stringCount)] || [];
}

export function defaultStringSetup(
  instrument: Instrument,
  stringCount: number,
): TuningPreset | null {
  const presets = availableTuningPresets(instrument, stringCount);
  return (
    presets.find((preset) => preset.setup && STRING_SETUPS[preset.setup]) ||
    presets[0] ||
    null
  );
}

export function resolveStringSetup(
  cfg: Partial<
    Pick<TriadConfig, "instrument" | "stringCount" | "tuning" | "tuningPreset">
  >,
): StringSetup {
  const instrument = cfg?.instrument === "bass" ? "bass" : "guitar";
  const counts = availableStringCounts(instrument);
  const fallbackCount = instrument === "bass" ? 4 : 6;
  const desiredCount = counts.includes(Number(cfg?.stringCount))
    ? Number(cfg?.stringCount)
    : Array.isArray(cfg?.tuning) && counts.includes(cfg.tuning.length)
      ? cfg.tuning.length
      : fallbackCount;
  const presets = availableTuningPresets(instrument, desiredCount);
  const tuningPreset =
    presets.find((preset) => {
      if (cfg?.tuningPreset && preset.id === cfg.tuningPreset) return true;
      if (!Array.isArray(cfg?.tuning)) return false;
      if (cfg.tuning.length !== preset.tuning.length) return false;
      return cfg.tuning.every(
        (value, index) => Number(value) === Number(preset.tuning[index]),
      );
    }) ||
    defaultStringSetup(instrument, desiredCount) ||
    null;
  const tuning =
    tuningPreset?.tuning?.slice() || new Array(desiredCount).fill(0);
  const setup =
    tuningPreset?.setup && STRING_SETUPS[tuningPreset.setup]
      ? STRING_SETUPS[tuningPreset.setup]
      : {
          label: tuningPreset?.label || `${desiredCount}-string ${instrument}`,
          instrument,
          stringCount: desiredCount,
          openMidis: openMidisFromTuning(instrument, desiredCount, tuning),
          tuning,
          tuningPreset: tuningPreset?.id || "standard",
        };
  return {
    label: setup.label,
    instrument,
    stringCount: setup.stringCount || desiredCount,
    tuningPreset: tuningPreset?.id || setup.tuningPreset || "standard",
    openMidis: (
      setup.openMidis || openMidisFromTuning(instrument, desiredCount, tuning)
    ).slice(),
    tuning: (setup.tuning || tuning).slice(),
  };
}

export function stringSetOptions(
  stringCount: number,
): Array<{ value: string; label: string }> {
  const options: Array<{ value: string; label: string }> = [];
  for (let start = 0; start <= Math.max(0, stringCount - 3); start += 1) {
    const labels = [
      stringCount - start,
      stringCount - start - 1,
      stringCount - start - 2,
    ];
    options.push({
      value: labels.join(""),
      label: `${labels[0]}-${labels[1]}-${labels[2]}`,
    });
  }
  return options;
}

export function sanitizeStringSet(
  stringSet: string,
  stringCount: number,
): string {
  const valid = new Set(stringSetOptions(stringCount).map((opt) => opt.value));
  if (valid.has(stringSet)) return stringSet;
  const fallback = stringSetOptions(stringCount)[0];
  return fallback ? fallback.value : "";
}

export function stringSetToIndices(
  stringSet: string,
  stringCount: number,
): number[] {
  const digits = String(stringSet || "")
    .split("")
    .map((digit) => Number.parseInt(digit, 10))
    .filter((digit) => Number.isFinite(digit));
  const indices = digits
    .map((digit) => stringCount - digit)
    .filter((index) => index >= 0 && index < stringCount);
  return indices.length
    ? indices.sort((a, b) => a - b)
    : [0, 1, 2].filter((index) => index < stringCount);
}

export function slugify(text: string): string {
  return (
    String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "triad-lab"
  );
}

export function fmtTime(seconds: number): string {
  const s = Math.max(0, Number(seconds) || 0);
  const min = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${min}:${String(sec).padStart(2, "0")}`;
}

export function inversionIndexFor(
  cfg: Pick<TriadConfig, "inversionMode">,
  barIndex: number,
): number {
  if (cfg.inversionMode === "root") return 0;
  if (cfg.inversionMode === "first") return 1;
  if (cfg.inversionMode === "second") return 2;
  return barIndex % 3;
}

export function invertTriad(pcs: number[], inversion: number): number[] {
  if (inversion === 0) return [pcs[0], pcs[1], pcs[2]];
  if (inversion === 1) return [pcs[1], pcs[2], pcs[0]];
  return [pcs[2], pcs[0], pcs[1]];
}

export function degreePattern(cfg: Pick<TriadConfig, "progression">): number[] {
  if (cfg.progression === "i-iv-v") return [1, 4, 5];
  if (cfg.progression === "ii-v-i") return [2, 5, 1];
  return [1];
}

export function qualityForDegree(degree: number): string {
  const majorDiatonic: Record<number, string> = {
    1: "maj",
    2: "min",
    3: "min",
    4: "maj",
    5: "maj",
    6: "min",
    7: "dim",
  };
  return majorDiatonic[degree] || "maj";
}

export function degreeToPc(keyPc: number, degree: number): number {
  const offsets: Record<number, number> = {
    1: 0,
    2: 2,
    3: 4,
    4: 5,
    5: 7,
    6: 9,
    7: 11,
  };
  return (keyPc + (offsets[degree] || 0)) % 12;
}

export function pickStringSet(
  cfg: Pick<TriadConfig, "lesson" | "stringCount" | "stringSet">,
  barIndex: number,
): string {
  const available = stringSetOptions(cfg.stringCount || 6).map(
    (opt) => opt.value,
  );
  if (cfg.lesson === "stringset") {
    const cycle = available.length ? available : ["654", "543", "432", "321"];
    return choose(cycle, barIndex) || "654";
  }
  return sanitizeStringSet(cfg.stringSet, cfg.stringCount || 6);
}

export function pickQuality(
  cfg: Pick<TriadConfig, "lesson" | "progression" | "qualities">,
  degree: number,
  barIndex: number,
): string {
  if (cfg.lesson === "progression" || cfg.progression !== "single")
    return qualityForDegree(degree);
  return choose(cfg.qualities, barIndex) || "maj";
}

export function fretForPitchClass(
  openMidi: number,
  targetPc: number,
  minFret: number,
  maxFret: number,
  centerFret: number,
): number {
  let best = minFret;
  let bestScore = Number.POSITIVE_INFINITY;
  for (let fret = minFret; fret <= maxFret; fret += 1) {
    if ((((openMidi + fret) % 12) + 12) % 12 !== targetPc) continue;
    const score = Math.abs(fret - centerFret);
    if (score < bestScore) {
      bestScore = score;
      best = fret;
    }
  }
  return best;
}

function candidateFretsForPitchClass(
  openMidi: number,
  targetPc: number,
  minFret: number,
  maxFret: number,
): number[] {
  const out: number[] = [];
  for (let fret = minFret; fret <= maxFret; fret += 1) {
    if ((((openMidi + fret) % 12) + 12) % 12 === targetPc) out.push(fret);
  }
  return out;
}

function isPlayableOneHandShape(frets: number[]): boolean {
  const fretted = frets.filter((fret) => fret > 0);
  if (!fretted.length) return true;
  const minFret = Math.min(...fretted);
  const maxFret = Math.max(...fretted);
  return maxFret - minFret <= 4;
}

function findPlayableFretsForTriad(
  openMidis: number[],
  strings: number[],
  triadPcOrder: number[],
  centerFret: number,
  minFret: number,
  maxFret: number,
  avoidOpenStrings: boolean,
): number[] {
  const candidates = strings.map((stringIndex, i) => {
    const pc = triadPcOrder[i % 3];
    const all = candidateFretsForPitchClass(
      openMidis[stringIndex],
      pc,
      minFret,
      maxFret,
    );
    return all
      .slice()
      .sort((a, b) => Math.abs(a - centerFret) - Math.abs(b - centerFret))
      .slice(0, 6);
  });

  let best: number[] | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  function walk(index: number, built: number[]) {
    if (index >= candidates.length) {
      if (!isPlayableOneHandShape(built)) return;
      const fretted = built.filter((fret) => fret > 0);
      const min = fretted.length ? Math.min(...fretted) : 0;
      const max = fretted.length ? Math.max(...fretted) : 0;
      const span = fretted.length ? max - min : 0;
      const avg = built.reduce((sum, fret) => sum + fret, 0) / built.length;
      const score =
        span * 10 +
        Math.abs(avg - centerFret) * 3 +
        built.reduce((sum, fret) => sum + Math.abs(fret - centerFret), 0) +
        (avoidOpenStrings ? built.filter((fret) => fret === 0).length * 8 : 0);
      if (score < bestScore) {
        bestScore = score;
        best = built.slice();
      }
      return;
    }
    for (const fret of candidates[index]) {
      built.push(fret);
      walk(index + 1, built);
      built.pop();
    }
  }

  walk(0, []);

  if (best) return best;

  return strings.map((stringIndex, i) =>
    fretForPitchClass(
      openMidis[stringIndex],
      triadPcOrder[i % 3],
      minFret,
      maxFret,
      centerFret,
    ),
  );
}

function assignFingersByFret(allFrets: number[]): number[] {
  const out: number[] = allFrets.map((fret) =>
    fret < 0 ? -1 : fret === 0 ? 0 : 1,
  );
  const fretted = allFrets.filter((fret) => fret > 0);
  if (!fretted.length) return out;

  const minFret = Math.min(...fretted);
  for (let i = 0; i < allFrets.length; i += 1) {
    const fret = allFrets[i];
    if (fret <= 0) continue;
    out[i] = clamp(fret - minFret + 1, 1, 4);
  }
  return out;
}

export function noteName(pc: number): string {
  return KEY_ORDER[((pc % 12) + 12) % 12];
}

export function notationKeySignature(key: string): number {
  return NOTATION_KEY_SIGNATURES[key] ?? 0;
}

export function buildChart(cfg: TriadConfig): TriadExercise {
  const barBeats = 4;
  const secPerBeat = 60 / cfg.bpm;
  const barDur = barBeats * secPerBeat;
  const keyPc = KEY_TO_PC[cfg.key] ?? 0;

  const setup = resolveStringSetup(cfg);
  const openMidis = setup.openMidis;
  const stringCount = openMidis.length;

  const notes: TriadNote[] = [];
  const chords: ChordEntry[] = [];
  const chordTemplates: ChordTemplate[] = [];
  const beats: Beat[] = [];
  const sections: Section[] = [];
  const anchors: Anchor[] = [];

  let templateId = 0;
  const progression = degreePattern(cfg);

  for (let bar = 0; bar < cfg.bars; bar += 1) {
    const t = bar * barDur;
    const degree = choose(progression, bar) ?? 1;
    const rootPc = degreeToPc(keyPc, degree);
    const quality = pickQuality(cfg, degree, bar);
    const inversion = inversionIndexFor(cfg, bar);
    const intervals = QUALITY_INTERVALS[quality] || QUALITY_INTERVALS.maj;
    const triadPcOrder = invertTriad(
      [
        (rootPc + intervals[0]) % 12,
        (rootPc + intervals[1]) % 12,
        (rootPc + intervals[2]) % 12,
      ],
      inversion,
    );

    const stringSetId = pickStringSet(cfg, bar);
    const strings = stringSetToIndices(stringSetId, stringCount);
    const centerFret = cfg.startFret + (bar % 4);
    const chordNotes: TriadNote[] = [];
    const allFrets = new Array(stringCount).fill(-1);

    const selectedFrets = findPlayableFretsForTriad(
      openMidis,
      strings,
      triadPcOrder,
      centerFret,
      0,
      17,
      false,
    );

    for (let i = 0; i < strings.length; i += 1) {
      const stringIndex = strings[i];
      const fret = selectedFrets[i];
      allFrets[stringIndex] = fret;

      const note: TriadNote = {
        t,
        s: stringIndex,
        f: fret,
        sus: Math.max(0.15, barDur - 0.08),
        ho: false,
        po: false,
        pm: false,
        hm: false,
        hp: false,
        mt: false,
        vb: false,
        tr: false,
        ac: false,
        tp: false,
        sl: -1,
        slu: -1,
        bn: 0,
      };
      notes.push(note);
      chordNotes.push({ ...note });
    }

    const chordName = `${noteName(rootPc)}${QUALITY_LABEL[quality]} ${["R", "1st", "2nd"][inversion]}`;
    const allFingers = assignFingersByFret(allFrets);
    chordTemplates.push({
      id: templateId,
      name: chordName,
      displayName: chordName,
      frets: allFrets,
      fingers: allFingers,
      arp: false,
    });
    chords.push({ t, id: templateId, hd: false, notes: chordNotes });
    templateId += 1;

    const frettedFrets = chordNotes.map((n) => n.f).filter((f) => f > 0);
    if (frettedFrets.length > 0) {
      const minF = Math.min(...frettedFrets);
      const maxF = Math.max(...frettedFrets);
      anchors.push({ time: t, fret: minF, width: Math.max(4, maxF - minF + 1) });
    } else {
      anchors.push({ time: t, fret: cfg.startFret, width: 4 });
    }

    if (bar % 4 === 0) {
      sections.push({
        name: `Drill ${Math.floor(bar / 4) + 1}`,
        number: Math.floor(bar / 4) + 1,
        time: t,
      });
    }

    for (let beat = 0; beat < barBeats; beat += 1) {
      beats.push({
        time: t + beat * secPerBeat,
        measure: beat === 0 ? bar + 1 : -1,
      });
    }
  }

  const duration = cfg.bars * barDur + 1.5;
  return {
    session: {
      key: cfg.key,
      lesson: cfg.lesson,
      instrument: setup.instrument,
      stringCount,
      progression: cfg.progression,
      bpm: cfg.bpm,
      bars: cfg.bars,
      startFret: cfg.startFret,
      inversionMode: cfg.inversionMode,
      stringSet: cfg.stringSet,
      tuningPreset: setup.tuningPreset,
      qualities: cfg.qualities,
      audio: cfg.audio,
      tuning: setup.tuning.slice(),
      openMidis: openMidis.slice(),
    },
    chart: {
      notes,
      chords,
      chordTemplates,
      handShapes: [],
      anchors: anchors.length ? anchors : [{ time: 0, fret: cfg.startFret, width: 4 }],
      beats,
      sections,
      duration,
    },
    summary: [
      "Triad Lab",
      `Lesson: ${cfg.lesson}`,
      `Key: ${cfg.key}`,
      `Progression: ${cfg.progression}`,
      `Bars: ${cfg.bars}`,
      `BPM: ${cfg.bpm}`,
      `Qualities: ${cfg.qualities.join(", ")}`,
    ].join("\n"),
  };
}

export function buildBackingEventsFromChart(
  chart: Pick<TriadChart, "chords" | "chordTemplates">,
  duration: number,
  openMidis: number[],
): Array<{ t: number; end: number; name: string; midis: number[] }> {
  const chords = Array.isArray(chart?.chords)
    ? [...chart.chords].sort((a, b) => a.t - b.t)
    : [];
  const templates = chart?.chordTemplates || [];
  const tuning =
    Array.isArray(openMidis) && openMidis.length
      ? openMidis
      : resolveStringSetup({}).openMidis;
  const out: Array<{ t: number; end: number; name: string; midis: number[] }> =
    [];
  for (let index = 0; index < chords.length; index += 1) {
    const chord = chords[index];
    const next = chords[index + 1];
    const start = Number(chord.t || 0);
    const end = Number(next ? next.t : duration || start + 1);
    if (end <= start) continue;
    const name =
      templates[chord.id]?.displayName || templates[chord.id]?.name || "Chord";
    const midis: number[] = [];
    for (const note of chord.notes || []) {
      if (note.mt || note.f < 0 || note.s < 0 || note.s >= tuning.length)
        continue;
      midis.push(tuning[note.s] + note.f);
    }
    const uniq = [...new Set(midis)].sort((a, b) => a - b);
    if (!uniq.length) continue;
    out.push({ t: start, end, name, midis: uniq });
  }
  return out;
}

export function makeBundle(exercise: TriadExercise): TriadBundle {
  const chart = exercise.chart;
  const openMidis = exercise.session?.openMidis?.length
    ? exercise.session.openMidis
    : resolveStringSetup(exercise.session || {}).openMidis;
  const backingEvents = buildBackingEventsFromChart(
    chart,
    chart.duration,
    openMidis,
  );
  return {
    currentTime: 0,
    config: exercise.session,
    songInfo: {
      title: "Triad Lab",
      artist: "Triad Lab",
      arrangement: "Lead",
      tuning: exercise.session?.tuning?.slice() || [0, 0, 0, 0, 0, 0],
      capo: 0,
      duration: chart.duration,
      format: "triad-lab-preview",
    },
    isReady: true,
    notes: chart.notes,
    chords: chart.chords,
    anchors: chart.anchors,
    beats: chart.beats,
    sections: chart.sections,
    backingEvents,
    chordTemplates: chart.chordTemplates,
    handShapes: [],
    stringCount: exercise.session?.stringCount || openMidis.length || 6,
    tuning:
      exercise.session?.tuning?.slice() ||
      new Array(openMidis.length || 6).fill(0),
    openMidis: openMidis.slice(),
    capo: 0,
    lyrics: [],
    toneChanges: [],
    toneBase: "",
    mastery: 1,
    hasPhraseData: false,
    inverted: false,
    lefty: false,
    renderScale: 1,
    lyricsVisible: false,
    project: null,
    fretX: null,
    getNoteState: () => null,
    getNoteStateProvider: () => null,
  };
}
