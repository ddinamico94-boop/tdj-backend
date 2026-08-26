import { prisma } from '../lib/prisma';
import { crudRouter } from './crudRouter';

export const calendarioRouter = crudRouter(prisma.eventoCalendario, { orderBy: { fecha: 'asc' } });
