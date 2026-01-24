import { type ActivityCategory, ACTIVITY_CATEGORIES } from '@/types'

interface CategoryPattern {
  category: ActivityCategory
  keywords: string[]
  patterns: RegExp[]
}

const CATEGORY_PATTERNS: CategoryPattern[] = [
  {
    category: 'physical',
    keywords: [
      'gym',
      'workout',
      'exercise',
      'run',
      'running',
      'jog',
      'walk',
      'walking',
      'hike',
      'hiking',
      'swim',
      'swimming',
      'bike',
      'cycling',
      'yoga',
      'pilates',
      'crossfit',
      'weights',
      'cardio',
      'tennis',
      'football',
      'soccer',
      'basketball',
      'golf',
      'sports',
      'training',
      'fitness',
      'kempo',
      'karate',
      'martial',
      'boxing',
      'climbing',
      'dance',
      'dancing',
      'stretch',
    ],
    patterns: [/\bgym\b/i, /work\s?out/i, /physical\s?therapy/i],
  },
  {
    category: 'social',
    keywords: [
      'dinner',
      'lunch',
      'coffee',
      'drinks',
      'party',
      'birthday',
      'wedding',
      'meetup',
      'hangout',
      'hang out',
      'visit',
      'visiting',
      'friends',
      'family',
      'date',
      'reunion',
      'gathering',
      'bbq',
      'barbecue',
      'brunch',
      'catch up',
      'call with',
      'chat with',
    ],
    patterns: [
      /with\s+(friends?|family|mom|dad|parents|brother|sister)/i,
      /\bdinner\b/i,
      /\blunch\b/i,
    ],
  },
  {
    category: 'mindfulness',
    keywords: [
      'meditation',
      'meditate',
      'mindfulness',
      'prayer',
      'pray',
      'breathing',
      'yoga',
      'retreat',
      'church',
      'mosque',
      'temple',
      'synagogue',
      'service',
      'mass',
      'spiritual',
      'devotion',
      'quiet time',
      'reflection',
    ],
    patterns: [/meditation/i, /prayer/i, /mindful/i],
  },
  {
    category: 'creative',
    keywords: [
      'art',
      'paint',
      'painting',
      'draw',
      'drawing',
      'music',
      'guitar',
      'piano',
      'sing',
      'singing',
      'write',
      'writing',
      'craft',
      'crafts',
      'pottery',
      'knit',
      'knitting',
      'sew',
      'sewing',
      'photo',
      'photography',
      'design',
      'creative',
      'studio',
      'practice',
      'rehearsal',
      'band',
      'jam',
      'recording',
      'compose',
      'composing',
    ],
    patterns: [/\bart\b/i, /\bmusic\b/i, /\bpractice\b/i],
  },
  {
    category: 'productive',
    keywords: [
      'meeting',
      'work',
      'office',
      'project',
      'deadline',
      'presentation',
      'call',
      'standup',
      'review',
      'planning',
      'sprint',
      'sync',
      'interview',
      'appointment',
      'doctor',
      'dentist',
      'therapy',
      'therapist',
      'counselor',
      'errand',
      'errands',
      'chores',
      'cleaning',
      'laundry',
      'shopping',
      'groceries',
      'bills',
      'taxes',
      'admin',
      'task',
    ],
    patterns: [/\bmeeting\b/i, /\b1:1\b/i, /\bone on one\b/i, /stand\s?up/i, /check[\s-]?in/i],
  },
  {
    category: 'self-care',
    keywords: [
      'haircut',
      'spa',
      'massage',
      'sauna',
      'bath',
      'nap',
      'sleep',
      'rest',
      'relax',
      'relaxation',
      'skincare',
      'manicure',
      'pedicure',
      'facial',
      'self-care',
      'selfcare',
      'doctor',
      'dentist',
      'checkup',
      'health',
      'wellness',
    ],
    patterns: [/self[\s-]?care/i, /\bsauna\b/i],
  },
  {
    category: 'leisure',
    keywords: [
      'movie',
      'movies',
      'cinema',
      'netflix',
      'tv',
      'show',
      'game',
      'games',
      'gaming',
      'video game',
      'read',
      'reading',
      'book',
      'podcast',
      'youtube',
      'stream',
      'streaming',
      'concert',
      'theater',
      'theatre',
      'museum',
      'exhibition',
      'zoo',
      'park',
      'beach',
      'vacation',
      'holiday',
      'trip',
      'travel',
      'sightseeing',
      'explore',
    ],
    patterns: [/\bmovie/i, /\bgame/i, /\btrip\b/i],
  },
  {
    category: 'values-aligned',
    keywords: [
      'volunteer',
      'volunteering',
      'charity',
      'donate',
      'donation',
      'community',
      'mentor',
      'mentoring',
      'teach',
      'teaching',
      'tutor',
      'tutoring',
      'help',
      'helping',
      'service',
      'cause',
      'activism',
      'fundraiser',
      'nonprofit',
    ],
    patterns: [/volunteer/i, /communit(y|ies)/i],
  },
]

export function categorizeActivity(title: string, description?: string): ActivityCategory {
  const text = `${title} ${description || ''}`.toLowerCase()

  const scores: Partial<Record<ActivityCategory, number>> = {}

  for (const pattern of CATEGORY_PATTERNS) {
    let score = 0

    for (const keyword of pattern.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += keyword.length > 5 ? 2 : 1
      }
    }

    for (const regex of pattern.patterns) {
      if (regex.test(text)) {
        score += 3
      }
    }

    if (score > 0) {
      scores[pattern.category] = (scores[pattern.category] || 0) + score
    }
  }

  let bestCategory: ActivityCategory = 'other'
  let bestScore = 0

  for (const [category, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score
      bestCategory = category as ActivityCategory
    }
  }

  return bestCategory
}

export function getCategoryInfo(category: ActivityCategory) {
  return ACTIVITY_CATEGORIES.find((c) => c.id === category)
}

export function suggestCategoryFromTitle(title: string): {
  category: ActivityCategory
  confidence: 'high' | 'medium' | 'low'
  alternatives: ActivityCategory[]
} {
  const text = title.toLowerCase()
  const scores: Array<{ category: ActivityCategory; score: number }> = []

  for (const pattern of CATEGORY_PATTERNS) {
    let score = 0

    for (const keyword of pattern.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += keyword.length > 5 ? 2 : 1
      }
    }

    for (const regex of pattern.patterns) {
      if (regex.test(text)) {
        score += 3
      }
    }

    scores.push({ category: pattern.category, score })
  }

  scores.sort((a, b) => b.score - a.score)

  const topScore = scores[0]?.score || 0

  let confidence: 'high' | 'medium' | 'low' = 'low'
  if (topScore >= 5) {
    confidence = 'high'
  } else if (topScore >= 2) {
    confidence = 'medium'
  }

  const alternatives = scores
    .filter((s) => s.score > 0 && s.category !== scores[0]?.category)
    .slice(0, 2)
    .map((s) => s.category)

  return {
    category: topScore > 0 ? scores[0].category : 'other',
    confidence,
    alternatives,
  }
}
