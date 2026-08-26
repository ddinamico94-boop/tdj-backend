import { prisma } from '../lib/prisma';
import { crudRouter } from './crudRouter';

export const bibliografiaRouter = crudRouter(prisma.recursoBibliografico, { orderBy: { orden: 'asc' } });
