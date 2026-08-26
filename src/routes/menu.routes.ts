import { prisma } from '../lib/prisma';
import { crudRouter } from './crudRouter';

export const menuRouter = crudRouter(prisma.itemMenu, { orderBy: { orden: 'asc' } });
