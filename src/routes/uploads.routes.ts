import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { upload, UPLOADS_DIR } from '../middleware/upload';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

export const uploadsRouter = Router();

function publicUrlFor(req: import('express').Request, filename: string): string {
  // PUBLIC_BASE_URL permite fijar la URL pública (útil en Render detrás de
  // proxy). Si no está seteada, se arma con el host de la request.
  const base = process.env.PUBLIC_BASE_URL ?? `${req.protocol}://${req.get('host')}`;
  return `${base}/uploads/${filename}`;
}

uploadsRouter.post(
  '/',
  requireAuth,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo (campo "file").' });
    }
    res.status(201).json({
      url: publicUrlFor(req, req.file.filename),
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  })
);

uploadsRouter.delete(
  '/:filename',
  requireAuth,
  asyncHandler(async (req, res) => {
    const filename = path.basename(req.params.filename); // evita path traversal
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(204).send();
  })
);

// Manejador de errores propio de multer (tamaño excedido, tipo no permitido),
// para devolver un JSON claro en vez del error genérico de Express.
uploadsRouter.use((err: any, _req: any, res: any, next: any) => {
  if (err) {
    return res.status(400).json({ error: err.message ?? 'No se pudo procesar el archivo.' });
  }
  next();
});
