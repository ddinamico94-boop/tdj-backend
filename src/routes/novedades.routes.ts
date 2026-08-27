import { prisma } from '../lib/prisma';
import { crudRouter } from './crudRouter';

export const novedadesRouter = crudRouter(prisma.novedad, {
  orderBy: { fecha: 'desc' },
  beforeWrite: (body) => ({
    ...body,
    fecha: body.fecha ? new Date(body.fecha) : body.fecha,
  }),
});