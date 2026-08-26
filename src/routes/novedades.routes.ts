import { prisma } from '../lib/prisma';
import { crudRouter } from './crudRouter';

export const novedadesRouter = crudRouter(prisma.novedad, { orderBy: { fecha: 'desc' } });
