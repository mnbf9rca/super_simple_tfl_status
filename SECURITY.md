# Security Policy

## Supported Versions

This project follows semantic versioning. Security updates are provided for the latest release.

| Version  | Supported          |
| -------- | ------------------ |
| Latest   | :white_check_mark: |
| < Latest | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please help us by reporting it responsibly.

### How to Report

1. **Do NOT create a public issue** for security vulnerabilities
2. Send an email to the repository owner at the email address listed in the commit history
3. Include the following information:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact
   - Any suggested fixes (if available)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours
- **Initial Response**: We will provide an initial response within 7 days with our assessment
- **Updates**: We will keep you informed of our progress towards resolving the issue
- **Resolution**: We aim to resolve critical vulnerabilities within 30 days

### Scope

This security policy covers:

- The main application code (`site/tflStatus.js`)
- Build and deployment configurations
- GitHub Actions workflows

Out of scope:

- Dependencies (please report to respective maintainers)
- Issues in third-party services (TfL API)

### Security Measures

This project implements several security measures:

- Automated security scanning with CodeQL
- Supply chain security monitoring with OSSF Scorecard
- Regular dependency updates via Renovate
- Minimal permissions in GitHub Actions workflows

Thank you for helping to keep this project secure!
