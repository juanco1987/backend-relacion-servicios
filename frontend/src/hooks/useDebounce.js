import { useState, useEffect } from 'react';

/**
 * Hook personalizado para debouncing de valores.
 * Útil para evitar actualizaciones excesivas en búsquedas o inputs en tiempo real.
 * 
 * @param {any} value - El valor a observar
 * @param {number} delay - El tiempo de espera en milisegundos (default: 500ms)
 * @returns {any} - El valor debounced
 */
function useDebounce(value, delay = 500) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Configurar el timer para actualizar el valor después del delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Limpiar el timer si el valor cambia (o el componente se desmonta)
        // antes de que termine el delay
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default useDebounce;
