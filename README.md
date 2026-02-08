# CBTJournal

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff.svg)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8.svg)](https://web.dev/progressive-web-apps/)

A private, offline-first mental wellness app combining evidence-based CBT techniques with clinically validated mood assessments, gratitude journaling, behavioral activation, and personalized insights. All data stays on your device by default.

## Features

### Thought records
Log situations, identify automatic thoughts, spot cognitive distortions, and develop balanced rational responses. Supports four modes:
- **Standard** - Full CBT thought record with before/after emotion tracking
- **Simple** - Quick entry for when you need something lighter
- **Behavioral experiment** - Test predictions against real outcomes
- **Defusion technique** - ACT-based thought defusion exercises

Tracks 14 cognitive distortions based on David D. Burns' work, with inline descriptions, challenge questions, and reframing strategies for each.

### Mood assessments
Clinically validated screening tools with score interpretation and tracking over time:
- **PHQ-9** - Patient Health Questionnaire for depression (9 items, scores 0-27)
- **GAD-7** - Generalized Anxiety Disorder scale (7 items, scores 0-21)

### Gratitude journal
Daily gratitude practice with optional deeper reflection fields:
- List what you're grateful for each day
- Reflect on why these things matter to you
- Record a savoring moment from the day

### Activity scheduling & behavioral activation
Plan and track activities across categories (physical, social, creative, self-care, productive, mindfulness, values-aligned, leisure). Rate mood before and after to build a personal evidence base of what actually helps.

### Coping toolkit
Organized by therapeutic approach:
- **DBT skills** - Distress tolerance (TIPP, grounding, ice diving), emotion regulation, mindfulness, interpersonal effectiveness
- **ACT techniques** - Acceptance, values clarification, cognitive defusion, mindfulness
- **MBCT practices** - Body scan, breathing space, mindful movement

### Safety plan
Crisis management tool following the Stanley-Brown model with structured steps for warning signs, coping strategies, social supports, professional contacts, and reasons for living.

### Insights dashboard
Personalized analytics across four tabs:
- **Overview** - Combined insights, mood assessment trends, weekly patterns, gratitude summary
- **Thoughts** - Emotional intensity trends, cognitive distortion analysis with co-occurrence mapping, emotion patterns with trigger identification
- **Activities** - Category breakdown, top mood boosters, activity balance radar chart, weekly trends
- **Gratitude** - Practice streaks, depth score, weekly volume trends, theme detection (family, health, nature, work, etc.), day-of-week patterns

### Privacy and data
- **Offline-first** - Works without internet, all data stays on your device
- **No tracking** - Zero analytics, no data collection, no third-party services
- **Local storage** - IndexedDB with automatic schema migrations
- **Cloud sync** (optional) - Sync via your own Google Drive or Dropbox account
- **Auto-save** (Chrome/Edge) - File System Access API for automatic local backups
- **Export/Import** - JSON backup and restore with merge or replace modes
- **Sample data** - Load example entries to explore the app before adding your own data

### Technical
- **PWA** - Installable on any device with offline support via Workbox precaching
- **Dark mode** - System preference detection with manual override
- **Responsive** - Mobile, tablet, and desktop layouts
- **Accessible** - Keyboard navigation, skip-to-content, semantic HTML
- **Cross-platform** - Web, iOS, and Android via Capacitor

## Getting started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
git clone https://github.com/DavittBarry/cbtjournal.git
cd cbtjournal
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

On first launch, the onboarding flow offers to load sample data so you can explore how everything works before adding your own entries. You can also load or clear sample data anytime from Settings.

### Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 5173) |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format with Prettier |

## Cloud sync setup (optional)

Cloud sync keeps your data synchronized across devices using your own cloud storage. The app never touches your data - sync goes directly between your device and your cloud provider.

### Google Drive

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google Drive API and Google Calendar API
4. Create OAuth 2.0 credentials (Web application)
5. Add your domain to authorized JavaScript origins
6. Create an API key restricted to Google Drive API

### Dropbox

1. Go to [Dropbox Developer Apps](https://www.dropbox.com/developers/apps)
2. Create a new app with "Scoped access"
3. Copy the App key
4. Add your redirect URI

### Environment variables

Create a `.env` file based on `.env.example`:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your-api-key
VITE_DROPBOX_APP_KEY=your-app-key
```

## Tech stack

| Category | Technology |
|----------|------------|
| Framework | React 18 + TypeScript 5.3 |
| Build | Vite 7 |
| Styling | Tailwind CSS 3.4 |
| State | Zustand 4 |
| Storage | IndexedDB (idb 8) |
| Charts | Recharts 2 |
| Dates | date-fns 3 |
| PWA | vite-plugin-pwa |
| Mobile | Capacitor 8 (iOS/Android) |

## Project structure

```
src/
├── components/     # React components (views, forms, cards, navigation)
├── db/             # IndexedDB database layer with migrations
├── hooks/          # Custom hooks (Google auth, calendar, reminders)
├── services/       # OAuth2 authentication flows
├── stores/         # Zustand state management (app, google, backup, theme, toast, calendar)
├── types/          # TypeScript types, clinical content, therapeutic constants
└── utils/          # Insight generators, cloud sync, backup, logging
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

See [SECURITY.md](SECURITY.md) for security policy and reporting vulnerabilities.

## Disclaimer

This app is a self-help tool and is not a replacement for professional mental health care. If you are experiencing a mental health crisis, please contact emergency services or a crisis helpline.

**Crisis resources:**
- International: [Find A Helpline](https://www.findahelpline.com/)
- US: 988 Suicide & Crisis Lifeline
- UK: Samaritans (116 123)

## License

[MIT](LICENSE)

## Author

**Davitt Barry**
- Website: [davittbarry.dev](https://davittbarry.dev/)
- LinkedIn: [davittbarry](https://www.linkedin.com/in/davittbarry/)

## Acknowledgments

Built on evidence-based techniques from cognitive behavioral therapy (CBT), dialectical behavior therapy (DBT), acceptance and commitment therapy (ACT), and mindfulness-based cognitive therapy (MBCT). Clinical assessments use the PHQ-9 and GAD-7 validated instruments.
