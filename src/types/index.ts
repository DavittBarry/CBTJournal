export const COGNITIVE_DISTORTIONS = [
  {
    id: 1,
    name: 'All-or-nothing thinking',
    shortName: 'All-or-nothing',
    description: 'You see things in black-and-white categories. If your performance falls short of perfect, you see yourself as a total failure.'
  },
  {
    id: 2,
    name: 'Overgeneralization',
    shortName: 'Overgeneralization',
    description: 'You see a single negative event as a never-ending pattern of defeat.'
  },
  {
    id: 3,
    name: 'Mental filter',
    shortName: 'Mental filter',
    description: 'You pick out a single negative detail and dwell on it exclusively so that your vision of all reality becomes darkened.'
  },
  {
    id: 4,
    name: 'Disqualifying the positive',
    shortName: 'Disqualifying positive',
    description: "You reject positive experiences by insisting they 'don't count' for some reason or other."
  },
  {
    id: 5,
    name: 'Jumping to conclusions',
    shortName: 'Jumping to conclusions',
    description: 'You make a negative interpretation even though there are no definite facts that convincingly support your conclusion.'
  },
  {
    id: 6,
    name: 'Magnification or minimization',
    shortName: 'Magnification/minimization',
    description: "You exaggerate the importance of things or inappropriately shrink things until they appear tiny."
  },
  {
    id: 7,
    name: 'Emotional reasoning',
    shortName: 'Emotional reasoning',
    description: "You assume that your negative emotions necessarily reflect the way things really are: 'I feel it, therefore it must be true.'"
  },
  {
    id: 8,
    name: 'Should statements',
    shortName: 'Should statements',
    description: "You try to motivate yourself with shoulds and shouldn'ts, as if you had to be whipped and punished before you could be expected to do anything."
  },
  {
    id: 9,
    name: 'Labeling and mislabeling',
    shortName: 'Labeling',
    description: "Instead of describing your error, you attach a negative label to yourself: 'I'm a loser.'"
  },
  {
    id: 10,
    name: 'Personalization',
    shortName: 'Personalization',
    description: 'You see yourself as the cause of some negative external event which in fact you were not primarily responsible for.'
  }
] as const

export type CognitiveDistortionId = typeof COGNITIVE_DISTORTIONS[number]['id']

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

export const DEPRESSION_ITEMS: { key: keyof DepressionScores; label: string; category: string }[] = [
  { key: 'feelingSad', label: 'Feeling sad or down in the dumps', category: 'Thoughts and Feelings' },
  { key: 'feelingUnhappy', label: 'Feeling unhappy or blue', category: 'Thoughts and Feelings' },
  { key: 'cryingSpells', label: 'Crying spells or tearfulness', category: 'Thoughts and Feelings' },
  { key: 'feelingDiscouraged', label: 'Feeling discouraged', category: 'Thoughts and Feelings' },
  { key: 'feelingHopeless', label: 'Feeling hopeless', category: 'Thoughts and Feelings' },
  { key: 'lowSelfEsteem', label: 'Low self-esteem', category: 'Thoughts and Feelings' },
  { key: 'feelingWorthless', label: 'Feeling worthless or inadequate', category: 'Thoughts and Feelings' },
  { key: 'guiltOrShame', label: 'Guilt or shame', category: 'Thoughts and Feelings' },
  { key: 'selfCriticism', label: 'Criticizing yourself or blaming yourself', category: 'Thoughts and Feelings' },
  { key: 'difficultyDecisions', label: 'Difficulty making decisions', category: 'Thoughts and Feelings' },
  { key: 'lossOfInterestPeople', label: 'Loss of interest in family, friends or colleagues', category: 'Activities and Personal Relationships' },
  { key: 'loneliness', label: 'Loneliness', category: 'Activities and Personal Relationships' },
  { key: 'lessTimeSocial', label: 'Spending less time with family or friends', category: 'Activities and Personal Relationships' },
  { key: 'lossOfMotivation', label: 'Loss of motivation', category: 'Activities and Personal Relationships' },
  { key: 'lossOfInterestWork', label: 'Loss of interest in work or other activities', category: 'Activities and Personal Relationships' },
  { key: 'avoidingWork', label: 'Avoiding work or other activities', category: 'Activities and Personal Relationships' },
  { key: 'lossOfPleasure', label: 'Loss of pleasure or satisfaction in life', category: 'Activities and Personal Relationships' },
  { key: 'lossOfSexDrive', label: 'Decreased or loss of sex drive', category: 'Physical Symptoms' },
  { key: 'poorAppetite', label: 'Poor appetite or decreased eating', category: 'Physical Symptoms' },
  { key: 'overeating', label: 'Increased appetite or overeating', category: 'Physical Symptoms' },
  { key: 'sleepProblems', label: 'Sleep problems (too much or too little)', category: 'Physical Symptoms' },
  { key: 'fatigue', label: 'Feeling tired or fatigued', category: 'Physical Symptoms' },
  { key: 'concernsHealth', label: 'Concerns about health', category: 'Physical Symptoms' },
  { key: 'suicidalThoughts', label: 'Suicidal thoughts or urges', category: 'Suicidal Urges' },
  { key: 'wishingDead', label: 'Wishing you were dead', category: 'Suicidal Urges' }
]

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
