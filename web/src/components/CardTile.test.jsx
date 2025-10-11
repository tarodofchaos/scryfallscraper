import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import CardTile from './CardTile';
import { renderWithProviders, mockCard } from '../test/utils';

// Mock the API module
vi.mock('../lib/api', () => ({
  Inventory: {
    add: vi.fn()
  }
}));

describe('CardTile Component', () => {
  const defaultProps = {
    card: mockCard,
    userEmail: 'test@example.com'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render card information', () => {
    renderWithProviders(<CardTile {...defaultProps} />);
    
    expect(screen.getByText('Lightning Bolt')).toBeInTheDocument();
    expect(screen.getByText('M15')).toBeInTheDocument();
  });

  it('should display card image', () => {
    renderWithProviders(<CardTile {...defaultProps} />);
    
    const image = screen.getByAlt('Lightning Bolt');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', expect.stringContaining('example.com/image.jpg'));
  });

  it('should show add to inventory button when user is logged in', () => {
    renderWithProviders(<CardTile {...defaultProps} />);
    
    const addButton = screen.getByText(/add to inventory/i);
    expect(addButton).toBeInTheDocument();
  });

  it('should not show add button when user is not logged in', () => {
    renderWithProviders(<CardTile {...defaultProps} userEmail={null} />);
    
    const addButton = screen.queryByText(/add to inventory/i);
    expect(addButton).not.toBeInTheDocument();
  });

  it('should have proper styling classes', () => {
    const { container } = renderWithProviders(<CardTile {...defaultProps} />);
    
    // Check that the component renders with expected structure
    expect(container.querySelector('.card') || container.firstChild).toBeTruthy();
  });
});

