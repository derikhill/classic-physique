'use client'

import { useState } from 'react'
import { FEEL_LABELS, PHASES, RECOVERY_REASONS, type PhaseId } from '@/lib/constants'
import { callClaude, muscleVolume, totalSets, type BodyEntry, type RecoveryContext, type Workout } from '@/lib/utils'
import type { MacroTargets } from './BodyTracker'

interface PhaseGoal {
  mode?: string
  targetRate?: string
  targetWeight?: string
  deadline?: string
  muscles?: string[]
  lift?: string
  targetReps?: string
  note?: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export default function AICoach({
  workouts,
  phase,
  bodyEntries,
  recoveryContext,
  phaseGoals,
  macroTargets,
  lastCheckIn,
  onLastCheckIn,
}: {
  workouts: Workout[]
  phase: PhaseId
  bodyEntries: BodyEntry[]
  recoveryContext: RecoveryContext | null
  phaseGoals: Record<string, PhaseGoal>
  macroTargets: MacroTargets
  lastCheckIn: string | null
  onLastCheckIn: (iso: string) => void
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkInRunning, setCheckInRunning] = useState(false)

  const [nowSnapshot] = useState(() => Date.now())
  const daysSinceCheckIn = lastCheckIn
    ? Math.floor((nowSnapshot - new Date(lastCheckIn).getTime()) / (1000 * 60 * 60 * 24))
    : null
  const checkInDue = daysSinceCheckIn === null || daysSinceCheckIn >= 7

  const buildContext = () => {
    const recent = [...workouts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10)
    const vol7 = muscleVolume(workouts, 7)
    const vol14 = muscleVolume(workouts, 14)

    const cutoff84 = new Date(); cutoff84.setDate(cutoff84.getDate() - 84)
    const recentBody = [...(bodyEntries || [])]
      .filter(e => new Date(e.date) >= cutoff84)
      .sort((a, b) => b.date.localeCompare(a.date))

    const weeklyWeights = (() => {
      const weeks: Record<string, number[]> = {}
      recentBody.filter(e => e.weight).forEach(e => {
        const d = new Date(e.date + 'T12:00:00')
        const day = d.getDay()
        const monday = new Date(d)
        monday.setDate(d.getDate() - ((day + 6) % 7))
        const weekKey = monday.toISOString().split('T')[0]
        if (!weeks[weekKey]) weeks[weekKey] = []
        weeks[weekKey].push(parseFloat(e.weight!))
      })
      return Object.entries(weeks)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, vs]) => {
          const monday = new Date(k + 'T12:00:00')
          const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6)
          const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`
          return {
            week: `${fmt(monday)}–${fmt(sunday)}`,
            avg: (vs.reduce((s, v) => s + v, 0) / vs.length).toFixed(1),
            count: vs.length,
          }
        })
    })()

    const cutoff14 = new Date(); cutoff14.setDate(cutoff14.getDate() - 14)
    const macroLogs = (bodyEntries || [])
      .filter(e => new Date(e.date) >= cutoff14 && e.macros?.calories)
      .map(e => e.macros!)
    const avgMacros = macroLogs.length ? {
      calories: Math.round(macroLogs.reduce((s, m) => s + parseFloat(m.calories || '0'), 0) / macroLogs.length),
      protein: Math.round(macroLogs.reduce((s, m) => s + parseFloat(m.protein || '0'), 0) / macroLogs.length),
    } : null

    const weightEntries = recentBody.filter(e => e.weight).sort((a, b) => a.date.localeCompare(b.date))
    let rateOfChange: string | null = null
    if (weightEntries.length >= 4) {
      const oldest = parseFloat(weightEntries[0].weight!)
      const newest = parseFloat(weightEntries[weightEntries.length - 1].weight!)
      const days = (new Date(weightEntries[weightEntries.length - 1].date).getTime() - new Date(weightEntries[0].date).getTime()) / (1000 * 60 * 60 * 24)
      rateOfChange = days > 0 ? ((newest - oldest) / days * 7).toFixed(2) : null
    }

    const latestBF = recentBody.find(e => e.bf)
    const latestW = recentBody.find(e => e.weight)
    const estLBM = latestW && latestBF
      ? (parseFloat(latestW.weight!) * (1 - parseFloat(latestBF.bf!) / 100)).toFixed(1)
      : null

    const goal = phaseGoals?.[phase]
    const goalLine = (() => {
      if (!goal) return ''
      if (phase === 'cut') {
        if (goal.mode === 'rate') return `\nCUT GOAL: Target rate of loss ${goal.targetRate} lbs/week.${goal.note ? ' Note: ' + goal.note : ''}`
        if (goal.mode === 'deadline') {
          const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null
          return `\nCUT GOAL: Reach ${goal.targetWeight}lbs by ${goal.deadline}${daysLeft !== null ? ` (${daysLeft} days away)` : ''}.${goal.note ? ' Note: ' + goal.note : ''}`
        }
      }
      if (phase === 'build') {
        if (goal.mode === 'overall') return `\nBUILD GOAL: Overall growth — balanced development across all muscle groups.${goal.note ? ' Note: ' + goal.note : ''}`
        if (goal.mode === 'priority') return `\nBUILD GOAL: Priority muscles — ${(goal.muscles || []).map(m => m.replace('_', ' ')).join(' and ')}. Weight assessments toward these groups.${goal.note ? ' Note: ' + goal.note : ''}`
        if (goal.mode === 'strength') return `\nBUILD GOAL: Strength target — ${goal.lift} ${goal.targetWeight}lbs × ${goal.targetReps} reps.${goal.note ? ' Note: ' + goal.note : ''}`
      }
      if (goal.note) return `\nPHASE GOAL: ${goal.note}`
      return ''
    })()

    const rcLine = recoveryContext?.active
      ? `\nRECOVERY CONTEXT: ${RECOVERY_REASONS.find(r => r.id === recoveryContext.reason)?.label || recoveryContext.reason}${recoveryContext.injuryDetail ? ` — ${recoveryContext.injuryDetail}` : ''}. Started ${recoveryContext.startDate}.`
      : ''
    return `CURRENT PHASE: ${phase.toUpperCase()}${goalLine}${rcLine}
${macroTargets?.calories ? `DAILY MACRO TARGETS: ${macroTargets.calories}kcal | ${macroTargets.protein}g protein | ${macroTargets.carbs}g carbs | ${macroTargets.fat}g fat` : 'DAILY MACRO TARGETS: not set'}

TRAINING VOLUME — LAST 7 DAYS: ${JSON.stringify(vol7)}
TRAINING VOLUME — LAST 14 DAYS: ${JSON.stringify(vol14)}

BODY COMPOSITION:
${latestW ? `Latest weight: ${latestW.weight}lbs (${latestW.date})` : 'No weight logged'}
${latestBF ? `Latest body fat: ${latestBF.bf}% (${latestBF.date})` : 'No BF% logged'}
${estLBM ? `Estimated LBM: ${estLBM}lbs` : ''}
${rateOfChange !== null ? `Rate of change: ${parseFloat(rateOfChange) > 0 ? '+' : ''}${rateOfChange}lbs/week` : 'Rate of change: insufficient data'}
Weekly weight averages (oldest → newest): ${weeklyWeights.map(w => `${w.week}: ${w.avg}lbs (${w.count} entries)`).join(' | ') || 'none'}

NUTRITION (14-day avg from logged sessions):
${avgMacros ? `Calories: ${avgMacros.calories} kcal/day avg | Protein: ${avgMacros.protein}g/day avg` : 'No macros logged yet'}
Macro logs available: ${macroLogs.length} sessions

LAST 10 SESSIONS:
${recent.map(w => `${w.date} — ${w.splitDay} | Feel: ${w.feel ? FEEL_LABELS[w.feel] : '?'} | Sets: ${totalSets(w)}
${w.exercises.map(ex => `  ${ex.name}: ${ex.sets.map(s => `${s.weight}lb×${s.reps}r RIR${s.rir}`).join(', ')}`).join('\n')}${w.notes ? `\n  Notes: ${w.notes}` : ''}`).join('\n\n')}`
  }

  const buildWeeklyCheckInPrompt = () => {
    const ctx = buildContext()
    const phaseInstructions: Record<string, string> = {
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
    }

    const goal = phaseGoals?.[phase]
    const goalContext = goal ? `\n\nACTIVE GOAL: ${
      phase === 'cut' && goal.mode === 'rate' ? `Target rate ${goal.targetRate} lbs/week — compare actual rate against this target and flag if off-pace.` :
      phase === 'cut' && goal.mode === 'deadline' ? `Goal weight ${goal.targetWeight}lbs by ${goal.deadline} — calculate if current rate of loss will hit this in time.` :
      phase === 'build' && goal.mode === 'priority' ? `Priority muscles: ${(goal.muscles || []).map(m => m.replace('_', ' ')).join(' and ')} — weight your assessment toward these.` :
      phase === 'build' && goal.mode === 'strength' ? `Strength target: ${goal.lift} ${goal.targetWeight}lbs × ${goal.targetReps} reps — track progress toward this specifically.` :
      goal.note || 'General phase goal set.'
    }` : ''
    return `${ctx}${goalContext}

---
WEEKLY CHECK-IN REQUEST

Please give me a structured weekly assessment. Be direct and specific — use my actual numbers, not generalities. Format your response with clear section headers matching the 5 areas below.

${phaseInstructions[phase] || phaseInstructions.maintenance}

End with a single sentence summary verdict: e.g. "Solid week — deficit is working, tighten up protein on rest days."`
  }

  const runWeeklyCheckIn = async () => {
    if (loading || checkInRunning) return
    setCheckInRunning(true)
    const prompt = buildWeeklyCheckInPrompt()
    const userMsg: ChatMessage = { role: 'user', content: '📋 Weekly Check-In' }
    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '' }])
    setLoading(true)

    const historyForApi = messages.map(m => ({ role: m.role, content: m.content }))
    const fullMessages: ChatMessage[] = [...historyForApi, { role: 'user', content: prompt }]

    try {
      await callClaude(fullMessages, partial => {
        setMessages(msgs => msgs.map((m, i) => (i === msgs.length - 1 ? { ...m, content: partial } : m)))
      })
      const now = new Date().toISOString()
      onLastCheckIn(now)
    } catch {
      setMessages(msgs => msgs.map((m, i) => (i === msgs.length - 1 ? { ...m, content: 'Error connecting. Check your connection and try again.' } : m)))
    }
    setLoading(false)
    setCheckInRunning(false)
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: ChatMessage = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages([...newMessages, { role: 'assistant', content: '' }])
    setInput('')
    setLoading(true)

    const context = buildContext()
    const historyForApi = messages.map(m => ({ role: m.role, content: m.content }))
    const fullMessages: ChatMessage[] = historyForApi.length === 0
      ? [{ role: 'user', content: `${context}\n\n---\n${text}` }]
      : [
          { role: 'user', content: `${context}\n\n---\n${historyForApi[0].content}` },
          ...historyForApi.slice(1),
          { role: 'user', content: text },
        ]

    try {
      await callClaude(fullMessages, partial => {
        setMessages(msgs => msgs.map((m, i) => (i === msgs.length - 1 ? { ...m, content: partial } : m)))
      })
    } catch {
      setMessages(msgs => msgs.map((m, i) => (i === msgs.length - 1 ? { ...m, content: 'Error connecting to AI. Check your connection.' } : m)))
    }
    setLoading(false)
  }

  const PHASE_PROMPTS: Record<string, string[]> = {
    cut: [
      'Assess my cut — deficit, protein, rate of loss',
      'Am I losing too fast? Check my muscle retention',
      'Is my protein high enough for this deficit?',
      'How is my strength holding up on the cut?',
      'Volume check — am I recovering on these calories?',
    ],
    build: [
      'Assess my build phase — surplus, volume, overload',
      'Am I gaining too fast or too slow?',
      'Which lifts need more attention for size?',
      'Is my volume appropriate for a build?',
      'Nutrition check — am I eating enough to grow?',
    ],
    recovery: [
      recoveryContext?.reason === 'injury' && recoveryContext?.injuryDetail
        ? `How's my ${recoveryContext.injuryDetail} recovery looking?`
        : 'How is my recovery looking from the data?',
      'Is my volume appropriate for recovery phase?',
      'When should I consider moving to maintenance?',
      'Any red flags in my recent sessions?',
      'How is my consistency looking?',
    ],
    maintenance: [
      'Ready to start my cut? Assess my current state',
      'How is my volume and strength baseline looking?',
      'Am I in a good position to start cutting?',
      'Any muscle groups lagging I should address first?',
      'How is my overall progress looking?',
    ],
  }
  const prompts = PHASE_PROMPTS[phase] || PHASE_PROMPTS.maintenance

  return (
    <div className="page">
      <div className="card" style={{ borderColor: checkInDue ? 'var(--accent)' : 'var(--border)', background: checkInDue ? '#050f00' : 'var(--surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div className="card-title" style={{ marginBottom: 4, color: checkInDue ? 'var(--accent)' : 'var(--text2)' }}>
              {checkInDue ? '📋 Weekly Check-In Due' : '📋 Weekly Check-In'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>
              {daysSinceCheckIn === null
                ? 'No check-in logged yet. Get your first full assessment.'
                : checkInDue
                  ? `Last check-in ${daysSinceCheckIn} days ago — time for a new assessment.`
                  : `Last check-in ${daysSinceCheckIn} day${daysSinceCheckIn === 1 ? '' : 's'} ago — next due in ${7 - daysSinceCheckIn} day${7 - daysSinceCheckIn === 1 ? '' : 's'}.`}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={runWeeklyCheckIn}
              disabled={loading}
              style={{ background: checkInDue ? 'var(--accent)' : 'var(--surface3)', color: checkInDue ? '#000' : 'var(--text2)', borderColor: checkInDue ? 'var(--accent)' : 'var(--border)', minWidth: 120 }}
            >
              {loading && checkInRunning ? 'Assessing...' : 'Run Check-In'}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>Quick Prompts</div>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: 1,
            textTransform: 'uppercase', padding: '2px 8px', borderRadius: 3,
            color: PHASES.find(p => p.id === phase)?.color || 'var(--text2)',
            border: `1px solid ${PHASES.find(p => p.id === phase)?.color || 'var(--border)'}`,
            background: 'var(--surface3)',
          }}>{phase} coaching</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 10 }}>Your coach has access to all your session history, volume data, body composition, and current phase.</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 0 }}>
          {prompts.map(p => (
            <button key={p} className="btn btn-secondary btn-sm" onClick={() => sendMessage(p)} disabled={loading}>{p}</button>
          ))}
        </div>
      </div>

      <div className="card">
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text3)', fontSize: 13 }}>
            No conversation yet. Run a check-in or tap a prompt above.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className="ai-box" style={{ borderLeftColor: m.role === 'user' ? 'var(--accent2)' : 'var(--accent)', marginBottom: 10 }}>
            <div className="ai-label">{m.role === 'user' ? 'You' : 'Coach'}</div>
            <div className="ai-text">
              {m.content
                ? m.content
                : loading && i === messages.length - 1
                  ? <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="loading-dots"><span /><span /><span /></div>
                      <span style={{ fontSize: 12, color: 'var(--text3)' }}>Thinking...</span>
                    </div>
                  : ''}
            </div>
          </div>
        ))}
        <div className="ai-input-row">
          <input
            className="inp"
            placeholder="Ask your coach..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            disabled={loading}
          />
          <button className="btn btn-primary" onClick={() => sendMessage(input)} disabled={loading || !input.trim()}>Ask</button>
        </div>
      </div>
    </div>
  )
}
