import { PrismaClient } from '@prisma/client';

// Instancia única de PrismaClient (evita agotar conexiones en desarrollo
// con hot-reload). En producción (Render) esto corre una sola vez por
// proceso de todos modos.
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.__prisma = prisma;
