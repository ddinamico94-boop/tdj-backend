import { PrismaClient, TipoBibliografia, TipoMaterial, Dificultad } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// PLACEHOLDER — mismos datos de ejemplo que en el frontend (src/data/*.ts),
// para que la primera carga de la base de datos real coincida con la demo.
// No es contenido académico real: reemplazar desde el panel administrativo.

async function main() {
  console.log('Sembrando base de datos...');

  // Unidades
  const unidadesData = Array.from({ length: 14 }, (_, i) => {
    const n = i + 1;
    return {
      numero: `U-${String(n).padStart(2, '0')}`,
      titulo: `Unidad ${n}`,
      descripcion: `Descripción de ejemplo de la Unidad ${n}. Este texto es un placeholder y debe reemplazarse desde el panel administrativo con el contenido real de la cátedra.`,
      introduccion: '',
      temas: ['Tema de ejemplo 1', 'Tema de ejemplo 2', 'Tema de ejemplo 3'],
      publicada: true,
      orden: n,
    };
  });

  const unidades = [];
  for (const u of unidadesData) {
    const created = await prisma.unidad.upsert({
      where: { numero: u.numero },
      update: {},
      create: u,
    });
    unidades.push(created);
  }

  // Programa
  await prisma.programa.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      titulo: 'Programa de la materia',
      presentacion:
        'Texto de presentación de ejemplo del programa de Teoría del Derecho y la Justicia B. Este contenido es un placeholder editable desde el panel administrativo.',
      objetivos: ['Objetivo general de ejemplo 1', 'Objetivo general de ejemplo 2', 'Objetivo general de ejemplo 3'],
    },
  });

  // Bibliografía
  const bibCount = await prisma.recursoBibliografico.count();
  if (bibCount === 0) {
    for (let i = 0; i < 6; i++) {
      await prisma.recursoBibliografico.create({
        data: {
          tipo: TipoBibliografia.obligatoria,
          autor: `Autor de ejemplo ${i + 1}`,
          titulo: `Título bibliográfico de ejemplo ${i + 1}`,
          editorial: 'Editorial de ejemplo',
          anio: '2020',
          descripcion: 'Descripción de ejemplo del material bibliográfico obligatorio.',
          unidadId: unidades[i]?.id,
          orden: i,
        },
      });
    }
    for (let i = 0; i < 4; i++) {
      await prisma.recursoBibliografico.create({
        data: {
          tipo: TipoBibliografia.complementaria,
          autor: `Autor de ejemplo ${i + 1}`,
          titulo: `Título bibliográfico complementario de ejemplo ${i + 1}`,
          editorial: 'Editorial de ejemplo',
          anio: '2019',
          descripcion: 'Descripción de ejemplo del material bibliográfico complementario.',
          unidadId: unidades[i]?.id,
          orden: i,
        },
      });
    }
  }

  // Material de estudio
  const matCount = await prisma.materialEstudio.count();
  if (matCount === 0) {
    const tipos: TipoMaterial[] = [TipoMaterial.PDF, TipoMaterial.Video, TipoMaterial.Link, TipoMaterial.Audio];
    for (let i = 0; i < 8; i++) {
      await prisma.materialEstudio.create({
        data: {
          titulo: `Material de ejemplo ${i + 1}`,
          tipo: tipos[i % tipos.length],
          descripcion: 'Descripción de ejemplo del material de estudio.',
          orden: i,
          unidades: { create: [{ unidadId: unidades[i].id }] },
        },
      });
    }
  }

  // Sitios importantes / enlaces (URLs reales las carga la cátedra)
  const enlacesCount = await prisma.enlaceEditable.count();
  if (enlacesCount === 0) {
    const enlaces = [
      { nombre: 'Página oficial de la Facultad', descripcion: 'Sitio institucional de la Facultad de Derecho', icono: 'FD', categoria: 'institucional' },
      { nombre: 'Aula Virtual', descripcion: 'Acceder al aula virtual de la cátedra', icono: 'AV', categoria: 'academico' },
      { nombre: 'Sistema Académico', descripcion: 'Gestión de inscripciones y notas', icono: 'SA', categoria: 'academico' },
      { nombre: 'Biblioteca', descripcion: 'Catálogo y recursos de biblioteca', icono: 'BI', categoria: 'academico' },
    ];
    for (let i = 0; i < enlaces.length; i++) {
      await prisma.enlaceEditable.create({
        data: { ...enlaces[i], url: '#', orden: i, activo: true, abrirEnNuevaPestana: true },
      });
    }
  }

  // Novedades
  const novCount = await prisma.novedad.count();
  if (novCount === 0) {
    await prisma.novedad.createMany({
      data: [
        {
          titulo: 'Novedad de ejemplo 1',
          descripcion: 'Descripción de ejemplo de una novedad publicada por la cátedra.',
          fecha: new Date('2026-08-10'),
          destacada: true,
          publicada: true,
        },
        {
          titulo: 'Novedad de ejemplo 2',
          descripcion: 'Descripción de ejemplo de otra novedad de la cátedra.',
          fecha: new Date('2026-08-05'),
          destacada: false,
          publicada: true,
        },
        {
          titulo: 'Novedad de ejemplo 3',
          descripcion: 'Descripción de ejemplo de una tercera novedad.',
          fecha: new Date('2026-07-28'),
          destacada: false,
          publicada: true,
        },
      ],
    });
  }

  // Banco de preguntas (placeholder, NO contenido académico real)
  const pregCount = await prisma.pregunta.count();
  if (pregCount === 0) {
    const dificultades: Dificultad[] = [Dificultad.facil, Dificultad.medio, Dificultad.dificil];
    for (const u of unidades) {
      for (let q = 1; q <= 4; q++) {
        await prisma.pregunta.create({
          data: {
            unidadId: u.id,
            dificultad: dificultades[q % dificultades.length],
            pregunta: `Pregunta de ejemplo ${q} — ${u.titulo}. (placeholder, reemplazar desde el banco de preguntas)`,
            opciones: ['Opción de ejemplo A', 'Opción de ejemplo B', 'Opción de ejemplo C', 'Opción de ejemplo D'],
            correcta: q % 4,
            explicacion: 'Explicación de ejemplo de por qué esta es la respuesta correcta. Editable desde el panel.',
          },
        });
      }
    }
  }

  // Trivias
  const triviaCount = await prisma.trivia.count();
  if (triviaCount === 0) {
    await prisma.trivia.create({
      data: {
        nombre: 'Trivia General',
        descripcion: 'Incluye las 14 unidades de la materia.',
        cantidadPreguntas: 10,
        tiempoPorPreguntaSeg: 20,
        unidades: { create: unidades.map((u) => ({ unidadId: u.id })) },
      },
    });
    await prisma.trivia.create({
      data: {
        nombre: 'Trivia Primer Parcial',
        descripcion: 'Unidades 1 a 3.',
        cantidadPreguntas: 8,
        tiempoPorPreguntaSeg: 20,
        unidades: { create: unidades.slice(0, 3).map((u) => ({ unidadId: u.id })) },
      },
    });
    await prisma.trivia.create({
      data: {
        nombre: 'Trivia Unidad 7',
        descripcion: 'Solamente Unidad 7.',
        cantidadPreguntas: 4,
        tiempoPorPreguntaSeg: 20,
        unidades: { create: [{ unidadId: unidades[6].id }] },
      },
    });
  }

  // Calendario académico (placeholder — fechas de ejemplo, NO reales)
  const eventosCount = await prisma.eventoCalendario.count();
  if (eventosCount === 0) {
    await prisma.eventoCalendario.createMany({
      data: [
        {
          titulo: 'Primer parcial (fecha de ejemplo)',
          descripcion: 'Fecha de ejemplo — reemplazar por la fecha real del primer parcial.',
          fecha: new Date('2026-10-05'),
          tipo: 'parcial',
          publicado: true,
        },
        {
          titulo: 'Segundo parcial (fecha de ejemplo)',
          descripcion: 'Fecha de ejemplo — reemplazar por la fecha real del segundo parcial.',
          fecha: new Date('2026-11-16'),
          tipo: 'parcial',
          publicado: true,
        },
        {
          titulo: 'Recuperatorio (fecha de ejemplo)',
          descripcion: 'Fecha de ejemplo — reemplazar por la fecha real del recuperatorio.',
          fecha: new Date('2026-11-30'),
          tipo: 'recuperatorio',
          publicado: true,
        },
      ],
    });
  }

  // Menú
  const menuCount = await prisma.itemMenu.count();
  if (menuCount === 0) {
    const items = [
      { label: 'Inicio', to: '/' },
      { label: 'Unidades', to: '/unidades' },
      { label: 'Programa', to: '/programa' },
      { label: 'Calendario', to: '/calendario' },
      { label: 'Bibliografía', to: '/bibliografia' },
      { label: 'Material', to: '/material' },
      { label: 'Trivia', to: '/trivia' },
      { label: 'Novedades', to: '/novedades' },
      { label: 'Sitios importantes', to: '/sitios' },
    ];
    for (let i = 0; i < items.length; i++) {
      await prisma.itemMenu.create({ data: { ...items[i], orden: i, visible: true } });
    }
  }

  // Configuración del sitio
  await prisma.siteConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nombre: 'Teoría del Derecho y la Justicia B',
      bienvenida:
        'Todo el contenido de la cátedra — unidades, bibliografía, material de estudio y trivias — en un solo lugar.',
      footerTexto: 'Plataforma académica de la cátedra. Contenido gestionado desde el panel administrativo.',
      redesSociales: {
        create: [
          { plataforma: 'instagram', url: '#', activo: false },
          { plataforma: 'whatsapp', url: '#', activo: false },
        ],
      },
    },
  });

  await prisma.configuracionVisual.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, colorPrimario: '#1CDFE8', colorSecundario: '#FF8AD1', tipografia: 'Space Grotesk / Inter' },
  });

  await prisma.configuracionSEO.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nombreSitio: 'Teoría del Derecho y la Justicia B',
      tituloSEO: 'Teoría del Derecho y la Justicia B — Plataforma académica',
      descripcion: 'Unidades, programa, bibliografía, material de estudio y trivias de la cátedra.',
    },
  });

  // Administrador de ejemplo — login real con JWT (Fase 5).
  // Contraseña de demo: cambiarla apenas se entra por primera vez.
  const defaultPassword = process.env.SEED_ADMIN_PASSWORD ?? 'catedra2026';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);
  await prisma.adminUser.upsert({
    where: { email: 'admin@catedra.edu.ar' },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@catedra.edu.ar',
      passwordHash,
      rol: 'superadmin',
      activo: true,
    },
  });
  console.log(`Admin de ejemplo: admin@catedra.edu.ar / ${defaultPassword}`);

  console.log('Listo.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
