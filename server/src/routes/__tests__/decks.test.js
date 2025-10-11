import { describe, it, expect, beforeEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { decks } from '../decks.js';

// Mock prisma client
vi.mock('../../db/prismaClient.js', () => ({
  prisma: {
    deck: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }
  }
}));

import { prisma } from '../../db/prismaClient.js';

describe('Decks API', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/decks', decks);
    vi.clearAllMocks();
  });

  describe('GET /api/decks', () => {
    it('should return decks for a user', async () => {
      const mockDecks = [
        {
          id: 'deck-1',
          name: 'Test Deck',
          source: 'manabox',
          cards: JSON.stringify([{ name: 'Lightning Bolt', quantity: 1 }]),
          totalCards: 1,
          validCards: 1,
          invalidCards: 0,
          owner: 'test@example.com',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      prisma.deck.findMany.mockResolvedValue(mockDecks);

      const response = await request(app)
        .get('/api/decks?owner=test@example.com')
        .expect(200);

      expect(response.body.decks).toBeDefined();
      expect(response.body.decks[0].cards).toEqual([{ name: 'Lightning Bolt', quantity: 1 }]);
      expect(prisma.deck.findMany).toHaveBeenCalledWith({
        where: { owner: 'test@example.com' },
        orderBy: { createdAt: 'desc' }
      });
    });

    it('should return 400 if owner parameter is missing', async () => {
      const response = await request(app)
        .get('/api/decks')
        .expect(400);

      expect(response.body.error).toBe('Owner parameter is required');
    });
  });

  describe('POST /api/decks', () => {
    it('should create a new deck', async () => {
      const deckData = {
        name: 'Test Deck',
        source: 'manabox',
        cards: [{ name: 'Lightning Bolt', quantity: 1 }],
        totalCards: 1,
        validCards: 1,
        invalidCards: 0,
        owner: 'test@example.com'
      };

      const createdDeck = {
        id: 'deck-1',
        ...deckData,
        cards: JSON.stringify(deckData.cards),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prisma.deck.create.mockResolvedValue(createdDeck);

      const response = await request(app)
        .post('/api/decks')
        .send(deckData)
        .expect(201);

      expect(response.body.deck).toBeDefined();
      expect(response.body.deck.name).toBe('Test Deck');
      expect(response.body.deck.cards).toEqual(deckData.cards);
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/decks')
        .send({ owner: 'test@example.com' })
        .expect(400);

      expect(response.body.error).toBe('Name and owner are required');
    });
  });

  describe('DELETE /api/decks/:id', () => {
    it('should delete a deck', async () => {
      prisma.deck.delete.mockResolvedValue({ id: 'deck-1' });

      const response = await request(app)
        .delete('/api/decks/deck-1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(prisma.deck.delete).toHaveBeenCalledWith({
        where: { id: 'deck-1' }
      });
    });
  });
});

