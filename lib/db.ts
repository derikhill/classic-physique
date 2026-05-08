import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

async function currentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  const id = data.user?.id
  if (!id) throw new Error('Not authenticated')
  return id
}

// ── Workouts ─────────────────────────────────────────────────────────────────

export async function getWorkouts() {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return data
}

export async function saveWorkout(workout: any) {
  const user_id = await currentUserId()
  const { data, error } = await supabase
    .from('workouts')
    .insert({
      user_id,
      date: workout.date,
      split_day: workout.splitDay,
      exercises: workout.exercises,
      feel: workout.feel,
      notes: workout.notes,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateWorkout(id: string, workout: any) {
  const { error } = await supabase
    .from('workouts')
    .update({
      exercises: workout.exercises,
      feel: workout.feel,
      notes: workout.notes,
    })
    .eq('id', id)
  if (error) throw error
}

export async function deleteWorkout(id: string) {
  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ── Body Entries ──────────────────────────────────────────────────────────────

export async function getBodyEntries() {
  const { data, error } = await supabase
    .from('body_entries')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return data
}

export async function upsertBodyEntry(entry: any) {
  const user_id = await currentUserId()
  const { error } = await supabase
    .from('body_entries')
    .upsert({
      user_id,
      date: entry.date,
      weight: entry.weight || null,
      bf: entry.bf || null,
      kcal: entry.kcal || null,
      protein: entry.protein || null,
      carbs: entry.carbs || null,
      fat: entry.fat || null,
    }, { onConflict: 'user_id,date' })
  if (error) throw error
}

// ── User Settings ─────────────────────────────────────────────────────────────

export async function getSettings() {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateSettings(patch: Record<string, any>) {
  const user_id = await currentUserId()
  const { error } = await supabase
    .from('user_settings')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('user_id', user_id)
  if (error) throw error
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function signOut() {
  await supabase.auth.signOut()
}
