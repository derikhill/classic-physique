export type MuscleKey =
  | 'back' | 'chest' | 'quads' | 'side_delts' | 'rear_delts' | 'front_delts'
  | 'biceps' | 'triceps' | 'hamstrings' | 'glutes' | 'calves'

export type PhaseId = 'recovery' | 'maintenance' | 'cut' | 'build'

export interface ExerciseTemplate {
  name: string
  muscles: MuscleKey[]
  repRange: string
  note?: string
  priority?: boolean
  elbowSafe?: boolean
  elbowModified?: boolean
  custom?: boolean
  sets?: number
}

export interface SplitDay {
  muscles: MuscleKey[]
  note?: string
  exercises: ExerciseTemplate[]
}

export const SPLIT: Record<string, SplitDay> = {
  'Push — Chest / Front & Side Delts / Triceps': {
    muscles: ['chest', 'front_delts', 'side_delts', 'triceps'],
    note: 'Mon · Fri upper carries the second chest/delt hit',
    exercises: [
      { name: 'Incline DB Press', muscles: ['chest', 'front_delts'], repRange: '10-12', note: 'Primary chest builder — upper chest emphasis', priority: true, elbowSafe: true },
      { name: 'Flat DB Press', muscles: ['chest'], repRange: '10-12', note: 'Full pec thickness', priority: true, elbowSafe: true },
      { name: 'Cable Chest Fly (Mid)', muscles: ['chest'], repRange: '12-15', note: 'Mid-cable — safe on elbows, great squeeze', elbowSafe: true },
      { name: 'DB Lateral Raise', muscles: ['side_delts'], repRange: '15-20', note: 'Control the negative, no swinging', priority: true },
      { name: 'Cable Lateral Raise', muscles: ['side_delts'], repRange: '15-20', note: 'Constant tension — better than DBs for some', priority: true, elbowSafe: true },
      { name: 'Cable Tricep Pushdown (Rope)', muscles: ['triceps'], repRange: '12-15', note: 'Flare hands at bottom for full contraction', elbowSafe: true },
      { name: 'Overhead Cable Tricep Extension', muscles: ['triceps'], repRange: '12-15', note: 'Long head stretch — monitor elbow comfort', elbowSafe: true },
    ],
  },
  'Pull — Back / Rear Delts / Biceps (Modified)': {
    muscles: ['back', 'rear_delts', 'biceps'],
    note: 'Tue · Back, rear delts, and arms.',
    exercises: [
      { name: 'Neutral Grip Cable Pulldown', muscles: ['back'], repRange: '10-12', note: 'Neutral grip — elbow safe, great lat stretch', priority: true, elbowSafe: true },
      { name: 'Seated Cable Row (Neutral Grip)', muscles: ['back'], repRange: '10-12', note: 'Elbows in, full stretch, slow negative', priority: true, elbowSafe: true },
      { name: 'Single-Arm DB Row', muscles: ['back'], repRange: '10-15', note: 'Full ROM — let the lat stretch at bottom', priority: true, elbowSafe: true },
      { name: 'Straight-Arm Cable Pulldown', muscles: ['back'], repRange: '12-15', note: 'Lat isolator — keep arms straight throughout', elbowSafe: true },
      { name: 'Cable Rear Delt Fly', muscles: ['rear_delts'], repRange: '15-20', note: 'High rep, squeeze at full extension', elbowSafe: true },
      { name: 'Rope Face Pull', muscles: ['rear_delts'], repRange: '15-20', note: 'Pull to forehead, elbows high', elbowSafe: true },
      { name: 'Incline DB Curl', muscles: ['biceps'], repRange: '10-12', note: '⚠ Elbow recovery: 2-3 sets only. Best stretch position.', elbowSafe: true, elbowModified: true },
      { name: 'Underhand Cable Curl', muscles: ['biceps'], repRange: '12-15', note: '⚠ Elbow recovery: 2-3 sets only. Supinated grip is safest.', elbowSafe: true, elbowModified: true },
    ],
  },
  'Legs — Quads / Hamstrings / Calves': {
    muscles: ['quads', 'hamstrings', 'glutes', 'calves'],
    note: 'Wed · Quad priority — extra volume. Full lower body session.',
    exercises: [
      { name: 'Leg Extension', muscles: ['quads'], repRange: '12-15', note: 'Start here — pre-exhaust and knee warm-up', priority: true, elbowSafe: true },
      { name: 'Hack Squat', muscles: ['quads', 'glutes'], repRange: '10-12', note: 'Feet shoulder-width, full depth for quad sweep', priority: true, elbowSafe: true },
      { name: 'Leg Press', muscles: ['quads', 'glutes'], repRange: '10-15', note: 'High foot placement = glutes. Low = quads.', priority: true, elbowSafe: true },
      { name: 'Romanian Deadlift', muscles: ['hamstrings', 'glutes'], repRange: '10-12', note: "Feel the stretch — don't round the back", elbowSafe: true },
      { name: 'Lying Leg Curl', muscles: ['hamstrings'], repRange: '12-15', note: 'Plantarflex foot for more bicep femoris', elbowSafe: true },
      { name: 'Standing Calf Raise', muscles: ['calves'], repRange: '12-20', note: "Full stretch at bottom — don't bounce", elbowSafe: true },
      { name: 'Seated Calf Raise', muscles: ['calves'], repRange: '15-20', note: 'Hits soleus — essential for calf thickness', elbowSafe: true },
    ],
  },
  'Upper — Chest / Back / Delts / Arms': {
    muscles: ['chest', 'back', 'side_delts', 'rear_delts', 'biceps', 'triceps'],
    note: 'Fri · Second hit for everything upper. Keep intensity honest — this is frequency work.',
    exercises: [
      { name: 'Pec Deck / Machine Fly', muscles: ['chest'], repRange: '12-15', note: 'Full stretch — great second chest hit', elbowSafe: true },
      { name: 'Cable Chest Fly (High to Low)', muscles: ['chest'], repRange: '12-15', note: 'Lower chest emphasis — variety from Push day', elbowSafe: true },
      { name: 'Chest-Supported DB Row', muscles: ['back'], repRange: '10-12', note: 'Takes lower back out — pure lat and mid-back', elbowSafe: true },
      { name: 'Underhand Cable Pulldown', muscles: ['back'], repRange: '10-12', note: 'Supinated grip — safe, strong bicep involvement', elbowSafe: true },
      { name: 'Machine Lateral Raise', muscles: ['side_delts'], repRange: '15-20', note: 'Constant tension — good pump day option', elbowSafe: true },
      { name: 'Rear Delt Machine Fly', muscles: ['rear_delts'], repRange: '15-20', note: 'Second rear delt hit for the week', elbowSafe: true },
      { name: 'High Cable Curl', muscles: ['biceps'], repRange: '12-15', note: '⚠ Elbow recovery: 2-3 sets max. Peak contraction focus.', elbowSafe: true, elbowModified: true },
      { name: 'Cable Tricep Pushdown (Bar)', muscles: ['triceps'], repRange: '12-15', note: 'Second tricep hit — different feel from rope', elbowSafe: true },
      { name: 'Machine Tricep Extension', muscles: ['triceps'], repRange: '12-15', note: 'Isolate without joint stress', elbowSafe: true },
    ],
  },
  'Lower — Quads / Hamstrings / Calves': {
    muscles: ['quads', 'hamstrings', 'glutes', 'calves'],
    note: 'Sat · Second leg hit. Keep RIR honest — this follows Upper day.',
    exercises: [
      { name: 'Bulgarian Split Squat', muscles: ['quads', 'glutes'], repRange: '10-12', note: 'Single-leg — exposes imbalances, huge quad stretch', priority: true, elbowSafe: true },
      { name: 'Leg Extension', muscles: ['quads'], repRange: '12-15', note: 'Pump finisher — high rep, slow eccentric', priority: true, elbowSafe: true },
      { name: 'Seated Leg Curl', muscles: ['hamstrings'], repRange: '12-15', note: 'Different angle from lying curl — hits differently', elbowSafe: true },
      { name: 'Stiff-Leg Deadlift', muscles: ['hamstrings', 'glutes'], repRange: '10-12', note: 'Keep hips square, feel the stretch', elbowSafe: true },
      { name: 'Leg Press Calf Raise', muscles: ['calves'], repRange: '15-20', note: 'Third calf hit for the week — high rep', elbowSafe: true },
    ],
  },
  Rest: { muscles: [], exercises: [] },
}

export const SPLIT_ORDER: string[] = [
  'Push — Chest / Front & Side Delts / Triceps',
  'Pull — Back / Rear Delts / Biceps (Modified)',
  'Legs — Quads / Hamstrings / Calves',
  'Upper — Chest / Back / Delts / Arms',
  'Lower — Quads / Hamstrings / Calves',
  'Rest',
]

export const EXERCISE_LIBRARY: ExerciseTemplate[] = [
  { name: 'Neutral Grip Cable Pulldown', muscles: ['back'], repRange: '10-12', elbowSafe: true, note: 'Neutral grip — elbow friendly' },
  { name: 'Wide Grip Cable Pulldown', muscles: ['back'], repRange: '10-12', note: 'Overhand — monitor elbow' },
  { name: 'Underhand Cable Pulldown', muscles: ['back'], repRange: '10-12', elbowSafe: true, note: 'Supinated grip, heavy bicep involvement' },
  { name: 'Seated Cable Row (Neutral)', muscles: ['back'], repRange: '10-12', elbowSafe: true },
  { name: 'Seated Cable Row (Wide)', muscles: ['back'], repRange: '10-12', note: 'More upper back emphasis' },
  { name: 'Single-Arm DB Row', muscles: ['back'], repRange: '10-15', elbowSafe: true },
  { name: 'Chest-Supported DB Row', muscles: ['back'], repRange: '10-12', elbowSafe: true, note: 'Takes lower back out' },
  { name: 'Machine Row', muscles: ['back'], repRange: '10-15', elbowSafe: true },
  { name: 'T-Bar Row', muscles: ['back'], repRange: '8-12' },
  { name: 'Pull-Up (Neutral Grip)', muscles: ['back'], repRange: '8-12', elbowSafe: true },
  { name: 'Straight-Arm Cable Pulldown', muscles: ['back'], repRange: '12-15', elbowSafe: true, note: 'Great lat isolator' },
  { name: 'Incline DB Press', muscles: ['chest', 'front_delts'], repRange: '10-12' },
  { name: 'Flat DB Press', muscles: ['chest'], repRange: '10-12' },
  { name: 'Incline Barbell Press', muscles: ['chest', 'front_delts'], repRange: '8-10' },
  { name: 'Flat Barbell Press', muscles: ['chest'], repRange: '8-10' },
  { name: 'Cable Chest Fly (Mid)', muscles: ['chest'], repRange: '12-15', elbowSafe: true, note: 'Mid-cable — easier on elbows' },
  { name: 'Cable Chest Fly (High to Low)', muscles: ['chest'], repRange: '12-15', elbowSafe: true, note: 'Lower chest emphasis' },
  { name: 'Pec Deck / Machine Fly', muscles: ['chest'], repRange: '12-15', elbowSafe: true },
  { name: 'Dips (Chest Focus)', muscles: ['chest', 'triceps'], repRange: '10-12', note: 'Lean forward for chest' },
  { name: 'Smith Machine Incline Press', muscles: ['chest', 'front_delts'], repRange: '10-12' },
  { name: 'Leg Extension', muscles: ['quads'], repRange: '12-15', priority: true, elbowSafe: true },
  { name: 'Hack Squat', muscles: ['quads', 'glutes'], repRange: '10-12', priority: true, elbowSafe: true },
  { name: 'Leg Press', muscles: ['quads', 'glutes'], repRange: '10-15', priority: true, elbowSafe: true },
  { name: 'Bulgarian Split Squat', muscles: ['quads', 'glutes'], repRange: '10-12', priority: true, elbowSafe: true },
  { name: 'Sissy Squat', muscles: ['quads'], repRange: '12-15', priority: true, elbowSafe: true, note: 'Brutal quad isolator' },
  { name: 'Front Squat', muscles: ['quads', 'glutes'], repRange: '8-10', priority: true },
  { name: 'Walking Lunge', muscles: ['quads', 'glutes'], repRange: '10-12', elbowSafe: true },
  { name: 'Romanian Deadlift', muscles: ['hamstrings', 'glutes'], repRange: '10-12', elbowSafe: true },
  { name: 'Lying Leg Curl', muscles: ['hamstrings'], repRange: '12-15', elbowSafe: true },
  { name: 'Seated Leg Curl', muscles: ['hamstrings'], repRange: '12-15', elbowSafe: true },
  { name: 'Single-Leg Curl', muscles: ['hamstrings'], repRange: '12-15', elbowSafe: true },
  { name: 'Stiff-Leg Deadlift', muscles: ['hamstrings', 'glutes'], repRange: '10-12', elbowSafe: true },
  { name: 'Hip Thrust', muscles: ['glutes'], repRange: '10-15', elbowSafe: true },
  { name: 'Cable Kickback', muscles: ['glutes'], repRange: '15-20', elbowSafe: true },
  { name: 'Standing Calf Raise', muscles: ['calves'], repRange: '12-20', elbowSafe: true },
  { name: 'Seated Calf Raise', muscles: ['calves'], repRange: '15-20', elbowSafe: true },
  { name: 'Leg Press Calf Raise', muscles: ['calves'], repRange: '15-20', elbowSafe: true },
  { name: 'Incline DB Curl', muscles: ['biceps'], repRange: '10-12', elbowSafe: true, note: 'Elbow-friendly, great stretch' },
  { name: 'Underhand Cable Curl', muscles: ['biceps'], repRange: '12-15', elbowSafe: true, note: 'Supinated — easier on brachialis' },
  { name: 'Cable Curl (Supinated)', muscles: ['biceps'], repRange: '12-15', elbowSafe: true },
  { name: 'EZ Bar Curl', muscles: ['biceps'], repRange: '10-12', note: 'Semi-supinated — moderate elbow load' },
  { name: 'Concentration Curl', muscles: ['biceps'], repRange: '12-15', elbowSafe: true },
  { name: 'Machine Curl', muscles: ['biceps'], repRange: '12-15', elbowSafe: true },
  { name: 'Spider Curl', muscles: ['biceps'], repRange: '12-15', elbowSafe: true, note: 'High peak contraction' },
  { name: 'High Cable Curl', muscles: ['biceps'], repRange: '12-15', elbowSafe: true },
  { name: 'Cable Tricep Pushdown (Rope)', muscles: ['triceps'], repRange: '12-15', elbowSafe: true },
  { name: 'Cable Tricep Pushdown (Bar)', muscles: ['triceps'], repRange: '12-15', elbowSafe: true },
  { name: 'Overhead DB Tricep Extension', muscles: ['triceps'], repRange: '12-15', note: 'Monitor elbow position' },
  { name: 'Skull Crusher (EZ Bar)', muscles: ['triceps'], repRange: '10-12' },
  { name: 'Single-Arm Cable Kickback', muscles: ['triceps'], repRange: '12-15', elbowSafe: true },
  { name: 'Machine Tricep Extension', muscles: ['triceps'], repRange: '12-15', elbowSafe: true },
  { name: 'Close-Grip Bench Press', muscles: ['triceps', 'chest'], repRange: '10-12' },
  { name: 'DB Lateral Raise', muscles: ['side_delts'], repRange: '12-20' },
  { name: 'Cable Lateral Raise', muscles: ['side_delts'], repRange: '15-20', elbowSafe: true },
  { name: 'Machine Lateral Raise', muscles: ['side_delts'], repRange: '15-20', elbowSafe: true },
  { name: 'Leaning Cable Lateral Raise', muscles: ['side_delts'], repRange: '15-20', elbowSafe: true, note: 'Better stretch at bottom' },
  { name: 'Cable Rear Delt Fly', muscles: ['rear_delts'], repRange: '15-20', elbowSafe: true },
  { name: 'Rope Face Pull', muscles: ['rear_delts'], repRange: '15-20', elbowSafe: true },
  { name: 'Rear Delt Machine Fly', muscles: ['rear_delts'], repRange: '15-20', elbowSafe: true },
  { name: 'Bent-Over DB Rear Delt Fly', muscles: ['rear_delts'], repRange: '15-20' },
  { name: 'DB Front Raise', muscles: ['front_delts'], repRange: '12-15' },
  { name: 'Cable Front Raise', muscles: ['front_delts'], repRange: '12-15', elbowSafe: true },
]

export const MUSCLES: Record<MuscleKey, { label: string; priority: boolean }> = {
  back:        { label: 'Back', priority: true },
  chest:       { label: 'Chest', priority: true },
  quads:       { label: 'Quads', priority: true },
  side_delts:  { label: 'Side Delts', priority: true },
  rear_delts:  { label: 'Rear Delts', priority: false },
  front_delts: { label: 'Front Delts', priority: false },
  biceps:      { label: 'Biceps', priority: true },
  triceps:     { label: 'Triceps', priority: true },
  hamstrings:  { label: 'Hamstrings', priority: false },
  glutes:      { label: 'Glutes', priority: false },
  calves:      { label: 'Calves', priority: false },
}

export const PHASES: { id: PhaseId; label: string; color: string; desc: string }[] = [
  { id: 'recovery',    label: 'Recovery',    color: '#f5a742', desc: 'Coming off high intensity. Lower load, building volume back up. Joint health priority.' },
  { id: 'maintenance', label: 'Maintenance', color: '#aaa',    desc: 'Stable calories. Hold muscle, maintain volume and intensity.' },
  { id: 'cut',         label: 'Cut',         color: '#42c8f5', desc: 'Caloric deficit. Protect muscle, manage fatigue. Strength dips are expected.' },
  { id: 'build',       label: 'Build',       color: '#c8f542', desc: 'Surplus or slight surplus. Push volume and progressive overload.' },
]

export const FEEL_LABELS: Record<number, string> = { 1: 'Rough', 2: 'Meh', 3: 'Solid', 4: 'Strong', 5: 'Dialed' }

export const RECOVERY_REASONS = [
  { id: 'injury',  label: 'Injury / Joint Issue',       icon: '🦴', needsDetail: true  },
  { id: 'cns',     label: 'CNS Fatigue',                icon: '⚡', needsDetail: false },
  { id: 'deload',  label: 'Scheduled Deload',           icon: '📅', needsDetail: false },
  { id: 'illness', label: 'Illness / Getting Sick',     icon: '🤒', needsDetail: false },
  { id: 'stress',  label: 'Life Stress / Sleep Issues', icon: '😮‍💨', needsDetail: false },
] as const

export const INJURY_KEYWORDS: Record<string, string[]> = {
  elbow:    ['bicep', 'curl', 'tricep', 'extension', 'skull', 'pullup', 'chin', 'row', 'press'],
  knee:     ['squat', 'lunge', 'leg press', 'leg extension', 'step', 'hack'],
  shoulder: ['press', 'fly', 'raise', 'overhead', 'dip', 'bench'],
  back:     ['deadlift', 'row', 'hyperextension', 'good morning'],
  wrist:    ['curl', 'press', 'row', 'pulldown'],
  hip:      ['squat', 'deadlift', 'lunge', 'leg press', 'hip thrust'],
  ankle:    ['calf', 'squat', 'lunge'],
  neck:     ['shrug', 'press', 'raise'],
}

export const LOWER_MUSCLES: MuscleKey[] = ['quads', 'hamstrings', 'glutes', 'calves']

export const SUGGESTION_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
  weight:  { bg: '#0f1a00', border: 'var(--accent)',  text: 'var(--accent)',  label: '↑ WEIGHT'   },
  reps:    { bg: '#001a2d', border: '#42c8f5',        text: '#42c8f5',        label: '↑ REPS'     },
  hold:    { bg: '#1a1a1a', border: 'var(--border)',  text: 'var(--text3)',   label: 'HOLD'       },
  backoff: { bg: '#2d1000', border: 'var(--accent2)', text: 'var(--accent2)', label: '↓ BACK OFF' },
}

export const CHECKIN_ENERGY     = ['Gassed', 'Low', 'Okay', 'Good', 'Dialed']
export const CHECKIN_MOTIVATION = ['None', 'Meh', 'There', 'Solid', 'Fired up']
export const CHECKIN_PHYSICAL   = ['Beat up', 'Heavy', 'Normal', 'Fresh', 'Springy']

export const USER_PROFILE = `You are an AI training coach for a serious natural bodybuilder. Here is their complete profile:

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

When giving feedback: be direct, specific, and practical. Reference their actual logged data. Flag volume imbalances across the week. Acknowledge cut phase context when interpreting performance. Be a training partner, not a clinical advisor. Keep it conversational.`
