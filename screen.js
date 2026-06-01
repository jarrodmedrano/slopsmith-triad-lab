"use strict";
(() => {
  // src/triad-core.ts
  var KEY_ORDER = [
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
    "B"
  ];
  var KEY_TO_PC = {
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
    B: 11
  };
  var QUALITY_INTERVALS = {
    maj: [0, 4, 7],
    min: [0, 3, 7],
    dim: [0, 3, 6],
    aug: [0, 4, 8]
  };
  var QUALITY_LABEL = {
    maj: "Maj",
    min: "Min",
    dim: "Dim",
    aug: "Aug"
  };
  var STRING_SETUPS = {
    guitar_6_standard: {
      label: "6-string guitar \u2014 standard",
      instrument: "guitar",
      stringCount: 6,
      openMidis: [40, 45, 50, 55, 59, 64],
      tuning: [0, 0, 0, 0, 0, 0],
      tuningPreset: "standard"
    },
    guitar_6_drop_d: {
      label: "6-string guitar \u2014 Drop D",
      instrument: "guitar",
      stringCount: 6,
      openMidis: [38, 45, 50, 55, 59, 64],
      tuning: [-2, 0, 0, 0, 0, 0],
      tuningPreset: "drop_d"
    },
    guitar_7_standard: {
      label: "7-string guitar \u2014 standard",
      instrument: "guitar",
      stringCount: 7,
      openMidis: [35, 40, 45, 50, 55, 59, 64],
      tuning: [0, 0, 0, 0, 0, 0, 0],
      tuningPreset: "standard"
    },
    guitar_8_standard: {
      label: "8-string guitar \u2014 standard",
      instrument: "guitar",
      stringCount: 8,
      openMidis: [30, 35, 40, 45, 50, 55, 59, 64],
      tuning: [2, 0, 0, 0, 0, 0, 0, 0],
      tuningPreset: "standard"
    },
    bass_4_standard: {
      label: "4-string bass \u2014 standard",
      instrument: "bass",
      stringCount: 4,
      openMidis: [28, 33, 38, 43],
      tuning: [0, 0, 0, 0],
      tuningPreset: "standard"
    },
    bass_5_standard: {
      label: "5-string bass \u2014 standard low B",
      instrument: "bass",
      stringCount: 5,
      openMidis: [23, 28, 33, 38, 43],
      tuning: [0, 0, 0, 0, 0],
      tuningPreset: "standard_low_b"
    },
    bass_6_standard: {
      label: "6-string bass \u2014 standard (B-E-A-D-G-C)",
      instrument: "bass",
      stringCount: 6,
      openMidis: [23, 28, 33, 38, 43, 48],
      tuning: [0, 0, 0, 0, 0, 0],
      tuningPreset: "standard"
    }
  };
  var OPEN_MIDIS = STRING_SETUPS.guitar_6_standard.openMidis.slice();
  var TUNING_PRESETS = {
    guitar_6: [
      {
        id: "standard",
        label: "Standard (E A D G B E)",
        tuning: [0, 0, 0, 0, 0, 0],
        setup: "guitar_6_standard"
      },
      {
        id: "drop_d",
        label: "Drop D (D A D G B E)",
        tuning: [-2, 0, 0, 0, 0, 0],
        setup: "guitar_6_drop_d"
      },
      {
        id: "eb_standard",
        label: "Eb Standard (down 1/2 step)",
        tuning: [-1, -1, -1, -1, -1, -1]
      },
      {
        id: "d_standard",
        label: "D Standard (down 1 step)",
        tuning: [-2, -2, -2, -2, -2, -2]
      },
      { id: "dadgad", label: "DADGAD", tuning: [-2, 0, 0, 0, -2, -2] },
      {
        id: "open_g",
        label: "Open G (D G D G B D)",
        tuning: [-2, -2, 0, 0, 0, -2]
      },
      {
        id: "open_d",
        label: "Open D (D A D F# A D)",
        tuning: [-2, 0, 0, -1, -2, -2]
      }
    ],
    guitar_7: [
      {
        id: "standard",
        label: "Standard (B E A D G B E)",
        tuning: [0, 0, 0, 0, 0, 0, 0],
        setup: "guitar_7_standard"
      },
      {
        id: "drop_a",
        label: "Drop A (A E A D G B E)",
        tuning: [-2, 0, 0, 0, 0, 0, 0]
      }
    ],
    guitar_8: [
      {
        id: "standard",
        label: "Standard (F# B E A D G B E)",
        tuning: [2, 0, 0, 0, 0, 0, 0, 0],
        setup: "guitar_8_standard"
      },
      {
        id: "drop_e",
        label: "Drop E (E B E A D G B E)",
        tuning: [0, 0, 0, 0, 0, 0, 0, 0]
      }
    ],
    bass_4: [
      {
        id: "standard",
        label: "Standard (E A D G)",
        tuning: [0, 0, 0, 0],
        setup: "bass_4_standard"
      },
      { id: "drop_d", label: "Drop D (D A D G)", tuning: [-2, 0, 0, 0] },
      {
        id: "eb_standard",
        label: "Eb Standard (down 1/2 step)",
        tuning: [-1, -1, -1, -1]
      },
      { id: "bead", label: "BEAD (low B)", tuning: [-5, -5, -5, -5] }
    ],
    bass_5: [
      {
        id: "standard",
        label: "Standard low B (B E A D G)",
        tuning: [0, 0, 0, 0, 0],
        setup: "bass_5_standard"
      },
      {
        id: "standard_hc",
        label: "Standard high C (E A D G C)",
        tuning: [5, 0, 0, 0, 0]
      },
      { id: "drop_a", label: "Drop A (A E A D G)", tuning: [-2, 0, 0, 0, 0] }
    ],
    bass_6: [
      {
        id: "standard",
        label: "Standard (B E A D G C)",
        tuning: [0, 0, 0, 0, 0, 0],
        setup: "bass_6_standard"
      }
    ]
  };
  var NOTATION_KEY_SIGNATURES = {
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
    "A#": -2
  };
  function clamp(value, lo, hi) {
    return Math.max(lo, Math.min(hi, value));
  }
  function choose(items, index) {
    if (!items.length) return null;
    return items[(index % items.length + items.length) % items.length];
  }
  function baseOpenMidisForInstrument(instrument, stringCount) {
    const bases = {
      guitar: {
        4: [45, 50, 55, 59],
        5: [40, 45, 50, 55, 59],
        6: [40, 45, 50, 55, 59, 64],
        7: [35, 40, 45, 50, 55, 59, 64],
        8: [30, 35, 40, 45, 50, 55, 59, 64]
      },
      bass: {
        4: [28, 33, 38, 43],
        5: [23, 28, 33, 38, 43],
        6: [23, 28, 33, 38, 43, 48]
      }
    };
    const family = bases[instrument] || bases.guitar;
    return (family[stringCount] || family[6] || family[4]).slice();
  }
  function openMidisFromTuning(instrument, stringCount, tuning) {
    const base = baseOpenMidisForInstrument(instrument, stringCount);
    return base.map((midi, index) => midi + (Number(tuning?.[index]) || 0));
  }
  function tuningKey(instrument, stringCount) {
    return `${instrument}_${stringCount}`;
  }
  function availableStringCounts(instrument) {
    return Object.keys(TUNING_PRESETS).filter((key) => key.startsWith(`${instrument}_`)).map((key) => Number.parseInt(key.split("_")[1] || "", 10)).filter((count) => Number.isFinite(count)).sort((a, b) => a - b);
  }
  function availableTuningPresets(instrument, stringCount) {
    return TUNING_PRESETS[tuningKey(instrument, stringCount)] || [];
  }
  function defaultStringSetup(instrument, stringCount) {
    const presets = availableTuningPresets(instrument, stringCount);
    return presets.find((preset) => preset.setup && STRING_SETUPS[preset.setup]) || presets[0] || null;
  }
  function resolveStringSetup(cfg) {
    const instrument = cfg?.instrument === "bass" ? "bass" : "guitar";
    const counts = availableStringCounts(instrument);
    const fallbackCount = instrument === "bass" ? 4 : 6;
    const desiredCount = counts.includes(Number(cfg?.stringCount)) ? Number(cfg?.stringCount) : Array.isArray(cfg?.tuning) && counts.includes(cfg.tuning.length) ? cfg.tuning.length : fallbackCount;
    const presets = availableTuningPresets(instrument, desiredCount);
    const tuningPreset = presets.find((preset) => {
      if (cfg?.tuningPreset && preset.id === cfg.tuningPreset) return true;
      if (!Array.isArray(cfg?.tuning)) return false;
      if (cfg.tuning.length !== preset.tuning.length) return false;
      return cfg.tuning.every(
        (value, index) => Number(value) === Number(preset.tuning[index])
      );
    }) || defaultStringSetup(instrument, desiredCount) || null;
    const tuning = tuningPreset?.tuning?.slice() || new Array(desiredCount).fill(0);
    const setup = tuningPreset?.setup && STRING_SETUPS[tuningPreset.setup] ? STRING_SETUPS[tuningPreset.setup] : {
      label: tuningPreset?.label || `${desiredCount}-string ${instrument}`,
      instrument,
      stringCount: desiredCount,
      openMidis: openMidisFromTuning(instrument, desiredCount, tuning),
      tuning,
      tuningPreset: tuningPreset?.id || "standard"
    };
    return {
      label: setup.label,
      instrument,
      stringCount: setup.stringCount || desiredCount,
      tuningPreset: tuningPreset?.id || setup.tuningPreset || "standard",
      openMidis: (setup.openMidis || openMidisFromTuning(instrument, desiredCount, tuning)).slice(),
      tuning: (setup.tuning || tuning).slice()
    };
  }
  function stringSetOptions(stringCount) {
    const options = [];
    for (let start = 0; start <= Math.max(0, stringCount - 3); start += 1) {
      const labels = [
        stringCount - start,
        stringCount - start - 1,
        stringCount - start - 2
      ];
      options.push({
        value: labels.join(""),
        label: `${labels[0]}-${labels[1]}-${labels[2]}`
      });
    }
    return options;
  }
  function sanitizeStringSet(stringSet, stringCount) {
    const valid = new Set(stringSetOptions(stringCount).map((opt) => opt.value));
    if (valid.has(stringSet)) return stringSet;
    const fallback = stringSetOptions(stringCount)[0];
    return fallback ? fallback.value : "";
  }
  function stringSetToIndices(stringSet, stringCount) {
    const digits = String(stringSet || "").split("").map((digit) => Number.parseInt(digit, 10)).filter((digit) => Number.isFinite(digit));
    const indices = digits.map((digit) => stringCount - digit).filter((index) => index >= 0 && index < stringCount);
    return indices.length ? indices.sort((a, b) => a - b) : [0, 1, 2].filter((index) => index < stringCount);
  }
  function slugify(text) {
    return String(text || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "triad-lab";
  }
  function inversionIndexFor(cfg, barIndex) {
    if (cfg.inversionMode === "root") return 0;
    if (cfg.inversionMode === "first") return 1;
    if (cfg.inversionMode === "second") return 2;
    return barIndex % 3;
  }
  function invertTriad(pcs, inversion) {
    if (inversion === 0) return [pcs[0], pcs[1], pcs[2]];
    if (inversion === 1) return [pcs[1], pcs[2], pcs[0]];
    return [pcs[2], pcs[0], pcs[1]];
  }
  function degreePattern(cfg) {
    if (cfg.progression === "i-iv-v") return [1, 4, 5];
    if (cfg.progression === "ii-v-i") return [2, 5, 1];
    return [1];
  }
  function qualityForDegree(degree) {
    const majorDiatonic = {
      1: "maj",
      2: "min",
      3: "min",
      4: "maj",
      5: "maj",
      6: "min",
      7: "dim"
    };
    return majorDiatonic[degree] || "maj";
  }
  function degreeToPc(keyPc, degree) {
    const offsets = {
      1: 0,
      2: 2,
      3: 4,
      4: 5,
      5: 7,
      6: 9,
      7: 11
    };
    return (keyPc + (offsets[degree] || 0)) % 12;
  }
  function pickStringSet(cfg, barIndex) {
    const available = stringSetOptions(cfg.stringCount || 6).map(
      (opt) => opt.value
    );
    if (cfg.lesson === "stringset") {
      const cycle = available.length ? available : ["654", "543", "432", "321"];
      return choose(cycle, barIndex) || "654";
    }
    return sanitizeStringSet(cfg.stringSet, cfg.stringCount || 6);
  }
  function pickQuality(cfg, degree, barIndex) {
    if (cfg.lesson === "progression" || cfg.progression !== "single")
      return qualityForDegree(degree);
    return choose(cfg.qualities, barIndex) || "maj";
  }
  function fretForPitchClass(openMidi, targetPc, minFret, maxFret, centerFret) {
    let best = minFret;
    let bestScore = Number.POSITIVE_INFINITY;
    for (let fret = minFret; fret <= maxFret; fret += 1) {
      if (((openMidi + fret) % 12 + 12) % 12 !== targetPc) continue;
      const score = Math.abs(fret - centerFret);
      if (score < bestScore) {
        bestScore = score;
        best = fret;
      }
    }
    return best;
  }
  function noteName(pc) {
    return KEY_ORDER[(pc % 12 + 12) % 12];
  }
  function buildChart(cfg) {
    const barBeats = 4;
    const secPerBeat = 60 / cfg.bpm;
    const barDur = barBeats * secPerBeat;
    const keyPc = KEY_TO_PC[cfg.key] ?? 0;
    const setup = resolveStringSetup(cfg);
    const openMidis = setup.openMidis;
    const stringCount = openMidis.length;
    const notes = [];
    const chords = [];
    const chordTemplates = [];
    const beats = [];
    const sections = [];
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
          (rootPc + intervals[2]) % 12
        ],
        inversion
      );
      const stringSetId = pickStringSet(cfg, bar);
      const strings = stringSetToIndices(stringSetId, stringCount);
      const centerFret = cfg.startFret + bar % 4;
      const chordNotes = [];
      const allFrets = new Array(stringCount).fill(-1);
      for (let i = 0; i < strings.length; i += 1) {
        const stringIndex = strings[i];
        const pc = triadPcOrder[i % 3];
        const fret = fretForPitchClass(
          openMidis[stringIndex],
          pc,
          0,
          17,
          centerFret
        );
        allFrets[stringIndex] = fret;
        const note = {
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
          bn: 0
        };
        notes.push(note);
        chordNotes.push({ ...note });
      }
      const chordName = `${noteName(rootPc)}${QUALITY_LABEL[quality]} ${["R", "1st", "2nd"][inversion]}`;
      chordTemplates.push({
        id: templateId,
        name: chordName,
        displayName: chordName,
        frets: allFrets,
        fingers: new Array(stringCount).fill(-1),
        arp: false
      });
      chords.push({ t, id: templateId, hd: false, notes: chordNotes });
      templateId += 1;
      if (bar % 4 === 0) {
        sections.push({
          name: `Drill ${Math.floor(bar / 4) + 1}`,
          number: Math.floor(bar / 4) + 1,
          time: t
        });
      }
      for (let beat = 0; beat < barBeats; beat += 1) {
        beats.push({
          time: t + beat * secPerBeat,
          measure: beat === 0 ? bar + 1 : -1
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
        openMidis: openMidis.slice()
      },
      chart: {
        notes,
        chords,
        chordTemplates,
        handShapes: [],
        anchors: [{ time: 0, fret: cfg.startFret, width: 4 }],
        beats,
        sections,
        duration
      },
      summary: [
        "Triad Lab",
        `Lesson: ${cfg.lesson}`,
        `Key: ${cfg.key}`,
        `Progression: ${cfg.progression}`,
        `Bars: ${cfg.bars}`,
        `BPM: ${cfg.bpm}`,
        `Qualities: ${cfg.qualities.join(", ")}`
      ].join("\n")
    };
  }
  function buildBackingEventsFromChart(chart, duration, openMidis) {
    const chords = Array.isArray(chart?.chords) ? [...chart.chords].sort((a, b) => a.t - b.t) : [];
    const templates = chart?.chordTemplates || [];
    const tuning = Array.isArray(openMidis) && openMidis.length ? openMidis : resolveStringSetup({}).openMidis;
    const out = [];
    for (let index = 0; index < chords.length; index += 1) {
      const chord = chords[index];
      const next = chords[index + 1];
      const start = Number(chord.t || 0);
      const end = Number(next ? next.t : duration || start + 1);
      if (end <= start) continue;
      const name = templates[chord.id]?.displayName || templates[chord.id]?.name || "Chord";
      const midis = [];
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
  function makeBundle(exercise) {
    const chart = exercise.chart;
    const openMidis = exercise.session?.openMidis?.length ? exercise.session.openMidis : resolveStringSetup(exercise.session || {}).openMidis;
    const backingEvents = buildBackingEventsFromChart(
      chart,
      chart.duration,
      openMidis
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
        format: "triad-lab-preview"
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
      tuning: exercise.session?.tuning?.slice() || new Array(openMidis.length || 6).fill(0),
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
      getNoteStateProvider: () => null
    };
  }

  // src/runtime-audio.ts
  var AUDIO_LOOKAHEAD_SECONDS = 0.2;
  var audioState = {
    ctx: null,
    nodes: []
  };
  function stopAudio() {
    for (const node of audioState.nodes) {
      try {
        node.stop?.(0);
      } catch (_err) {
      }
      try {
        node.disconnect?.();
      } catch (_err) {
      }
    }
    audioState.nodes = [];
  }
  function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }
  function bendSemitones(bn) {
    const value = Number(bn) || 0;
    if (value === 0.5) return 1;
    if (value === 1) return 2;
    if (value === 1.5) return 3;
    if (value === 2) return 4;
    return value * 2;
  }
  function schedulePluckedString(ctx, when, freq, dur, gainScale, bendSemis) {
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
      when + Math.max(0.08, dur)
    );
    filter.Q.setValueAtTime(1.4, when);
    const amp = 0.38 * (gainScale || 1);
    gain.gain.setValueAtTime(1e-4, when);
    gain.gain.exponentialRampToValueAtTime(amp, when + 8e-3);
    gain.gain.exponentialRampToValueAtTime(amp * 0.5, when + 0.07);
    gain.gain.exponentialRampToValueAtTime(1e-4, when + Math.max(0.12, dur));
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
  function scheduleHarmonyPad(ctx, when, midis, dur, tone) {
    if (!midis.length) return;
    const selectedTone = tone || "pad";
    if (selectedTone === "organ") {
      const RATIOS = [1, 2, 3, 4, 5, 6, 8];
      const VOLS = [0.8, 0.5, 0.35, 0.25, 0.18, 0.12, 0.08];
      const master2 = ctx.createGain();
      master2.gain.setValueAtTime(0.13 / Math.max(1, midis.length), when);
      master2.connect(ctx.destination);
      audioState.nodes.push(master2);
      midis.slice(0, 4).forEach((midi) => {
        RATIOS.forEach((ratio, ratioIndex) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(midiToFreq(midi) * ratio, when);
          gain.gain.setValueAtTime(VOLS[ratioIndex], when);
          osc.connect(gain);
          gain.connect(master2);
          osc.start(when);
          osc.stop(when + dur);
          audioState.nodes.push(osc, gain);
        });
      });
      return;
    }
    if (selectedTone === "epiano") {
      const master2 = ctx.createGain();
      master2.gain.setValueAtTime(1e-4, when);
      master2.gain.exponentialRampToValueAtTime(0.28, when + 3e-3);
      master2.gain.exponentialRampToValueAtTime(
        0.09,
        when + Math.min(0.38, dur * 0.35)
      );
      master2.gain.linearRampToValueAtTime(
        0.06,
        when + Math.max(0.39, dur - 0.06)
      );
      master2.gain.linearRampToValueAtTime(1e-4, when + dur);
      master2.connect(ctx.destination);
      audioState.nodes.push(master2);
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
        gain.connect(master2);
        bell.connect(bellGain);
        bellGain.connect(master2);
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
    master.gain.setValueAtTime(1e-4, when);
    master.gain.exponentialRampToValueAtTime(0.24, when + 0.012);
    master.gain.linearRampToValueAtTime(0.18, when + Math.max(0.08, dur - 0.16));
    master.gain.linearRampToValueAtTime(1e-4, when + dur);
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
  function scheduleClick(ctx, when, accent) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = "square";
    osc.frequency.setValueAtTime(accent ? 1760 : 1120, when);
    filter.type = "highpass";
    filter.frequency.setValueAtTime(650, when);
    gain.gain.setValueAtTime(1e-4, when);
    gain.gain.exponentialRampToValueAtTime(accent ? 0.14 : 0.09, when + 2e-3);
    gain.gain.exponentialRampToValueAtTime(
      1e-4,
      when + (accent ? 0.055 : 0.04)
    );
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(when);
    osc.stop(when + 0.07);
    audioState.nodes.push(osc, filter, gain);
  }
  function schedulePreviewAudio(bundle, fromTime, delaySeconds, readConfigAudio, openAudioContext) {
    const audio = bundle?.config?.audio || readConfigAudio();
    if (!audio.notes && !audio.metronome && !audio.harmony) return;
    audioState.ctx = audioState.ctx || openAudioContext();
    if (audioState.ctx.state === "suspended")
      audioState.ctx.resume().catch(() => {
      });
    const ctx = audioState.ctx;
    const base = ctx.currentTime + (Number.isFinite(delaySeconds) ? delaySeconds : AUDIO_LOOKAHEAD_SECONDS);
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
          audio.harmonyTone || "pad"
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
          bendSemitones(note.bn || 0)
        );
      }
    }
    if (audio.metronome) {
      for (const beat of bundle.beats || []) {
        if (beat.time < startFrom || beat.time > duration + 0.1) continue;
        scheduleClick(
          ctx,
          base + (beat.time - startFrom),
          (beat.measure || -1) >= 0
        );
      }
    }
  }

  // src/runtime-renderers.ts
  var STRING_COLORS = [
    "#ef4444",
    "#f97316",
    "#facc15",
    "#22c55e",
    "#06b6d4",
    "#60a5fa",
    "#a855f7",
    "#ec4899"
  ];
  function stringLabelForMidi(midi) {
    const pc = (midi % 12 + 12) % 12;
    return ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"][pc] || "?";
  }
  function makeBuiltin2DRenderer() {
    let canvas = null;
    let ctx = null;
    let W = 0;
    let H = 0;
    const LEFT_PAD = 64;
    const RIGHT_PAD = 28;
    const TOP_PAD = 96;
    const BOTTOM_PAD = 52;
    const AHEAD = 8;
    const BEHIND = 1.5;
    function resize() {
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      W = Math.max(640, Math.round(rect?.width || 1280));
      H = Math.max(420, Math.round(rect?.height || 720));
      canvas.width = W;
      canvas.height = H;
    }
    function laneY(s, count, inverted) {
      const top = TOP_PAD;
      const bottom = H - BOTTOM_PAD;
      const visualIndex = inverted ? s : count - 1 - s;
      return bottom - visualIndex * ((bottom - top) / Math.max(1, count - 1));
    }
    function xForDt(dt) {
      return LEFT_PAD + (dt + BEHIND) / (AHEAD + BEHIND) * (W - LEFT_PAD - RIGHT_PAD);
    }
    function drawBackground() {
      if (!ctx) return;
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#08111f");
      grad.addColorStop(1, "#050711");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }
    function draw(bundle) {
      if (!ctx || !bundle) return;
      resize();
      const now = bundle.currentTime || 0;
      const nStr = Math.max(1, bundle.stringCount || 6);
      const inverted = !!bundle.inverted;
      const openMidis = bundle.openMidis || null;
      drawBackground();
      for (const b of bundle.beats || []) {
        const dt = b.time - now;
        if (dt < -BEHIND || dt > AHEAD) continue;
        const x = xForDt(dt);
        ctx.strokeStyle = b.measure >= 0 ? "rgba(96,165,250,0.55)" : "rgba(148,163,184,0.18)";
        ctx.lineWidth = b.measure >= 0 ? 1.4 : 1;
        ctx.beginPath();
        ctx.moveTo(x, TOP_PAD - 24);
        ctx.lineTo(x, H - BOTTOM_PAD + 6);
        ctx.stroke();
      }
      for (let s = 0; s < nStr; s += 1) {
        const y = laneY(s, nStr, inverted);
        ctx.strokeStyle = "rgba(148,163,184,0.25)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(LEFT_PAD - 4, y);
        ctx.lineTo(W - RIGHT_PAD, y);
        ctx.stroke();
        ctx.fillStyle = STRING_COLORS[s] || "#94a3b8";
        ctx.font = "700 13px system-ui";
        const label = openMidis ? stringLabelForMidi(openMidis[s]) : `S${s + 1}`;
        const display = s === nStr - 1 && label === "E" ? "e" : label;
        ctx.fillText(display, 14, y + 5);
      }
      for (const ch of bundle.backingEvents || []) {
        const dt = ch.t - now;
        if (dt < -BEHIND || dt > AHEAD) continue;
        const x = xForDt(dt);
        ctx.fillStyle = "rgba(250,204,21,0.12)";
        ctx.fillRect(x - 42, 22, 84, 26);
        ctx.strokeStyle = "rgba(250,204,21,0.45)";
        ctx.strokeRect(x - 42, 22, 84, 26);
        ctx.fillStyle = "#fde68a";
        ctx.font = "700 12px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(ch.name, x, 39);
        ctx.textAlign = "left";
      }
      for (const chord of bundle.chords || []) {
        const dt = chord.t - now;
        if (dt < -BEHIND || dt > AHEAD) continue;
        const x = xForDt(dt);
        const name = bundle.chordTemplates?.[chord.id]?.displayName || bundle.chordTemplates?.[chord.id]?.name || "";
        ctx.fillStyle = "rgba(168,85,247,0.18)";
        ctx.fillRect(x - 38, 52, 76, 22);
        ctx.strokeStyle = "rgba(168,85,247,0.75)";
        ctx.strokeRect(x - 38, 52, 76, 22);
        ctx.fillStyle = "#e9d5ff";
        ctx.font = "700 12px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(name, x, 68);
        ctx.textAlign = "left";
      }
      for (const note of bundle.notes || []) {
        const dt = note.t - now;
        if (dt < -BEHIND || dt > AHEAD) continue;
        const x = xForDt(dt);
        const y = laneY(note.s, nStr, inverted);
        const col = STRING_COLORS[note.s] || "#94a3b8";
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.roundRect(x - 17, y - 13, 34, 26, 7);
        ctx.fill();
        ctx.strokeStyle = note.ac ? "#f8fafc" : "rgba(248,250,252,0.5)";
        ctx.lineWidth = note.ac ? 3 : 1.2;
        ctx.stroke();
        ctx.fillStyle = "#020617";
        ctx.font = "800 14px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(String(note.f), x, y + 5);
        ctx.textAlign = "left";
      }
      for (const sec of bundle.sections || []) {
        const dt = sec.time - now;
        if (dt < -BEHIND || dt > AHEAD) continue;
        const x = xForDt(dt);
        ctx.strokeStyle = "rgba(244,114,182,0.7)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, H - BOTTOM_PAD + 8);
        ctx.lineTo(x, H - BOTTOM_PAD + 22);
        ctx.stroke();
      }
      const playX = xForDt(0);
      ctx.strokeStyle = "#f8fafc";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playX, TOP_PAD - 36);
      ctx.lineTo(playX, H - BOTTOM_PAD + 6);
      ctx.stroke();
    }
    return {
      init(canvasElement) {
        canvas = canvasElement;
        ctx = canvasElement.getContext("2d");
        resize();
        window.addEventListener("resize", resize);
      },
      draw,
      resize,
      destroy() {
        window.removeEventListener("resize", resize);
        canvas = null;
        ctx = null;
      }
    };
  }
  function makeBuiltin2DTabRenderer() {
    let canvas = null;
    let ctx = null;
    let W = 0;
    let H = 0;
    function resize() {
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      W = Math.max(640, Math.round(rect?.width || 1280));
      H = Math.max(280, Math.round(rect?.height || 480));
      canvas.width = W;
      canvas.height = H;
    }
    function draw(exercise, now) {
      if (!ctx) return;
      resize();
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#faf3df";
      ctx.fillRect(0, 0, W, H);
      const top = 96;
      const spacing = 28;
      const nStr = Math.max(
        1,
        exercise?.session?.stringCount || exercise?.chart?.chordTemplates?.[0]?.frets?.length || 6
      );
      for (let s = 0; s < nStr; s += 1) {
        const y = top + s * spacing;
        ctx.strokeStyle = "#111827";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(48, y);
        ctx.lineTo(W - 26, y);
        ctx.stroke();
        ctx.fillStyle = "#1f2937";
        ctx.font = "12px ui-monospace, monospace";
        ctx.fillText(String(nStr - s), 24, y + 4);
      }
      const visibleSec = 12;
      const x0 = 90;
      const x1 = W - 36;
      const pxPerSec = (x1 - x0) / visibleSec;
      for (const chord of exercise.chart.chords) {
        const x = x0 + (chord.t - now) * pxPerSec;
        if (x < x0 - 80 || x > x1 + 40) continue;
        const tpl = exercise.chart.chordTemplates[chord.id];
        if (tpl) {
          ctx.fillStyle = "#7c2d12";
          ctx.font = "italic 12px Georgia, serif";
          ctx.fillText(tpl.name, x - 16, top - 26);
        }
        for (const note of chord.notes) {
          const y = top + (nStr - 1 - note.s) * spacing;
          ctx.fillStyle = "#111827";
          ctx.fillRect(x - 8, y - 9, 18, 18);
          ctx.fillStyle = "#f9fafb";
          ctx.font = "12px ui-monospace, monospace";
          ctx.fillText(String(note.f), x - 4, y + 5);
        }
      }
      ctx.strokeStyle = "#dc2626";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x0 + 6, top - 44);
      ctx.lineTo(x0 + 6, top + 5 * spacing + 22);
      ctx.stroke();
    }
    return {
      init(canvasElement) {
        canvas = canvasElement;
        ctx = canvasElement.getContext("2d");
        resize();
        window.addEventListener("resize", resize);
      },
      draw,
      resize,
      destroy() {
        window.removeEventListener("resize", resize);
        canvas = null;
        ctx = null;
      }
    };
  }
  function makeBuiltin2DNotationRenderer() {
    let canvas = null;
    let ctx = null;
    let W = 0;
    let H = 0;
    let keyAcc = 0;
    let isFlats = false;
    const LEFT_PAD = 68;
    const RIGHT_PAD = 24;
    const AHEAD = 5;
    const BEHIND = 1.5;
    const STAFF_LEFT = 8;
    const BAR_LEAD = 13;
    const SHARP_SPELL = [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
      [2, 0],
      [3, 0],
      [3, 1],
      [4, 0],
      [4, 1],
      [5, 0],
      [5, 1],
      [6, 0]
    ];
    const FLAT_SPELL = [
      [0, 0],
      [1, -1],
      [1, 0],
      [2, -1],
      [2, 0],
      [3, 0],
      [4, -1],
      [4, 0],
      [5, -1],
      [5, 0],
      [6, -1],
      [6, 0]
    ];
    const T_SHARP = [8, 5, 9, 6, 3, 7, 4];
    const T_FLAT = [4, 7, 3, 6, 2, 5, 1];
    function resize() {
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      W = Math.max(640, Math.round(rect?.width || 1280));
      H = Math.max(500, Math.round(rect?.height || 720));
      canvas.width = W;
      canvas.height = H;
    }
    function xForDt(dt) {
      return LEFT_PAD + (dt + BEHIND) / (AHEAD + BEHIND) * (W - LEFT_PAD - RIGHT_PAD);
    }
    function stepToY(step, bottomY, ls) {
      return bottomY - step * (ls / 2);
    }
    function spellMidi(soundingMidi) {
      const written = soundingMidi + 12;
      const pc = (written % 12 + 12) % 12;
      const oct = Math.floor(written / 12) - 1;
      const [letter, alter] = (isFlats ? FLAT_SPELL : SHARP_SPELL)[pc];
      const step = oct * 7 + letter - (4 * 7 + 2);
      return { step, alter, letter };
    }
    function keySigLetterAlter() {
      const map = {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0
      };
      const order = isFlats ? [6, 2, 5, 1, 4, 0, 3] : [3, 0, 4, 1, 5, 2, 6];
      const alt = isFlats ? -1 : 1;
      for (let i = 0; i < Math.min(Math.abs(keyAcc), 7); i += 1)
        map[order[i]] = alt;
      return map;
    }
    function noteAccidental(soundingMidi, ksAlter) {
      const { alter, letter } = spellMidi(soundingMidi);
      const sig = ksAlter[letter] || 0;
      if (alter === sig) return null;
      return alter > 0 ? "sharp" : alter < 0 ? "flat" : "natural";
    }
    function draw(bundle) {
      if (!ctx || !bundle) return;
      resize();
      const now = bundle.currentTime || 0;
      const ls = Math.max(8, Math.min(14, Math.floor(H * 0.04)));
      const bottomY = Math.floor((H - ls * 4) / 2) + ls * 4;
      const cfg = bundle.config || {};
      keyAcc = NOTATION_KEY_SIGNATURES[cfg.key || "C"] ?? 0;
      isFlats = keyAcc < 0;
      const ksAlter = keySigLetterAlter();
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#faf3df");
      g.addColorStop(1, "#f6edd7");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i += 1) {
        const y = bottomY - i * ls;
        ctx.beginPath();
        ctx.moveTo(STAFF_LEFT, y);
        ctx.lineTo(W - RIGHT_PAD, y);
        ctx.stroke();
      }
      ctx.fillStyle = "#1a1a1a";
      ctx.font = `${ls * 4.4}px "Segoe UI Symbol","Apple Symbols","Noto Symbols 2",serif`;
      ctx.textBaseline = "middle";
      ctx.fillText("\u{1D11E}", 12, bottomY - ls * 2);
      ctx.textBaseline = "alphabetic";
      const n = Math.min(Math.abs(keyAcc), 7);
      if (n) {
        const steps = isFlats ? T_FLAT : T_SHARP;
        const ch = isFlats ? "\u266D" : "\u266F";
        const x0 = STAFF_LEFT + ls * 3.1;
        ctx.fillStyle = "#1a1a1a";
        ctx.font = `${ls * 1.4}px serif`;
        ctx.textAlign = "center";
        for (let i = 0; i < n; i += 1) {
          ctx.fillText(
            ch,
            x0 + i * ls * 0.95,
            stepToY(steps[i], bottomY, ls) + ls * 0.4
          );
        }
        ctx.textAlign = "left";
      }
      for (const b of bundle.beats || []) {
        if (b.measure < 0) continue;
        const dt = b.time - now;
        if (dt < -BEHIND || dt > AHEAD) continue;
        const x = xForDt(dt) - BAR_LEAD;
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, bottomY - ls * 4);
        ctx.lineTo(x, bottomY);
        ctx.stroke();
      }
      for (const chord of bundle.chords || []) {
        const dt = chord.t - now;
        if (dt < -BEHIND || dt > AHEAD) continue;
        const x = xForDt(dt);
        const name = bundle.chordTemplates?.[chord.id]?.displayName || bundle.chordTemplates?.[chord.id]?.name || "";
        if (name) {
          ctx.fillStyle = "#1a1a1a";
          ctx.font = 'italic 600 13px "Cambria","Georgia",serif';
          ctx.textAlign = "center";
          ctx.fillText(name, x, bottomY - ls * 4 - 12);
          ctx.textAlign = "left";
        }
        const rendered = (chord.notes || []).map((note) => {
          const midi = (bundle.openMidis?.[note.s] ?? 40) + note.f;
          const { step } = spellMidi(midi);
          return { midi, step, y: stepToY(step, bottomY, ls) };
        }).sort((a, b) => a.y - b.y);
        if (!rendered.length) continue;
        const up = rendered[rendered.length - 1].step < 4;
        const stemNote = up ? rendered[rendered.length - 1] : rendered[0];
        const stemX = x + (up ? ls * 0.56 : -ls * 0.56);
        const stemTip = stemNote.y + (up ? -ls * 3.1 : ls * 3.1);
        const stemEnd = stemNote.y + (up ? -ls * 0.38 : ls * 0.38);
        for (const entry of rendered) {
          const acc = noteAccidental(entry.midi, ksAlter);
          if (acc) {
            ctx.fillStyle = "#1a1a1a";
            ctx.font = `bold ${ls * 1.35}px serif`;
            ctx.textAlign = "right";
            ctx.fillText(
              acc === "sharp" ? "\u266F" : acc === "flat" ? "\u266D" : "\u266E",
              x - ls * 0.65,
              entry.y + ls * 0.42
            );
            ctx.textAlign = "left";
          }
          ctx.save();
          ctx.translate(x, entry.y);
          ctx.rotate(-0.18);
          ctx.fillStyle = "#1a1a1a";
          ctx.beginPath();
          ctx.ellipse(0, 0, ls * 0.6, ls * 0.42, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(stemX, stemEnd);
        ctx.lineTo(stemX, stemTip);
        ctx.stroke();
      }
      const playX = xForDt(0);
      ctx.strokeStyle = "#b91c1c";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(playX, bottomY - ls * 4 - 22);
      ctx.lineTo(playX, bottomY + 6);
      ctx.stroke();
    }
    return {
      init(canvasElement, bundle) {
        canvas = canvasElement;
        ctx = canvasElement.getContext("2d");
        resize();
        window.addEventListener("resize", resize);
        keyAcc = NOTATION_KEY_SIGNATURES[bundle?.config?.key || "C"] ?? 0;
        isFlats = keyAcc < 0;
      },
      draw,
      resize,
      destroy() {
        window.removeEventListener("resize", resize);
        canvas = null;
        ctx = null;
      }
    };
  }

  // src/runtime-app.ts
  var appWindow = window;
  var PLUGIN_ID = "triad_lab";
  var KEY_ORDER2 = [
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
    "B"
  ];
  var state = {
    exercise: null,
    activeView: "highway2d",
    previewing: false,
    previewStartMs: 0,
    previewTime: 0,
    rafId: 0,
    presets: [],
    fallback3d: false,
    renderer: null,
    activeBundle: null,
    rendererKind: null,
    bundleExercise: null,
    loopA: null,
    loopB: null,
    lastPreviewTime: 0,
    loopCount: 0
  };
  function $(id) {
    return document.getElementById(id);
  }
  function inputValue(id, fallback = "") {
    return ($(id)?.value || fallback).toString();
  }
  function inputChecked(id) {
    return !!$(id)?.checked;
  }
  function setStatus(text) {
    const node = $("tl-status");
    if (node) node.textContent = text;
  }
  function setRenderNote(text) {
    const node = $("tl-render-note");
    if (node) node.textContent = text;
  }
  function setPreviewButtonText() {
    const btn = $("tl-preview");
    if (btn)
      btn.textContent = state.previewing ? "Stop Preview" : "Preview Scroll";
    const tp = $("tl-tp-play");
    if (tp) {
      tp.classList.toggle("is-playing", !!state.previewing);
      tp.textContent = state.previewing ? "\u25A0 Stop" : "\u25B6 Play";
    }
  }
  function fmtTime(seconds) {
    const s = Math.max(0, Number(seconds) || 0);
    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${min}:${String(sec).padStart(2, "0")}`;
  }
  function getPreviewDuration() {
    return Math.max(0, state.exercise?.chart?.duration || 0);
  }
  function getLoopBounds() {
    if (state.loopA == null || state.loopB == null) return null;
    const a = Math.min(state.loopA, state.loopB);
    const b = Math.max(state.loopA, state.loopB);
    if (Math.abs(a - b) <= 0.02) return null;
    return { a, b };
  }
  function syncTransportUI() {
    const duration = getPreviewDuration();
    const loop = getLoopBounds();
    const cur = $("tl-tp-time-cur");
    const dur = $("tl-tp-time-dur");
    const scrub = $("tl-tp-scrub");
    const loopRegion = $("tl-loop-region");
    const loopCount = $("tl-tp-loop-count");
    if (cur) cur.textContent = fmtTime(state.previewTime);
    if (dur) dur.textContent = fmtTime(duration);
    if (scrub) {
      scrub.max = String(duration || 0);
      scrub.value = String(
        Math.max(0, Math.min(duration || 0, state.previewTime))
      );
      scrub.disabled = !state.exercise;
    }
    $("tl-tp-loop-a")?.classList.toggle("active", state.loopA != null);
    $("tl-tp-loop-b")?.classList.toggle("active", state.loopB != null);
    if (loopCount) {
      loopCount.textContent = `Loops ${state.loopCount}`;
      loopCount.classList.toggle("is-live", state.loopCount > 0);
    }
    if (loopRegion) {
      if (!loop || !duration) {
        loopRegion.hidden = true;
      } else {
        const leftPct = loop.a / duration * 100;
        const widthPct = (loop.b - loop.a) / duration * 100;
        loopRegion.hidden = false;
        loopRegion.style.left = `${leftPct}%`;
        loopRegion.style.width = `${widthPct}%`;
      }
    }
    setPreviewButtonText();
  }
  function clearPreviewLoop() {
    state.loopA = null;
    state.loopB = null;
    state.loopCount = 0;
    syncTransportUI();
  }
  function stopRenderer() {
    if (state.renderer?.destroy) {
      try {
        state.renderer.destroy();
      } catch (_err) {
      }
    }
    state.renderer = null;
    state.activeBundle = null;
    state.rendererKind = null;
    state.bundleExercise = null;
  }
  function syncHighwaySettings(bundle) {
    if (!bundle) return;
    try {
      bundle.inverted = localStorage.getItem("invertHighway") === "true";
      bundle.lefty = localStorage.getItem("lefty") === "1";
      bundle.renderScale = parseFloat(localStorage.getItem("renderScale") || "1") || 1;
    } catch (_err) {
      bundle.inverted = false;
      bundle.lefty = false;
      bundle.renderScale = 1;
    }
  }
  function configureForm() {
    const keySel = $("tl-key");
    if (!keySel) return;
    keySel.innerHTML = KEY_ORDER2.map(
      (key) => `<option value="${key}">${key}</option>`
    ).join("");
    keySel.value = "C";
    const viewSel = $("tl-view");
    if (viewSel) viewSel.value = state.activeView;
    setPreviewButtonText();
  }
  function getSelectedQualities() {
    const checks = Array.from(
      document.querySelectorAll('#tl-qualities input[type="checkbox"]')
    );
    const selected = checks.filter((node) => node.checked).map((node) => node.value);
    return selected.length ? selected : ["maj"];
  }
  function populateInstrumentControls(cfg) {
    const instrument = cfg?.instrument === "bass" ? "bass" : "guitar";
    const instrumentSel = $("tl-instrument");
    const stringCountSel = $("tl-string-count");
    const tuningSel = $("tl-tuning");
    const stringSetSel = $("tl-stringset");
    if (instrumentSel) {
      instrumentSel.innerHTML = ["guitar", "bass"].map(
        (id) => `<option value="${id}">${id === "bass" ? "Bass" : "Guitar"}</option>`
      ).join("");
      instrumentSel.value = instrument;
    }
    const counts = availableStringCounts(instrument).filter(
      (count) => count >= 4
    );
    const preferredCount = counts.includes(Number(cfg?.stringCount)) ? Number(cfg?.stringCount) : instrument === "bass" ? 4 : 6;
    if (stringCountSel) {
      stringCountSel.innerHTML = counts.map((count) => `<option value="${count}">${count} strings</option>`).join("");
      stringCountSel.value = String(preferredCount);
    }
    const presets = availableTuningPresets(
      instrument,
      preferredCount
    );
    const tuning = Array.isArray(cfg?.tuning) ? cfg.tuning : [];
    const selectedPreset = presets.find((preset) => preset.id === cfg?.tuningPreset) || (tuning.length ? presets.find(
      (preset) => preset.tuning.length === tuning.length && preset.tuning.every(
        (value, index) => Number(value) === Number(tuning[index])
      )
    ) : null) || presets[0] || null;
    if (tuningSel) {
      tuningSel.innerHTML = presets.map((preset) => `<option value="${preset.id}">${preset.label}</option>`).join("");
      if (selectedPreset) tuningSel.value = selectedPreset.id;
    }
    if (stringSetSel) {
      const setOptions = stringSetOptions(preferredCount);
      stringSetSel.innerHTML = setOptions.map((opt) => `<option value="${opt.value}">${opt.label}</option>`).join("");
      stringSetSel.value = sanitizeStringSet(
        cfg?.stringSet || stringSetSel.value,
        preferredCount
      );
    }
  }
  function refreshInstrumentControls() {
    populateInstrumentControls(readConfig());
  }
  function readConfig() {
    const instrument = inputValue("tl-instrument", "guitar") === "bass" ? "bass" : "guitar";
    const stringCount = clamp(
      parseInt(
        inputValue("tl-string-count", instrument === "bass" ? "4" : "6"),
        10
      ),
      4,
      8
    );
    const tuningPreset = inputValue("tl-tuning", "standard");
    const setup = resolveStringSetup({ instrument, stringCount, tuningPreset });
    const stringSet = sanitizeStringSet(
      inputValue("tl-stringset"),
      setup.stringCount
    );
    return {
      lesson: inputValue("tl-lesson"),
      instrument: setup.instrument,
      stringCount: setup.stringCount,
      key: inputValue("tl-key", "C"),
      progression: inputValue("tl-progression"),
      stringSet,
      tuningPreset: setup.tuningPreset,
      bpm: clamp(parseInt(inputValue("tl-bpm", "92"), 10), 40, 220),
      bars: clamp(parseInt(inputValue("tl-bars", "8"), 10), 2, 24),
      startFret: clamp(parseInt(inputValue("tl-start-fret", "2"), 10), 0, 15),
      inversionMode: inputValue("tl-inversion", "cycle"),
      qualities: getSelectedQualities(),
      view: inputValue("tl-view", "highway2d"),
      audio: {
        notes: inputChecked("tl-audio-notes"),
        metronome: inputChecked("tl-audio-metronome"),
        harmony: inputChecked("tl-audio-harmony"),
        harmonyTone: inputValue("tl-audio-tone", "pad")
      },
      tuning: setup.tuning.slice(),
      openMidis: setup.openMidis.slice()
    };
  }
  function renderCurrent() {
    if (!state.exercise) {
      setStatus("Generate a drill to begin.");
      return;
    }
    state.fallback3d = false;
    const view = state.activeView;
    if (view === "notation") {
      return ensureRenderer("notation").then(() => {
        syncHighwaySettings(state.activeBundle);
        if (state.activeBundle)
          state.activeBundle.currentTime = state.previewTime;
        state.renderer?.draw?.(state.activeBundle);
        setStatus(
          `${state.exercise?.summary}
View: ${state.activeView}${state.fallback3d ? " (fallback active)" : ""}`
        );
        syncTransportUI();
      });
    }
    return ensureRenderer(view).then(() => {
      syncHighwaySettings(state.activeBundle);
      if (state.activeBundle) state.activeBundle.currentTime = state.previewTime;
      state.renderer?.draw?.(state.activeBundle);
      setStatus(
        `${state.exercise?.summary}
View: ${state.activeView}${state.fallback3d ? " (fallback active)" : ""}`
      );
      syncTransportUI();
    });
  }
  async function resolveRendererFactory(kind) {
    if (kind === "builtin_2d")
      return { factory: makeBuiltin2DRenderer, label: "2D Highway" };
    if (kind === "tab_2d")
      return { factory: makeBuiltin2DTabRenderer, label: "Tab" };
    if (kind === "notation_2d")
      return { factory: makeBuiltin2DNotationRenderer, label: "Notation" };
    return { factory: makeBuiltin2DRenderer, label: "2D Highway" };
  }
  async function ensureRenderer(view) {
    const kind = view === "tab" ? "tab_2d" : view === "notation" ? "notation_2d" : "builtin_2d";
    if (state.renderer && state.activeBundle && state.rendererKind === kind && state.bundleExercise === state.exercise)
      return;
    stopRenderer();
    if (!state.exercise) return;
    state.activeBundle = makeBundle(state.exercise);
    state.bundleExercise = state.exercise;
    const canvas = $("triadlab-canvas");
    const resolved = await resolveRendererFactory(kind);
    state.renderer = resolved.factory();
    state.rendererKind = kind;
    state.renderer?.init?.(canvas, state.activeBundle);
    state.renderer?.resize?.(
      Math.round(canvas?.clientWidth || canvas?.width || 0),
      Math.round(canvas?.clientHeight || canvas?.height || 0)
    );
    state.fallback3d = false;
    setRenderNote(resolved.label);
  }
  function seekPreview(nextTime) {
    if (!state.exercise) return;
    const duration = getPreviewDuration();
    state.previewTime = Math.max(0, Math.min(duration, Number(nextTime) || 0));
    if (state.previewing) {
      state.previewStartMs = performance.now() - state.previewTime * 1e3;
      state.lastPreviewTime = state.previewTime;
      stopAudio();
      if (state.activeBundle) {
        schedulePreviewAudio(
          state.activeBundle,
          state.previewTime,
          AUDIO_LOOKAHEAD_SECONDS,
          () => readConfig().audio,
          () => new AudioContext()
        );
      }
    }
    void renderCurrent();
    syncTransportUI();
  }
  function nudgePreviewBar(dir) {
    if (!state.exercise) return;
    const downbeats = (state.exercise.chart.beats || []).filter((beat) => (beat.measure || -1) >= 0).map((beat) => beat.time).sort((a, b) => a - b);
    const t = state.previewTime;
    const duration = getPreviewDuration();
    if (!downbeats.length) {
      seekPreview(t + dir * 2);
      return;
    }
    if (dir > 0) {
      const next = downbeats.find((beatTime) => beatTime > t + 0.05);
      seekPreview(next != null ? next : duration);
    } else {
      const prev = [...downbeats].reverse().find((beatTime) => beatTime < t - 0.05);
      seekPreview(prev != null ? prev : 0);
    }
  }
  function onTransportKey(e) {
    const root = $("triadlab-root");
    if (!root || !root.offsetParent) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = e.target?.tagName?.toLowerCase() || "";
    if (tag === "input" || tag === "textarea" || tag === "select" || e.target?.isContentEditable)
      return;
    switch (e.key) {
      case " ":
        e.preventDefault();
        togglePreview();
        break;
      case "ArrowLeft":
        e.preventDefault();
        nudgePreviewBar(-1);
        break;
      case "ArrowRight":
        e.preventDefault();
        nudgePreviewBar(1);
        break;
      case "[":
        e.preventDefault();
        state.loopA = state.previewTime;
        syncTransportUI();
        break;
      case "]":
        e.preventDefault();
        state.loopB = state.previewTime;
        syncTransportUI();
        break;
      case "\\":
        e.preventDefault();
        clearPreviewLoop();
        break;
      case "Home":
        e.preventDefault();
        seekPreview(0);
        break;
      default:
        break;
    }
  }
  async function generateDrill() {
    const cfg = readConfig();
    stopAudio();
    state.exercise = buildChart(cfg);
    state.activeView = cfg.view;
    state.previewTime = 0;
    state.lastPreviewTime = 0;
    state.loopCount = 0;
    state.loopA = null;
    state.loopB = null;
    syncViewButtons();
    await renderCurrent();
    syncTransportUI();
  }
  function stopPreview() {
    state.previewing = false;
    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = 0;
    }
    stopAudio();
    setPreviewButtonText();
    syncTransportUI();
  }
  function tickPreview() {
    if (!state.previewing || !state.exercise) return;
    const previous = state.lastPreviewTime;
    const elapsed = (performance.now() - state.previewStartMs) / 1e3;
    const duration = Math.max(1, getPreviewDuration());
    const loop = getLoopBounds();
    state.previewTime = loop ? elapsed < loop.a ? elapsed % duration : loop.a + (elapsed - loop.a) % Math.max(0.05, loop.b - loop.a) : elapsed % duration;
    if (state.previewTime + 0.05 < previous) {
      const restartAt = loop ? loop.a : 0;
      state.loopCount += 1;
      stopAudio();
      if (state.activeBundle) {
        schedulePreviewAudio(
          state.activeBundle,
          restartAt,
          AUDIO_LOOKAHEAD_SECONDS,
          () => readConfig().audio,
          () => new AudioContext()
        );
      }
    }
    state.lastPreviewTime = state.previewTime;
    void renderCurrent();
    syncTransportUI();
    state.rafId = requestAnimationFrame(tickPreview);
  }
  function togglePreview() {
    if (!state.exercise) return;
    if (state.previewing) {
      stopPreview();
      return;
    }
    state.previewing = true;
    state.loopCount = 0;
    state.previewStartMs = performance.now() - state.previewTime * 1e3;
    state.lastPreviewTime = state.previewTime;
    if (audioState.ctx?.state === "suspended")
      audioState.ctx.resume().catch(() => {
      });
    stopAudio();
    if (state.activeBundle) {
      schedulePreviewAudio(
        state.activeBundle,
        state.previewTime,
        AUDIO_LOOKAHEAD_SECONDS,
        () => readConfig().audio,
        () => new AudioContext()
      );
    }
    setPreviewButtonText();
    syncTransportUI();
    state.rafId = requestAnimationFrame(tickPreview);
  }
  function syncViewButtons() {
    Array.from(
      document.querySelectorAll(".triadlab-tabs button[data-view]")
    ).forEach((btn) => {
      btn.classList.toggle(
        "active",
        btn.getAttribute("data-view") === state.activeView
      );
    });
    const viewSel = $("tl-view");
    if (viewSel) viewSel.value = state.activeView;
  }
  function applyConfig(cfg) {
    if (!cfg || typeof cfg !== "object") return;
    const c = cfg;
    populateInstrumentControls(c);
    if (c.lesson)
      $("tl-lesson").value = c.lesson;
    if (c.key) $("tl-key").value = c.key;
    if (c.progression)
      $("tl-progression").value = c.progression;
    if (c.instrument)
      $("tl-instrument").value = c.instrument;
    if (Number.isFinite(c.stringCount))
      $("tl-string-count").value = String(
        c.stringCount
      );
    if (c.tuningPreset)
      $("tl-tuning").value = c.tuningPreset;
    if (c.stringSet)
      $("tl-stringset").value = c.stringSet;
    if (Number.isFinite(c.bpm))
      $("tl-bpm").value = String(c.bpm);
    if (Number.isFinite(c.bars))
      $("tl-bars").value = String(c.bars);
    if (Number.isFinite(c.startFret))
      $("tl-start-fret").value = String(
        c.startFret
      );
    if (c.inversionMode)
      $("tl-inversion").value = c.inversionMode;
    if (c.view) {
      state.activeView = c.view;
      $("tl-view").value = c.view;
    }
    if (c.audio) {
      const notes = $("tl-audio-notes");
      const metro = $("tl-audio-metronome");
      const harmony = $("tl-audio-harmony");
      const tone = $("tl-audio-tone");
      if (typeof c.audio.notes === "boolean" && notes)
        notes.checked = c.audio.notes;
      if (typeof c.audio.metronome === "boolean" && metro)
        metro.checked = c.audio.metronome;
      if (typeof c.audio.harmony === "boolean" && harmony)
        harmony.checked = c.audio.harmony;
      if (c.audio.harmonyTone && tone) tone.value = c.audio.harmonyTone;
    }
    const selected = Array.isArray(c.qualities) ? new Set(c.qualities) : null;
    Array.from(
      document.querySelectorAll('#tl-qualities input[type="checkbox"]')
    ).forEach((el) => {
      el.checked = !selected || selected.has(el.value);
    });
    syncViewButtons();
  }
  async function loadPresets() {
    try {
      const response = await fetch(`/api/plugins/${PLUGIN_ID}/presets`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      state.presets = Array.isArray(data.presets) ? data.presets : [];
    } catch (_err) {
      state.presets = [];
    }
    const sel = $("tl-presets");
    if (!sel) return;
    sel.innerHTML = '<option value="">Saved presets...</option>';
    for (const preset of state.presets) {
      const opt = document.createElement("option");
      opt.value = preset.id;
      opt.textContent = preset.name;
      sel.appendChild(opt);
    }
  }
  async function savePreset() {
    const cfg = readConfig();
    const defaultName = `Triad ${cfg.key} ${cfg.lesson} ${cfg.progression}`;
    const name = window.prompt("Preset name:", defaultName);
    if (!name) return;
    const payload = {
      id: `${slugify(name)}-${Date.now().toString(36)}`,
      name,
      kind: "triad_drill",
      config: cfg
    };
    const response = await fetch(`/api/plugins/${PLUGIN_ID}/presets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await loadPresets();
  }
  async function deletePreset() {
    const id = $("tl-presets")?.value;
    if (!id) return;
    if (!window.confirm("Delete selected preset?")) return;
    const response = await fetch(
      `/api/plugins/${PLUGIN_ID}/presets/${encodeURIComponent(id)}`,
      {
        method: "DELETE"
      }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await loadPresets();
  }
  async function applySelectedPreset() {
    const id = $("tl-presets")?.value;
    if (!id) return;
    const preset = state.presets.find((entry) => entry.id === id);
    if (!preset) return;
    applyConfig(preset.config);
    await generateDrill();
  }
  function bind() {
    $("tl-generate")?.addEventListener("click", () => void generateDrill());
    $("tl-preview")?.addEventListener("click", () => togglePreview());
    $("tl-tp-play")?.addEventListener("click", () => togglePreview());
    $("tl-tp-start")?.addEventListener("click", () => seekPreview(0));
    $("tl-tp-back")?.addEventListener("click", () => nudgePreviewBar(-1));
    $("tl-tp-fwd")?.addEventListener("click", () => nudgePreviewBar(1));
    $("tl-tp-loop-a")?.addEventListener("click", () => {
      state.loopA = state.previewTime;
      syncTransportUI();
    });
    $("tl-tp-loop-b")?.addEventListener("click", () => {
      state.loopB = state.previewTime;
      syncTransportUI();
    });
    $("tl-tp-loop-clear")?.addEventListener("click", () => clearPreviewLoop());
    $("tl-tp-scrub")?.addEventListener(
      "input",
      () => seekPreview(Number($("tl-tp-scrub").value))
    );
    [
      "tl-audio-notes",
      "tl-audio-metronome",
      "tl-audio-harmony",
      "tl-audio-tone"
    ].forEach((id) => {
      $(id)?.addEventListener("change", () => {
        if (state.exercise) {
          state.exercise.session.audio = readConfig().audio;
          if (state.activeBundle)
            state.activeBundle.config.audio = state.exercise.session.audio;
        }
        if (state.previewing && state.activeBundle) {
          stopAudio();
          schedulePreviewAudio(
            state.activeBundle,
            state.previewTime,
            AUDIO_LOOKAHEAD_SECONDS,
            () => readConfig().audio,
            () => new AudioContext()
          );
        }
        void renderCurrent();
      });
    });
    $("tl-play-host")?.addEventListener("click", () => {
      void playInHost();
    });
    $("tl-save-preset")?.addEventListener("click", async () => {
      try {
        await savePreset();
      } catch (err) {
        setStatus(
          `${$("tl-status")?.textContent || ""}

Preset save failed: ${err.message || err}`
        );
      }
    });
    $("tl-delete-preset")?.addEventListener("click", async () => {
      try {
        await deletePreset();
      } catch (err) {
        setStatus(
          `${$("tl-status")?.textContent || ""}

Preset delete failed: ${err.message || err}`
        );
      }
    });
    $("tl-presets")?.addEventListener("change", () => {
      void applySelectedPreset();
    });
    $("tl-view")?.addEventListener("change", () => {
      state.activeView = $("tl-view").value;
      syncViewButtons();
      void renderCurrent();
    });
    Array.from(
      document.querySelectorAll(".triadlab-tabs button[data-view]")
    ).forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeView = btn.getAttribute("data-view") || "highway2d";
        syncViewButtons();
        void renderCurrent();
      });
    });
    const regenIds = [
      "tl-instrument",
      "tl-string-count",
      "tl-tuning",
      "tl-lesson",
      "tl-key",
      "tl-progression",
      "tl-stringset",
      "tl-inversion",
      "tl-bpm",
      "tl-bars",
      "tl-start-fret"
    ];
    regenIds.forEach((id) => {
      $(id)?.addEventListener("change", () => {
        if (id === "tl-instrument" || id === "tl-string-count")
          refreshInstrumentControls();
        if (state.exercise) void generateDrill();
      });
    });
    Array.from(
      document.querySelectorAll('#tl-qualities input[type="checkbox"]')
    ).forEach((el) => {
      el.addEventListener("change", () => {
        if (state.exercise) void generateDrill();
      });
    });
    window.addEventListener("resize", () => {
      if (state.renderer?.resize) {
        try {
          const canvas = $("triadlab-canvas");
          if (canvas) {
            state.renderer.resize(
              Math.round(canvas.clientWidth || canvas.width),
              Math.round(canvas.clientHeight || canvas.height)
            );
          }
        } catch (_err) {
        }
      }
      void renderCurrent();
      syncTransportUI();
    });
    if (!appWindow.__triadLabTransportKeysBound) {
      appWindow.__triadLabTransportKeysBound = true;
      document.addEventListener("keydown", onTransportKey);
    }
  }
  async function playInHost() {
    try {
      if (!state.exercise) await generateDrill();
      const response = await fetch(`/api/plugins/${PLUGIN_ID}/temp-sloppak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exercise: state.exercise })
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}`);
      }
      const data = await response.json();
      try {
        if (state.activeView === "highway3d" && typeof appWindow.slopsmithViz_highway_3d === "function") {
          localStorage.setItem("vizSelection", "highway_3d");
        } else {
          localStorage.setItem("vizSelection", "default");
        }
      } catch (_e) {
      }
      if (typeof appWindow.playSong === "function") {
        await appWindow.playSong(data.filename, 0);
      } else {
        throw new Error("window.playSong is unavailable.");
      }
    } catch (err) {
      setStatus(
        `${$("tl-status")?.textContent || ""}

Play failed: ${err.message || err}`
      );
    }
  }
  async function boot() {
    if (!$("triadlab-root")) return;
    configureForm();
    populateInstrumentControls({});
    bind();
    await loadPresets();
    await generateDrill();
    syncTransportUI();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => void boot(), {
      once: true
    });
  } else {
    void boot();
  }
})();
