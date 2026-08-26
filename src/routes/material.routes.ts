import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';

export const materialRouter = Router();

const include = { unidades: { select: { unidadId: true } } };

// El frontend trabaja con `unidadesIds: number[]`; acá lo traducimos a la
// tabla intermedia MaterialUnidad y de vuelta al responder.
function toResponse(item: any) {
  const { unidades, ...rest } = item;
  return { ...rest, unidadesIds: unidades?.map((u: any) => u.unidadId) ?? [] };
}

materialRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const items = await prisma.materialEstudio.findMany({ orderBy: { orden: 'asc' }, include });
    res.json(items.map(toResponse));
  })
);

materialRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const item = await prisma.materialEstudio.findUnique({ where: { id: req.params.id }, include });
    if (!item) return res.status(404).json({ error: 'No encontrado' });
    res.json(toResponse(item));
  })
);

materialRouter.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { unidadesIds = [], ...data } = req.body;
    const created = await prisma.materialEstudio.create({
      data: { ...data, unidades: { create: unidadesIds.map((unidadId: number) => ({ unidadId })) } },
      include,
    });
    res.status(201).json(toResponse(created));
  })
);

materialRouter.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { unidadesIds, ...data } = req.body;
    const id = req.params.id;
    if (unidadesIds) {
      await prisma.materialUnidad.deleteMany({ where: { materialId: id } });
    }
    const updated = await prisma.materialEstudio.update({
      where: { id },
      data: {
        ...data,
        ...(unidadesIds ? { unidades: { create: unidadesIds.map((unidadId: number) => ({ unidadId })) } } : {}),
      },
      include,
    });
    res.json(toResponse(updated));
  })
);

materialRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await prisma.materialEstudio.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);
