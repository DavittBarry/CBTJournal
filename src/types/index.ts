/**
 * CBTJournal - Types and Therapeutic Content
 *
 * Evidence-based content from:
 * - Cognitive Behavioral Therapy (Beck, Burns)
 * - Dialectical Behavior Therapy (Linehan)
 * - Acceptance and Commitment Therapy (Hayes)
 * - Mindfulness-Based Cognitive Therapy (Segal, Williams, Teasdale)
 * - Compassion-Focused Therapy (Gilbert)
 * - Polyvagal Theory (Porges)
 * - Emotion-Focused Therapy (Greenberg)
 */

// ============================================================================
// COGNITIVE DISTORTIONS (Enhanced with challenging questions)
// Based on Burns (1980), Beck (1979), and modern CBT research
// ============================================================================

export const COGNITIVE_DISTORTIONS = [
  {
    id: 1,
    name: 'All-or-nothing thinking',
    shortName: 'All-or-nothing',
    description:
      'You see things in black-and-white categories. If your performance falls short of perfect, you see yourself as a total failure. Also called "black and white thinking," "splitting," or "dichotomous thinking."',
    example: '"I made one mistake, so I\'m a complete failure."',
    challengingQuestions: [
      'Is there a middle ground between complete success and total failure?',
      'Would I judge a friend this harshly for the same situation?',
      'What percentage of the task did I actually complete successfully?',
      'Can something be "good enough" without being perfect?',
    ],
    reframingStrategy:
      'Look for shades of gray. Rate outcomes on a scale of 0-100 rather than pass/fail. Ask yourself what a compassionate mentor would say.',
    relatedEmotions: ['shame', 'disappointment', 'frustration'],
  },
  {
    id: 2,
    name: 'Overgeneralization',
    shortName: 'Overgeneralization',
    description:
      'You see a single negative event as a never-ending pattern of defeat. Watch for words like "always," "never," "everyone," "no one," "every time."',
    example: '"This always happens to me. I never get anything right."',
    challengingQuestions: [
      'Is this really "always" or "never," or has there been at least one exception?',
      'What evidence do I have that this is a pattern vs. a single event?',
      'Am I using absolute words like "always" or "never"?',
      'What would I say to a friend who made this same generalization?',
    ],
    reframingStrategy:
      'Replace absolute words with more accurate ones: "sometimes," "this time," "in this situation." Look for counter-examples.',
    relatedEmotions: ['hopelessness', 'helplessness', 'despair'],
  },
  {
    id: 3,
    name: 'Mental filter',
    shortName: 'Mental filter',
    description:
      'You pick out a single negative detail and dwell on it exclusively so that your vision of all reality becomes darkened, like a drop of ink discoloring a glass of water. Also called "selective abstraction."',
    example: 'Focusing on one critical comment while ignoring ten compliments.',
    challengingQuestions: [
      'Am I focusing on one negative detail while ignoring positives?',
      'If I listed all aspects of this situation, what percentage is actually negative?',
      'What would the full picture look like if I included everything?',
      'Why might I be drawn to focus on the negative?',
    ],
    reframingStrategy:
      'Deliberately write out all aspects of a situation, including positives. Practice gratitude to counterbalance the negativity bias.',
    relatedEmotions: ['sadness', 'disappointment', 'discouragement'],
  },
  {
    id: 4,
    name: 'Disqualifying the positive',
    shortName: 'Disqualifying positive',
    description:
      "You reject positive experiences by insisting they 'don't count' for some reason. This maintains negative beliefs even when contradicted by everyday experiences.",
    example:
      '"They\'re just being nice" or "That doesn\'t count because..." or "Anyone could have done that."',
    challengingQuestions: [
      "If a friend achieved this, would I tell them it doesn't count?",
      'What rule am I using to decide what "counts"?',
      'Is there a double standard in how I evaluate myself vs. others?',
      'What would have to happen for me to accept this as a genuine positive?',
    ],
    reframingStrategy:
      'Practice accepting compliments with a simple "thank you." Keep a log of positive events without dismissing them. Ask yourself: "What if this positive thing is actually true?"',
    relatedEmotions: ['unworthiness', 'imposter syndrome', 'self-doubt'],
  },
  {
    id: 5,
    name: 'Jumping to conclusions',
    shortName: 'Jumping to conclusions',
    description:
      'You make negative interpretations without facts to support them. Includes mind reading (assuming you know what others think) and fortune telling (predicting things will turn out badly).',
    example:
      '"She didn\'t text back, so she must be angry at me." or "I know this interview will go badly."',
    challengingQuestions: [
      'What actual evidence do I have for this conclusion?',
      "Are there other possible explanations I haven't considered?",
      'Have my predictions been accurate in the past?',
      'Am I confusing a possibility with a certainty?',
    ],
    reframingStrategy:
      'Treat your thought as a hypothesis to test, not a fact. List alternative explanations. Ask yourself what evidence would change your mind.',
    relatedEmotions: ['anxiety', 'fear', 'paranoia', 'dread'],
    subtypes: [
      {
        name: 'Mind reading',
        description: 'Assuming you know what others are thinking without evidence',
        example: '"They think I\'m stupid."',
      },
      {
        name: 'Fortune telling',
        description: 'Predicting negative outcomes as if they were certain',
        example: '"I\'ll definitely fail this exam."',
      },
    ],
  },
  {
    id: 6,
    name: 'Magnification or minimization',
    shortName: 'Magnification/minimization',
    description:
      "You exaggerate the importance of problems or shortcomings (magnification), or minimize the importance of your positive qualities (minimization). When you expect the worst possible outcome, it's called 'catastrophizing.'",
    example:
      'Treating a minor setback as a catastrophe, or dismissing a major achievement as "no big deal."',
    challengingQuestions: [
      'Am I blowing this out of proportion?',
      'How important will this be in 5 years? 1 year? 1 month?',
      'Am I giving my achievements the credit they deserve?',
      'What is the most realistic outcome, not the worst-case scenario?',
    ],
    reframingStrategy:
      'Use perspective-taking: "How would I view this if it happened to someone else?" Rate the actual severity on a 1-10 scale with clear anchors.',
    relatedEmotions: ['anxiety', 'panic', 'overwhelm', 'inadequacy'],
    subtypes: [
      {
        name: 'Catastrophizing',
        description: 'Expecting the worst possible outcome',
        example:
          '"If I make a mistake, I\'ll be fired, lose my house, and my life will be ruined."',
      },
      {
        name: 'Minimizing achievements',
        description: 'Downplaying your accomplishments or strengths',
        example: '"Anyone could have done that. It was nothing special."',
      },
    ],
  },
  {
    id: 7,
    name: 'Emotional reasoning',
    shortName: 'Emotional reasoning',
    description:
      "You assume that your negative emotions necessarily reflect the way things really are: 'I feel it, therefore it must be true.' Emotions are valid experiences, but they don't always accurately reflect external reality.",
    example:
      '"I feel worthless, therefore I am worthless." or "I feel anxious, so this situation must be dangerous."',
    challengingQuestions: [
      "Just because I feel this way, does it mean it's true?",
      'What objective evidence supports or contradicts this feeling?',
      'Have I felt this way before and been wrong?',
      'Would I accept this logic from someone else?',
    ],
    reframingStrategy:
      'Separate feelings from facts. Say: "I\'m having the feeling that..." rather than stating it as truth. Feelings are information, not instructions.',
    relatedEmotions: ['all emotions can trigger this pattern'],
  },
  {
    id: 8,
    name: 'Should statements',
    shortName: 'Should statements',
    description:
      "You try to motivate yourself with 'shoulds,' 'musts,' 'oughts,' and 'have tos.' When directed at yourself, they cause guilt and shame; when directed at others, they cause frustration and resentment. Albert Ellis called this 'musturbation.'",
    example:
      '"I should be further along by now." "They ought to know better." "I must not make mistakes."',
    challengingQuestions: [
      'Who made this rule? Is it flexible?',
      'What would happen if I replaced "should" with "prefer" or "would like"?',
      'Am I holding myself to an unrealistic standard?',
      'Is this a preference disguised as an absolute rule?',
    ],
    reframingStrategy:
      'Replace "should" with "I would prefer" or "It would be nice if." Accept that people (including yourself) are imperfect. Focus on what is rather than what should be.',
    relatedEmotions: ['guilt', 'shame', 'resentment', 'frustration', 'anger'],
  },
  {
    id: 9,
    name: 'Labeling and mislabeling',
    shortName: 'Labeling',
    description:
      'Instead of describing a specific behavior, you attach a global, negative label to yourself or others. This is an extreme form of overgeneralization that defines identity by a single action or trait.',
    example:
      '"I\'m a loser" instead of "I made a mistake." "He\'s a jerk" instead of "He was rude in that moment."',
    challengingQuestions: [
      'Am I defining myself/them by one behavior rather than seeing the whole person?',
      'Would I label a friend this way for the same behavior?',
      'Does this label capture the full complexity of the person?',
      'What evidence contradicts this label?',
    ],
    reframingStrategy:
      'Describe specific behaviors instead of using global labels. Use temporary language: "I acted foolishly" vs. "I am a fool." Remember that behavior ≠ identity.',
    relatedEmotions: ['shame', 'self-hatred', 'contempt', 'disgust'],
  },
  {
    id: 10,
    name: 'Personalization',
    shortName: 'Personalization',
    description:
      'You see yourself as the cause of some negative external event which you were not primarily responsible for. You take excessive responsibility for things outside your control.',
    example:
      '"My friend seems upset. I must have done something wrong." "The project failed because of me."',
    challengingQuestions: [
      'What percentage of this outcome was actually within my control?',
      'What other factors contributed to this situation?',
      "Am I taking responsibility for things I can't control?",
      'Would others agree that this was my fault?',
    ],
    reframingStrategy:
      'Make a realistic assessment of your contribution. Consider all factors involved. Use a pie chart to visualize the many causes of an outcome.',
    relatedEmotions: ['guilt', 'shame', 'anxiety', 'self-blame'],
  },
  {
    id: 11,
    name: 'Blaming',
    shortName: 'Blaming',
    description:
      'The opposite of personalization. You hold other people or circumstances entirely responsible for your emotional pain, ignoring ways you might contribute to or address the problem.',
    example:
      '"It\'s all their fault I feel this way." "I can\'t help it, that\'s just how I was raised."',
    challengingQuestions: [
      'What role, if any, did I play in this situation?',
      'Even if others contributed, what can I do now?',
      'Am I giving away my power to change things?',
      'What would taking responsibility look like here?',
    ],
    reframingStrategy:
      'Focus on what you can control. Accept that while others may have contributed, you have power over your response. Taking responsibility is empowering, not blaming.',
    relatedEmotions: ['anger', 'resentment', 'helplessness', 'victimhood'],
  },
  {
    id: 12,
    name: 'Fallacy of fairness',
    shortName: 'Fairness fallacy',
    description:
      "You feel resentful because you think you know what is fair, but others don't agree. You judge events by a standard of fairness that often doesn't exist objectively.",
    example: '"It\'s not fair that they got promoted and I didn\'t." "Life should be fair."',
    challengingQuestions: [
      'Who decides what\'s "fair" in this situation?',
      'Is my expectation of fairness realistic?',
      'How is my focus on fairness affecting my wellbeing?',
      'What would acceptance look like here?',
    ],
    reframingStrategy:
      'Accept that life is often not "fair" by our personal standards. Focus on what you can control. Consider that fairness is subjective and others may see it differently.',
    relatedEmotions: ['resentment', 'bitterness', 'envy', 'frustration'],
  },
  {
    id: 13,
    name: 'Fallacy of change',
    shortName: 'Change fallacy',
    description:
      'You expect that other people will change to suit you if you pressure them enough. Your happiness depends on others changing their behavior.',
    example: '"If only they would change, I could be happy." "I can fix them."',
    challengingQuestions: [
      'Can I really control whether another person changes?',
      'What if they never change - can I still find happiness?',
      "Am I making my wellbeing dependent on someone else's choices?",
      'What changes can I make within myself instead?',
    ],
    reframingStrategy:
      'Focus on what you can control: your own thoughts, feelings, and behaviors. Accept others as they are while setting healthy boundaries for yourself.',
    relatedEmotions: ['frustration', 'disappointment', 'helplessness'],
  },
  {
    id: 14,
    name: "Heaven's reward fallacy",
    shortName: 'Reward fallacy',
    description:
      "You expect that your sacrifice and self-denial will eventually pay off, and you feel bitter when the reward doesn't come.",
    example:
      '"I\'ve worked so hard, I deserve recognition." "After all I\'ve done for them, they should appreciate me."',
    challengingQuestions: [
      'Am I doing this expecting a specific reward?',
      'What if the reward never comes - was it still worth doing?',
      'Can I find meaning in the action itself, not just the outcome?',
      'Am I keeping score in relationships?',
    ],
    reframingStrategy:
      'Do things because they align with your values, not for expected rewards. Practice giving without attachment to receiving. Communicate your needs directly rather than expecting others to notice.',
    relatedEmotions: ['resentment', 'bitterness', 'disappointment', 'martyrdom'],
  },
] as const

export type CognitiveDistortionId = (typeof COGNITIVE_DISTORTIONS)[number]['id']

// ============================================================================
// EMOTION VOCABULARY
// Based on Plutchik's wheel, Gottman's research, and modern emotion science
// ============================================================================

export const EMOTION_CATEGORIES = {
  primary: {
    name: 'Primary emotions',
    description: 'Basic, universal emotions that evolved for survival',
    emotions: [
      {
        name: 'Joy',
        description: 'Feeling of happiness, pleasure, or contentment',
        physicalSensations: ['lightness', 'energy', 'warmth in chest', 'smiling'],
        relatedWords: ['happy', 'content', 'pleased', 'delighted', 'elated', 'cheerful', 'glad'],
        intensity: [
          { level: 'low', words: ['content', 'pleased', 'satisfied'] },
          { level: 'medium', words: ['happy', 'cheerful', 'joyful'] },
          { level: 'high', words: ['elated', 'ecstatic', 'euphoric', 'overjoyed'] },
        ],
        function: 'Signals safety, encourages social bonding and approach behaviors',
      },
      {
        name: 'Sadness',
        description: 'Feeling of loss, disappointment, or unhappiness',
        physicalSensations: ['heaviness', 'fatigue', 'tightness in throat', 'tears'],
        relatedWords: ['unhappy', 'down', 'blue', 'melancholy', 'grief', 'sorrow', 'dejected'],
        intensity: [
          { level: 'low', words: ['disappointed', 'down', 'blue'] },
          { level: 'medium', words: ['sad', 'unhappy', 'sorrowful'] },
          { level: 'high', words: ['devastated', 'grief-stricken', 'despairing', 'heartbroken'] },
        ],
        function: 'Signals loss, slows us down to process and heal, elicits support from others',
      },
      {
        name: 'Fear',
        description: 'Feeling of threat, danger, or anticipation of harm',
        physicalSensations: [
          'racing heart',
          'shallow breathing',
          'tension',
          'sweating',
          'alertness',
        ],
        relatedWords: [
          'scared',
          'anxious',
          'worried',
          'nervous',
          'terrified',
          'panicked',
          'uneasy',
        ],
        intensity: [
          { level: 'low', words: ['uneasy', 'nervous', 'apprehensive'] },
          { level: 'medium', words: ['afraid', 'scared', 'anxious'] },
          { level: 'high', words: ['terrified', 'panicked', 'petrified', 'horrified'] },
        ],
        function: 'Protects from danger, prepares body for fight-or-flight response',
      },
      {
        name: 'Anger',
        description: 'Feeling of frustration, injustice, or boundary violation',
        physicalSensations: ['heat', 'tension', 'clenched jaw/fists', 'increased heart rate'],
        relatedWords: ['annoyed', 'irritated', 'frustrated', 'furious', 'enraged', 'resentful'],
        intensity: [
          { level: 'low', words: ['annoyed', 'irritated', 'bothered'] },
          { level: 'medium', words: ['angry', 'frustrated', 'mad'] },
          { level: 'high', words: ['furious', 'enraged', 'livid', 'outraged'] },
        ],
        function: 'Protects boundaries, mobilizes energy to address threats or injustice',
      },
      {
        name: 'Disgust',
        description: 'Feeling of revulsion or strong disapproval',
        physicalSensations: ['nausea', 'turning away', 'wrinkling nose', 'bad taste'],
        relatedWords: ['revolted', 'repulsed', 'appalled', 'nauseated', 'offended'],
        intensity: [
          { level: 'low', words: ['distaste', 'dislike', 'turned off'] },
          { level: 'medium', words: ['disgusted', 'repulsed', 'revolted'] },
          { level: 'high', words: ['appalled', 'nauseated', 'sickened', 'horrified'] },
        ],
        function: 'Protects from contamination (physical and moral), enforces social norms',
      },
      {
        name: 'Surprise',
        description: 'Feeling of unexpectedness or astonishment',
        physicalSensations: ['widened eyes', 'raised eyebrows', 'gasp', 'stillness'],
        relatedWords: ['startled', 'amazed', 'astonished', 'shocked', 'stunned'],
        intensity: [
          { level: 'low', words: ['surprised', 'caught off guard'] },
          { level: 'medium', words: ['amazed', 'astonished'] },
          { level: 'high', words: ['shocked', 'stunned', 'flabbergasted'] },
        ],
        function: 'Orients attention to unexpected events, interrupts current processing',
      },
    ],
  },
  secondary: {
    name: 'Secondary emotions',
    description: 'Complex emotions that often combine primary emotions with thoughts',
    emotions: [
      {
        name: 'Shame',
        description: 'Feeling fundamentally flawed or unworthy as a person',
        physicalSensations: [
          'heat in face',
          'wanting to hide',
          'hunched posture',
          'avoiding eye contact',
        ],
        relatedWords: ['humiliated', 'mortified', 'embarrassed', 'disgraceful'],
        differenceFromGuilt: 'Shame is "I am bad" while guilt is "I did something bad"',
        function: 'Originally helped maintain social bonds; excessive shame is often harmful',
      },
      {
        name: 'Guilt',
        description: 'Feeling that you have done something wrong or failed to do something right',
        physicalSensations: ['heaviness', 'restlessness', 'tension in stomach'],
        relatedWords: ['remorseful', 'regretful', 'culpable', 'responsible'],
        differenceFromShame: 'Guilt focuses on behavior (I did bad), shame on self (I am bad)',
        function: 'Motivates repair of relationships and alignment with values',
      },
      {
        name: 'Envy',
        description: 'Wanting what someone else has',
        physicalSensations: ['tightness', 'restlessness', 'longing'],
        relatedWords: ['jealous', 'covetous', 'resentful'],
        function: 'Can motivate self-improvement, but also damages relationships if unchecked',
      },
      {
        name: 'Jealousy',
        description: 'Fear of losing something or someone you have to a rival',
        physicalSensations: ['tension', 'vigilance', 'anxiety', 'anger'],
        relatedWords: ['possessive', 'suspicious', 'threatened'],
        differenceFromEnvy: 'Jealousy involves three parties; envy involves two',
        function: 'Protects valued relationships, but can become controlling',
      },
      {
        name: 'Loneliness',
        description: 'Feeling disconnected, isolated, or lacking meaningful connection',
        physicalSensations: ['emptiness', 'aching', 'fatigue', 'heaviness'],
        relatedWords: ['isolated', 'disconnected', 'alone', 'abandoned'],
        function: 'Signals need for social connection, which is essential for wellbeing',
      },
      {
        name: 'Hope',
        description: 'Expectation and desire for something positive in the future',
        physicalSensations: ['lightness', 'openness', 'energy', 'forward orientation'],
        relatedWords: ['optimistic', 'hopeful', 'encouraged', 'expectant'],
        function: 'Motivates action toward goals, provides resilience during difficulties',
      },
      {
        name: 'Pride',
        description: 'Satisfaction from achievements or qualities',
        physicalSensations: ['expansiveness', 'upright posture', 'warmth'],
        relatedWords: ['proud', 'accomplished', 'confident', 'self-satisfied'],
        function: 'Reinforces achievement, builds self-esteem when healthy',
      },
      {
        name: 'Gratitude',
        description: 'Appreciation for what one has received',
        physicalSensations: ['warmth', 'openness', 'connection'],
        relatedWords: ['thankful', 'appreciative', 'blessed'],
        function: 'Strengthens relationships, improves wellbeing, counteracts negativity bias',
      },
      {
        name: 'Love',
        description: 'Deep affection, care, and attachment',
        physicalSensations: ['warmth', 'openness', 'calm', 'tenderness'],
        relatedWords: ['affectionate', 'caring', 'devoted', 'tender'],
        function: 'Creates bonds, motivates caregiving, essential for wellbeing',
      },
      {
        name: 'Contempt',
        description: 'Feeling of superiority combined with disgust',
        physicalSensations: ['sneering', 'one-sided lip raise', 'dismissiveness'],
        relatedWords: ['disdain', 'scorn', 'derision'],
        function: 'Establishes hierarchy; highly damaging in relationships (Gottman research)',
      },
    ],
  },
} as const

/**
 * Common emotions list for quick selection in the app
 */
export const COMMON_EMOTIONS = [
  // Negative
  'Anxious',
  'Sad',
  'Angry',
  'Frustrated',
  'Disappointed',
  'Scared',
  'Overwhelmed',
  'Guilty',
  'Ashamed',
  'Embarrassed',
  'Lonely',
  'Hopeless',
  'Worthless',
  'Jealous',
  'Resentful',
  'Irritated',
  'Nervous',
  'Worried',
  'Stressed',
  'Exhausted',
  // Positive
  'Happy',
  'Calm',
  'Grateful',
  'Hopeful',
  'Proud',
  'Relieved',
  'Content',
  'Excited',
  'Peaceful',
  'Confident',
  'Loved',
  'Joyful',
  // Neutral/Mixed
  'Confused',
  'Surprised',
  'Numb',
  'Uncertain',
] as const

// ============================================================================
// THOUGHT RECORDS AND RELATED TYPES
// ============================================================================

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
  beliefRatingBefore?: number // 0-100 how much you believe the automatic thought
  beliefRatingAfter?: number // 0-100 after generating rational response
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
  // Enhanced gratitude practice fields
  whyGrateful?: string // Why these items matter to you
  savoring?: string // A moment to savor from the day
}

export interface Emotion {
  name: string
  intensity: number // 0-100
}

// ============================================================================
// CLINICAL ASSESSMENTS (PHQ-9, GAD-7)
// Validated instruments - do not modify item wording
// ============================================================================

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
      recommendation: 'No treatment typically needed. Continue monitoring and self-care practices.',
    }
  if (score <= 9)
    return {
      level: 'Mild',
      severity: 'mild',
      color: 'text-yellow-500',
      recommendation:
        'Watchful waiting. Repeat assessment in 2 weeks. Self-help strategies like behavioral activation, exercise, and sleep hygiene recommended.',
    }
  if (score <= 14)
    return {
      level: 'Moderate',
      severity: 'moderate',
      color: 'text-orange-500',
      recommendation:
        'Consider counseling or therapy (CBT, IPT, or behavioral activation). Discuss options with a healthcare provider.',
    }
  if (score <= 19)
    return {
      level: 'Moderately severe',
      severity: 'moderately-severe',
      color: 'text-orange-600',
      recommendation:
        'Active treatment recommended. Evidence supports therapy (especially CBT) and/or medication. Consult a mental health professional.',
    }
  return {
    level: 'Severe',
    severity: 'severe',
    color: 'text-red-500',
    recommendation:
      'Immediate treatment recommended. Please reach out to a mental health professional. If you have thoughts of self-harm, contact a crisis line.',
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
      recommendation: 'No treatment typically needed. Continue stress management and self-care.',
    }
  if (score <= 9)
    return {
      level: 'Mild',
      severity: 'mild',
      color: 'text-yellow-500',
      recommendation:
        'Watchful waiting. Self-help strategies recommended: relaxation techniques, exercise, limiting caffeine, and sleep hygiene.',
    }
  if (score <= 14)
    return {
      level: 'Moderate',
      severity: 'moderate',
      color: 'text-orange-500',
      recommendation:
        'Consider counseling or therapy (CBT is first-line treatment for anxiety). Discuss options with a healthcare provider.',
    }
  return {
    level: 'Severe',
    severity: 'severe',
    color: 'text-red-500',
    recommendation:
      'Active treatment recommended. CBT and/or medication are effective. Please reach out to a mental health professional.',
  }
}

// ============================================================================
// BEHAVIORAL ACTIVATION / ACTIVITY SCHEDULING
// Based on Martell, Addis, & Jacobson's Behavioral Activation for Depression
// ============================================================================

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
  pleasureRating?: number // 0-10 enjoyment
  masteryRating?: number // 0-10 sense of accomplishment
  connectionRating?: number // 0-10 social connection
  meaningRating?: number // 0-10 alignment with values
  notes?: string
  isPlanned: boolean
  isCompleted: boolean
  linkedValue?: string
  barriers?: string // What got in the way (if not completed)

  // Google Calendar sync fields
  googleCalendarEventId?: string
  googleCalendarId?: string
  syncWithCalendar?: boolean
  lastSyncedAt?: string
  source?: 'local' | 'google-calendar'

  // Hide from Activities view but keep for Insights
  hiddenFromActivities?: boolean
}

// Represents a Google Calendar event displayed in the activities view
// These are read-only and don't have CBT-specific fields
export interface CalendarEventDisplay {
  id: string
  googleEventId: string
  title: string
  date: string
  startTime?: string
  endTime?: string
  isAllDay: boolean
  isMultiDay?: boolean
  multiDayInfo?: string
  description?: string
  htmlLink?: string
}

export type ActivityCategory =
  | 'self-care'
  | 'social'
  | 'physical'
  | 'productive'
  | 'leisure'
  | 'creative'
  | 'mindfulness'
  | 'values-aligned'
  | 'other'

export const ACTIVITY_CATEGORIES: {
  id: ActivityCategory
  label: string
  icon: string
  examples: string
  whyItHelps: string
}[] = [
  {
    id: 'self-care',
    label: 'Self-care',
    icon: '🛁',
    examples: 'Showering, skincare, healthy meals, rest, hygiene',
    whyItHelps:
      'Basic self-care maintains physical health and sends a message to yourself that you matter.',
  },
  {
    id: 'social',
    label: 'Social',
    icon: '👥',
    examples: 'Calling a friend, meeting someone, texting, family time',
    whyItHelps:
      'Social connection is a fundamental human need. Even small interactions can boost mood.',
  },
  {
    id: 'physical',
    label: 'Physical',
    icon: '🏃',
    examples: 'Walking, exercise, sports, stretching, dancing',
    whyItHelps:
      'Exercise is one of the most effective natural antidepressants, releasing endorphins and reducing cortisol.',
  },
  {
    id: 'productive',
    label: 'Productive',
    icon: '✅',
    examples: 'Work tasks, chores, errands, organizing, bills',
    whyItHelps:
      'Accomplishing tasks builds mastery and self-efficacy, counteracting feelings of helplessness.',
  },
  {
    id: 'leisure',
    label: 'Leisure',
    icon: '🎮',
    examples: 'Reading, gaming, watching shows, hobbies',
    whyItHelps: 'Pleasure and enjoyment are important for wellbeing. You deserve rest and fun.',
  },
  {
    id: 'creative',
    label: 'Creative',
    icon: '🎨',
    examples: 'Music, art, writing, crafts, cooking',
    whyItHelps:
      'Creative expression can process emotions, provide flow states, and build identity.',
  },
  {
    id: 'mindfulness',
    label: 'Mindfulness',
    icon: '🧘',
    examples: 'Meditation, breathing exercises, mindful walking, yoga',
    whyItHelps:
      'Mindfulness reduces rumination, increases present-moment awareness, and calms the nervous system.',
  },
  {
    id: 'values-aligned',
    label: 'Values-aligned',
    icon: '🧭',
    examples: 'Volunteering, learning, spiritual practice, mentoring',
    whyItHelps:
      'Acting in line with your values creates meaning and purpose, which is protective against depression.',
  },
  {
    id: 'other',
    label: 'Other',
    icon: '📝',
    examples: "Anything that doesn't fit the categories above",
    whyItHelps: 'Any positive activity can contribute to wellbeing.',
  },
]

// ============================================================================
// COPING SKILLS (Enhanced with additional DBT and evidence-based techniques)
// ============================================================================

export const COPING_SKILLS = {
  tipp: {
    name: 'TIPP skills',
    category: 'Crisis/Distress tolerance',
    source: 'DBT (Linehan)',
    description:
      'Fast-acting techniques for intense emotions when you need to change your body chemistry quickly',
    whenToUse: 'When emotions are at 7/10 or higher and you need immediate relief',
    skills: [
      {
        id: 'temperature',
        name: 'Temperature',
        description:
          'Use cold to activate the dive reflex and calm your nervous system. This triggers the parasympathetic nervous system within 30 seconds.',
        instructions: [
          'Fill a bowl with cold water and ice',
          'Hold your breath and put your face in for 30 seconds',
          'Or hold ice cubes in your hands or on your wrists',
          'Or splash very cold water on your face',
          'The key is cold on the face, especially around eyes and cheeks',
        ],
        scienceNote:
          'Cold water on the face triggers the mammalian dive reflex, which slows heart rate by up to 25%.',
        duration: '30 seconds to 2 minutes',
        caution: 'Avoid if you have heart conditions. Check with doctor if unsure.',
      },
      {
        id: 'intense-exercise',
        name: 'Intense exercise',
        description:
          'Brief intense movement to burn off stress hormones (adrenaline and cortisol) and release endorphins',
        instructions: [
          'Do jumping jacks for 1-2 minutes',
          'Run in place or up stairs',
          'Do burpees, push-ups, or squats',
          'Dance vigorously to fast music',
          'Any movement that gets your heart rate up significantly',
        ],
        scienceNote:
          'Intense exercise metabolizes stress hormones and triggers endorphin release within minutes.',
        duration: '5-20 minutes for full effect',
      },
      {
        id: 'paced-breathing',
        name: 'Paced breathing',
        description:
          'Slow down your breathing to activate the parasympathetic nervous system. The key is making exhales longer than inhales.',
        instructions: [
          'Breathe in slowly for 4 counts through your nose',
          'Breathe out slowly for 6-8 counts through your mouth',
          'The exhale should be noticeably longer than the inhale',
          'Focus on your belly rising and falling',
          'Continue for at least 2 minutes',
        ],
        scienceNote:
          'Long exhales stimulate the vagus nerve, activating the "rest and digest" system.',
        duration: '2-5 minutes',
      },
      {
        id: 'paired-relaxation',
        name: 'Progressive muscle relaxation',
        description:
          'Systematically tense and release muscle groups to release physical tension and calm the mind',
        instructions: [
          'Start with your hands: make tight fists while breathing in',
          'Hold the tension for 5-7 seconds, really notice it',
          'Release completely while breathing out slowly',
          'Notice the contrast between tension and relaxation',
          'Move through: arms, shoulders, face, chest, stomach, legs, feet',
        ],
        scienceNote:
          'Developed by Edmund Jacobson in the 1930s; releases muscle tension that accumulates with stress.',
        duration: '10-20 minutes for full body',
      },
    ],
  },
  stop: {
    name: 'STOP skill',
    category: 'Crisis/Distress tolerance',
    source: 'DBT (Linehan)',
    description:
      'A quick technique to interrupt impulsive reactions and create space for wise action',
    whenToUse: 'When you feel the urge to react impulsively or do something you might regret',
    skills: [
      {
        id: 'stop-skill',
        name: 'STOP',
        description:
          'An acronym to remember the steps: Stop, Take a step back, Observe, Proceed mindfully',
        instructions: [
          "S - STOP: Freeze. Don't react. Don't move a muscle.",
          'T - TAKE A STEP BACK: Take a breath. Disengage from the situation mentally.',
          "O - OBSERVE: What's happening inside you? Outside? What are the facts?",
          'P - PROCEED MINDFULLY: Ask "What do I want from this situation? What action will be effective?"',
        ],
        duration: '30 seconds to 2 minutes',
      },
    ],
  },
  accepts: {
    name: 'ACCEPTS skills',
    category: 'Distress tolerance',
    source: 'DBT (Linehan)',
    description: 'Distraction techniques to get through a crisis without making it worse',
    whenToUse: 'When you need to tolerate distress you cannot immediately solve',
    skills: [
      {
        id: 'activities',
        name: 'Activities',
        description: 'Engage in activities that require attention and focus',
        instructions: [
          'Do a hobby that requires concentration',
          'Watch a movie or show that engages you',
          'Play a game (video game, puzzle, cards)',
          'Exercise or do physical activity',
          'Clean or organize something',
          'Call or visit a friend',
        ],
        duration: 'As long as needed',
      },
      {
        id: 'contributing',
        name: 'Contributing',
        description: 'Do something for someone else to get outside your own pain',
        instructions: [
          'Do something kind for someone',
          'Volunteer or help a neighbor',
          'Make a donation or give something away',
          'Write a gratitude letter to someone',
          'Offer to help with a task',
        ],
        scienceNote: 'Helping others activates reward centers and reduces focus on own distress.',
        duration: 'Variable',
      },
      {
        id: 'comparisons',
        name: 'Comparisons',
        description:
          'Compare yourself to times when you were less fortunate or to others coping with difficulties',
        instructions: [
          'Remember a time you coped with something similar',
          'Think about others facing similar or greater challenges',
          "Consider how far you've come from your worst time",
          'Read about others who have overcome adversity',
        ],
        caution: 'Use compassionately, not to dismiss your feelings',
        duration: '5-10 minutes',
      },
      {
        id: 'emotions-opposite',
        name: 'Emotions (opposite)',
        description: "Create emotions different from what you're feeling now",
        instructions: [
          'Watch a funny video or comedy',
          'Listen to upbeat music',
          'Read something inspiring or heartwarming',
          'Look at photos of happy memories',
          'Watch cute animal videos',
        ],
        scienceNote:
          'Emotions are contagious; exposure to different emotions can shift your state.',
        duration: '10-30 minutes',
      },
      {
        id: 'pushing-away',
        name: 'Pushing away',
        description: 'Mentally push the situation away temporarily',
        instructions: [
          'Imagine putting the problem in a box on a shelf',
          'Visualize a wall between you and the situation',
          'Tell yourself "I will deal with this later, not now"',
          'Set a specific time to think about it later',
          'Mentally "leave the room" where the problem lives',
        ],
        caution: 'This is temporary; eventually the issue needs to be addressed',
        duration: 'Temporary relief',
      },
      {
        id: 'thoughts-other',
        name: 'Thoughts (other)',
        description: 'Think about something other than the painful situation',
        instructions: [
          'Count things around you (tiles, books, colors)',
          'Do mental math or puzzles',
          'Recite song lyrics or poetry from memory',
          'Plan something fun in detail',
          'Name all the countries/states/capitals you can',
        ],
        duration: '5-15 minutes',
      },
      {
        id: 'sensations',
        name: 'Sensations',
        description: 'Use intense sensations to shift focus from emotional pain',
        instructions: [
          'Hold ice cubes in your hands',
          'Snap a rubber band on your wrist (gently)',
          'Take a very cold or hot shower',
          'Eat something with intense flavor (sour, spicy)',
          'Listen to loud music',
          'Squeeze a stress ball very tightly',
        ],
        caution: 'Choose safe sensations; avoid anything harmful',
        duration: '2-10 minutes',
      },
    ],
  },
  improve: {
    name: 'IMPROVE the moment',
    category: 'Distress tolerance',
    source: 'DBT (Linehan)',
    description: 'Techniques to make a painful moment more tolerable',
    whenToUse: "When you're in an unavoidable difficult situation",
    skills: [
      {
        id: 'imagery',
        name: 'Imagery',
        description: 'Use your imagination to create a sense of safety or calm',
        instructions: [
          'Imagine a safe, peaceful place in detail',
          'Visualize yourself coping well with the situation',
          'Imagine a protective barrier around you',
          'Picture the difficult time passing and you on the other side',
        ],
        duration: '5-15 minutes',
      },
      {
        id: 'meaning',
        name: 'Meaning',
        description: 'Find or create meaning in the painful situation',
        instructions: [
          'Ask what you can learn from this experience',
          'Consider how this might help you help others later',
          'Connect the difficulty to your values',
          'Find a silver lining or hidden benefit',
        ],
        duration: 'Reflective process',
      },
      {
        id: 'prayer',
        name: 'Prayer/Spirituality',
        description: 'Connect with something larger than yourself',
        instructions: [
          'Pray if that is part of your practice',
          'Meditate on connection to something larger',
          'Read spiritual or philosophical texts',
          'Practice acceptance of what you cannot control',
        ],
        duration: 'Variable',
      },
      {
        id: 'relaxation',
        name: 'Relaxation',
        description: 'Calm your body to help calm your mind',
        instructions: [
          'Practice deep breathing',
          'Do progressive muscle relaxation',
          'Take a warm bath',
          'Get a massage or use a massage tool',
          'Do gentle stretching or yoga',
        ],
        duration: '10-30 minutes',
      },
      {
        id: 'one-thing',
        name: 'One thing in the moment',
        description: 'Focus your entire attention on what you are doing right now',
        instructions: [
          'Notice every aspect of your current activity',
          'Let go of thoughts about past or future',
          'Bring wandering attention back to now',
          'Engage all your senses in the present moment',
        ],
        duration: 'Ongoing practice',
      },
      {
        id: 'vacation',
        name: 'Vacation (brief)',
        description: 'Give yourself a brief mental or physical vacation',
        instructions: [
          'Take a 10-minute break from the situation',
          'Go for a short walk outside',
          'Make yourself a cup of tea mindfully',
          'Sit in nature for a few minutes',
          'Read a few pages of a book',
        ],
        duration: '10-30 minutes',
      },
      {
        id: 'encouragement',
        name: 'Encouragement',
        description: 'Be your own cheerleader with self-compassionate self-talk',
        instructions: [
          'Tell yourself "I can get through this"',
          "Remind yourself of times you've coped before",
          'Say "This feeling will pass"',
          'Speak to yourself as you would to a good friend',
        ],
        duration: 'Ongoing',
      },
    ],
  },
  grounding: {
    name: 'Grounding techniques',
    category: 'Distress tolerance',
    source: 'Various (trauma-informed care)',
    description:
      'Bring yourself back to the present moment when feeling overwhelmed, dissociated, or anxious',
    whenToUse: 'When you feel disconnected, spacey, panicky, or caught up in past/future',
    skills: [
      {
        id: '54321',
        name: '5-4-3-2-1 technique',
        description: 'Use all five senses to anchor yourself to the present moment',
        instructions: [
          'Name 5 things you can SEE right now',
          'Name 4 things you can physically FEEL (touch)',
          'Name 3 things you can HEAR',
          'Name 2 things you can SMELL',
          'Name 1 thing you can TASTE',
        ],
        scienceNote:
          'Engaging the senses activates the present-moment brain networks, interrupting anxiety loops.',
        duration: '2-5 minutes',
      },
      {
        id: 'body-scan',
        name: 'Body scan',
        description:
          'Systematically notice sensations throughout your body without trying to change them',
        instructions: [
          'Close your eyes or soften your gaze',
          'Start at the top of your head',
          'Slowly move your attention down: forehead, eyes, jaw...',
          'Notice any sensations without judging them',
          'Continue down through neck, shoulders, arms, hands...',
          'Then chest, stomach, hips, legs, feet',
          'Finally, sense your whole body at once',
        ],
        scienceNote:
          'Body scans increase interoceptive awareness and activate the insula, improving emotional regulation.',
        duration: '5-20 minutes',
      },
      {
        id: 'feet-on-floor',
        name: 'Feet on the floor',
        description: 'A quick grounding technique you can use anywhere without anyone noticing',
        instructions: [
          'Feel your feet firmly planted on the ground',
          'Press down slightly to really feel the floor',
          'Notice the sensations: temperature, texture, pressure',
          'Imagine roots growing from your feet into the earth',
          'Feel the stability and support of the ground',
        ],
        duration: '30 seconds to 2 minutes',
      },
      {
        id: 'safe-place',
        name: 'Safe place visualization',
        description: 'Create a detailed mental image of a place where you feel completely safe',
        instructions: [
          'Close your eyes and imagine a place where you feel safe',
          'This can be real or imaginary',
          'Notice what you SEE in this place (colors, shapes, light)',
          'Notice what you HEAR (sounds, music, silence)',
          'Notice what you FEEL physically (temperature, textures)',
          'Notice any SMELLS',
          'Let yourself fully be in this place',
          'You can return here any time you need to',
        ],
        duration: '5-15 minutes',
      },
      {
        id: 'grounding-objects',
        name: 'Grounding object',
        description: 'Use a physical object to anchor yourself to the present',
        instructions: [
          'Choose an object to keep with you (stone, coin, keychain)',
          'When distressed, hold it in your hand',
          'Notice its weight, texture, temperature',
          'Trace its edges with your fingers',
          'Focus all your attention on the sensations',
        ],
        duration: '1-5 minutes',
      },
    ],
  },
  defusion: {
    name: 'Cognitive defusion',
    category: 'Acceptance/ACT',
    source: 'ACT (Hayes)',
    description:
      'Create distance from unhelpful thoughts so they have less power over you. The goal is not to change thoughts but to change your relationship with them.',
    whenToUse: "When you're fused with negative thoughts and they feel absolutely true",
    skills: [
      {
        id: 'leaves-stream',
        name: 'Leaves on a stream',
        description: 'A visualization to practice letting thoughts come and go',
        instructions: [
          'Close your eyes and imagine sitting beside a gently flowing stream',
          'Leaves are floating on the surface of the water',
          'When a thought comes to mind, place it on a leaf',
          'Watch the leaf float downstream and out of sight',
          "Don't try to speed it up or slow it down",
          'If you get distracted, gently return to the stream',
          "Thoughts are not facts - they're just mental events passing through",
        ],
        scienceNote:
          'This exercise teaches non-attachment to thoughts, reducing their emotional impact.',
        duration: '5-15 minutes',
      },
      {
        id: 'thank-mind',
        name: 'Thank your mind',
        description:
          'Acknowledge thoughts without buying into them, recognizing your mind is trying to help',
        instructions: [
          'When you notice an unhelpful thought, pause',
          'Say to yourself: "Thanks mind, but I\'ve got this"',
          'Or: "Thanks for trying to protect me, mind"',
          'Or: "Thanks for that thought, mind"',
          'Then redirect your attention to what matters',
        ],
        scienceNote:
          'This acknowledges the protective function of anxious thoughts while not being controlled by them.',
        duration: 'Momentary',
      },
      {
        id: 'having-thought',
        name: '"I\'m having the thought that..."',
        description: 'Add distance by labeling thoughts as thoughts rather than facts',
        instructions: [
          "Notice the thought you're having",
          'Restate it as: "I\'m having the thought that [original thought]"',
          'Then try: "I notice I\'m having the thought that [thought]"',
          'Notice how this changes your relationship to the thought',
          "The thought hasn't changed, but your fusion with it has decreased",
        ],
        scienceNote: 'This technique activates the prefrontal cortex, creating cognitive distance.',
        duration: 'Momentary',
      },
      {
        id: 'silly-voice',
        name: 'Silly voice technique',
        description:
          'Say the thought in a funny voice to reduce its power and see it as just words',
        instructions: [
          'Identify a distressing thought (e.g., "I\'m such a failure")',
          'Say it out loud in a silly cartoon voice',
          'Try singing it to the tune of "Happy Birthday"',
          'Say it in slow motion',
          "Say it in a celebrity's voice",
          "Notice how the thought's impact changes",
        ],
        scienceNote: 'This demonstrates that thoughts are just sounds/words, not inherent truths.',
        duration: '2-5 minutes',
      },
      {
        id: 'passengers-bus',
        name: 'Passengers on the bus',
        description: "Visualize difficult thoughts as passengers on a bus you're driving",
        instructions: [
          "Imagine you're driving a bus toward your values",
          'Difficult thoughts, feelings, and memories are passengers',
          'They might yell, criticize, or try to distract you',
          "You don't have to kick them off the bus",
          "You don't have to do what they say",
          'Just keep driving toward what matters to you',
          'They can come along for the ride without controlling the direction',
        ],
        duration: '5-10 minutes',
      },
    ],
  },
  selfCompassion: {
    name: 'Self-compassion',
    category: 'Emotional regulation',
    source: "CFT (Gilbert) and Kristin Neff's research",
    description:
      'Treat yourself with the same kindness you would offer a good friend. Self-compassion has three components: self-kindness, common humanity, and mindfulness.',
    whenToUse: "When you're being hard on yourself, feeling like a failure, or experiencing shame",
    skills: [
      {
        id: 'self-compassion-break',
        name: 'Self-compassion break',
        description: 'A brief practice that incorporates all three components of self-compassion',
        instructions: [
          '1. MINDFULNESS: Acknowledge the pain. "This is a moment of suffering" or "This hurts"',
          '2. COMMON HUMANITY: Remember you\'re not alone. "Suffering is part of being human" or "Other people feel this way too"',
          '3. SELF-KINDNESS: Offer yourself kindness. Place hand on heart and say "May I be kind to myself" or "May I give myself the compassion I need"',
        ],
        scienceNote:
          'Research shows self-compassion reduces cortisol and increases heart rate variability.',
        duration: '2-5 minutes',
      },
      {
        id: 'compassionate-letter',
        name: 'Compassionate letter to yourself',
        description: 'Write to yourself from the perspective of an unconditionally loving friend',
        instructions: [
          "Think of something you're struggling with or criticizing yourself for",
          'Imagine a friend who is wise, loving, and accepting',
          "Write a letter to yourself from this friend's perspective",
          'What would they say about your struggle?',
          'What words of understanding would they offer?',
          'What would they remind you of about your good qualities?',
          'Read the letter back to yourself',
        ],
        duration: '15-30 minutes',
      },
      {
        id: 'soothing-touch',
        name: 'Soothing touch',
        description: 'Use physical touch to activate the caregiving system and soothe yourself',
        instructions: [
          'Place both hands over your heart',
          'Or gently hold your face in your hands',
          'Or give yourself a hug',
          'Or stroke your arm gently',
          'Feel the warmth of your hands',
          'Breathe slowly and speak kindly to yourself',
        ],
        scienceNote: "Physical touch releases oxytocin, even when it's your own touch.",
        duration: '2-5 minutes',
      },
      {
        id: 'common-humanity',
        name: 'Common humanity reflection',
        description: 'Remember that imperfection and suffering are shared human experiences',
        instructions: [
          "When you're struggling, pause and reflect:",
          '"Other people have felt exactly this way"',
          '"This is part of the human experience"',
          '"I\'m not alone in this struggle"',
          'Think of specific people who might understand',
          'Feel the connection to all humans who have suffered similarly',
        ],
        duration: '2-5 minutes',
      },
      {
        id: 'compassionate-image',
        name: 'Compassionate image',
        description: 'Create and connect with an image of pure compassion',
        instructions: [
          'Close your eyes and create an image of a compassionate being',
          'This could be a person, animal, light, or abstract presence',
          'Give it qualities: wise, strong, warm, non-judgmental',
          'Imagine it looking at you with complete acceptance',
          'Feel its compassion flowing toward you',
          'What would it say to you about your struggle?',
        ],
        duration: '5-15 minutes',
      },
    ],
  },
  breathing: {
    name: 'Breathing exercises',
    category: 'Nervous system regulation',
    source: 'Various (yoga, mindfulness, polyvagal theory)',
    description:
      'Regulate your nervous system through conscious breathing. The breath is one of the few autonomic functions you can consciously control.',
    whenToUse: 'Anytime you need to calm down, refocus, or regulate your nervous system',
    skills: [
      {
        id: 'box-breathing',
        name: 'Box breathing',
        description: 'A structured breathing pattern used by Navy SEALs for stress management',
        instructions: [
          'Breathe IN for 4 counts',
          'HOLD for 4 counts',
          'Breathe OUT for 4 counts',
          'HOLD for 4 counts',
          'Repeat for 4-6 cycles',
          'Can gradually increase to 5 or 6 counts as you practice',
        ],
        scienceNote:
          'The holds help normalize CO2 levels and the regularity calms the nervous system.',
        duration: '3-5 minutes',
      },
      {
        id: '4-7-8-breathing',
        name: '4-7-8 breathing',
        description: 'A relaxing breath pattern developed by Dr. Andrew Weil',
        instructions: [
          'Breathe IN through your nose for 4 counts',
          'HOLD your breath for 7 counts',
          'Breathe OUT through your mouth for 8 counts (making a whoosh sound)',
          'Repeat for 4 breath cycles',
          'The long exhale is key to activating relaxation',
        ],
        scienceNote: 'The extended exhale activates the parasympathetic nervous system.',
        duration: '2-3 minutes',
      },
      {
        id: '3min-breathing',
        name: '3-minute breathing space',
        description: 'A mini-meditation from Mindfulness-Based Cognitive Therapy (MBCT)',
        instructions: [
          'MINUTE 1 - AWARENESS: "What is my experience right now?"',
          '  Notice thoughts (what is my mind saying?)',
          '  Notice feelings (what emotions are present?)',
          '  Notice body sensations (what am I feeling physically?)',
          'MINUTE 2 - GATHERING: Focus your attention on your breath',
          '  Feel the sensations of breathing in your belly',
          '  Let this be your anchor',
          'MINUTE 3 - EXPANDING: Widen your awareness',
          '  Include your whole body in your awareness',
          '  Carry this expanded awareness into the next moments',
        ],
        scienceNote: 'This practice interrupts rumination and re-centers attention.',
        duration: '3 minutes',
      },
      {
        id: 'physiological-sigh',
        name: 'Physiological sigh',
        description:
          'The fastest evidence-based way to calm down, discovered by Stanford researchers',
        instructions: [
          'Take a deep breath IN through your nose',
          'At the top, take a second short sniff IN to fully expand the lungs',
          'Then let it all out with a long, slow EXHALE through your mouth',
          'This is one "physiological sigh"',
          'One to three sighs is usually enough to feel calmer',
        ],
        scienceNote:
          'The double inhale opens collapsed alveoli in the lungs, and the long exhale activates the parasympathetic system. Shown effective in real-time stress reduction.',
        duration: '30 seconds',
      },
      {
        id: 'coherent-breathing',
        name: 'Coherent breathing',
        description: 'Breathing at about 5 breaths per minute to maximize heart rate variability',
        instructions: [
          'Breathe IN for 6 seconds',
          'Breathe OUT for 6 seconds',
          'No holding, just continuous flow',
          'This equals 5 breaths per minute',
          'Practice for at least 5 minutes',
        ],
        scienceNote:
          'This rate optimizes heart rate variability (HRV), a marker of autonomic health and resilience.',
        duration: '5-20 minutes',
      },
    ],
  },
  windowOfTolerance: {
    name: 'Window of tolerance',
    category: 'Nervous system regulation',
    source: 'Dan Siegel / Polyvagal Theory (Porges)',
    description:
      'Understanding your nervous system states and how to return to your "window" where you can think clearly and respond effectively',
    whenToUse:
      "When you notice you're in hyperarousal (anxious, panicky) or hypoarousal (numb, shut down)",
    skills: [
      {
        id: 'identify-state',
        name: 'Identify your state',
        description: "Learn to recognize which nervous system state you're in",
        instructions: [
          "HYPERAROUSAL (above the window): racing heart, anxiety, panic, anger, hypervigilance, can't sit still, intrusive thoughts",
          'WINDOW OF TOLERANCE (optimal zone): alert but calm, can think clearly, emotions feel manageable, connected to others',
          "HYPOAROUSAL (below the window): numb, disconnected, foggy, exhausted, collapsed, shut down, can't think",
          'Ask yourself: "Am I above, below, or in my window right now?"',
        ],
        duration: 'Ongoing awareness',
      },
      {
        id: 'return-from-hyper',
        name: 'Return from hyperarousal',
        description: "Techniques to calm down when you're in fight-or-flight mode",
        instructions: [
          'Use grounding techniques (5-4-3-2-1)',
          'Slow your exhale (longer out than in)',
          'Cold water on face (dive reflex)',
          'Slow, rhythmic movement',
          'Progressive muscle relaxation',
          'Bilateral stimulation (tap alternating knees)',
          'Safe place visualization',
        ],
        duration: '5-15 minutes',
      },
      {
        id: 'return-from-hypo',
        name: 'Return from hypoarousal',
        description: "Techniques to activate when you're shut down or numb",
        instructions: [
          'Stand up and move your body',
          'Splash cold water on your face',
          'Do jumping jacks or walk briskly',
          'Strong tastes (sour, mint, spicy)',
          'Look around and name what you see',
          'Push against a wall',
          'Smell something strong (essential oil, coffee)',
          'Call a friend and talk',
        ],
        duration: '5-15 minutes',
      },
      {
        id: 'expand-window',
        name: 'Expand your window',
        description: 'Over time, you can widen your window of tolerance through regular practice',
        instructions: [
          'Practice mindfulness meditation regularly',
          'Regular exercise',
          'Adequate sleep',
          'Healthy social connections',
          'Process past trauma with a therapist',
          'Gradually expose yourself to manageable challenges',
          'Celebrate when you stay in your window during difficulty',
        ],
        duration: 'Long-term practice',
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
  distressBefore: number // 0-10
  distressAfter: number // 0-10
  notes?: string
  helpful: boolean
  wouldUseAgain?: boolean
}

// ============================================================================
// VALUES (Enhanced ACT-based values work)
// Based on Acceptance and Commitment Therapy (Hayes, Strosahl, Wilson)
// ============================================================================

export interface ValueArea {
  id: string
  name: string
  importance: number // 0-10 how important this is to you
  currentAlignment: number // 0-10 how aligned your life currently is with this value
  goals: string[]
  whyItMatters?: string
}

export const VALUE_DOMAINS = [
  {
    id: 'relationships',
    name: 'Family and relationships',
    description: 'How you want to be in your close relationships',
    questions: [
      'What kind of partner/parent/child/friend do you want to be?',
      'What qualities do you want to bring to your relationships?',
      'How do you want to treat the people you care about?',
    ],
    exampleValues: ['loving', 'supportive', 'present', 'honest', 'reliable', 'playful'],
  },
  {
    id: 'work',
    name: 'Work and career',
    description: 'What matters to you in your professional life',
    questions: [
      'What kind of worker do you want to be?',
      'What contribution do you want to make through your work?',
      'What qualities do you want to bring to your workplace?',
    ],
    exampleValues: ['dedicated', 'creative', 'helpful', 'excellent', 'collaborative', 'ethical'],
  },
  {
    id: 'health',
    name: 'Health and wellbeing',
    description: 'How you want to care for your physical and mental health',
    questions: [
      'What does taking care of yourself mean to you?',
      'How do you want to treat your body?',
      'What kind of relationship do you want with your health?',
    ],
    exampleValues: ['self-caring', 'active', 'balanced', 'mindful', 'nourished'],
  },
  {
    id: 'growth',
    name: 'Personal growth and learning',
    description: 'How you want to develop and learn throughout life',
    questions: [
      'What do you want to learn or master?',
      'How do you want to grow as a person?',
      'What challenges do you want to take on?',
    ],
    exampleValues: ['curious', 'growth-oriented', 'open-minded', 'resilient', 'self-aware'],
  },
  {
    id: 'leisure',
    name: 'Leisure and recreation',
    description: 'How you want to play, rest, and enjoy life',
    questions: [
      'How do you want to spend your free time?',
      'What brings you joy and refreshment?',
      'What role does fun play in your life?',
    ],
    exampleValues: ['playful', 'adventurous', 'relaxed', 'present', 'joyful'],
  },
  {
    id: 'spirituality',
    name: 'Spirituality and meaning',
    description: 'Your connection to something larger than yourself',
    questions: [
      'What gives your life meaning?',
      'What are your spiritual or philosophical beliefs?',
      'How do you want to connect with something greater?',
    ],
    exampleValues: ['connected', 'purposeful', 'grateful', 'transcendent', 'peaceful'],
  },
  {
    id: 'creativity',
    name: 'Creativity and self-expression',
    description: 'How you want to express yourself and create',
    questions: [
      'How do you want to express your unique self?',
      'What do you want to create or contribute?',
      'What role does creativity play in your life?',
    ],
    exampleValues: ['creative', 'authentic', 'expressive', 'innovative', 'artistic'],
  },
  {
    id: 'community',
    name: 'Community and citizenship',
    description: 'How you want to contribute to the world around you',
    questions: [
      'What kind of community member do you want to be?',
      'How do you want to contribute to society?',
      'What causes or issues matter to you?',
    ],
    exampleValues: ['generous', 'responsible', 'engaged', 'compassionate', 'just'],
  },
  {
    id: 'parenting',
    name: 'Parenting',
    description: 'How you want to be as a parent (if applicable)',
    questions: [
      'What kind of parent do you want to be?',
      'What do you want your children to learn from you?',
      'What kind of relationship do you want with your children?',
    ],
    exampleValues: ['loving', 'patient', 'present', 'guiding', 'supportive', 'fun'],
  },
  {
    id: 'environment',
    name: 'Environment and nature',
    description: 'Your relationship with the natural world',
    questions: [
      'How do you want to relate to nature?',
      'What role does the environment play in your life?',
      'How do you want to care for the planet?',
    ],
    exampleValues: ['connected', 'responsible', 'appreciative', 'sustainable', 'outdoorsy'],
  },
] as const

// ============================================================================
// PSYCHOEDUCATION CONTENT
// ============================================================================

export const PSYCHOEDUCATION = {
  cognitiveModel: {
    title: 'The cognitive model',
    description:
      "The core insight of CBT is that it's not events themselves that cause our emotions, but our interpretations of those events. This means we can change how we feel by examining and adjusting our thoughts.",
    diagram: 'Situation → Thoughts → Emotions → Behaviors → (influences future situations)',
    keyPoints: [
      'The same situation can lead to different emotions depending on how we interpret it.',
      'Automatic thoughts happen quickly and often outside our awareness.',
      'These thoughts are often distorted or biased in predictable ways.',
      'By catching and examining these thoughts, we can reduce emotional suffering.',
      'Changing thoughts also changes behaviors, creating positive cycles.',
    ],
  },
  emotionsAreSafe: {
    title: 'Emotions are safe',
    description:
      'All emotions, even painful ones, are safe to experience. They are signals, not threats. No emotion lasts forever, and you can survive any feeling.',
    keyPoints: [
      'Emotions are like waves - they rise, peak, and fall.',
      "The average emotion lasts about 90 seconds if we don't feed it with thoughts.",
      'Avoiding emotions often makes them stronger (what we resist, persists).',
      'You can feel an emotion without acting on it.',
      'Emotions provide valuable information about our needs and values.',
    ],
  },
  anxietyEducation: {
    title: 'Understanding anxiety',
    description:
      "Anxiety is your body's alarm system. It evolved to protect you from danger. The problem is that this ancient system often fires in situations that aren't actually dangerous.",
    keyPoints: [
      'Anxiety symptoms (racing heart, sweating, etc.) are your body preparing to fight or flee.',
      'These sensations are uncomfortable but not dangerous.',
      'Avoiding anxiety-provoking situations maintains and strengthens anxiety.',
      "The goal isn't to eliminate anxiety but to respond to it differently.",
      'Gradual exposure to feared situations reduces anxiety over time.',
    ],
    physicalSymptoms: [
      { symptom: 'Racing heart', explanation: 'Pumping blood to muscles for action' },
      { symptom: 'Rapid breathing', explanation: 'Getting more oxygen for muscles' },
      { symptom: 'Sweating', explanation: 'Cooling the body for physical exertion' },
      { symptom: 'Muscle tension', explanation: 'Preparing muscles for fight or flight' },
      { symptom: 'Digestive issues', explanation: 'Diverting energy from digestion to muscles' },
      { symptom: 'Dizziness', explanation: 'Changes in breathing and blood flow' },
    ],
  },
  depressionEducation: {
    title: 'Understanding depression',
    description:
      "Depression is more than sadness. It's a condition that affects your thoughts, feelings, body, and behaviors. Understanding it can help you fight back effectively.",
    keyPoints: [
      "Depression lies - it tells you things that aren't true (you're worthless, nothing will help).",
      'Depression is not a character flaw or weakness.',
      'The withdrawal that depression causes often makes depression worse (downward spiral).',
      "Small actions, even when you don't feel like it, can start an upward spiral.",
      'Treatment (therapy, medication, lifestyle changes) is effective for most people.',
    ],
    behavioralActivation:
      "One of the most effective treatments is behavioral activation: doing activities even when you don't feel motivated. Action often comes before motivation, not after.",
  },
  sleepHygiene: {
    title: 'Sleep hygiene',
    description:
      'Sleep is foundational to mental health. Poor sleep worsens depression, anxiety, and cognitive function. Good sleep habits can significantly improve your mood.',
    recommendations: [
      {
        habit: 'Consistent schedule',
        tip: 'Wake up and go to bed at the same time every day, even weekends',
      },
      {
        habit: 'Wind-down routine',
        tip: 'Start relaxing 30-60 minutes before bed. Dim lights, avoid screens.',
      },
      {
        habit: 'Sleep environment',
        tip: 'Keep your bedroom cool, dark, and quiet. Use it only for sleep and intimacy.',
      },
      {
        habit: 'Limit caffeine',
        tip: 'Avoid caffeine after early afternoon (it has a 6-hour half-life).',
      },
      {
        habit: 'Limit alcohol',
        tip: 'Alcohol may help you fall asleep but disrupts sleep quality.',
      },
      { habit: 'Exercise', tip: 'Regular exercise improves sleep, but not too close to bedtime.' },
      {
        habit: 'Manage worry',
        tip: 'Write down worries before bed. Set a "worry time" earlier in the day.',
      },
      {
        habit: 'Get up if awake',
        tip: "If you can't sleep after 20 minutes, get up and do something calming.",
      },
    ],
  },
} as const

// ============================================================================
// SAFETY PLAN (Stanley-Brown model)
// ============================================================================

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

export const SAFETY_PLAN_GUIDANCE = {
  warningSigns: {
    title: 'Step 1: Warning signs',
    description:
      'What thoughts, images, moods, situations, or behaviors tell you a crisis may be developing?',
    examples: [
      'Thinking about being a burden',
      'Withdrawing from friends',
      'Increased drinking',
      'Not sleeping',
      'Feeling hopeless',
    ],
  },
  copingStrategies: {
    title: 'Step 2: Internal coping strategies',
    description: 'Things you can do on your own, without contacting anyone, to help yourself',
    examples: [
      'Take a walk',
      'Listen to music',
      'Take a shower',
      'Exercise',
      'Deep breathing',
      'Write in journal',
    ],
  },
  socialDistractions: {
    title: 'Step 3: People and places for distraction',
    description: 'People and social settings that can help distract you from the crisis',
    examples: ['Go to a coffee shop', 'Visit a friend', 'Go to the gym', 'Attend a meeting'],
  },
  peopleToContact: {
    title: 'Step 4: People to contact for help',
    description: 'People you can reach out to when you need help',
    examples: ['Family members', 'Close friends', 'Sponsor', 'Support group member'],
  },
  professionalContacts: {
    title: 'Step 5: Professionals and agencies to contact',
    description: 'Mental health professionals and crisis services',
    examples: ['Therapist', 'Psychiatrist', 'Crisis line', 'Emergency services'],
  },
  environmentSafety: {
    title: 'Step 6: Making the environment safe',
    description: 'Ways to make your environment safer during a crisis',
    examples: ['Remove or secure medications', 'Have someone hold onto items', 'Stay with someone'],
  },
  reasonsToLive: {
    title: 'Reasons for living',
    description: 'What are the most important things to you that are worth living for?',
    examples: [
      'Family',
      'Pets',
      'Future goals',
      'Things you want to experience',
      'People who need you',
    ],
  },
} as const

// ============================================================================
// BURNS DEPRESSION CHECKLIST (Legacy)
// ============================================================================

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

// ============================================================================
// CRISIS RESOURCES
// ============================================================================

export const CRISIS_RESOURCES = {
  international: {
    name: 'International Association for Suicide Prevention',
    url: 'https://www.iasp.info/resources/Crisis_Centres/',
    description: 'Find crisis centers in your country',
  },
  us: {
    name: '988 Suicide & Crisis Lifeline',
    phone: '988',
    text: 'Text HOME to 741741',
    url: 'https://988lifeline.org/',
    description: '24/7 crisis support via call, text, or chat',
  },
  uk: {
    name: 'Samaritans',
    phone: '116 123',
    url: 'https://www.samaritans.org/',
    description: '24/7 support for anyone in distress',
  },
  finland: {
    name: 'Mieli Mental Health Finland',
    phone: '09 2525 0111',
    url: 'https://mieli.fi/',
    description: 'Crisis helpline and mental health support',
  },
  ireland: {
    name: 'Samaritans Ireland',
    phone: '116 123',
    url: 'https://www.samaritans.org/ireland/',
    description: '24/7 support for anyone in distress',
  },
  canada: {
    name: 'Crisis Services Canada',
    phone: '1-833-456-4566',
    text: 'Text 45645',
    url: 'https://www.crisisservicescanada.ca/',
    description: '24/7 crisis support',
  },
  australia: {
    name: 'Lifeline Australia',
    phone: '13 11 14',
    text: 'Text 0477 13 11 14',
    url: 'https://www.lifeline.org.au/',
    description: '24/7 crisis support and suicide prevention',
  },
} as const

// ============================================================================
// BEHAVIORAL EXPERIMENTS
// For testing beliefs through real-world experiments
// ============================================================================

export interface BehavioralExperiment {
  id: string
  createdAt: string
  date: string
  belief: string // The thought/belief being tested
  beliefStrengthBefore: number // 0-100
  prediction: string // What you predict will happen
  experiment: string // What you will do to test it
  outcome: string // What actually happened
  beliefStrengthAfter: number // 0-100
  whatLearned: string
  linkedThoughtRecordId?: string
}

export const BEHAVIORAL_EXPERIMENT_GUIDANCE = {
  steps: [
    {
      step: 1,
      title: 'Identify the belief',
      description: 'What automatic thought or belief do you want to test?',
      example: '"If I speak up in the meeting, everyone will think I\'m stupid."',
    },
    {
      step: 2,
      title: 'Rate your belief',
      description: 'How strongly do you believe this right now? (0-100%)',
      example: '85%',
    },
    {
      step: 3,
      title: 'Make a specific prediction',
      description: 'What exactly do you predict will happen? Be specific and measurable.',
      example: '"People will laugh, roll their eyes, or criticize my idea directly."',
    },
    {
      step: 4,
      title: 'Design the experiment',
      description: 'What will you do to test this belief? Make it achievable.',
      example: '"I will share one idea in tomorrow\'s team meeting."',
    },
    {
      step: 5,
      title: 'Run the experiment',
      description: 'Do the experiment and observe what happens without filtering.',
      example: 'Actually speak up in the meeting.',
    },
    {
      step: 6,
      title: 'Record the outcome',
      description: 'What actually happened? Stick to observable facts.',
      example:
        '"Two people nodded, one person asked a follow-up question, one person disagreed respectfully."',
    },
    {
      step: 7,
      title: 'Re-rate your belief',
      description: 'How strongly do you believe the original thought now?',
      example: '40%',
    },
    {
      step: 8,
      title: 'What did you learn?',
      description: 'What does this experiment teach you?',
      example:
        '"People didn\'t think I was stupid. Even when someone disagreed, it wasn\'t the catastrophe I imagined."',
    },
  ],
} as const
