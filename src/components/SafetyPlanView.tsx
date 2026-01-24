import { useState } from 'react'
import { useAppStore } from '@/stores/appStore'
import { type SafetyPlan, SAFETY_PLAN_GUIDANCE, CRISIS_RESOURCES } from '@/types'
import { PageIntro, InfoButton } from '@/components/InfoComponents'
import { AutoExpandTextarea } from '@/components/AutoExpandTextarea'
import { toast } from '@/stores/toastStore'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function ListInput({
  items,
  onChange,
  placeholder,
  addLabel,
  examples,
}: {
  items: string[]
  onChange: (items: string[]) => void
  placeholder: string
  addLabel: string
  examples?: readonly string[]
}) {
  const [newItem, setNewItem] = useState('')
  const [showExamples, setShowExamples] = useState(false)

  const addItem = () => {
    if (newItem.trim()) {
      onChange([...items, newItem.trim()])
      setNewItem('')
    }
  }

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const addExample = (example: string) => {
    if (!items.includes(example)) {
      onChange([...items, example])
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
          placeholder={placeholder}
          className="input-field flex-1"
        />
        <button type="button" onClick={addItem} className="btn-secondary px-4">
          {addLabel}
        </button>
      </div>

      {examples && examples.length > 0 && (
        <div className="mb-3">
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="text-xs text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 flex items-center gap-1"
          >
            <svg
              className={`w-3 h-3 transition-transform ${showExamples ? 'rotate-90' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
            {showExamples ? 'Hide examples' : 'Show examples'}
          </button>
          {showExamples && (
            <div className="mt-2 flex flex-wrap gap-1.5 animate-fade-in">
              {examples.map((example, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => addExample(example)}
                  disabled={items.includes(example)}
                  className={`text-xs px-2 py-1 rounded-full transition-colors ${
                    items.includes(example)
                      ? 'bg-sage-100 dark:bg-sage-900/30 text-sage-400 dark:text-sage-600 cursor-not-allowed'
                      : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-sage-100 dark:hover:bg-sage-800'
                  }`}
                >
                  + {example}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-1">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-stone-50 dark:bg-stone-800 rounded-lg px-3 py-2"
            >
              <span className="text-sm text-stone-700 dark:text-stone-300 flex-1">{item}</span>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="text-stone-400 hover:text-critical-500 dark:hover:text-critical-400"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ContactInput({
  contacts,
  onChange,
  fields,
}: {
  contacts: {
    name: string
    phone?: string
    contact?: string
    relationship?: string
    type?: string
  }[]
  onChange: (
    contacts: {
      name: string
      phone?: string
      contact?: string
      relationship?: string
      type?: string
    }[]
  ) => void
  fields: ('phone' | 'contact' | 'relationship' | 'type')[]
}) {
  const [newName, setNewName] = useState('')
  const [newExtra, setNewExtra] = useState('')
  const [newRelationship, setNewRelationship] = useState('')

  const addContact = () => {
    if (newName.trim()) {
      const contact: {
        name: string
        phone?: string
        contact?: string
        relationship?: string
        type?: string
      } = {
        name: newName.trim(),
      }
      if (fields.includes('phone') && newExtra.trim()) contact.phone = newExtra.trim()
      if (fields.includes('contact') && newExtra.trim()) contact.contact = newExtra.trim()
      if (fields.includes('relationship') && newRelationship.trim())
        contact.relationship = newRelationship.trim()
      if (fields.includes('type') && newRelationship.trim()) contact.type = newRelationship.trim()
      onChange([...contacts, contact])
      setNewName('')
      setNewExtra('')
      setNewRelationship('')
    }
  }

  const removeContact = (index: number) => {
    onChange(contacts.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Name"
          className="input-field"
        />
        {(fields.includes('phone') || fields.includes('contact')) && (
          <input
            type="text"
            value={newExtra}
            onChange={(e) => setNewExtra(e.target.value)}
            placeholder={fields.includes('phone') ? 'Phone' : 'Contact info'}
            className="input-field"
          />
        )}
        {(fields.includes('relationship') || fields.includes('type')) && (
          <input
            type="text"
            value={newRelationship}
            onChange={(e) => setNewRelationship(e.target.value)}
            placeholder={
              fields.includes('relationship') ? 'Relationship' : 'Type (therapist, etc.)'
            }
            className="input-field"
          />
        )}
      </div>
      <button type="button" onClick={addContact} className="btn-secondary w-full sm:w-auto mb-3">
        + Add
      </button>
      {contacts.length > 0 && (
        <div className="space-y-2">
          {contacts.map((contact, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-stone-50 dark:bg-stone-800 rounded-lg px-3 py-2"
            >
              <div className="flex-1">
                <div className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  {contact.name}
                </div>
                <div className="text-xs text-stone-500 dark:text-stone-400">
                  {contact.phone || contact.contact}
                  {(contact.relationship || contact.type) &&
                    ` • ${contact.relationship || contact.type}`}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeContact(idx)}
                className="text-stone-400 hover:text-critical-500 dark:hover:text-critical-400"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function SafetyPlanView() {
  const { safetyPlan, saveSafetyPlan, setView } = useAppStore()

  const [warningSigns, setWarningSigns] = useState<string[]>(safetyPlan?.warningSigns || [])
  const [copingStrategies, setCopingStrategies] = useState<string[]>(
    safetyPlan?.copingStrategies || []
  )
  const [socialDistractions, setSocialDistractions] = useState<
    { name: string; contact?: string }[]
  >(safetyPlan?.socialDistractions || [])
  const [peopleToContact, setPeopleToContact] = useState<
    { name: string; phone?: string; relationship?: string }[]
  >(safetyPlan?.peopleToContact || [])
  const [professionalContacts, setProfessionalContacts] = useState<
    { name: string; phone: string; type: string }[]
  >(safetyPlan?.professionalContacts || [])
  const [environmentSafety, setEnvironmentSafety] = useState<string[]>(
    safetyPlan?.environmentSafety || []
  )
  const [reasonsToLive, setReasonsToLive] = useState<string[]>(safetyPlan?.reasonsToLive || [])
  const [personalStatement, setPersonalStatement] = useState(safetyPlan?.personalStatement || '')

  const handleSave = async () => {
    const plan: SafetyPlan = {
      id: safetyPlan?.id || generateId(),
      createdAt: safetyPlan?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      warningSigns,
      copingStrategies,
      socialDistractions,
      peopleToContact,
      professionalContacts,
      environmentSafety,
      reasonsToLive,
      personalStatement: personalStatement.trim() || undefined,
    }

    await saveSafetyPlan(plan)
    toast.success('Safety plan saved')
  }

  const isComplete =
    warningSigns.length > 0 &&
    copingStrategies.length > 0 &&
    (socialDistractions.length > 0 || peopleToContact.length > 0) &&
    professionalContacts.length > 0

  // Get guidance for each step
  const getGuidance = (step: number) => {
    return SAFETY_PLAN_GUIDANCE.find((g) => g.step === step)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setView('toolkit')}
          className="text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 flex items-center gap-1"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      <PageIntro
        title="Safety plan"
        description="The Stanley-Brown Safety Planning Intervention has been shown to reduce suicidal behavior by 45% in clinical trials. This plan helps you prepare for crisis moments by identifying warning signs, coping strategies, and support contacts."
        centered={false}
      />

      <div className="card p-4 mb-6 border-2 border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20">
        <div className="flex items-start gap-3">
          <span className="text-xl">📞</span>
          <div>
            <h3 className="font-medium text-stone-800 dark:text-stone-200 mb-2">
              Crisis resources
            </h3>
            <div className="text-sm text-stone-600 dark:text-stone-400 space-y-1.5">
              {CRISIS_RESOURCES.map((resource) => (
                <div key={resource.country} className="flex items-start gap-2">
                  <span className="flex-shrink-0">{resource.flag}</span>
                  <div>
                    <a
                      href={`tel:${resource.number.replace(/\s/g, '')}`}
                      className="text-sage-600 dark:text-sage-400 font-medium"
                    >
                      {resource.number}
                    </a>
                    <span className="text-stone-500 dark:text-stone-400"> ({resource.name})</span>
                    {resource.description && (
                      <span className="text-stone-400 dark:text-stone-500 text-xs block">
                        {resource.description}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <section className="card p-5">
          <h2 className="font-medium text-stone-800 dark:text-stone-200 mb-1 flex items-center gap-2">
            <span className="text-sage-600 dark:text-sage-400">1.</span>
            Warning signs
            <InfoButton
              title={getGuidance(1)?.title || 'Warning signs'}
              content={getGuidance(1)?.description || ''}
            />
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">
            What thoughts, feelings, or situations signal that a crisis may be developing?
          </p>
          <ListInput
            items={warningSigns}
            onChange={setWarningSigns}
            placeholder="e.g., Feeling hopeless, isolating myself, not sleeping"
            addLabel="Add"
            examples={getGuidance(1)?.examples}
          />
        </section>

        <section className="card p-5">
          <h2 className="font-medium text-stone-800 dark:text-stone-200 mb-1 flex items-center gap-2">
            <span className="text-sage-600 dark:text-sage-400">2.</span>
            Internal coping strategies
            <InfoButton
              title={getGuidance(2)?.title || 'Coping strategies'}
              content={getGuidance(2)?.description || ''}
            />
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">
            Things you can do on your own to distract or soothe yourself.
          </p>
          <ListInput
            items={copingStrategies}
            onChange={setCopingStrategies}
            placeholder="e.g., Take a cold shower, go for a walk, do breathing exercises"
            addLabel="Add"
            examples={getGuidance(2)?.examples}
          />
        </section>

        <section className="card p-5">
          <h2 className="font-medium text-stone-800 dark:text-stone-200 mb-1 flex items-center gap-2">
            <span className="text-sage-600 dark:text-sage-400">3.</span>
            Social distractions
            <InfoButton
              title={getGuidance(3)?.title || 'Social distractions'}
              content={getGuidance(3)?.description || ''}
            />
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">
            People and places that can provide healthy distraction.
          </p>
          <ContactInput
            contacts={socialDistractions}
            onChange={setSocialDistractions}
            fields={['contact']}
          />
        </section>

        <section className="card p-5">
          <h2 className="font-medium text-stone-800 dark:text-stone-200 mb-1 flex items-center gap-2">
            <span className="text-sage-600 dark:text-sage-400">4.</span>
            People I can ask for help
            <InfoButton
              title={getGuidance(4)?.title || 'Support network'}
              content={getGuidance(4)?.description || ''}
            />
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">
            Trusted people you can contact for support during a crisis.
          </p>
          <ContactInput
            contacts={peopleToContact}
            onChange={setPeopleToContact}
            fields={['phone', 'relationship']}
          />
        </section>

        <section className="card p-5">
          <h2 className="font-medium text-stone-800 dark:text-stone-200 mb-1 flex items-center gap-2">
            <span className="text-sage-600 dark:text-sage-400">5.</span>
            Professional contacts
            <InfoButton
              title={getGuidance(5)?.title || 'Professional help'}
              content={getGuidance(5)?.description || ''}
            />
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">
            Therapists, doctors, and crisis services you can contact.
          </p>
          <ContactInput
            contacts={professionalContacts}
            onChange={(contacts) =>
              setProfessionalContacts(contacts as { name: string; phone: string; type: string }[])
            }
            fields={['phone', 'type']}
          />
        </section>

        <section className="card p-5">
          <h2 className="font-medium text-stone-800 dark:text-stone-200 mb-1 flex items-center gap-2">
            <span className="text-sage-600 dark:text-sage-400">6.</span>
            Making my environment safe
            <InfoButton
              title={getGuidance(6)?.title || 'Environment safety'}
              content={getGuidance(6)?.description || ''}
            />
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">
            Steps to reduce access to things you could use to hurt yourself.
          </p>
          <ListInput
            items={environmentSafety}
            onChange={setEnvironmentSafety}
            placeholder="e.g., Give medications to a friend, lock away sharp objects"
            addLabel="Add"
            examples={getGuidance(6)?.examples}
          />
        </section>

        <section className="card p-5">
          <h2 className="font-medium text-stone-800 dark:text-stone-200 mb-1 flex items-center gap-2">
            <span className="text-sage-600 dark:text-sage-400">7.</span>
            Reasons to live
            <InfoButton
              title={getGuidance(7)?.title || 'Reasons to live'}
              content={getGuidance(7)?.description || ''}
            />
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">
            What's worth living for, even when things feel hopeless?
          </p>
          <ListInput
            items={reasonsToLive}
            onChange={setReasonsToLive}
            placeholder="e.g., My dog needs me, I want to see my niece grow up"
            addLabel="Add"
            examples={getGuidance(7)?.examples}
          />
        </section>

        <section className="card p-5">
          <h2 className="font-medium text-stone-800 dark:text-stone-200 mb-1">
            Personal statement (optional)
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">
            A message from your better self to read during hard times. This could be words of
            encouragement, reminders of what matters, or instructions for what to do.
          </p>
          <AutoExpandTextarea
            value={personalStatement}
            onChange={(e) => setPersonalStatement(e.target.value)}
            minRows={3}
            maxRows={8}
            placeholder="Write something to yourself that you can read when you're struggling..."
          />

          {!personalStatement && (
            <div className="mt-3 p-3 bg-stone-50 dark:bg-stone-700/50 rounded-lg">
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">
                Ideas for what to write:
              </p>
              <ul className="text-xs text-stone-600 dark:text-stone-300 space-y-1">
                <li>• Remind yourself that crises are temporary</li>
                <li>• List specific things you're grateful for</li>
                <li>• Write what you would say to a friend in your situation</li>
                <li>• Include a phrase or quote that gives you strength</li>
              </ul>
            </div>
          )}
        </section>

        {!isComplete && (
          <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl text-sm text-stone-600 dark:text-stone-400">
            <strong>Tip:</strong> A complete safety plan includes at least one item in each section.
            Consider working on this with your therapist or a trusted person.
          </div>
        )}

        <div className="space-y-3">
          <button onClick={handleSave} className="btn-primary w-full">
            Save safety plan
          </button>

          <p className="text-xs text-center text-stone-400 dark:text-stone-500">
            Your safety plan is stored locally on your device. Consider sharing a copy with someone
            you trust.
          </p>
        </div>
      </div>
    </div>
  )
}
