import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';

export const siteConfigRouter = Router();

const include = { redesSociales: true };

siteConfigRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const config = await prisma.siteConfig.upsert({ where: { id: 1 }, update: {}, create: { id: 1 }, include });
    res.json(config);
  })
);

// Reemplaza texto del sitio y, si viene, toda la lista de redes sociales
// (se borra y se vuelve a crear — más simple que hacer diffing).
siteConfigRouter.put(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { redesSociales, ...data } = req.body;
    if (redesSociales) {
      await prisma.redSocial.deleteMany({ where: { siteConfigId: 1 } });
    }
    const updated = await prisma.siteConfig.upsert({
      where: { id: 1 },
      update: {
        ...data,
        ...(redesSociales
          ? { redesSociales: { create: redesSociales.map((r: any) => ({ plataforma: r.plataforma, url: r.url, activo: r.activo })) } }
          : {}),
      },
      create: { id: 1, ...data },
      include,
    });
    res.json(updated);
  })
);
