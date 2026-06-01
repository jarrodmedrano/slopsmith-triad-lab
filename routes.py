"""Triad Lab backend routes.

Provides DB-backed preset storage and temporary sloppak generation so users can
launch generated triad drills in the Slopsmith player.
"""

from __future__ import annotations

import importlib
import json
import os
import shutil
import tempfile
import time
import uuid
import wave
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

PLUGIN_ID = "triad_lab"
SCHEMA_VERSION = 1
TEMP_ROOT_NAME = ".triad-lab-temp"
SAMPLE_RATE = 44100


class PresetPayload(BaseModel):
    id: str = Field(min_length=1, max_length=96)
    name: str = Field(min_length=1, max_length=160)
    kind: str = Field(default="triad_drill", max_length=64)
    config: dict[str, Any] = Field(default_factory=dict)


class TempSloppakPayload(BaseModel):
    exercise: dict[str, Any] = Field(default_factory=dict)


def _data_dir(context: dict) -> Path:
    root = Path(context["config_dir"]) / "plugin_data" / PLUGIN_ID
    root.mkdir(parents=True, exist_ok=True)
    return root


def _get_dlc_dir(context: dict) -> Path | None:
    try:
        getter = context.get("get_dlc_dir")
        if callable(getter):
            value = getter()
            if value:
                return Path(value)
    except Exception:
        pass

    try:
        server = importlib.import_module("server")
        getter = getattr(server, "_get_dlc_dir", None)
        if callable(getter):
            value = getter()
            if value:
                return Path(value)
    except Exception:
        pass

    cfg_path = Path(context["config_dir"]) / "config.json"
    if cfg_path.exists():
        try:
            cfg = json.loads(cfg_path.read_text(encoding="utf-8"))
            for key in ("dlc_dir", "dlc_path", "dlc", "library_dir", "library_path"):
                value = cfg.get(key)
                if isinstance(value, str) and value.strip():
                    return Path(value)
        except Exception:
            pass
    return None


def _ensure_tables(meta_db) -> None:
    with meta_db._lock:
        meta_db.conn.execute(
            """
            CREATE TABLE IF NOT EXISTS triad_lab_presets (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                kind TEXT NOT NULL DEFAULT 'triad_drill',
                config_json TEXT NOT NULL,
                created_at REAL NOT NULL
            )
            """
        )
        meta_db.conn.commit()


def _normalise_note(note: Any, include_time: bool = True) -> dict[str, Any]:
    if not isinstance(note, dict):
        return {}
    out = {
        "s": int(note.get("s", 0) or 0),
        "f": int(note.get("f", 0) or 0),
        "sus": float(note.get("sus", 0) or 0),
        "ho": bool(note.get("ho", False)),
        "po": bool(note.get("po", False)),
        "hm": bool(note.get("hm", False)),
        "hp": bool(note.get("hp", False)),
        "pm": bool(note.get("pm", False)),
        "mt": bool(note.get("mt", False)),
        "vb": bool(note.get("vb", False)),
        "tr": bool(note.get("tr", False)),
        "ac": bool(note.get("ac", False)),
        "tp": bool(note.get("tp", False)),
        "bn": float(note.get("bn", 0) or 0),
        "sl": int(note.get("sl", -1) if note.get("sl", -1) is not None else -1),
        "slu": int(note.get("slu", -1) if note.get("slu", -1) is not None else -1),
    }
    if include_time:
        out["t"] = float(note.get("t", 0) or 0)
    return out


def _session_string_count(session: dict[str, Any], chart: dict[str, Any]) -> int:
    count = session.get("stringCount")
    if isinstance(count, (int, float)) and int(count) > 0:
        return int(count)

    tuning = session.get("tuning")
    if isinstance(tuning, list) and tuning:
        return len(tuning)

    open_midis = session.get("openMidis")
    if isinstance(open_midis, list) and open_midis:
        return len(open_midis)

    templates = chart.get("chordTemplates") or []
    if templates:
        first = templates[0] if isinstance(templates[0], dict) else {}
        frets = first.get("frets") if isinstance(first, dict) else None
        if isinstance(frets, list) and frets:
            return len(frets)

    return 6


def _normalise_chart(exercise: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any]]:
    if not isinstance(exercise, dict):
        raise HTTPException(400, "exercise must be an object")
    session = exercise.get("session") if isinstance(exercise.get("session"), dict) else {}
    chart = exercise.get("chart") if isinstance(exercise.get("chart"), dict) else {}
    string_count = _session_string_count(session, chart)

    notes = [_normalise_note(n, include_time=True) for n in chart.get("notes", []) if isinstance(n, dict)]
    notes = [n for n in notes if n]
    notes.sort(key=lambda n: float(n.get("t", 0)))

    chords = []
    for ch in chart.get("chords", []) or []:
        if not isinstance(ch, dict):
            continue
        chord_notes = [_normalise_note(n, include_time=False) for n in ch.get("notes", []) if isinstance(n, dict)]
        chords.append({
            "t": float(ch.get("t", 0) or 0),
            "id": int(ch.get("id", 0) or 0),
            "hd": bool(ch.get("hd", False)),
            "notes": chord_notes,
        })
    chords.sort(key=lambda c: float(c.get("t", 0)))

    templates = []
    for tpl in chart.get("chordTemplates", []) or []:
        if not isinstance(tpl, dict):
            continue
        frets = list(tpl.get("frets", []))[:string_count]
        fingers = list(tpl.get("fingers", []))[:string_count]
        templates.append(
            {
                "name": str(tpl.get("name") or "Chord"),
                "displayName": str(tpl.get("displayName") or tpl.get("name") or "Chord"),
                "arp": bool(tpl.get("arp", False)),
                "frets": [int(x) if isinstance(x, (int, float)) else -1 for x in frets],
                "fingers": [int(x) if isinstance(x, (int, float)) else -1 for x in fingers],
            }
        )

    beats = []
    for beat in chart.get("beats", []) or []:
        if not isinstance(beat, dict):
            continue
        beats.append({"time": float(beat.get("time", 0) or 0), "measure": int(beat.get("measure", -1) or -1)})
    if not beats:
        beats = [{"time": 0.0, "measure": 1}]

    sections = []
    for idx, sec in enumerate(chart.get("sections", []) or []):
        if not isinstance(sec, dict):
            continue
        sections.append(
            {
                "name": str(sec.get("name") or "drill"),
                "number": int(sec.get("number", idx + 1) or idx + 1),
                "time": float(sec.get("time", 0) or 0),
            }
        )
    if not sections:
        sections = [{"name": "drill", "number": 1, "time": 0.0}]

    anchors = []
    for anc in chart.get("anchors", []) or []:
        if not isinstance(anc, dict):
            continue
        anchors.append({
            "time": float(anc.get("time", 0) or 0),
            "fret": int(anc.get("fret", 1) or 1),
            "width": int(anc.get("width", 4) or 4),
        })
    if not anchors:
        anchors = [{"time": 0.0, "fret": 2, "width": 4}]

    duration = float(chart.get("duration", 0) or 0)
    if duration <= 0:
        max_note = max((float(n.get("t", 0)) + float(n.get("sus", 0)) for n in notes), default=0)
        max_chord = max((float(c.get("t", 0)) for c in chords), default=0)
        duration = max(8.0, max_note, max_chord) + 1.5

    arranged = {
        "name": "Lead",
        "tuning": list(session.get("tuning", []))[:string_count] or [0] * string_count,
        "capo": 0,
        "notes": notes,
        "chords": chords,
        "anchors": anchors,
        "handshapes": [],
        "templates": templates,
        "beats": beats,
        "sections": sections,
    }
    return session, {"arrangement": arranged, "duration": max(1.0, min(duration, 900.0))}


def _write_silence_wav(path: Path, duration: float) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    frames = int(max(1.0, duration) * SAMPLE_RATE)
    chunk = b"\x00\x00" * SAMPLE_RATE
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        remain = frames
        while remain > 0:
            n = min(SAMPLE_RATE, remain)
            wf.writeframes(chunk[: n * 2])
            remain -= n


def _dump_yaml(data: dict[str, Any]) -> str:
    try:
        import yaml  # type: ignore

        return yaml.safe_dump(data, sort_keys=False, allow_unicode=True)
    except Exception:
        lines = [
            f"title: {json.dumps(data.get('title'))}",
            f"artist: {json.dumps(data.get('artist'))}",
            f"album: {json.dumps(data.get('album'))}",
            f"year: {json.dumps(data.get('year'))}",
            f"duration: {json.dumps(data.get('duration'))}",
            "arrangements:",
        ]
        for arr in data.get("arrangements", []):
            lines.extend(
                [
                    f"  - id: {json.dumps(arr['id'])}",
                    f"    name: {json.dumps(arr['name'])}",
                    f"    file: {json.dumps(arr['file'])}",
                    f"    tuning: {json.dumps(arr['tuning'])}",
                    f"    capo: {int(arr.get('capo', 0))}",
                ]
            )
        lines.append("stems:")
        for stem in data.get("stems", []):
            lines.extend(
                [
                    f"  - id: {json.dumps(stem['id'])}",
                    f"    file: {json.dumps(stem['file'])}",
                    f"    default: {'true' if stem.get('default', True) else 'false'}",
                ]
            )
        return "\n".join(lines) + "\n"


def _cleanup_temp_root(temp_root: Path) -> None:
    try:
        temp_root.mkdir(parents=True, exist_ok=True)
        entries = [p for p in temp_root.iterdir() if p.name.endswith(".sloppak")]
        now = time.time()
        for p in entries:
            try:
                if now - p.stat().st_mtime > 24 * 3600:
                    shutil.rmtree(p, ignore_errors=True) if p.is_dir() else p.unlink(missing_ok=True)
            except OSError:
                pass
    except Exception:
        pass


def setup(app: FastAPI, context: dict) -> None:
    data_dir = _data_dir(context)
    meta_db = context.get("meta_db")
    log = context.get("log")
    if meta_db is not None:
        _ensure_tables(meta_db)
    if log:
        log.info("Triad Lab routes loaded")

    @app.get(f"/api/plugins/{PLUGIN_ID}/status")
    def status() -> dict[str, Any]:
        return {
            "ok": True,
            "plugin": PLUGIN_ID,
            "schema_version": SCHEMA_VERSION,
            "data_dir": str(data_dir),
            "db_backed": meta_db is not None,
            "dlc_dir_available": bool(_get_dlc_dir(context)),
        }

    @app.get(f"/api/plugins/{PLUGIN_ID}/presets")
    def list_presets() -> dict[str, Any]:
        if meta_db is None:
            raise HTTPException(503, "Plugin DB context unavailable")
        rows = meta_db.conn.execute(
            "SELECT id, name, kind, config_json, created_at FROM triad_lab_presets ORDER BY created_at DESC"
        ).fetchall()
        presets = []
        for row in rows:
            try:
                cfg = json.loads(row[3]) if row[3] else {}
            except Exception:
                cfg = {}
            presets.append({"id": row[0], "name": row[1], "kind": row[2], "config": cfg, "created_at": row[4]})
        return {"version": SCHEMA_VERSION, "presets": presets}

    @app.post(f"/api/plugins/{PLUGIN_ID}/presets")
    def save_preset(payload: PresetPayload) -> dict[str, Any]:
        if meta_db is None:
            raise HTTPException(503, "Plugin DB context unavailable")
        with meta_db._lock:
            meta_db.conn.execute(
                "INSERT OR REPLACE INTO triad_lab_presets (id, name, kind, config_json, created_at) VALUES (?, ?, ?, ?, ?)",
                (payload.id, payload.name, payload.kind, json.dumps(payload.config, ensure_ascii=False), time.time()),
            )
            meta_db.conn.commit()
        return {"ok": True, "preset": payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()}

    @app.delete(f"/api/plugins/{PLUGIN_ID}/presets/{{preset_id}}")
    def delete_preset(preset_id: str) -> dict[str, Any]:
        if meta_db is None:
            raise HTTPException(503, "Plugin DB context unavailable")
        with meta_db._lock:
            cur = meta_db.conn.execute("DELETE FROM triad_lab_presets WHERE id = ?", (preset_id,))
            meta_db.conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(404, "Preset not found")
        return {"ok": True, "deleted": preset_id}

    @app.post(f"/api/plugins/{PLUGIN_ID}/temp-sloppak")
    def build_temp_sloppak(payload: TempSloppakPayload) -> dict[str, Any]:
        dlc_dir = _get_dlc_dir(context)
        if not dlc_dir:
            raise HTTPException(409, "DLC folder is not configured")
        dlc_dir = dlc_dir.resolve()
        if not dlc_dir.exists() or not dlc_dir.is_dir():
            raise HTTPException(409, f"Configured DLC folder does not exist: {dlc_dir}")

        session, chart = _normalise_chart(payload.exercise)
        arranged = chart["arrangement"]
        duration = chart["duration"]

        temp_root = dlc_dir / TEMP_ROOT_NAME
        _cleanup_temp_root(temp_root)

        key = str(session.get("key", "C"))
        lesson = str(session.get("lesson", "triad"))
        title = f"Triad Lab - {key} {lesson}"
        slug = "triad-lab-" + uuid.uuid4().hex[:12]
        sloppak_dir = temp_root / f"{slug}.sloppak"
        work_dir = Path(tempfile.mkdtemp(prefix="triadlab-work-", dir=str(data_dir)))

        try:
            (work_dir / "arrangements").mkdir(parents=True, exist_ok=True)
            (work_dir / "stems").mkdir(parents=True, exist_ok=True)
            (work_dir / "arrangements" / "lead.json").write_text(
                json.dumps(arranged, indent=2, sort_keys=False) + "\n",
                encoding="utf-8",
            )
            stem_path = work_dir / "stems" / "full.wav"
            _write_silence_wav(stem_path, duration)

            manifest = {
                "title": title,
                "artist": "Triad Lab",
                "album": "Practice Tools",
                "year": 2026,
                "duration": duration,
                "arrangements": [
                    {
                        "id": "lead",
                        "name": arranged.get("name", "Lead"),
                        "file": "arrangements/lead.json",
                        "tuning": arranged.get("tuning", [0] * len(arranged.get("tuning", [])) or [0] * 6),
                        "capo": 0,
                    }
                ],
                "stems": [{"id": "full", "file": "stems/full.wav", "default": True}],
                "triad_lab": {"version": SCHEMA_VERSION, "generated": True, "session": session},
            }
            (work_dir / "manifest.yaml").write_text(_dump_yaml(manifest), encoding="utf-8")

            if sloppak_dir.exists():
                shutil.rmtree(sloppak_dir, ignore_errors=True)
            shutil.move(str(work_dir), str(sloppak_dir))
            rel = sloppak_dir.relative_to(dlc_dir).as_posix()
            return {
                "ok": True,
                "filename": rel,
                "title": title,
                "duration": duration,
            }
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(500, f"Failed to build temporary Triad Lab sloppak: {exc}") from exc
        finally:
            if work_dir.exists():
                shutil.rmtree(work_dir, ignore_errors=True)
