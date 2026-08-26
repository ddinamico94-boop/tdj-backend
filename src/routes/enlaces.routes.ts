import { prisma } from '../lib/prisma';
import { crudRouter } from './crudRouter';

export const enlacesRouter = crudRouter(prisma.enlaceEditable, { orderBy: { orden: 'asc' } });
