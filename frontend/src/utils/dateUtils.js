/**
 * Genera un array de meses desde enero hasta el mes actual en formato 'YYYY-MM'
 * @returns {string[]} Array de meses en formato 'YYYY-MM'
 */
export const generateMonthsUntilNow = () => {
  const meses = [];
  const fechaActual = new Date();
  const añoActual = fechaActual.getFullYear();
  const mesActual = fechaActual.getMonth();

  for (let mes = 0; mes <= mesActual; mes++) {
    const mesStr = String(mes + 1).padStart(2, '0');
    meses.push(`${añoActual}-${mesStr}`);
  }

  return meses.sort();
};

/**
 * Formatea un mes en formato YYYY-MM a texto (ejemplo: "Agosto 2025")
 * @param {string} mesKey - Mes en formato YYYY-MM
 * @returns {string} Mes formateado
 */
export const formatMonth = (mesKey) => {
  const [año, mes] = mesKey.split('-');
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return `${meses[parseInt(mes, 10) - 1]} ${año}`;
};

/**
 * Convierte un mes de texto a formato YYYY-MM
 * @param {string} mesTexto - Mes en formato "Mes YYYY"
 * @returns {string} Mes en formato YYYY-MM
 */
export const parseMonth = (mesTexto) => {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const [mes, año] = mesTexto.split(' ');
  const mesNum = String(meses.indexOf(mes) + 1).padStart(2, '0');
  return `${año}-${mesNum}`;
};

/**
 * Genera un rango de meses completo basado en los años encontrados en las claves de datos
 * @param {string[]} keys - Claves de mes en formato YYYY-MM
 * @returns {string[]} Array de meses completo para los años detectados
 */
export const generateMonthsFromData = (keys) => {
  if (!keys || keys.length === 0) return generateMonthsUntilNow();

  const years = new Set(keys.map(k => parseInt(k.split('-')[0])));
  if (years.size === 0) return generateMonthsUntilNow();

  const distinctYears = Array.from(years).sort();
  const months = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  distinctYears.forEach(year => {
    // Si es el año actual, mostrar hasta el mes actual
    // Si es un año pasado, mostrar todo el año (0-11)
    const endMonth = (year === currentYear) ? currentMonth : 11;

    for (let m = 0; m <= endMonth; m++) {
      months.push(`${year}-${String(m + 1).padStart(2, '0')}`);
    }
  });

  return months;
};