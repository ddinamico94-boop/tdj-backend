# Deploy — Render (backend + PostgreSQL) + Vercel (frontend)

**Por qué esta combinación:** Render corre el backend como proceso
persistente (no serverless) — necesario porque Prisma mantiene conexiones
abiertas y porque los archivos subidos (`/uploads`) necesitan un disco que
no desaparezca entre requests. Vercel es ideal para el frontend (sitio
estático + build de Vite), pero no para este backend.

**Orden recomendado:** primero el backend en Render (necesitás su URL
pública para configurar el frontend), después Vercel.

---

## 1. Backend + PostgreSQL en Render

### Opción A — Blueprint (recomendado, un solo paso)

Este proyecto incluye `render.yaml`, que define el servicio web y la base
de datos juntos.

1. Subí `tdj-backend` a un repo de GitHub (con GitHub Desktop, como siempre).
2. [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**.
3. Conectá el repo. Render lee `render.yaml` y te muestra un preview con
   el servicio `tdj-backend` y la base `tdj-db` — confirmá con **Apply**.
4. Render va a pedirte completar las variables marcadas `sync: false`:
   - `PUBLIC_BASE_URL` — dejala vacía por ahora, la completás en el paso 1.3
   - `SEED_ADMIN_PASSWORD` — opcional, solo si vas a correr el seed

### Opción B — Manual (si preferís no usar el Blueprint)

1. **New** → **PostgreSQL** → nombre `tdj-db`, plan Free → **Create Database**.
   Copiá el **Internal Database URL** que te da.
2. **New** → **Web Service** → conectá el repo de `tdj-backend`.
   - Runtime: Node
   - Build command: `npm install && npm run build`
   - Start command: `npm run start:prod`
   - Health check path: `/api/health`
3. Variables de entorno del servicio (pestaña **Environment**):

   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | el Internal Database URL del paso 1 |
   | `JWT_SECRET` | `openssl rand -base64 48` en tu terminal, pegá el resultado |
   | `CORS_ORIGIN` | por ahora `http://localhost:5173` (lo actualizás en el paso 3) |
   | `UPLOADS_DIR` | `/var/data/uploads` |
   | `PUBLIC_BASE_URL` | se completa en el paso 1.3 |
   | `SEED_ADMIN_PASSWORD` | opcional |

### 1.1 Disco persistente para los archivos subidos (Fase 6)

**Importante — plan free no soporta discos.** Sin disco persistente, cada
restart/redeploy borra lo que se subió desde el panel (logos, PDFs, etc.),
y Render además "duerme" los servicios free tras 15 minutos sin tráfico
(la primera request después tarda ~30-50 segundos en "despertar").

Para agregar el disco (requiere plan Starter o superior en el servicio web):
1. Servicio backend → **Disks** → **Add Disk**.
2. Mount path: `/var/data/uploads` (mismo valor que `UPLOADS_DIR`).

Mientras estés probando el proyecto, andar sin disco (plan free) está bien.

### 1.2 Deploy

Con el Blueprint, Render ya arranca el deploy solo. Esperá a que el estado
pase a **Live** (el build corre `prisma generate` automáticamente por el
`postinstall` del `package.json`, y `start:prod` corre `prisma migrate
deploy` antes de levantar el server).

### 1.3 Completar la URL pública

1. Copiá la URL que te dio Render (algo como `https://tdj-backend.onrender.com`).
2. Servicio backend → **Environment** → completá `PUBLIC_BASE_URL` con esa
   misma URL → **Save Changes** (esto redeploya solo).

### 1.4 Verificar

Abrí `https://tu-servicio.onrender.com/api/health` — debería responder
`{"ok":true}`. Si el servicio estaba dormido, la primera carga tarda un
rato.

### 1.5 Sembrar datos de ejemplo (opcional)

Servicio backend → pestaña **Shell** (Render te da una consola del
contenedor) → corré:
```bash
npm run seed
```
O cargá el contenido real directamente desde el panel ya en producción.

---

## 2. Frontend en Vercel

### 2.1 Importar el proyecto

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → importá el repo de `tdj-platform`.
2. Vercel detecta Vite solo (build command `npm run build`, output `dist`).
3. `vercel.json` (incluido) agrega el rewrite necesario para que React
   Router funcione al refrescar rutas como `/unidades` o `/admin` (sin
   esto, Vercel devuelve 404 en esas URLs).

### 2.2 Variable de entorno

**Settings → Environment Variables**:

| Variable | Valor |
|---|---|
| `VITE_API_URL` | `https://tu-servicio.onrender.com/api` |

Sin esta variable, el frontend queda en modo demo local (login demo + localStorage).

### 2.3 Deploy

Botón **Deploy**. Los próximos deploys son automáticos con cada push.

### 2.4 Cerrar el círculo con CORS

Con la URL final de Vercel (`https://tu-proyecto.vercel.app`):

1. Render → servicio backend → **Environment** → actualizá `CORS_ORIGIN`
   con esa URL exacta (sin `/` al final) → **Save Changes**.

Un error de CORS en la consola del navegador casi siempre es este paso.

---

## 3. Checklist final

- [ ] `https://tu-servicio.onrender.com/api/health` responde `{"ok":true}`
- [ ] `https://tu-proyecto.vercel.app` carga el sitio público
- [ ] `https://tu-proyecto.vercel.app/admin` pide login (sin dar 404 al refrescar)
- [ ] Login con `admin@catedra.edu.ar` / la contraseña sembrada — funciona
- [ ] Subir una imagen desde el panel y que la URL resultante sea la de
      Render, no un `data:image/...` gigante
- [ ] Cambiar la contraseña del admin desde "Mi cuenta"
- [ ] Si vas a uso real: agregar el disco persistente (ver 1.1) — si no,
      los archivos subidos se pierden en cada redeploy/reinicio

## 4. Sobre el plan free de Render

- El servicio web "duerme" tras 15 min sin requests; la primera visita
  después tarda en responder.
- Sin disco persistente, los archivos subidos no sobreviven a un redeploy
  ni a un reinicio del contenedor.
- La base de datos free de Render expira a los 90 días si no se pasa a un
  plan pago — para un proyecto en uso real, conviene planificarlo.

Ninguno de estos límites afecta poder probar el proyecto de punta a punta
ahora; sí conviene resolverlos antes de darle la URL a la cátedra para uso
real.
