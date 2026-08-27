import { prisma } from '../lib/prisma';
import { crudRouter } from './crudRouter';

export const calendarioRouter = crudRouter(prisma.eventoCalendario, {
  orderBy: { fecha: 'asc' },
  beforeWrite: (body) => ({
    ...body,
    fecha: body.fecha ? new Date(body.fecha) : body.fecha,
    fechaFin: body.fechaFin ? new Date(body.fechaFin) : body.fechaFin,
  }),
});