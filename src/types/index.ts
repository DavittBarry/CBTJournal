export const COGNITIVE_DISTORTIONS = [
  {
    id: 1,
    name: 'All-or-nothing thinking',
    shortName: 'All-or-nothing',
    description:
      'You see things in black-and-white categories. If your performance falls short of perfect, you see yourself as a total failure. Also called "black and white thinking" or "splitting".',
    example: '"I made one mistake, so I\'m a complete failure."',
  },
  {
    id: 2,
    name: 'Overgeneralization',
    shortName: 'Overgeneralization',
    description:
      'You see a single negative event as a never-ending pattern of defeat. Watch for words like "always," "never," "everyone," "no one."',
    example: '"This always happens to me. I never get anything right."',
  },
  {
    id: 3,
    name: 'Mental filter',
    shortName: 'Mental filter',
    description:
      'You pick out a single negative detail and dwell on it exclusively so that your vision of all reality becomes darkened, like a drop of ink discoloring a glass of water.',
    example: 'Focusing on one critical comment while ignoring ten compliments.',
  },
  {
    id: 4,
    name: 'Disqualifying the positive',
    shortName: 'Disqualifying positive',
    description:
      "You reject positive experiences by insisting they 'don't count' for some reason. This maintains negative beliefs even when contradicted by everyday experiences.",
    example: '"They\'re just being nice" or "That doesn\'t count because..."',
  },
  {
    id: 5,
    name: 'Jumping to conclusions',
    shortName: 'Jumping to conclusions',
    description:
      'You make negative interpretations without facts to support them. Includes mind reading (assuming you know what others think) and fortune telling (predicting things will turn out badly).',
    example: '"She didn\'t text back, so she must be angry at me."',
  },
  {
    id: 6,
    name: 'Magnification or minimization',
    shortName: 'Magnification/minimization',
    description:
      "You exaggerate the importance of problems or shortcomings, or minimize the importance of your positive qualities. Also called 'catastrophizing' when you expect the worst possible outcome.",
    example: 'Treating a minor setback as a catastrophe, or dismissing a major achievement.',
  },
  {
    id: 7,
    name: 'Emotional reasoning',
    shortName: 'Emotional reasoning',
    description:
      "You assume that your negative emotions necessarily reflect the way things really are: 'I feel it, therefore it must be true.' Emotions are valid, but they don't always reflect reality.",
    example: '"I feel worthless, therefore I am worthless."',
  },
  {
    id: 8,
    name: 'Should statements',
    shortName: 'Should statements',
    description:
      "You try to motivate yourself with 'shoulds,' 'musts,' and 'oughts.' When directed at yourself, they cause guilt; when directed at others, they cause frustration and resentment.",
    example: '"I should be further along by now. They ought to know better."',
  },
  {
    id: 9,
    name: 'Labeling and mislabeling',
    shortName: 'Labeling',
    description:
      'Instead of describing a specific behavior, you attach a global, negative label to yourself or others. This is an extreme form of overgeneralization that defines identity by a single action.',
    example: '"I\'m a loser" instead of "I made a mistake."',
  },
  {
    id: 10,
    name: 'Personalization',
    shortName: 'Personalization',
    description:
      'You see yourself as the cause of some negative external event which you were not primarily responsible for. You take excessive responsibility for things outside your control.',
    example: '"My friend seems upset. I must have done something wrong."',
  },
] as const

export type CognitiveDistortionId = (typeof COGNITIVE_DISTORTIONS)[number]['id']

export interface ThoughtRecord {
  id: string
  createdAt: string
  date: string
  situation: string
  emotions: Emotion[]
  automaticThoughts: string
  distortions: CognitiveDistortionId[]
  rationalResponse: string
  outcomeEmotions: Emotion[]
  isBehavioralExperiment?: boolean
  experimentPrediction?: string
  experimentOutcome?: string
  defusionTechnique?: string
}

export interface GratitudeEntry {
  id: string
  createdAt: string
  date: string
  entries: string[]
}

export interface Emotion {
  name: string
  intensity: number
}

export const PHQ9_ITEMS = [
  { key: 'interest', label: 'Little interest or pleasure in doing things' },
  { key: 'depressed', label: 'Feeling down, depressed, or hopeless' },
  { key: 'sleep', label: 'Trouble falling or staying asleep, or sleeping too much' },
  { key: 'energy', label: 'Feeling tired or having little energy' },
  { key: 'appetite', label: 'Poor appetite or overeating' },
  {
    key: 'selfEsteem',
    label:
      'Feeling bad about yourself, or that you are a failure, or have let yourself or your family down',
  },
  {
    key: 'concentration',
    label: 'Trouble concentrating on things, such as reading or watching TV',
  },
  {
    key: 'movement',
    label:
      'Moving or speaking so slowly that other people noticed. Or being so restless that you have been moving around a lot more than usual',
  },
  { key: 'suicidal', label: 'Thoughts that you would be better off dead, or of hurting yourself' },
] as const

export type PHQ9Key = (typeof PHQ9_ITEMS)[number]['key']

export interface PHQ9Scores {
  interest: number
  depressed: number
  sleep: number
  energy: number
  appetite: number
  selfEsteem: number
  concentration: number
  movement: number
  suicidal: number
}

export const GAD7_ITEMS = [
  { key: 'anxious', label: 'Feeling nervous, anxious, or on edge' },
  { key: 'worrying', label: 'Not being able to stop or control worrying' },
  { key: 'worryingTooMuch', label: 'Worrying too much about different things' },
  { key: 'relaxing', label: 'Trouble relaxing' },
  { key: 'restless', label: 'Being so restless that it is hard to sit still' },
  { key: 'irritable', label: 'Becoming easily annoyed or irritable' },
  { key: 'afraid', label: 'Feeling afraid, as if something awful might happen' },
] as const

export type GAD7Key = (typeof GAD7_ITEMS)[number]['key']

export interface GAD7Scores {
  anxious: number
  worrying: number
  worryingTooMuch: number
  relaxing: number
  restless: number
  irritable: number
  afraid: number
}

export interface MoodCheckEntry {
  id: string
  date: string
  createdAt: string
  type: 'phq9' | 'gad7' | 'quick'
  phq9Scores?: PHQ9Scores
  gad7Scores?: GAD7Scores
  quickMood?: number
  quickAnxiety?: number
  notes?: string
}

/**
 * Get the depression severity level based on PHQ-9 score.
 * @param score - Total PHQ-9 score (0-27)
 * @returns Object containing level, severity, color class, and clinical recommendation
 * @see https://www.phqscreeners.com/
 */
export function getPHQ9Level(score: number): {
  level: string
  severity: string
  color: string
  recommendation: string
} {
  if (score <= 4)
    return {
      level: 'Minimal',
      severity: 'none-minimal',
      color: 'text-green-500',
      recommendation: 'No treatment typically needed. Continue monitoring.',
    }
  if (score <= 9)
    return {
      level: 'Mild',
      severity: 'mild',
      color: 'text-yellow-500',
      recommendation:
        'Watchful waiting. Repeat assessment in 2 weeks. Self-help strategies recommended.',
    }
  if (score <= 14)
    return {
      level: 'Moderate',
      severity: 'moderate',
      color: 'text-orange-500',
      recommendation: 'Consider counseling or therapy. Discuss options with a healthcare provider.',
    }
  if (score <= 19)
    return {
      level: 'Moderately severe',
      severity: 'moderately-severe',
      color: 'text-orange-600',
      recommendation: 'Active treatment recommended. Therapy and/or medication often helpful.',
    }
  return {
    level: 'Severe',
    severity: 'severe',
    color: 'text-red-500',
    recommendation:
      'Immediate treatment recommended. Please reach out to a mental health professional.',
  }
}

/**
 * Get the anxiety severity level based on GAD-7 score.
 * @param score - Total GAD-7 score (0-21)
 * @returns Object containing level, severity, color class, and clinical recommendation
 * @see https://www.phqscreeners.com/
 */
export function getGAD7Level(score: number): {
  level: string
  severity: string
  color: string
  recommendation: string
} {
  if (score <= 4)
    return {
      level: 'Minimal',
      severity: 'none-minimal',
      color: 'text-green-500',
      recommendation: 'No treatment typically needed. Continue monitoring.',
    }
  if (score <= 9)
    return {
      level: 'Mild',
      severity: 'mild',
      color: 'text-yellow-500',
      recommendation: 'Watchful waiting. Self-help strategies and stress management recommended.',
    }
  if (score <= 14)
    return {
      level: 'Moderate',
      severity: 'moderate',
      color: 'text-orange-500',
      recommendation: 'Consider counseling or therapy. Discuss options with a healthcare provider.',
    }
  return {
    level: 'Severe',
    severity: 'severe',
    color: 'text-red-500',
    recommendation:
      'Active treatment recommended. Please reach out to a mental health professional.',
  }
}

export interface ActivityEntry {
  id: string
  date: string
  createdAt: string
  activity: string
  category: ActivityCategory
  plannedTime?: string
  completedTime?: string
  duration?: number
  moodBefore?: number
  moodAfter?: number
  pleasureRating?: number
  masteryRating?: number
  notes?: string
  isPlanned: boolean
  isCompleted: boolean
  linkedValue?: string
}

export type ActivityCategory =
  | 'self-care'
  | 'social'
  | 'physical'
  | 'productive'
  | 'leisure'
  | 'creative'
  | 'mindfulness'
  | 'other'

export const ACTIVITY_CATEGORIES: {
  id: ActivityCategory
  label: string
  icon: string
  examples: string
}[] = [
  {
    id: 'self-care',
    label: 'Self-care',
    icon: '🛁',
    examples: 'Showering, skincare, healthy meals, rest',
  },
  {
    id: 'social',
    label: 'Social',
    icon: '👥',
    examples: 'Calling a friend, meeting someone, texting',
  },
  {
    id: 'physical',
    label: 'Physical',
    icon: '🏃',
    examples: 'Walking, exercise, sports, stretching',
  },
  {
    id: 'productive',
    label: 'Productive',
    icon: '✅',
    examples: 'Work tasks, chores, errands, organizing',
  },
  {
    id: 'leisure',
    label: 'Leisure',
    icon: '🎮',
    examples: 'Reading, gaming, watching shows, hobbies',
  },
  { id: 'creative', label: 'Creative', icon: '🎨', examples: 'Music, art, writing, crafts' },
  {
    id: 'mindfulness',
    label: 'Mindfulness',
    icon: '🧘',
    examples: 'Meditation, breathing exercises, journaling',
  },
  { id: 'other', label: 'Other', icon: '📝', examples: "Anything that doesn't fit above" },
]

export interface SafetyPlan {
  id: string
  createdAt: string
  updatedAt: string
  warningSigns: string[]
  copingStrategies: string[]
  socialDistractions: { name: string; contact?: string }[]
  peopleToContact: { name: string; phone?: string; relationship?: string }[]
  professionalContacts: { name: string; phone: string; type: string }[]
  environmentSafety: string[]
  reasonsToLive: string[]
  personalStatement?: string
}

export const COPING_SKILLS = {
  tipp: {
    name: 'TIPP Skills',
    description: 'Fast-acting techniques for intense emotions',
    skills: [
      {
        id: 'temperature',
        name: 'Temperature',
        description: 'Use cold to activate the dive reflex and calm your nervous system',
        instructions: [
          'Hold ice cubes in your hands',
          'Splash cold water on your face',
          'Take a cold shower',
          'Hold a cold pack on your face or neck',
        ],
        duration: '30 seconds to 2 minutes',
      },
      {
        id: 'intense-exercise',
        name: 'Intense exercise',
        description: 'Brief intense movement to burn off stress hormones',
        instructions: [
          'Do jumping jacks',
          'Run in place',
          'Do burpees or push-ups',
          'Sprint for 1-2 minutes',
        ],
        duration: '5-10 minutes',
      },
      {
        id: 'paced-breathing',
        name: 'Paced breathing',
        description: 'Slow down your breathing to activate the parasympathetic nervous system',
        instructions: [
          'Breathe in for 4 counts',
          'Hold for 4 counts (or skip if uncomfortable)',
          'Breathe out for 6-8 counts',
          'Make your exhale longer than your inhale',
        ],
        duration: '2-5 minutes',
      },
      {
        id: 'paired-relaxation',
        name: 'Paired muscle relaxation',
        description: 'Tense and release muscle groups while breathing',
        instructions: [
          'Tense a muscle group while breathing in',
          'Notice the tension for 5 seconds',
          'Release while breathing out slowly',
          'Notice the relaxation',
          'Move through different muscle groups',
        ],
        duration: '5-15 minutes',
      },
    ],
  },
  grounding: {
    name: 'Grounding techniques',
    description: 'Bring yourself back to the present moment',
    skills: [
      {
        id: '54321',
        name: '5-4-3-2-1 technique',
        description: 'Use your senses to anchor to the present',
        instructions: [
          'Notice 5 things you can SEE',
          'Notice 4 things you can TOUCH',
          'Notice 3 things you can HEAR',
          'Notice 2 things you can SMELL',
          'Notice 1 thing you can TASTE',
        ],
        duration: '2-5 minutes',
      },
      {
        id: 'body-scan',
        name: 'Body scan',
        description: 'Systematically notice sensations throughout your body',
        instructions: [
          'Start at the top of your head',
          'Slowly move your attention down through your body',
          'Notice any sensations without judging them',
          'End at your feet',
          'Take a breath and notice your whole body',
        ],
        duration: '5-15 minutes',
      },
      {
        id: 'feet-on-floor',
        name: 'Feet on the floor',
        description: 'A quick grounding technique for any situation',
        instructions: [
          'Feel your feet firmly on the ground',
          'Press down slightly to feel the floor',
          'Notice the sensations in your feet',
          'Imagine roots growing from your feet into the ground',
        ],
        duration: '30 seconds to 2 minutes',
      },
    ],
  },
  defusion: {
    name: 'Cognitive defusion',
    description: 'Create distance from unhelpful thoughts',
    skills: [
      {
        id: 'leaves-stream',
        name: 'Leaves on a stream',
        description: 'Visualize thoughts floating away',
        instructions: [
          'Imagine sitting beside a gently flowing stream',
          'Leaves are floating on the surface',
          'When a thought comes, place it on a leaf',
          'Watch it float downstream',
          "Don't try to speed it up or slow it down",
          'If you get distracted, gently return to the stream',
        ],
        duration: '5-10 minutes',
      },
      {
        id: 'thank-mind',
        name: 'Thank your mind',
        description: 'Acknowledge thoughts without buying into them',
        instructions: [
          'When you notice an unhelpful thought, say:',
          '"Thanks mind, but I\'ve got this"',
          'Or: "Thanks for trying to protect me"',
          'Then return your attention to what matters',
        ],
        duration: 'Momentary',
      },
      {
        id: 'having-thought',
        name: '"I\'m having the thought that..."',
        description: 'Add distance by labeling thoughts as thoughts',
        instructions: [
          'Notice the thought',
          'Restate it as: "I\'m having the thought that..."',
          'Then: "I notice I\'m having the thought that..."',
          'Notice any shift in how the thought feels',
        ],
        duration: 'Momentary',
      },
      {
        id: 'silly-voice',
        name: 'Silly voice',
        description: 'Say the thought in a funny voice to reduce its power',
        instructions: [
          'Identify a distressing thought',
          'Say it out loud in a silly voice',
          'Try a cartoon character voice',
          'Or sing it to a familiar tune',
          "Notice how this changes the thought's impact",
        ],
        duration: '1-2 minutes',
      },
    ],
  },
  breathing: {
    name: 'Breathing exercises',
    description: 'Regulate your nervous system through breath',
    skills: [
      {
        id: 'box-breathing',
        name: 'Box breathing',
        description: 'A structured breathing pattern used by Navy SEALs',
        instructions: [
          'Breathe IN for 4 counts',
          'HOLD for 4 counts',
          'Breathe OUT for 4 counts',
          'HOLD for 4 counts',
          'Repeat for several rounds',
        ],
        duration: '3-5 minutes',
      },
      {
        id: '3min-breathing',
        name: '3-minute breathing space (MBCT)',
        description: 'A mini-meditation from Mindfulness-Based Cognitive Therapy',
        instructions: [
          "MINUTE 1: Awareness - Notice what's happening right now. What thoughts, feelings, sensations are present?",
          'MINUTE 2: Gathering - Focus attention on your breath. Feel each inhale and exhale.',
          'MINUTE 3: Expanding - Widen awareness to include your whole body. Carry this awareness with you.',
        ],
        duration: '3 minutes',
      },
      {
        id: 'physiological-sigh',
        name: 'Physiological sigh',
        description: 'The fastest way to calm down according to neuroscience',
        instructions: [
          'Take a deep breath in through your nose',
          'At the top, take a second small breath in',
          'Then exhale slowly through your mouth',
          'One cycle is often enough; repeat if needed',
        ],
        duration: '30 seconds',
      },
    ],
  },
} as const

export type CopingCategory = keyof typeof COPING_SKILLS

export interface CopingSkillLog {
  id: string
  date: string
  createdAt: string
  category: CopingCategory
  skillId: string
  distressBefore: number
  distressAfter: number
  notes?: string
  helpful: boolean
}

export interface ValueArea {
  id: string
  name: string
  importance: number
  currentAlignment: number
  goals: string[]
}

export const VALUE_DOMAINS = [
  {
    id: 'relationships',
    name: 'Family & relationships',
    description: 'Connections with loved ones, friends, community',
  },
  {
    id: 'work',
    name: 'Work & career',
    description: 'Professional life, achievements, contribution',
  },
  {
    id: 'health',
    name: 'Health & wellbeing',
    description: 'Physical and mental health, self-care',
  },
  { id: 'growth', name: 'Personal growth', description: 'Learning, self-improvement, development' },
  { id: 'leisure', name: 'Leisure & fun', description: 'Hobbies, relaxation, enjoyment' },
  {
    id: 'spirituality',
    name: 'Spirituality & meaning',
    description: 'Purpose, beliefs, connection to something larger',
  },
  {
    id: 'creativity',
    name: 'Creativity & expression',
    description: 'Art, music, writing, creative pursuits',
  },
  {
    id: 'community',
    name: 'Community & citizenship',
    description: 'Contributing to society, volunteering, activism',
  },
] as const

export interface DepressionChecklistEntry {
  id: string
  date: string
  scores: DepressionScores
  total: number
}

export interface DepressionScores {
  feelingSad: number
  feelingUnhappy: number
  cryingSpells: number
  feelingDiscouraged: number
  feelingHopeless: number
  lowSelfEsteem: number
  feelingWorthless: number
  guiltOrShame: number
  selfCriticism: number
  difficultyDecisions: number
  lossOfInterestPeople: number
  loneliness: number
  lessTimeSocial: number
  lossOfMotivation: number
  lossOfInterestWork: number
  avoidingWork: number
  lossOfPleasure: number
  lossOfSexDrive: number
  poorAppetite: number
  overeating: number
  sleepProblems: number
  fatigue: number
  concernsHealth: number
  suicidalThoughts: number
  wishingDead: number
}

export const DEPRESSION_ITEMS: { key: keyof DepressionScores; label: string; category: string }[] =
  [
    {
      key: 'feelingSad',
      label: 'Feeling sad or down in the dumps',
      category: 'Thoughts and Feelings',
    },
    { key: 'feelingUnhappy', label: 'Feeling unhappy or blue', category: 'Thoughts and Feelings' },
    {
      key: 'cryingSpells',
      label: 'Crying spells or tearfulness',
      category: 'Thoughts and Feelings',
    },
    { key: 'feelingDiscouraged', label: 'Feeling discouraged', category: 'Thoughts and Feelings' },
    { key: 'feelingHopeless', label: 'Feeling hopeless', category: 'Thoughts and Feelings' },
    { key: 'lowSelfEsteem', label: 'Low self-esteem', category: 'Thoughts and Feelings' },
    {
      key: 'feelingWorthless',
      label: 'Feeling worthless or inadequate',
      category: 'Thoughts and Feelings',
    },
    { key: 'guiltOrShame', label: 'Guilt or shame', category: 'Thoughts and Feelings' },
    {
      key: 'selfCriticism',
      label: 'Criticizing yourself or blaming yourself',
      category: 'Thoughts and Feelings',
    },
    {
      key: 'difficultyDecisions',
      label: 'Difficulty making decisions',
      category: 'Thoughts and Feelings',
    },
    {
      key: 'lossOfInterestPeople',
      label: 'Loss of interest in family, friends or colleagues',
      category: 'Activities and Personal Relationships',
    },
    { key: 'loneliness', label: 'Loneliness', category: 'Activities and Personal Relationships' },
    {
      key: 'lessTimeSocial',
      label: 'Spending less time with family or friends',
      category: 'Activities and Personal Relationships',
    },
    {
      key: 'lossOfMotivation',
      label: 'Loss of motivation',
      category: 'Activities and Personal Relationships',
    },
    {
      key: 'lossOfInterestWork',
      label: 'Loss of interest in work or other activities',
      category: 'Activities and Personal Relationships',
    },
    {
      key: 'avoidingWork',
      label: 'Avoiding work or other activities',
      category: 'Activities and Personal Relationships',
    },
    {
      key: 'lossOfPleasure',
      label: 'Loss of pleasure or satisfaction in life',
      category: 'Activities and Personal Relationships',
    },
    {
      key: 'lossOfSexDrive',
      label: 'Decreased or loss of sex drive',
      category: 'Physical Symptoms',
    },
    {
      key: 'poorAppetite',
      label: 'Poor appetite or decreased eating',
      category: 'Physical Symptoms',
    },
    { key: 'overeating', label: 'Increased appetite or overeating', category: 'Physical Symptoms' },
    {
      key: 'sleepProblems',
      label: 'Sleep problems (too much or too little)',
      category: 'Physical Symptoms',
    },
    { key: 'fatigue', label: 'Feeling tired or fatigued', category: 'Physical Symptoms' },
    { key: 'concernsHealth', label: 'Concerns about health', category: 'Physical Symptoms' },
    { key: 'suicidalThoughts', label: 'Suicidal thoughts or urges', category: 'Suicidal Urges' },
    { key: 'wishingDead', label: 'Wishing you were dead', category: 'Suicidal Urges' },
  ]

/**
 * Get the depression severity level based on Burns Depression Checklist score.
 * @param score - Total Burns checklist score (0-100)
 * @returns Object containing level description and color class
 */
export function getDepressionLevel(score: number): { level: string; color: string } {
  if (score <= 5) return { level: 'No depression', color: 'text-green-500' }
  if (score <= 10) return { level: 'Normal but unhappy', color: 'text-green-400' }
  if (score <= 15) return { level: 'Mild depression', color: 'text-yellow-500' }
  if (score <= 20) return { level: 'Borderline depression', color: 'text-yellow-600' }
  if (score <= 25) return { level: 'Mild depression', color: 'text-orange-500' }
  if (score <= 50) return { level: 'Moderate depression', color: 'text-orange-600' }
  if (score <= 75) return { level: 'Severe depression', color: 'text-red-500' }
  return { level: 'Extreme depression', color: 'text-red-600' }
}

export const CRISIS_RESOURCES = {
  international: {
    name: 'International Association for Suicide Prevention',
    url: 'https://www.iasp.info/resources/Crisis_Centres/',
  },
  us: {
    name: '988 Suicide & Crisis Lifeline',
    phone: '988',
    text: 'Text HOME to 741741',
    url: 'https://988lifeline.org/',
  },
  uk: {
    name: 'Samaritans',
    phone: '116 123',
    url: 'https://www.samaritans.org/',
  },
  finland: {
    name: 'Mieli Mental Health Finland',
    phone: '09 2525 0111',
    url: 'https://mieli.fi/',
  },
  ireland: {
    name: 'Samaritans Ireland',
    phone: '116 123',
    url: 'https://www.samaritans.org/ireland/',
  },
}
