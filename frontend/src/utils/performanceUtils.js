/**
 * Performance utilities for React optimization
 */

/**
 * Shallow equality comparison for React.memo
 * @param {Object} objA - First object
 * @param {Object} objB - Second object
 * @returns {boolean} - True if objects are shallowly equal
 */
export function shallowEqual(objA, objB) {
    if (objA === objB) {
        return true;
    }

    if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
        return false;
    }

    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
        return false;
    }

    for (let i = 0; i < keysA.length; i++) {
        if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
            return false;
        }
    }

    return true;
}

/**
 * Deep equality comparison for complex objects
 * @param {*} a - First value
 * @param {*} b - Second value
 * @returns {boolean} - True if values are deeply equal
 */
export function deepEqual(a, b) {
    if (a === b) return true;

    if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
    }

    if (!a || !b || (typeof a !== 'object' && typeof b !== 'object')) {
        return a === b;
    }

    if (a.prototype !== b.prototype) return false;

    const keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) return false;

    return keys.every(k => deepEqual(a[k], b[k]));
}

/**
 * HOC to measure component render time (development only)
 * @param {React.Component} Component - Component to measure
 * @param {string} componentName - Name for logging
 * @returns {React.Component} - Wrapped component
 */
export function measureRenderTime(Component, componentName) {
    if (process.env.NODE_ENV !== 'development') {
        return Component;
    }

    return function MeasuredComponent(props) {
        const startTime = performance.now();

        const result = Component(props);

        const endTime = performance.now();
        const renderTime = endTime - startTime;

        if (renderTime > 16) { // Log if render takes more than 1 frame (16ms)
            console.warn(`[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render`);
        }

        return result;
    };
}

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function for performance optimization
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
