import { prisma } from '../lib/prisma';
import { crudRouter } from './crudRouter';

export const preguntasRouter = crudRouter(prisma.pregunta);
