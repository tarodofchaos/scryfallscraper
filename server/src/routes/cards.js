import { Router } from 'express';
import { cardService } from '../cardService.js';
import { z } from 'zod';

export const cards = Router();

cards.get('/search', async (req, res) => {
  try {
    const schema = z.object({ q: z.string().min(1), page: z.coerce.number().int().positive().optional() });
    const { q, page } = schema.parse(req.query);
    const data = await cardService.searchCards(q, { page });
    res.json({ ok: true, ...data });
  } catch (err) { res.status(400).json({ ok: false, error: err.message }); }
});

cards.get('/:id', async (req, res) => {
  try { res.json({ ok: true, data: await cardService.getCardById(req.params.id) }); }
  catch (err) { res.status(404).json({ ok: false, error: err.message }); }
});

cards.get('/:id/images', async (req, res) => {
  try { res.json({ ok: true, images: await cardService.getImages(req.params.id) }); }
  catch (err) { res.status(404).json({ ok: false, error: err.message }); }
});

cards.get('/:id/prices', async (req, res) => {
  try { res.json({ ok: true, prices: await cardService.getPrices(req.params.id) }); }
  catch (err) { res.status(404).json({ ok: false, error: err.message }); }
});

cards.get('/by-name/exact/:name', async (req, res) => {
  try { res.json({ ok: true, data: await cardService.getByName({ exact: req.params.name }) }); }
  catch (err) { res.status(404).json({ ok: false, error: err.message }); }
});

cards.get('/by-name/fuzzy/:name', async (req, res) => {
  try { res.json({ ok: true, data: await cardService.getByName({ fuzzy: req.params.name }) }); }
  catch (err) { res.status(404).json({ ok: false, error: err.message }); }
});

cards.get('/:id/prints', async (req, res) => {
  try { 
    const card = await cardService.getCardById(req.params.id);
    // Search for all printings using oracle_id
    const response = await fetch(`https://api.scryfall.com/cards/search?q=oracle_id:${card.oracle_id}`);
    if (!response.ok) throw new Error(`Scryfall prints search failed: ${response.status}`);
    const data = await response.json();
    res.json({ ok: true, data: data.data || [] });
  }
  catch (err) { res.status(404).json({ ok: false, error: err.message }); }
});

cards.get('/sets/search', async (req, res) => {
  try {
    const schema = z.object({ q: z.string().min(1) });
    const { q } = schema.parse(req.query);
    const response = await fetch(`https://api.scryfall.com/sets?q=${encodeURIComponent(q)}`);
    if (!response.ok) throw new Error(`Scryfall sets search failed: ${response.status}`);
    const data = await response.json();
    res.json({ ok: true, data: data.data || [] });
  } catch (err) { res.status(400).json({ ok: false, error: err.message }); }
});