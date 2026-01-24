# Contributing to CBTJournal

Thank you for your interest in contributing to CBTJournal. This document provides guidelines and information for contributors.

## Code of conduct

Please be respectful and constructive in all interactions. This is a mental health application, and we maintain a supportive environment for both users and contributors.

## Getting started

1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/your-feature-name`
5. Start the development server: `npm run dev`

## Development workflow

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues
npm run format     # Format code with Prettier
```

### Code style

- We use TypeScript for type safety
- ESLint and Prettier enforce code style
- Run `npm run lint:fix && npm run format` before committing
- Follow the existing patterns in the codebase

### Commit messages

We use conventional commits. Format your commit messages as:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(mood): add PHQ-9 screening assessment
fix(export): correct date formatting in backup files
docs(readme): update cloud sync instructions
```

## Pull request process

1. Update the CHANGELOG.md with your changes under "Unreleased"
2. Ensure all tests pass and there are no linting errors
3. Update documentation if needed
4. Request review from maintainers

## Sensitive content guidelines

CBTJournal handles mental health data. When contributing:

- Never log personal or sensitive data
- Ensure all data stays local unless explicitly synced by user
- Be thoughtful about crisis-related features
- Test edge cases around sensitive content (e.g., suicidal ideation questions)

## Architecture overview

```
src/
├── components/    # React components
├── db/            # IndexedDB database layer
├── hooks/         # Custom React hooks
├── stores/        # Zustand state management
├── types/         # TypeScript types and constants
└── utils/         # Utility functions
```

Key technologies:
- React 18 with TypeScript
- Zustand for state management
- IndexedDB via idb for local storage
- Tailwind CSS for styling
- Vite for build tooling

## Questions?

Open an issue for questions or discussions. For security-related issues, please email directly rather than opening a public issue.
