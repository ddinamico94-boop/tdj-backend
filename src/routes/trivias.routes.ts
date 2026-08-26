import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';

export const triviasRouter = Router();

const include = { unidades: { select: { unidadId: true } } };

function toResponse(item: any) {
  const { unidades, ...rest } = item;
  return { ...rest, unidadesIds: unidades?.map((u: any) => u.unidadId) ?? [] };
}

triviasRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const items = await prisma.trivia.findMany({ include, orderBy: { createdAt: 'asc' } });
    res.json(items.map(toResponse));
  })
);

triviasRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const item = await prisma.trivia.findUnique({ where: { id: req.params.id }, include });
    if (!item) return res.status(404).json({ error: 'No encontrado' });
    res.json(toResponse(item));
  })
);

// Regla clave del brief (punto 17): una trivia solo debe usar preguntas de
// las unidades que el administrador seleccionó manualmente para ella.
triviasRouter.get(
  '/:id/preguntas',
  asyncHandler(async (req, res) => {
    const trivia = await prisma.trivia.findUnique({ where: { id: req.params.id }, include });
    if (!trivia) return res.status(404).json({ error: 'Trivia no encontrada' });
    const unidadIds = trivia.unidades.map((u) => u.unidadId);
    const preguntas = await prisma.pregunta.findMany({ where: { unidadId: { in: unidadIds } } });
    res.json(preguntas);
  })
);

triviasRouter.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { unidadesIds = [], ...data } = req.body;
    const created = await prisma.trivia.create({
      data: { ...data, unidades: { create: unidadesIds.map((unidadId: number) => ({ unidadId })) } },
      include,
    });
    res.status(201).json(toResponse(created));
  })
);

triviasRouter.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { unidadesIds, ...data } = req.body;
    const id = req.params.id;
    if (unidadesIds) {
      await prisma.triviaUnidad.deleteMany({ where: { triviaId: id } });
    }
    const updated = await prisma.trivia.update({
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

triviasRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await prisma.trivia.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);
