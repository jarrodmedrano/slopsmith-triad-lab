# Triad Lab

Triad Lab is a Slopsmith plugin for focused guitar triad practice.

## MVP Features

- Triad drills for:
  - quality identification (major, minor, diminished, augmented)
  - root/1st/2nd inversion cycling
  - string-set targeting (6-5-4, 5-4-3, 4-3-2, 3-2-1)
  - progression targeting (I-IV-V, ii-V-I)
- Preview render modes:
  - 2D highway preview
  - 3D mode selection with fallback to 2D preview
  - tab preview
- DB-backed preset save/load/delete
- "Play In Slopsmith" route that builds a temporary `.sloppak` and launches it in the player

## Plugin Files

- `plugin.json` - manifest and nav registration
- `screen.html` - plugin UI
- `screen.ts` - TypeScript source for drill generation, preview rendering, preset + playback actions
- `screen.js` - built browser bundle emitted from `screen.ts`
- `routes.py` - preset API and temp sloppak generation API
- `package.json` - build, typecheck, and Vitest scripts

## Development

- `npm install`
- `npm run build` to regenerate `screen.js` from `screen.ts`
- `npm test` to run the Vitest suite
- `npm run typecheck` to validate the TypeScript sources

## API Endpoints

- `GET /api/plugins/triad_lab/status`
- `GET /api/plugins/triad_lab/presets`
- `POST /api/plugins/triad_lab/presets`
- `DELETE /api/plugins/triad_lab/presets/{preset_id}`
- `POST /api/plugins/triad_lab/temp-sloppak`

## Notes

- The plugin currently targets 6-string guitar standard tuning.
- 3D selection is exposed in Triad Lab, but preview rendering stays on canvas; host playback uses Slopsmith player.
- Temporary generated content is written under the configured DLC folder in `.triad-lab-temp/`.
