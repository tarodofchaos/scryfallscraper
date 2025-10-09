import { Router } from 'express';
import { prisma } from '../db/prismaClient.js';

export const users = Router();

users.get('/', async (_req, res) => {
  const rows = await prisma.user.findMany();
  res.json({ ok: true, users: rows });
});