import { describe, expect, it } from "vitest";
import {
  buildBackingEventsFromChart,
  buildChart,
  fretForPitchClass,
  notationKeySignature,
  resolveStringSetup,
  sanitizeStringSet,
  stringSetOptions,
  stringSetToIndices,
} from "../src/triad-core";

const baseConfig = {
  lesson: "progression",
  instrument: "guitar" as const,
  stringCount: 6,
  key: "C",
  progression: "i-iv-v",
  stringSet: "654",
  tuningPreset: "standard",
  bpm: 120,
  bars: 3,
  startFret: 2,
  inversionMode: "root",
  qualities: ["maj", "min"],
  view: "highway2d",
  audio: {
    notes: true,
    metronome: false,
    harmony: true,
    harmonyTone: "pad",
  },
  tuning: [0, 0, 0, 0, 0, 0],
  openMidis: [40, 45, 50, 55, 59, 64],
};

describe("triad core", () => {
  it("resolves common guitar setups and string sets", () => {
    const setup = resolveStringSetup({
      instrument: "guitar",
      stringCount: 6,
      tuningPreset: "standard",
    });
    expect(setup.stringCount).toBe(6);
    expect(setup.openMidis).toEqual([40, 45, 50, 55, 59, 64]);
    expect(stringSetOptions(6).map((opt) => opt.value)).toEqual([
      "654",
      "543",
      "432",
      "321",
    ]);
    expect(sanitizeStringSet("999", 6)).toBe("654");
    expect(stringSetToIndices("654", 6)).toEqual([0, 1, 2]);
  });

  it("builds a triad chart with the expected progression and durations", () => {
    const exercise = buildChart(baseConfig);
    expect(exercise.chart.chords).toHaveLength(3);
    expect(
      exercise.chart.chordTemplates.map((template) => template.name),
    ).toEqual(["CMaj R", "FMaj R", "GMaj R"]);
    expect(exercise.chart.notes).toHaveLength(9);
    expect(exercise.chart.beats[0]).toEqual({ time: 0, measure: 1 });
    expect(exercise.chart.duration).toBeCloseTo(7.5);

    for (const chord of exercise.chart.chords) {
      const fretted = chord.notes.map((note) => note.f).filter((fret) => fret > 0);
      if (fretted.length <= 1) continue;
      expect(Math.max(...fretted) - Math.min(...fretted)).toBeLessThanOrEqual(4);
    }
  });

  it("assigns non-trivial chord finger numbers", () => {
    const exercise = buildChart(baseConfig);
    const first = exercise.chart.chordTemplates[0];
    const usedFingers = first.fingers.filter((finger) => finger > 0);
    expect(usedFingers.length).toBeGreaterThan(0);
    expect(new Set(usedFingers).size).toBeGreaterThan(1);
  });

  it("builds backing events from the generated chart", () => {
    const exercise = buildChart(baseConfig);
    const events = buildBackingEventsFromChart(
      exercise.chart,
      exercise.chart.duration,
      exercise.session.openMidis,
    );
    expect(events).toHaveLength(3);
    expect(events[0]).toMatchObject({ t: 0, name: "CMaj R" });
    expect(events[0].midis).toEqual([48, 52, 55]);
  });

  it("computes fret and notation helpers deterministically", () => {
    expect(fretForPitchClass(40, 0, 0, 17, 2)).toBe(8);
    expect(notationKeySignature("Eb")).toBe(-3);
    expect(notationKeySignature("C")).toBe(0);
  });
});
