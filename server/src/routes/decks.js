import express from 'express';
import { prisma } from '../db/prismaClient.js';

const router = express.Router();

// Get decks for a specific owner
router.get('/', async (req, res) => {
  try {
    const { owner } = req.query;
    
    if (!owner) {
      return res.status(400).json({ error: 'Owner parameter is required' });
    }

    const decks = await prisma.deck.findMany({
      where: {
        owner: owner
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Parse cards for each deck
    const decksWithCards = decks.map(deck => ({
      ...deck,
      cards: JSON.parse(deck.cards)
    }));

    res.json({ decks: decksWithCards });
  } catch (error) {
    console.error('Error fetching decks:', error);
    res.status(500).json({ error: 'Failed to fetch decks' });
  }
});

// Get a specific deck by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deck = await prisma.deck.findUnique({
      where: {
        id: id
      }
    });

    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    res.json({ deck });
  } catch (error) {
    console.error('Error fetching deck:', error);
    res.status(500).json({ error: 'Failed to fetch deck' });
  }
});

// Create a new deck
router.post('/', async (req, res) => {
  try {
    console.log('Received deck data:', req.body);
    const { name, source, url, cards, totalCards, validCards, invalidCards, owner } = req.body;

    console.log('Extracted fields:', { name, owner, source, url });

    if (!name || !owner) {
      console.log('Validation failed:', { name: !!name, owner: !!owner });
      return res.status(400).json({ error: 'Name and owner are required' });
    }

    const deck = await prisma.deck.create({
      data: {
        name,
        source: source || 'unknown',
        url: url || null,
        cards: JSON.stringify(cards || []),
        totalCards: totalCards || 0,
        validCards: validCards || 0,
        invalidCards: invalidCards || 0,
        owner
      }
    });

    // Parse cards back to object for response
    const deckWithCards = {
      ...deck,
      cards: JSON.parse(deck.cards)
    };

    console.log('Created deck:', deckWithCards);
    res.status(201).json({ deck: deckWithCards });
  } catch (error) {
    console.error('Error creating deck:', error);
    res.status(500).json({ error: 'Failed to create deck' });
  }
});

// Update a deck
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, source, url, cards, totalCards, validCards, invalidCards } = req.body;

    const deck = await prisma.deck.update({
      where: {
        id: id
      },
      data: {
        ...(name && { name }),
        ...(source && { source }),
        ...(url !== undefined && { url }),
        ...(cards && { cards: JSON.stringify(cards) }),
        ...(totalCards !== undefined && { totalCards }),
        ...(validCards !== undefined && { validCards }),
        ...(invalidCards !== undefined && { invalidCards })
      }
    });

    // Parse cards back to object for response
    const deckWithCards = {
      ...deck,
      cards: JSON.parse(deck.cards)
    };

    res.json({ deck: deckWithCards });
  } catch (error) {
    console.error('Error updating deck:', error);
    res.status(500).json({ error: 'Failed to update deck' });
  }
});

// Delete a deck
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.deck.delete({
      where: {
        id: id
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting deck:', error);
    res.status(500).json({ error: 'Failed to delete deck' });
  }
});

export { router as decks };
