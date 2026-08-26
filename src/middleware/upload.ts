import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Almacenamiento en disco. En Render, agregar un disco persistente montado en UPLOADS_DIR
// (por defecto "./uploads") para que los archivos sobrevivan a los
// redeploys — el filesystem del contenedor sin volumen es efímero.
export const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.resolve(__dirname, '../../uploads');

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Tipos permitidos y tamaño máximo por categoría (punto 12/22/33 del
// brief: PDFs, imágenes, videos, audios para material, bibliografía,
// novedades, logos de enlaces, etc.)
const ALLOWED_MIME = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
  'image/gif',
  'application/pdf',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
];

const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = crypto.randomBytes(12).toString('hex');
    cb(null, `${Date.now()}-${unique}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`));
      return;
    }
    cb(null, true);
  },
});
