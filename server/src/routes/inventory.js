import { Router } from 'express';
import { prisma } from '../db/prismaClient.js';
import { z } from 'zod';

export const inventory = Router();

const itemSchema = z.object({
  ownerEmail: z.string().email(),
  printing: z.object({
    id: z.string(),
    oracleId: z.string(),
    name: z.string(),
    set: z.string(),
    collectorNum: z.string(),
    rarity: z.string().optional(),
    foil: z.boolean().optional(),
    imageNormal: z.string().optional()
  }),
  condition: z.string(),
  language: z.string(),
  quantity: z.coerce.number(),
  notes: z.string().optional()
});

inventory.get('/', async (req, res) => {
  const email = req.query.email;
  console.log('GET /inventory for email:', email);
  if (!email) return res.status(400).json({ ok: false, error: 'email query required' });
  const items = await prisma.inventoryItem.findMany({
    where: { owner: { email } },
    include: { printing: true }
  });
  console.log('Inventory items found:', items);
  res.json({ ok: true, items });
});

inventory.post('/', async (req, res) => {
  try {
    const body = itemSchema.parse(req.body);
    console.log('POST /inventory payload:', body);
    const user = await prisma.user.upsert({
      where: { email: body.ownerEmail }, update: {}, create: { email: body.ownerEmail }
    });
    await prisma.cardPrinting.upsert({
      where: { id: body.printing.id },
      update: body.printing,
      create: body.printing
    });
    const created = await prisma.inventoryItem.create({
      data: {
        ownerId: user.id,
        printingId: body.printing.id,
        condition: body.condition,
        language: body.language,
        quantity: body.quantity,
        notes: body.notes
      }, include: { printing: true }
    });
    console.log('Inventory item created:', created);
    res.status(201).json({ ok: true, item: created });
  } catch (e) { 
    console.error(e);
    res.status(400).json({ ok: false, error: e.message }); 
  }
});

inventory.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('DELETE /inventory/:id', id);
    
    // First check if the item exists and get the owner
    const item = await prisma.inventoryItem.findUnique({
      where: { id },
      include: { owner: true, printing: true }
    });
    
    if (!item) {
      return res.status(404).json({ ok: false, error: 'Inventory item not found' });
    }
    
    // Delete the inventory item
    await prisma.inventoryItem.delete({
      where: { id }
    });
    
    console.log('Inventory item deleted:', id);
    res.json({ ok: true, message: 'Inventory item deleted successfully' });
  } catch (e) {
    console.error('Error deleting inventory item:', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});