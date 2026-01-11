# Untwist

Untwist your thinking with cognitive behavioral therapy techniques based on "Feeling Good" by David D. Burns, M.D. Track your thoughts, identify cognitive distortions, and monitor your mental health over time.

## Features

- **Daily thought records**: Log situations, emotions, automatic thoughts, cognitive distortions, and rational responses.
- **Depression checklist**: Track symptoms using the Burns Depression Checklist (25 items, scored 0-100).
- **Pattern insights**: Visualize your most common cognitive distortions, emotional patterns, and trends over time.
- **Offline-first**: Works without internet connection, all data stays on your device.
- **PWA support**: Install as an app on your phone or desktop.
- **Data export**: Export your data as JSON for backup or analysis.

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

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

## Building for production

```bash
npm run build
```

The built files will be in the `dist` folder. Deploy to any static hosting service (Netlify, Vercel, GitHub Pages, etc.).

## Tech stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- IndexedDB via idb (local storage)
- Recharts (visualizations)
- vite-plugin-pwa (PWA support)

## Data privacy

All data is stored locally in your browser's IndexedDB. No data is sent to any server. You own your data completely. Export regularly for backup.

## Contributing

Contributions are welcome. Please open an issue first to discuss what you would like to change.

## Disclaimer

This app is a self-help tool and is not a replacement for professional mental health care. If you're struggling with depression, anxiety, or other mental health issues, please reach out to a qualified mental health professional.

## License

MIT

## Acknowledgments

Based on the cognitive behavioral therapy techniques from "Feeling Good: The New Mood Therapy" by David D. Burns, M.D.
