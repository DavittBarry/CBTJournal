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
    readonly scienceNote?: string
    readonly caution?: string
  }
  onPractice: () => void
}

function SkillCard({ skill, onPractice }: SkillCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={`card overflow-hidden transition-all duration-300 ${expanded ? 'ring-2 ring-sage-400 dark:ring-sage-500' : ''}`}
    >
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

          {skill.scienceNote && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex gap-2">
                <span className="text-blue-500 flex-shrink-0">🔬</span>
                <p className="text-xs text-blue-700 dark:text-blue-300">{skill.scienceNote}</p>
              </div>
            </div>
          )}

          {skill.caution && (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex gap-2">
                <span className="text-amber-500 flex-shrink-0">⚠️</span>
                <p className="text-xs text-amber-700 dark:text-amber-300">{skill.caution}</p>
              </div>
            </div>
          )}

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
  const [wouldUseAgain, setWouldUseAgain] = useState(true)

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
      wouldUseAgain,
    }
    onSave(log)
  }

  const reduction = distressBefore - distressAfter
  const reductionPercent = distressBefore > 0 ? Math.round((reduction / distressBefore) * 100) : 0

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
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

          {reduction !== 0 && (
            <div
              className={`p-3 rounded-lg text-center ${
                reduction > 0
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
              }`}
            >
              <span className="text-sm font-medium">
                {reduction > 0
                  ? `Reduced distress by ${reduction} points (${reductionPercent}%)`
                  : `Distress increased by ${Math.abs(reduction)} points`}
              </span>
            </div>
          )}

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
            <label className="label">Would you use this again?</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setWouldUseAgain(true)}
                className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                  wouldUseAgain
                    ? 'bg-sage-50 dark:bg-sage-900/30 border-sage-400 dark:border-sage-600 text-sage-700 dark:text-sage-400'
                    : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-600 text-stone-500 dark:text-stone-400'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setWouldUseAgain(false)}
                className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                  !wouldUseAgain
                    ? 'bg-stone-100 dark:bg-stone-700 border-stone-400 dark:border-stone-500 text-stone-700 dark:text-stone-300'
                    : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-600 text-stone-500 dark:text-stone-400'
                }`}
              >
                Probably not
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
              placeholder="What did you notice? Any observations about what worked or didn't..."
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

  // All categories with their icons, organized by type
  const categoryGroups = {
    crisis: {
      label: 'Crisis skills',
      description: 'For intense distress (7+/10)',
      categories: [
        { id: 'tipp' as CopingCategory, icon: '🧊', label: 'TIPP' },
        { id: 'stop' as CopingCategory, icon: '🛑', label: 'STOP' },
      ],
    },
    distressTolerance: {
      label: 'Distress tolerance',
      description: 'Getting through hard times',
      categories: [
        { id: 'accepts' as CopingCategory, icon: '🎯', label: 'ACCEPTS' },
        { id: 'improve' as CopingCategory, icon: '✨', label: 'IMPROVE' },
        { id: 'grounding' as CopingCategory, icon: '🌿', label: 'Grounding' },
      ],
    },
    regulation: {
      label: 'Emotional regulation',
      description: 'Working with thoughts and feelings',
      categories: [
        { id: 'defusion' as CopingCategory, icon: '☁️', label: 'Defusion' },
        { id: 'selfCompassion' as CopingCategory, icon: '💚', label: 'Self-compassion' },
      ],
    },
    nervous: {
      label: 'Nervous system',
      description: 'Calming your body',
      categories: [
        { id: 'breathing' as CopingCategory, icon: '🌬️', label: 'Breathing' },
        { id: 'windowOfTolerance' as CopingCategory, icon: '🪟', label: 'Window' },
      ],
    },
  }

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
        description="Evidence-based techniques for managing intense emotions. These skills come from Dialectical Behavior Therapy (DBT), Acceptance and Commitment Therapy (ACT), Compassion-Focused Therapy (CFT), and polyvagal research."
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

      {/* Category selection organized by group */}
      <div className="space-y-4 mb-6">
        {Object.entries(categoryGroups).map(([groupKey, group]) => (
          <div key={groupKey}>
            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                {group.label}
              </h3>
              <span className="text-xs text-stone-400 dark:text-stone-500">
                {group.description}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {group.categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all text-sm ${
                    activeCategory === cat.id
                      ? 'bg-sage-100 dark:bg-sage-900/40 text-sage-700 dark:text-sage-400 font-medium ring-2 ring-sage-300 dark:ring-sage-600'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Current category details */}
      <div className="mb-8">
        <div className="card p-4 mb-4 bg-gradient-to-r from-sage-50 to-stone-50 dark:from-sage-900/20 dark:to-stone-800/50">
          <h2 className="font-semibold text-stone-800 dark:text-stone-200 mb-1">
            {currentCategory.name}
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-2">
            {currentCategory.description}
          </p>
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="text-sage-600 dark:text-sage-400">
              📚 Source: {currentCategory.source}
            </span>
            {currentCategory.whenToUse && (
              <span className="text-blue-600 dark:text-blue-400">
                ⏰ When: {currentCategory.whenToUse}
              </span>
            )}
          </div>
        </div>

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
              const skill = category?.skills.find((s) => s.id === log.skillId)
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
