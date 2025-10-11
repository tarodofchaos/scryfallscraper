import express from 'express';
import { prisma } from '../db/prismaClient.js';

const router = express.Router();

// Get all deck listings
router.get('/', async (req, res) => {
  try {
    const listings = await prisma.deckListing.findMany({
      where: {
        status: 'ACTIVE'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Parse deck cards for each listing
    const listingsWithCards = listings.map(listing => ({
      ...listing,
      deckCards: JSON.parse(listing.deckCards)
    }));

    res.json({ listings: listingsWithCards });
  } catch (error) {
    console.error('Error fetching deck listings:', error);
    res.status(500).json({ error: 'Failed to fetch deck listings' });
  }
});

// Get deck listings for a specific seller
router.get('/my', async (req, res) => {
  try {
    const { sellerEmail } = req.query;
    
    if (!sellerEmail) {
      return res.status(400).json({ error: 'Seller email is required' });
    }

    const listings = await prisma.deckListing.findMany({
      where: {
        sellerEmail: sellerEmail
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Parse deck cards for each listing
    const listingsWithCards = listings.map(listing => ({
      ...listing,
      deckCards: JSON.parse(listing.deckCards)
    }));

    res.json({ listings: listingsWithCards });
  } catch (error) {
    console.error('Error fetching my deck listings:', error);
    res.status(500).json({ error: 'Failed to fetch my deck listings' });
  }
});

// Get a specific deck listing by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const listing = await prisma.deckListing.findUnique({
      where: {
        id: id
      }
    });

    if (!listing) {
      return res.status(404).json({ error: 'Deck listing not found' });
    }

    // Parse deck cards
    const listingWithCards = {
      ...listing,
      deckCards: JSON.parse(listing.deckCards)
    };

    res.json({ listing: listingWithCards });
  } catch (error) {
    console.error('Error fetching deck listing:', error);
    res.status(500).json({ error: 'Failed to fetch deck listing' });
  }
});

// Create a new deck listing
router.post('/', async (req, res) => {
  try {
    console.log('Received deck listing data:', req.body);
    const { 
      deckId, 
      deckName, 
      deckSource, 
      deckUrl, 
      deckCards, 
      totalCards, 
      price, 
      description, 
      sellerEmail 
    } = req.body;

    if (!deckId || !deckName || !price || !sellerEmail) {
      return res.status(400).json({ error: 'Deck ID, name, price, and seller email are required' });
    }

    const listing = await prisma.deckListing.create({
      data: {
        deckId,
        deckName,
        deckSource: deckSource || 'unknown',
        deckUrl: deckUrl || null,
        deckCards: JSON.stringify(deckCards || []),
        totalCards: totalCards || 0,
        price: parseFloat(price),
        description: description || null,
        sellerEmail,
        status: 'ACTIVE'
      }
    });

    // Parse deck cards for response
    const listingWithCards = {
      ...listing,
      deckCards: JSON.parse(listing.deckCards)
    };

    console.log('Created deck listing:', listingWithCards);
    res.status(201).json({ listing: listingWithCards });
  } catch (error) {
    console.error('Error creating deck listing:', error);
    res.status(500).json({ error: 'Failed to create deck listing' });
  }
});

// Update a deck listing
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { price, description, status } = req.body;

    const listing = await prisma.deckListing.update({
      where: {
        id: id
      },
      data: {
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(description !== undefined && { description }),
        ...(status && { status })
      }
    });

    // Parse deck cards for response
    const listingWithCards = {
      ...listing,
      deckCards: JSON.parse(listing.deckCards)
    };

    res.json({ listing: listingWithCards });
  } catch (error) {
    console.error('Error updating deck listing:', error);
    res.status(500).json({ error: 'Failed to update deck listing' });
  }
});

// Delete a deck listing
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.deckListing.delete({
      where: {
        id: id
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting deck listing:', error);
    res.status(500).json({ error: 'Failed to delete deck listing' });
  }
});

export { router as deckListings };
