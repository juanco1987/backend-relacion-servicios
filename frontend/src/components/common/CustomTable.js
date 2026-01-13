import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const CustomTable = React.memo(({ headers, data, renderRow, wrapperStyles = {}, tableStyles = {} }) => {
    const { theme } = useTheme();

    // Estilo Contenedor Moderno (Glassmorphism sutil)
    const defaultWrapperStyles = {
        padding: '0',
        borderRadius: '16px',
        background: theme.fondoContenedor, // Use solid or semi-transparent from theme
        border: `1px solid ${theme.bordePrincipal}`,
        width: '100%',
        margin: '0 auto',
        overflow: 'hidden', // Para el border radius
        boxShadow: `0 4px 20px rgba(0,0,0,0.25)`, // Sombra suave moderna
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        ...wrapperStyles
    };

    // Estilo Tabla
    const defaultTableStyles = {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: 0,
        ...tableStyles
    };

    // Estilo Encabezado (Sticky & Clean)
    const thStyles = {
        padding: '16px 24px',
        textAlign: 'center', // Centrado por defecto como pidió el usuario
        background: theme.fondoContenedor, // O un tono ligeramente diferente
        color: theme.textoSecundario,
        fontWeight: 700,
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: `1px solid ${theme.bordePrincipal}`,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backdropFilter: 'blur(12px)', // Efecto glass si el fondo tiene transparencia
        whiteSpace: 'nowrap'
    };

    // Estilo Celda Base
    const tdStyles = {
        padding: '16px 24px',
        borderBottom: `1px solid ${theme.bordePrincipal}40`, // Borde muy sutil
        color: theme.textoPrincipal,
        fontSize: '0.9rem',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s ease'
    };

    // Estilo Fila
    const trStyles = {
        transition: 'background-color 0.2s ease, transform 0.2s ease',
        cursor: 'default'
    };

    return (
        <div style={defaultWrapperStyles}>
            {/* Contenedor con scroll para la tabla */}
            <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={defaultTableStyles}>
                    <thead>
                        <tr>
                            {headers.map((header, index) => (
                                <th key={index} style={{
                                    ...thStyles,
                                    ...(header.style || {}),
                                    // Alineación condicional basada en el header style si existe
                                }}>
                                    {header.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => {
                            // Alternating row colors (muy sutil)
                            const isEven = index % 2 === 0;
                            const bgBase = 'transparent';

                            return (
                                <tr
                                    key={index}
                                    style={trStyles}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = `${theme.primario}10`; // 10% de opacidad del primario
                                        // e.currentTarget.style.transform = 'scale(1.005)'; // Puede causar problemas de layout en tablas, mejor evitar scale en tr
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = bgBase;
                                        // e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                >
                                    {renderRow(item, tdStyles)}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer sutil si no hay datos o final */}
            {data.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: theme.textoSecundario }}>
                    No hay datos para mostrar
                </div>
            )}
        </div>
    );
});

export default CustomTable;