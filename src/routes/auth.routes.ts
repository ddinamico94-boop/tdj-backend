import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth, signToken } from '../middleware/auth';

export const authRouter = Router();

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
    }
    const user = await prisma.adminUser.findUnique({ where: { email: String(email).toLowerCase().trim() } });
    if (!user || !user.activo || !user.passwordHash) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos.' });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos.' });
    }
    const token = signToken({ sub: user.id, email: user.email, nombre: user.nombre, rol: user.rol });
    res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } });
  })
);

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(req.user);
  })
);

// Cambio de contraseña del propio usuario autenticado (punto 26 del brief).
authRouter.put(
  '/me/password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body ?? {};
    if (!currentPassword || !newPassword || String(newPassword).length < 8) {
      return res.status(400).json({ error: 'Contraseña actual y nueva (mínimo 8 caracteres) son requeridas.' });
    }
    const user = await prisma.adminUser.findUnique({ where: { id: req.user!.sub } });
    if (!user || !user.passwordHash) return res.status(404).json({ error: 'Usuario no encontrado.' });
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'La contraseña actual no es correcta.' });
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.adminUser.update({ where: { id: user.id }, data: { passwordHash } });
    res.json({ ok: true });
  })
);
