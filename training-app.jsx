import { useState, useEffect, useCallback } from "react";

// ── Styles ──────────────────────────────────────────────────────────────────
const FONT = `@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@300;400;500;600&display=swap');`;

const css = `
  ${FONT}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0a0a;
    --surface: #111111;
    --surface2: #1a1a1a;
    --surface3: #222222;
    --border: #2a2a2a;
    --accent: #c8f542;
    --accent2: #f5a742;
    --red: #f54242;
    --text: #f0f0f0;
    --text2: #888;
    --text3: #555;
    --font-display: 'Barlow Condensed', sans-serif;
    --font-body: 'Barlow', sans-serif;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--font-body); }
  .app { min-height: 100vh; display: flex; flex-direction: column; }

  /* NAV */
  .nav { background: var(--surface); border-bottom: 1px solid var(--border); padding: 0 16px; display: flex; align-items: center; justify-content: space-between; height: 52px; position: sticky; top: 0; z-index: 100; }
  .nav-brand { font-family: var(--font-display); font-weight: 900; font-size: 22px; letter-spacing: 2px; color: var(--accent); text-transform: uppercase; }
  .nav-tabs { display: flex; gap: 4px; }
  .nav-tab { background: none; border: none; color: var(--text2); font-family: var(--font-display); font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; padding: 6px 12px; cursor: pointer; border-radius: 4px; transition: all 0.15s; }
  .nav-tab:hover { color: var(--text); background: var(--surface2); }
  .nav-tab.active { color: var(--accent); background: var(--surface3); }
  .phase-badge { font-family: var(--font-display); font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 3px 8px; border-radius: 3px; background: var(--surface3); color: var(--accent2); border: 1px solid var(--border); }

  /* LAYOUT */
  .page { flex: 1; padding: 20px 16px; max-width: 900px; margin: 0 auto; width: 100%; }

  /* CARDS */
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 16px; margin-bottom: 12px; }
  .card-title { font-family: var(--font-display); font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--text2); margin-bottom: 12px; }

  /* DASHBOARD */
  .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
  .stat-box { background: var(--surface2); border: 1px solid var(--border); border-radius: 6px; padding: 12px; text-align: center; }
  .stat-val { font-family: var(--font-display); font-size: 28px; font-weight: 900; color: var(--accent); line-height: 1; }
  .stat-lbl { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }

  .week-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-bottom: 16px; }
  .day-dot { height: 36px; border-radius: 4px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--text3); cursor: pointer; transition: all 0.15s; }
  .day-dot.trained { background: var(--surface3); border-color: var(--accent); color: var(--accent); }
  .day-dot.rest { background: var(--surface2); color: var(--text3); }
  .day-dot.today { border-color: var(--accent2); color: var(--accent2); }

  /* MUSCLE VOLUME BARS */
  .vol-grid { display: grid; gap: 8px; }
  .vol-row { display: grid; grid-template-columns: 100px 1fr 40px; align-items: center; gap: 8px; }
  .vol-label { font-size: 12px; color: var(--text2); font-family: var(--font-display); font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
  .vol-bar-bg { height: 8px; background: var(--surface3); border-radius: 4px; overflow: hidden; }
  .vol-bar-fill { height: 100%; border-radius: 4px; transition: width 0.4s ease; }
  .vol-bar-fill.priority { background: var(--accent); }
  .vol-bar-fill.normal { background: #3a6b00; }
  .vol-bar-fill.low { background: var(--text3); }
  .vol-count { font-family: var(--font-display); font-size: 13px; font-weight: 700; color: var(--text2); text-align: right; }

  /* LOG WORKOUT */
  .split-day-btns { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
  .split-btn { font-family: var(--font-display); font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 6px 14px; border-radius: 4px; border: 1px solid var(--border); background: var(--surface2); color: var(--text2); cursor: pointer; transition: all 0.15s; }
  .split-btn:hover { border-color: var(--accent); color: var(--accent); }
  .split-btn.active { background: var(--accent); color: #000; border-color: var(--accent); }

  /* EXERCISE TABLE */
  .ex-table { width: 100%; border-collapse: collapse; }
  .ex-table th { font-family: var(--font-display); font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--text3); padding: 6px 8px; text-align: left; border-bottom: 1px solid var(--border); }
  .ex-table td { padding: 6px 8px; border-bottom: 1px solid var(--border); vertical-align: middle; }
  .ex-name { font-size: 14px; font-weight: 500; color: var(--text); }
  .ex-note { font-size: 11px; color: var(--text3); margin-top: 2px; }
  .ex-tag { display: inline-block; font-family: var(--font-display); font-size: 10px; font-weight: 700; letter-spacing: 1px; padding: 1px 6px; border-radius: 3px; text-transform: uppercase; margin-right: 4px; }
  .ex-tag.priority { background: #1a2d00; color: var(--accent); }
  .ex-tag.elbow { background: #2d1a00; color: var(--accent2); }
  .ex-tag.modified { background: #2d1a00; color: var(--accent2); }

  /* INPUTS */
  .inp { background: var(--surface2); border: 1px solid var(--border); border-radius: 4px; color: var(--text); font-family: var(--font-body); font-size: 14px; padding: 6px 10px; width: 100%; transition: border-color 0.15s; }
  .inp:focus { outline: none; border-color: var(--accent); }
  .inp-sm { width: 64px; text-align: center; }
  .inp-xs { width: 52px; text-align: center; }
  select.inp { cursor: pointer; }
  textarea.inp { resize: vertical; min-height: 72px; }

  .set-row { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
  .set-num { font-family: var(--font-display); font-size: 12px; font-weight: 700; color: var(--text3); width: 20px; }
  .set-lbl { font-size: 11px; color: var(--text3); }
  .btn-add-set { background: none; border: 1px dashed var(--border); color: var(--text3); border-radius: 4px; padding: 4px 10px; cursor: pointer; font-size: 12px; font-family: var(--font-body); transition: all 0.15s; margin-top: 4px; }
  .btn-add-set:hover { border-color: var(--accent); color: var(--accent); }
  .btn-rm { background: none; border: none; color: var(--text3); cursor: pointer; font-size: 14px; padding: 0 4px; transition: color 0.15s; }
  .btn-rm:hover { color: var(--red); }

  /* BUTTONS */
  .btn { font-family: var(--font-display); font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 10px 20px; border-radius: 5px; border: none; cursor: pointer; transition: all 0.15s; }
  .btn-primary { background: var(--accent); color: #000; }
  .btn-primary:hover { background: #d4ff4a; }
  .btn-secondary { background: var(--surface3); color: var(--text); border: 1px solid var(--border); }
  .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }
  .btn-danger { background: var(--surface3); color: var(--red); border: 1px solid var(--border); }
  .btn-danger:hover { background: #2d0000; border-color: var(--red); }
  .btn-sm { padding: 6px 14px; font-size: 12px; }
  .btn-row { display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap; }

  /* AI FEEDBACK */
  .ai-box { background: var(--surface2); border: 1px solid var(--border); border-left: 3px solid var(--accent); border-radius: 6px; padding: 14px; margin-top: 12px; }
  .ai-label { font-family: var(--font-display); font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--accent); margin-bottom: 8px; }
  .ai-text { font-size: 14px; line-height: 1.6; color: var(--text2); white-space: pre-wrap; }
  .ai-input-row { display: flex; gap: 8px; margin-top: 12px; }
  .ai-input-row .inp { flex: 1; }
  .loading-dots { display: inline-flex; gap: 4px; align-items: center; }
  .loading-dots span { width: 6px; height: 6px; background: var(--accent); border-radius: 50%; animation: dot-pulse 1.2s infinite; }
  .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
  .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes dot-pulse { 0%,80%,100% { opacity: 0.2; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }

  /* HISTORY */
  .history-entry { background: var(--surface2); border: 1px solid var(--border); border-radius: 6px; padding: 14px; margin-bottom: 10px; }
  .history-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
  .history-date { font-family: var(--font-display); font-size: 13px; font-weight: 700; letter-spacing: 1px; color: var(--text2); text-transform: uppercase; }
  .history-day { font-family: var(--font-display); font-size: 18px; font-weight: 900; color: var(--accent); text-transform: uppercase; }
  .history-ex { font-size: 13px; color: var(--text2); margin-bottom: 4px; }
  .history-sets { font-size: 12px; color: var(--text3); margin-left: 12px; }
  .feel-badge { font-family: var(--font-display); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 3px; }
  .feel-1 { background: #2d0000; color: #ff6666; }
  .feel-2 { background: #2d1a00; color: var(--accent2); }
  .feel-3 { background: #1a1a1a; color: var(--text2); }
  .feel-4 { background: #1a2d00; color: #a0d060; }
  .feel-5 { background: #002d1a; color: var(--accent); }

  /* PHASE / SETTINGS */
  .phase-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .phase-option { border: 1px solid var(--border); border-radius: 6px; padding: 14px; cursor: pointer; transition: all 0.15s; background: var(--surface2); }
  .phase-option:hover { border-color: var(--accent); }
  .phase-option.selected { border-color: var(--accent); background: #0f1a00; }
  .phase-name { font-family: var(--font-display); font-size: 16px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; color: var(--accent); }
  .phase-desc { font-size: 12px; color: var(--text3); margin-top: 4px; line-height: 1.4; }

  /* MACROS */
  .macro-row { display: flex; gap: 10px; align-items: center; margin-bottom: 10px; flex-wrap: wrap; }
  .macro-group { display: flex; flex-direction: column; gap: 4px; }
  .macro-lbl { font-family: var(--font-display); font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--text3); }

  /* EMPTY STATE */
  .empty { text-align: center; padding: 40px 20px; color: var(--text3); }
  .empty-icon { font-size: 36px; margin-bottom: 12px; }
  .empty-text { font-family: var(--font-display); font-size: 14px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }

  /* SCROLLBAR */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--surface3); border-radius: 3px; }

  /* SWAP MODAL */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 200; display: flex; align-items: flex-end; justify-content: center; }
  .modal { background: var(--surface); border: 1px solid var(--border); border-radius: 12px 12px 0 0; width: 100%; max-width: 600px; max-height: 80vh; display: flex; flex-direction: column; overflow: hidden; }
  .modal-header { padding: 16px 16px 12px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
  .modal-title { font-family: var(--font-display); font-size: 14px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--text2); }
  .modal-subtitle { font-family: var(--font-display); font-size: 11px; color: var(--accent); text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
  .modal-close { background: none; border: none; color: var(--text3); font-size: 20px; cursor: pointer; padding: 0 4px; line-height: 1; }
  .modal-close:hover { color: var(--text); }
  .modal-body { overflow-y: auto; padding: 12px 16px; flex: 1; }
  .swap-filter { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
  .swap-filter-btn { font-family: var(--font-display); font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 4px 10px; border-radius: 3px; border: 1px solid var(--border); background: var(--surface2); color: var(--text3); cursor: pointer; transition: all 0.15s; }
  .swap-filter-btn.active { border-color: var(--accent); color: var(--accent); background: #0f1a00; }
  .swap-option { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border); background: var(--surface2); margin-bottom: 6px; cursor: pointer; transition: all 0.15s; }
  .swap-option:hover { border-color: var(--accent); background: #0f1a00; }
  .swap-option.current { border-color: var(--text3); opacity: 0.5; cursor: default; }
  .swap-option-name { font-size: 14px; font-weight: 500; color: var(--text); }
  .swap-option-meta { font-size: 11px; color: var(--text3); margin-top: 2px; }
  .swap-custom { margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border); }
  .swap-custom-label { font-family: var(--font-display); font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--text3); margin-bottom: 8px; }
  .swap-custom-row { display: flex; gap: 8px; }
  .linked-ss { border-left: 3px solid var(--accent2) !important; background: #080f00 !important; }
  .linked-cs { border-left: 3px solid #42c8f5 !important; background: #00080f !important; }
  .linked-ss-target { border-left: 3px solid var(--accent2) !important; background: #080f00 !important; }
  .linked-cs-target { border-left: 3px solid #42c8f5 !important; background: #00080f !important; }
  .btn-move { background: none; border: 1px solid var(--border); color: var(--text3); border-radius: 3px; width: 22px; height: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 10px; padding: 0; transition: all 0.15s; }
  .btn-move:hover { border-color: var(--accent); color: var(--accent); }
  .btn-move:disabled { opacity: 0.2; cursor: default; }
  .set-type-badge { display: inline-flex; align-items: center; padding: 1px 6px; border-radius: 3px; font-size: 10px; font-family: var(--font-display); font-weight: 700; letter-spacing: 1px; cursor: pointer; border: 1px solid; transition: all 0.15s; white-space: nowrap; user-select: none; }
  .set-type-normal { color: var(--text3); border-color: var(--border); background: transparent; }
  .set-type-drop { color: #f59e0b; border-color: #f59e0b; background: #1a1000; }
  .set-type-restpause { color: #a78bfa; border-color: #a78bfa; background: #0d0020; }
  .drop-segment { display: flex; align-items: center; gap: 6px; margin-top: 4px; padding: 4px 6px; background: #1a1000; border-radius: 4px; border: 1px solid #f59e0b33; }
  .btn-swap { background: none; border: 1px solid var(--border); color: var(--text3); border-radius: 4px; padding: 3px 8px; font-size: 11px; font-family: var(--font-display); font-weight: 700; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
  .btn-swap:hover { border-color: var(--accent2); color: var(--accent2); }

  /* PROGRESSION */
  .prog-card { border-radius: 6px; padding: 7px 10px; margin-top: 6px; display: inline-flex; align-items: center; gap: 6px; }
  .prog-label { font-family: var(--font-display); font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }

  /* ELBOW ALERT */
  .alert { background: #2d1a00; border: 1px solid #5a3a00; border-radius: 6px; padding: 10px 14px; margin-bottom: 12px; font-size: 13px; color: var(--accent2); line-height: 1.5; }
  .alert strong { font-family: var(--font-display); font-weight: 700; letter-spacing: 1px; text-transform: uppercase; font-size: 11px; display: block; margin-bottom: 4px; }

  /* MACRO LOG */
  .macro-today { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
  .macro-tile { background: var(--surface2); border: 1px solid var(--border); border-radius: 6px; padding: 10px; text-align: center; }
  .macro-val { font-family: var(--font-display); font-size: 22px; font-weight: 900; color: var(--text); }
  .macro-unit { font-size: 10px; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; }

  @media (max-width: 600px) {
    .stats-row { grid-template-columns: repeat(3,1fr); }
    .phase-grid { grid-template-columns: 1fr; }
    .nav-brand { font-size: 17px; }
    .nav-tab { font-size: 11px; padding: 5px 8px; }
  }
`;

// ── Constants ─────────────────────────────────────────────────────────────────

// ── P/P/L/Upper/Lower Split ───────────────────────────────────────────────────
// Schedule: Mon=Push, Tue=Pull, Wed=Legs, Thu=Rest, Fri=Upper, Sat=Lower, Sun=Rest
// Rep philosophy: 8-20 reps depending on exercise, 0-1 RIR, 80s/90s bodybuilding style
// Volume target: 16-24 sets/muscle/week across both hits

const SPLIT = {
  "Push — Chest / Front & Side Delts / Triceps": {
    muscles: ["chest", "front_delts", "side_delts", "triceps"],
    note: "Mon · Fri upper carries the second chest/delt hit",
    exercises: [
      // CHEST — 3 exercises, ~12 sets. Incline emphasis for upper chest fullness
      { name: "Incline DB Press", muscles: ["chest", "front_delts"], repRange: "10-12", note: "Primary chest builder — upper chest emphasis", priority: true, elbowSafe: true },
      { name: "Flat DB Press", muscles: ["chest"], repRange: "10-12", note: "Full pec thickness", priority: true, elbowSafe: true },
      { name: "Cable Chest Fly (Mid)", muscles: ["chest"], repRange: "12-15", note: "Mid-cable — safe on elbows, great squeeze", elbowSafe: true },
      // SIDE DELTS — 2 exercises, ~8 sets. High rep, pump focused
      { name: "DB Lateral Raise", muscles: ["side_delts"], repRange: "15-20", note: "Control the negative, no swinging", priority: true },
      { name: "Cable Lateral Raise", muscles: ["side_delts"], repRange: "15-20", note: "Constant tension — better than DBs for some", priority: true, elbowSafe: true },
      // TRICEPS — 2 exercises, ~8 sets. Pushdown priority
      { name: "Cable Tricep Pushdown (Rope)", muscles: ["triceps"], repRange: "12-15", note: "Flare hands at bottom for full contraction", elbowSafe: true },
      { name: "Overhead Cable Tricep Extension", muscles: ["triceps"], repRange: "12-15", note: "Long head stretch — monitor elbow comfort", elbowSafe: true },
    ]
  },

  "Pull — Back / Rear Delts / Biceps (Modified)": {
    muscles: ["back", "rear_delts", "biceps"],
    note: "Tue · Back, rear delts, and arms.",
    exercises: [
      // BACK — 4 exercises, ~12-16 sets. Width and thickness both
      { name: "Neutral Grip Cable Pulldown", muscles: ["back"], repRange: "10-12", note: "Neutral grip — elbow safe, great lat stretch", priority: true, elbowSafe: true },
      { name: "Seated Cable Row (Neutral Grip)", muscles: ["back"], repRange: "10-12", note: "Elbows in, full stretch, slow negative", priority: true, elbowSafe: true },
      { name: "Single-Arm DB Row", muscles: ["back"], repRange: "10-15", note: "Full ROM — let the lat stretch at bottom", priority: true, elbowSafe: true },
      { name: "Straight-Arm Cable Pulldown", muscles: ["back"], repRange: "12-15", note: "Lat isolator — keep arms straight throughout", elbowSafe: true },
      // REAR DELTS — 2 exercises, ~8 sets
      { name: "Cable Rear Delt Fly", muscles: ["rear_delts"], repRange: "15-20", note: "High rep, squeeze at full extension", elbowSafe: true },
      { name: "Rope Face Pull", muscles: ["rear_delts"], repRange: "15-20", note: "Pull to forehead, elbows high", elbowSafe: true },
      // BICEPS — 1-2 exercises, reduced volume
      { name: "Incline DB Curl", muscles: ["biceps"], repRange: "10-12", note: "⚠ Elbow recovery: 2-3 sets only. Best stretch position.", elbowSafe: true, elbowModified: true },
      { name: "Underhand Cable Curl", muscles: ["biceps"], repRange: "12-15", note: "⚠ Elbow recovery: 2-3 sets only. Supinated grip is safest.", elbowSafe: true, elbowModified: true },
    ]
  },

  "Legs — Quads / Hamstrings / Calves": {
    muscles: ["quads", "hamstrings", "glutes", "calves"],
    note: "Wed · Quad priority — extra volume. Full lower body session.",
    exercises: [
      // QUADS — 3 exercises, ~12 sets. Priority muscle
      { name: "Leg Extension", muscles: ["quads"], repRange: "12-15", note: "Start here — pre-exhaust and knee warm-up", priority: true, elbowSafe: true },
      { name: "Hack Squat", muscles: ["quads", "glutes"], repRange: "10-12", note: "Feet shoulder-width, full depth for quad sweep", priority: true, elbowSafe: true },
      { name: "Leg Press", muscles: ["quads", "glutes"], repRange: "10-15", note: "High foot placement = glutes. Low = quads.", priority: true, elbowSafe: true },
      // HAMSTRINGS — 2 exercises, ~8 sets
      { name: "Romanian Deadlift", muscles: ["hamstrings", "glutes"], repRange: "10-12", note: "Feel the stretch — don't round the back", elbowSafe: true },
      { name: "Lying Leg Curl", muscles: ["hamstrings"], repRange: "12-15", note: "Plantarflex foot for more bicep femoris", elbowSafe: true },
      // CALVES — 2 exercises, ~8 sets. High rep, slow negatives
      { name: "Standing Calf Raise", muscles: ["calves"], repRange: "12-20", note: "Full stretch at bottom — don't bounce", elbowSafe: true },
      { name: "Seated Calf Raise", muscles: ["calves"], repRange: "15-20", note: "Hits soleus — essential for calf thickness", elbowSafe: true },
    ]
  },

  "Upper — Chest / Back / Delts / Arms": {
    muscles: ["chest", "back", "side_delts", "rear_delts", "biceps", "triceps"],
    note: "Fri · Second hit for everything upper. Keep intensity honest — this is frequency work.",
    exercises: [
      // CHEST — 2 exercises, ~6-8 sets. Second hit, slightly different angles
      { name: "Pec Deck / Machine Fly", muscles: ["chest"], repRange: "12-15", note: "Full stretch — great second chest hit", elbowSafe: true },
      { name: "Cable Chest Fly (High to Low)", muscles: ["chest"], repRange: "12-15", note: "Lower chest emphasis — variety from Push day", elbowSafe: true },
      // BACK — 2 exercises, ~6-8 sets
      { name: "Chest-Supported DB Row", muscles: ["back"], repRange: "10-12", note: "Takes lower back out — pure lat and mid-back", elbowSafe: true },
      { name: "Underhand Cable Pulldown", muscles: ["back"], repRange: "10-12", note: "Supinated grip — safe, strong bicep involvement", elbowSafe: true },
      // SIDE + REAR DELTS — 2 exercises
      { name: "Machine Lateral Raise", muscles: ["side_delts"], repRange: "15-20", note: "Constant tension — good pump day option", elbowSafe: true },
      { name: "Rear Delt Machine Fly", muscles: ["rear_delts"], repRange: "15-20", note: "Second rear delt hit for the week", elbowSafe: true },
      // BICEPS — 1-2 sets only while recovering
      { name: "High Cable Curl", muscles: ["biceps"], repRange: "12-15", note: "⚠ Elbow recovery: 2-3 sets max. Peak contraction focus.", elbowSafe: true, elbowModified: true },
      // TRICEPS — 2 exercises
      { name: "Cable Tricep Pushdown (Bar)", muscles: ["triceps"], repRange: "12-15", note: "Second tricep hit — different feel from rope", elbowSafe: true },
      { name: "Machine Tricep Extension", muscles: ["triceps"], repRange: "12-15", note: "Isolate without joint stress", elbowSafe: true },
    ]
  },

  "Lower — Quads / Hamstrings / Calves": {
    muscles: ["quads", "hamstrings", "glutes", "calves"],
    note: "Sat · Second leg hit. Keep RIR honest — this follows Upper day.",
    exercises: [
      // QUADS — 2 exercises, ~8 sets. Second hit, slightly different stimulus
      { name: "Bulgarian Split Squat", muscles: ["quads", "glutes"], repRange: "10-12", note: "Single-leg — exposes imbalances, huge quad stretch", priority: true, elbowSafe: true },
      { name: "Leg Extension", muscles: ["quads"], repRange: "12-15", note: "Pump finisher — high rep, slow eccentric", priority: true, elbowSafe: true },
      // HAMSTRINGS — 2 exercises
      { name: "Seated Leg Curl", muscles: ["hamstrings"], repRange: "12-15", note: "Different angle from lying curl — hits differently", elbowSafe: true },
      { name: "Stiff-Leg Deadlift", muscles: ["hamstrings", "glutes"], repRange: "10-12", note: "Keep hips square, feel the stretch", elbowSafe: true },
      // CALVES — 1-2 exercises
      { name: "Leg Press Calf Raise", muscles: ["calves"], repRange: "15-20", note: "Third calf hit for the week — high rep", elbowSafe: true },
    ]
  },

  "Rest": { muscles: [], exercises: [] }
};

const SPLIT_ORDER = [
  "Push — Chest / Front & Side Delts / Triceps",
  "Pull — Back / Rear Delts / Biceps (Modified)",
  "Legs — Quads / Hamstrings / Calves",
  "Upper — Chest / Back / Delts / Arms",
  "Lower — Quads / Hamstrings / Calves",
  "Rest"
];

// Full exercise library for swapping — organized by muscle
const EXERCISE_LIBRARY = [
  // BACK
  { name: "Neutral Grip Cable Pulldown", muscles: ["back"], repRange: "10-12", elbowSafe: true, note: "Neutral grip — elbow friendly" },
  { name: "Wide Grip Cable Pulldown", muscles: ["back"], repRange: "10-12", note: "Overhand — monitor elbow" },
  { name: "Underhand Cable Pulldown", muscles: ["back"], repRange: "10-12", elbowSafe: true, note: "Supinated grip, heavy bicep involvement" },
  { name: "Seated Cable Row (Neutral)", muscles: ["back"], repRange: "10-12", elbowSafe: true },
  { name: "Seated Cable Row (Wide)", muscles: ["back"], repRange: "10-12", note: "More upper back emphasis" },
  { name: "Single-Arm DB Row", muscles: ["back"], repRange: "10-15", elbowSafe: true },
  { name: "Chest-Supported DB Row", muscles: ["back"], repRange: "10-12", elbowSafe: true, note: "Takes lower back out" },
  { name: "Machine Row", muscles: ["back"], repRange: "10-15", elbowSafe: true },
  { name: "T-Bar Row", muscles: ["back"], repRange: "8-12" },
  { name: "Pull-Up (Neutral Grip)", muscles: ["back"], repRange: "8-12", elbowSafe: true },
  { name: "Straight-Arm Cable Pulldown", muscles: ["back"], repRange: "12-15", elbowSafe: true, note: "Great lat isolator" },
  // CHEST
  { name: "Incline DB Press", muscles: ["chest", "front_delts"], repRange: "10-12" },
  { name: "Flat DB Press", muscles: ["chest"], repRange: "10-12" },
  { name: "Incline Barbell Press", muscles: ["chest", "front_delts"], repRange: "8-10" },
  { name: "Flat Barbell Press", muscles: ["chest"], repRange: "8-10" },
  { name: "Cable Chest Fly (Mid)", muscles: ["chest"], repRange: "12-15", elbowSafe: true, note: "Mid-cable — easier on elbows" },
  { name: "Cable Chest Fly (High to Low)", muscles: ["chest"], repRange: "12-15", elbowSafe: true, note: "Lower chest emphasis" },
  { name: "Pec Deck / Machine Fly", muscles: ["chest"], repRange: "12-15", elbowSafe: true },
  { name: "Dips (Chest Focus)", muscles: ["chest", "triceps"], repRange: "10-12", note: "Lean forward for chest" },
  { name: "Smith Machine Incline Press", muscles: ["chest", "front_delts"], repRange: "10-12" },
  // QUADS
  { name: "Leg Extension", muscles: ["quads"], repRange: "12-15", priority: true, elbowSafe: true },
  { name: "Hack Squat", muscles: ["quads", "glutes"], repRange: "10-12", priority: true, elbowSafe: true },
  { name: "Leg Press", muscles: ["quads", "glutes"], repRange: "10-15", priority: true, elbowSafe: true },
  { name: "Bulgarian Split Squat", muscles: ["quads", "glutes"], repRange: "10-12", priority: true, elbowSafe: true },
  { name: "Sissy Squat", muscles: ["quads"], repRange: "12-15", priority: true, elbowSafe: true, note: "Brutal quad isolator" },
  { name: "Front Squat", muscles: ["quads", "glutes"], repRange: "8-10", priority: true },
  { name: "Walking Lunge", muscles: ["quads", "glutes"], repRange: "10-12", elbowSafe: true },
  // HAMSTRINGS
  { name: "Romanian Deadlift", muscles: ["hamstrings", "glutes"], repRange: "10-12", elbowSafe: true },
  { name: "Lying Leg Curl", muscles: ["hamstrings"], repRange: "12-15", elbowSafe: true },
  { name: "Seated Leg Curl", muscles: ["hamstrings"], repRange: "12-15", elbowSafe: true },
  { name: "Single-Leg Curl", muscles: ["hamstrings"], repRange: "12-15", elbowSafe: true },
  { name: "Stiff-Leg Deadlift", muscles: ["hamstrings", "glutes"], repRange: "10-12", elbowSafe: true },
  // GLUTES
  { name: "Hip Thrust", muscles: ["glutes"], repRange: "10-15", elbowSafe: true },
  { name: "Cable Kickback", muscles: ["glutes"], repRange: "15-20", elbowSafe: true },
  // CALVES
  { name: "Standing Calf Raise", muscles: ["calves"], repRange: "12-20", elbowSafe: true },
  { name: "Seated Calf Raise", muscles: ["calves"], repRange: "15-20", elbowSafe: true },
  { name: "Leg Press Calf Raise", muscles: ["calves"], repRange: "15-20", elbowSafe: true },
  // BICEPS
  { name: "Incline DB Curl", muscles: ["biceps"], repRange: "10-12", elbowSafe: true, note: "Elbow-friendly, great stretch" },
  { name: "Underhand Cable Curl", muscles: ["biceps"], repRange: "12-15", elbowSafe: true, note: "Supinated — easier on brachialis" },
  { name: "Cable Curl (Supinated)", muscles: ["biceps"], repRange: "12-15", elbowSafe: true },
  { name: "EZ Bar Curl", muscles: ["biceps"], repRange: "10-12", note: "Semi-supinated — moderate elbow load" },
  { name: "Concentration Curl", muscles: ["biceps"], repRange: "12-15", elbowSafe: true },
  { name: "Machine Curl", muscles: ["biceps"], repRange: "12-15", elbowSafe: true },
  { name: "Spider Curl", muscles: ["biceps"], repRange: "12-15", elbowSafe: true, note: "High peak contraction" },
  { name: "High Cable Curl", muscles: ["biceps"], repRange: "12-15", elbowSafe: true },
  // TRICEPS
  { name: "Cable Tricep Pushdown (Rope)", muscles: ["triceps"], repRange: "12-15", elbowSafe: true },
  { name: "Cable Tricep Pushdown (Bar)", muscles: ["triceps"], repRange: "12-15", elbowSafe: true },
  { name: "Overhead DB Tricep Extension", muscles: ["triceps"], repRange: "12-15", note: "Monitor elbow position" },
  { name: "Skull Crusher (EZ Bar)", muscles: ["triceps"], repRange: "10-12" },
  { name: "Single-Arm Cable Kickback", muscles: ["triceps"], repRange: "12-15", elbowSafe: true },
  { name: "Machine Tricep Extension", muscles: ["triceps"], repRange: "12-15", elbowSafe: true },
  { name: "Close-Grip Bench Press", muscles: ["triceps", "chest"], repRange: "10-12" },
  // SIDE DELTS
  { name: "DB Lateral Raise", muscles: ["side_delts"], repRange: "12-20" },
  { name: "Cable Lateral Raise", muscles: ["side_delts"], repRange: "15-20", elbowSafe: true },
  { name: "Machine Lateral Raise", muscles: ["side_delts"], repRange: "15-20", elbowSafe: true },
  { name: "Leaning Cable Lateral Raise", muscles: ["side_delts"], repRange: "15-20", elbowSafe: true, note: "Better stretch at bottom" },
  // REAR DELTS / FRONT DELTS
  { name: "Cable Rear Delt Fly", muscles: ["rear_delts"], repRange: "15-20", elbowSafe: true },
  { name: "Rope Face Pull", muscles: ["rear_delts"], repRange: "15-20", elbowSafe: true },
  { name: "Rear Delt Machine Fly", muscles: ["rear_delts"], repRange: "15-20", elbowSafe: true },
  { name: "Bent-Over DB Rear Delt Fly", muscles: ["rear_delts"], repRange: "15-20" },
  { name: "DB Front Raise", muscles: ["front_delts"], repRange: "12-15" },
  { name: "Cable Front Raise", muscles: ["front_delts"], repRange: "12-15", elbowSafe: true },
];

const MUSCLES = {
  back: { label: "Back", priority: true },
  chest: { label: "Chest", priority: true },
  quads: { label: "Quads", priority: true },
  side_delts: { label: "Side Delts", priority: true },
  rear_delts: { label: "Rear Delts", priority: false },
  front_delts: { label: "Front Delts", priority: false },
  biceps: { label: "Biceps", priority: true },
  triceps: { label: "Triceps", priority: true },
  hamstrings: { label: "Hamstrings", priority: false },
  glutes: { label: "Glutes", priority: false },
  calves: { label: "Calves", priority: false },
};

const PHASES = [
  { id: "recovery", label: "Recovery", color: "#f5a742", desc: "Coming off high intensity. Lower load, building volume back up. Joint health priority." },
  { id: "maintenance", label: "Maintenance", color: "#aaa", desc: "Stable calories. Hold muscle, maintain volume and intensity." },
  { id: "cut", label: "Cut", color: "#42c8f5", desc: "Caloric deficit. Protect muscle, manage fatigue. Strength dips are expected." },
  { id: "build", label: "Build", color: "#c8f542", desc: "Surplus or slight surplus. Push volume and progressive overload." },
];

const FEEL_LABELS = { 1: "Rough", 2: "Meh", 3: "Solid", 4: "Strong", 5: "Dialed" };

const USER_PROFILE = `You are an AI training coach for a serious natural bodybuilder. Here is their complete profile:

GOAL: 80s/90s era classic physique — proportional, full muscle bellies, tight waist. Not mass monster. Think Frank Zane, Serge Nubret, Bob Paris era.
PRIORITY MUSCLES: Back width, Chest thickness, Quads (extra attention), Side Delts, Arms. These get starred in the app and should get extra volume attention in your feedback.

TRAINING PHILOSOPHY:
- Rep ranges: 8-20 depending on exercise. Compounds 8-12, isolation 12-20.
- RIR: Prefers 0-1 RIR. Stops when they know they have 2-3 more but rarely does. Tendency to push hard — flag if this becomes a recovery issue.
- Volume target: 16-24 sets per muscle per week across both sessions.
- Rest: 1.5-2 min between sets, flexible. Not strict.
- Style: Straight sets primarily. Occasionally enjoys supersets, myo-reps. No need to program these unless they ask.
- Has tried high-intensity/low-volume approaches multiple times. Always ends up beat up. Thrives on moderate intensity, higher volume. Do NOT suggest high intensity approaches.

CURRENT SPLIT (P/P/L/Upper/Lower):
- Mon: Push — Chest / Front & Side Delts / Triceps
- Tue: Pull — Back / Rear Delts / Biceps
- Wed: Legs — Quads / Hamstrings / Calves
- Thu: Rest
- Fri: Upper — Chest / Back / Delts / Arms (frequency hit)
- Sat: Lower — Quads / Hamstrings / Calves (frequency hit)
- Sun: Rest
This gives 2x/week frequency on all muscle groups.

CURRENT INJURY: Provided dynamically per session via recovery context. When recovery context is present, use it to flag relevant exercises and tailor advice.

NUTRITION / PHASE CONTEXT:
Currently transitioning: erratic eating → 1 week maintenance → cut. Pool season (spring/summer) is the deadline. Strength dips on a cut are expected — do not flag these as program problems. Note: this athlete actually finds motivation/drive can INCREASE on a cut even when strength dips slightly.

TRAINING HISTORY:
- Experienced bodybuilder, not a beginner
- Journal-based logging habit (transferring to this app)
- Has been in a funk — new structure is part of breaking out of it
- Coming off a beat-up phase from high intensity training
- Gym talker — sessions can run longer than planned

When giving feedback: be direct, specific, and practical. Reference their actual logged data. Flag volume imbalances across the week. Acknowledge cut phase context when interpreting performance. Be a training partner, not a clinical advisor. Keep it conversational.`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().split("T")[0];
}

function fmtDate(d) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" });
}

function totalSets(workout) {
  return workout.exercises.reduce((s, ex) => s + (ex.sets?.length || 0), 0);
}

function muscleVolume(workouts, days = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const vol = {};
  workouts.filter(w => new Date(w.date) >= cutoff).forEach(w => {
    w.exercises.forEach(ex => {
      // Only count sets that were actually logged with reps
      const workedSets = (ex.sets || []).filter(s => s.reps && parseFloat(s.reps) > 0).length;
      if (workedSets === 0) return;
      // Muscles may be missing on old saved data — fall back to library lookup by name
      let muscles = ex.muscles && ex.muscles.length > 0 ? ex.muscles : null;
      if (!muscles) {
        const lib = EXERCISE_LIBRARY.find(l => l.name === ex.name);
        muscles = lib ? lib.muscles : null;
      }
      if (!muscles || muscles.length === 0) return;
      // Credit primary muscle only (first in array) to avoid double-counting
      const primary = muscles[0];
      vol[primary] = (vol[primary] || 0) + workedSets;
    });
  });
  return vol;
}

function newSet() { return { reps: "", weight: "", rir: "1", type: "normal", drops: [], pauseReps: "" }; }
function newExercise(ex) {
  return { ...ex, sets: [newSet(), newSet(), newSet()] };
}

// ── API Call ──────────────────────────────────────────────────────────────────

async function callClaude(messages, onChunk) {
  // Non-streaming — artifact CSP blocks long-running SSE streams mid-response.
  // Streaming will work correctly once hosted on Vercel.
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": typeof ANTHROPIC_API_KEY !== "undefined" ? ANTHROPIC_API_KEY : "", "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16000,
      system: USER_PROFILE,
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const full = (data.content || []).map(b => b.text || "").join("");
  onChunk(full);
  return full;
}

// Non-streaming Claude call that returns parsed JSON
async function callClaudeJSON(prompt, systemPrompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": typeof ANTHROPIC_API_KEY !== "undefined" ? ANTHROPIC_API_KEY : "", "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  const text = (data.content || []).map(b => b.text || "").join("");
  // Strip markdown fences if present
  const clean = text.replace(/^```json\s*/m, "").replace(/^```\s*/m, "").replace(/```\s*$/m, "").trim();
  return JSON.parse(clean);
}

// ── Storage ───────────────────────────────────────────────────────────────────

// Storage — uses localStorage (persists across reloads in same browser/device)
function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem("ironlog_" + key);
    if (raw) return JSON.parse(raw);
    return fallback;
  } catch (e) {
    return fallback;
  }
}

function saveData(key, val) {
  try {
    localStorage.setItem("ironlog_" + key, JSON.stringify(val));
    return true;
  } catch (e) {
    console.error("localStorage save failed:", key, e);
    return false;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

// ── Dashboard ─────────────────────────────────────────────────────────────────

function Dashboard({ workouts, phase, onNavigate }) {
  const vol7 = muscleVolume(workouts, 7);
  const vol14 = muscleVolume(workouts, 14);
  const recent = [...workouts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
  const totalThisWeek = workouts.filter(w => {
    const d = new Date(w.date);
    const now = new Date();
    const diff = (now - d) / 86400000;
    return diff <= 7;
  }).length;

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split("T")[0];
    const trained = workouts.find(w => w.date === ds);
    const isToday = ds === today();
    days.push({ ds, trained, isToday, label: d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1) });
  }

  const maxVol = Math.max(24, ...Object.values(vol7));

  return (
    <div className="page">
      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-val">{totalThisWeek}</div>
          <div className="stat-lbl">Sessions / 7d</div>
        </div>
        <div className="stat-box">
          <div className="stat-val">{workouts.reduce((s, w) => s + totalSets(w), 0)}</div>
          <div className="stat-lbl">Total Sets</div>
        </div>
        <div className="stat-box">
          <div className="stat-val" style={{ color: PHASES.find(p => p.id === phase)?.color }}>
            {PHASES.find(p => p.id === phase)?.label}
          </div>
          <div className="stat-lbl">Phase</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Last 7 Days</div>
        <div className="week-grid">
          {days.map(({ ds, trained, isToday, label }) => (
            <div key={ds} className={`day-dot ${trained ? "trained" : "rest"} ${isToday ? "today" : ""}`}>
              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Weekly Volume (sets)</div>
        <div className="vol-grid">
          {Object.entries(MUSCLES).map(([key, { label, priority }]) => {
            const sets = vol7[key] || 0;
            const pct = Math.min(100, (sets / 24) * 100);
            const cls = sets === 0 ? "low" : priority ? "priority" : "normal";
            return (
              <div key={key} className="vol-row">
                <div className="vol-label">{label}{priority ? " ★" : ""}</div>
                <div className="vol-bar-bg"><div className={`vol-bar-fill ${cls}`} style={{ width: `${pct}%` }} /></div>
                <div className="vol-count">{sets}</div>
              </div>
            );
          })}
        </div>
      </div>

      {recent.length > 0 && (
        <div className="card">
          <div className="card-title">Recent Sessions</div>
          {recent.slice(0, 3).map(w => (
            <div key={w.id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1 }}>{w.splitDay}</span>
                <span style={{ fontSize: 12, color: "var(--text3)" }}>{fmtDate(w.date)} · {totalSets(w)} sets</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {workouts.length === 0 && (
        <div className="empty">
          <div className="empty-icon">💪</div>
          <div className="empty-text">No sessions logged yet</div>
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-primary" onClick={() => onNavigate("log")}>Log First Workout</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Log Workout ───────────────────────────────────────────────────────────────

// mode: "swap" (replacing an exercise) | "add" (appending a new one)
function ExercisePickerModal({ exercise, mode, onSelect, onClose, customExercises, onSaveCustomExercise }) {
  const [search, setSearch] = useState("");
  const [customReps, setCustomReps] = useState("10-12");
  const [customMuscle, setCustomMuscle] = useState("back");
  const [saveToLibrary, setSaveToLibrary] = useState(true);
  const searchRef = useCallback(el => el && setTimeout(() => el.focus(), 50), []);

  const isSwap = mode === "swap";
  const targetMuscles = exercise?.muscles || [];

  // Combine built-in library + saved custom exercises
  const fullLibrary = [
    ...EXERCISE_LIBRARY,
    ...(customExercises || []).filter(ce => !EXERCISE_LIBRARY.some(e => e.name.toLowerCase() === ce.name.toLowerCase())),
  ];

  // Base candidates — swap filters to same muscle, add shows all
  const candidates = isSwap
    ? fullLibrary.filter(e => e.name !== exercise?.name && e.muscles.some(m => targetMuscles.includes(m)))
    : fullLibrary;

  const q = search.trim().toLowerCase();

  // Search filters across name, muscles, and notes
  const filtered = q
    ? candidates.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.muscles.some(m => m.toLowerCase().includes(q)) ||
        (e.note || "").toLowerCase().includes(q)
      )
    : candidates;

  // If search text doesn't match anything in library — treat as new custom
  const isNewCustom = q && filtered.length === 0;

  const handleSelect = (ex) => {
    onSelect(ex);
  };

  const handleAddCustom = () => {
    if (!q) return;
    const ex = {
      name: search.trim(),
      muscles: isSwap ? targetMuscles : [customMuscle],
      repRange: customReps,
      note: "Custom exercise",
      custom: true,
    };
    if (saveToLibrary && onSaveCustomExercise) onSaveCustomExercise(ex);
    onSelect(ex);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">{isSwap ? "Swap Exercise" : "Add Exercise"}</div>
            <div className="modal-subtitle">{isSwap ? `Replacing: ${exercise?.name}` : "Search library or type to add new"}</div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">

          {/* SEARCH — always at top, autofocused */}
          <div style={{ position: "relative", marginBottom: 12 }}>
            <input
              ref={searchRef}
              className="inp"
              placeholder="Search exercises or type a new one..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && isNewCustom && handleAddCustom()}
              style={{ paddingLeft: 32 }}
            />
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text3)", fontSize: 14 }}>🔍</span>
            {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 16 }}>×</button>}
          </div>

          {/* NEW CUSTOM EXERCISE — shown when search finds nothing */}
          {isNewCustom && (
            <div style={{ background: "#050f00", border: "1px solid var(--accent)", borderRadius: 6, padding: "12px 14px", marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>✦ NEW EXERCISE: {search.trim()}</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                <div>
                  <div className="macro-lbl" style={{ marginBottom: 4 }}>Rep range</div>
                  <input className="inp inp-sm" style={{ width: 90 }} value={customReps} onChange={e => setCustomReps(e.target.value)} placeholder="e.g. 10-12" />
                </div>
                {!isSwap && (
                  <div>
                    <div className="macro-lbl" style={{ marginBottom: 4 }}>Muscle group</div>
                    <select className="inp" style={{ width: 130 }} value={customMuscle} onChange={e => setCustomMuscle(e.target.value)}>
                      {Object.entries(MUSCLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div
                  onClick={() => setSaveToLibrary(s => !s)}
                  style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
                >
                  <div style={{
                    width: 16, height: 16, borderRadius: 3, border: `1px solid ${saveToLibrary ? "var(--accent)" : "var(--border)"}`,
                    background: saveToLibrary ? "var(--accent)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {saveToLibrary && <span style={{ color: "#000", fontSize: 11, fontWeight: 900 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 12, color: "var(--text2)" }}>Save to my exercise library</span>
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleAddCustom}>
                Add {search.trim()}
              </button>
            </div>
          )}

          {/* RESULTS COUNT */}
          {!isNewCustom && (
            <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 8 }}>
              {q ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}` : `${filtered.length} exercises`}
              {!isSwap && !q && (customExercises?.length > 0) && (
                <span style={{ marginLeft: 6, color: "var(--accent)" }}>· {customExercises.length} saved</span>
              )}
            </div>
          )}

          {/* EXERCISE LIST */}
          {filtered.map((ex, i) => (
            <div key={i} className="swap-option" onClick={() => handleSelect(ex)}>
              <div>
                <div className="swap-option-name">
                  {ex.name}
                  {ex.custom && <span className="ex-tag" style={{ background: "#1a0050", color: "#a78bfa", marginLeft: 6, fontSize: 10 }}>SAVED</span>}
                  {ex.priority && <span className="ex-tag priority" style={{ marginLeft: 4 }}>Priority</span>}
                </div>
                <div className="swap-option-meta">
                  {ex.muscles.map(m => MUSCLES[m]?.label).filter(Boolean).join(", ")} · {ex.repRange} reps{ex.note && ex.note !== "Custom exercise" ? ` · ${ex.note}` : ""}
                </div>
              </div>
              <span style={{ fontSize: 11, color: "var(--accent)", fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: 1 }}>SELECT →</span>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}


// ── Progressive Overload Engine ───────────────────────────────────────────────

// Dynamic weight increment: ~2.5% of load, rounded to nearest 2.5, clamped by muscle type

// ── Recovery Check-In Engine ──────────────────────────────────────────────────

const RECOVERY_REASONS = [
  { id: "injury",  label: "Injury / Joint Issue",       icon: "🦴", needsDetail: true  },
  { id: "cns",     label: "CNS Fatigue",                icon: "⚡", needsDetail: false },
  { id: "deload",  label: "Scheduled Deload",           icon: "📅", needsDetail: false },
  { id: "illness", label: "Illness / Getting Sick",     icon: "🤒", needsDetail: false },
  { id: "stress",  label: "Life Stress / Sleep Issues", icon: "😮‍💨", needsDetail: false },
];

const INJURY_KEYWORDS = {
  elbow:    ["bicep", "curl", "tricep", "extension", "skull", "pullup", "chin", "row", "press"],
  knee:     ["squat", "lunge", "leg press", "leg extension", "step", "hack"],
  shoulder: ["press", "fly", "raise", "overhead", "dip", "bench"],
  back:     ["deadlift", "row", "hyperextension", "good morning"],
  wrist:    ["curl", "press", "row", "pulldown"],
  hip:      ["squat", "deadlift", "lunge", "leg press", "hip thrust"],
  ankle:    ["calf", "squat", "lunge"],
  neck:     ["shrug", "press", "raise"],
};

function getInjuryKeywords(injuryText) {
  if (!injuryText) return [];
  const lower = injuryText.toLowerCase();
  const matches = [];
  Object.entries(INJURY_KEYWORDS).forEach(([bodyPart, keywords]) => {
    if (lower.includes(bodyPart)) matches.push(...keywords);
  });
  const words = lower.split(/[\s,/]+/).filter(w => w.length > 3);
  matches.push(...words);
  return [...new Set(matches)];
}

function getExerciseRecoveryFlag(exName, recoveryContext) {
  if (!recoveryContext || !recoveryContext.active) return null;
  if (["cns","deload","illness","stress"].includes(recoveryContext.reason)) return null;
  if (recoveryContext.reason === "injury" && recoveryContext.injuryDetail) {
    const keywords = getInjuryKeywords(recoveryContext.injuryDetail);
    const nameLower = exName.toLowerCase();
    if (keywords.some(kw => nameLower.includes(kw))) {
      return { type: "caution", label: "⚠ Monitor", detail: recoveryContext.injuryDetail };
    }
  }
  return null;
}

function suggestIncrement(weight, isLower = false) {
  const raw = parseFloat(weight);
  if (!raw || isNaN(raw)) return null;
  const pct = raw * 0.025;
  const rounded = Math.round(pct / 2.5) * 2.5;
  if (isLower) return Math.max(10, Math.min(20, rounded));
  return Math.max(2.5, Math.min(10, rounded));
}

const LOWER_MUSCLES = ["quads", "hamstrings", "glutes", "calves"];

function isLowerExercise(ex) {
  return (ex.muscles || []).some(m => LOWER_MUSCLES.includes(m));
}

// Parse rep range string like "10-12" → { min: 10, max: 12 }
function parseRepRange(rangeStr) {
  if (!rangeStr) return { min: 8, max: 12 };
  const parts = rangeStr.split("-").map(Number);
  if (parts.length === 2) return { min: parts[0], max: parts[1] };
  return { min: parts[0], max: parts[0] };
}

// ── Progression Engine v2 — Set-positional, RIR-aware ────────────────────────
// Compare sets positionally (S1 vs S1, S2 vs S2). Weight jump only when last
// set hits top of rep range at 0-1 RIR. Back off when set 1 is 0-1 RIR.

function getSetTargets(lastSets, repRange, phase, muscles) {
  // Only compare normal sets positionally — drop/rest-pause have different rep math
  const working = lastSets.filter(s => s.reps && parseFloat(s.reps) > 0 && (!s.type || s.type === "normal"));
  if (!working.length) return [];
  const { min: repMin, max: repMax } = parseRepRange(repRange);
  const isLower = isLowerExercise({ muscles: muscles || [] });

  const set1Rir = parseFloat(working[0] ? (working[0].rir !== undefined ? working[0].rir : 2) : 2);
  const tooHeavy = set1Rir === 0;

  const lastSet = working[working.length - 1];
  const lastSetRir = parseFloat(lastSet ? (lastSet.rir !== undefined ? lastSet.rir : 2) : 2);
  const lastSetReps = parseFloat(lastSet ? (lastSet.reps || 0) : 0);
  const readyForWeight = lastSetReps >= repMax && lastSetRir <= 1 && !tooHeavy;

  return working.map((s, i) => {
    const reps = parseFloat(s.reps || 0);
    const rir = parseFloat(s.rir !== undefined ? s.rir : 2);
    const weight = parseFloat(s.weight || 0);
    const isLast = i === working.length - 1;
    const increment = suggestIncrement(weight, isLower);

    if (tooHeavy) {
      const backoff = Math.max(weight - 5, 0);
      return {
        setNum: i + 1, suggestedWeight: backoff, suggestedReps: reps,
        note: i === 0 ? `Drop to ${backoff}lbs — set 1 was ${set1Rir} RIR, too heavy` : `${backoff}lbs × ${reps}`,
        type: "backoff",
      };
    }

    if (readyForWeight) {
      const newWeight = increment ? weight + increment : weight;
      return {
        setNum: i + 1, suggestedWeight: newWeight, suggestedReps: repMin,
        note: isLast ? `Add weight — last set hit ${repMax} @ ${lastSetRir} RIR` : `${newWeight}lbs × ${repMin}`,
        type: "weight",
      };
    }

    // Normal rep accumulation
    if (reps < repMax) {
      const target = Math.min(repMax, reps + 1);
      return {
        setNum: i + 1, suggestedWeight: weight, suggestedReps: target,
        note: i === 0 ? `Push for ${target} (hit ${reps} @ ${rir} RIR last time)` : `Aim ${target} reps`,
        type: "reps",
      };
    }

    if (reps >= repMax && rir >= 2 && isLast) {
      return {
        setNum: i + 1, suggestedWeight: weight, suggestedReps: reps,
        note: `${reps} reps but ${rir} RIR — push closer to failure`,
        type: "hold",
      };
    }

    return {
      setNum: i + 1, suggestedWeight: weight, suggestedReps: reps,
      note: `Hold ${reps}`,
      type: "hold",
    };
  });
}

function getExerciseSummary(lastSets, repRange, phase, muscles) {
  const working = lastSets.filter(s => s.reps && parseFloat(s.reps) > 0 && (!s.type || s.type === "normal"));
  if (!working.length) return null;
  const { min: repMin, max: repMax } = parseRepRange(repRange);
  const isLower = isLowerExercise({ muscles: muscles || [] });

  const set1Rir = parseFloat(working[0] ? (working[0].rir !== undefined ? working[0].rir : 2) : 2);
  const lastSet = working[working.length - 1];
  const lastRir = parseFloat(lastSet ? (lastSet.rir !== undefined ? lastSet.rir : 2) : 2);
  const lastReps = parseFloat(lastSet ? (lastSet.reps || 0) : 0);
  const baseWeight = parseFloat(working[0] ? (working[0].weight || 0) : 0);
  const tooHeavy = set1Rir === 0;
  const readyForWeight = lastReps >= repMax && lastRir <= 1 && !tooHeavy;
  const increment = suggestIncrement(baseWeight, isLower);

  if (phase === "recovery") {
    return { type: "hold", message: `Hold at ${baseWeight}lbs — recovery phase.` };
  }
  if (tooHeavy) {
    return { type: "backoff", message: `⚠ Set 1 was ${set1Rir} RIR — too heavy. Drop ~5lbs so fatigue builds naturally across sets.` };
  }
  if (readyForWeight) {
    const newW = increment ? baseWeight + increment : baseWeight;
    return { type: "weight", message: `Last set hit ${repMax} reps @ ${lastRir} RIR — time to add weight. Try ${newW}lbs × ${repMin} next session.` };
  }
  if (lastReps >= repMax && lastRir >= 2) {
    return { type: "hold", message: `Last set: ${lastReps} reps @ ${lastRir} RIR — load may be too light. Push harder before adding weight.` };
  }
  const pushCount = working.filter(s => parseFloat(s.reps) < repMax).length;
  if (pushCount > 0) {
    return { type: "reps", message: `Accumulating — push ${pushCount} set${pushCount > 1 ? "s" : ""} for +1 rep at ${baseWeight}lbs. Last set: ${lastReps} @ ${lastRir} RIR.` };
  }
  return { type: "hold", message: `Hold at ${baseWeight}lbs — monitoring last-set RIR before weight jump.` };
}

// Get last workout for a given split day
function getLastSession(workouts, splitDay) {
  return [...workouts]
    .filter(w => w.splitDay === splitDay)
    .sort((a, b) => b.date.localeCompare(a.date))[0] || null;
}

// Build full progression map: { exerciseName → { summary, setTargets, lastSets } }
function buildProgressionMap(lastSession, phase) {
  if (!lastSession) return {};
  const map = {};
  lastSession.exercises.forEach(ex => {
    const working = (ex.sets || []).filter(s => s.reps && parseFloat(s.reps) > 0);
    if (!working.length) return;
    const summary = getExerciseSummary(working, ex.repRange, phase, ex.muscles);
    const setTargets = getSetTargets(working, ex.repRange, phase, ex.muscles);
    if (summary || setTargets.length) {
      map[ex.name] = { summary, setTargets, lastSets: ex.sets };
    }
  });
  return map;
}

// Color coding for suggestion types
const SUGGESTION_COLORS = {
  weight:  { bg: "#0f1a00", border: "var(--accent)",  text: "var(--accent)",  label: "↑ WEIGHT"  },
  reps:    { bg: "#001a2d", border: "#42c8f5",        text: "#42c8f5",        label: "↑ REPS"    },
  hold:    { bg: "#1a1a1a", border: "var(--border)",  text: "var(--text3)",   label: "HOLD"      },
  backoff: { bg: "#2d1000", border: "var(--accent2)", text: "var(--accent2)", label: "↓ BACK OFF"},
};


// ── Auto-Regulation Engine ────────────────────────────────────────────────────

const CHECKIN_ENERGY   = ["Gassed", "Low",    "Okay",   "Good",   "Dialed"];
const CHECKIN_MOTIVATION = ["None",  "Meh",    "There",  "Solid",  "Fired up"];
const CHECKIN_PHYSICAL = ["Beat up","Heavy",  "Normal", "Fresh",  "Springy"];

// Score 1-5 on each dimension → overall deload level 0-3
function calcDeloadLevel(energy, motivation, physical) {
  const avg = (energy + motivation + physical) / 3;
  if (avg >= 3.5) return 0;  // all good
  if (avg >= 2.8) return 1;  // minor
  if (avg >= 2.0) return 2;  // moderate
  return 3;                   // significant
}

// Which exercises are skippable — secondary, non-priority muscles
function isSkippable(ex) {
  const secondaryMuscles = ["calves", "front_delts", "glutes"];
  return !ex.priority && (ex.muscles || []).some(m => secondaryMuscles.includes(m));
}

// Build auto-reg adjustments for each exercise given deload level and last session
function buildAutoRegMap(exercises, lastSession, deloadLevel) {
  if (deloadLevel === 0) return {};
  const loadPcts  = [1, 0.90, 0.80, 0.70];
  const loadPct   = loadPcts[deloadLevel];

  const map = {};
  exercises.forEach(ex => {
    const lastEx = lastSession?.exercises?.find(e => e.name === ex.name);
    const lastSets = lastEx?.sets?.filter(s => s.reps && s.weight) || [];
    const lastWeight = lastSets.length ? parseFloat(lastSets[lastSets.length - 1].weight) : null;
    const { min: repMin, max: repMax } = parseRepRange(ex.repRange);
    const midReps = Math.round((repMin + repMax) / 2);
    const skip = deloadLevel >= 2 && isSkippable(ex);

    const adjWeight = lastWeight ? Math.round((lastWeight * loadPct) / 2.5) * 2.5 : null;

    map[ex.name] = {
      skip,
      adjWeight,
      adjReps: midReps,
      deloadLevel,
      note: skip
        ? "⚑ Consider skipping — secondary muscle, save energy for priorities"
        : adjWeight
          ? `Auto-reg: ${adjWeight}lbs × ${midReps} reps (${Math.round((1 - loadPct) * 100)}% reduction)`
          : `Auto-reg: aim for ${midReps} reps — middle of range today`,
    };
  });
  return map;
}

function PairedWithLabel({ linkType, partnerName }) {
  const color = linkType === "superset" ? "var(--accent2)" : "#42c8f5";
  const typeLabel = linkType === "superset" ? "Superset" : "Compound Set";
  return (
    <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed var(--border)", display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 10, fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: 1, color: color }}>{typeLabel}</span>
      <span style={{ fontSize: 11, color: "var(--text3)" }}>paired with</span>
      <span style={{ fontSize: 11, color: color, fontWeight: 600 }}>{partnerName}</span>
    </div>
  );
}

function MoveBtn({ disabled, onClick, label }) {
  return (
    <button className="btn-move" disabled={disabled} onClick={onClick}>
      {label === "up" ? "▲" : "▼"}
    </button>
  );
}

function LinkControl({ ei, ex, exercises, onLink, onUnlink }) {
  if (ex.linkedTo) {
    const color = ex.linkedTo === "superset" ? "var(--accent2)" : "#42c8f5";
    const label = ex.linkedTo === "superset" ? "SS" : "CS";
    return (
      <button className="btn-swap" style={{ color: color, borderColor: color, fontSize: 10 }} onClick={() => onUnlink(ei)}>
        {label} ✕
      </button>
    );
  }
  if (ei >= exercises.length - 1) return null;
  return (
    <select className="inp inp-xs" style={{ fontSize: 10 }} onChange={e => onLink(ei, e.target.value)}>
      <option value="">⇌</option>
      <option value="superset">Superset</option>
      <option value="compound">Compound</option>
    </select>
  );
}

function SetTargetRow({ target }) {
  const c = SUGGESTION_COLORS[target.type] || SUGGESTION_COLORS.hold;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 11, fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--text3)", width: 36 }}>S{target.setNum}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: c.text, minWidth: 90 }}>{target.suggestedWeight}lbs x {target.suggestedReps}</span>
      <span style={{ fontSize: 11, color: "var(--text3)", fontStyle: "italic" }}>{target.note}</span>
    </div>
  );
}

function LogWorkout({ workouts, onSave, phase, activeCoachSplit, recoveryContext, customExercises, onSaveCustomExercise, splitOrder }) {
  // Build effective split — coach-generated takes precedence over default
  const effectiveSplit = activeCoachSplit
    ? Object.fromEntries(activeCoachSplit.days.map(d => [d.label, { ...d, exercises: d.exercises }]))
    : SPLIT;
  const effectiveSplitOrder = activeCoachSplit
    ? activeCoachSplit.days.map(d => d.label)
    : SPLIT_ORDER;

  const [splitDay, setSplitDay] = useState(effectiveSplitOrder[0]);
  const [exercises, setExercises] = useState(() => (effectiveSplit[effectiveSplitOrder[0]]?.exercises || []).map(newExercise));
  const [feel, setFeel] = useState(3);
  const [notes, setNotes] = useState("");

  const [date, setDate] = useState(today());
  const [saved, setSaved] = useState(false);
  const [pickerMode, setPickerMode] = useState(null); // null | { mode: "swap", index: N } | { mode: "add" }
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved | error
  const [customTitle, setCustomTitle] = useState("");

  // Pre-session check-in / auto-regulation state
  const [showCheckin, setShowCheckin] = useState(false);
  const [checkinEnergy, setCheckinEnergy] = useState(3);
  const [checkinMotivation, setCheckinMotivation] = useState(3);
  const [checkinPhysical, setCheckinPhysical] = useState(3);
  const [autoRegActive, setAutoRegActive] = useState(false);
  const [autoRegMap, setAutoRegMap] = useState({});
  const [deloadLevel, setDeloadLevel] = useState(0);

  // Compute progression suggestions from last matching session
  const lastSession = splitDay !== "__blank__" ? getLastSession(workouts, splitDay) : null;
  const progressionMap = lastSession ? buildProgressionMap(lastSession, phase) : {};

  const selectDay = (day) => {
    setSplitDay(day);
    if (day === "__blank__") {
      setExercises([]);
    } else {
      setExercises(effectiveSplit[day]?.exercises ? effectiveSplit[day].exercises.map(newExercise) : []);
    }
  };

  // Live update — just update the typed set, no cascade
  const updateSet = (ei, si, field, val) => {
    setExercises(exs => exs.map((ex, i) => i !== ei ? ex : {
      ...ex, sets: ex.sets.map((s, j) => j !== si ? s : { ...s, [field]: val })
    }));
  };

  // On blur — cascade the completed value to empty sets below
  const cascadeSet = (ei, si, field, val) => {
    if (!val) return;
    setExercises(exs => exs.map((ex, i) => {
      if (i !== ei) return ex;
      const updatedSets = ex.sets.map((s, j) => {
        if (j <= si) return s;
        if (!s[field]) return { ...s, [field]: val };
        return s;
      });
      return { ...ex, sets: updatedSets };
    }));
  };

  const applyAutoReg = () => {
    const level = calcDeloadLevel(checkinEnergy, checkinMotivation, checkinPhysical);
    setDeloadLevel(level);
    if (level === 0) {
      setAutoRegActive(false);
      setAutoRegMap({});
      setShowCheckin(false);
      return;
    }
    const map = buildAutoRegMap(exercises, lastSession, level);
    setAutoRegMap(map);
    setAutoRegActive(true);
    setShowCheckin(false);
  };

  const acceptLighterSession = () => {
    // Apply suggested weights and reps to exercise sets
    setExercises(exs => exs.map(ex => {
      const adj = autoRegMap[ex.name];
      if (!adj || adj.skip) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => ({
          ...s,
          weight: adj.adjWeight ? String(adj.adjWeight) : s.weight,
          reps: String(adj.adjReps),
        })),
      };
    }));
  };

  const dismissAutoReg = () => {
    setAutoRegActive(false);
    setAutoRegMap({});
    setDeloadLevel(0);
  };

  const removeExercise = (ei) => {
    setExercises(exs => exs.filter((ex, i) => i !== ei));
  };

  const moveExercise = (ei, dir) => {
    setExercises(exs => {
      const next = [...exs];
      const target = ei + dir;
      if (target < 0 || target >= next.length) return exs;
      [next[ei], next[target]] = [next[target], next[ei]];
      return next;
    });
  };

  const linkExercise = (ei, linkType) => {
    setExercises(exs => exs.map((ex, i) => i !== ei ? ex : { ...ex, linkedTo: linkType }));
  };

  const unlinkExercise = (ei) => {
    setExercises(exs => exs.map((ex, i) => i !== ei ? ex : { ...ex, linkedTo: null }));
  };

  const addSet = (ei) => {
    setExercises(exs => exs.map((ex, i) => i !== ei ? ex : { ...ex, sets: [...ex.sets, newSet()] }));
  };

  const removeSet = (ei, si) => {
    setExercises(exs => exs.map((ex, i) => i !== ei ? ex : { ...ex, sets: ex.sets.filter((_, j) => j !== si) }));
  };

  // Set type cycling
  const cycleSetType = (ei, si) => {
    const types = ["normal", "drop", "restpause"];
    setExercises(exs => exs.map((ex, i) => i !== ei ? ex : {
      ...ex, sets: ex.sets.map((s, j) => j !== si ? s : {
        ...s,
        type: types[(types.indexOf(s.type || "normal") + 1) % types.length],
        drops: s.type === "drop" ? [] : s.drops,
        pauseReps: s.type === "restpause" ? "" : s.pauseReps,
      })
    }));
  };

  // Drop set segment management
  const addDrop = (ei, si) => {
    setExercises(exs => exs.map((ex, i) => i !== ei ? ex : {
      ...ex, sets: ex.sets.map((s, j) => j !== si ? s : {
        ...s, drops: [...(s.drops || []), { weight: "", reps: "" }]
      })
    }));
  };
  const updateDrop = (ei, si, di, field, val) => {
    setExercises(exs => exs.map((ex, i) => i !== ei ? ex : {
      ...ex, sets: ex.sets.map((s, j) => j !== si ? s : {
        ...s, drops: (s.drops || []).map((d, k) => k !== di ? d : { ...d, [field]: val })
      })
    }));
  };
  const removeDrop = (ei, si, di) => {
    setExercises(exs => exs.map((ex, i) => i !== ei ? ex : {
      ...ex, sets: ex.sets.map((s, j) => j !== si ? s : {
        ...s, drops: (s.drops || []).filter((_, k) => k !== di)
      })
    }));
  };

  const handlePickerSelect = (selectedEx) => {
    if (!pickerMode) return;
    if (pickerMode.mode === "swap") {
      setExercises(exs => exs.map((ex, i) => i !== pickerMode.index ? ex : {
        ...newExercise(selectedEx),
        swappedFrom: ex.name,
      }));
    } else {
      setExercises(exs => [...exs, newExercise(selectedEx)]);
    }
    setPickerMode(null);
  };

  const handleSave = () => {
    const workout = {
      id: Date.now().toString(),
      date,
      splitDay: splitDay === "__blank__" ? (customTitle.trim() || "Custom Session") : splitDay,
      exercises: exercises.map(ex => ({ ...ex, sets: ex.sets.filter(s => s.reps) })).filter(ex => ex.sets.length > 0),
      feel,
      notes,

    };
    const updated = [...workouts, workout];
    const result = saveData("workouts", updated);
    if (result) {
      onSave(updated);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } else {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setNotes("");
  };

  const isRest = splitDay === "Rest";

  return (
    <div className="page">
      {recoveryContext && recoveryContext.active && recoveryContext.injuryDetail && (
        <div className="alert">⚠ Active recovery: {recoveryContext.injuryDetail}. Flagged exercises are marked below.</div>
      )}

      <div className="card">
        <div className="card-title">Split Day</div>
        {activeCoachSplit && (
          <div style={{ fontSize: 11, color: "var(--accent)", fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: 1, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <span>✦ COACH PROGRAM ACTIVE:</span>
            <span style={{ color: "var(--text2)" }}>{activeCoachSplit.name}</span>
          </div>
        )}
        <div className="split-day-btns">
          {effectiveSplitOrder.map(d => (
            <button key={d} className={`split-btn ${splitDay === d ? "active" : ""}`} onClick={() => selectDay(d)}>{d}</button>
          ))}
          <button
            className={`split-btn ${splitDay === "__blank__" ? "active" : ""}`}
            style={{ borderStyle: "dashed", color: splitDay === "__blank__" ? "#000" : "var(--text3)" }}
            onClick={() => selectDay("__blank__")}
          >+ Blank Session</button>
        </div>
        {splitDay === "__blank__" && (
          <div style={{ marginBottom: 12 }}>
            <input
              className="inp"
              placeholder="Session title (e.g. Full Body, Back, etc.)"
              value={customTitle}
              onChange={e => setCustomTitle(e.target.value)}
              style={{ fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}
            />
          </div>
        )}
        {splitDay !== "__blank__" && effectiveSplit[splitDay] && effectiveSplit[splitDay].note && (
          <div style={{ fontSize: 12, color: "var(--accent2)", marginBottom: 12, padding: "6px 10px", background: "var(--surface3)", borderRadius: 4, borderLeft: "2px solid var(--accent2)" }}>
            {effectiveSplit[splitDay].note}
          </div>
        )}
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <div className="macro-lbl" style={{ marginBottom: 4 }}>Date</div>
            <input type="date" className="inp" style={{ width: 150 }} value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <div className="macro-lbl" style={{ marginBottom: 4 }}>Session Feel</div>
            <div style={{ display: "flex", gap: 6 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setFeel(n)} style={{
                  width: 36, height: 36, borderRadius: 4, border: "1px solid",
                  borderColor: feel === n ? "var(--accent)" : "var(--border)",
                  background: feel === n ? "var(--accent)" : "var(--surface2)",
                  color: feel === n ? "#000" : "var(--text2)",
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13,
                  cursor: "pointer"
                }}>{n}</button>
              ))}
              <span style={{ fontSize: 12, color: "var(--text3)", alignSelf: "center", marginLeft: 4 }}>{FEEL_LABELS[feel]}</span>
            </div>
          </div>
        </div>
        {!isRest && splitDay !== "__blank__" && (
          <div style={{ marginTop: 12 }}>
            {!showCheckin && !autoRegActive && (
              <button
                className="btn btn-secondary btn-sm"
                style={{ borderStyle: "dashed", color: "var(--accent2)", borderColor: "var(--accent2)" }}
                onClick={() => setShowCheckin(true)}
              >⚡ How am I feeling today?</button>
            )}
            {autoRegActive && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: 1, color: "var(--accent2)", textTransform: "uppercase" }}>
                  {["", "Minor deload", "Moderate deload", "Significant deload"][deloadLevel]} active
                </span>
                <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }} onClick={dismissAutoReg}>✕ Clear</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CHECK-IN MODAL */}
      {showCheckin && (
        <div className="card" style={{ borderColor: "var(--accent2)", background: "#1a1000" }}>
          <div className="card-title" style={{ color: "var(--accent2)" }}>Pre-Session Check-In</div>
          <div style={{ display: "grid", gap: 14 }}>
            {[
              { label: "Energy", vals: CHECKIN_ENERGY,    val: checkinEnergy,    set: setCheckinEnergy },
              { label: "Motivation", vals: CHECKIN_MOTIVATION, val: checkinMotivation, set: setCheckinMotivation },
              { label: "Physical", vals: CHECKIN_PHYSICAL, val: checkinPhysical,  set: setCheckinPhysical },
            ].map(({ label, vals, val, set }) => (
              <div key={label}>
                <div style={{ fontSize: 11, fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: 1, color: "var(--text2)", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {vals.map((v, i) => (
                    <button key={i} onClick={() => set(i + 1)} style={{
                      padding: "5px 12px", borderRadius: 4, border: "1px solid",
                      borderColor: val === i + 1 ? "var(--accent2)" : "var(--border)",
                      background: val === i + 1 ? "#3d2200" : "var(--surface2)",
                      color: val === i + 1 ? "var(--accent2)" : "var(--text3)",
                      fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, cursor: "pointer",
                      letterSpacing: 1,
                    }}>{v}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="btn-row" style={{ marginTop: 16 }}>
            <button className="btn btn-primary btn-sm" onClick={applyAutoReg}>Analyse Session</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowCheckin(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* PROGRESSION SUMMARY CARD */}


      {/* AUTO-REG RESULTS CARD */}
      {autoRegActive && deloadLevel > 0 && !isRest && (
        <div className="card" style={{ borderColor: "var(--accent2)", background: "#120d00" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
            <div>
              <div className="card-title" style={{ marginBottom: 2, color: "var(--accent2)" }}>
                {["", "↓ Minor Deload", "↓↓ Moderate Deload", "↓↓↓ Significant Deload"][deloadLevel]}
              </div>
              <div style={{ fontSize: 12, color: "var(--text3)" }}>
                Energy: {CHECKIN_ENERGY[checkinEnergy-1]} · Motivation: {CHECKIN_MOTIVATION[checkinMotivation-1]} · Physical: {CHECKIN_PHYSICAL[checkinPhysical-1]}
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" style={{ borderColor: "var(--accent2)", color: "var(--accent2)" }} onClick={acceptLighterSession}>
              Apply lighter session
            </button>
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {Object.entries(autoRegMap).map(([name, adj]) => (
              <div key={name} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: adj.skip ? "#1a0000" : "#1a1000",
                border: `1px solid ${adj.skip ? "var(--red)" : "var(--accent2)"}`,
                borderRadius: 5, padding: "7px 10px", gap: 8, flexWrap: "wrap",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {adj.skip && <span style={{ fontFamily: "var(--font-display)", fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "var(--red)" }}>SKIP?</span>}
                  {!adj.skip && <span style={{ fontFamily: "var(--font-display)", fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "var(--accent2)" }}>ADJUST</span>}
                  <span style={{ fontSize: 12, color: "var(--text2)" }}>{name}</span>
                </div>
                <span style={{ fontSize: 12, color: adj.skip ? "var(--red)" : "var(--accent2)", textAlign: "right" }}>{adj.note}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 10, fontStyle: "italic" }}>
            Smart session today beats grinding through a bad one. Get something in the bank.
          </div>
        </div>
      )}

      {splitDay !== "__blank__" && isRest && (
        <div className="card" style={{ textAlign: "center", padding: 30 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 900, color: "var(--text3)", textTransform: "uppercase", letterSpacing: 2 }}>Rest Day</div>
          <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 8 }}>Recovery is training. Log it.</div>
        </div>
      )}

      {(splitDay === "__blank__" || !isRest) && exercises.map((ex, ei) => (
        <div key={ei} className={(() => {
          const prev = ei > 0 ? exercises[ei-1] : null;
          const isTarget = prev && prev.linkedTo;
          if (ex.linkedTo === "superset") return "card linked-ss";
          if (ex.linkedTo === "compound") return "card linked-cs";
          if (isTarget && prev.linkedTo === "superset") return "card linked-ss-target";
          if (isTarget && prev.linkedTo === "compound") return "card linked-cs-target";
          return "card";
        })()} style={autoRegActive && autoRegMap[ex.name] && autoRegMap[ex.name].skip ? { opacity: 0.6, borderColor: "var(--red)" } : {}}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{ex.name}</span>
                {ex.priority && <span className="ex-tag priority">Priority</span>}
                {(() => {
                  const flag = getExerciseRecoveryFlag(ex.name, recoveryContext);
                  if (flag && flag.type === "avoid") return <span className="ex-tag" style={{ background: "#2d0000", color: "var(--red)" }}>{flag.label}</span>;
                  if (flag && flag.type === "caution") return <span className="ex-tag modified">{flag.label}</span>;
                  return null;
                })()}
                {ex.swappedFrom && <span className="ex-tag" style={{ background: "#1a1a2d", color: "#8888ff" }}>Swapped</span>}
                {ex.linkedTo === "superset" && <span className="ex-tag" style={{ background: "#0a1a00", color: "var(--accent2)", border: "1px solid var(--accent2)" }}>SS</span>}
                {ex.linkedTo === "compound" && <span className="ex-tag" style={{ background: "#001020", color: "#42c8f5", border: "1px solid #42c8f5" }}>CS</span>}
                {autoRegActive && autoRegMap[ex.name] && autoRegMap[ex.name].skip && (
                  <span className="ex-tag" style={{ background: "#2d0000", color: "var(--red)" }}>⚑ Skip?</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>
                {ex.repRange} reps · {ex.note || "0-1 RIR"}
                {ex.swappedFrom && <span style={{ color: "var(--text3)", fontStyle: "italic" }}> · was: {ex.swappedFrom}</span>}
              </div>
              {(() => {
                const prog = progressionMap[ex.name];
                if (!prog || !prog.summary) return null;
                const c = SUGGESTION_COLORS[prog.summary.type] || SUGGESTION_COLORS.hold;
                return (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 5, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 4, padding: "3px 8px" }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 10, fontWeight: 700, letterSpacing: 1, color: c.text }}>{c.label}</span>
                    <span style={{ fontSize: 11, color: c.text }}>{prog.summary.message}</span>
                  </div>
                );
              })()}
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>

              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <MoveBtn disabled={ei === 0} onClick={() => moveExercise(ei, -1)} label="up" />
                <MoveBtn disabled={ei === exercises.length - 1} onClick={() => moveExercise(ei, 1)} label="dn" />
              </div>
              <LinkControl ei={ei} ex={ex} exercises={exercises} onLink={linkExercise} onUnlink={unlinkExercise} />
              <button className="btn-swap" onClick={() => setPickerMode({ mode: "swap", index: ei })}>⇄ Swap</button>
              <button className="btn-swap" style={{ color: "var(--red)", borderColor: "var(--border)" }} onClick={() => removeExercise(ei)}>✕ Remove</button>
            </div>
          </div>
          {/* PER-SET TARGETS */}
          {(() => {
            const prog = progressionMap[ex.name];
            if (!prog || !prog.setTargets || !prog.setTargets.length) return null;
            return (
              <div style={{ background: "var(--surface2)", borderRadius: 5, padding: "8px 10px", marginBottom: 8, display: "grid", gap: 3 }}>
                <div style={{ fontSize: 10, fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: 1, color: "var(--text3)", marginBottom: 4 }}>SET TARGETS</div>
                {prog.setTargets.map((t, ti) => (
                  <SetTargetRow key={ti} target={t} />
                ))}
              </div>
            );
          })()}

          <div style={{ display: "grid", gap: 6, marginBottom: 8 }}>
            {/* Set column headers */}
            <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 52px 60px 28px", gap: 4, paddingBottom: 2, borderBottom: "1px solid var(--border)" }}>
              {["#", "Weight", "Reps", "RIR", "Type", ""].map((h, i) => (
                <span key={i} style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: 1, textAlign: i > 0 ? "center" : "left" }}>{h}</span>
              ))}
            </div>

            {ex.sets.map((s, si) => (
              <div key={si}>
                {/* Main set row */}
                <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 52px 60px 28px", gap: 4, alignItems: "center" }}>
                  <span className="set-num" style={{ textAlign: "center" }}>{si + 1}</span>
                  <input className="inp inp-sm" placeholder="—" value={s.weight}
                    onChange={e => updateSet(ei, si, "weight", e.target.value)}
                    onBlur={e => cascadeSet(ei, si, "weight", e.target.value)} />
                  <input className="inp inp-sm" placeholder="—" value={s.reps}
                    onChange={e => updateSet(ei, si, "reps", e.target.value)}
                    onBlur={e => cascadeSet(ei, si, "reps", e.target.value)} />
                  <select className="inp inp-xs" value={s.rir} onChange={e => updateSet(ei, si, "rir", e.target.value)}>
                    {["0", "1", "2", "3", "4+"].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <span
                    className={`set-type-badge set-type-${s.type || "normal"}`}
                    onClick={() => cycleSetType(ei, si)}
                    title="Tap to cycle: Normal → Drop Set → Rest-Pause"
                  >
                    {s.type === "drop" ? "DROP" : s.type === "restpause" ? "R-P" : "NRM"}
                  </span>
                  <button className="btn-rm" onClick={() => removeSet(ei, si)}>×</button>
                </div>

                {/* Rest-pause extra reps */}
                {s.type === "restpause" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, paddingLeft: 32, paddingRight: 28 }}>
                    <span style={{ fontSize: 11, color: "#a78bfa", fontFamily: "var(--font-display)", fontWeight: 700, whiteSpace: "nowrap" }}>+ PAUSE</span>
                    <input
                      className="inp inp-sm"
                      placeholder="reps after pause"
                      value={s.pauseReps || ""}
                      onChange={e => updateSet(ei, si, "pauseReps", e.target.value)}
                      style={{ borderColor: "#a78bfa44" }}
                    />
                    <span style={{ fontSize: 11, color: "var(--text3)" }}>reps</span>
                  </div>
                )}

                {/* Drop set segments */}
                {s.type === "drop" && (
                  <div style={{ paddingLeft: 32, paddingRight: 28, marginTop: 4, display: "grid", gap: 4 }}>
                    {(s.drops || []).map((d, di) => (
                      <div key={di} className="drop-segment">
                        <span style={{ fontSize: 10, color: "#f59e0b", fontFamily: "var(--font-display)", fontWeight: 700, minWidth: 36 }}>DROP {di + 1}</span>
                        <input className="inp inp-sm" placeholder="lbs" value={d.weight}
                          onChange={e => updateDrop(ei, si, di, "weight", e.target.value)}
                          style={{ width: 70, borderColor: "#f59e0b44" }} />
                        <span style={{ fontSize: 11, color: "var(--text3)" }}>×</span>
                        <input className="inp inp-sm" placeholder="reps" value={d.reps}
                          onChange={e => updateDrop(ei, si, di, "reps", e.target.value)}
                          style={{ width: 60, borderColor: "#f59e0b44" }} />
                        <button className="btn-rm" style={{ marginLeft: "auto" }} onClick={() => removeDrop(ei, si, di)}>×</button>
                      </div>
                    ))}
                    {(s.drops || []).length < 3 && (
                      <button
                        onClick={() => addDrop(ei, si)}
                        style={{ fontSize: 11, color: "#f59e0b", background: "none", border: "1px dashed #f59e0b44", borderRadius: 4, padding: "3px 8px", cursor: "pointer", textAlign: "left" }}>
                        + Add drop
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button className="btn-add-set" onClick={() => addSet(ei)}>+ Set</button>
          {ex.linkedTo && ei < exercises.length - 1 && (
            <PairedWithLabel linkType={ex.linkedTo} partnerName={exercises[ei + 1].name} />
          )}
        </div>
      ))}

      {(splitDay === "__blank__" || !isRest) && (
        <div style={{ marginBottom: 12 }}>
          <button
            className="btn btn-secondary"
            style={{ width: "100%", borderStyle: "dashed", color: "var(--accent)", borderColor: "var(--accent)" }}
            onClick={() => setPickerMode({ mode: "add" })}
          >
            + Add Exercise
          </button>
        </div>
      )}

      <div className="card">
        <div className="card-title">Session Notes</div>
        <textarea className="inp" placeholder="How'd it feel? Anything nagging? Pumps? Energy?" value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      <div className="btn-row">
        <button className="btn btn-primary" onClick={handleSave} disabled={saveStatus === "saving"}>
          {saveStatus === "saving" ? "Saving..." : saved ? "✓ Saved" : "Save Session"}
        </button>
        {saveStatus === "saved" && (
          <span style={{ fontSize: 12, color: "var(--accent)", alignSelf: "center", fontFamily: "var(--font-display)", letterSpacing: 1 }}>✓ Persisted to storage</span>
        )}
        {saveStatus === "error" && (
          <span style={{ fontSize: 12, color: "var(--red)", alignSelf: "center", fontFamily: "var(--font-display)", letterSpacing: 1 }}>⚠ Storage write failed — data may not persist</span>
        )}
      </div>
      {pickerMode !== null && (
        <ExercisePickerModal
          exercise={pickerMode.mode === "swap" ? exercises[pickerMode.index] : null}
          mode={pickerMode.mode}
          onSelect={handlePickerSelect}
          onClose={() => setPickerMode(null)}
          customExercises={customExercises}
          onSaveCustomExercise={onSaveCustomExercise}
        />
      )}
    </div>
  );
}


// ── Program Switch Analysis Engine ───────────────────────────────────────────

function analyzeProgramSwitch(workouts, phase) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 6 * 7 * 24 * 60 * 60 * 1000);
  const recent = workouts.filter(w => new Date(w.date) >= cutoff);

  // Not enough data
  if (recent.length < 4) {
    return { verdict: "insufficient", sessions: recent.length };
  }

  // Session consistency — how many sessions per week on average
  const weeks = 6;
  const sessionsPerWeek = recent.length / weeks;

  // Per-exercise lift trend over last 6 weeks
  // Build map: exerciseName → [{ date, avgWeight, avgReps }]
  const exerciseHistory = {};
  recent.forEach(w => {
    w.exercises.forEach(ex => {
      const workingSets = (ex.sets || []).filter(s => s.weight && s.reps);
      if (!workingSets.length) return;
      const avgWeight = workingSets.reduce((s, x) => s + parseFloat(x.weight), 0) / workingSets.length;
      const avgReps   = workingSets.reduce((s, x) => s + parseFloat(x.reps), 0) / workingSets.length;
      if (!exerciseHistory[ex.name]) exerciseHistory[ex.name] = [];
      exerciseHistory[ex.name].push({ date: w.date, avgWeight, avgReps });
    });
  });

  // For each exercise with 3+ sessions, determine trend
  const trends = [];
  Object.entries(exerciseHistory).forEach(([name, sessions]) => {
    if (sessions.length < 3) return;
    sessions.sort((a, b) => a.date.localeCompare(b.date));
    const first = sessions[0].avgWeight;
    const last  = sessions[sessions.length - 1].avgWeight;
    const firstReps = sessions[0].avgReps;
    const lastReps  = sessions[sessions.length - 1].avgReps;
    const weightDelta = last - first;
    const repDelta    = lastReps - firstReps;
    const improving   = weightDelta > 0 || repDelta >= 1;
    const stagnant    = Math.abs(weightDelta) < 2.5 && Math.abs(repDelta) < 1 && sessions.length >= 4;
    trends.push({ name, weightDelta, repDelta, improving, stagnant, sessions: sessions.length, lastWeight: last, lastReps });
  });

  const improving = trends.filter(t => t.improving && !t.stagnant);
  const stagnant  = trends.filter(t => t.stagnant);
  const total     = trends.length;

  // Feel score analysis
  const feels = recent.map(w => w.feel).filter(Boolean);
  const avgFeel = feels.length ? feels.reduce((s, f) => s + f, 0) / feels.length : 3;
  const roughSessions = feels.filter(f => f <= 2).length;

  // Top 3 progressing lifts (by absolute weight gain)
  const top3 = [...improving]
    .sort((a, b) => b.weightDelta - a.weightDelta)
    .slice(0, 3);

  // Verdict logic
  // On a cut — stagnation is expected, don't flag it as a program failure
  const cutAdjusted = phase === "cut";

  let verdict, summary, reasoning;

  if (total === 0) {
    verdict = "insufficient";
    summary = "Not enough logged weight data to assess progress.";
    reasoning = "Log weights consistently for a few more sessions before making a program decision.";
  } else if (cutAdjusted && avgFeel >= 2.5) {
    verdict = "green";
    summary = `You're on a cut — strength holding at ${Math.round(sessionsPerWeek * 10) / 10} sessions/week avg. Cut-phase stagnation is expected, not a program problem.`;
    reasoning = "Switching during a cut rarely produces better results and adds unnecessary adjustment fatigue.";
  } else if (improving.length >= total * 0.6 && avgFeel >= 2.5) {
    verdict = "green";
    summary = `${improving.length} of ${total} tracked lifts are progressing over 6 weeks. Avg session feel: ${Math.round(avgFeel * 10) / 10}/5.`;
    reasoning = "The program is working. Switching now would interrupt real momentum.";
  } else if (stagnant.length >= total * 0.6 && roughSessions >= 3) {
    verdict = "red";
    summary = `${stagnant.length} of ${total} lifts have stalled over 6 weeks. ${roughSessions} sessions rated feel 1-2. Avg feel: ${Math.round(avgFeel * 10) / 10}/5.`;
    reasoning = "This looks like genuine stagnation backed by poor session quality. A change may be warranted.";
  } else {
    verdict = "yellow";
    summary = `Mixed picture — ${improving.length} lifts progressing, ${stagnant.length} stalled. ${sessionsPerWeek < 2 ? "Consistency is low — only " + Math.round(sessionsPerWeek * 10) / 10 + " sessions/week avg." : ""}`;
    reasoning = "A deload week might break the plateau without discarding what's working.";
  }

  return { verdict, summary, reasoning, top3, improving, stagnant, total, sessionsPerWeek, avgFeel, roughSessions, sessions: recent.length };
}

// ── History ───────────────────────────────────────────────────────────────────

function HistoryEntry({ workout, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);

  const startEdit = () => {
    setDraft(JSON.parse(JSON.stringify(workout))); // deep clone
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(null);
    setEditing(false);
  };

  const saveEdit = () => {
    onUpdate(draft);
    setEditing(false);
    setDraft(null);
  };

  const updateDraftField = (field, val) => setDraft(d => ({ ...d, [field]: val }));

  const updateDraftExName = (ei, val) =>
    setDraft(d => ({ ...d, exercises: d.exercises.map((ex, i) => i !== ei ? ex : { ...ex, name: val }) }));

  const updateDraftSet = (ei, si, field, val) =>
    setDraft(d => ({ ...d, exercises: d.exercises.map((ex, i) => i !== ei ? ex : {
      ...ex, sets: ex.sets.map((s, j) => j !== si ? s : { ...s, [field]: val })
    })}));

  const addDraftSet = (ei) =>
    setDraft(d => ({ ...d, exercises: d.exercises.map((ex, i) => i !== ei ? ex : {
      ...ex, sets: [...ex.sets, { reps: "", weight: "", rir: "1" }]
    })}));

  const removeDraftSet = (ei, si) =>
    setDraft(d => ({ ...d, exercises: d.exercises.map((ex, i) => i !== ei ? ex : {
      ...ex, sets: ex.sets.filter((_, j) => j !== si)
    })}));

  const removeDraftExercise = (ei) =>
    setDraft(d => ({ ...d, exercises: d.exercises.filter((_, i) => i !== ei) }));

  const w = editing ? draft : workout;

  return (
    <div className="history-entry" style={{ borderColor: editing ? "var(--accent)" : "var(--border)" }}>
      {/* HEADER */}
      <div className="history-header">
        <div style={{ flex: 1, marginRight: 8 }}>
          {editing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <input
                className="inp"
                value={draft.splitDay}
                onChange={e => updateDraftField("splitDay", e.target.value)}
                placeholder="Session title"
                style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--accent)", textTransform: "uppercase" }}
              />
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <input type="date" className="inp" style={{ width: 150 }} value={draft.date} onChange={e => updateDraftField("date", e.target.value)} />
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-display)", letterSpacing: 1, textTransform: "uppercase" }}>Feel:</span>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => updateDraftField("feel", n)} style={{
                      width: 30, height: 30, borderRadius: 4, border: "1px solid",
                      borderColor: draft.feel === n ? "var(--accent)" : "var(--border)",
                      background: draft.feel === n ? "var(--accent)" : "var(--surface2)",
                      color: draft.feel === n ? "#000" : "var(--text2)",
                      fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, cursor: "pointer"
                    }}>{n}</button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="history-day">{w.splitDay}</div>
              <div className="history-date">{fmtDate(w.date)} · {totalSets(w)} sets</div>
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-start", flexShrink: 0 }}>
          {!editing && <span className={`feel-badge feel-${w.feel}`}>{FEEL_LABELS[w.feel] || w.feel}</span>}
          {editing ? (
            <>
              <button className="btn btn-primary btn-sm" onClick={saveEdit}>Save</button>
              <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>Cancel</button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary btn-sm" onClick={startEdit}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(w.id)}>Delete</button>
            </>
          )}
        </div>
      </div>

      {/* EXERCISES */}
      {w.exercises.map((ex, ei) => (
        <div key={ei} style={{ marginBottom: editing ? 12 : 4 }}>
          {editing ? (
            <div style={{ background: "var(--surface3)", borderRadius: 6, padding: "10px 12px", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <input
                  className="inp"
                  value={ex.name}
                  onChange={e => updateDraftExName(ei, e.target.value)}
                  style={{ fontWeight: 600, fontSize: 13 }}
                />
                <button className="btn-rm" style={{ color: "var(--red)", fontSize: 16, flexShrink: 0 }} onClick={() => removeDraftExercise(ei)}>✕</button>
              </div>
              <table className="ex-table" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ width: 24 }}>#</th>
                    <th>Weight (lbs)</th>
                    <th>Reps</th>
                    <th>RIR</th>
                    <th style={{ width: 24 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {ex.sets.map((s, si) => (
                    <tr key={si}>
                      <td><span className="set-num">{si + 1}</span></td>
                      <td><input className="inp inp-sm" value={s.weight} onChange={e => updateDraftSet(ei, si, "weight", e.target.value)} placeholder="—" /></td>
                      <td><input className="inp inp-sm" value={s.reps} onChange={e => updateDraftSet(ei, si, "reps", e.target.value)} placeholder="—" /></td>
                      <td>
                        <select className="inp inp-xs" value={s.rir} onChange={e => updateDraftSet(ei, si, "rir", e.target.value)}>
                          {["0","1","2","3","4+"].map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td><button className="btn-rm" onClick={() => removeDraftSet(ei, si)}>×</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="btn-add-set" onClick={() => addDraftSet(ei)}>+ Set</button>
            </div>
          ) : (
            <div className="history-ex">
              <strong style={{ color: "var(--text)" }}>{ex.name}</strong>
              {ex.priority && <span className="ex-tag priority" style={{ marginLeft: 6 }}>Priority</span>}
              <div className="history-sets">
                {ex.sets.map((s, j) => (
                  <span key={j} style={{ marginRight: 8, color: s.type === "drop" ? "#f59e0b" : s.type === "restpause" ? "#a78bfa" : "inherit" }}>
                    {s.weight ? `${s.weight}lb × ` : ""}{s.reps}{s.pauseReps ? `+${s.pauseReps}` : ""}r {s.rir !== undefined ? `RIR${s.rir}` : ""}
                    {s.type === "drop" && s.drops?.length > 0 && ` → ${s.drops.map(d => `${d.weight}×${d.reps}`).join(" → ")}`}
                    {s.type === "restpause" && " [RP]"}
                    {s.type === "drop" && " [DS]"}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* NOTES */}
      {editing ? (
        <textarea
          className="inp"
          value={draft.notes || ""}
          onChange={e => updateDraftField("notes", e.target.value)}
          placeholder="Session notes..."
          style={{ marginTop: 8, minHeight: 56 }}
        />
      ) : (
        <>

          {w.notes && <div style={{ marginTop: 8, fontSize: 13, color: "var(--text3)", fontStyle: "italic" }}>"{w.notes}"</div>}
        </>
      )}
    </div>
  );
}


// ── Trending / Streak Engine ──────────────────────────────────────────────────

function sessionVolume(sets) {
  return sets
    .filter(s => s.weight && s.reps)
    .reduce((sum, s) => sum + parseFloat(s.weight) * parseFloat(s.reps), 0);
}

function buildTrendingLifts(workouts) {
  // Build per-exercise timeline: { name → [{date, volume, avgWeight, avgReps}] }
  const exerciseTimeline = {};

  workouts.forEach(w => {
    w.exercises.forEach(ex => {
      const workingSets = (ex.sets || []).filter(s => s.weight && s.reps);
      if (!workingSets.length) return;
      const vol      = sessionVolume(workingSets);
      const avgW     = workingSets.reduce((s, x) => s + parseFloat(x.weight), 0) / workingSets.length;
      const avgR     = workingSets.reduce((s, x) => s + parseFloat(x.reps), 0) / workingSets.length;
      if (!exerciseTimeline[ex.name]) exerciseTimeline[ex.name] = [];
      exerciseTimeline[ex.name].push({ date: w.date, volume: vol, avgWeight: avgW, avgReps: avgR });
    });
  });

  const results = [];

  Object.entries(exerciseTimeline).forEach(([name, sessions]) => {
    if (sessions.length < 3) return;
    sessions.sort((a, b) => a.date.localeCompare(b.date));

    // Calculate streak — walk backwards from most recent session
    let streak = 1;
    let graceUsed = false;

    for (let i = sessions.length - 1; i > 0; i--) {
      const curr = sessions[i];
      const prev = sessions[i - 1];

      // Gap check — more than 3 weeks breaks the streak
      const dayGap = (new Date(curr.date) - new Date(prev.date)) / (1000 * 60 * 60 * 24);
      if (dayGap > 21) break;

      const volUp    = curr.volume > prev.volume;
      const weightUp = curr.avgWeight > prev.avgWeight;
      const repsBig  = curr.avgReps >= prev.avgReps + 2;
      const improving = volUp || weightUp || repsBig;
      const flat      = !improving && Math.abs(curr.volume - prev.volume) / (prev.volume || 1) < 0.03;

      if (improving) {
        streak++;
      } else if (flat && !graceUsed) {
        // One grace session — slight dip or flat doesn't kill the streak
        graceUsed = true;
        streak++;
      } else {
        break;
      }
    }

    if (streak < 3) return;

    // Build sparkline data — last 6 volume points
    const sparkData = sessions.slice(-6).map(s => s.volume);
    const latestVol = sessions[sessions.length - 1].volume;
    const prevVol   = sessions[sessions.length - 2]?.volume || latestVol;
    const volChange = latestVol - prevVol;
    const latestW   = sessions[sessions.length - 1].avgWeight;
    const firstW    = sessions[sessions.length - streak]?.avgWeight || latestW;
    const weightGain = latestW - firstW;

    results.push({ name, streak, sparkData, latestVol, volChange, weightGain, sessions: sessions.length });
  });

  // Sort by streak length desc, then vol change desc
  results.sort((a, b) => b.streak - a.streak || b.volChange - a.volChange);
  return results.slice(0, 5);
}

// Tiny SVG sparkline — no deps needed
function Sparkline({ data, width = 80, height = 28, color = "#c8f542" }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Highlight last point */}
      <circle
        cx={parseFloat(pts[pts.length - 1].split(",")[0])}
        cy={parseFloat(pts[pts.length - 1].split(",")[1])}
        r="3"
        fill={color}
      />
    </svg>
  );
}

function TrendingCard({ workouts }) {
  const trends = buildTrendingLifts(workouts);
  if (trends.length === 0) return null;

  return (
    <div className="card" style={{ borderColor: "var(--accent)", background: "#050f00", marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div className="card-title" style={{ marginBottom: 0, color: "var(--accent)" }}>🔥 Trending Lifts</div>
        <span style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-display)", letterSpacing: 1 }}>VOLUME · LAST 6 SESSIONS</span>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {trends.map((t, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "var(--surface2)", borderRadius: 6, padding: "10px 12px",
            border: "1px solid var(--border)", gap: 12,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{t.name}</span>
                <span style={{
                  fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 700,
                  letterSpacing: 1, color: "#000", background: "var(--accent)",
                  padding: "1px 7px", borderRadius: 3,
                }}>↑ {t.streak} IN A ROW</span>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
                {t.weightGain > 0.5 && (
                  <span style={{ fontSize: 12, color: "var(--accent)" }}>+{Math.round(t.weightGain)}lbs avg weight this run</span>
                )}
                <span style={{ fontSize: 12, color: "var(--text3)" }}>
                  {t.volChange >= 0 ? "+" : ""}{Math.round(t.volChange)} vol last session
                </span>
              </div>
            </div>
            <div style={{ flexShrink: 0 }}>
              <Sparkline data={t.sparkData} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function History({ workouts, onDelete, onUpdate }) {
  const sorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date));
  if (sorted.length === 0) return (
    <div className="page"><div className="empty"><div className="empty-icon">📋</div><div className="empty-text">No sessions yet</div></div></div>
  );
  return (
    <div className="page">
      <TrendingCard workouts={workouts} />
      {sorted.map(w => (
        <HistoryEntry key={w.id} workout={w} onDelete={onDelete} onUpdate={onUpdate} />
      ))}
    </div>
  );
}


// ── Body Tracker ──────────────────────────────────────────────────────────────

function BodyMiniChart({ entries, field, color, label, unit }) {
  if (!entries || entries.length < 2) return null;
  const data = entries.slice(-28).filter(e => e[field]);
  if (data.length < 2) return null;
  const vals = data.map(e => parseFloat(e[field]));
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 0.1;
  const W = 200, H = 48;
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 6) - 3;
    return `${x},${y}`;
  });
  const latest = vals[vals.length - 1];
  const prev   = vals[vals.length - 2];
  const delta  = latest - prev;
  return (
    <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6, padding: "10px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: 1, color: "var(--text3)", textTransform: "uppercase" }}>{label}</div>
          <div style={{ fontSize: 22, fontFamily: "var(--font-display)", fontWeight: 900, color, lineHeight: 1.1, marginTop: 2 }}>
            {latest.toFixed(field === "bf" ? 1 : 1)}{unit}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: delta < 0 ? "var(--accent)" : delta > 0 ? "var(--red)" : "var(--text3)", fontFamily: "var(--font-display)", fontWeight: 700 }}>
            {delta > 0 ? "+" : ""}{delta.toFixed(1)}{unit} last entry
          </div>
          <div style={{ fontSize: 11, color: "var(--text3)" }}>{data.length} entries</div>
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={parseFloat(pts[pts.length-1].split(",")[0])} cy={parseFloat(pts[pts.length-1].split(",")[1])} r="3" fill={color} />
      </svg>
    </div>
  );
}

function BodyTracker({ bodyEntries, onSave, phase, workouts, phaseGoals }) {
  const [date, setDate] = useState(today());
  const [weight, setWeight] = useState("");
  const [bf, setBf] = useState("");
  const [saved, setSaved] = useState(false);

  // Daily targets — persisted locally, set once from sheet, update when cut changes
  const [targets, setTargets] = useState(() => loadData("macroTargets", { calories: "", protein: "", carbs: "", fat: "" }));
  const [editingTargets, setEditingTargets] = useState(false);
  const [targetDraft, setTargetDraft] = useState(targets);

  const saveTargets = () => {
    setTargets(targetDraft);
    saveData("macroTargets", targetDraft);
    setEditingTargets(false);
  };

  const hasTargets = targets.calories || targets.protein;

  // Macro fields — keyed to a separate "macro date" defaulting to yesterday
  const yesterday = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split("T")[0]; })();
  const [macroDate, setMacroDate] = useState(yesterday);
  const [calories, setCalories] = useState("");
  const [protein, setProtein]   = useState("");
  const [carbs, setCarbs]       = useState("");
  const [fat, setFat]           = useState("");

  // Pre-fill today's existing body entry if present
  useEffect(() => {
    const existing = bodyEntries.find(e => e.date === date);
    if (existing) {
      setWeight(existing.weight || "");
      setBf(existing.bf || "");
    } else {
      setWeight(""); setBf("");
    }
  }, [date, bodyEntries]);

  // Pre-fill macro fields when macro date changes
  useEffect(() => {
    const existing = bodyEntries.find(e => e.date === macroDate);
    if (existing?.macros) {
      setCalories(existing.macros.calories || "");
      setProtein(existing.macros.protein || "");
      setCarbs(existing.macros.carbs || "");
      setFat(existing.macros.fat || "");
    } else {
      setCalories(""); setProtein(""); setCarbs(""); setFat("");
    }
  }, [macroDate, bodyEntries]);

  const handleSave = () => {
    const hasBody  = weight || bf;
    const hasMacro = calories || protein;
    if (!hasBody && !hasMacro) return;

    // Build all entries to save and pass as one atomic array
    const toSave = [];

    if (hasBody) {
      const existingBody = bodyEntries.find(e => e.date === date);
      toSave.push({ ...(existingBody || {}), date, weight, bf });
    }

    if (hasMacro) {
      // If body and macro share the same date, merge into one entry
      const sameDate = hasBody && date === macroDate;
      if (sameDate) {
        const idx = toSave.findIndex(e => e.date === macroDate);
        toSave[idx] = { ...toSave[idx], macros: { calories, protein, carbs, fat } };
      } else {
        const existingMacro = bodyEntries.find(e => e.date === macroDate);
        toSave.push({ ...(existingMacro || {}), date: macroDate, macros: { calories, protein, carbs, fat } });
      }
    }

    onSave(toSave);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Weekly average weight — last 4 weeks
  const weeklyAvgs = (() => {
    const result = [];
    for (let w = 0; w < 12; w++) {
      const end = new Date(); end.setDate(end.getDate() - w * 7);
      const start = new Date(end); start.setDate(start.getDate() - 6);
      const startStr = start.toISOString().split("T")[0];
      const endStr   = end.toISOString().split("T")[0];
      const week = bodyEntries.filter(e => e.date >= startStr && e.date <= endStr && e.weight);
      if (week.length >= 1) {
        const avg = week.reduce((s, e) => s + parseFloat(e.weight), 0) / week.length;
        const weekLabel = w === 0 ? "This week" : w === 1 ? "Last week" : `${w} weeks ago`;
        result.unshift({ label: weekLabel, avg: avg.toFixed(1), count: week.length });
      }
    }
    return result;
  })();

  // Rate of loss/gain: compare last two full weeks
  const rateOfChange = weeklyAvgs.length >= 2
    ? (parseFloat(weeklyAvgs[weeklyAvgs.length - 1].avg) - parseFloat(weeklyAvgs[weeklyAvgs.length - 2].avg)).toFixed(1)
    : null;

  const currentGoal = phaseGoals?.[phase];

  // Deadline mode — required rate calculation
  const requiredRate = (() => {
    if (phase !== "cut" || currentGoal?.mode !== "deadline") return null;
    const latestW = [...bodyEntries].filter(e => e.weight).sort((a,b) => b.date.localeCompare(a.date))[0];
    if (!latestW || !currentGoal.targetWeight || !currentGoal.deadline) return null;
    const daysLeft = Math.ceil((new Date(currentGoal.deadline) - new Date()) / (1000*60*60*24));
    if (daysLeft <= 0) return null;
    const needed = parseFloat(latestW.weight) - parseFloat(currentGoal.targetWeight);
    return { rate: (needed / daysLeft * 7).toFixed(2), daysLeft, needed: needed.toFixed(1) };
  })();

  const sorted = [...bodyEntries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="page">
      {/* ENTRY CARD */}
      <div className="card">
        <div className="card-title">Daily Check-In</div>

        {/* BODY SECTION */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: 1, color: "var(--accent2)", textTransform: "uppercase", marginBottom: 8 }}>Today's Body</div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div>
              <div className="macro-lbl" style={{ marginBottom: 4 }}>Date</div>
              <input type="date" className="inp" style={{ width: 150 }} value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <div className="macro-lbl" style={{ marginBottom: 4 }}>Weight (lbs)</div>
              <input className="inp inp-sm" style={{ width: 90 }} placeholder="e.g. 185.5" value={weight} onChange={e => setWeight(e.target.value)} />
            </div>
            <div>
              <div className="macro-lbl" style={{ marginBottom: 4 }}>Body Fat %</div>
              <input className="inp inp-sm" style={{ width: 90 }} placeholder="e.g. 16.5" value={bf} onChange={e => setBf(e.target.value)} />
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div style={{ borderTop: "1px solid var(--border)", marginBottom: 16 }} />

        {/* MACROS SECTION — separate date, defaults to yesterday */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
            <div style={{ fontSize: 11, fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: 1, color: "#42c8f5", textTransform: "uppercase" }}>Yesterday's Macros</div>
            <input type="date" className="inp" style={{ width: 150 }} value={macroDate} onChange={e => setMacroDate(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { label: "kcal",       val: calories, set: setCalories, placeholder: "e.g. 2400" },
              { label: "protein (g)", val: protein,  set: setProtein,  placeholder: "e.g. 190"  },
              { label: "carbs (g)",   val: carbs,    set: setCarbs,    placeholder: "e.g. 220"  },
              { label: "fat (g)",     val: fat,      set: setFat,      placeholder: "e.g. 70"   },
            ].map(({ label, val, set, placeholder }) => (
              <div key={label}>
                <div className="macro-lbl" style={{ marginBottom: 4 }}>{label}</div>
                <input className="inp inp-sm" style={{ width: 86 }} placeholder={placeholder} value={val} onChange={e => set(e.target.value)} />
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 6 }}>
            Defaults to yesterday — adjust date if logging for a different day.
          </div>
        </div>

        <div className="btn-row">
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={!weight && !bf && !calories && !protein}>
            {saved ? "✓ Saved" : "Log"}
          </button>
        </div>
      </div>

      {/* DAILY TARGETS CARD */}
      <div className="card" style={{ borderColor: hasTargets ? "#42c8f5" : "var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: hasTargets && !editingTargets ? 12 : 0 }}>
          <div className="card-title" style={{ marginBottom: 0, color: hasTargets ? "#42c8f5" : "var(--text2)" }}>Daily Targets</div>
          <button
            className="btn btn-secondary btn-sm"
            style={{ fontSize: 11 }}
            onClick={() => { setTargetDraft(targets); setEditingTargets(e => !e); }}
          >{editingTargets ? "Cancel" : hasTargets ? "Edit" : "Set Targets"}</button>
        </div>

        {editingTargets && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10, lineHeight: 1.5 }}>
              Paste your targets from your Google Sheet. These stay fixed until you update them — adjust when your cut progresses and targets change.
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
              {[
                { label: "kcal",        key: "calories", placeholder: "e.g. 2200" },
                { label: "protein (g)", key: "protein",  placeholder: "e.g. 185"  },
                { label: "carbs (g)",   key: "carbs",    placeholder: "e.g. 200"  },
                { label: "fat (g)",     key: "fat",      placeholder: "e.g. 65"   },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <div className="macro-lbl" style={{ marginBottom: 4 }}>{label}</div>
                  <input
                    className="inp inp-sm" style={{ width: 90 }}
                    placeholder={placeholder}
                    value={targetDraft[key] || ""}
                    onChange={e => setTargetDraft(d => ({ ...d, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <button className="btn btn-primary btn-sm" onClick={saveTargets}>Save Targets</button>
          </div>
        )}

        {hasTargets && !editingTargets && (() => {
          // Find actuals for the macro date (yesterday by default)
          const entry = bodyEntries.find(e => e.date === macroDate);
          const actuals = entry?.macros;
          const fields = [
            { label: "Calories", key: "calories", unit: "kcal", color: "var(--accent2)" },
            { label: "Protein",  key: "protein",  unit: "g",    color: "#42c8f5" },
            { label: "Carbs",    key: "carbs",    unit: "g",    color: "var(--accent)" },
            { label: "Fat",      key: "fat",      unit: "g",    color: "#c084fc" },
          ];
          return (
            <div style={{ display: "grid", gap: 8 }}>
              {fields.filter(f => targets[f.key]).map(f => {
                const target = parseFloat(targets[f.key]);
                const actual = actuals ? parseFloat(actuals[f.key] || 0) : null;
                const pct    = actual !== null ? Math.round((actual / target) * 100) : null;
                const diff   = actual !== null ? actual - target : null;
                const onTrack = pct !== null && pct >= 90 && pct <= 110;
                const over    = pct !== null && pct > 110;
                return (
                  <div key={f.key}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "var(--text2)", fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{f.label}</span>
                      <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                        {actual !== null ? (
                          <>
                            <span style={{ fontSize: 13, fontWeight: 600, color: onTrack ? f.color : over ? "var(--red)" : "var(--text2)" }}>
                              {actual}{f.unit}
                            </span>
                            <span style={{ fontSize: 11, color: "var(--text3)" }}>/ {target}{f.unit}</span>
                            <span style={{ fontSize: 11, fontFamily: "var(--font-display)", fontWeight: 700, color: onTrack ? "var(--accent)" : over ? "var(--red)" : "var(--accent2)" }}>
                              {diff > 0 ? "+" : ""}{Math.round(diff)}{f.unit}
                            </span>
                          </>
                        ) : (
                          <span style={{ fontSize: 12, color: "var(--text3)" }}>Target: {target}{f.unit} — not logged yet</span>
                        )}
                      </div>
                    </div>
                    <div style={{ height: 5, background: "var(--surface3)", borderRadius: 3, overflow: "hidden" }}>
                      {actual !== null && (
                        <div style={{
                          height: "100%", borderRadius: 3,
                          width: `${Math.min(pct, 120)}%`,
                          background: onTrack ? f.color : over ? "var(--red)" : "var(--accent2)",
                          transition: "width 0.4s ease",
                        }} />
                      )}
                    </div>
                  </div>
                );
              })}
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>
                Showing actuals for {fmtDate(macroDate)} — change the macro date in check-in to compare any day.
              </div>
            </div>
          );
        })()}

        {!hasTargets && !editingTargets && (
          <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 10 }}>
            Set your daily targets from your Google Sheet and the app will track actuals vs targets each day you log macros.
          </div>
        )}
      </div>

      {/* GOAL PROGRESS */}
      {currentGoal && (
        <div className="card" style={{ borderColor: "var(--accent)", background: "#050f00" }}>
          <div className="card-title" style={{ color: "var(--accent)", marginBottom: 8 }}>🎯 Goal Progress</div>

          {phase === "cut" && currentGoal.mode === "rate" && rateOfChange !== null && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "var(--text2)" }}>Current rate</span>
                <span style={{ fontSize: 14, fontFamily: "var(--font-display)", fontWeight: 700,
                  color: Math.abs(parseFloat(rateOfChange)) >= parseFloat(currentGoal.targetRate) * 0.85 ? "var(--accent)" : "var(--red)" }}>
                  {rateOfChange > 0 ? "+" : ""}{rateOfChange} lbs/wk
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "var(--text2)" }}>Target rate</span>
                <span style={{ fontSize: 13, color: "var(--text3)" }}>{currentGoal.targetRate} lbs/wk</span>
              </div>
              <div style={{ height: 6, background: "var(--surface3)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 3, transition: "width 0.4s ease",
                  width: `${Math.min(Math.abs(parseFloat(rateOfChange)) / parseFloat(currentGoal.targetRate) * 100, 100)}%`,
                  background: Math.abs(parseFloat(rateOfChange)) >= parseFloat(currentGoal.targetRate) * 0.85 ? "var(--accent)" : "var(--red)"
                }} />
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 6 }}>
                {Math.abs(parseFloat(rateOfChange)) < parseFloat(currentGoal.targetRate) * 0.85
                  ? `⚠ ${(parseFloat(currentGoal.targetRate) - Math.abs(parseFloat(rateOfChange))).toFixed(2)} lbs/wk below target — tighten the deficit`
                  : "✓ On pace with your target rate"}
              </div>
            </div>
          )}

          {phase === "cut" && currentGoal.mode === "deadline" && (
            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "var(--text2)" }}>Goal weight</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>{currentGoal.targetWeight} lbs by {currentGoal.deadline}</span>
              </div>
              {requiredRate && <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "var(--text2)" }}>Required rate</span>
                <span style={{ fontSize: 13, fontFamily: "var(--font-display)", fontWeight: 700,
                  color: parseFloat(requiredRate.rate) > 2 ? "var(--red)" : "var(--accent)" }}>
                  {requiredRate.rate} lbs/wk ({requiredRate.daysLeft} days left)
                </span>
              </div>}
              {rateOfChange !== null && requiredRate && <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "var(--text2)" }}>Current rate</span>
                <span style={{ fontSize: 13, color: Math.abs(parseFloat(rateOfChange)) >= parseFloat(requiredRate.rate) * 0.85 ? "var(--accent)" : "var(--accent2)" }}>
                  {rateOfChange} lbs/wk
                </span>
              </div>}
              {requiredRate && parseFloat(requiredRate.rate) > 2 && (
                <div style={{ fontSize: 11, color: "var(--red)", marginTop: 4 }}>⚠ Required rate is aggressive — consider extending deadline or adjusting goal weight</div>
              )}
            </div>
          )}

          {phase === "build" && currentGoal.mode === "priority" && currentGoal.muscles?.length > 0 && (
            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 4 }}>14-day volume — priority muscles</div>
              {currentGoal.muscles.map(m => {
                const vol = muscleVolume(workouts, 14)[m] || 0;
                const allVols = Object.values(muscleVolume(workouts, 14)).filter(v => v > 0);
                const max = allVols.length ? Math.max(...allVols) : 1;
                return (
                  <div key={m}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 12, textTransform: "capitalize", color: "var(--text2)" }}>{m.replace("_"," ")}</span>
                      <span style={{ fontSize: 12, fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--accent)" }}>{vol} sets</span>
                    </div>
                    <div style={{ height: 5, background: "var(--surface3)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 3, width: `${(vol/max)*100}%`, background: "var(--accent)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {phase === "build" && currentGoal.mode === "strength" && (
            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "var(--text2)" }}>{currentGoal.lift}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>→ {currentGoal.targetWeight}lbs × {currentGoal.targetReps}</span>
              </div>
              {(() => {
                const recent = [...workouts].sort((a,b) => b.date.localeCompare(a.date));
                for (const w of recent) {
                  const ex = w.exercises?.find(e => e.name?.toLowerCase().includes((currentGoal.lift||"").toLowerCase()));
                  if (ex?.sets?.length) {
                    const best = ex.sets.filter(s => s.weight && s.reps).sort((a,b) => parseFloat(b.weight)-parseFloat(a.weight))[0];
                    if (best) return (
                      <div style={{ fontSize: 12, color: "var(--text3)" }}>
                        Last logged: <span style={{ color: "var(--text2)" }}>{best.weight}lbs × {best.reps} ({w.date})</span>
                      </div>
                    );
                  }
                }
                return <div style={{ fontSize: 12, color: "var(--text3)" }}>No matching sessions logged yet</div>;
              })()}
            </div>
          )}

          {currentGoal.note && (
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 8, fontStyle: "italic" }}>{currentGoal.note}</div>
          )}
        </div>
      )}

      {/* TREND CHARTS */}
      {bodyEntries.filter(e => e.weight).length >= 2 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <BodyMiniChart entries={bodyEntries} field="weight" color="var(--accent2)" label="Bodyweight" unit="lbs" />
          {bodyEntries.filter(e => e.bf).length >= 2 && (
            <BodyMiniChart entries={bodyEntries} field="bf" color="#42c8f5" label="Body Fat" unit="%" />
          )}
        </div>
      )}

      {/* WEEKLY SUMMARY */}
      {weeklyAvgs.length >= 2 && (
        <div className="card">
          <div className="card-title">Weekly Averages</div>
          <div style={{ display: "grid", gap: 6, marginBottom: 10 }}>
            {weeklyAvgs.map((w, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 13, color: "var(--text2)" }}>{w.label}</span>
                <span style={{ fontSize: 13, fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--accent2)" }}>{w.avg} lbs <span style={{ color: "var(--text3)", fontWeight: 400, fontSize: 11 }}>({w.count} days)</span></span>
              </div>
            ))}
          </div>
          {rateOfChange !== null && (
            <div style={{
              padding: "8px 12px", borderRadius: 5,
              background: Math.abs(parseFloat(rateOfChange)) < 0.1 ? "var(--surface3)" : parseFloat(rateOfChange) < 0 ? "#0a1400" : "#1a0a00",
              border: `1px solid ${Math.abs(parseFloat(rateOfChange)) < 0.1 ? "var(--border)" : parseFloat(rateOfChange) < 0 ? "var(--accent)" : "var(--red)"}`,
            }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 700, letterSpacing: 1, color: parseFloat(rateOfChange) < 0 ? "var(--accent)" : parseFloat(rateOfChange) > 0 ? "var(--red)" : "var(--text3)" }}>
                RATE: {rateOfChange > 0 ? "+" : ""}{rateOfChange} lbs/week
              </span>
              <span style={{ fontSize: 12, color: "var(--text3)", marginLeft: 10 }}>
                {phase === "cut"
                  ? Math.abs(parseFloat(rateOfChange)) >= 0.5 && Math.abs(parseFloat(rateOfChange)) <= 2
                    ? "✓ On target for cut (0.5-2lbs/week)"
                    : Math.abs(parseFloat(rateOfChange)) > 2
                      ? "⚠ Dropping fast — muscle loss risk"
                      : "⚠ Slow progress — may need deeper deficit"
                  : phase === "build"
                    ? parseFloat(rateOfChange) >= 0.25 && parseFloat(rateOfChange) <= 0.75
                      ? "✓ Lean gain range (0.25-0.75lbs/week)"
                      : parseFloat(rateOfChange) > 0.75
                        ? "⚠ Gaining fast — more fat than muscle likely"
                        : "⚠ Not gaining — increase calories"
                    : "Tracking..."
                }
              </span>
            </div>
          )}
        </div>
      )}

      {/* LOG TABLE */}
      {sorted.length > 0 && (
        <div className="card">
          <div className="card-title">Log</div>
          <table className="ex-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Weight</th>
                <th>BF%</th>
                <th>Est. LBM</th>
                <th>kcal</th>
                <th>Protein</th>
              </tr>
            </thead>
            <tbody>
              {sorted.slice(0, 30).map((e, i) => {
                const lbm = e.weight && e.bf ? (parseFloat(e.weight) * (1 - parseFloat(e.bf) / 100)).toFixed(1) : "—";
                return (
                  <tr key={i}>
                    <td style={{ fontSize: 12, color: "var(--text2)" }}>{fmtDate(e.date)}</td>
                    <td style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{e.weight ? `${e.weight} lbs` : "—"}</td>
                    <td style={{ fontSize: 13, color: "var(--text2)" }}>{e.bf ? `${e.bf}%` : "—"}</td>
                    <td style={{ fontSize: 12, color: "var(--accent)" }}>{lbm !== "—" ? `${lbm} lbs` : "—"}</td>
                    <td style={{ fontSize: 12, color: "var(--text2)" }}>{e.macros?.calories ? `${e.macros.calories}` : "—"}</td>
                    <td style={{ fontSize: 12, color: "#42c8f5" }}>{e.macros?.protein ? `${e.macros.protein}g` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {sorted.length === 0 && (
        <div className="empty"><div className="empty-icon">⚖️</div><div className="empty-text">No body entries yet — log your first check-in above</div></div>
      )}
    </div>
  );
}

// ── AI Coach ──────────────────────────────────────────────────────────────────

function AICoach({ workouts, phase, bodyEntries, recoveryContext, phaseGoals }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState(() => loadData("lastCheckIn", null));
  const [checkInRunning, setCheckInRunning] = useState(false);

  const daysSinceCheckIn = lastCheckIn
    ? Math.floor((Date.now() - new Date(lastCheckIn).getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const checkInDue = daysSinceCheckIn === null || daysSinceCheckIn >= 7;

  const buildContext = () => {
    const recent = [...workouts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
    const vol7  = muscleVolume(workouts, 7);
    const vol14 = muscleVolume(workouts, 14);

    // Body data — last 84 days (12 weeks)
    const cutoff84 = new Date(); cutoff84.setDate(cutoff84.getDate() - 84);
    const recentBody = [...(bodyEntries || [])]
      .filter(e => new Date(e.date) >= cutoff84)
      .sort((a, b) => b.date.localeCompare(a.date));

    // Weekly avg weight — group by Mon-Sun calendar week, sorted oldest→newest
    const weeklyWeights = (() => {
      const weeks = {};
      recentBody.filter(e => e.weight).forEach(e => {
        const d = new Date(e.date + "T12:00:00");
        // Get Monday of this week
        const day = d.getDay(); // 0=Sun
        const monday = new Date(d);
        monday.setDate(d.getDate() - ((day + 6) % 7));
        const weekKey = monday.toISOString().split("T")[0]; // e.g. "2026-02-24"
        if (!weeks[weekKey]) weeks[weekKey] = [];
        weeks[weekKey].push(parseFloat(e.weight));
      });
      return Object.entries(weeks)
        .sort(([a], [b]) => a.localeCompare(b)) // chronological
        .map(([k, vs]) => {
          const monday = new Date(k + "T12:00:00");
          const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
          const fmt = (d) => `${d.getMonth()+1}/${d.getDate()}`;
          return {
            week: `${fmt(monday)}–${fmt(sunday)}`,
            avg: (vs.reduce((s, v) => s + v, 0) / vs.length).toFixed(1),
            count: vs.length,
          };
        });
    })();

    // Macro averages from bodyEntries last 14 days
    const cutoff14 = new Date(); cutoff14.setDate(cutoff14.getDate() - 14);
    const macroLogs = (bodyEntries || [])
      .filter(e => new Date(e.date) >= cutoff14 && e.macros?.calories)
      .map(e => e.macros);
    const avgMacros = macroLogs.length ? {
      calories: Math.round(macroLogs.reduce((s, m) => s + parseFloat(m.calories || 0), 0) / macroLogs.length),
      protein:  Math.round(macroLogs.reduce((s, m) => s + parseFloat(m.protein || 0), 0) / macroLogs.length),
    } : null;

    // Rate of weight change
    const weightEntries = recentBody.filter(e => e.weight).sort((a, b) => a.date.localeCompare(b.date));
    let rateOfChange = null;
    if (weightEntries.length >= 4) {
      const oldest = parseFloat(weightEntries[0].weight);
      const newest = parseFloat(weightEntries[weightEntries.length - 1].weight);
      const days = (new Date(weightEntries[weightEntries.length-1].date) - new Date(weightEntries[0].date)) / (1000*60*60*24);
      rateOfChange = days > 0 ? ((newest - oldest) / days * 7).toFixed(2) : null;
    }

    // Latest BF and estimated LBM
    const latestBF  = recentBody.find(e => e.bf);
    const latestW   = recentBody.find(e => e.weight);
    const estLBM    = latestW && latestBF
      ? (parseFloat(latestW.weight) * (1 - parseFloat(latestBF.bf) / 100)).toFixed(1)
      : null;

    // Load macro targets for coach context
    const macroTargets = loadData("macroTargets", null);

    // Phase goal context
    const goal = phaseGoals?.[phase];
    const goalLine = (() => {
      if (!goal) return "";
      if (phase === "cut") {
        if (goal.mode === "rate") return `\nCUT GOAL: Target rate of loss ${goal.targetRate} lbs/week.${goal.note ? " Note: " + goal.note : ""}`;
        if (goal.mode === "deadline") {
          const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000*60*60*24)) : null;
          return `\nCUT GOAL: Reach ${goal.targetWeight}lbs by ${goal.deadline}${daysLeft !== null ? ` (${daysLeft} days away)` : ""}.${goal.note ? " Note: " + goal.note : ""}`;
        }
      }
      if (phase === "build") {
        if (goal.mode === "overall") return `\nBUILD GOAL: Overall growth — balanced development across all muscle groups.${goal.note ? " Note: " + goal.note : ""}`;
        if (goal.mode === "priority") return `\nBUILD GOAL: Priority muscles — ${(goal.muscles||[]).map(m=>m.replace("_"," ")).join(" and ")}. Weight assessments toward these groups.${goal.note ? " Note: " + goal.note : ""}`;
        if (goal.mode === "strength") return `\nBUILD GOAL: Strength target — ${goal.lift} ${goal.targetWeight}lbs × ${goal.targetReps} reps.${goal.note ? " Note: " + goal.note : ""}`;
      }
      if (goal.note) return `\nPHASE GOAL: ${goal.note}`;
      return "";
    })();

    const rcLine = recoveryContext?.active
      ? `\nRECOVERY CONTEXT: ${RECOVERY_REASONS.find(r => r.id === recoveryContext.reason)?.label || recoveryContext.reason}${recoveryContext.injuryDetail ? ` — ${recoveryContext.injuryDetail}` : ""}. Started ${recoveryContext.startDate}.`
      : "";
    return `CURRENT PHASE: ${phase.toUpperCase()}${goalLine}${rcLine}
${macroTargets?.calories ? `DAILY MACRO TARGETS: ${macroTargets.calories}kcal | ${macroTargets.protein}g protein | ${macroTargets.carbs}g carbs | ${macroTargets.fat}g fat` : "DAILY MACRO TARGETS: not set"}

TRAINING VOLUME — LAST 7 DAYS: ${JSON.stringify(vol7)}
TRAINING VOLUME — LAST 14 DAYS: ${JSON.stringify(vol14)}

BODY COMPOSITION:
${latestW ? `Latest weight: ${latestW.weight}lbs (${latestW.date})` : "No weight logged"}
${latestBF ? `Latest body fat: ${latestBF.bf}% (${latestBF.date})` : "No BF% logged"}
${estLBM ? `Estimated LBM: ${estLBM}lbs` : ""}
${rateOfChange !== null ? `Rate of change: ${rateOfChange > 0 ? "+" : ""}${rateOfChange}lbs/week` : "Rate of change: insufficient data"}
Weekly weight averages (oldest → newest): ${weeklyWeights.map(w => `${w.week}: ${w.avg}lbs (${w.count} entries)`).join(" | ") || "none"}

NUTRITION (14-day avg from logged sessions):
${avgMacros ? `Calories: ${avgMacros.calories} kcal/day avg | Protein: ${avgMacros.protein}g/day avg` : "No macros logged yet"}
Macro logs available: ${macroLogs.length} sessions

LAST 10 SESSIONS:
${recent.map(w => `${w.date} — ${w.splitDay} | Feel: ${FEEL_LABELS[w.feel]} | Sets: ${totalSets(w)}
${w.exercises.map(ex => `  ${ex.name}: ${ex.sets.map(s => `${s.weight}lb×${s.reps}r RIR${s.rir}`).join(", ")}`).join("\n")}${w.notes ? `\n  Notes: ${w.notes}` : ""}${w.macros?.calories ? `\n  Macros: ${w.macros.calories}kcal, ${w.macros.protein}g protein` : ""}`).join("\n\n")}`;
  };

  const buildWeeklyCheckInPrompt = () => {
    const ctx = buildContext();
    const phaseInstructions = {
      cut: `Focus your assessment on:
1. WEIGHT TREND — rate of loss vs target (0.5-2lbs/week), any alarm signals
2. MUSCLE RETENTION — are strength numbers holding? Any significant drops?
3. NUTRITION — avg protein vs bodyweight, caloric consistency, any days of likely under-eating
4. TRAINING TOLERANCE — feel scores, volume vs recovery, any signs of excessive fatigue
5. NEXT WEEK ADJUSTMENT — one specific, actionable recommendation (e.g. add 20g protein, reduce volume on X day, adjust deficit)`,
      build: `Focus your assessment on:
1. WEIGHT TREND — rate of gain vs target (0.25-0.75lbs/week), lean vs excessive
2. PROGRESSIVE OVERLOAD — which lifts moved, which stalled, any plateaus forming
3. NUTRITION — surplus adequacy, protein sufficiency, consistency
4. VOLUME & RECOVERY — are you recovering between sessions? Feel scores vs volume
5. NEXT WEEK ADJUSTMENT — one specific, actionable recommendation`,
      recovery: `Focus your assessment on:
1. ELBOW STATUS — any exercises causing aggravation? Volume on modified exercises appropriate?
2. CONSISTENCY — showing up regularly? Session quality vs expectations for recovery phase
3. VOLUME LOAD — is overall volume appropriate for recovery? Signs of overdoing it?
4. READINESS — based on feel scores and trends, when might a move to maintenance make sense?
5. NEXT WEEK ADJUSTMENT — one specific, actionable recommendation`,
      maintenance: `Focus your assessment on:
1. BASELINE STATUS — strength stable? Weight stable? Good foundation for a future cut/build?
2. VOLUME BALANCE — any muscles getting disproportionate volume?
3. CONSISTENCY — session frequency, feel scores, any patterns worth noting
4. CUT READINESS — based on current data, are conditions good to start a cut?
5. NEXT WEEK ADJUSTMENT — one specific, actionable recommendation`,
    };

    const goal = phaseGoals?.[phase];
    const goalContext = goal ? `\n\nACTIVE GOAL: ${
      phase === "cut" && goal.mode === "rate" ? `Target rate ${goal.targetRate} lbs/week — compare actual rate against this target and flag if off-pace.` :
      phase === "cut" && goal.mode === "deadline" ? `Goal weight ${goal.targetWeight}lbs by ${goal.deadline} — calculate if current rate of loss will hit this in time.` :
      phase === "build" && goal.mode === "priority" ? `Priority muscles: ${(goal.muscles||[]).map(m=>m.replace("_"," ")).join(" and ")} — weight your assessment toward these.` :
      phase === "build" && goal.mode === "strength" ? `Strength target: ${goal.lift} ${goal.targetWeight}lbs × ${goal.targetReps} reps — track progress toward this specifically.` :
      goal.note || "General phase goal set."
    }` : "";
    return `${ctx}${goalContext}

---
WEEKLY CHECK-IN REQUEST

Please give me a structured weekly assessment. Be direct and specific — use my actual numbers, not generalities. Format your response with clear section headers matching the 5 areas below.

${phaseInstructions[phase] || phaseInstructions.maintenance}

End with a single sentence summary verdict: e.g. "Solid week — deficit is working, tighten up protein on rest days."`;
  };

  const runWeeklyCheckIn = async () => {
    if (loading || checkInRunning) return;
    setCheckInRunning(true);
    const prompt = buildWeeklyCheckInPrompt();
    const userMsg = { role: "user", content: "📋 Weekly Check-In" };
    setMessages(prev => [...prev, userMsg, { role: "assistant", content: "" }]);
    setLoading(true);

    const historyForApi = messages.map(m => ({ role: m.role, content: m.content }));
    const fullMessages = [...historyForApi, { role: "user", content: prompt }];

    try {
      await callClaude(fullMessages, (partial) => {
        setMessages(msgs => msgs.map((m, i) => i === msgs.length - 1 ? { ...m, content: partial } : m));
      });
      const now = new Date().toISOString();
      setLastCheckIn(now);
      saveData("lastCheckIn", now);
    } catch (e) {
      setMessages(msgs => msgs.map((m, i) => i === msgs.length - 1 ? { ...m, content: "Error connecting. Check your connection and try again." } : m));
    }
    setLoading(false);
    setCheckInRunning(false);
  };

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages([...newMessages, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);

    const context = buildContext();
    const historyForApi = messages.map(m => ({ role: m.role, content: m.content }));
    // Always inject full context into first user message so coach retains athlete profile
    const fullMessages = historyForApi.length === 0
      ? [{ role: "user", content: `${context}\n\n---\n${text}` }]
      : [
          { role: "user", content: `${context}\n\n---\n${historyForApi[0].content}` },
          ...historyForApi.slice(1),
          { role: "user", content: text },
        ];

    try {
      await callClaude(fullMessages, (partial) => {
        setMessages(msgs => msgs.map((m, i) => i === msgs.length - 1 ? { ...m, content: partial } : m));
      });
    } catch (e) {
      setMessages(msgs => msgs.map((m, i) => i === msgs.length - 1 ? { ...m, content: "Error connecting to AI. Check your connection." } : m));
    }
    setLoading(false);
  };

  const PHASE_PROMPTS = {
    cut: [
      "Assess my cut — deficit, protein, rate of loss",
      "Am I losing too fast? Check my muscle retention",
      "Is my protein high enough for this deficit?",
      "How's my strength holding up on the cut?",
      "Volume check — am I recovering on these calories?",
    ],
    build: [
      "Assess my build phase — surplus, volume, overload",
      "Am I gaining too fast or too slow?",
      "Which lifts need more attention for size?",
      "Is my volume appropriate for a build?",
      "Nutrition check — am I eating enough to grow?",
    ],
    recovery: [
      recoveryContext?.reason === "injury" && recoveryContext?.injuryDetail ? `How's my ${recoveryContext.injuryDetail} recovery looking?` : "How's my recovery looking from the data?",
      "Is my volume appropriate for recovery phase?",
      "When should I consider moving to maintenance?",
      "Any red flags in my recent sessions?",
      "How's my consistency looking?",
    ],
    maintenance: [
      "Ready to start my cut? Assess my current state",
      "How's my volume and strength baseline looking?",
      "Am I in a good position to start cutting?",
      "Any muscle groups lagging I should address first?",
      "How's my overall progress looking?",
    ],
  };
  const prompts = PHASE_PROMPTS[phase] || PHASE_PROMPTS.maintenance;

  return (
    <div className="page">

      {/* WEEKLY CHECK-IN CARD */}
      <div className="card" style={{ borderColor: checkInDue ? "var(--accent)" : "var(--border)", background: checkInDue ? "#050f00" : "var(--surface)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div className="card-title" style={{ marginBottom: 4, color: checkInDue ? "var(--accent)" : "var(--text2)" }}>
              {checkInDue ? "📋 Weekly Check-In Due" : "📋 Weekly Check-In"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.5 }}>
              {daysSinceCheckIn === null
                ? "No check-in logged yet. Get your first full assessment."
                : checkInDue
                  ? `Last check-in ${daysSinceCheckIn} days ago — time for a new assessment.`
                  : `Last check-in ${daysSinceCheckIn} day${daysSinceCheckIn === 1 ? "" : "s"} ago — next due in ${7 - daysSinceCheckIn} day${7 - daysSinceCheckIn === 1 ? "" : "s"}.`
              }
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={runWeeklyCheckIn}
              disabled={loading}
              style={{ background: checkInDue ? "var(--accent)" : "var(--surface3)", color: checkInDue ? "#000" : "var(--text2)", borderColor: checkInDue ? "var(--accent)" : "var(--border)", minWidth: 120 }}
            >
              {loading && checkInRunning ? "Assessing..." : "Run Check-In"}
            </button>
            {!checkInDue && (
              <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }} onClick={runWeeklyCheckIn} disabled={loading}>
                Run anyway
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>Quick Prompts</div>
          <span style={{
            fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 700, letterSpacing: 1,
            textTransform: "uppercase", padding: "2px 8px", borderRadius: 3,
            color: PHASES.find(p => p.id === phase)?.color || "var(--text2)",
            border: `1px solid ${PHASES.find(p => p.id === phase)?.color || "var(--border)"}`,
            background: "var(--surface3)",
          }}>{phase} coaching</span>
        </div>
        <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 10 }}>Your coach has access to all your session history, volume data, body composition, and current phase.</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 0 }}>
          {prompts.map(p => (
            <button key={p} className="btn btn-secondary btn-sm" onClick={() => sendMessage(p)} disabled={loading}>{p}</button>
          ))}
        </div>
      </div>

      <div className="card">
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text3)", fontSize: 13 }}>
            No conversation yet. Run a check-in or tap a prompt above.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className="ai-box" style={{ borderLeftColor: m.role === "user" ? "var(--accent2)" : "var(--accent)", marginBottom: 10 }}>
            <div className="ai-label">{m.role === "user" ? "You" : "Coach"}</div>
            <div className="ai-text">
              {m.content
                ? m.content
                : loading && i === messages.length - 1
                  ? <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="loading-dots"><span /><span /><span /></div>
                      <span style={{ fontSize: 12, color: "var(--text3)" }}>Thinking...</span>
                    </div>
                  : ""}
            </div>
          </div>
        ))}
        <div className="ai-input-row">
          <input
            className="inp"
            placeholder="Ask your coach..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage(input)}
            disabled={loading}
          />
          <button className="btn btn-primary" onClick={() => sendMessage(input)} disabled={loading || !input.trim()}>Ask</button>
        </div>
      </div>

    </div>
  );
}

// ── Settings ──────────────────────────────────────────────────────────────────


function BuilderExerciseRow({ ex, idx, onRemove, onUpdate }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{ex.name}</div>
        <input
          className="inp" style={{ marginTop: 4, fontSize: 11, padding: "3px 6px" }}
          placeholder="Rep range e.g. 8-12"
          value={ex.repRange || ""}
          onChange={e => onUpdate(idx, "repRange", e.target.value)}
        />
      </div>
      <button className="btn-rm" onClick={() => onRemove(idx)}>x</button>
    </div>
  );
}

function BuilderDayCard({ day, dayIdx, totalDays, onNameChange, onAddExercise, onRemoveExercise, onUpdateExercise, onRemoveDay, onMove }) {
  const [showPicker, setShowPicker] = useState(false);
  const [customName, setCustomName] = useState("");
  const isRest = day.name === "Rest";

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 6, padding: 12, background: "var(--surface)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <input
          className="inp" style={{ flex: 1, fontWeight: 600 }}
          placeholder="Day name e.g. Back & Rear Delts"
          value={day.name}
          onChange={e => onNameChange(dayIdx, e.target.value)}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <button className="btn-move" disabled={dayIdx === 0} onClick={() => onMove(dayIdx, -1)}>▲</button>
          <button className="btn-move" disabled={dayIdx === totalDays - 1} onClick={() => onMove(dayIdx, 1)}>▼</button>
        </div>
        <button className="btn-rm" onClick={() => onRemoveDay(dayIdx)}>x</button>
      </div>

      {!isRest && (
        <div style={{ marginBottom: 8 }}>
          {day.exercises.map((ex, ei) => (
            <BuilderExerciseRow
              key={ei} ex={ex} idx={ei}
              onRemove={idx => onRemoveExercise(dayIdx, idx)}
              onUpdate={(idx, field, val) => onUpdateExercise(dayIdx, idx, field, val)}
            />
          ))}
        </div>
      )}

      {!isRest && !showPicker && (
        <button
          className="btn btn-secondary btn-sm"
          style={{ fontSize: 11, marginTop: 4 }}
          onClick={() => setShowPicker(true)}
        >+ Add Exercise</button>
      )}

      {!isRest && showPicker && (
        <div style={{ marginTop: 8, background: "var(--surface2)", borderRadius: 5, padding: 10 }}>
          <BuilderExercisePicker
            onSelect={ex => { onAddExercise(dayIdx, ex); setShowPicker(false); setCustomName(""); }}
            onClose={() => setShowPicker(false)}
          />
        </div>
      )}
    </div>
  );
}

function BuilderExercisePicker({ onSelect, onClose }) {
  const [search, setSearch] = useState("");
  const q = search.trim().toLowerCase();
  const filtered = q
    ? EXERCISE_LIBRARY.filter(e => e.name.toLowerCase().includes(q) || e.muscles.some(m => m.toLowerCase().includes(q)))
    : EXERCISE_LIBRARY.slice(0, 20);
  const isNew = q && !EXERCISE_LIBRARY.some(e => e.name.toLowerCase() === q);

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <input className="inp" style={{ flex: 1 }} placeholder="Search or type new..." value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
      </div>
      {isNew && (
        <div
          style={{ padding: "7px 10px", borderRadius: 5, background: "#050f00", border: "1px solid var(--accent)", marginBottom: 6, cursor: "pointer" }}
          onClick={() => onSelect({ name: search.trim(), muscles: ["chest"], repRange: "10-12", custom: true })}
        >
          <span style={{ fontSize: 10, fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--accent)", letterSpacing: 1 }}>+ ADD: </span>
          <span style={{ fontSize: 13, color: "var(--text)" }}>{search.trim()}</span>
        </div>
      )}
      <div style={{ maxHeight: 200, overflowY: "auto", display: "grid", gap: 2 }}>
        {filtered.map((ex, i) => (
          <div key={i} onClick={() => onSelect(ex)}
            style={{ padding: "6px 8px", borderRadius: 4, cursor: "pointer", background: "var(--surface)", fontSize: 13 }}>
            <span style={{ fontWeight: 600, color: "var(--text)" }}>{ex.name}</span>
            <span style={{ fontSize: 11, color: "var(--text3)", marginLeft: 6 }}>{ex.muscles.join(", ")} · {ex.repRange}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomSplitBuilder({ days, name, onNameChange, onDaysChange, customExercises, onSave, onCancel }) {
  const addDay = () => onDaysChange([...days, { name: "", exercises: [] }]);
  const addRestDay = () => onDaysChange([...days, { name: "Rest", exercises: [] }]);

  const removeDay = (idx) => onDaysChange(days.filter((d, i) => i !== idx));

  const moveDay = (idx, dir) => {
    const next = [...days];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onDaysChange(next);
  };

  const updateDayName = (idx, val) => {
    onDaysChange(days.map((d, i) => i !== idx ? d : { ...d, name: val }));
  };

  const addExercise = (dayIdx, ex) => {
    onDaysChange(days.map((d, i) => i !== dayIdx ? d : { ...d, exercises: [...d.exercises, { name: ex.name, repRange: ex.repRange || "10-12", muscles: ex.muscles || [] }] }));
  };

  const removeExercise = (dayIdx, exIdx) => {
    onDaysChange(days.map((d, i) => i !== dayIdx ? d : { ...d, exercises: d.exercises.filter((e, j) => j !== exIdx) }));
  };

  const updateExercise = (dayIdx, exIdx, field, val) => {
    onDaysChange(days.map((d, i) => i !== dayIdx ? d : {
      ...d,
      exercises: d.exercises.map((e, j) => j !== exIdx ? e : { ...e, [field]: val })
    }));
  };

  const canSave = name.trim() && days.length > 0 && days.some(d => d.name.trim() && d.name !== "Rest");

  const handleSave = () => {
    const split = {
      name: name.trim(),
      source: "custom",
      days: days.filter(d => d.name.trim()).map(d => ({
        label: d.name.trim(),
        note: d.name === "Rest" ? "Rest day" : "",
        exercises: d.exercises.map(e => ({
          name: e.name,
          repRange: e.repRange || "10-12",
          muscles: e.muscles || [],
          sets: 3,
          priority: false,
        })),
      })),
    };
    onSave(split);
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.6 }}>
        Define your split day by day. Each day gets a name and a list of exercises. Add a Rest day wherever it falls in your rotation.
      </div>

      <div>
        <div className="macro-lbl" style={{ marginBottom: 6 }}>Program Name</div>
        <input className="inp" placeholder="e.g. Modified PPL — 4 Day Rotation" value={name} onChange={e => onNameChange(e.target.value)} />
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {days.map((day, idx) => (
          <BuilderDayCard
            key={idx}
            day={day} dayIdx={idx} totalDays={days.length}
            onNameChange={updateDayName}
            onAddExercise={addExercise}
            onRemoveExercise={removeExercise}
            onUpdateExercise={updateExercise}
            onRemoveDay={removeDay}
            onMove={moveDay}
          />
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="btn btn-secondary btn-sm" onClick={addDay}>+ Training Day</button>
        <button className="btn btn-secondary btn-sm" onClick={addRestDay} style={{ color: "var(--text3)" }}>+ Rest Day</button>
      </div>

      <div className="btn-row">
        <button className="btn btn-primary" disabled={!canSave} onClick={handleSave}>Save Program</button>
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function SplitDayRow({ day, index, total, onMove }) {
  const isRest = day === "Rest";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: isRest ? "var(--text3)" : "var(--text)" }}>{day}</div>
        <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--font-display)", letterSpacing: 1, textTransform: "uppercase", marginTop: 1 }}>Day {index + 1}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <button className="btn-move" disabled={index === 0} onClick={() => onMove(index, -1)}>▲</button>
        <button className="btn-move" disabled={index === total - 1} onClick={() => onMove(index, 1)}>▼</button>
      </div>
    </div>
  );
}

function Settings({ phase, onPhaseChange, workouts, onSwitchProgram, archivedPrograms, recoveryContext, onRecoveryContext, phaseGoals, onPhaseGoals, customExercises, onDeleteCustomExercise, splitOrder, onSplitOrder, activeCoachSplit }) {
  const [switchStep, setSwitchStep] = useState(null);
  const [builderDays, setBuilderDays] = useState([]);
  const [builderName, setBuilderName] = useState("");
  const [builderPickerDay, setBuilderPickerDay] = useState(null); // index of day being edited
  // null | "result" | "deload_offer" | "coach_generating" | "coach_review" | "name_new"
  const [analysis, setAnalysis] = useState(null);
  const [newProgramName, setNewProgramName] = useState("");
  const [coachSplit, setCoachSplit] = useState(null);
  const [coachError, setCoachError] = useState(null);

  const [editingGoals, setEditingGoals] = useState(false);
  const [goalDraft, setGoalDraft] = useState({});

  const openGoals = () => {
    setGoalDraft(phaseGoals[phase] || {});
    setEditingGoals(true);
  };
  const saveGoals = () => {
    onPhaseGoals({ ...phaseGoals, [phase]: goalDraft });
    setEditingGoals(false);
  };
  const clearGoals = () => {
    const updated = { ...phaseGoals };
    delete updated[phase];
    onPhaseGoals(updated);
    setEditingGoals(false);
  };
  const currentGoal = phaseGoals[phase];

  const MUSCLES = ["chest","back","quads","hamstrings","glutes","side_delts","front_delts","rear_delts","biceps","triceps","calves"];

  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [rcReason, setRcReason] = useState("");
  const [rcDetail, setRcDetail] = useState("");

  const handlePhaseClick = (pid) => {
    if (pid === "recovery" && phase !== "recovery") {
      setRcReason(""); setRcDetail("");
      setShowRecoveryModal(true);
    } else {
      if (pid !== "recovery") onRecoveryContext(null);
      onPhaseChange(pid);
    }
  };

  const confirmRecovery = () => {
    onRecoveryContext({
      active: true,
      reason: rcReason,
      injuryDetail: rcReason === "injury" ? rcDetail : "",
      startDate: new Date().toISOString().split("T")[0],
    });
    onPhaseChange("recovery");
    setShowRecoveryModal(false);
  };

  const startSwitch = () => {
    const result = analyzeProgramSwitch(workouts, phase);
    setAnalysis(result);
    setSwitchStep("result");
  };

  const requestCoachSplit = async () => {
    setSwitchStep("coach_generating");
    setCoachError(null);

    // Build rich context for the coach
    const vol7  = muscleVolume(workouts, 7);
    const vol14 = muscleVolume(workouts, 14);
    const vol28 = muscleVolume(workouts, 28);

    // Day-of-week consistency
    const dayCount = {};
    workouts.forEach(w => {
      const dow = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(w.date).getDay()];
      dayCount[dow] = (dayCount[dow] || 0) + 1;
    });

    // Lagging muscles — vol28 well below average
    const volVals = Object.values(vol28).filter(v => v > 0);
    const volAvg  = volVals.length ? volVals.reduce((s,v) => s+v, 0) / volVals.length : 0;
    const lagging = Object.entries(vol28).filter(([, v]) => v < volAvg * 0.6).map(([m]) => m);

    const prompt = `You are an expert bodybuilding coach. Based on this athlete's data, design a new weekly training split.

CURRENT PHASE: ${phase}
TRAINING DAYS/WEEK (from history): ${JSON.stringify(dayCount)}
MUSCLE VOLUME — LAST 7 DAYS: ${JSON.stringify(vol7)}
MUSCLE VOLUME — LAST 14 DAYS: ${JSON.stringify(vol14)}
MUSCLE VOLUME — LAST 28 DAYS: ${JSON.stringify(vol28)}
LAGGING MUSCLES (below average volume): ${lagging.join(", ") || "none identified"}
INJURY/CONSTRAINTS: Use the recovery context above if present, otherwise assume no active injuries.
GOAL: Classic physique — proportional, full muscle bellies, 80s/90s aesthetic. Priority: Back, Chest, Quads, Side Delts, Arms.
PHASE CONTEXT: ${phase === "cut" ? "Cutting — preserve muscle, moderate volume, avoid failure" : phase === "build" ? "Building — higher volume, progressive overload focus" : phase === "recovery" ? "Recovery — reduced intensity, joint-friendly exercise selection" : "Maintenance — balanced volume, consistency focus"}

Design a 5-6 day split that:
1. Trains each muscle 2x/week
2. Addresses the lagging muscles with extra volume
3. Respects any active injury constraints from the recovery context
4. Fits the athlete's actual training days based on history
5. Uses the exercise library style: compounds 8-12 reps, isolation 12-20 reps

Return ONLY valid JSON in this exact structure (no markdown, no explanation):
{
  "name": "Split Name (e.g. Push/Pull/Legs or Upper/Lower)",
  "rationale": "2-3 sentence explanation of why this split suits this athlete's data",
  "days": [
    {
      "label": "Push",
      "suggestedDay": "Monday",
      "focus": "Chest / Front & Side Delts / Triceps",
      "note": "Brief session intent note",
      "exercises": [
        {
          "name": "Incline Barbell Press",
          "muscles": ["chest", "front_delts", "triceps"],
          "repRange": "8-12",
          "sets": 4,
          "priority": true,
          "note": "Lead compound — control the eccentric"
        }
      ]
    }
  ]
}`;

    try {
      const result = await callClaudeJSON(prompt, "You are an expert bodybuilding coach. Return only valid JSON.");
      setCoachSplit(result);
      setSwitchStep("coach_review");
    } catch (e) {
      setCoachError("Failed to generate split — check connection and try again.");
      setSwitchStep("result");
    }
  };

  const acceptCoachSplit = () => {
    if (!coachSplit) return;
    const name = coachSplit.name || newProgramName || "Coach-Generated Split";
    onSwitchProgram(name, coachSplit);
    setSwitchStep(null);
    setAnalysis(null);
    setCoachSplit(null);
    setNewProgramName("");
  };

  const VERDICT_COLORS = {
    green:        { bg: "#0a1400", border: "var(--accent)",  text: "var(--accent)",  label: "PROGRAM WORKING" },
    yellow:       { bg: "#1a1400", border: "var(--accent2)", text: "var(--accent2)", label: "MIXED SIGNALS"    },
    red:          { bg: "#1a0000", border: "var(--red)",     text: "var(--red)",     label: "STAGNATION"       },
    insufficient: { bg: "#111",    border: "var(--border)",  text: "var(--text2)",   label: "NEED MORE DATA"   },
  };

  return (
    <div className="page">
      <div className="card">
        <div className="card-title">Training Phase</div>
        <div className="phase-grid">
          {PHASES.map(p => (
            <div key={p.id} className={`phase-option ${phase === p.id ? "selected" : ""}`} onClick={() => handlePhaseClick(p.id)}>
              <div className="phase-name" style={{ color: p.color }}>{p.label}</div>
              <div className="phase-desc">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>


      {/* PHASE GOALS CARD */}
      <div className="card" style={{ borderColor: editingGoals ? "var(--accent)" : currentGoal ? "var(--accent)" : "var(--border)", background: currentGoal && !editingGoals ? "#050f00" : "var(--surface)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: editingGoals || currentGoal ? 12 : 0 }}>
          <div className="card-title" style={{ marginBottom: 0, color: currentGoal ? "var(--accent)" : "var(--text2)" }}>
            {phase === "cut" ? "🎯 Cut Goal" : phase === "build" ? "🎯 Build Goal" : phase === "maintenance" ? "🎯 Maintenance Goal" : "🎯 Recovery Goal"}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {currentGoal && !editingGoals && <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }} onClick={openGoals}>Edit</button>}
            {!currentGoal && !editingGoals && <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }} onClick={openGoals}>Set Goal</button>}
            {editingGoals && <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }} onClick={() => setEditingGoals(false)}>Cancel</button>}
          </div>
        </div>

        {/* CURRENT GOAL DISPLAY */}
        {currentGoal && !editingGoals && (() => {
          const g = currentGoal;
          if (phase === "cut") return (
            <div style={{ display: "grid", gap: 6 }}>
              {g.mode === "rate" && <div style={{ fontSize: 13, color: "var(--text2)" }}>Target rate: <span style={{ color: "var(--accent)", fontWeight: 700 }}>{g.targetRate} lbs/week</span></div>}
              {g.mode === "deadline" && <>
                <div style={{ fontSize: 13, color: "var(--text2)" }}>Goal weight: <span style={{ color: "var(--accent)", fontWeight: 700 }}>{g.targetWeight} lbs</span></div>
                <div style={{ fontSize: 13, color: "var(--text2)" }}>Deadline: <span style={{ color: "var(--accent)", fontWeight: 700 }}>{g.deadline}</span></div>
              </>}
              {g.note && <div style={{ fontSize: 12, color: "var(--text3)", fontStyle: "italic" }}>{g.note}</div>}
              <button className="btn btn-secondary btn-sm" style={{ fontSize: 11, marginTop: 4, color: "var(--red)", borderColor: "var(--red)", alignSelf: "flex-start" }} onClick={clearGoals}>Clear Goal</button>
            </div>
          );
          if (phase === "build") return (
            <div style={{ display: "grid", gap: 6 }}>
              {g.mode === "overall" && <div style={{ fontSize: 13, color: "var(--text2)" }}>Mode: <span style={{ color: "var(--accent)", fontWeight: 700 }}>Overall growth</span></div>}
              {g.mode === "priority" && <div style={{ fontSize: 13, color: "var(--text2)" }}>Priority: <span style={{ color: "var(--accent)", fontWeight: 700 }}>{(g.muscles || []).map(m => m.replace("_", " ")).join(", ")}</span></div>}
              {g.mode === "strength" && <div style={{ fontSize: 13, color: "var(--text2)" }}>Strength goal: <span style={{ color: "var(--accent)", fontWeight: 700 }}>{g.lift} — {g.targetWeight}lbs × {g.targetReps} reps</span></div>}
              {g.note && <div style={{ fontSize: 12, color: "var(--text3)", fontStyle: "italic" }}>{g.note}</div>}
              <button className="btn btn-secondary btn-sm" style={{ fontSize: 11, marginTop: 4, color: "var(--red)", borderColor: "var(--red)", alignSelf: "flex-start" }} onClick={clearGoals}>Clear Goal</button>
            </div>
          );
          return <div style={{ fontSize: 13, color: "var(--text3)" }}>Goal set.</div>;
        })()}

        {/* GOAL EDITOR */}
        {editingGoals && (
          <div>
            {/* CUT GOALS */}
            {phase === "cut" && (
              <div style={{ display: "grid", gap: 14 }}>
                <div>
                  <div className="macro-lbl" style={{ marginBottom: 8 }}>Mode</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[{ id: "rate", label: "Rate of loss" }, { id: "deadline", label: "Deadline + target weight" }].map(m => (
                      <div key={m.id} onClick={() => setGoalDraft(d => ({ ...d, mode: m.id }))}
                        style={{ padding: "8px 14px", borderRadius: 5, cursor: "pointer", fontSize: 13,
                          border: `1px solid ${goalDraft.mode === m.id ? "var(--accent)" : "var(--border)"}`,
                          background: goalDraft.mode === m.id ? "#0a1400" : "var(--surface2)",
                          color: goalDraft.mode === m.id ? "var(--accent)" : "var(--text2)" }}>
                        {m.label}
                      </div>
                    ))}
                  </div>
                </div>

                {goalDraft.mode === "rate" && (
                  <div>
                    <div className="macro-lbl" style={{ marginBottom: 6 }}>Target rate of loss (lbs/week)</div>
                    <input className="inp inp-sm" style={{ width: 120 }} placeholder="e.g. 1.5"
                      value={goalDraft.targetRate || ""} onChange={e => setGoalDraft(d => ({ ...d, targetRate: e.target.value }))} />
                    <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>0.5–1% of bodyweight/week is the natural range. Above 1% risks muscle loss.</div>
                  </div>
                )}

                {goalDraft.mode === "deadline" && (
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div className="macro-lbl" style={{ marginBottom: 6 }}>Goal weight (lbs)</div>
                      <input className="inp inp-sm" style={{ width: 110 }} placeholder="e.g. 175"
                        value={goalDraft.targetWeight || ""} onChange={e => setGoalDraft(d => ({ ...d, targetWeight: e.target.value }))} />
                    </div>
                    <div>
                      <div className="macro-lbl" style={{ marginBottom: 6 }}>Deadline</div>
                      <input type="date" className="inp" style={{ width: 160 }}
                        value={goalDraft.deadline || ""} onChange={e => setGoalDraft(d => ({ ...d, deadline: e.target.value }))} />
                    </div>
                  </div>
                )}

                <div>
                  <div className="macro-lbl" style={{ marginBottom: 6 }}>Notes (optional)</div>
                  <input className="inp" placeholder="e.g. aggressive cut for summer, pool season deadline"
                    value={goalDraft.note || ""} onChange={e => setGoalDraft(d => ({ ...d, note: e.target.value }))} />
                </div>
              </div>
            )}

            {/* BUILD GOALS */}
            {phase === "build" && (
              <div style={{ display: "grid", gap: 14 }}>
                <div>
                  <div className="macro-lbl" style={{ marginBottom: 8 }}>Mode</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[{ id: "overall", label: "Overall growth" }, { id: "priority", label: "Priority muscle(s)" }, { id: "strength", label: "Strength goal" }].map(m => (
                      <div key={m.id} onClick={() => setGoalDraft(d => ({ ...d, mode: m.id, muscles: [], lift: "", targetWeight: "", targetReps: "" }))}
                        style={{ padding: "8px 14px", borderRadius: 5, cursor: "pointer", fontSize: 13,
                          border: `1px solid ${goalDraft.mode === m.id ? "var(--accent)" : "var(--border)"}`,
                          background: goalDraft.mode === m.id ? "#0a1400" : "var(--surface2)",
                          color: goalDraft.mode === m.id ? "var(--accent)" : "var(--text2)" }}>
                        {m.label}
                      </div>
                    ))}
                  </div>
                </div>

                {goalDraft.mode === "priority" && (
                  <div>
                    <div className="macro-lbl" style={{ marginBottom: 8 }}>Select priority muscles (up to 2)</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {MUSCLES.map(m => {
                        const selected = (goalDraft.muscles || []).includes(m);
                        const maxed = (goalDraft.muscles || []).length >= 2 && !selected;
                        return (
                          <div key={m} onClick={() => {
                            if (maxed) return;
                            setGoalDraft(d => ({
                              ...d,
                              muscles: selected ? d.muscles.filter(x => x !== m) : [...(d.muscles || []), m]
                            }));
                          }} style={{
                            padding: "5px 12px", borderRadius: 4, cursor: maxed ? "default" : "pointer", fontSize: 12,
                            border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                            background: selected ? "#0a1400" : "var(--surface2)",
                            color: selected ? "var(--accent)" : maxed ? "var(--text3)" : "var(--text2)",
                            textTransform: "capitalize",
                          }}>{m.replace("_", " ")}</div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {goalDraft.mode === "strength" && (
                  <div style={{ display: "grid", gap: 10 }}>
                    <div>
                      <div className="macro-lbl" style={{ marginBottom: 6 }}>Target lift</div>
                      <input className="inp" placeholder="e.g. Hack Squat, Incline DB Press"
                        value={goalDraft.lift || ""} onChange={e => setGoalDraft(d => ({ ...d, lift: e.target.value }))} />
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <div>
                        <div className="macro-lbl" style={{ marginBottom: 6 }}>Target weight (lbs)</div>
                        <input className="inp inp-sm" style={{ width: 110 }} placeholder="e.g. 315"
                          value={goalDraft.targetWeight || ""} onChange={e => setGoalDraft(d => ({ ...d, targetWeight: e.target.value }))} />
                      </div>
                      <div>
                        <div className="macro-lbl" style={{ marginBottom: 6 }}>Target reps</div>
                        <input className="inp inp-sm" style={{ width: 90 }} placeholder="e.g. 8"
                          value={goalDraft.targetReps || ""} onChange={e => setGoalDraft(d => ({ ...d, targetReps: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <div className="macro-lbl" style={{ marginBottom: 6 }}>Notes (optional)</div>
                  <input className="inp" placeholder="e.g. focus on back and arms this block"
                    value={goalDraft.note || ""} onChange={e => setGoalDraft(d => ({ ...d, note: e.target.value }))} />
                </div>
              </div>
            )}

            {/* MAINTENANCE / RECOVERY — simple note */}
            {(phase === "maintenance" || phase === "recovery") && (
              <div>
                <div className="macro-lbl" style={{ marginBottom: 6 }}>Goal note</div>
                <input className="inp" placeholder={phase === "maintenance" ? "e.g. establish baseline, nail consistency" : "e.g. full elbow recovery, no time pressure"}
                  value={goalDraft.note || ""} onChange={e => setGoalDraft(d => ({ ...d, note: e.target.value }))} />
              </div>
            )}

            <div className="btn-row" style={{ marginTop: 14 }}>
              <button className="btn btn-primary btn-sm"
                disabled={phase === "cut" ? !goalDraft.mode : phase === "build" ? !goalDraft.mode : false}
                onClick={saveGoals}>Save Goal</button>
              {currentGoal && <button className="btn btn-secondary btn-sm" style={{ color: "var(--red)", borderColor: "var(--red)" }} onClick={clearGoals}>Clear</button>}
            </div>
          </div>
        )}

        {!currentGoal && !editingGoals && (
          <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 8 }}>
            {phase === "cut" ? "Set a rate target or deadline to track your cut against a specific goal." : phase === "build" ? "Set a build focus — overall growth, a priority muscle, or a strength target." : "Optional — add a note for what this phase is working toward."}
          </div>
        )}
      </div>

      {/* SPLIT ORDER CARD */}
      {!activeCoachSplit && (() => {
        const order = splitOrder || SPLIT_ORDER;
        const moveDay = (idx, dir) => {
          const next = [...order];
          const target = idx + dir;
          if (target < 0 || target >= next.length) return;
          [next[idx], next[target]] = [next[target], next[idx]];
          onSplitOrder(next);
        };
        return (
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div className="card-title" style={{ marginBottom: 0 }}>Split Order</div>
              {splitOrder && (
                <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }} onClick={() => onSplitOrder(null)}>Reset</button>
              )}
            </div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10 }}>Drag the days into the order you train them. Reflected in the Log tab.</div>
            {order.map((day, idx) => (
              <SplitDayRow key={day} day={day} index={idx} total={order.length} onMove={moveDay} />
            ))}
          </div>
        );
      })()}

      {/* ACTIVE RECOVERY CONTEXT CARD */}
      {recoveryContext?.active && (
        <div className="card" style={{ borderColor: "var(--accent2)", background: "#1a0d00" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="card-title" style={{ marginBottom: 4, color: "var(--accent2)" }}>
                {RECOVERY_REASONS.find(r => r.id === recoveryContext.reason)?.icon || "⚡"} Recovery Mode Active
              </div>
              <div style={{ fontSize: 13, color: "var(--text2)" }}>
                {RECOVERY_REASONS.find(r => r.id === recoveryContext.reason)?.label || recoveryContext.reason}
                {recoveryContext.injuryDetail && <span style={{ color: "var(--accent2)", marginLeft: 6 }}>— {recoveryContext.injuryDetail}</span>}
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>Since {recoveryContext.startDate}</div>
            </div>
            <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }} onClick={() => onRecoveryContext(null)}>
              Clear
            </button>
          </div>
        </div>
      )}

      {/* RECOVERY CHECK-IN MODAL */}
      {showRecoveryModal && (
        <div className="card" style={{ borderColor: "var(--accent2)", background: "#1a0d00" }}>
          <div className="card-title" style={{ color: "var(--accent2)" }}>What's driving this recovery phase?</div>
          <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
            {RECOVERY_REASONS.map(r => (
              <div
                key={r.id}
                onClick={() => setRcReason(r.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 6, cursor: "pointer",
                  border: `1px solid ${rcReason === r.id ? "var(--accent2)" : "var(--border)"}`,
                  background: rcReason === r.id ? "#2d1a00" : "var(--surface2)",
                }}
              >
                <span style={{ fontSize: 18 }}>{r.icon}</span>
                <span style={{ fontSize: 13, color: rcReason === r.id ? "var(--accent2)" : "var(--text2)", fontWeight: rcReason === r.id ? 600 : 400 }}>{r.label}</span>
              </div>
            ))}
          </div>

          {rcReason === "injury" && (
            <div style={{ marginBottom: 16 }}>
              <div className="macro-lbl" style={{ marginBottom: 6 }}>What specifically? (used to flag exercises)</div>
              <input
                className="inp"
                placeholder="e.g. left elbow, right knee, lower back..."
                value={rcDetail}
                onChange={e => setRcDetail(e.target.value)}
              />
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>
                The app will auto-flag exercises that may aggravate this area.
              </div>
            </div>
          )}

          <div className="btn-row">
            <button
              className="btn btn-primary btn-sm"
              disabled={!rcReason}
              onClick={confirmRecovery}
            >Confirm Recovery Phase</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowRecoveryModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">Your Profile</div>
        <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.8 }}>
          <div><strong style={{ color: "var(--accent)", fontFamily: "var(--font-display)", letterSpacing: 1 }}>Goal:</strong> 80s/90s era classic physique — proportional, full muscle bellies</div>
          <div><strong style={{ color: "var(--accent)", fontFamily: "var(--font-display)", letterSpacing: 1 }}>Rep Range:</strong> 8-12 compounds · 12-20 isolation · 0-1 RIR</div>
          <div><strong style={{ color: "var(--accent)", fontFamily: "var(--font-display)", letterSpacing: 1 }}>Volume Target:</strong> 16-24 sets/muscle/week across both sessions</div>
          <div><strong style={{ color: "var(--accent)", fontFamily: "var(--font-display)", letterSpacing: 1 }}>Frequency:</strong> 2x/week per muscle group</div>
          <div><strong style={{ color: "var(--accent)", fontFamily: "var(--font-display)", letterSpacing: 1 }}>Priority:</strong> Back, Chest, Quads ★, Side Delts, Arms</div>
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
            <strong style={{ color: "var(--accent)", fontFamily: "var(--font-display)", letterSpacing: 1 }}>Split:</strong>
            <div style={{ marginTop: 4, display: "grid", gap: 3 }}>
              {[
                { day: "Mon", label: "Push", detail: "Chest / Front & Side Delts / Triceps" },
                { day: "Tue", label: "Pull", detail: "Back / Rear Delts / Biceps (modified)" },
                { day: "Wed", label: "Legs", detail: "Quads / Hamstrings / Calves" },
                { day: "Thu", label: "Rest", detail: "" },
                { day: "Fri", label: "Upper", detail: "Chest / Back / Delts / Arms" },
                { day: "Sat", label: "Lower", detail: "Quads / Hamstrings / Calves" },
                { day: "Sun", label: "Rest", detail: "" },
              ].map(({ day, label, detail }) => (
                <div key={day} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 700, color: "var(--text3)", width: 28, letterSpacing: 1 }}>{day}</span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: label === "Rest" ? "var(--text3)" : "var(--accent)" }}>{label}</span>
                  {detail && <span style={{ fontSize: 12, color: "var(--text3)" }}>{detail}</span>}
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 3, lineHeight: 1.6 }}>
              {recoveryContext?.active && recoveryContext.injuryDetail ? `⚠ Active issue: ${recoveryContext.injuryDetail}` : "No active injuries logged."}
            </div>
          </div>
          <div><strong style={{ color: "var(--accent)", fontFamily: "var(--font-display)", letterSpacing: 1 }}>Rest:</strong> 1.5-2 min between sets (flexible)</div>
        </div>
      </div>

      {/* SAVED EXERCISES */}
      {customExercises?.length > 0 && (
        <div className="card">
          <div className="card-title">My Exercise Library</div>
          <div style={{ display: "grid", gap: 6 }}>
            {customExercises.map((ex, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{ex.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>
                    {ex.muscles?.map(m => m.replace("_", " ")).join(", ")} · {ex.repRange}
                  </div>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 11, color: "var(--red)", borderColor: "var(--red)" }}
                  onClick={() => onDeleteCustomExercise(ex.name)}
                >Remove</button>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 8 }}>
            These appear in the exercise picker alongside the built-in library.
          </div>
        </div>
      )}

      {/* SWITCH PROGRAM */}
      <div className="card" style={{ borderColor: switchStep ? "var(--accent2)" : "var(--border)" }}>
        <div className="card-title">Program Management</div>

        {!switchStep && (
          <div>
            <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 12, lineHeight: 1.6 }}>
              Thinking about switching programs? The app will analyse your last 6 weeks of data first and give you an honest read before anything changes.
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn btn-secondary" onClick={startSwitch} style={{ borderColor: "var(--accent2)", color: "var(--accent2)" }}>
                ⚑ Request Program Switch
              </button>
              <button className="btn btn-secondary" onClick={() => { setBuilderDays([{ name: "", exercises: [] }]); setBuilderName(""); setSwitchStep("build"); }} style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
                ✎ Build My Own
              </button>
            </div>
          </div>
        )}

        {switchStep === "result" && analysis && (() => {
          const vc = { green: { bg: "#0a1400", border: "var(--accent)", text: "var(--accent)", label: "PROGRAM WORKING" }, yellow: { bg: "#1a1400", border: "var(--accent2)", text: "var(--accent2)", label: "MIXED SIGNALS" }, red: { bg: "#1a0000", border: "var(--red)", text: "var(--red)", label: "STAGNATION" }, insufficient: { bg: "#111", border: "var(--border)", text: "var(--text2)", label: "NEED MORE DATA" } };
          const c = vc[analysis.verdict] || vc.insufficient;
          return (
            <div>
              <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 6, padding: "12px 14px", marginBottom: 12 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 700, letterSpacing: 2, color: c.text, marginBottom: 6 }}>{c.label}</div>
                <div style={{ fontSize: 13, color: "var(--text)", marginBottom: 6, lineHeight: 1.6 }}>{analysis.summary}</div>
                <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5 }}>{analysis.reasoning}</div>
                <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: "var(--text3)" }}>📅 {analysis.sessions} sessions analysed</span>
                  <span style={{ fontSize: 11, color: "var(--text3)" }}>📊 {Math.round(analysis.sessionsPerWeek * 10) / 10} sessions/wk avg</span>
                  <span style={{ fontSize: 11, color: "var(--text3)" }}>💭 {Math.round((analysis.avgFeel || 0) * 10) / 10}/5 avg feel</span>
                </div>
              </div>

              {analysis.top3?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: 1, color: "var(--text3)", textTransform: "uppercase", marginBottom: 6 }}>Top Progressing Lifts</div>
                  {analysis.top3.map((t, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ fontSize: 13, color: "var(--text)" }}>{t.name}</span>
                      <span style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--font-display)", fontWeight: 700 }}>
                        {t.weightDelta > 0 ? `+${Math.round(t.weightDelta)}lbs` : ""}{t.repDelta >= 1 ? ` +${Math.round(t.repDelta)} reps` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="btn-row" style={{ flexWrap: "wrap" }}>
                <button className="btn btn-primary btn-sm" onClick={requestCoachSplit}>
                  ✦ Get Coach Recommendation
                </button>
                {(analysis.verdict === "green" || analysis.verdict === "yellow") && (
                  <button className="btn btn-secondary btn-sm" style={{ borderColor: "var(--accent2)", color: "var(--accent2)" }} onClick={() => setSwitchStep("deload_offer")}>
                    Still want to switch
                  </button>
                )}
                {(analysis.verdict === "red" || analysis.verdict === "insufficient") && (
                  <button className="btn btn-secondary btn-sm" style={{ borderColor: "var(--red)", color: "var(--red)" }} onClick={() => setSwitchStep("name_new")}>
                    Switch manually
                  </button>
                )}
                <button className="btn btn-secondary btn-sm" onClick={() => { setSwitchStep(null); setAnalysis(null); }}>Cancel</button>
              </div>
            </div>
          );
        })()}

        {switchStep === "deload_offer" && analysis && (
          <div>
            <div style={{ background: "#0a0f00", border: "1px solid var(--accent)", borderRadius: 6, padding: "12px 14px", marginBottom: 12 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "var(--accent)", marginBottom: 6 }}>BEFORE YOU GO</div>
              {analysis.top3?.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 8 }}>These lifts are still moving — you'd be walking away from:</div>
                  {analysis.top3.map((t, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ fontSize: 13, color: "var(--text)" }}>{t.name}</span>
                      <span style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--font-display)", fontWeight: 700 }}>
                        {t.weightDelta > 0 ? `+${Math.round(t.weightDelta)}lbs` : ""}{t.repDelta >= 1 ? ` +${Math.round(t.repDelta)} reps` : ""} over 6 weeks
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
                A deload week (60-70% loads, same structure) often breaks a mental rut without losing the program momentum you've built.
              </div>
            </div>
            <div className="btn-row" style={{ flexWrap: "wrap" }}>
              <button className="btn btn-primary btn-sm" onClick={() => { setSwitchStep(null); setAnalysis(null); onPhaseChange("recovery"); }}>
                Take a deload week
              </button>
              <button className="btn btn-secondary btn-sm" style={{ borderColor: "var(--accent)", color: "var(--accent)" }} onClick={requestCoachSplit}>
                ✦ Get coach recommendation
              </button>
              <button className="btn btn-secondary btn-sm" style={{ borderColor: "var(--red)", color: "var(--red)" }} onClick={() => setSwitchStep("name_new")}>
                Switch manually
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => { setSwitchStep(null); setAnalysis(null); }}>Cancel</button>
            </div>
          </div>
        )}

        {switchStep === "coach_generating" && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div className="loading-dots" style={{ justifyContent: "center", marginBottom: 12 }}><span /><span /><span /></div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, letterSpacing: 2, color: "var(--accent)", textTransform: "uppercase" }}>Analysing your data...</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 6 }}>Reviewing volume, lagging muscles, consistency, and any active injury constraints</div>
          </div>
        )}

        {switchStep === "build" && (
          <CustomSplitBuilder
            days={builderDays}
            name={builderName}
            onNameChange={setBuilderName}
            onDaysChange={setBuilderDays}
            customExercises={customExercises}
            onSave={(split) => {
              onSwitchProgram(split.name, split);
              setSwitchStep(null);
              setBuilderDays([]);
              setBuilderName("");
            }}
            onCancel={() => setSwitchStep(null)}
          />
        )}

        {switchStep === "coach_review" && coachSplit && (
          <div>
            <div style={{ background: "#050f00", border: "1px solid var(--accent)", borderRadius: 6, padding: "12px 14px", marginBottom: 14 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, letterSpacing: 2, color: "var(--accent)", marginBottom: 6 }}>✦ COACH RECOMMENDATION: {coachSplit.name}</div>
              <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>{coachSplit.rationale}</div>
            </div>

            {(coachSplit.days || []).map((day, di) => (
              <div key={di} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6, padding: "10px 12px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <div>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 900, color: "var(--accent)", letterSpacing: 1, textTransform: "uppercase", marginRight: 8 }}>{day.label}</span>
                    <span style={{ fontSize: 11, color: "var(--text3)" }}>{day.focus}</span>
                  </div>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-display)", color: "var(--text3)", letterSpacing: 1 }}>{day.suggestedDay}</span>
                </div>
                {day.note && <div style={{ fontSize: 11, color: "var(--accent2)", marginBottom: 8, fontStyle: "italic" }}>{day.note}</div>}
                <div style={{ display: "grid", gap: 4 }}>
                  {(day.exercises || []).map((ex, ei) => (
                    <div key={ei} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13, color: "var(--text)" }}>{ex.name}</span>
                        {ex.priority && <span style={{ fontSize: 10, fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: 1, color: "#f5a742", background: "#2d1a00", padding: "1px 5px", borderRadius: 3 }}>PRIORITY</span>}
                      </div>
                      <span style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-display)", whiteSpace: "nowrap" }}>{ex.sets}×{ex.repRange}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 12 }}>
              Accepting this will archive your current program and load this split as the new active program.
            </div>
            <div className="btn-row">
              <button className="btn btn-primary btn-sm" onClick={acceptCoachSplit}>Accept & Load Program</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setSwitchStep("name_new")}>Switch manually instead</button>
              <button className="btn btn-secondary btn-sm" onClick={() => { setSwitchStep(null); setAnalysis(null); setCoachSplit(null); }}>Cancel</button>
            </div>
          </div>
        )}

        {switchStep === "name_new" && (
          <div>
            <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 12, lineHeight: 1.6 }}>
              Your current program will be archived with all its history intact. Give the new program a name to begin.
            </div>
            <input
              className="inp"
              placeholder="New program name (e.g. Upper/Lower, Full Body, PPL v2)"
              value={newProgramName}
              onChange={e => setNewProgramName(e.target.value)}
              style={{ marginBottom: 12, fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: 1 }}
            />
            <div className="btn-row">
              <button
                className="btn btn-primary btn-sm"
                disabled={!newProgramName.trim()}
                onClick={() => { onSwitchProgram(newProgramName.trim()); setSwitchStep(null); setAnalysis(null); setNewProgramName(""); }}
              >
                Archive & Start New
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => { setSwitchStep(null); setAnalysis(null); }}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* ARCHIVED PROGRAMS */}
      {archivedPrograms?.length > 0 && (
        <div className="card">
          <div className="card-title">Past Programs</div>
          {archivedPrograms.map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "var(--text3)" }}>{fmtDate(p.startDate)} — {fmtDate(p.endDate)} · {p.sessionCount} sessions</div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

// ── App Shell ─────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [workouts, setWorkouts] = useState([]);
  const [phase, setPhase] = useState("recovery");
  const [archivedPrograms, setArchivedPrograms] = useState([]);
  const [bodyEntries, setBodyEntries] = useState([]);
  const [activeCoachSplit, setActiveCoachSplit] = useState(null);
  const [recoveryContext, setRecoveryContext] = useState(null);
  const [phaseGoals, setPhaseGoals] = useState({});
  const [customExercises, setCustomExercises] = useState([]);
  const [splitOrder, setSplitOrder] = useState(null); // null = use default
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const w = loadData("workouts", []);
    const p = loadData("phase", "recovery");
    const a = loadData("archivedPrograms", []);
    const b = loadData("bodyEntries", []);
    const cs = loadData("activeCoachSplit", null);
    const rc = loadData("recoveryContext", null);
    const pg = loadData("phaseGoals", {});
    const ce = loadData("customExercises", []);
    const so = loadData("splitOrder", null);
    setWorkouts(w);
    setPhase(p);
    setArchivedPrograms(a);
    setBodyEntries(b);
    setActiveCoachSplit(cs);
    setRecoveryContext(rc);
    setPhaseGoals(pg);
    setCustomExercises(ce);
    setSplitOrder(so);
    setLoaded(true);
  }, []);

  const handlePhaseChange = (p) => {
    setPhase(p);
    saveData("phase", p);
  };

  const handleDelete = (id) => {
    const updated = workouts.filter(w => w.id !== id);
    setWorkouts(updated);
    saveData("workouts", updated);
  };

  const handleUpdate = (updatedWorkout) => {
    const updated = workouts.map(w => w.id === updatedWorkout.id ? updatedWorkout : w);
    setWorkouts(updated);
    saveData("workouts", updated);
  };

  const handleBodyEntry = (entries) => {
    // Accept single entry or array — upsert all atomically against same base state
    const list = Array.isArray(entries) ? entries : [entries];
    let updated = [...bodyEntries];
    list.forEach(entry => {
      const idx = updated.findIndex(e => e.date === entry.date);
      if (idx >= 0) {
        updated[idx] = { ...updated[idx], ...entry };
      } else {
        updated = [...updated, entry];
      }
    });
    updated.sort((a, b) => a.date.localeCompare(b.date));
    setBodyEntries(updated);
    saveData("bodyEntries", updated);
  };

  const handleSplitOrder = (order) => {
    setSplitOrder(order);
    saveData("splitOrder", order);
  };

  const handleSaveCustomExercise = (ex) => {
    // Upsert by name — no duplicates
    const exists = customExercises.some(e => e.name.toLowerCase() === ex.name.toLowerCase());
    if (exists) return;
    const updated = [...customExercises, { ...ex, custom: true, savedAt: Date.now() }];
    setCustomExercises(updated);
    saveData("customExercises", updated);
  };

  const handleDeleteCustomExercise = (name) => {
    const updated = customExercises.filter(e => e.name !== name);
    setCustomExercises(updated);
    saveData("customExercises", updated);
  };

  const handlePhaseGoals = (goals) => {
    setPhaseGoals(goals);
    saveData("phaseGoals", goals);
  };

  const handleRecoveryContext = (ctx) => {
    setRecoveryContext(ctx);
    saveData("recoveryContext", ctx);
  };

  const handleSwitchProgram = (newName, coachSplit = null) => {
    // Archive the current program
    const sorted = [...workouts].sort((a, b) => a.date.localeCompare(b.date));
    const archive = {
      name: loadData("currentProgramName", "P/P/L · Upper/Lower"),
      startDate: sorted[0]?.date || new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      sessionCount: workouts.length,
      archivedAt: Date.now(),
    };
    const updatedArchive = [...archivedPrograms, archive];
    setArchivedPrograms(updatedArchive);
    saveData("archivedPrograms", updatedArchive);
    saveData("currentProgramName", newName);

    // If coach generated a split, store it so the app can use it
    if (coachSplit) {
      setActiveCoachSplit(coachSplit);
      saveData("activeCoachSplit", coachSplit);
    }
  };

  if (!loaded) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0a0a0a" }}>
      <div className="loading-dots"><span /><span /><span /></div>
    </div>
  );

  const currentPhase = PHASES.find(p => p.id === phase);

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <nav className="nav">
          <div className="nav-brand">IRON LOG</div>
          <div className="nav-tabs">
            {[
              { id: "dashboard", label: "Dashboard" },
              { id: "log", label: "Log" },
              { id: "history", label: "History" },
              { id: "body", label: "Body" },
              { id: "coach", label: "Coach" },
              { id: "settings", label: "Settings" },
            ].map(t => (
              <button key={t.id} className={`nav-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>{t.label}</button>
            ))}
          </div>
          <div className="phase-badge" style={{ borderColor: currentPhase?.color, color: currentPhase?.color }}>{currentPhase?.label}</div>
        </nav>
        {tab === "dashboard" && <Dashboard workouts={workouts} phase={phase} onNavigate={setTab} />}
        {tab === "log" && <LogWorkout workouts={workouts} onSave={setWorkouts} phase={phase} activeCoachSplit={activeCoachSplit} recoveryContext={recoveryContext} customExercises={customExercises} onSaveCustomExercise={handleSaveCustomExercise} splitOrder={splitOrder} />}
        {tab === "history" && <History workouts={workouts} onDelete={handleDelete} onUpdate={handleUpdate} />}
        {tab === "body" && <BodyTracker bodyEntries={bodyEntries} onSave={handleBodyEntry} phase={phase} workouts={workouts} phaseGoals={phaseGoals} />}
        {tab === "coach" && <AICoach workouts={workouts} phase={phase} bodyEntries={bodyEntries} recoveryContext={recoveryContext} phaseGoals={phaseGoals} />}
        {tab === "settings" && <Settings phase={phase} onPhaseChange={handlePhaseChange} workouts={workouts} onSwitchProgram={handleSwitchProgram} archivedPrograms={archivedPrograms} recoveryContext={recoveryContext} onRecoveryContext={handleRecoveryContext} phaseGoals={phaseGoals} onPhaseGoals={handlePhaseGoals} customExercises={customExercises} onDeleteCustomExercise={handleDeleteCustomExercise} splitOrder={splitOrder} onSplitOrder={handleSplitOrder} activeCoachSplit={activeCoachSplit} />}
      </div>
    </>
  );
}