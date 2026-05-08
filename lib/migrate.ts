import { createClient } from '@/lib/supabase/client'

export async function migrateFromLocalStorage() {
  const supabase = createClient()
  const results: Record<string, string> = {}

  // Workouts
  try {
    const raw = localStorage.getItem('ironlog_workouts')
    if (raw) {
      const workouts = JSON.parse(raw)
      for (const w of workouts) {
        await supabase.from('workouts').insert({
          date: w.date,
          split_day: w.splitDay,
          exercises: w.exercises,
          feel: w.feel || null,
          notes: w.notes || null,
        })
      }
      results.workouts = `${workouts.length} workouts migrated`
    }
  } catch (e) {
    results.workouts = `error: ${e}`
  }

  // Body entries
  try {
    const raw = localStorage.getItem('ironlog_bodyEntries')
    if (raw) {
      const entries = JSON.parse(raw)
      for (const e of entries) {
        await supabase.from('body_entries').upsert({
          date: e.date,
          weight: e.weight || null,
          bf: e.bf || null,
          kcal: e.kcal || null,
          protein: e.protein || null,
          carbs: e.carbs || null,
          fat: e.fat || null,
        }, { onConflict: 'user_id,date' })
      }
      results.bodyEntries = `${entries.length} entries migrated`
    }
  } catch (e) {
    results.bodyEntries = `error: ${e}`
  }

  // Settings
  try {
    const patch: Record<string, any> = {}
    const keys: Record<string, string> = {
      ironlog_phase: 'phase',
      ironlog_splitOrder: 'split_order',
      ironlog_activeCoachSplit: 'active_coach_split',
      ironlog_phaseGoals: 'phase_goals',
      ironlog_recoveryContext: 'recovery_context',
      ironlog_macroTargets: 'macro_targets',
      ironlog_customExercises: 'custom_exercises',
    }
    for (const [lsKey, dbKey] of Object.entries(keys)) {
      const val = localStorage.getItem(lsKey)
      if (val) patch[dbKey] = JSON.parse(val)
    }
    if (Object.keys(patch).length > 0) {
      const userId = (await supabase.auth.getUser()).data.user?.id
      await supabase.from('user_settings').update(patch).eq('user_id', userId)
      results.settings = `${Object.keys(patch).length} settings migrated`
    }
  } catch (e) {
    results.settings = `error: ${e}`
  }

  return results
}