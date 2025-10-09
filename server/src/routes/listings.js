import { Router } from 'express';
import { prisma } from '../db/prismaClient.js';
import { z } from 'zod';

export const listings = Router();

listings.get('/', async (_req, res) => {
  const rows = await prisma.listing.findMany({ where: { status: 'ACTIVE' }, include: { printing: true, seller: true } });
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