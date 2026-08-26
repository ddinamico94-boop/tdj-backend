import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaDelegate = any;

interface Options {
  orderBy?: Record<string, 'asc' | 'desc'>;
  include?: Record<string, unknown>;
  /** Transforma el body entrante antes de crear/actualizar (ej: relaciones anidadas). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beforeWrite?: (body: any) => any;
}

/** Genera un router REST estándar (GET lista, GET uno, POST, PUT, DELETE)
 * para un modelo de Prisma. Las rutas de escritura quedan protegidas por
 * requireAuth (JWT — ver middleware/auth.ts). */
export function crudRouter(delegate: PrismaDelegate, opts: Options = {}) {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (_req, res) => {
      const items = await delegate.findMany({ orderBy: opts.orderBy, include: opts.include });
      res.json(items);
    })
  );

  router.get(
    '/:id',
    asyncHandler(async (req, res) => {
      const id = coerceId(req.params.id);
      const item = await delegate.findUnique({ where: { id }, include: opts.include });
      if (!item) return res.status(404).json({ error: 'No encontrado' });
      res.json(item);
    })
  );

  router.post(
    '/',
    requireAuth,
    asyncHandler(async (req, res) => {
      const data = opts.beforeWrite ? opts.beforeWrite(req.body) : req.body;
      const created = await delegate.create({ data, include: opts.include });
      res.status(201).json(created);
    })
  );

  router.put(
    '/:id',
    requireAuth,
    asyncHandler(async (req, res) => {
      const id = coerceId(req.params.id);
      const data = opts.beforeWrite ? opts.beforeWrite(req.body) : req.body;
      const updated = await delegate.update({ where: { id }, data, include: opts.include });
      res.json(updated);
    })
  );

  router.delete(
    '/:id',
    requireAuth,
    asyncHandler(async (req, res) => {
      const id = coerceId(req.params.id);
      await delegate.delete({ where: { id } });
      res.status(204).send();
    })
  );

  return router;
}

function coerceId(raw: string): string | number {
  return /^\d+$/.test(raw) ? Number(raw) : raw;
}
