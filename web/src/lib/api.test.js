import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api, Cards, Inventory, Listings } from './api';

describe('API Client', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  describe('api() base function', () => {
    it('should make a successful GET request', async () => {
      const mockData = { id: 1, name: 'Test' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const result = await api('/test');
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:4000/test',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should throw error on failed request', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'Error message'
      });

      await expect(api('/test')).rejects.toThrow('Error message');
    });

    it('should handle POST requests', async () => {
      const mockData = { success: true };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const payload = { name: 'Test' };
      const result = await api('/test', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:4000/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload)
        })
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('Cards API', () => {
    it('should search for cards', async () => {
      const mockResults = { data: [{ name: 'Lightning Bolt' }] };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      const result = await Cards.search('lightning');
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/cards/search?q=lightning'),
        expect.any(Object)
      );
      expect(result).toEqual(mockResults);
    });

    it('should get card prices', async () => {
      const mockPrices = { usd: '2.50', eur: '2.30' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPrices
      });

      const result = await Cards.prices('card-id');
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/cards/card-id/prices'),
        expect.any(Object)
      );
      expect(result).toEqual(mockPrices);
    });

    it('should get card by ID', async () => {
      const mockCard = { id: 'card-id', name: 'Lightning Bolt' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCard
      });

      const result = await Cards.byId('card-id');
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/cards/card-id'),
        expect.any(Object)
      );
      expect(result).toEqual(mockCard);
    });
  });

  describe('Inventory API', () => {
    it('should list inventory items', async () => {
      const mockItems = { items: [{ id: 1, name: 'Test' }] };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItems
      });

      const result = await Inventory.list('test@example.com');
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/inventory?email=test%40example.com'),
        expect.any(Object)
      );
      expect(result).toEqual(mockItems);
    });

    it('should add inventory item', async () => {
      const mockResponse = { item: { id: 1 } };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const payload = { printingId: 'test', quantity: 1 };
      const result = await Inventory.add(payload);
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/inventory'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload)
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should delete inventory item', async () => {
      const mockResponse = { success: true };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await Inventory.delete('item-id');
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/inventory/item-id'),
        expect.objectContaining({
          method: 'DELETE'
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Listings API', () => {
    it('should list all listings', async () => {
      const mockListings = { listings: [{ id: 1 }] };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockListings
      });

      const result = await Listings.list();
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/listings'),
        expect.any(Object)
      );
      expect(result).toEqual(mockListings);
    });

    it('should list user listings', async () => {
      const mockListings = { listings: [{ id: 1 }] };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockListings
      });

      const result = await Listings.my('test@example.com');
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/listings/my?email=test%40example.com'),
        expect.any(Object)
      );
      expect(result).toEqual(mockListings);
    });

    it('should create listing', async () => {
      const mockResponse = { listing: { id: 1 } };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const payload = { printingId: 'test', price: 2.50 };
      const result = await Listings.create(payload);
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/listings'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload)
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });
});

