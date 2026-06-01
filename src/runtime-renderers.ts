import { NOTATION_KEY_SIGNATURES, type TriadBundle } from "./triad-core";

export const STRING_COLORS = [
  "#ef4444",
  "#f97316",
  "#facc15",
  "#22c55e",
  "#06b6d4",
  "#60a5fa",
  "#a855f7",
  "#ec4899",
];

function stringLabelForMidi(midi: number): string {
  const pc = ((midi % 12) + 12) % 12;
  return ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"][pc] || "?";
}

export function makeBuiltin2DRenderer() {
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
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

  function laneY(s: number, count: number, inverted: boolean) {
    const top = TOP_PAD;
    const bottom = H - BOTTOM_PAD;
    const visualIndex = inverted ? s : count - 1 - s;
    return bottom - visualIndex * ((bottom - top) / Math.max(1, count - 1));
  }

  function xForDt(dt: number) {
    return LEFT_PAD + ((dt + BEHIND) / (AHEAD + BEHIND)) * (W - LEFT_PAD - RIGHT_PAD);
  }

  function drawBackground() {
    if (!ctx) return;
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#08111f");
    grad.addColorStop(1, "#050711");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  function draw(bundle: TriadBundle) {
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
      const name =
        bundle.chordTemplates?.[chord.id]?.displayName ||
        bundle.chordTemplates?.[chord.id]?.name ||
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
    init(canvasElement: HTMLCanvasElement) {
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
    },
  };
}

export function makeBuiltin2DTabRenderer() {
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
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

  function draw(bundle: TriadBundle) {
    if (!ctx) return;
    resize();
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#faf3df";
    ctx.fillRect(0, 0, W, H);

    const now = bundle.currentTime || 0;

    const top = 96;
    const spacing = 28;
    const nStr = Math.max(
      1,
      bundle?.stringCount || bundle?.chordTemplates?.[0]?.frets?.length || 6,
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

    for (const chord of bundle.chords || []) {
      const x = x0 + (chord.t - now) * pxPerSec;
      if (x < x0 - 80 || x > x1 + 40) continue;
      const tpl = bundle.chordTemplates?.[chord.id];
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
    init(canvasElement: HTMLCanvasElement) {
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
    },
  };
}

export function makeBuiltin2DNotationRenderer() {
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
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
    const rect = canvas.parentElement?.getBoundingClientRect();
    W = Math.max(640, Math.round(rect?.width || 1280));
    H = Math.max(500, Math.round(rect?.height || 720));
    canvas.width = W;
    canvas.height = H;
  }

  function xForDt(dt: number) {
    return LEFT_PAD + ((dt + BEHIND) / (AHEAD + BEHIND)) * (W - LEFT_PAD - RIGHT_PAD);
  }

  function stepToY(step: number, bottomY: number, ls: number) {
    return bottomY - step * (ls / 2);
  }

  function spellMidi(soundingMidi: number) {
    const written = soundingMidi + 12;
    const pc = ((written % 12) + 12) % 12;
    const oct = Math.floor(written / 12) - 1;
    const [letter, alter] = (isFlats ? FLAT_SPELL : SHARP_SPELL)[pc];
    const step = oct * 7 + letter - (4 * 7 + 2);
    return { step, alter, letter };
  }

  function keySigLetterAlter() {
    const map: Record<number, number> = {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    };
    const order = isFlats ? [6, 2, 5, 1, 4, 0, 3] : [3, 0, 4, 1, 5, 2, 6];
    const alt = isFlats ? -1 : 1;
    for (let i = 0; i < Math.min(Math.abs(keyAcc), 7); i += 1) map[order[i]] = alt;
    return map;
  }

  function noteAccidental(soundingMidi: number, ksAlter: Record<number, number>) {
    const { alter, letter } = spellMidi(soundingMidi);
    const sig = ksAlter[letter] || 0;
    if (alter === sig) return null;
    return alter > 0 ? "sharp" : alter < 0 ? "flat" : "natural";
  }

  function draw(bundle: TriadBundle) {
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
    ctx.fillText("𝄞", 12, bottomY - ls * 2);
    ctx.textBaseline = "alphabetic";

    const n = Math.min(Math.abs(keyAcc), 7);
    if (n) {
      const steps = isFlats ? T_FLAT : T_SHARP;
      const ch = isFlats ? "♭" : "♯";
      const x0 = STAFF_LEFT + ls * 3.1;
      ctx.fillStyle = "#1a1a1a";
      ctx.font = `${ls * 1.4}px serif`;
      ctx.textAlign = "center";
      for (let i = 0; i < n; i += 1) {
        ctx.fillText(ch, x0 + i * ls * 0.95, stepToY(steps[i], bottomY, ls) + ls * 0.4);
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
          const midi = (bundle.openMidis?.[note.s] ?? 40) + note.f;
          const { step } = spellMidi(midi);
          return { midi, step, y: stepToY(step, bottomY, ls) };
        })
        .sort((a, b) => a.y - b.y);

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

    const playX = xForDt(0);
    ctx.strokeStyle = "#b91c1c";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(playX, bottomY - ls * 4 - 22);
    ctx.lineTo(playX, bottomY + 6);
    ctx.stroke();
  }

  return {
    init(canvasElement: HTMLCanvasElement, bundle?: TriadBundle) {
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
    },
  };
}
