import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

// Tipos permitidos y tamaño máximo por categoría (PDFs, imágenes, videos,
// audios para material, bibliografía, novedades, logos de enlaces, etc.)
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

// Almacenamiento en Cloudinary (persistente entre redeploys, a diferencia
// del disco local del contenedor en Render).
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    // 'raw' para PDFs/audio, 'video' para video, 'image' para el resto
    let resource_type: 'image' | 'video' | 'raw' = 'image';
    if (file.mimetype.startsWith('video/')) resource_type = 'video';
    else if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('audio/')) {
      resource_type = 'raw';
    }
    return {
      folder: 'tdj-uploads',
      resource_type,
      // conserva el nombre original como referencia en public_id
      public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '')}`,
    };
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