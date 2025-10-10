import { Router } from 'express';
import { prisma } from '../db/prismaClient.js';
import { z } from 'zod';

export const listings = Router();

listings.get('/', async (_req, res) => {
  const rows = await prisma.listing.findMany({ where: { status: 'ACTIVE' }, include: { printing: true, seller: true } });
  res.json({ ok: true, listings: rows });
});

listings.get('/my', async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ ok: false, error: 'email query required' });
  
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ ok: false, error: 'User not found' });
  
  const rows = await prisma.listing.findMany({ 
    where: { sellerId: user.id }, 
    include: { printing: true, seller: true } 
  });
  res.json({ ok: true, listings: rows });
});

listings.post('/', async (req, res) => {
  const schema = z.object({
    sellerEmail: z.string().email(),
    printingId: z.string(),
    priceEur: z.coerce.number(),
    qtyAvailable: z.coerce.number().int().positive()
  });
  try {
    const body = schema.parse(req.body);
    const seller = await prisma.user.upsert({ where: { email: body.sellerEmail }, update: {}, create: { email: body.sellerEmail } });
    const created = await prisma.listing.create({
      data: {
        sellerId: seller.id,
        printingId: body.printingId,
        priceEur: body.priceEur,
        qtyAvailable: body.qtyAvailable
      }, include: { printing: true, seller: true }
    });
    res.status(201).json({ ok: true, listing: created });
  } catch (e) { res.status(400).json({ ok: false, error: e.message }); }
});

listings.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('DELETE /listings/:id', id);
    
    // First check if the listing exists
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { seller: true, printing: true }
    });
    
    if (!listing) {
      return res.status(404).json({ ok: false, error: 'Listing not found' });
    }
    
    // Delete the listing
    await prisma.listing.delete({
      where: { id }
    });
    
    console.log('Listing deleted:', id);
    res.json({ ok: true, message: 'Listing deleted successfully' });
  } catch (e) {
    console.error('Error deleting listing:', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});