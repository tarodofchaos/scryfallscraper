import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import DeckCard from './DeckCard';
import { renderWithProviders, mockDeck } from '../test/utils';

describe('DeckCard Component', () => {
  const mockOnView = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnListForSale = vi.fn();

  const defaultProps = {
    deck: mockDeck,
    onView: mockOnView,
    onDelete: mockOnDelete,
    onListForSale: mockOnListForSale
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render deck information', () => {
    renderWithProviders(<DeckCard {...defaultProps} />);
    
    expect(screen.getByText('Test Commander Deck')).toBeInTheDocument();
    expect(screen.getByText(/manabox/i)).toBeInTheDocument();
    expect(screen.getByText(/5.*cards/i)).toBeInTheDocument();
  });

  it('should display deck statistics', () => {
    renderWithProviders(<DeckCard {...defaultProps} />);
    
    expect(screen.getByText('5')).toBeInTheDocument(); // total cards
    expect(screen.getByText(/valid/i)).toBeInTheDocument();
  });

  it('should call onView when view button is clicked', () => {
    renderWithProviders(<DeckCard {...defaultProps} />);
    
    const viewButton = screen.getByTitle(/view details/i);
    fireEvent.click(viewButton);

    expect(mockOnView).toHaveBeenCalledWith(mockDeck);
  });

  it('should call onListForSale when list button is clicked', () => {
    renderWithProviders(<DeckCard {...defaultProps} />);
    
    const listButton = screen.getByTitle(/list for sale/i);
    fireEvent.click(listButton);

    expect(mockOnListForSale).toHaveBeenCalledWith(mockDeck);
  });

  it('should require confirmation for delete', () => {
    renderWithProviders(<DeckCard {...defaultProps} />);
    
    const deleteButton = screen.getByTitle(/delete/i);
    
    // First click should not delete
    fireEvent.click(deleteButton);
    expect(mockOnDelete).not.toHaveBeenCalled();
    
    // Second click should delete
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith(mockDeck.id);
  });

  it('should display sample cards', () => {
    renderWithProviders(<DeckCard {...defaultProps} />);
    
    expect(screen.getByText(/1x Lightning Bolt/i)).toBeInTheDocument();
    expect(screen.getByText(/4x Counterspell/i)).toBeInTheDocument();
  });

  it('should show source URL when available', () => {
    renderWithProviders(<DeckCard {...defaultProps} />);
    
    const urlLink = screen.getByText(mockDeck.url);
    expect(urlLink).toBeInTheDocument();
    expect(urlLink).toHaveAttribute('href', mockDeck.url);
  });

  it('should not render list button if onListForSale is not provided', () => {
    const { onListForSale, ...propsWithoutList } = defaultProps;
    renderWithProviders(<DeckCard {...propsWithoutList} />);
    
    const listButton = screen.queryByTitle(/list for sale/i);
    expect(listButton).not.toBeInTheDocument();
  });
});

