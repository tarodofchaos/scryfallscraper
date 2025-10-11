import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

// Custom render function that includes providers
export function renderWithProviders(ui, options = {}) {
  const Wrapper = ({ children }) => {
    return (
      <I18nextProvider i18n={i18n}>
        {children}
      </I18nextProvider>
    );
  };

  return render(ui, { wrapper: Wrapper, ...options });
}

// Mock user data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  display: 'Test User'
};

// Mock card data
export const mockCard = {
  id: 'test-card-id',
  name: 'Lightning Bolt',
  set: 'M15',
  imageUrl: 'https://example.com/image.jpg',
  prices: {
    usd: '2.50',
    eur: '2.30'
  }
};

// Mock deck data
export const mockDeck = {
  id: 'test-deck-id',
  name: 'Test Commander Deck',
  source: 'manabox',
  url: 'https://manabox.app/deck/test',
  cards: [
    { quantity: 1, name: 'Lightning Bolt', set: 'M15' },
    { quantity: 4, name: 'Counterspell', set: 'M15' }
  ],
  totalCards: 5,
  validCards: 5,
  invalidCards: 0,
  owner: 'test@example.com',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Mock inventory item
export const mockInventoryItem = {
  id: 'test-item-id',
  printingId: 'test-printing-id',
  condition: 'NM',
  language: 'EN',
  quantity: 1,
  owner: mockUser,
  printing: {
    id: 'test-printing-id',
    name: 'Lightning Bolt',
    set: 'M15',
    imageNormal: 'https://example.com/image.jpg'
  }
};

// Mock listing
export const mockListing = {
  id: 'test-listing-id',
  priceEur: '2.50',
  qtyAvailable: 1,
  status: 'ACTIVE',
  seller: mockUser,
  printing: {
    id: 'test-printing-id',
    name: 'Lightning Bolt',
    set: 'M15',
    imageNormal: 'https://example.com/image.jpg'
  }
};

// Re-export everything from testing-library
export * from '@testing-library/react';

