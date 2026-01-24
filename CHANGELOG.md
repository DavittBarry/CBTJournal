# Changelog

All notable changes to CBTJournal will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-01-24

### Added
- CHANGELOG.md for version tracking
- Skip-to-content link for keyboard accessibility
- Engine requirements in package.json
- Project metadata (description, keywords, author)

### Changed
- Unified card expansion behavior across all views (HomeView, GratitudeView, ChecklistView)
- Green ring border now persists on expanded cards regardless of mouse position
- Improved grid layout maintains structure during card expansion

### Fixed
- TypeScript error with `hasOutcome` boolean type in HomeView
- Stray character in ErrorBoundary component
- Viewport meta tag now allows user zooming (WCAG accessibility compliance)

### Security
- Removed `user-scalable=no` which was preventing accessibility zoom features

## [1.0.0] - Initial Release

### Added
- Thought records with cognitive distortion identification
- PHQ-9 depression screening (clinically validated)
- GAD-7 anxiety screening (clinically validated)
- Quick mood check for daily tracking
- Gratitude journal with daily entries
- Activity scheduling and tracking
- Coping toolkit with DBT, ACT, and MBCT techniques
- Safety plan builder
- Insights dashboard with pattern visualization
- Cloud sync (Google Drive, Dropbox)
- Local auto-save (Chrome/Edge File System Access API)
- PWA support for offline use
- Dark mode support
- Data export/import functionality
