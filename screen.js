(function () {
  "use strict";

  const BOOT_KEY = "__triadLabBooted";
  if (window[BOOT_KEY]) return;
  window[BOOT_KEY] = true;

  const PLUGIN_ID = "triad_lab";
  const KEY_ORDER = [
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
  ];
  const KEY_TO_PC = {
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

  const QUALITY_INTERVALS = {
    maj: [0, 4, 7],
    min: [0, 3, 7],
    dim: [0, 3, 6],
    aug: [0, 4, 8],
  };

  const QUALITY_LABEL = {
    maj: "Maj",
    min: "Min",
    dim: "Dim",
    aug: "Aug",
  };

  const STRING_SETUPS = {
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

  const OPEN_MIDIS = STRING_SETUPS.guitar_6_standard.openMidis.slice();

  const TUNING_PRESETS = {
    guitar_6: [
      { id: "standard", label: "Standard (E A D G B E)", tuning: [0, 0, 0, 0, 0, 0], setup: "guitar_6_standard" },
      { id: "drop_d", label: "Drop D (D A D G B E)", tuning: [-2, 0, 0, 0, 0, 0], setup: "guitar_6_drop_d" },
      { id: "eb_standard", label: "Eb Standard (down 1/2 step)", tuning: [-1, -1, -1, -1, -1, -1] },
      { id: "d_standard", label: "D Standard (down 1 step)", tuning: [-2, -2, -2, -2, -2, -2] },
      { id: "dadgad", label: "DADGAD", tuning: [-2, 0, 0, 0, -2, -2] },
      { id: "open_g", label: "Open G (D G D G B D)", tuning: [-2, -2, 0, 0, 0, -2] },
      { id: "open_d", label: "Open D (D A D F# A D)", tuning: [-2, 0, 0, -1, -2, -2] },
    ],
    guitar_7: [
      { id: "standard", label: "Standard (B E A D G B E)", tuning: [0, 0, 0, 0, 0, 0, 0], setup: "guitar_7_standard" },
      { id: "drop_a", label: "Drop A (A E A D G B E)", tuning: [-2, 0, 0, 0, 0, 0, 0] },
    ],
    guitar_8: [
      { id: "standard", label: "Standard (F# B E A D G B E)", tuning: [2, 0, 0, 0, 0, 0, 0, 0], setup: "guitar_8_standard" },
      { id: "drop_e", label: "Drop E (E B E A D G B E)", tuning: [0, 0, 0, 0, 0, 0, 0, 0] },
    ],
    bass_4: [
      { id: "standard", label: "Standard (E A D G)", tuning: [0, 0, 0, 0], setup: "bass_4_standard" },
      { id: "drop_d", label: "Drop D (D A D G)", tuning: [-2, 0, 0, 0] },
      { id: "eb_standard", label: "Eb Standard (down 1/2 step)", tuning: [-1, -1, -1, -1] },
      { id: "bead", label: "BEAD (low B)", tuning: [-5, -5, -5, -5] },
    ],
    bass_5: [
      { id: "standard", label: "Standard low B (B E A D G)", tuning: [0, 0, 0, 0, 0], setup: "bass_5_standard" },
      { id: "standard_hc", label: "Standard high C (E A D G C)", tuning: [5, 0, 0, 0, 0] },
      { id: "drop_a", label: "Drop A (A E A D G)", tuning: [-2, 0, 0, 0, 0] },
    ],
    bass_6: [
      { id: "standard", label: "Standard (B E A D G C)", tuning: [0, 0, 0, 0, 0, 0], setup: "bass_6_standard" },
    ],
  };

  const STRING_COLORS = [
    "#ef4444",
    "#f97316",
    "#facc15",
    "#22c55e",
    "#06b6d4",
    "#60a5fa",
    "#a855f7",
    "#ec4899",
  ];
  const NOTATION_KEY_SIGNATURES = {
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
  const AUDIO_LOOKAHEAD_SECONDS = 0.2;

  let audioCtx = null;
  let audioNodes = [];

  const state = {
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
    loopCount: 0,
  };

  function $(id) {
    return document.getElementById(id);
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function choose(arr, idx) {
    if (!arr.length) return null;
    return arr[((idx % arr.length) + arr.length) % arr.length];
  }

  function baseOpenMidisForInstrument(instrument, stringCount) {
    const bases = {
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

  function openMidisFromTuning(instrument, stringCount, tuning) {
    const base = baseOpenMidisForInstrument(instrument, stringCount);
    return base.map((midi, index) => midi + (Number(tuning?.[index]) || 0));
  }

  function tuningKey(instrument, stringCount) {
    return `${instrument}_${stringCount}`;
  }

  function availableStringCounts(instrument) {
    return Object.keys(TUNING_PRESETS)
      .filter((key) => key.startsWith(`${instrument}_`))
      .map((key) => parseInt(key.split("_")[1], 10))
      .filter((count) => Number.isFinite(count))
      .sort((a, b) => a - b);
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
    const desiredCount = counts.includes(Number(cfg?.stringCount))
      ? Number(cfg.stringCount)
      : (cfg?.tuning && Array.isArray(cfg.tuning) && counts.includes(cfg.tuning.length)
        ? cfg.tuning.length
        : fallbackCount);
    const presets = availableTuningPresets(instrument, desiredCount);
    const tuningPreset = presets.find((preset) => {
      if (cfg?.tuningPreset && preset.id === cfg.tuningPreset) return true;
      if (!Array.isArray(cfg?.tuning)) return false;
      if (cfg.tuning.length !== preset.tuning.length) return false;
      return cfg.tuning.every((value, index) => Number(value) === Number(preset.tuning[index]));
    }) || defaultStringSetup(instrument, desiredCount) || null;
    const tuning = tuningPreset?.tuning?.slice() || new Array(desiredCount).fill(0);
    const setup = tuningPreset?.setup && STRING_SETUPS[tuningPreset.setup]
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
      instrument,
      stringCount: setup.stringCount || desiredCount,
      tuningPreset: tuningPreset?.id || setup.tuningPreset || "standard",
      setup,
      openMidis: (setup.openMidis || openMidisFromTuning(instrument, desiredCount, tuning)).slice(),
      tuning: (setup.tuning || tuning).slice(),
    };
  }

  function stringSetOptions(stringCount) {
    const opts = [];
    for (let start = 0; start <= Math.max(0, stringCount - 3); start += 1) {
      const labels = [stringCount - start, stringCount - start - 1, stringCount - start - 2];
      opts.push({
        value: labels.join(""),
        label: labels.join("-") + "",
      });
    }
    return opts;
  }

  function sanitizeStringSet(stringSet, stringCount) {
    const valid = new Set(stringSetOptions(stringCount).map((opt) => opt.value));
    if (valid.has(stringSet)) return stringSet;
    const fallback = stringSetOptions(stringCount)[0];
    return fallback ? fallback.value : "";
  }

  function stringSetToIndices(stringSet, stringCount) {
    const digits = String(stringSet || "")
      .split("")
      .map((digit) => parseInt(digit, 10))
      .filter((digit) => Number.isFinite(digit));
    const indices = digits
      .map((digit) => stringCount - digit)
      .filter((idx) => idx >= 0 && idx < stringCount);
    return indices.length ? indices.sort((a, b) => a - b) : [0, 1, 2].filter((idx) => idx < stringCount);
  }

  function slugify(text) {
    return (
      String(text || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "triad-lab"
    );
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
      tp.textContent = state.previewing ? "■ Stop" : "▶ Play";
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
        Math.max(0, Math.min(duration || 0, state.previewTime)),
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
        const leftPct = (loop.a / duration) * 100;
        const widthPct = ((loop.b - loop.a) / duration) * 100;
        loopRegion.hidden = false;
        loopRegion.style.left = `${leftPct}%`;
        loopRegion.style.width = `${widthPct}%`;
      }
    }

    setPreviewButtonText();
  }

  function seekPreview(nextTime) {
    if (!state.exercise) return;
    const duration = getPreviewDuration();
    state.previewTime = Math.max(0, Math.min(duration, Number(nextTime) || 0));
    if (state.previewing) {
      state.previewStartMs = performance.now() - state.previewTime * 1000;
      state.lastPreviewTime = state.previewTime;
      stopAudio();
      if (state.activeBundle) {
        schedulePreviewAudio(
          state.activeBundle,
          state.previewTime,
          AUDIO_LOOKAHEAD_SECONDS,
        );
      }
    }
    void renderCurrent();
    syncTransportUI();
  }

  function nudgePreviewBar(dir) {
    if (!state.exercise) return;
    const downbeats = (state.exercise.chart.beats || [])
      .filter((b) => (b.measure || -1) >= 0)
      .map((b) => b.time)
      .sort((a, b) => a - b);

    const t = state.previewTime;
    const duration = getPreviewDuration();
    if (!downbeats.length) {
      seekPreview(t + dir * 2);
      return;
    }
    if (dir > 0) {
      const next = downbeats.find((d) => d > t + 0.05);
      seekPreview(next != null ? next : duration);
    } else {
      const prev = [...downbeats].reverse().find((d) => d < t - 0.05);
      seekPreview(prev != null ? prev : 0);
    }
  }

  function clearPreviewLoop() {
    state.loopA = null;
    state.loopB = null;
    state.loopCount = 0;
    syncTransportUI();
  }

  function onTransportKey(e) {
    const root = $("triadlab-root");
    if (!root || !root.offsetParent) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target?.tagName || "").toLowerCase();
    if (
      tag === "input" ||
      tag === "textarea" ||
      tag === "select" ||
      e.target?.isContentEditable
    )
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

  function readHighwayInverted() {
    try {
      return localStorage.getItem("invertHighway") === "true";
    } catch (_err) {
      return false;
    }
  }

  function readLefty() {
    try {
      return localStorage.getItem("lefty") === "1";
    } catch (_err) {
      return false;
    }
  }

  function readRenderScale() {
    try {
      const value = parseFloat(localStorage.getItem("renderScale") || "1");
      return Number.isFinite(value) && value > 0 ? value : 1;
    } catch (_err) {
      return 1;
    }
  }

  function syncHighwaySettings(bundle) {
    if (!bundle) return;
    bundle.inverted = readHighwayInverted();
    bundle.lefty = readLefty();
    bundle.renderScale = readRenderScale();
  }

  function configureForm() {
    const keySel = $("tl-key");
    if (!keySel) return;
    keySel.innerHTML = KEY_ORDER.map(
      (k) => `<option value="${k}">${k}</option>`,
    ).join("");
    keySel.value = "C";
    $("tl-view").value = state.activeView;
    setPreviewButtonText();
  }

  function getSelectedQualities() {
    const checks = Array.from(
      document.querySelectorAll('#tl-qualities input[type="checkbox"]'),
    );
    const selected = checks.filter((n) => n.checked).map((n) => n.value);
    return selected.length ? selected : ["maj"];
  }

  function readConfig() {
    const instrument = $("tl-instrument").value || "guitar";
    const stringCount = clamp(parseInt($("tl-string-count").value || (instrument === "bass" ? "4" : "6"), 10), 4, 8);
    const tuningPreset = $("tl-tuning").value || "standard";
    const setup = resolveStringSetup({
      instrument,
      stringCount,
      tuningPreset,
    });
    const stringSet = sanitizeStringSet($("tl-stringset").value, setup.stringCount);
    return {
      lesson: $("tl-lesson").value,
      instrument: setup.instrument,
      stringCount: setup.stringCount,
      key: $("tl-key").value,
      progression: $("tl-progression").value,
      stringSet,
      tuningPreset: setup.tuningPreset,
      bpm: clamp(parseInt($("tl-bpm").value || "92", 10), 40, 220),
      bars: clamp(parseInt($("tl-bars").value || "8", 10), 2, 24),
      startFret: clamp(parseInt($("tl-start-fret").value || "2", 10), 0, 15),
      inversionMode: $("tl-inversion").value,
      qualities: getSelectedQualities(),
      view: $("tl-view").value,
      audio: {
        notes: !!$("tl-audio-notes")?.checked,
        metronome: !!$("tl-audio-metronome")?.checked,
        harmony: !!$("tl-audio-harmony")?.checked,
        harmonyTone: $("tl-audio-tone")?.value || "pad",
      },
      tuning: setup.tuning.slice(),
      openMidis: setup.openMidis.slice(),
    };
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
      7: "dim",
    };
    return majorDiatonic[degree] || "maj";
  }

  function degreeToPc(keyPc, degree) {
    const offsets = { 1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11 };
    return (keyPc + (offsets[degree] || 0)) % 12;
  }

  function pickStringSet(cfg, barIndex) {
    const available = stringSetOptions(cfg.stringCount || 6).map((opt) => opt.value);
    if (cfg.lesson === "stringset") {
      const cycle = available.length ? available : ["654", "543", "432", "321"];
      return choose(cycle, barIndex);
    }
    return sanitizeStringSet(cfg.stringSet, cfg.stringCount || 6);
  }

  function pickQuality(cfg, degree, barIndex) {
    if (cfg.lesson === "progression" || cfg.progression !== "single")
      return qualityForDegree(degree);
    return choose(cfg.qualities, barIndex);
  }

  function fretForPitchClass(openMidi, targetPc, minFret, maxFret, centerFret) {
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

  function noteName(pc) {
    return KEY_ORDER[((pc % 12) + 12) % 12];
  }

  function notationKeySignature(key) {
    return NOTATION_KEY_SIGNATURES[key] ?? 0;
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
      const degree = choose(progression, bar);
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
      const chordNotes = [];
      const allFrets = new Array(stringCount).fill(-1);

      for (let i = 0; i < strings.length; i += 1) {
        const s = strings[i];
        const pc = triadPcOrder[i % 3];
        const fret = fretForPitchClass(openMidis[s], pc, 0, 17, centerFret);
        allFrets[s] = fret;

        const note = {
          t,
          s,
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
        chordNotes.push({ ...note, t: undefined });
        delete chordNotes[chordNotes.length - 1].t;
      }

      const chordName = `${noteName(rootPc)}${QUALITY_LABEL[quality]} ${["R", "1st", "2nd"][inversion]}`;
      chordTemplates.push({
        id: templateId,
        name: chordName,
        displayName: chordName,
        frets: allFrets,
        fingers: new Array(stringCount).fill(-1),
        arp: false,
      });
      chords.push({ t, id: templateId, hd: false, notes: chordNotes });
      templateId += 1;

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
        anchors: [{ time: 0, fret: cfg.startFret, width: 4 }],
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

  function canvasCtx() {
    const canvas = $("triadlab-canvas");
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, Math.floor(rect.width * dpr));
    const h = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, width: rect.width, height: rect.height };
  }

  function stringLabelForMidi(midi) {
    const pc = ((midi % 12) + 12) % 12;
    return KEY_ORDER[pc] || "?";
  }

  function makeBundle(exercise) {
    const chart = exercise.chart;
    const openMidis = exercise.session?.openMidis?.length
      ? exercise.session.openMidis
      : resolveStringSetup(exercise.session || {}).openMidis;
    const backingEvents = buildBackingEventsFromChart(chart, chart.duration, openMidis);
    const bundle = {
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
      tuning: exercise.session?.tuning?.slice() || new Array(openMidis.length || 6).fill(0),
      openMidis: openMidis.slice(),
      capo: 0,
      lyrics: [],
      toneChanges: [],
      toneBase: "",
      mastery: 1,
      hasPhraseData: false,
      inverted: readHighwayInverted(),
      lefty: readLefty(),
      renderScale: readRenderScale(),
      lyricsVisible: false,
      project: null,
      fretX: null,
      getNoteState: function () {
        return null;
      },
      getNoteStateProvider: function () {
        return null;
      },
    };
    syncHighwaySettings(bundle);
    return bundle;
  }

  function buildBackingEventsFromChart(chart, duration, openMidis) {
    const chords = Array.isArray(chart?.chords)
      ? [...chart.chords].sort((a, b) => a.t - b.t)
      : [];
    const templates = chart?.chordTemplates || [];
    const tuning = Array.isArray(openMidis) && openMidis.length ? openMidis : resolveStringSetup({}).openMidis;
    const out = [];
    for (let i = 0; i < chords.length; i += 1) {
      const ch = chords[i];
      const next = chords[i + 1];
      const start = Number(ch.t || 0);
      const end = Number(next ? next.t : duration || start + 1);
      if (end <= start) continue;
      const name =
        templates[ch.id]?.displayName || templates[ch.id]?.name || "Chord";
      const midis = [];
      for (const n of ch.notes || []) {
        if (n.mt || n.f < 0 || n.s < 0 || n.s >= tuning.length) continue;
        midis.push(tuning[n.s] + n.f);
      }
      const uniq = [...new Set(midis)].sort((a, b) => a - b);
      if (!uniq.length) continue;
      out.push({ t: start, end, name, midis: uniq });
    }
    return out;
  }

  function stopAudio() {
    for (const n of audioNodes) {
      try {
        n.stop && n.stop(0);
      } catch (_err) {
        // Ignore already-stopped nodes.
      }
      try {
        n.disconnect && n.disconnect();
      } catch (_err) {
        // Ignore disconnect errors.
      }
    }
    audioNodes = [];
  }

  function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function bendSemitones(bn) {
    const v = Number(bn) || 0;
    if (v === 0.5) return 1;
    if (v === 1) return 2;
    if (v === 1.5) return 3;
    if (v === 2) return 4;
    return v * 2;
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
    audioNodes.push(osc1, osc2, preGain, filter, gain);
  }

  function scheduleHarmonyPad(ctx, when, midis, dur, tone) {
    if (!midis.length) return;
    const selectedTone = tone || "pad";

    if (selectedTone === "organ") {
      const RATIOS = [1, 2, 3, 4, 5, 6, 8];
      const VOLS = [0.8, 0.5, 0.35, 0.25, 0.18, 0.12, 0.08];
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.13 / Math.max(1, midis.length), when);
      master.connect(ctx.destination);
      audioNodes.push(master);
      midis.slice(0, 4).forEach((midi) => {
        RATIOS.forEach((ratio, ri) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(midiToFreq(midi) * ratio, when);
          g.gain.setValueAtTime(VOLS[ri], when);
          osc.connect(g);
          g.connect(master);
          osc.start(when);
          osc.stop(when + dur);
          audioNodes.push(osc, g);
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
      audioNodes.push(master);
      midis.slice(0, 4).forEach((midi) => {
        const osc = ctx.createOscillator();
        const bell = ctx.createOscillator();
        const g = ctx.createGain();
        const gb = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(midiToFreq(midi), when);
        bell.type = "sine";
        bell.frequency.setValueAtTime(midiToFreq(midi) * 2, when);
        g.gain.setValueAtTime(0.65, when);
        gb.gain.setValueAtTime(0.09, when);
        osc.connect(g);
        g.connect(master);
        bell.connect(gb);
        gb.connect(master);
        osc.start(when);
        osc.stop(when + dur + 0.05);
        bell.start(when);
        bell.stop(when + dur + 0.05);
        audioNodes.push(osc, bell, g, gb);
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
    master.gain.linearRampToValueAtTime(
      0.18,
      when + Math.max(0.08, dur - 0.16),
    );
    master.gain.linearRampToValueAtTime(0.0001, when + dur);
    filter.connect(master);
    master.connect(ctx.destination);
    audioNodes.push(filter, master);

    midis.slice(0, 5).forEach((midi, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = i === 0 ? "triangle" : "sawtooth";
      osc.frequency.setValueAtTime(midiToFreq(midi), when);
      osc.detune.setValueAtTime((i - 2) * 3, when);
      g.gain.setValueAtTime(i === 0 ? 0.48 : 0.22, when);
      osc.connect(g);
      g.connect(filter);
      osc.start(when);
      osc.stop(when + dur + 0.05);
      audioNodes.push(osc, g);
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
    audioNodes.push(osc, filter, gain);
  }

  function schedulePreviewAudio(bundle, fromTime, delaySeconds) {
    const audio = bundle?.config?.audio || readConfig().audio;
    if (!audio.notes && !audio.metronome && !audio.harmony) return;
    audioCtx =
      audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    const ctx = audioCtx;
    const base =
      ctx.currentTime +
      (Number.isFinite(delaySeconds) ? delaySeconds : AUDIO_LOOKAHEAD_SECONDS);
    const startFrom = Math.max(0, Number(fromTime) || 0);
    const duration = bundle?.songInfo?.duration || 0;
    const opens = bundle?.openMidis?.length ? bundle.openMidis : OPEN_MIDIS;

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
      for (const n of bundle.notes || []) {
        if (n.t < startFrom || n.t > duration + 0.1) continue;
        if (n.s < 0 || n.s >= opens.length || n.f < 0) continue;
        schedulePluckedString(
          ctx,
          base + (n.t - startFrom),
          midiToFreq(opens[n.s] + n.f),
          Math.max(0.1, Math.min(0.85, n.sus || 0.24)),
          audio.harmony ? 0.9 : 1.25,
          bendSemitones(n.bn),
        );
      }
    }

    if (audio.metronome) {
      for (const b of bundle.beats || []) {
        if (b.time < startFrom || b.time > duration + 0.1) continue;
        scheduleClick(ctx, base + (b.time - startFrom), (b.measure || -1) >= 0);
      }
    }
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
      const r = canvas.parentElement.getBoundingClientRect();
      W = Math.max(640, Math.round(r.width || 1280));
      H = Math.max(420, Math.round(r.height || 720));
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
      return (
        LEFT_PAD +
        ((dt + BEHIND) / (AHEAD + BEHIND)) * (W - LEFT_PAD - RIGHT_PAD)
      );
    }

    function drawBackground() {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#08111f");
      grad.addColorStop(1, "#050711");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    function drawAnchorZones(bundle, now) {
      const anchors = bundle.anchors || [];
      for (let i = 0; i < anchors.length; i += 1) {
        const a = anchors[i];
        const next = anchors[i + 1];
        const aStart = a.time;
        const aEnd = next ? next.time : bundle.songInfo?.duration || aStart + 1;
        if (aEnd < now - BEHIND || aStart > now + AHEAD) continue;
        const x1 = xForDt(Math.max(-BEHIND, aStart - now));
        const x2 = xForDt(Math.min(AHEAD, aEnd - now));
        ctx.fillStyle = "rgba(96,165,250,0.04)";
        ctx.fillRect(
          x1,
          TOP_PAD - 6,
          Math.max(2, x2 - x1),
          H - TOP_PAD - BOTTOM_PAD + 12,
        );
      }
    }

    function drawStringLanes(nStr, inverted, openMidis) {
      ctx.lineWidth = 1;
      for (let s = 0; s < nStr; s += 1) {
        const y = laneY(s, nStr, inverted);
        ctx.strokeStyle = "rgba(148,163,184,0.25)";
        ctx.beginPath();
        ctx.moveTo(LEFT_PAD - 4, y);
        ctx.lineTo(W - RIGHT_PAD, y);
        ctx.stroke();
        const col = STRING_COLORS[s] || "#94a3b8";
        ctx.fillStyle = col;
        ctx.font = "700 13px system-ui";
        const label = openMidis
          ? stringLabelForMidi(openMidis[s])
          : `S${s + 1}`;
        const display = s === nStr - 1 && label === "E" ? "e" : label;
        ctx.fillText(display, 14, y + 5);
      }
    }

    function drawBeatsAndPlayhead(bundle, now) {
      for (const b of bundle.beats || []) {
        const dt = b.time - now;
        if (dt < -BEHIND || dt > AHEAD) continue;
        const x = xForDt(dt);
        ctx.strokeStyle =
          b.measure >= 0 ? "rgba(96,165,250,0.55)" : "rgba(148,163,184,0.18)";
        ctx.lineWidth = b.measure >= 0 ? 1.4 : 1;
        ctx.beginPath();
        ctx.moveTo(x, TOP_PAD - 24);
        ctx.lineTo(x, H - BOTTOM_PAD + 6);
        ctx.stroke();
        if (b.measure >= 0) {
          ctx.fillStyle = "#93c5fd";
          ctx.font = "11px system-ui";
          ctx.fillText(String(b.measure), x + 4, TOP_PAD - 30);
        }
      }
      const playX = xForDt(0);
      ctx.strokeStyle = "#f8fafc";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playX, TOP_PAD - 36);
      ctx.lineTo(playX, H - BOTTOM_PAD + 6);
      ctx.stroke();
      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      ctx.moveTo(playX - 6, TOP_PAD - 38);
      ctx.lineTo(playX + 6, TOP_PAD - 38);
      ctx.lineTo(playX, TOP_PAD - 30);
      ctx.closePath();
      ctx.fill();
    }

    function drawBackingChords(bundle, now) {
      for (const ev of bundle.backingEvents || []) {
        const dt = ev.t - now;
        if (dt < -BEHIND || dt > AHEAD) continue;
        const x = xForDt(dt);
        ctx.fillStyle = "rgba(250,204,21,0.12)";
        ctx.fillRect(x - 42, 22, 84, 26);
        ctx.strokeStyle = "rgba(250,204,21,0.45)";
        ctx.strokeRect(x - 42, 22, 84, 26);
        ctx.fillStyle = "#fde68a";
        ctx.font = "700 12px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(ev.name, x, 39);
        ctx.textAlign = "left";
      }
    }

    function drawChordTiles(bundle, now) {
      for (const ch of bundle.chords || []) {
        const dt = ch.t - now;
        if (dt < -BEHIND || dt > AHEAD) continue;
        const x = xForDt(dt);
        const name =
          bundle.chordTemplates?.[ch.id]?.displayName ||
          bundle.chordTemplates?.[ch.id]?.name ||
          "";
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
    }

    function drawSectionMarkers(bundle, now) {
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
        ctx.fillStyle = "#fbcfe8";
        ctx.font = "700 10px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(sec.name || "·", x, H - BOTTOM_PAD + 36);
        ctx.textAlign = "left";
      }
    }

    function techniqueGlyph(n) {
      if (n.ho) return "h";
      if (n.po) return "p";
      if (n.hm) return "◇";
      if (n.pm) return "PM";
      if (n.mt) return "x";
      if (n.tr) return "~~";
      if (n.vb) return "~";
      if (n.tp) return "T";
      if ((n.sl || -1) >= 0) return "/";
      if ((n.bn || 0) > 0) return `b${n.bn}`;
      return "";
    }

    function drawNotes(bundle, now, nStr, inverted) {
      for (const n of bundle.notes || []) {
        const dt = n.t - now;
        if (dt < -BEHIND || dt > AHEAD) continue;
        const x = xForDt(dt);
        const y = laneY(n.s, nStr, inverted);
        const col = STRING_COLORS[n.s] || "#94a3b8";

        if ((n.sus || 0) > 0) {
          const x2 = xForDt(dt + n.sus);
          ctx.strokeStyle = col;
          ctx.globalAlpha = 0.4;
          ctx.lineWidth = 9;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(Math.min(W - RIGHT_PAD, x2), y);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        if (n.ac) {
          ctx.fillStyle = col;
          ctx.globalAlpha = 0.18;
          ctx.beginPath();
          ctx.arc(x, y, 22, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        if (n.mt) {
          ctx.strokeStyle = col;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x - 10, y - 10);
          ctx.lineTo(x + 10, y + 10);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x + 10, y - 10);
          ctx.lineTo(x - 10, y + 10);
          ctx.stroke();
        } else {
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.roundRect(x - 17, y - 13, 34, 26, 7);
          ctx.fill();
          ctx.strokeStyle = n.ac ? "#f8fafc" : "rgba(248,250,252,0.5)";
          ctx.lineWidth = n.ac ? 3 : 1.2;
          ctx.stroke();
          ctx.fillStyle = "#020617";
          ctx.font = "800 14px system-ui";
          ctx.textAlign = "center";
          ctx.fillText(String(n.f), x, y + 5);
        }

        if (n.pm) {
          ctx.strokeStyle = "rgba(248,250,252,0.6)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x - 12, y + 18);
          ctx.lineTo(x - 12, y + 14);
          ctx.lineTo(x + 12, y + 14);
          ctx.lineTo(x + 12, y + 18);
          ctx.stroke();
        }

        const glyph = techniqueGlyph(n);
        if (glyph) {
          ctx.fillStyle = "#fde68a";
          ctx.font = "700 11px system-ui";
          ctx.textAlign = "center";
          ctx.fillText(glyph, x, y - 18);
        }
        ctx.textAlign = "left";
      }
    }

    function drawHud(bundle, now) {
      ctx.fillStyle = "#e5e7eb";
      ctx.font = "700 14px system-ui";
      ctx.fillText(bundle.songInfo?.title || "SlopScale", 14, 22);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px system-ui";
      const dur = bundle.songInfo?.duration || 0;
      ctx.fillText(`${now.toFixed(2)}s / ${dur.toFixed(2)}s`, 14, 42);
    }

    function draw(bundle) {
      if (!ctx || !bundle) return;
      resize();
      const now = bundle.currentTime || 0;
      const nStr = Math.max(1, bundle.stringCount || 6);
      const inverted = !!bundle.inverted;
      const openMidis = bundle.openMidis || null;

      drawBackground();
      drawAnchorZones(bundle, now);
      drawStringLanes(nStr, inverted, openMidis);
      drawBeatsAndPlayhead(bundle, now);
      drawBackingChords(bundle, now);
      drawChordTiles(bundle, now);
      drawSectionMarkers(bundle, now);
      drawNotes(bundle, now, nStr, inverted);
      drawHud(bundle, now);
    }

    return {
      init: function (c) {
        canvas = c;
        ctx = c.getContext("2d");
        resize();
        window.addEventListener("resize", resize);
      },
      draw: draw,
      resize: resize,
      destroy: function () {
        window.removeEventListener("resize", resize);
        canvas = null;
        ctx = null;
      },
    };
  }

  function bendLabel(bn) {
    return bn === 0.5 ? "½" : bn === 1 ? "full" : bn === 1.5 ? "1½" : "2";
  }

  function makeBuiltin2DTabRenderer() {
    let canvas = null;
    let ctx = null;
    let W = 0;
    let H = 0;
    let hopoPairs = [];
    const t = {
      bg: "#fbf8ef",
      ink: "#1a1a1a",
      dim: "#6b6b6b",
      chordName: "#1a1a1a",
      sectionLabel: "#1a1a1a",
      hopo: "#1a1a1a",
      bend: "#1a1a1a",
      playhead: "#b91c1c",
    };
    const LEFT_PAD = 56;
    const RIGHT_PAD = 20;
    const AHEAD = 5;
    const BEHIND = 1.5;
    const BAR_LEAD = 13;

    function resize() {
      if (!canvas) return;
      const r = canvas.parentElement.getBoundingClientRect();
      W = Math.max(640, Math.round(r.width || 1280));
      H = Math.max(280, Math.round(r.height || 480));
      canvas.width = W;
      canvas.height = H;
    }

    function staffMetrics(nStr) {
      const gap = Math.max(14, Math.min(22, Math.floor(H / (nStr + 6))));
      const staffH = gap * (nStr - 1);
      const top = Math.floor((H - staffH) / 2);
      return { gap, top, bottom: top + staffH };
    }

    function laneY(s, nStr, top, gap) {
      return top + (nStr - 1 - s) * gap;
    }

    function xForDt(dt) {
      return (
        LEFT_PAD +
        ((dt + BEHIND) / (AHEAD + BEHIND)) * (W - LEFT_PAD - RIGHT_PAD)
      );
    }

    function preprocess(notes) {
      hopoPairs = [];
      const sorted = [...notes].sort((a, b) => a.t - b.t);
      for (let i = 0; i < sorted.length; i += 1) {
        if (!sorted[i].ho && !sorted[i].po) continue;
        for (let j = i - 1; j >= 0; j -= 1) {
          if (sorted[j].s === sorted[i].s) {
            hopoPairs.push({
              from: sorted[j],
              to: sorted[i],
              isHo: !!sorted[i].ho,
            });
            break;
          }
        }
      }
    }

    function drawBackground() {
      ctx.fillStyle = t.bg;
      ctx.fillRect(0, 0, W, H);
    }

    function drawStaff(nStr, top, gap, openMidis) {
      ctx.strokeStyle = t.ink;
      ctx.lineWidth = 1;
      for (let s = 0; s < nStr; s += 1) {
        const y = laneY(s, nStr, top, gap);
        ctx.beginPath();
        ctx.moveTo(LEFT_PAD, y);
        ctx.lineTo(W - RIGHT_PAD, y);
        ctx.stroke();
      }

      ctx.fillStyle = t.ink;
      ctx.font = '600 11px "Cambria","Georgia",serif';
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (let s = 0; s < nStr; s += 1) {
        const y = laneY(s, nStr, top, gap);
        const label = openMidis
          ? stringLabelForMidi(openMidis[s])
          : `S${s + 1}`;
        const display = s === nStr - 1 && label === "E" ? "e" : label;
        ctx.fillText(display, LEFT_PAD - 8, y);
      }
      ctx.textBaseline = "alphabetic";

      const midY = (top + (top + gap * (nStr - 1))) / 2;
      ctx.fillStyle = t.ink;
      ctx.font = 'italic 700 18px "Cambria","Georgia",serif';
      ctx.textAlign = "center";
      ctx.fillText("T", LEFT_PAD - 28, midY - gap * 0.9);
      ctx.fillText("A", LEFT_PAD - 28, midY + gap * 0.2);
      ctx.fillText("B", LEFT_PAD - 28, midY + gap * 1.3);
      ctx.textAlign = "left";
    }

    function drawBarLines(bundle, now, nStr, top, gap) {
      const yTop = laneY(nStr - 1, nStr, top, gap);
      const yBot = laneY(0, nStr, top, gap);
      ctx.strokeStyle = t.ink;
      ctx.fillStyle = t.dim;
      for (const b of bundle.beats || []) {
        const dt = b.time - now;
        if (dt < -BEHIND || dt > AHEAD) continue;
        const x = xForDt(dt) - BAR_LEAD;
        if (b.measure >= 0) {
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, yTop);
          ctx.lineTo(x, yBot);
          ctx.stroke();
          ctx.font = '10px "Cambria","Georgia",serif';
          ctx.fillText(String(b.measure), x + 3, yTop - 6);
        }
      }
    }

    function drawPlayhead(top, gap, nStr) {
      const x = xForDt(0);
      const yTop = laneY(nStr - 1, nStr, top, gap);
      const yBot = laneY(0, nStr, top, gap);
      ctx.strokeStyle = t.playhead;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, yTop - 14);
      ctx.lineTo(x, yBot + 8);
      ctx.stroke();
    }

    function drawChordNames(bundle, now, top) {
      ctx.fillStyle = t.chordName;
      ctx.font = 'italic 600 13px "Cambria","Georgia",serif';
      ctx.textAlign = "center";
      for (const ch of bundle.chords || []) {
        const dt = ch.t - now;
        if (dt < -BEHIND || dt > AHEAD) continue;
        const name =
          bundle.chordTemplates?.[ch.id]?.displayName ||
          bundle.chordTemplates?.[ch.id]?.name ||
          "";
        if (!name) continue;
        ctx.fillText(name, xForDt(dt), top - 16);
      }
      ctx.textAlign = "left";
    }

    function drawSectionMarkers(bundle, now, top, gap, nStr) {
      const yBot = laneY(0, nStr, top, gap);
      ctx.fillStyle = t.sectionLabel;
      ctx.font = 'italic 600 11px "Cambria","Georgia",serif';
      ctx.textAlign = "center";
      for (const sec of bundle.sections || []) {
        const dt = sec.time - now;
        if (dt < -BEHIND || dt > AHEAD) continue;
        ctx.fillText(sec.name || "·", xForDt(dt), yBot + 22);
      }
      ctx.textAlign = "left";
    }

    function drawHopoPairs(now, nStr, top, gap) {
      ctx.strokeStyle = t.hopo;
      ctx.fillStyle = t.hopo;
      for (const p of hopoPairs) {
        const dtFrom = p.from.t - now;
        const dtTo = p.to.t - now;
        if (dtFrom < -BEHIND - 0.1 || dtTo > AHEAD + 0.1 || p.from.s !== p.to.s)
          continue;
        const x1 = xForDt(dtFrom);
        const x2 = xForDt(dtTo);
        const y = laneY(p.from.s, nStr, top, gap);
        const arcH = Math.min(10, Math.max(5, (x2 - x1) * 0.25));
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1, y - 6);
        ctx.quadraticCurveTo((x1 + x2) / 2, y - 6 - arcH, x2, y - 6);
        ctx.stroke();
        ctx.font = 'italic 600 9px "Cambria","Georgia",serif';
        ctx.textAlign = "center";
        ctx.fillText(p.isHo ? "h" : "p", (x1 + x2) / 2, y - 6 - arcH - 2);
        ctx.textAlign = "left";
      }
    }

    function drawSustainTie(x, y, x2) {
      ctx.strokeStyle = t.ink;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    function drawNotes(bundle, now, nStr, top, gap) {
      ctx.fillStyle = t.ink;
      const fontSize = Math.max(11, Math.min(14, gap - 4));
      for (const n of bundle.notes || []) {
        const dt = n.t - now;
        if (dt < -BEHIND || dt > AHEAD) continue;
        const x = xForDt(dt);
        const y = laneY(n.s, nStr, top, gap);
        const fretText = n.mt ? "x" : String(n.f);
        ctx.font = `700 ${fontSize}px ui-monospace,"Consolas","Courier New",monospace`;
        const tw = ctx.measureText(fretText).width;
        ctx.fillStyle = t.bg;
        ctx.fillRect(
          x - tw / 2 - 2,
          y - fontSize / 2 - 1,
          tw + 4,
          fontSize + 2,
        );
        ctx.fillStyle = t.ink;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(fretText, x, y);
        ctx.textBaseline = "alphabetic";
        ctx.textAlign = "left";

        if ((n.sus || 0) > 0 && !n.mt) {
          const x2 = Math.min(W - RIGHT_PAD, xForDt(dt + n.sus));
          drawSustainTie(x + tw / 2 + 3, y, x2);
        }
        if ((n.sl ?? -1) >= 0 && !n.mt) {
          const ch = n.sl > n.f ? "/" : "\\";
          ctx.font = `600 ${fontSize}px "Cambria","Georgia",serif`;
          ctx.fillStyle = t.ink;
          ctx.fillText(ch, x + tw / 2 + 3, y + 3);
        }
        if ((n.bn || 0) > 0 && !n.mt) {
          ctx.font = '600 9px "Cambria","Georgia",serif';
          ctx.fillStyle = t.bend;
          ctx.textAlign = "center";
          ctx.fillText(`b ${bendLabel(n.bn)}`, x, y - gap * 0.6);
          ctx.textAlign = "left";
        }
        if (n.pm) {
          ctx.strokeStyle = t.ink;
          ctx.lineWidth = 1;
          const px = x;
          const py = y - gap * 0.5;
          ctx.beginPath();
          ctx.moveTo(px - 4, py + 4);
          ctx.lineTo(px - 4, py);
          ctx.lineTo(px + 4, py);
          ctx.lineTo(px + 4, py + 4);
          ctx.stroke();
          ctx.fillStyle = t.ink;
          ctx.font = '600 8px "Cambria","Georgia",serif';
          ctx.textAlign = "center";
          ctx.fillText("P.M.", px, py - 2);
          ctx.textAlign = "left";
        }
        if (n.vb || n.tr) {
          ctx.fillStyle = t.ink;
          ctx.font = `600 ${fontSize}px "Cambria","Georgia",serif`;
          ctx.textAlign = "center";
          ctx.fillText(n.tr ? "≈" : "~", x, y - gap * 0.55);
          ctx.textAlign = "left";
        }
        if ((n.hm || n.hp) && !n.mt) {
          ctx.fillStyle = t.ink;
          ctx.font = `700 ${fontSize}px "Cambria","Georgia",serif`;
          ctx.textAlign = "center";
          ctx.fillText("〈", x - tw / 2 - 3, y + 4);
          ctx.fillText("〉", x + tw / 2 + 3, y + 4);
          ctx.textAlign = "left";
        }
        if (n.hp && !n.mt) {
          ctx.fillStyle = t.ink;
          ctx.font = '600 8px "Cambria","Georgia",serif';
          ctx.textAlign = "center";
          ctx.fillText("P.H.", x, y - gap * 0.55);
          ctx.textAlign = "left";
        }
        if (n.tp && !n.mt) {
          ctx.fillStyle = t.ink;
          ctx.font = '700 10px "Cambria","Georgia",serif';
          ctx.textAlign = "center";
          ctx.fillText("T", x, y - gap * 0.6);
          ctx.textAlign = "left";
        }
        if (n.ac && !n.mt) {
          ctx.fillStyle = t.ink;
          ctx.font = '800 11px "Cambria","Georgia",serif';
          ctx.textAlign = "center";
          ctx.fillText(">", x, y - gap * 0.9);
          ctx.textAlign = "left";
        }
      }
    }

    function drawHud(bundle, now) {
      ctx.fillStyle = t.dim;
      ctx.font = 'italic 600 12px "Cambria","Georgia",serif';
      ctx.fillText(bundle.songInfo?.title || "Triad Lab", 12, 18);
      ctx.font = '11px "Cambria","Georgia",serif';
      ctx.fillText(
        `${now.toFixed(2)}s / ${(bundle.songInfo?.duration || 0).toFixed(2)}s`,
        12,
        34,
      );
    }

    function draw(bundle) {
      if (!ctx || !bundle) return;
      resize();
      const now = bundle.currentTime || 0;
      const nStr = Math.max(1, bundle.stringCount || 6);
      const { gap, top } = staffMetrics(nStr);
      drawBackground();
      drawHud(bundle, now);
      drawChordNames(bundle, now, top);
      drawStaff(nStr, top, gap, bundle.openMidis || null);
      drawBarLines(bundle, now, nStr, top, gap);
      drawHopoPairs(now, nStr, top, gap);
      drawNotes(bundle, now, nStr, top, gap);
      drawSectionMarkers(bundle, now, top, gap, nStr);
      drawPlayhead(top, gap, nStr);
    }

    return {
      init: function (c, bundle) {
        canvas = c;
        ctx = c.getContext("2d");
        resize();
        window.addEventListener("resize", resize);
        if (bundle?.notes) preprocess(bundle.notes);
      },
      draw: draw,
      resize: resize,
      destroy: function () {
        window.removeEventListener("resize", resize);
        canvas = null;
        ctx = null;
      },
    };
  }

  function stopRenderer() {
    if (state.renderer && typeof state.renderer.destroy === "function") {
      try {
        state.renderer.destroy();
      } catch (_err) {
        // Ignore renderer teardown failures.
      }
    }
    state.renderer = null;
    state.activeBundle = null;
    state.rendererKind = null;
    state.bundleExercise = null;
  }

  function loadScriptOnce(id, src) {
    return new Promise((resolve, reject) => {
      if (document.getElementById(id)) return resolve();
      const s = document.createElement("script");
      s.id = id;
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(s);
    });
  }

  async function resolveRendererFactory(kind) {
    if (kind === "builtin_2d") {
      return { factory: makeBuiltin2DRenderer, label: "2D Highway" };
    }
    if (kind === "tab_2d") {
      return { factory: makeBuiltin2DTabRenderer, label: "Tab" };
    }
    if (kind === "notation_2d") {
      return { factory: makeBuiltin2DNotationRenderer, label: "Notation" };
    }
    if (kind === "highway_3d") {
      if (typeof window.slopsmithViz_highway_3d !== "function") {
        try {
          await loadScriptOnce(
            "triadlab-highway-3d-loader",
            "/api/plugins/highway_3d/screen.js",
          );
        } catch (_err) {
          // Ignore and fallback below.
        }
      }
      if (typeof window.slopsmithViz_highway_3d === "function") {
        return {
          factory: window.slopsmithViz_highway_3d,
          label: "3D Note Highway",
        };
      }
      return { factory: makeBuiltin2DRenderer, label: "2D Highway (fallback)" };
    }
    return { factory: makeBuiltin2DRenderer, label: "2D Highway" };
  }

  async function ensureRenderer(view) {
    const kind =
      view === "highway3d"
        ? "highway_3d"
        : view === "tab"
          ? "tab_2d"
          : view === "notation"
            ? "notation_2d"
            : "builtin_2d";
    if (
      state.renderer &&
      state.activeBundle &&
      state.rendererKind === kind &&
      state.bundleExercise === state.exercise
    )
      return;

    stopRenderer();
    state.activeBundle = makeBundle(state.exercise);
    state.bundleExercise = state.exercise;

    const canvas = $("triadlab-canvas");
    const resolved = await resolveRendererFactory(kind);
    state.renderer = resolved.factory();
    state.rendererKind = kind;

    if (typeof state.renderer.init === "function") {
      state.renderer.init(canvas, state.activeBundle);
      if (
        state.renderer.readyPromise &&
        typeof state.renderer.readyPromise.then === "function"
      ) {
        try {
          await state.renderer.readyPromise;
        } catch (_err) {
          // Keep fallback behavior.
        }
      }
    }

    if (typeof state.renderer.resize === "function") {
      const rect = canvas.getBoundingClientRect();
      state.renderer.resize(
        Math.round(rect.width || canvas.width),
        Math.round(rect.height || canvas.height),
      );
    }

    state.fallback3d =
      view === "highway3d" && resolved.label.includes("fallback");
    setRenderNote(resolved.label);
  }

  function drawTab(exercise, now) {
    const { ctx, width: W, height: H } = canvasCtx();
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#faf3df";
    ctx.fillRect(0, 0, W, H);

    const top = 96;
    const spacing = 28;
    const nStr = Math.max(1, exercise?.session?.stringCount || exercise?.chart?.chordTemplates?.[0]?.frets?.length || 6);
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
      [6, 0],
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
      [6, 0],
    ];
    const T_SHARP = [8, 5, 9, 6, 3, 7, 4];
    const T_FLAT = [4, 7, 3, 6, 2, 5, 1];

    function resize() {
      if (!canvas) return;
      const r = canvas.parentElement.getBoundingClientRect();
      W = Math.max(640, Math.round(r.width || 1280));
      H = Math.max(500, Math.round(r.height || 720));
      canvas.width = W;
      canvas.height = H;
    }

    function xForDt(dt) {
      return (
        LEFT_PAD +
        ((dt + BEHIND) / (AHEAD + BEHIND)) * (W - LEFT_PAD - RIGHT_PAD)
      );
    }

    function stepToY(step, bottomY, ls) {
      return bottomY - step * (ls / 2);
    }

    function spellMidi(soundingMidi) {
      const written = soundingMidi + 12;
      const pc = ((written % 12) + 12) % 12;
      const oct = Math.floor(written / 12) - 1;
      const [letter, alter] = (isFlats ? FLAT_SPELL : SHARP_SPELL)[pc];
      const step = oct * 7 + letter - (4 * 7 + 2);
      return { step, alter, letter };
    }

    function keySigLetterAlter() {
      const map = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
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

    function drawBackground() {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#faf3df");
      g.addColorStop(1, "#f6edd7");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    function drawStaff(bottomY, ls) {
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i += 1) {
        const y = bottomY - i * ls;
        ctx.beginPath();
        ctx.moveTo(STAFF_LEFT, y);
        ctx.lineTo(W - RIGHT_PAD, y);
        ctx.stroke();
      }
    }

    function drawClef(bottomY, ls) {
      ctx.fillStyle = "#1a1a1a";
      ctx.font = `${ls * 4.4}px "Segoe UI Symbol","Apple Symbols","Noto Symbols 2",serif`;
      ctx.textBaseline = "middle";
      ctx.fillText("𝄞", 12, bottomY - ls * 2);
      ctx.textBaseline = "alphabetic";
    }

    function drawKeySig(bottomY, ls) {
      const n = Math.min(Math.abs(keyAcc), 7);
      if (!n) return;
      const steps = isFlats ? T_FLAT : T_SHARP;
      const ch = isFlats ? "♭" : "♯";
      const x0 = STAFF_LEFT + ls * 3.1;
      ctx.fillStyle = "#1a1a1a";
      ctx.font = `${ls * 1.4}px serif`;
      ctx.textAlign = "center";
      for (let i = 0; i < n; i += 1) {
        ctx.fillText(
          ch,
          x0 + i * ls * 0.95,
          stepToY(steps[i], bottomY, ls) + ls * 0.4,
        );
      }
      ctx.textAlign = "left";
    }

    function drawBarLines(bundle, now, bottomY, ls) {
      const staffTop = bottomY - ls * 4;
      for (const b of bundle.beats || []) {
        if (b.measure < 0) continue;
        const dt = b.time - now;
        if (dt < -BEHIND || dt > AHEAD) continue;
        const x = xForDt(dt) - BAR_LEAD;
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, staffTop);
        ctx.lineTo(x, bottomY);
        ctx.stroke();
        ctx.fillStyle = "#6b6b6b";
        ctx.font = '10px "Cambria","Georgia",serif';
        ctx.fillText(String(b.measure), x + 3, staffTop - 4);
      }
    }

    function drawLedgerLines(x, step, bottomY, ls) {
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = 1;
      const rw = ls * 0.7;
      for (let s = -2; s >= step; s -= 2) {
        const y = stepToY(s, bottomY, ls);
        ctx.beginPath();
        ctx.moveTo(x - rw, y);
        ctx.lineTo(x + rw, y);
        ctx.stroke();
      }
      for (let s = 10; s <= step; s += 2) {
        const y = stepToY(s, bottomY, ls);
        ctx.beginPath();
        ctx.moveTo(x - rw, y);
        ctx.lineTo(x + rw, y);
        ctx.stroke();
      }
    }

    function drawChord(bundle, now, chord, ksAlter, bottomY, ls, openMidis) {
      const dt = chord.t - now;
      if (dt < -BEHIND || dt > AHEAD) return;
      const x = xForDt(dt);
      const name =
        bundle.chordTemplates?.[chord.id]?.displayName ||
        bundle.chordTemplates?.[chord.id]?.name ||
        "";
      if (name) {
        ctx.fillStyle = "#1a1a1a";
        ctx.font = 'italic 600 13px "Cambria","Georgia",serif';
        ctx.textAlign = "center";
        ctx.fillText(name, x, bottomY - ls * 4 - 12);
        ctx.textAlign = "left";
      }

      const rendered = (chord.notes || [])
        .map((note) => {
          const midi = (openMidis?.[note.s] ?? 40) + note.f;
          const { step } = spellMidi(midi);
          return { midi, step, y: stepToY(step, bottomY, ls) };
        })
        .sort((a, b) => a.y - b.y);

      if (!rendered.length) return;
      const up = rendered[rendered.length - 1].step < 4;
      const stemNote = up ? rendered[rendered.length - 1] : rendered[0];
      const stemX = x + (up ? ls * 0.56 : -ls * 0.56);
      const stemTip = stemNote.y + (up ? -ls * 3.1 : ls * 3.1);
      const stemEnd = stemNote.y + (up ? -ls * 0.38 : ls * 0.38);

      for (const entry of rendered) {
        drawLedgerLines(x, entry.step, bottomY, ls);
        const acc = noteAccidental(entry.midi, ksAlter);
        if (acc) {
          ctx.fillStyle = "#1a1a1a";
          ctx.font = `bold ${ls * 1.35}px serif`;
          ctx.textAlign = "right";
          ctx.fillText(
            acc === "sharp" ? "♯" : acc === "flat" ? "♭" : "♮",
            x - ls * 0.65,
            entry.y + ls * 0.42,
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

    function drawPlayhead(bottomY, ls) {
      const x = xForDt(0);
      ctx.strokeStyle = "#b91c1c";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, bottomY - ls * 4 - 22);
      ctx.lineTo(x, bottomY + 6);
      ctx.stroke();
    }

    function drawHud(bundle, now) {
      ctx.fillStyle = "#6b6b6b";
      ctx.font = 'italic 600 12px "Cambria","Georgia",serif';
      ctx.fillText(bundle.songInfo?.title || "Triad Lab", 12, 18);
      ctx.font = '11px "Cambria","Georgia",serif';
      ctx.fillText(
        `${now.toFixed(1)}s / ${(bundle.songInfo?.duration || 0).toFixed(1)}s`,
        12,
        32,
      );
    }

    function draw(bundle) {
      if (!ctx || !bundle) return;
      resize();
      const now = bundle.currentTime || 0;
      const ls = Math.max(8, Math.min(14, Math.floor(H * 0.04)));
      const bottomY = Math.floor((H - ls * 4) / 2) + ls * 4;
      const cfg = bundle.config || {};
      keyAcc = notationKeySignature(cfg.key || "C");
      isFlats = keyAcc < 0;
      const ksAlter = keySigLetterAlter();

      drawBackground();
      drawStaff(bottomY, ls);
      drawClef(bottomY, ls);
      drawKeySig(bottomY, ls);
      drawBarLines(bundle, now, bottomY, ls);
      for (const chord of bundle.chords || []) {
        drawChord(
          bundle,
          now,
          chord,
          ksAlter,
          bottomY,
          ls,
          bundle.openMidis || OPEN_MIDIS,
        );
      }
      drawPlayhead(bottomY, ls);
      drawHud(bundle, now);
    }

    return {
      init: function (c, bundle) {
        canvas = c;
        ctx = c.getContext("2d");
        resize();
        window.addEventListener("resize", resize);
        keyAcc = notationKeySignature(bundle?.config?.key || "C");
        isFlats = keyAcc < 0;
      },
      draw: draw,
      resize: resize,
      destroy: function () {
        window.removeEventListener("resize", resize);
        canvas = null;
        ctx = null;
      },
    };
  }

  async function renderCurrent() {
    if (!state.exercise) {
      setStatus("Generate a drill to begin.");
      return;
    }

    state.fallback3d = false;
    if (state.activeView === "notation") {
      await ensureRenderer("notation");
      syncHighwaySettings(state.activeBundle);
      state.activeBundle.currentTime = state.previewTime;
      state.renderer.draw(state.activeBundle);
    } else if (state.activeView === "tab") {
      await ensureRenderer("tab");
      syncHighwaySettings(state.activeBundle);
      state.activeBundle.currentTime = state.previewTime;
      state.renderer.draw(state.activeBundle);
    } else if (state.activeView === "highway3d") {
      await ensureRenderer("highway3d");
      syncHighwaySettings(state.activeBundle);
      state.activeBundle.currentTime = state.previewTime;
      state.renderer.draw(state.activeBundle);
    } else {
      await ensureRenderer("highway2d");
      syncHighwaySettings(state.activeBundle);
      state.activeBundle.currentTime = state.previewTime;
      state.renderer.draw(state.activeBundle);
    }

    setStatus(
      `${state.exercise.summary}\nView: ${state.activeView}${state.fallback3d ? " (fallback active)" : ""}`,
    );
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
    const elapsed = (performance.now() - state.previewStartMs) / 1000;
    const duration = Math.max(1, getPreviewDuration());
    const loop = getLoopBounds();
    if (loop) {
      if (elapsed < loop.a) {
        state.previewTime = elapsed % duration;
      } else {
        const span = Math.max(0.05, loop.b - loop.a);
        state.previewTime = loop.a + ((elapsed - loop.a) % span);
      }
    } else {
      state.previewTime = elapsed % duration;
    }

    if (state.previewTime + 0.05 < previous) {
      const restartAt = loop ? loop.a : 0;
      state.loopCount += 1;
      stopAudio();
      schedulePreviewAudio(
        state.activeBundle,
        restartAt,
        AUDIO_LOOKAHEAD_SECONDS,
      );
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
    state.previewStartMs = performance.now() - state.previewTime * 1000;
    state.lastPreviewTime = state.previewTime;
    audioCtx =
      audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    stopAudio();
    if (state.activeBundle)
      schedulePreviewAudio(
        state.activeBundle,
        state.previewTime,
        AUDIO_LOOKAHEAD_SECONDS,
      );
    setPreviewButtonText();
    syncTransportUI();
    state.rafId = requestAnimationFrame(tickPreview);
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

  async function playInHost() {
    try {
      if (!state.exercise) await generateDrill();
      const response = await fetch(`/api/plugins/${PLUGIN_ID}/temp-sloppak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exercise: state.exercise }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}`);
      }

      const data = await response.json();

      try {
        if (
          state.activeView === "highway3d" &&
          typeof window.slopsmithViz_highway_3d === "function"
        ) {
          localStorage.setItem("vizSelection", "highway_3d");
        } else {
          localStorage.setItem("vizSelection", "default");
        }
      } catch (_e) {
        // Ignore localStorage access errors.
      }

      if (typeof window.playSong === "function") {
        await window.playSong(data.filename, 0);
      } else {
        throw new Error("window.playSong is unavailable.");
      }
    } catch (err) {
      setStatus(
        `${$("tl-status").textContent}\n\nPlay failed: ${err.message || err}`,
      );
    }
  }

  function applyConfig(cfg) {
    if (!cfg || typeof cfg !== "object") return;
    populateInstrumentControls(cfg);
    if (cfg.lesson) $("tl-lesson").value = cfg.lesson;
    if (cfg.key) $("tl-key").value = cfg.key;
    if (cfg.progression) $("tl-progression").value = cfg.progression;
    if (cfg.instrument) $("tl-instrument").value = cfg.instrument;
    if (Number.isFinite(cfg.stringCount)) $("tl-string-count").value = String(cfg.stringCount);
    if (cfg.tuningPreset) $("tl-tuning").value = cfg.tuningPreset;
    if (cfg.stringSet) $("tl-stringset").value = cfg.stringSet;
    if (Number.isFinite(cfg.bpm)) $("tl-bpm").value = String(cfg.bpm);
    if (Number.isFinite(cfg.bars)) $("tl-bars").value = String(cfg.bars);
    if (Number.isFinite(cfg.startFret))
      $("tl-start-fret").value = String(cfg.startFret);
    if (cfg.inversionMode) $("tl-inversion").value = cfg.inversionMode;
    if (cfg.view) {
      state.activeView = cfg.view;
      $("tl-view").value = cfg.view;
    }

    if (cfg.audio) {
      if (typeof cfg.audio.notes === "boolean" && $("tl-audio-notes"))
        $("tl-audio-notes").checked = cfg.audio.notes;
      if (typeof cfg.audio.metronome === "boolean" && $("tl-audio-metronome"))
        $("tl-audio-metronome").checked = cfg.audio.metronome;
      if (typeof cfg.audio.harmony === "boolean" && $("tl-audio-harmony"))
        $("tl-audio-harmony").checked = cfg.audio.harmony;
      if (cfg.audio.harmonyTone && $("tl-audio-tone"))
        $("tl-audio-tone").value = cfg.audio.harmonyTone;
    }

    const selected = Array.isArray(cfg.qualities)
      ? new Set(cfg.qualities)
      : null;
    Array.from(
      document.querySelectorAll('#tl-qualities input[type="checkbox"]'),
    ).forEach((el) => {
      el.checked = !selected || selected.has(el.value);
    });

    syncViewButtons();
  }

  async function loadPresets() {
    try {
      const r = await fetch(`/api/plugins/${PLUGIN_ID}/presets`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      state.presets = Array.isArray(data.presets) ? data.presets : [];
    } catch (_err) {
      state.presets = [];
    }

    const sel = $("tl-presets");
    sel.innerHTML = '<option value="">Saved presets...</option>';
    for (const p of state.presets) {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name;
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
      config: cfg,
    };

    const r = await fetch(`/api/plugins/${PLUGIN_ID}/presets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    await loadPresets();
  }

  async function deletePreset() {
    const id = $("tl-presets").value;
    if (!id) return;
    if (!window.confirm("Delete selected preset?")) return;

    const r = await fetch(
      `/api/plugins/${PLUGIN_ID}/presets/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    await loadPresets();
  }

  async function applySelectedPreset() {
    const id = $("tl-presets").value;
    if (!id) return;
    const preset = state.presets.find((p) => p.id === id);
    if (!preset) return;
    applyConfig(preset.config || {});
    await generateDrill();
  }

  function syncViewButtons() {
    Array.from(
      document.querySelectorAll(".triadlab-tabs button[data-view]"),
    ).forEach((btn) => {
      btn.classList.toggle(
        "active",
        btn.getAttribute("data-view") === state.activeView,
      );
    });
    $("tl-view").value = state.activeView;
  }

  function populateInstrumentControls(cfg) {
    const instrument = cfg?.instrument === "bass" ? "bass" : "guitar";
    const instrumentSel = $("tl-instrument");
    const stringCountSel = $("tl-string-count");
    const tuningSel = $("tl-tuning");
    const stringSetSel = $("tl-stringset");

    if (instrumentSel) {
      instrumentSel.innerHTML = ["guitar", "bass"]
        .map((id) => `<option value="${id}">${id === "bass" ? "Bass" : "Guitar"}</option>`)
        .join("");
      instrumentSel.value = instrument;
    }

    const counts = availableStringCounts(instrument).filter((count) => count >= 4);
    const preferredCount = counts.includes(Number(cfg?.stringCount))
      ? Number(cfg.stringCount)
      : (instrument === "bass" ? 4 : 6);

    if (stringCountSel) {
      stringCountSel.innerHTML = counts
        .map((count) => `<option value="${count}">${count} strings</option>`)
        .join("");
      stringCountSel.value = String(preferredCount);
    }

    const presets = availableTuningPresets(instrument, preferredCount);
    const selectedPreset = presets.find((preset) => preset.id === cfg?.tuningPreset)
      || (Array.isArray(cfg?.tuning)
        ? presets.find((preset) => preset.tuning.length === cfg.tuning.length && preset.tuning.every((value, index) => Number(value) === Number(cfg.tuning[index])))
        : null)
      || presets[0]
      || null;

    if (tuningSel) {
      tuningSel.innerHTML = presets
        .map((preset) => `<option value="${preset.id}">${preset.label}</option>`)
        .join("");
      if (selectedPreset) tuningSel.value = selectedPreset.id;
    }

    if (stringSetSel) {
      const setOptions = stringSetOptions(preferredCount);
      stringSetSel.innerHTML = setOptions
        .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
        .join("");
      stringSetSel.value = sanitizeStringSet(cfg?.stringSet || stringSetSel.value, preferredCount);
    }
  }

  function refreshInstrumentControls() {
    populateInstrumentControls(readConfig());
  }

  function bind() {
    $("tl-generate").addEventListener("click", () => {
      generateDrill();
    });

    $("tl-preview").addEventListener("click", () => {
      togglePreview();
    });

    $("tl-tp-play")?.addEventListener("click", () => {
      togglePreview();
    });

    $("tl-tp-start")?.addEventListener("click", () => {
      seekPreview(0);
    });

    $("tl-tp-back")?.addEventListener("click", () => {
      nudgePreviewBar(-1);
    });

    $("tl-tp-fwd")?.addEventListener("click", () => {
      nudgePreviewBar(1);
    });

    $("tl-tp-loop-a")?.addEventListener("click", () => {
      state.loopA = state.previewTime;
      syncTransportUI();
    });

    $("tl-tp-loop-b")?.addEventListener("click", () => {
      state.loopB = state.previewTime;
      syncTransportUI();
    });

    $("tl-tp-loop-clear")?.addEventListener("click", () => {
      clearPreviewLoop();
    });

    $("tl-tp-scrub")?.addEventListener("input", () => {
      seekPreview($("tl-tp-scrub").value);
    });

    [
      "tl-audio-notes",
      "tl-audio-metronome",
      "tl-audio-harmony",
      "tl-audio-tone",
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
          );
        }
        void renderCurrent();
      });
    });

    $("tl-play-host").addEventListener("click", () => {
      playInHost();
    });

    $("tl-save-preset").addEventListener("click", async () => {
      try {
        await savePreset();
      } catch (err) {
        setStatus(
          `${$("tl-status").textContent}\n\nPreset save failed: ${err.message || err}`,
        );
      }
    });

    $("tl-delete-preset").addEventListener("click", async () => {
      try {
        await deletePreset();
      } catch (err) {
        setStatus(
          `${$("tl-status").textContent}\n\nPreset delete failed: ${err.message || err}`,
        );
      }
    });

    $("tl-presets").addEventListener("change", () => {
      applySelectedPreset();
    });

    $("tl-view").addEventListener("change", () => {
      state.activeView = $("tl-view").value;
      syncViewButtons();
      void renderCurrent();
    });

    Array.from(
      document.querySelectorAll(".triadlab-tabs button[data-view]"),
    ).forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeView = btn.getAttribute("data-view");
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
      "tl-start-fret",
    ];
    regenIds.forEach((id) => {
      $(id)?.addEventListener("change", () => {
        if (id === "tl-instrument" || id === "tl-string-count") {
          refreshInstrumentControls();
        }
        if (state.exercise) generateDrill();
      });
    });

    Array.from(
      document.querySelectorAll('#tl-qualities input[type="checkbox"]'),
    ).forEach((el) => {
      el.addEventListener("change", () => {
        if (state.exercise) generateDrill();
      });
    });

    window.addEventListener("resize", () => {
      if (state.renderer && typeof state.renderer.resize === "function") {
        try {
          const canvas = $("triadlab-canvas");
          const rect = canvas.getBoundingClientRect();
          state.renderer.resize(
            Math.round(rect.width || canvas.width),
            Math.round(rect.height || canvas.height),
          );
        } catch (_err) {
          // Ignore resize errors and redraw below.
        }
      }
      void renderCurrent();
      syncTransportUI();
    });

    if (!window.__triadLabTransportKeysBound) {
      window.__triadLabTransportKeysBound = true;
      document.addEventListener("keydown", onTransportKey);
    }
  }

  async function boot() {
    if (!$("triadlab-root")) return;
    configureForm();
    populateInstrumentControls();
    bind();
    await loadPresets();
    await generateDrill();
    syncTransportUI();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
