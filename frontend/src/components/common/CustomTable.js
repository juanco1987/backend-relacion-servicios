import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const CustomTable = ({ headers, data, renderRow, wrapperStyles = {}, tableStyles = {} }) => {
    const { theme } = useTheme();

    const defaultWrapperStyles = {
        padding: '0',
        border: `2px solid ${theme.bordePrincipal}20`,
        borderRadius: '20px',
        background: `linear-gradient(145deg, ${theme.fondoContenedor} 0%, ${theme.fondoElemento} 100%)`,
        width: '100%',
        margin: '0 auto',
        overflow: 'hidden',
        boxShadow: `${theme.sombraComponente}, 0 0 40px ${theme.bordePrincipal}15`,
        transition: 'all 0.3s ease',
        position: 'relative',
        ...wrapperStyles
    };

    // Barra decorativa superior
    const topBarStyles = {
        height: '6px',
        background: `linear-gradient(90deg, ${theme.primario} 0%, ${theme.terminalVerde} 50%, ${theme.terminalAzul} 100%)`,
        borderRadius: '20px 20px 0 0'
    };

    const defaultTableStyles = {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: 0,
        background: 'transparent',
        ...tableStyles
    };

    const thStyles = {
        padding: '20px 24px',
        textAlign: 'left',
        background: `linear-gradient(135deg, ${theme.fondoEncabezado}ee 0%, ${theme.fondoEncabezado}aa 100%)`,
        color: theme.textoPrincipal,
        fontWeight: 800,
        fontSize: '0.85rem',
        borderBottom: `3px solid ${theme.primario}`,
        position: 'relative',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        backdropFilter: 'blur(10px)',
        '&::before': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '3px',
            background: `linear-gradient(90deg, transparent, ${theme.primario}, transparent)`
        }
    };

    const tdStyles = {
        padding: '18px 24px',
        borderBottom: `1px solid ${theme.bordePrincipal}15`,
        color: theme.textoPrincipal,
        fontSize: '0.9rem',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        fontWeight: 500
    };

    const trStyles = {
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative'
    };

    return (
        <div 
            style={defaultWrapperStyles}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `${theme.sombraHover}, 0 8px 50px ${theme.bordePrincipal}25, 0 0 60px ${theme.primario}20`;
                e.currentTarget.style.borderColor = `${theme.primario}40`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `${theme.sombraComponente}, 0 0 40px ${theme.bordePrincipal}15`;
                e.currentTarget.style.borderColor = `${theme.bordePrincipal}20`;
            }}
        >
            {/* Barra decorativa superior con gradiente */}
            <div style={topBarStyles}></div>
            
            <div style={{ padding: '1.5rem', overflowX: 'auto' }}>
                <table style={defaultTableStyles}>
                    <thead>
                        <tr style={{ background: `linear-gradient(135deg, ${theme.fondoEncabezado}ee 0%, ${theme.fondoEncabezado}aa 100%)` }}>
                            {headers.map((header, index) => (
                                <th key={index} style={{
                                    ...thStyles, 
                                    ...(header.style || {}),
                                    borderRight: index < headers.length - 1 ? `1px solid ${theme.bordePrincipal}20` : 'none'
                                }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px',
                                        position: 'relative'
                                    }}>
                                        <span style={{
                                            display: 'inline-block',
                                            width: '4px',
                                            height: '16px',
                                            background: `linear-gradient(180deg, ${theme.primario}, ${theme.terminalVerde})`,
                                            borderRadius: '4px',
                                            marginRight: '4px'
                                        }}></span>
                                        {header.label}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr 
                                key={index}
                                style={{
                                    ...trStyles,
                                    background: index % 2 === 0 
                                        ? `linear-gradient(90deg, ${theme.fondoContenedor}00 0%, ${theme.fondoContenedor}40 50%, ${theme.fondoContenedor}00 100%)`
                                        : 'transparent'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = `linear-gradient(90deg, ${theme.fondoHover}80 0%, ${theme.fondoHover} 50%, ${theme.fondoHover}80 100%)`;
                                    e.currentTarget.style.transform = 'translateX(8px) scale(1.01)';
                                    e.currentTarget.style.boxShadow = `-4px 0 0 0 ${theme.primario}, 0 4px 20px ${theme.bordePrincipal}30`;
                                    e.currentTarget.style.borderRadius = '8px';
                                    e.currentTarget.style.zIndex = '10';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = index % 2 === 0 
                                        ? `linear-gradient(90deg, ${theme.fondoContenedor}00 0%, ${theme.fondoContenedor}40 50%, ${theme.fondoContenedor}00 100%)`
                                        : 'transparent';
                                    e.currentTarget.style.transform = 'translateX(0) scale(1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.borderRadius = '0';
                                    e.currentTarget.style.zIndex = '1';
                                }}
                            >
                                {renderRow(item, tdStyles)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Efecto de brillo en el borde inferior */}
            <div style={{
                height: '3px',
                background: `linear-gradient(90deg, transparent, ${theme.primario}60, transparent)`,
                opacity: 0.5
            }}></div>
        </div>
    );
};

export default CustomTable;