import { describe, it, expect, beforeEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { deckListings } from '../deckListings.js';

// Mock prisma client
vi.mock('../../db/prismaClient.js', () => ({
  prisma: {
    deckListing: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }
  }
}));

import { prisma } from '../../db/prismaClient.js';

describe('Deck Listings API', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/deck-listings', deckListings);
    vi.clearAllMocks();
  });

  describe('GET /api/deck-listings', () => {
    it('should return active deck listings', async () => {
      const mockListings = [
        {
          id: 'listing-1',
          deckName: 'Test Deck',
          deckCards: JSON.stringify([{ name: 'Lightning Bolt', quantity: 1 }]),
          price: 50,
          status: 'ACTIVE',
          sellerEmail: 'test@example.com',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      prisma.deckListing.findMany.mockResolvedValue(mockListings);

      const response = await request(app)
        .get('/api/deck-listings')
        .expect(200);

      expect(response.body.listings).toBeDefined();
      expect(response.body.listings[0].deckCards).toEqual([{ name: 'Lightning Bolt', quantity: 1 }]);
      expect(prisma.deckListing.findMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' }
      });
    });
  });

  describe('POST /api/deck-listings', () => {
    it('should create a new deck listing', async () => {
      const listingData = {
        deckId: 'deck-1',
        deckName: 'Test Deck',
        deckSource: 'manabox',
        deckCards: [{ name: 'Lightning Bolt', quantity: 1 }],
        totalCards: 1,
        price: 50,
        description: 'Test description',
        sellerEmail: 'test@example.com'
      };

      const createdListing = {
        id: 'listing-1',
        ...listingData,
        deckCards: JSON.stringify(listingData.deckCards),
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prisma.deckListing.create.mockResolvedValue(createdListing);

      const response = await request(app)
        .post('/api/deck-listings')
        .send(listingData)
        .expect(201);

      expect(response.body.listing).toBeDefined();
      expect(response.body.listing.deckName).toBe('Test Deck');
      expect(response.body.listing.price).toBe(50);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/deck-listings')
        .send({ deckName: 'Test' })
        .expect(400);

      expect(response.body.error).toContain('required');
    });
  });

  describe('DELETE /api/deck-listings/:id', () => {
    it('should delete a deck listing', async () => {
      prisma.deckListing.delete.mockResolvedValue({ id: 'listing-1' });

      const response = await request(app)
        .delete('/api/deck-listings/listing-1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(prisma.deckListing.delete).toHaveBeenCalledWith({
        where: { id: 'listing-1' }
      });
    });
  });
});

