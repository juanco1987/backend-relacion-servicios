/**
 * Formatea un valor monetario sin decimales y con el símbolo de peso
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado (ej: "$1.234.567")
 */
export const formatCurrency = (value) =>
  `$${Math.round(Number(value || 0)).toLocaleString('es-ES', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  })}`;

/**
 * Formatea un número como entero sin decimales
 * @param {number} value - Valor a formatear
 * @returns {number} Número redondeado
 */
export const formatInteger = (value) => Math.round(Number(value || 0));

/**
 * Formatea un número con separadores de miles
 * @param {number} value - Valor a formatear
 * @returns {string} Número formateado con separadores de miles
 */
export const formatNumber = (value) =>
  Math.round(Number(value || 0)).toLocaleString('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });