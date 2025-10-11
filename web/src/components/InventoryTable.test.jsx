import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import InventoryTable from './InventoryTable';
import { renderWithProviders, mockInventoryItem, mockUser } from '../test/utils';

describe('InventoryTable Component', () => {
  const mockOnItemDeleted = vi.fn();
  const mockOnBulkDelete = vi.fn();

  const defaultProps = {
    items: [mockInventoryItem],
    userEmail: mockUser.email,
    onItemDeleted: mockOnItemDeleted,
    onBulkDelete: mockOnBulkDelete
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should render inventory items', () => {
    renderWithProviders(<InventoryTable {...defaultProps} />);
    
    expect(screen.getByText('Lightning Bolt')).toBeInTheDocument();
    expect(screen.getByText('M15')).toBeInTheDocument();
    expect(screen.getByText('NM')).toBeInTheDocument();
  });

  it('should display empty state when no items', () => {
    renderWithProviders(<InventoryTable {...defaultProps} items={[]} />);
    
    expect(screen.getByText(/your inventory is empty/i)).toBeInTheDocument();
  });

  it('should allow selecting items', () => {
    renderWithProviders(<InventoryTable {...defaultProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  it('should show action buttons for selected items', () => {
    renderWithProviders(<InventoryTable {...defaultProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(screen.getByTitle(/list for sale/i)).toBeInTheDocument();
    expect(screen.getByTitle(/delete/i)).toBeInTheDocument();
  });

  it('should call delete API when deleting item', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    renderWithProviders(<InventoryTable {...defaultProps} />);
    
    const deleteButton = screen.getByTitle(/delete/i);
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/inventory/'),
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });
  });

  it('should show edit modal when edit button is clicked', () => {
    renderWithProviders(<InventoryTable {...defaultProps} />);
    
    const editButton = screen.getByTitle(/edit/i);
    fireEvent.click(editButton);

    // Check if modal appears
    expect(screen.getByText(/edit item/i)).toBeInTheDocument();
  });

  it('should handle bulk delete', async () => {
    renderWithProviders(<InventoryTable {...defaultProps} items={[mockInventoryItem, {...mockInventoryItem, id: 'item-2'}]} />);
    
    // Select all items
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(checkbox => fireEvent.click(checkbox));

    // Click bulk delete
    const deleteButton = screen.getByText(/delete selected/i);
    fireEvent.click(deleteButton);

    expect(mockOnBulkDelete).toHaveBeenCalled();
  });
});

