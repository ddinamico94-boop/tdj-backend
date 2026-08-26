import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';

export const configSEORouter = Router();

configSEORouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const config = await prisma.configuracionSEO.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
    res.json(config);
  })
);

configSEORouter.put(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const updated = await prisma.configuracionSEO.upsert({
      where: { id: 1 },
      update: req.body,
      create: { id: 1, ...req.body },
    });
    res.json(updated);
  })
);
