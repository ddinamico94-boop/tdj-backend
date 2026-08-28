import { Router } from 'express';
import cloudinary from '../config/cloudinary';
import { upload } from '../middleware/upload';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

export const uploadsRouter = Router();

uploadsRouter.post(
  '/',
  requireAuth,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo (campo "file").' });
    }
    // multer-storage-cloudinary devuelve la URL pública en req.file.path
    // y el public_id (necesario para borrar) en req.file.filename
    res.status(201).json({
      url: req.file.path,
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
    // filename acá es el public_id de Cloudinary (puede incluir la carpeta,
    // ej: "tdj-uploads/1234-imagen")
    await cloudinary.uploader.destroy(req.params.filename, { resource_type: 'image' });
    res.status(204).send();
  })
);

uploadsRouter.use((err: any, _req: any, res: any, next: any) => {
  if (err) {
    return res.status(400).json({ error: err.message ?? 'No se pudo procesar el archivo.' });
  }
  next();
});