# Security policy

## Supported versions

| Version | Supported          |
| ------- | ------------------ |
| 1.1.x   | :white_check_mark: |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a vulnerability

If you discover a security vulnerability in CBTJournal, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, please email the maintainer directly with:

1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Any suggested fixes (optional)

You can expect:
- Acknowledgment within 48 hours
- Regular updates on the fix progress
- Credit in the security advisory (if desired)

## Security considerations

### Data storage

- All user data is stored locally in the browser's IndexedDB
- No data is transmitted to any server unless the user explicitly enables cloud sync
- Cloud sync uses the user's own Google Drive or Dropbox account

### Cloud sync security

- OAuth 2.0 is used for authentication with Google Drive and Dropbox
- Access tokens are stored locally and never transmitted to our servers
- We request minimum necessary permissions

### Privacy by design

- No analytics or tracking
- No external API calls except for user-initiated cloud sync
- No data collection whatsoever

### Content security

- Strict Content Security Policy headers
- No inline scripts (except for necessary PWA functionality)
- All external resources are explicitly whitelisted

## Best practices for users

1. **Enable auto-save or cloud sync** to prevent data loss
2. **Export your data regularly** as a backup
3. **Use a secure browser** and keep it updated
4. **Be cautious on shared devices** - your data is stored in the browser

## Dependencies

We regularly update dependencies to address known vulnerabilities. Run `npm audit` to check the current status.
