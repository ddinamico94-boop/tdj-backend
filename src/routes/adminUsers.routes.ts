import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth, requireRole } from '../middleware/auth';

export const adminUsersRouter = Router();

// Nunca devolver el hash de contraseña al frontend.
function toSafeUser(u: any) {
  const { passwordHash, ...rest } = u;
  return rest;
}

adminUsersRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const users = await prisma.adminUser.findMany({ orderBy: { createdAt: 'asc' } });
    res.json(users.map(toSafeUser));
  })
);

// Crear y editar administradores: solo superadmin y admin (punto 26 del brief).
adminUsersRouter.post(
  '/',
  requireAuth,
  requireRole('superadmin', 'admin'),
  asyncHandler(async (req, res) => {
    const { nombre, email, password, rol = 'editor' } = req.body ?? {};
    if (!nombre || !email || !password || String(password).length < 8) {
      return res.status(400).json({ error: 'Nombre, email y contraseña (mínimo 8 caracteres) son requeridos.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const created = await prisma.adminUser.create({
      data: { nombre, email: String(email).toLowerCase().trim(), passwordHash, rol, activo: true },
    });
    res.status(201).json(toSafeUser(created));
  })
);

adminUsersRouter.put(
  '/:id',
  requireAuth,
  requireRole('superadmin', 'admin'),
  asyncHandler(async (req, res) => {
    const { nombre, email, rol, activo } = req.body ?? {};
    const updated = await prisma.adminUser.update({
      where: { id: req.params.id },
      data: { nombre, email, rol, activo },
    });
    res.json(toSafeUser(updated));
  })
);

// Resetear la contraseña de otro administrador: solo superadmin.
adminUsersRouter.post(
  '/:id/reset-password',
  requireAuth,
  requireRole('superadmin'),
  asyncHandler(async (req, res) => {
    const { newPassword } = req.body ?? {};
    if (!newPassword || String(newPassword).length < 8) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres.' });
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.adminUser.update({ where: { id: req.params.id }, data: { passwordHash } });
    res.json({ ok: true });
  })
);

// Eliminar administradores: solo superadmin.
adminUsersRouter.delete(
  '/:id',
  requireAuth,
  requireRole('superadmin'),
  asyncHandler(async (req, res) => {
    if (req.user!.sub === req.params.id) {
      return res.status(400).json({ error: 'No podés eliminar tu propio usuario mientras estás logueado con él.' });
    }
    await prisma.adminUser.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);
