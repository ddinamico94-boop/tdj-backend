import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { unidadesRouter } from './routes/unidades.routes';
import { programaRouter } from './routes/programa.routes';
import { bibliografiaRouter } from './routes/bibliografia.routes';
import { materialRouter } from './routes/material.routes';
import { enlacesRouter } from './routes/enlaces.routes';
import { novedadesRouter } from './routes/novedades.routes';
import { preguntasRouter } from './routes/preguntas.routes';
import { triviasRouter } from './routes/trivias.routes';
import { menuRouter } from './routes/menu.routes';
import { siteConfigRouter } from './routes/siteConfig.routes';
import { configVisualRouter } from './routes/configVisual.routes';
import { configSEORouter } from './routes/configSEO.routes';
import { adminUsersRouter } from './routes/adminUsers.routes';
import { authRouter } from './routes/auth.routes';
import { uploadsRouter } from './routes/uploads.routes';
import { UPLOADS_DIR } from './middleware/upload';
import { calendarioRouter } from './routes/calendario.routes';

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(',').map((s) => s.trim());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '10mb' })); // límite generoso por las imágenes en base64 (Fase 6 las reemplaza por URLs)

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Archivos subidos (imágenes, PDFs, videos, audios). Punto 33 del brief:
// preparado para que en Render se agregue un disco persistente en UPLOADS_DIR.
app.use('/uploads', express.static(UPLOADS_DIR));

app.use('/api/auth', authRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/unidades', unidadesRouter);
app.use('/api/programa', programaRouter);
app.use('/api/bibliografia', bibliografiaRouter);
app.use('/api/materiales', materialRouter);
app.use('/api/enlaces', enlacesRouter);
app.use('/api/novedades', novedadesRouter);
app.use('/api/preguntas', preguntasRouter);
app.use('/api/trivias', triviasRouter);
app.use('/api/menu', menuRouter);
app.use('/api/calendario', calendarioRouter);
app.use('/api/site-config', siteConfigRouter);
app.use('/api/config-visual', configVisualRouter);
app.use('/api/config-seo', configSEORouter);
app.use('/api/admin-users', adminUsersRouter);

// Manejador de errores centralizado
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status ?? 500).json({ error: err.message ?? 'Error interno del servidor' });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  console.log(`API de Teoría del Derecho y la Justicia B escuchando en el puerto ${PORT}`);
});
