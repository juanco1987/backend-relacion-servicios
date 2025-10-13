// ARCHIVO 1: src/utils/gastoCalculator.js

/**
 * Calcula totales y diferencias para el reporte de gastos
 * 
 * @param {Object} gastoData - Datos del gasto individual
 * @param {Array} consignaciones - Array de consignaciones (si hay varias)
 * @returns {Object} Objeto con todos los cálculos necesarios
 */

export const calcularGastos = (gastoData, consignaciones = []) => {
  // TABLA 1: TOTAL GASTOS SERVICIOS
  const totalGastos = parseFloat(gastoData?.monto) || 0;

  // TABLA 2: TOTAL CONSIGNADO
  let totalConsignado = 0;
  
  if (Array.isArray(consignaciones) && consignaciones.length > 0) {
    totalConsignado = consignaciones.reduce((sum, cons) => {
      return sum + (parseFloat(cons?.monto) || parseFloat(cons) || 0);
    }, 0);
  } else if (typeof consignaciones === 'number') {
    totalConsignado = consignaciones;
  }

  // CÁLCULO DE DIFERENCIA
  const diferencia = totalConsignado - totalGastos;

  // LÓGICA DE VUELTAS vs EXCEDENTE
  let vueltasAFavorDeAbrecar = 0;
  let excedenteAFavorDeJG = 0;

  if (diferencia > 0) {
    // Sobró dinero - vueltas para abrecar
    vueltasAFavorDeAbrecar = diferencia;
    excedenteAFavorDeJG = 0;
  } else if (diferencia < 0) {
    // Se gastó más - excedente a favor de JG (positivo)
    vueltasAFavorDeAbrecar = 0;
    excedenteAFavorDeJG = Math.abs(diferencia); // Convertir a positivo
  } else {
    // Diferencia exacta
    vueltasAFavorDeAbrecar = 0;
    excedenteAFavorDeJG = 0;
  }

  return {
    // Tabla 1
    totalGastos,
    
    // Tabla 2
    totalConsignado,
    diferencia,
    vueltasAFavorDeAbrecar,
    excedenteAFavorDeJG,
    
    // Info adicional
    tipoResultado: diferencia > 0 ? 'vueltas' : diferencia < 0 ? 'excedente' : 'exacto',
  };
};

/**
 * Formatea un número como moneda
 */
export const formatearMoneda = (valor) => {
  const num = parseFloat(valor) || 0;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Formatea una fecha
 */
export const formatearFecha = (fecha) => {
  if (!fecha) return 'N/A';
  try {
    const date = fecha.toDate ? fecha.toDate() : new Date(fecha);
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    return 'N/A';
  }
};