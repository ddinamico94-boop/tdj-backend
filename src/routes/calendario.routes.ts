import { prisma } from '../lib/prisma';
import { crudRouter } from './crudRouter';

export const calendarioRouter = crudRouter(prisma.eventoCalendario, {
  orderBy: { fecha: 'asc' },
  beforeWrite: (body) => {
    const data = { ...body };

    if (data.fecha) {
      data.fecha = new Date(data.fecha);
    }

    if (data.fechaFin) {
      data.fechaFin = new Date(data.fechaFin);
    } else {
      data.fechaFin = null;
    }

    if (data.unidadId !== undefined && data.unidadId !== null && data.unidadId !== '' && data.unidadId !== 0) {
      data.unidadId = Number(data.unidadId);
    } else {
      data.unidadId = null;
    }

    return data;
  },
});