import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';

export const programaRouter = Router();

programaRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const programa = await prisma.programa.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
    res.json(programa);
  })
);

programaRouter.put(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const updated = await prisma.programa.upsert({ where: { id: 1 }, update: req.body, create: { id: 1, ...req.body } });
    res.json(updated);
  })
);
