import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
  sub: string; // id del AdminUser
  email: string;
  nombre: string;
  rol: 'superadmin' | 'admin' | 'editor';
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no está configurado en el backend (.env).');
  }
  return secret;
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: '7d' });
}

/** Exige un JWT válido en el header Authorization: Bearer <token>.
 * Protege crear/editar/eliminar/publicar/configurar (punto 27 del brief). */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'No autenticado. Falta el token.' });
  }
  try {
    req.user = jwt.verify(token, getSecret()) as AuthPayload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado. Volvé a iniciar sesión.' });
  }
}

/** Exige, además de estar autenticado, tener uno de los roles permitidos.
 * Uso: router.delete('/:id', requireAuth, requireRole('superadmin'), ...) */
export function requireRole(...roles: AuthPayload['rol'][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'No tenés permisos suficientes para esta acción.' });
    }
    next();
  };
}
