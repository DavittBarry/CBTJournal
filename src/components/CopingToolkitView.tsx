import { useState } from 'react'
import { useAppStore } from '@/stores/appStore'
import { COPING_SKILLS, type CopingCategory, type CopingSkillLog } from '@/types'
import { format } from 'date-fns'
import { PageIntro } from '@/components/InfoComponents'
import { toast } from '@/stores/toastStore'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

interface SkillCardProps {
  skill: {
    readonly id: string
    readonly name: string
    readonly description: string
    readonly instructions: readonly string[]
    readonly duration: string
  }
  onPractice: () => void
}

function SkillCard({ skill, onPractice }: SkillCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left flex items-start justify-between gap-3"
      >
        <div className="flex-1">
          <div className="font-medium text-stone-700 dark:text-stone-300">{skill.name}</div>
          <div className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            {skill.description}
          </div>
          <div className="text-xs text-sage-600 dark:text-sage-400 mt-1">⏱ {skill.duration}</div>
        </div>
        <svg
          className={`w-5 h-5 text-stone-400 transition-transform flex-shrink-0 mt-0.5 ${expanded ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-stone-100 dark:border-stone-700 pt-3 animate-fade-in">
          <h4 className="text-xs font-medium text-stone-600 dark:text-stone-400 uppercase tracking-wide mb-2">
            Instructions
          </h4>
          <ol className="space-y-2 mb-4">
            {skill.instructions.map((instruction, idx) => (
              <li key={idx} className="flex gap-2 text-sm text-stone-600 dark:text-stone-300">
                <span className="text-sage-600 dark:text-sage-400 font-medium flex-shrink-0">
                  {idx + 1}.
                </span>
                {instruction}
              </li>
            ))}
          </ol>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPractice()
            }}
            className="btn-secondary w-full text-sm"
          >
            Log this practice
          </button>
        </div>
      )}
    </div>
  )
}

interface PracticeLogModalProps {
  skill: { id: string; name: string }
  category: CopingCategory
  onClose: () => void
  onSave: (log: CopingSkillLog) => void
}

function PracticeLogModal({ skill, category, onClose, onSave }: PracticeLogModalProps) {
  const [distressBefore, setDistressBefore] = useState(5)
  const [distressAfter, setDistressAfter] = useState(5)
  const [notes, setNotes] = useState('')
  const [helpful, setHelpful] = useState(true)

  const handleSave = () => {
    const log: CopingSkillLog = {
      id: generateId(),
      date: format(new Date(), 'yyyy-MM-dd'),
      createdAt: new Date().toISOString(),
      category,
      skillId: skill.id,
      distressBefore,
      distressAfter,
      notes: notes.trim() || undefined,
      helpful,
    }
    onSave(log)
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div className="card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-200 mb-4">
          Log: {skill.name}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="label">Distress before (0-10)</label>
            <input
              type="range"
              min="0"
              max="10"
              value={distressBefore}
              onChange={(e) => setDistressBefore(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400">
              <span>Calm</span>
              <span className="font-medium">{distressBefore}</span>
              <span>Extreme</span>
            </div>
          </div>

          <div>
            <label className="label">Distress after (0-10)</label>
            <input
              type="range"
              min="0"
              max="10"
              value={distressAfter}
              onChange={(e) => setDistressAfter(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400">
              <span>Calm</span>
              <span className="font-medium">{distressAfter}</span>
              <span>Extreme</span>
            </div>
          </div>

          <div>
            <label className="label">Was this helpful?</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setHelpful(true)}
                className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                  helpful
                    ? 'bg-sage-50 dark:bg-sage-900/30 border-sage-400 dark:border-sage-600 text-sage-700 dark:text-sage-400'
                    : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-600 text-stone-500 dark:text-stone-400'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setHelpful(false)}
                className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                  !helpful
                    ? 'bg-stone-100 dark:bg-stone-700 border-stone-400 dark:border-stone-500 text-stone-700 dark:text-stone-300'
                    : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-600 text-stone-500 dark:text-stone-400'
                }`}
              >
                Not really
              </button>
            </div>
          </div>

          <div>
            <label className="label">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
              rows={2}
              placeholder="Any observations..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary flex-1">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export function CopingToolkitView() {
  const { addCopingSkillLog, copingSkillLogs, safetyPlan, setView } = useAppStore()
  const [activeCategory, setActiveCategory] = useState<CopingCategory>('tipp')
  const [practiceModal, setPracticeModal] = useState<{
    skill: { id: string; name: string }
    category: CopingCategory
  } | null>(null)

  const categories: { id: CopingCategory; icon: string }[] = [
    { id: 'tipp', icon: '🧊' },
    { id: 'grounding', icon: '🌿' },
    { id: 'defusion', icon: '☁️' },
    { id: 'breathing', icon: '🌬️' },
  ]

  const handlePractice = async (log: CopingSkillLog) => {
    await addCopingSkillLog(log)
    setPracticeModal(null)
    toast.success('Practice logged')
  }

  const currentCategory = COPING_SKILLS[activeCategory]

  const recentLogs = copingSkillLogs.slice(0, 5)
  const effectiveSkills = copingSkillLogs
    .filter((log) => log.helpful && log.distressAfter < log.distressBefore)
    .reduce(
      (acc, log) => {
        if (!acc[log.skillId]) {
          acc[log.skillId] = { count: 0, avgReduction: 0 }
        }
        acc[log.skillId].count++
        acc[log.skillId].avgReduction += log.distressBefore - log.distressAfter
        return acc
      },
      {} as Record<string, { count: number; avgReduction: number }>
    )

  return (
    <div className="max-w-2xl mx-auto">
      <PageIntro
        title="Coping toolkit"
        description="Evidence-based techniques for managing intense emotions and distress. These skills come from Dialectical Behavior Therapy (DBT), Acceptance and Commitment Therapy (ACT), and Mindfulness-Based Cognitive Therapy (MBCT)."
        centered={false}
      />

      {!safetyPlan && (
        <div className="card p-4 mb-6 border-2 border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20">
          <div className="flex items-start gap-3">
            <span className="text-xl">🛡️</span>
            <div>
              <h3 className="font-medium text-stone-800 dark:text-stone-200 mb-1">
                Create a safety plan
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 mb-2">
                A safety plan helps you navigate crisis moments. It's recommended by mental health
                professionals worldwide.
              </p>
              <button
                onClick={() => setView('safety-plan')}
                className="text-sm font-medium text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300"
              >
                Create safety plan →
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-sage-100 dark:bg-sage-900/40 text-sage-700 dark:text-sage-400 font-medium'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <span>{cat.icon}</span>
            <span className="text-sm">{COPING_SKILLS[cat.id].name}</span>
          </button>
        ))}
      </div>

      <div className="mb-8">
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
          {currentCategory.description}
        </p>
        <div className="space-y-3">
          {currentCategory.skills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onPractice={() => setPracticeModal({ skill, category: activeCategory })}
            />
          ))}
        </div>
      </div>

      {recentLogs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-stone-600 dark:text-stone-400 mb-3">
            Recent practice
          </h2>
          <div className="space-y-2">
            {recentLogs.map((log) => {
              const category = COPING_SKILLS[log.category]
              const skill = category.skills.find((s) => s.id === log.skillId)
              const reduction = log.distressBefore - log.distressAfter

              return (
                <div key={log.id} className="card p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-stone-700 dark:text-stone-300">
                      {skill?.name || log.skillId}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">
                      {format(new Date(log.createdAt), 'MMM d, h:mm a')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {reduction > 0 ? (
                      <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                        -{reduction} distress
                      </span>
                    ) : reduction < 0 ? (
                      <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
                        +{Math.abs(reduction)} distress
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full">
                        No change
                      </span>
                    )}
                    {log.helpful && (
                      <span className="text-green-500" title="Marked as helpful">
                        ✓
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {Object.keys(effectiveSkills).length > 0 && (
        <div className="card p-4 bg-sage-50 dark:bg-sage-900/20">
          <h3 className="text-sm font-medium text-sage-700 dark:text-sage-400 mb-2">
            💡 Skills that work for you
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 mb-3">
            Based on your practice logs, these techniques have been most effective:
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(effectiveSkills)
              .sort((a, b) => b[1].avgReduction - a[1].avgReduction)
              .slice(0, 3)
              .map(([skillId, data]) => {
                const avgReduction = Math.round(data.avgReduction / data.count)
                let skillName = skillId
                Object.values(COPING_SKILLS).forEach((cat) => {
                  const found = cat.skills.find((s) => s.id === skillId)
                  if (found) skillName = found.name
                })
                return (
                  <span
                    key={skillId}
                    className="text-xs bg-white dark:bg-stone-800 px-2 py-1 rounded-full text-stone-700 dark:text-stone-300"
                  >
                    {skillName} (avg -{avgReduction})
                  </span>
                )
              })}
          </div>
        </div>
      )}

      {practiceModal && (
        <PracticeLogModal
          skill={practiceModal.skill}
          category={practiceModal.category}
          onClose={() => setPracticeModal(null)}
          onSave={handlePractice}
        />
      )}
    </div>
  )
}
