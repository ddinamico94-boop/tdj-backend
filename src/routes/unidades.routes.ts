import { prisma } from '../lib/prisma';
import { crudRouter } from './crudRouter';

export const unidadesRouter = crudRouter(prisma.unidad, { orderBy: { orden: 'asc' } });
