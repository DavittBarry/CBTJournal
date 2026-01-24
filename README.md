# CBTJournal

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff.svg)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8.svg)](https://web.dev/progressive-web-apps/)

A private, offline-first mental wellness application built with cognitive behavioral therapy techniques. Based on "Feeling Good" by David D. Burns, M.D.

## Features

### Core tools
- **Thought records**: Log situations, emotions, automatic thoughts, cognitive distortions, and rational responses
- **Mood assessments**: Clinically validated PHQ-9 (depression) and GAD-7 (anxiety) screenings
- **Gratitude journal**: Daily gratitude practice to build positive thought patterns
- **Activity scheduling**: Plan and track activities with mood ratings
- **Coping toolkit**: DBT, ACT, and MBCT techniques including TIPP skills, grounding, and breathing exercises
- **Safety plan**: Crisis management tool following evidence-based protocols

### Privacy and data
- **Offline-first**: Works without internet, all data stays on your device
- **No tracking**: Zero analytics, no data collection
- **Local storage**: IndexedDB for reliable local persistence
- **Cloud sync** (optional): Sync via your own Google Drive or Dropbox
- **Auto-save** (Chrome/Edge): File System Access API for automatic local backups
- **Export/Import**: JSON backup and restore

### Technical
- **PWA**: Install as an app on any device
- **Dark mode**: System preference detection with manual override
- **Responsive**: Mobile, tablet, and desktop optimized
- **Accessible**: WCAG compliant with keyboard navigation support

## The 10 cognitive distortions

Based on David D. Burns' work:

1. All-or-nothing thinking
2. Overgeneralization
3. Mental filter
4. Disqualifying the positive
5. Jumping to conclusions
6. Magnification or minimization
7. Emotional reasoning
8. Should statements
9. Labeling and mislabeling
10. Personalization

## Getting started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/cbtjournal.git
cd cbtjournal

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

### Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format with Prettier |

## Cloud sync setup (optional)

Cloud sync keeps your data synchronized across devices using your own cloud storage.

### Google Drive

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google Drive API
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
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS |
| State | Zustand |
| Storage | IndexedDB (idb) |
| Charts | Recharts |
| PWA | vite-plugin-pwa |
| Mobile | Capacitor (iOS/Android) |

## Project structure

```
src/
├── components/     # React components
├── db/             # IndexedDB database layer
├── hooks/          # Custom React hooks
├── stores/         # Zustand state management
├── types/          # TypeScript types and constants
└── utils/          # Utility functions
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

See [SECURITY.md](SECURITY.md) for security policy and reporting vulnerabilities.

## Disclaimer

This app is a self-help tool and is not a replacement for professional mental health care. If you're struggling with depression, anxiety, or other mental health issues, please reach out to a qualified mental health professional.

**Crisis resources:**
- International: [IASP Crisis Centers](https://www.iasp.info/resources/Crisis_Centres/)
- US: 988 Suicide & Crisis Lifeline
- UK: Samaritans (116 123)

## License

[MIT](LICENSE)

## Acknowledgments

Based on cognitive behavioral therapy techniques from "Feeling Good: The New Mood Therapy" by David D. Burns, M.D.
