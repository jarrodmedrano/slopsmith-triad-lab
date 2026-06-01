import {
  availableStringCounts,
  availableTuningPresets,
  buildChart,
  clamp,
  type Beat,
  type TriadBundle,
  type TriadConfig,
  type TriadExercise,
  makeBundle,
  resolveStringSetup,
  sanitizeStringSet,
  slugify,
  stringSetOptions,
} from "./triad-core";
import {
  AUDIO_LOOKAHEAD_SECONDS,
  audioState,
  schedulePreviewAudio,
  stopAudio,
} from "./runtime-audio";
import {
  makeBuiltin2DNotationRenderer,
  makeBuiltin2DRenderer,
  makeBuiltin2DTabRenderer,
} from "./runtime-renderers";

interface AppWindow extends Window {
  __triadLabTransportKeysBound?: boolean;
  slopsmithViz_highway_3d?: (...args: unknown[]) => unknown;
  playSong?: (filename: string, offset: number) => Promise<void>;
}
const appWindow = window as AppWindow;

const PLUGIN_ID = "triad_lab";
const KEY_ORDER = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

type RendererLike = {
  init?: (...args: unknown[]) => void;
  draw?: (...args: unknown[]) => void;
  resize?: (...args: unknown[]) => void;
  destroy?: () => void;
  readyPromise?: Promise<unknown>;
  contextType?: string;
};

type RendererResolution = {
  factory: () => RendererLike;
  label: string;
  contextType: "2d" | "webgl2";
  fallback3d?: boolean;
};

const state: {
  exercise: TriadExercise | null;
  activeView: string;
  previewing: boolean;
  previewStartMs: number;
  previewTime: number;
  rafId: number;
  presets: Array<{ id: string; name: string; config: unknown }>;
  fallback3d: boolean;
  renderer: RendererLike | null;
  activeBundle: ReturnType<typeof makeBundle> | null;
  rendererKind: string | null;
  bundleExercise: TriadExercise | null;
  canvasContextType: "2d" | "webgl2" | null;
  loopA: number | null;
  loopB: number | null;
  lastPreviewTime: number;
  loopCount: number;
} = {
  exercise: null,
  activeView: "highway2d",
  previewing: false,
  previewStartMs: 0,
  previewTime: 0,
  rafId: 0,
  presets: [] as Array<{ id: string; name: string; config: unknown }>,
  fallback3d: false,
  renderer: null,
  activeBundle: null as ReturnType<typeof makeBundle> | null,
  rendererKind: null,
  bundleExercise: null,
  canvasContextType: null,
  loopA: null as number | null,
  loopB: null as number | null,
  lastPreviewTime: 0,
  loopCount: 0,
};

function $(id: string) {
  return document.getElementById(id) as HTMLElement | null;
}

function inputValue(id: string, fallback = "") {
  return (($(id) as HTMLInputElement | null)?.value || fallback).toString();
}

function inputChecked(id: string) {
  return !!($(id) as HTMLInputElement | null)?.checked;
}

function setStatus(text: string) {
  const node = $("tl-status");
  if (node) node.textContent = text;
}

function setRenderNote(text: string) {
  const node = $("tl-render-note");
  if (node) node.textContent = text;
}

function setPreviewButtonText() {
  const btn = $("tl-preview");
  if (btn) btn.textContent = state.previewing ? "Stop Preview" : "Preview Scroll";
  const tp = $("tl-tp-play");
  if (tp) {
    tp.classList.toggle("is-playing", !!state.previewing);
    tp.textContent = state.previewing ? "■ Stop" : "▶ Play";
  }
}

function fmtTime(seconds: number) {
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
  const scrub = $("tl-tp-scrub") as HTMLInputElement | null;
  const loopRegion = $("tl-loop-region") as HTMLElement | null;
  const loopCount = $("tl-tp-loop-count");

  if (cur) cur.textContent = fmtTime(state.previewTime);
  if (dur) dur.textContent = fmtTime(duration);
  if (scrub) {
    scrub.max = String(duration || 0);
    scrub.value = String(Math.max(0, Math.min(duration || 0, state.previewTime)));
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
      // Ignore renderer teardown failures.
    }
  }
  state.renderer = null;
  state.activeBundle = null;
  state.rendererKind = null;
  state.bundleExercise = null;
}

function syncHighwaySettings(bundle: TriadBundle | null) {
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
  const keySel = $("tl-key") as HTMLSelectElement | null;
  if (!keySel) return;
  keySel.innerHTML = KEY_ORDER.map((key) => `<option value="${key}">${key}</option>`).join("");
  keySel.value = "C";
  const viewSel = $("tl-view") as HTMLSelectElement | null;
  if (viewSel) viewSel.value = state.activeView;
  setPreviewButtonText();
}

function getSelectedQualities() {
  const checks = Array.from(
    document.querySelectorAll('#tl-qualities input[type="checkbox"]'),
  ) as HTMLInputElement[];
  const selected = checks.filter((node) => node.checked).map((node) => node.value);
  return selected.length ? selected : ["maj"];
}

function populateInstrumentControls(
  cfg: Partial<{
    instrument: string;
    stringCount: number;
    tuningPreset: string;
    tuning: number[];
    stringSet: string;
  }>,
) {
  const instrument = cfg?.instrument === "bass" ? "bass" : "guitar";
  const instrumentSel = $("tl-instrument") as HTMLSelectElement | null;
  const stringCountSel = $("tl-string-count") as HTMLSelectElement | null;
  const tuningSel = $("tl-tuning") as HTMLSelectElement | null;
  const stringSetSel = $("tl-stringset") as HTMLSelectElement | null;

  if (instrumentSel) {
    instrumentSel.innerHTML = ["guitar", "bass"]
      .map((id) => `<option value="${id}">${id === "bass" ? "Bass" : "Guitar"}</option>`)
      .join("");
    instrumentSel.value = instrument;
  }

  const counts = availableStringCounts(instrument).filter((count) => count >= 4);
  const preferredCount = counts.includes(Number(cfg?.stringCount))
    ? Number(cfg?.stringCount)
    : instrument === "bass"
      ? 4
      : 6;

  if (stringCountSel) {
    stringCountSel.innerHTML = counts
      .map((count) => `<option value="${count}">${count} strings</option>`)
      .join("");
    stringCountSel.value = String(preferredCount);
  }

  const presets = availableTuningPresets(instrument as "guitar" | "bass", preferredCount);
  const tuning = Array.isArray(cfg?.tuning) ? cfg.tuning : [];
  const selectedPreset =
    presets.find((preset) => preset.id === cfg?.tuningPreset) ||
    (tuning.length
      ? presets.find(
          (preset) =>
            preset.tuning.length === tuning.length &&
            preset.tuning.every((value, index) => Number(value) === Number(tuning[index])),
        )
      : null) ||
    presets[0] ||
    null;

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

function readConfig() {
  const instrument = inputValue("tl-instrument", "guitar") === "bass" ? "bass" : "guitar";
  const stringCount = clamp(
    parseInt(inputValue("tl-string-count", instrument === "bass" ? "4" : "6"), 10),
    4,
    8,
  );
  const tuningPreset = inputValue("tl-tuning", "standard");
  const setup = resolveStringSetup({ instrument, stringCount, tuningPreset });
  const stringSet = sanitizeStringSet(inputValue("tl-stringset"), setup.stringCount);

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
      harmonyTone: inputValue("tl-audio-tone", "pad"),
    },
    tuning: setup.tuning.slice(),
    openMidis: setup.openMidis.slice(),
  };
}

function renderCurrent(): Promise<void> | void {
  if (!state.exercise) {
    setStatus("Generate a drill to begin.");
    return;
  }

  state.fallback3d = false;
  const view = state.activeView;

  if (view === "notation") {
    return ensureRenderer("notation").then(() => {
      syncHighwaySettings(state.activeBundle);
      if (state.activeBundle) state.activeBundle.currentTime = state.previewTime;
      state.renderer?.draw?.(state.activeBundle);
      setStatus(
        `${state.exercise?.summary}\nView: ${state.activeView}${state.fallback3d ? " (fallback active)" : ""}`,
      );
      syncTransportUI();
    });
  }

  return ensureRenderer(view).then(() => {
    syncHighwaySettings(state.activeBundle);
    if (state.activeBundle) state.activeBundle.currentTime = state.previewTime;
    state.renderer?.draw?.(state.activeBundle);
    setStatus(
      `${state.exercise?.summary}\nView: ${state.activeView}${state.fallback3d ? " (fallback active)" : ""}`,
    );
    syncTransportUI();
  });
}

async function resolveRendererFactory(kind: string): Promise<RendererResolution> {
  if (kind === "highway_3d") {
    const threeFactory = appWindow.slopsmithViz_highway_3d as
      | ((...args: unknown[]) => unknown)
      | undefined;
    if (typeof threeFactory === "function") {
      return {
        factory: () => {
          const renderer = threeFactory();
          if (!renderer || typeof renderer !== "object") {
            throw new Error("3D renderer factory returned an invalid instance.");
          }
          return renderer as RendererLike;
        },
        label: "3D Highway",
        contextType:
          (threeFactory as { contextType?: string }).contextType === "webgl2" ? "webgl2" : "2d",
      };
    }
    return {
      factory: () => makeBuiltin2DRenderer() as unknown as RendererLike,
      label: "2D Highway",
      contextType: "2d",
      fallback3d: true,
    };
  }
  if (kind === "builtin_2d") {
    return {
      factory: () => makeBuiltin2DRenderer() as unknown as RendererLike,
      label: "2D Highway",
      contextType: "2d",
    };
  }
  if (kind === "tab_2d") {
    return {
      factory: () => makeBuiltin2DTabRenderer() as unknown as RendererLike,
      label: "Tab",
      contextType: "2d",
    };
  }
  if (kind === "notation_2d") {
    return {
      factory: () => makeBuiltin2DNotationRenderer() as unknown as RendererLike,
      label: "Notation",
      contextType: "2d",
    };
  }
  return {
    factory: () => makeBuiltin2DRenderer() as unknown as RendererLike,
    label: "2D Highway",
    contextType: "2d",
  };
}

function ensureCanvasForContext(contextType: "2d" | "webgl2") {
  const current = $("triadlab-canvas") as HTMLCanvasElement | null;
  if (!current) return null;
  if (state.canvasContextType && state.canvasContextType !== contextType) {
    const fresh = current.cloneNode(false) as HTMLCanvasElement;
    current.replaceWith(fresh);
    return fresh;
  }
  return current;
}

async function ensureRenderer(view: string) {
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
  if (!state.exercise) return;
  state.activeBundle = makeBundle(state.exercise);
  state.bundleExercise = state.exercise;

  const resolved = await resolveRendererFactory(kind);
  let canvas = ensureCanvasForContext(resolved.contextType);
  if (!canvas) {
    setStatus("Renderer unavailable: missing canvas.");
    return;
  }

  try {
    state.renderer = resolved.factory();
    state.rendererKind = kind;
    state.renderer?.init?.(canvas, state.activeBundle);
    if (state.renderer?.readyPromise) await state.renderer.readyPromise;
    state.renderer?.resize?.(
      Math.round(canvas.clientWidth || canvas.width || 0),
      Math.round(canvas.clientHeight || canvas.height || 0),
    );
    state.canvasContextType = resolved.contextType;
    state.fallback3d = !!resolved.fallback3d;
    setRenderNote(resolved.fallback3d ? "2D Highway (3D unavailable)" : resolved.label);
    return;
  } catch (err) {
    stopRenderer();
    if (kind !== "highway_3d") {
      setStatus(
        `${($("tl-status") as HTMLElement | null)?.textContent || ""}\n\nRender failed: ${(err as Error).message || err}`,
      );
      return;
    }
  }

  const fallback = await resolveRendererFactory("builtin_2d");
  canvas = ensureCanvasForContext("2d");
  if (!canvas) {
    setStatus("Renderer fallback unavailable: missing canvas.");
    return;
  }
  state.renderer = fallback.factory();
  state.rendererKind = "builtin_2d";
  state.renderer?.init?.(canvas, state.activeBundle);
  state.renderer?.resize?.(
    Math.round(canvas.clientWidth || canvas.width || 0),
    Math.round(canvas.clientHeight || canvas.height || 0),
  );
  state.canvasContextType = "2d";
  state.fallback3d = true;
  setRenderNote("2D Highway (3D failed to initialize)");
}

function seekPreview(nextTime: number) {
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
        () => readConfig().audio,
        () => new AudioContext(),
      );
    }
  }
  void renderCurrent();
  syncTransportUI();
}

function nudgePreviewBar(dir: number) {
  if (!state.exercise) return;
  const downbeats = (state.exercise.chart.beats || [])
    .filter((beat: Beat) => (beat.measure || -1) >= 0)
    .map((beat: Beat) => beat.time)
    .sort((a: number, b: number) => a - b);

  const t = state.previewTime;
  const duration = getPreviewDuration();
  if (!downbeats.length) {
    seekPreview(t + dir * 2);
    return;
  }
  if (dir > 0) {
    const next = downbeats.find((beatTime: number) => beatTime > t + 0.05);
    seekPreview(next != null ? next : duration);
  } else {
    const prev = [...downbeats].reverse().find((beatTime) => beatTime < t - 0.05);
    seekPreview(prev != null ? prev : 0);
  }
}

function onTransportKey(e: KeyboardEvent) {
  const root = $("triadlab-root");
  if (!root || !root.offsetParent) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase() || "";
  if (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    (e.target as HTMLElement | null)?.isContentEditable
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

async function generateDrill() {
  const cfg = readConfig();
  stopAudio();
  state.exercise = buildChart(cfg as TriadConfig);
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
  const elapsed = (performance.now() - state.previewStartMs) / 1000;
  const duration = Math.max(1, getPreviewDuration());
  const loop = getLoopBounds();
  state.previewTime = loop
    ? elapsed < loop.a
      ? elapsed % duration
      : loop.a + ((elapsed - loop.a) % Math.max(0.05, loop.b - loop.a))
    : elapsed % duration;

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
        () => new AudioContext(),
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
  state.previewStartMs = performance.now() - state.previewTime * 1000;
  state.lastPreviewTime = state.previewTime;
  if (audioState.ctx?.state === "suspended") audioState.ctx.resume().catch(() => {});
  stopAudio();
  if (state.activeBundle) {
    schedulePreviewAudio(
      state.activeBundle,
      state.previewTime,
      AUDIO_LOOKAHEAD_SECONDS,
      () => readConfig().audio,
      () => new AudioContext(),
    );
  }
  setPreviewButtonText();
  syncTransportUI();
  state.rafId = requestAnimationFrame(tickPreview);
}

function syncViewButtons() {
  Array.from(document.querySelectorAll(".triadlab-tabs button[data-view]")).forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-view") === state.activeView);
  });
  const viewSel = $("tl-view") as HTMLSelectElement | null;
  if (viewSel) viewSel.value = state.activeView;
}

function applyConfig(cfg: unknown) {
  if (!cfg || typeof cfg !== "object") return;
  const c = cfg as Partial<TriadConfig>;
  populateInstrumentControls(c);
  if (c.lesson) ($("tl-lesson") as HTMLInputElement | null)!.value = c.lesson;
  if (c.key) ($("tl-key") as HTMLSelectElement | null)!.value = c.key;
  if (c.progression) ($("tl-progression") as HTMLSelectElement | null)!.value = c.progression;
  if (c.instrument) ($("tl-instrument") as HTMLSelectElement | null)!.value = c.instrument;
  if (Number.isFinite(c.stringCount))
    ($("tl-string-count") as HTMLSelectElement | null)!.value = String(c.stringCount);
  if (c.tuningPreset) ($("tl-tuning") as HTMLSelectElement | null)!.value = c.tuningPreset;
  if (c.stringSet) ($("tl-stringset") as HTMLSelectElement | null)!.value = c.stringSet;
  if (Number.isFinite(c.bpm)) ($("tl-bpm") as HTMLInputElement | null)!.value = String(c.bpm);
  if (Number.isFinite(c.bars)) ($("tl-bars") as HTMLInputElement | null)!.value = String(c.bars);
  if (Number.isFinite(c.startFret))
    ($("tl-start-fret") as HTMLInputElement | null)!.value = String(c.startFret);
  if (c.inversionMode) ($("tl-inversion") as HTMLSelectElement | null)!.value = c.inversionMode;
  if (c.view) {
    state.activeView = c.view;
    ($("tl-view") as HTMLSelectElement | null)!.value = c.view;
  }
  if (c.audio) {
    const notes = $("tl-audio-notes") as HTMLInputElement | null;
    const metro = $("tl-audio-metronome") as HTMLInputElement | null;
    const harmony = $("tl-audio-harmony") as HTMLInputElement | null;
    const tone = $("tl-audio-tone") as HTMLSelectElement | null;
    if (typeof c.audio.notes === "boolean" && notes) notes.checked = c.audio.notes;
    if (typeof c.audio.metronome === "boolean" && metro) metro.checked = c.audio.metronome;
    if (typeof c.audio.harmony === "boolean" && harmony) harmony.checked = c.audio.harmony;
    if (c.audio.harmonyTone && tone) tone.value = c.audio.harmonyTone;
  }
  const selected = Array.isArray(c.qualities) ? new Set(c.qualities) : null;
  Array.from(document.querySelectorAll('#tl-qualities input[type="checkbox"]')).forEach((el) => {
    (el as HTMLInputElement).checked = !selected || selected.has((el as HTMLInputElement).value);
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

  const sel = $("tl-presets") as HTMLSelectElement | null;
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
    config: cfg,
  };

  const response = await fetch(`/api/plugins/${PLUGIN_ID}/presets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  await loadPresets();
}

async function deletePreset() {
  const id = ($("tl-presets") as HTMLSelectElement | null)?.value;
  if (!id) return;
  if (!window.confirm("Delete selected preset?")) return;

  const response = await fetch(`/api/plugins/${PLUGIN_ID}/presets/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  await loadPresets();
}

async function applySelectedPreset() {
  const id = ($("tl-presets") as HTMLSelectElement | null)?.value;
  if (!id) return;
  const preset = state.presets.find((entry: { id: string }) => entry.id === id);
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
  $("tl-tp-scrub")?.addEventListener("input", () =>
    seekPreview(Number(($("tl-tp-scrub") as HTMLInputElement).value)),
  );

  ["tl-audio-notes", "tl-audio-metronome", "tl-audio-harmony", "tl-audio-tone"].forEach((id) => {
    $(id)?.addEventListener("change", () => {
      if (state.exercise) {
        state.exercise.session.audio = readConfig().audio;
        if (state.activeBundle) state.activeBundle.config.audio = state.exercise.session.audio;
      }
      if (state.previewing && state.activeBundle) {
        stopAudio();
        schedulePreviewAudio(
          state.activeBundle,
          state.previewTime,
          AUDIO_LOOKAHEAD_SECONDS,
          () => readConfig().audio,
          () => new AudioContext(),
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
        `${($("tl-status") as HTMLElement | null)?.textContent || ""}\n\nPreset save failed: ${(err as Error).message || err}`,
      );
    }
  });
  $("tl-delete-preset")?.addEventListener("click", async () => {
    try {
      await deletePreset();
    } catch (err) {
      setStatus(
        `${($("tl-status") as HTMLElement | null)?.textContent || ""}\n\nPreset delete failed: ${(err as Error).message || err}`,
      );
    }
  });
  $("tl-presets")?.addEventListener("change", () => {
    void applySelectedPreset();
  });
  $("tl-view")?.addEventListener("change", () => {
    state.activeView = ($("tl-view") as HTMLSelectElement | null)!.value;
    syncViewButtons();
    void renderCurrent();
  });

  Array.from(document.querySelectorAll(".triadlab-tabs button[data-view]")).forEach((btn) => {
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
    "tl-start-fret",
  ];
  regenIds.forEach((id) => {
    $(id)?.addEventListener("change", () => {
      if (id === "tl-instrument" || id === "tl-string-count") refreshInstrumentControls();
      if (state.exercise) void generateDrill();
    });
  });

  Array.from(document.querySelectorAll('#tl-qualities input[type="checkbox"]')).forEach((el) => {
    el.addEventListener("change", () => {
      if (state.exercise) void generateDrill();
    });
  });

  window.addEventListener("resize", () => {
    if (state.renderer?.resize) {
      try {
        const canvas = $("triadlab-canvas") as HTMLCanvasElement | null;
        if (canvas) {
          state.renderer.resize(
            Math.round(canvas.clientWidth || canvas.width),
            Math.round(canvas.clientHeight || canvas.height),
          );
        }
      } catch (_err) {
        // Ignore resize errors and redraw below.
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
        typeof appWindow.slopsmithViz_highway_3d === "function"
      ) {
        localStorage.setItem("vizSelection", "highway_3d");
      } else {
        localStorage.setItem("vizSelection", "default");
      }
    } catch (_e) {
      // Ignore localStorage access errors.
    }

    if (typeof appWindow.playSong === "function") {
      await appWindow.playSong(data.filename, 0);
    } else {
      throw new Error("window.playSong is unavailable.");
    }
  } catch (err) {
    setStatus(
      `${($("tl-status") as HTMLElement | null)?.textContent || ""}\n\nPlay failed: ${(err as Error).message || err}`,
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
    once: true,
  });
} else {
  void boot();
}
