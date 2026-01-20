# CBTJournal

Track your thoughts with cognitive behavioral therapy techniques based on "Feeling Good" by David D. Burns, M.D. Identify cognitive distortions using the untwist technique and monitor your mental health over time.

## Features

- **Daily thought records**: Log situations, emotions, automatic thoughts, cognitive distortions, and rational responses.
- **Gratitude journal**: Daily gratitude practice to build positive thought patterns.
- **Depression checklist**: Track symptoms using the Burns Depression Checklist (25 items, scored 0-100).
- **Pattern insights**: Visualize your most common cognitive distortions, emotional patterns, and trends over time.
- **Offline-first**: Works without internet connection, all data stays on your device.
- **PWA support**: Install as an app on your phone or desktop.
- **Data export/import**: Export your data as JSON for backup or analysis, import to restore.
- **Auto-save** (Chrome/Edge): Set up a local file that automatically stays in sync with your data.
- **Cloud sync** (optional): Sync your data across devices via Google Drive or Dropbox.

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

## Cloud sync setup (optional)

Cloud sync allows you to keep your data synchronized across multiple devices. To enable it, you'll need to set up API credentials.

### Google Drive

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API
4. Go to "Credentials" and create:
   - An OAuth 2.0 Client ID (Web application type)
   - An API key
5. Add your domain to authorized JavaScript origins in the OAuth client
6. Restrict the API key to Google Drive API only

### Dropbox

1. Go to [Dropbox Developer Apps](https://www.dropbox.com/developers/apps)
2. Create a new app with "Scoped access" 
3. Choose "Full Dropbox" or "App folder" access
4. Copy the App key
5. Add your redirect URI: `https://yourdomain.com/dropbox-callback`

### Environment variables

Create a `.env` file based on `.env.example`:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your-api-key
VITE_DROPBOX_APP_KEY=your-app-key
```

## Local auto-save (Chrome/Edge only)

On desktop Chrome and Edge browsers, you can set up auto-save to automatically save your data to a local file. The app remembers the file location and updates it whenever you make changes. This works without any cloud setup.

1. Go to Settings
2. Click "Set up auto-save"
3. Choose where to save your data file
4. The app will automatically keep this file updated

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
- File System Access API (auto-save)
- Google Drive API / Dropbox API (cloud sync)

## Data privacy

All data is stored locally in your browser's IndexedDB by default. No data is sent to any server unless you explicitly enable cloud sync. When cloud sync is enabled, your data is stored in your own Google Drive or Dropbox account - we never see or store your data.

Export regularly for backup, or enable auto-save/cloud sync for automatic backups.

## Contributing

Contributions are welcome. Please open an issue first to discuss what you would like to change.

## Disclaimer

This app is a self-help tool and is not a replacement for professional mental health care. If you're struggling with depression, anxiety, or other mental health issues, please reach out to a qualified mental health professional.

## License

MIT

## Acknowledgments

Based on the cognitive behavioral therapy techniques from "Feeling Good: The New Mood Therapy" by David D. Burns, M.D.
