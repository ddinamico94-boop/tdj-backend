-- CreateEnum
CREATE TYPE "TipoBibliografia" AS ENUM ('obligatoria', 'complementaria');

-- CreateEnum
CREATE TYPE "TipoMaterial" AS ENUM ('PDF', 'Video', 'Audio', 'Documento', 'Imagen', 'Link');

-- CreateEnum
CREATE TYPE "Dificultad" AS ENUM ('facil', 'medio', 'dificil');

-- CreateEnum
CREATE TYPE "PlataformaRed" AS ENUM ('instagram', 'facebook', 'youtube', 'whatsapp', 'x', 'otra');

-- CreateEnum
CREATE TYPE "RolAdmin" AS ENUM ('superadmin', 'admin', 'editor');

-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('parcial', 'recuperatorio', 'clase', 'entrega', 'feriado', 'otro');

-- CreateTable
CREATE TABLE "Unidad" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL DEFAULT '',
    "introduccion" TEXT NOT NULL DEFAULT '',
    "temas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "publicada" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Programa" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "titulo" TEXT NOT NULL DEFAULT 'Programa de la materia',
    "presentacion" TEXT NOT NULL DEFAULT '',
    "objetivos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pdfUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Programa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecursoBibliografico" (
    "id" TEXT NOT NULL,
    "tipo" "TipoBibliografia" NOT NULL,
    "autor" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "editorial" TEXT,
    "anio" TEXT,
    "descripcion" TEXT,
    "tema" TEXT,
    "imagenUrl" TEXT,
    "pdfUrl" TEXT,
    "linkExterno" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "unidadId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecursoBibliografico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialEstudio" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" "TipoMaterial" NOT NULL,
    "descripcion" TEXT,
    "archivoUrl" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialEstudio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialUnidad" (
    "materialId" TEXT NOT NULL,
    "unidadId" INTEGER NOT NULL,

    CONSTRAINT "MaterialUnidad_pkey" PRIMARY KEY ("materialId","unidadId")
);

-- CreateTable
CREATE TABLE "EnlaceEditable" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "url" TEXT NOT NULL,
    "logoUrl" TEXT,
    "icono" TEXT,
    "categoria" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "abrirEnNuevaPestana" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnlaceEditable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Novedad" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "imagenUrl" TEXT,
    "archivoUrl" TEXT,
    "link" TEXT,
    "destacada" BOOLEAN NOT NULL DEFAULT false,
    "publicada" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Novedad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pregunta" (
    "id" TEXT NOT NULL,
    "pregunta" TEXT NOT NULL,
    "opciones" TEXT[],
    "correcta" INTEGER NOT NULL,
    "explicacion" TEXT,
    "dificultad" "Dificultad" NOT NULL DEFAULT 'medio',
    "imagenUrl" TEXT,
    "unidadId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pregunta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trivia" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "cantidadPreguntas" INTEGER NOT NULL DEFAULT 10,
    "dificultad" TEXT NOT NULL DEFAULT 'mixta',
    "tiempoPorPreguntaSeg" INTEGER NOT NULL DEFAULT 20,
    "ordenAleatorio" BOOLEAN NOT NULL DEFAULT true,
    "mostrarExplicacion" BOOLEAN NOT NULL DEFAULT true,
    "mostrarRespuestaCorrecta" BOOLEAN NOT NULL DEFAULT true,
    "publicada" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trivia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TriviaUnidad" (
    "triviaId" TEXT NOT NULL,
    "unidadId" INTEGER NOT NULL,

    CONSTRAINT "TriviaUnidad_pkey" PRIMARY KEY ("triviaId","unidadId")
);

-- CreateTable
CREATE TABLE "ItemMenu" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "icono" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ItemMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteConfig" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "nombre" TEXT NOT NULL DEFAULT '',
    "bienvenida" TEXT NOT NULL DEFAULT '',
    "footerTexto" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RedSocial" (
    "id" TEXT NOT NULL,
    "plataforma" "PlataformaRed" NOT NULL,
    "url" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT false,
    "siteConfigId" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "RedSocial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfiguracionVisual" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "colorPrimario" TEXT NOT NULL DEFAULT '#1CDFE8',
    "colorSecundario" TEXT NOT NULL DEFAULT '#FF8AD1',
    "tipografia" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracionVisual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfiguracionSEO" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "nombreSitio" TEXT NOT NULL DEFAULT '',
    "tituloSEO" TEXT NOT NULL DEFAULT '',
    "descripcion" TEXT NOT NULL DEFAULT '',
    "imagenCompartirUrl" TEXT,
    "faviconUrl" TEXT,
    "autor" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracionSEO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "rol" "RolAdmin" NOT NULL DEFAULT 'editor',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoCalendario" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "tipo" "TipoEvento" NOT NULL DEFAULT 'otro',
    "publicado" BOOLEAN NOT NULL DEFAULT true,
    "unidadId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventoCalendario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Unidad_numero_key" ON "Unidad"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- AddForeignKey
ALTER TABLE "RecursoBibliografico" ADD CONSTRAINT "RecursoBibliografico_unidadId_fkey" FOREIGN KEY ("unidadId") REFERENCES "Unidad"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialUnidad" ADD CONSTRAINT "MaterialUnidad_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "MaterialEstudio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialUnidad" ADD CONSTRAINT "MaterialUnidad_unidadId_fkey" FOREIGN KEY ("unidadId") REFERENCES "Unidad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pregunta" ADD CONSTRAINT "Pregunta_unidadId_fkey" FOREIGN KEY ("unidadId") REFERENCES "Unidad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TriviaUnidad" ADD CONSTRAINT "TriviaUnidad_triviaId_fkey" FOREIGN KEY ("triviaId") REFERENCES "Trivia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TriviaUnidad" ADD CONSTRAINT "TriviaUnidad_unidadId_fkey" FOREIGN KEY ("unidadId") REFERENCES "Unidad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedSocial" ADD CONSTRAINT "RedSocial_siteConfigId_fkey" FOREIGN KEY ("siteConfigId") REFERENCES "SiteConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoCalendario" ADD CONSTRAINT "EventoCalendario_unidadId_fkey" FOREIGN KEY ("unidadId") REFERENCES "Unidad"("id") ON DELETE SET NULL ON UPDATE CASCADE;
