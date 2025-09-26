# Contributing to Super Simple TfL Status

Thank you for your interest in contributing to Super Simple TfL Status! This document provides guidelines and information for contributors.

## Table of Contents

- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

## Development Setup

### Prerequisites

- **Node.js 24.x** (LTS version)
- **npm** (comes with Node.js)
- **Git**

### Getting Started

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/super_simple_tfl_status.git
   cd super_simple_tfl_status
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run tests to verify setup**
   ```bash
   npm test
   ```

4. **Open the application locally**
   ```bash
   # Open site/index.html in your browser
   # Or use a local server like:
   npx serve site
   ```

## Code Style

This project uses automated code formatting and linting:

### ESLint

- **Run linting**: `npm run lint`
- **Auto-fix issues**: `npm run lint -- --fix`
- Configuration is in `eslint.config.js`

### Prettier

- **Check formatting**: `npm run format:check`
- **Auto-format**: `npm run format`
- Configuration is in `.prettierrc`

### EditorConfig

The project includes `.editorconfig` for consistent formatting across editors:
- 2-space indentation for JavaScript/JSON
- UTF-8 encoding
- LF line endings
- Trim trailing whitespace

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

### Test Structure

- Test files are located in `site/` alongside source files
- Tests use **Jest** with **jsdom** environment
- Coverage target: **>90%** for all metrics

### Writing Tests

- Follow existing patterns in `site/tflStatus.test.js`
- Use descriptive test names
- Mock external dependencies (fetch, setTimeout, etc.)
- Test both success and error scenarios

### Environment Detection Testing

When testing environment detection:
```javascript
// Safely mock window.location
const originalLocation = window.location;
delete window.location;
window.location = { ...originalLocation, hostname: 'localhost' };

// Your test code here

// Restore original location
window.location = originalLocation;
```

## Pull Request Process

### Before Submitting

1. **Ensure all tests pass**
   ```bash
   npm test
   ```

2. **Check code style**
   ```bash
   npm run lint
   npm run format:check
   ```

3. **Update documentation** if needed

### PR Guidelines

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Write clear commit messages**
   ```
   feat: add support for bus status display

   - Added bus mode to supported transport types
   - Updated tests for bus status handling
   - Added bus color scheme to lineColours
   ```

3. **Keep PRs focused** - one feature or fix per PR

4. **Add tests** for new functionality

5. **Update JSDoc comments** for new/modified functions

### Commit Message Format

Use conventional commits format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for test changes
- `chore:` for maintenance tasks

## Project Structure

```
super_simple_tfl_status/
├── site/
│   ├── index.html          # Main HTML file
│   ├── tflStatus.js        # Core application logic
│   ├── tflStatus.test.js   # Test suite
│   └── style.css           # Styles
├── .github/
│   └── workflows/          # CI/CD workflows
├── .editorconfig           # Editor configuration
├── .prettierrc             # Prettier configuration
├── eslint.config.js        # ESLint configuration
├── jest.config.js          # Jest configuration
├── package.json            # Dependencies and scripts
└── README.md               # Project documentation
```

### Key Files

- **`site/tflStatus.js`** - Main application with exported functions
- **`site/tflStatus.test.js`** - Comprehensive test suite
- **`site/index.html`** - Minimal HTML page that loads the script
- **`site/style.css`** - CSS for status block styling

## Troubleshooting

### Common Issues

#### Tests Failing Locally

1. **Check Node.js version**
   ```bash
   node --version  # Should be 24.x
   ```

2. **Clear npm cache**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check for global Jest conflicts**
   ```bash
   npm test -- --clearCache
   ```

#### Linting Errors

1. **Auto-fix common issues**
   ```bash
   npm run lint -- --fix
   ```

2. **Check specific rules** in `eslint.config.js`

#### Environment Detection Issues

When testing hostname-based detection, ensure:
- Use `delete window.location` followed by reassignment
- Restore original location in `afterEach`
- Set `process.env.NODE_ENV = 'test'` in tests

### Development Tips

1. **Use browser dev tools** to test API responses
2. **Check TfL API documentation** for new modes/features
3. **Test with different query parameters**:
   - `?mode=tube`
   - `?names=true`
   - `?mode=tube,elizabeth-line&names=true`

### Getting Help

- **Issues**: Open a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub discussions for questions
- **Code Review**: All PRs receive automated review from Sourcery AI

## Code of Conduct

Please be respectful and constructive in all interactions. This project follows standard open-source community guidelines:

- Be welcoming and inclusive
- Focus on constructive feedback
- Respect different viewpoints and experiences
- Accept responsibility for mistakes and learn from them

Thank you for contributing! 🚇✨