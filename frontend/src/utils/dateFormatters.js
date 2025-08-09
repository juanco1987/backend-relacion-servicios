const MESES_NOMBRES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Convertir de formato "2025-01" a "Enero 2025"
export const formatearMesAnio = (fechaString) => {
  if (!fechaString || fechaString === 'Total Global') {
    return fechaString;
  }

  // Si viene en formato "YYYY-MM" (como "2025-01")
  if (fechaString.includes('-') && fechaString.length === 7) {
    const [anio, mes] = fechaString.split('-');
    const mesIndex = parseInt(mes, 10) - 1; // Restar 1 porque los arrays empiezan en 0
    return `${MESES_NOMBRES[mesIndex]} ${anio}`;
  }

  // Si viene como objeto Date
  if (fechaString instanceof Date) {
    const mes = MESES_NOMBRES[fechaString.getMonth()];
    const anio = fechaString.getFullYear();
    return `${mes} ${anio}`;
  }

  // Si viene como dayjs object (para DateRangeSelector)
  if (fechaString && typeof fechaString.month === 'function') {
    const mes = MESES_NOMBRES[fechaString.month()];
    const anio = fechaString.year();
    return `${mes} ${anio}`;
  }

  // Si ya está en formato correcto, devolverlo tal como está
  return fechaString;
};

// Convertir de "Enero 2025" a "2025-01" (por si lo necesitas)
export const formatearANumerico = (mesAnioTexto) => {
  if (!mesAnioTexto || mesAnioTexto === 'Total Global') {
    return mesAnioTexto;
  }

  const [mesNombre, anio] = mesAnioTexto.split(' ');
  const mesIndex = MESES_NOMBRES.indexOf(mesNombre);
  
  if (mesIndex === -1) return mesAnioTexto; // Si no encuentra el mes, devolver original
  
  const mesNumero = (mesIndex + 1).toString().padStart(2, '0');
  return `${anio}-${mesNumero}`;
};

// Generar lista de meses en formato bonito
export const generarMesesFormateados = (fechaInicio, fechaFin) => {
  const meses = [];
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  let fechaActual = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
  
  while (fechaActual <= fin) {
    const mes = MESES_NOMBRES[fechaActual.getMonth()];
    const anio = fechaActual.getFullYear();
    meses.push(`${mes} ${anio}`);
    
    // Avanzar al siguiente mes
    fechaActual.setMonth(fechaActual.getMonth() + 1);
  }

  return meses;

};