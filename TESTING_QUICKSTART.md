# Testing Quickstart Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Installation

### Frontend Tests
```bash
cd web
npm install
```

This will install all testing dependencies including:
- vitest
- @testing-library/react
- @testing-library/jest-dom
- jsdom

### Backend Tests
```bash
cd server
npm install
```

This will install:
- vitest
- supertest

## Running Tests

### Quick Test Run

**Frontend:**
```bash
cd web
npm test
```

**Backend:**
```bash
cd server
npm test
```

### Watch Mode (Auto-rerun on changes)

**Frontend:**
```bash
cd web
npm test -- --watch
```

**Backend:**
```bash
cd server
npm test -- --watch
```

### UI Mode (Interactive test viewer)

**Frontend:**
```bash
cd web
npm run test:ui
```

### Coverage Report

**Frontend:**
```bash
cd web
npm run test:coverage
```

**Backend:**
```bash
cd server
npm run test:coverage
```

Coverage reports will be generated in `./coverage/` directory.

## Test Results

### Expected Output

All tests should pass with output similar to:

```
✓ src/lib/api.test.js (15 tests)
✓ src/components/CardTile.test.jsx (6 tests)
✓ src/components/DeckCard.test.jsx (8 tests)
✓ src/components/InventoryTable.test.jsx (7 tests)

Test Files  4 passed (4)
Tests  36 passed (36)
Duration  2.5s
```

### Coverage Metrics

Target coverage:
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

## Debugging Tests

### Run Single Test File

```bash
npm test -- CardTile.test.jsx
```

### Run Tests Matching Pattern

```bash
npm test -- --grep "should render"
```

### Verbose Output

```bash
npm test -- --reporter=verbose
```

## Common Issues & Solutions

### Issue: Tests fail with "fetch is not defined"
**Solution**: Check that `web/src/test/setup.js` is properly configured.

### Issue: React components fail to render
**Solution**: Use `renderWithProviders` from test utils instead of plain `render`.

### Issue: Tests timeout
**Solution**: Increase timeout in vitest.config.js:
```javascript
test: {
  testTimeout: 10000
}
```

### Issue: Module not found errors
**Solution**: Run `npm install` again to ensure all dependencies are installed.

## Test Structure

```
📁 Project Root
├── 📁 web/
│   ├── 📁 src/
│   │   ├── 📁 test/
│   │   │   ├── setup.js
│   │   │   └── utils.jsx
│   │   ├── 📁 components/
│   │   │   ├── CardTile.jsx
│   │   │   └── CardTile.test.jsx
│   │   └── 📁 lib/
│   │       ├── api.js
│   │       └── api.test.js
│   ├── vitest.config.js
│   └── package.json
└── 📁 server/
    ├── 📁 src/
    │   └── 📁 routes/
    │       └── 📁 __tests__/
    │           ├── decks.test.js
    │           └── deckListings.test.js
    ├── vitest.config.js
    └── package.json
```

## Writing New Tests

### Component Test Template

```javascript
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test/utils';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### API Test Template

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

describe('MyAPI', () => {
  beforeEach(() => {
    // Setup mocks
  });

  it('should handle GET request', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .expect(200);
    
    expect(response.body).toBeDefined();
  });
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd web && npm install && npm test
      - run: cd server && npm install && npm test
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Run tests to ensure everything works
3. ✅ Check coverage reports
4. ✅ Review test documentation
5. ✅ Write tests for new features

For detailed test documentation, see [TEST_DOCUMENTATION.md](./TEST_DOCUMENTATION.md)

