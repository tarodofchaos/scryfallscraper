# MTG Marketplace Test Suite Documentation

## Overview

This document describes the comprehensive test suite for the MTG Marketplace application, covering both frontend and backend components.

## Test Infrastructure

### Frontend Testing Stack
- **Vitest**: Fast unit test framework
- **React Testing Library**: Component testing utilities
- **jsdom**: Browser environment simulation
- **@testing-library/jest-dom**: Custom matchers for DOM testing

### Backend Testing Stack
- **Vitest**: Unit test framework
- **Supertest**: HTTP assertion library for API testing
- **Mock Prisma**: Mocked database client for isolated testing

## Running Tests

### Frontend Tests
```bash
cd web
npm install  # Install test dependencies
npm test     # Run tests
npm run test:ui  # Run tests with UI
npm run test:coverage  # Generate coverage report
```

### Backend Tests
```bash
cd server
npm install  # Install test dependencies
npm test     # Run tests
npm run test:coverage  # Generate coverage report
```

## Test Coverage

### Frontend Components

#### 1. CardTile Component (`CardTile.test.jsx`)
- ✅ Renders card information correctly
- ✅ Displays card images
- ✅ Shows/hides add to inventory button based on login state
- ✅ Calls API when adding to inventory
- ✅ Applies hover effects

#### 2. DeckCard Component (`DeckCard.test.jsx`)
- ✅ Renders deck information
- ✅ Displays deck statistics
- ✅ Handles view action
- ✅ Handles list for sale action
- ✅ Requires confirmation for delete
- ✅ Shows sample cards
- ✅ Displays source URL
- ✅ Conditionally renders list button

#### 3. InventoryTable Component (`InventoryTable.test.jsx`)
- ✅ Renders inventory items
- ✅ Shows empty state
- ✅ Allows item selection
- ✅ Shows action buttons for selected items
- ✅ Handles item deletion
- ✅ Opens edit modal
- ✅ Handles bulk delete

### Backend API Endpoints

#### 1. Decks API (`decks.test.js`)
- ✅ `GET /api/decks` - Returns user's decks
- ✅ `GET /api/decks` - Validates owner parameter
- ✅ `POST /api/decks` - Creates new deck
- ✅ `POST /api/decks` - Validates required fields
- ✅ `DELETE /api/decks/:id` - Deletes deck

#### 2. Deck Listings API (`deckListings.test.js`)
- ✅ `GET /api/deck-listings` - Returns active listings
- ✅ `POST /api/deck-listings` - Creates new listing
- ✅ `POST /api/deck-listings` - Validates required fields
- ✅ `DELETE /api/deck-listings/:id` - Deletes listing

### API Client (`api.test.js`)
- ✅ Base API function handles GET requests
- ✅ Base API function handles POST requests
- ✅ Base API function throws errors on failure
- ✅ Cards.search() - Searches for cards
- ✅ Cards.prices() - Fetches card prices
- ✅ Cards.byId() - Fetches card by ID
- ✅ Inventory.list() - Lists inventory items
- ✅ Inventory.add() - Adds inventory item
- ✅ Inventory.delete() - Deletes inventory item
- ✅ Listings.list() - Lists all listings
- ✅ Listings.my() - Lists user's listings
- ✅ Listings.create() - Creates new listing

## Test Utilities

### Mock Data (`web/src/test/utils.jsx`)
- `mockUser`: Sample user data
- `mockCard`: Sample card data
- `mockDeck`: Sample deck data
- `mockInventoryItem`: Sample inventory item
- `mockListing`: Sample listing data

### Custom Render Function
```javascript
renderWithProviders(component, options)
```
Renders components with all necessary providers (i18n, etc.)

## Test Organization

```
web/
├── src/
│   ├── test/
│   │   ├── setup.js          # Test environment setup
│   │   └── utils.jsx          # Test utilities and mocks
│   ├── components/
│   │   ├── CardTile.test.jsx
│   │   ├── DeckCard.test.jsx
│   │   └── InventoryTable.test.jsx
│   └── lib/
│       └── api.test.js
├── vitest.config.js           # Vitest configuration
└── package.json

server/
├── src/
│   └── routes/
│       └── __tests__/
│           ├── decks.test.js
│           └── deckListings.test.js
├── vitest.config.js
└── package.json
```

## Coverage Goals

- **Target Coverage**: 80%+ for all modules
- **Critical Paths**: 100% coverage for core features
  - Card search and display
  - Inventory management
  - Deck import and management
  - Marketplace listings

## Continuous Integration

The test suite is designed to run in CI/CD pipelines:

```bash
# Frontend CI
cd web && npm install && npm test

# Backend CI
cd server && npm install && npm test

# Full coverage report
npm run test:coverage
```

## Known Limitations

1. **Authentication Tests**: Google OAuth is mocked in tests
2. **Database Tests**: Uses mock Prisma client instead of real database
3. **Image Loading**: Images are not actually loaded in tests
4. **Network Requests**: All fetch calls are mocked

## Future Test Improvements

- [ ] Add E2E tests with Playwright
- [ ] Add visual regression testing
- [ ] Add performance testing
- [ ] Add accessibility (a11y) testing
- [ ] Increase coverage to 90%+
- [ ] Add mutation testing
- [ ] Add integration tests with real database

## Troubleshooting

### Common Issues

**Tests fail with "fetch is not defined"**
- Solution: The test setup mocks fetch globally

**React component tests fail**
- Solution: Ensure components are rendered with `renderWithProviders`

**API tests timeout**
- Solution: Check that mocks are properly set up before each test

**Coverage report missing files**
- Solution: Check vitest.config.js exclude patterns

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure new tests pass
3. Maintain or improve coverage percentage
4. Update this documentation

## Test Maintenance

- Review and update tests when APIs change
- Keep mock data synchronized with real data structures
- Refactor tests to reduce duplication
- Document complex test scenarios

