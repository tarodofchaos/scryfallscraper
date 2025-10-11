# Install and Run Tests - Step by Step

## Prerequisites

Before running tests, make sure you have:
- Node.js 18+ installed
- npm installed
- All application dependencies installed

## Step 1: Install Test Dependencies

### Frontend
```bash
cd web
npm install
```

This will install the following test dependencies:
- `vitest` - Test framework
- `@testing-library/react` - React component testing
- `@testing-library/jest-dom` - DOM matchers
- `@vitejs/plugin-react` - React plugin for Vite
- `jsdom` - Browser environment simulation
- `@vitest/ui` - Test UI (optional)

### Backend
```bash
cd server
npm install
```

This will install:
- `vitest` - Test framework
- `supertest` - HTTP testing

## Step 2: Verify Installation

Check that test scripts are available:

```bash
# Frontend
cd web
npm run test -- --version

# Backend  
cd server
npm run test -- --version
```

## Step 3: Run Tests

### Run All Tests (Frontend)
```bash
cd web
npm test
```

### Run Tests in Watch Mode
```bash
cd web
npm test -- --watch
```

### Run with Coverage
```bash
cd web
npm run test:coverage
```

### Run Specific Test File
```bash
cd web
npm test -- basic.test
```

## Expected Output

When tests run successfully, you should see:

```
✓ src/__tests__/basic.test.js (4 tests) 4ms
✓ src/lib/api.test.js (15 tests) 25ms

Test Files  2 passed (2)
Tests  19 passed (19)
Start at  12:00:00
Duration  500ms
```

## Troubleshooting

### Issue: "Cannot find module"
**Solution**: Run `npm install` again to ensure all dependencies are installed.

### Issue: Tests timeout
**Solution**: The tests might be trying to make real API calls. Check that mocks are properly configured.

### Issue: "jsdom not found"
**Solution**: 
```bash
cd web
npm install --save-dev jsdom
```

### Issue: "@testing-library/react not found"
**Solution**:
```bash
cd web
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

### Issue: Tests fail with import errors
**Solution**: Make sure you're in the correct directory:
```bash
pwd  # Should show /path/to/project/web
```

## Manual Dependency Installation

If automatic installation doesn't work, install dependencies manually:

### Frontend Test Dependencies
```bash
cd web
npm install --save-dev vitest@^1.0.4
npm install --save-dev @testing-library/react@^14.1.2
npm install --save-dev @testing-library/jest-dom@^6.1.5
npm install --save-dev @vitejs/plugin-react@^4.2.1
npm install --save-dev jsdom@^23.0.1
npm install --save-dev @vitest/ui@^1.0.4
```

### Backend Test Dependencies
```bash
cd server
npm install --save-dev vitest@^1.0.4
npm install --save-dev supertest@^6.3.3
```

## Verifying Test Setup

### 1. Check package.json scripts
```bash
cd web
cat package.json | grep -A 3 "scripts"
```

Should show:
```json
"scripts": {
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage"
}
```

### 2. Check vitest.config.js exists
```bash
cd web
ls -la vitest.config.js
```

### 3. Run a simple test
```bash
cd web
npm test -- basic.test
```

## Test Files Structure

```
web/
├── vitest.config.js          ← Vitest configuration
├── package.json              ← Test scripts defined here
└── src/
    ├── test/
    │   ├── setup.js          ← Test environment setup
    │   └── utils.jsx         ← Test utilities
    ├── __tests__/
    │   └── basic.test.js     ← Basic passing tests
    ├── lib/
    │   └── api.test.js       ← API tests
    └── components/
        └── *.test.jsx        ← Component tests
```

## Next Steps

1. ✅ Install dependencies: `cd web && npm install`
2. ✅ Run tests: `npm test`
3. ✅ Check results
4. ✅ Run coverage: `npm run test:coverage`

## Quick Commands Reference

```bash
# Install all dependencies
cd web && npm install && cd ../server && npm install

# Run frontend tests
cd web && npm test

# Run backend tests  
cd server && npm test

# Generate coverage
cd web && npm run test:coverage

# Watch mode
cd web && npm test -- --watch

# Run specific test
cd web && npm test -- api.test

# Clear cache and rerun
cd web && npm test -- --clearCache
```

## Support

If tests still don't work after following these steps:
1. Check Node.js version: `node --version` (should be 18+)
2. Clear node_modules: `rm -rf node_modules package-lock.json && npm install`
3. Check for conflicting global packages
4. Try running with `--no-cache` flag

For more help, see:
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)

