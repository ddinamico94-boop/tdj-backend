# TDJ Backend — API de Teoría del Derecho y la Justicia B

Node + Express + TypeScript + Prisma + PostgreSQL. Reemplaza el `localStorage`
del panel administrativo (Fases 2-3) por una base de datos real.

## Setup local (Mac)

1. Tené Postgres corriendo localmente (Postgres.app o `brew services start postgresql`).
   Con Postgres.app el usuario por defecto suele ser `postgres` sin contraseña,
   o tu usuario de Mac — si te tira error de autenticación al migrar, probá
   con `DB_USER=postgres` en la URL de conexión, como en tus otros proyectos.

2. Creá la base de datos:
   ```bash
   createdb tdj_db
   ```

3. Copiá el archivo de entorno y completá `DATABASE_URL`:
   ```bash
   cp .env.example .env
   ```
   Ejemplo típico en Mac con Postgres.app:
   ```
   DATABASE_URL="postgresql://postgres@localhost:5432/tdj_db?schema=public"
   ```

4. Instalá dependencias, generá el cliente de Prisma y corré la primera migración:
   ```bash
   npm install
   npx prisma migrate dev --name init
   ```
   Esto crea las tablas. `npm install` ya corre `prisma generate` solo (hook `postinstall`).

5. Sembrá los datos de ejemplo (los mismos placeholders que ya conocés del frontend):
   ```bash
   npm run seed
   ```

6. Corré el servidor:
   ```bash
   npm run dev
   ```
   Por defecto queda escuchando en `http://localhost:4000`. Probá `http://localhost:4000/api/health`.

## Variables de entorno

Ver `.env.example`. Las importantes:

- `DATABASE_URL` — conexión a Postgres.
- `CORS_ORIGIN` — origen(es) permitidos (tu frontend en Vite: `http://localhost:5173`).
- `JWT_SECRET` — secreto para firmar los tokens de login (Fase 5). Generá uno
  fuerte en producción: `openssl rand -base64 48`.
- `SEED_ADMIN_PASSWORD` — contraseña del admin que crea `npm run seed` (por
  defecto `catedra2026`).
- `UPLOADS_DIR` — carpeta de archivos subidos (Fase 6). Por defecto `./uploads`.
- `PUBLIC_BASE_URL` — URL pública del backend para armar los links a
  archivos subidos. Vacío en desarrollo; en producción, la URL real del
  servicio en Render.

## Estructura

```
prisma/
  schema.prisma   Modelo de datos completo (Unidad, Programa, Bibliografía,
                   Material, Enlaces, Novedades, Preguntas, Trivias, Menú,
                   SiteConfig/RedSocial, ConfiguracionVisual, ConfiguracionSEO,
                   AdminUser)
  seed.ts          Carga los mismos datos de ejemplo que usa el frontend
src/
  index.ts         Entry point: Express + CORS + rutas
  lib/prisma.ts     Cliente único de Prisma
  middleware/       auth.ts — requireAuth (verifica JWT) y requireRole (permisos por rol)
  routes/           Un router por entidad — la mayoría usa crudRouter.ts
                     (fábrica genérica GET/POST/PUT/DELETE); material y
                     trivias tienen routers a medida por la relación
                     muchos-a-muchos con unidades; auth.routes.ts y
                     adminUsers.routes.ts manejan login/roles.
  utils/            asyncHandler (evita try/catch repetido)
```

## Autenticación (Fase 5)

Login real con JWT — reemplaza el login demo del frontend y la clave
`ADMIN_API_KEY` de la Fase 4.

```
POST /api/auth/login              { email, password } → { token, user }
GET  /api/auth/me                 (requiere Bearer token)
PUT  /api/auth/me/password        { currentPassword, newPassword } (requiere Bearer token)
```

El token va en cada request protegido: `Authorization: Bearer <token>`.

**Roles:**
- `editor` — puede editar todo el contenido (unidades, bibliografía, trivias, etc.)
- `admin` — todo lo de editor + crear/editar otros administradores
- `superadmin` — todo lo de admin + eliminar administradores y resetear contraseñas ajenas

```
GET    /api/admin-users                    (cualquier admin autenticado)
POST   /api/admin-users                    (admin o superadmin) — { nombre, email, password, rol }
PUT    /api/admin-users/:id                (admin o superadmin)
POST   /api/admin-users/:id/reset-password (solo superadmin) — { newPassword }
DELETE /api/admin-users/:id                (solo superadmin)
```

Usuario de ejemplo tras `npm run seed`: `admin@catedra.edu.ar` / `catedra2026`
(configurable con `SEED_ADMIN_PASSWORD`). Cambiar la contraseña apenas se
entra por primera vez, desde "Mi cuenta" en el panel.

## Carga de archivos (Fase 6)

```
POST   /api/uploads             multipart/form-data, campo "file" (requiere Bearer token)
                                 → { url, filename, originalName, mimetype, size }
DELETE /api/uploads/:filename   (requiere Bearer token)
```

Tipos permitidos: imágenes (png, jpg, webp, svg, gif), PDF, video (mp4, webm),
audio (mp3, wav, ogg). Tamaño máximo: 25MB por archivo.

Los archivos se guardan en `UPLOADS_DIR` (por defecto `./uploads`) y se
sirven como estáticos en `/uploads/<archivo>`. **En Render hace falta un
disco persistente** montado en esa ruta (requiere plan Starter o superior)
— sin él, el filesystem del contenedor es efímero y los archivos se
pierden en cada redeploy o reinicio. Ver `DEPLOY.md`.

## Endpoints de contenido

Todos bajo `/api`. Lectura pública, escritura protegida con JWT (`Authorization: Bearer <token>`).

```
GET/POST            /unidades
GET/PUT/DELETE       /unidades/:id
GET/PUT             /programa                (recurso único)
GET/POST            /bibliografia
GET/PUT/DELETE       /bibliografia/:id
GET/POST            /materiales              (unidadesIds: number[])
GET/PUT/DELETE       /materiales/:id
GET/POST            /enlaces
GET/PUT/DELETE       /enlaces/:id
GET/POST            /novedades
GET/PUT/DELETE       /novedades/:id
GET/POST            /preguntas
GET/PUT/DELETE       /preguntas/:id
GET/POST            /trivias                 (unidadesIds: number[])
GET/PUT/DELETE       /trivias/:id
GET                 /trivias/:id/preguntas   (solo preguntas de las unidades de esa trivia)
GET/POST            /menu
GET/PUT/DELETE       /menu/:id
GET/POST            /calendario
GET/PUT/DELETE       /calendario/:id
GET/PUT             /site-config             (footer + redes sociales)
GET/PUT             /config-visual
GET/PUT             /config-seo
GET/POST            /admin-users
GET/PUT/DELETE       /admin-users/:id
```

## Deploy en Render + Vercel (Fase 7)

Guía completa paso a paso en `DEPLOY.md`, incluyendo el `render.yaml`
(Blueprint) incluido en este proyecto para levantar el servicio web y la
base de datos en un solo paso. Resumen:

1. Backend + PostgreSQL en Render (Blueprint o manual) → te da una URL pública.
2. Frontend en Vercel, con `VITE_API_URL` apuntando a esa URL.
3. Volver a Render y actualizar `CORS_ORIGIN` con la URL final de Vercel.

Ver `DEPLOY.md` para el detalle de cada paso, variables de entorno y las
limitaciones del plan free de Render (sin disco persistente, el servicio
"duerme" tras 15 min de inactividad).

## Fase 8 — Calendario académico

Nuevo modelo `EventoCalendario` (ver `prisma/schema.prisma`) y endpoints
`/api/calendario` (mismo patrón CRUD que el resto). Al traer este cambio
sobre una base de datos ya migrada, hace falta correr:

```bash
npx prisma migrate dev --name calendario
npm run seed   # opcional — agrega 3 fechas de ejemplo si la tabla está vacía
```

## Estado actual

Auth con JWT y roles (Fase 5), carga de archivos real (Fase 6) y deploy
(Fase 7) ya están implementados — ver las secciones correspondientes más
arriba y `DEPLOY.md`. El frontend (`tdj-platform`) ya habla con esta API en
todos los módulos del panel cuando `VITE_API_URL` está configurada.
