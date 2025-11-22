import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const CustomTable = ({ headers, data, renderRow, wrapperStyles = {}, tableStyles = {} }) => {
    const { theme } = useTheme();

    const defaultWrapperStyles = {
        padding: '0',
        border: `3px solid ${theme.bordePrincipal}`,
        borderRadius: '24px',
        background: `linear-gradient(145deg, ${theme.fondoContenedor}dd 0%, ${theme.fondoElemento}ee 100%)`,
        width: '100%',
        margin: '0 auto',
        overflow: 'hidden',
        boxShadow: `
            ${theme.sombraComponente}, 
            0 10px 40px ${theme.bordePrincipal}40,
            inset 0 1px 0 rgba(255,255,255,0.1)
        `,
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        position: 'relative',
        ...wrapperStyles
    };

    // Barra decorativa superior más llamativa
    const topBarStyles = {
        height: '8px',
        background: `linear-gradient(90deg, 
            ${theme.primario} 0%, 
            ${theme.terminalVerde} 25%,
            ${theme.terminalAzul} 50%,
            ${theme.terminalRosa} 75%,
            ${theme.primario} 100%
        )`,
        boxShadow: `0 2px 10px ${theme.primario}60`,
        position: 'relative',
        overflow: 'hidden'
    };

    const defaultTableStyles = {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: 0,
        background: 'transparent',
        ...tableStyles
    };

    const thStyles = {
        padding: '24px 28px',
        textAlign: 'left',
        background: `linear-gradient(180deg, ${theme.fondoEncabezado} 0%, ${theme.fondoEncabezado}dd 100%)`,
        color: theme.textoPrincipal,
        fontWeight: 900,
        fontSize: '0.8rem',
        borderBottom: `4px solid ${theme.primario}`,
        borderRight: `2px solid ${theme.bordePrincipal}60`,
        position: 'relative',
        letterSpacing: '1.2px',
        textTransform: 'uppercase',
        textShadow: `0 2px 4px ${theme.bordePrincipal}40`,
        boxShadow: `inset 0 -4px 8px ${theme.primario}20`
    };

    const tdStyles = {
        padding: '20px 28px',
        borderBottom: `2px solid ${theme.bordePrincipal}80`,
        borderRight: `2px solid ${theme.bordePrincipal}60`,
        color: theme.textoPrincipal,
        fontSize: '0.95rem',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        fontWeight: 500,
        background: 'transparent'
    };

    const trStyles = {
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative'
    };

    return (
        <div 
            style={defaultWrapperStyles}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.01)';
                e.currentTarget.style.boxShadow = `
                    ${theme.sombraHover}, 
                    0 20px 60px ${theme.bordePrincipal}50,
                    0 0 80px ${theme.primario}30,
                    inset 0 1px 0 rgba(255,255,255,0.2)
                `;
                e.currentTarget.style.borderColor = theme.primario;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = `
                    ${theme.sombraComponente}, 
                    0 10px 40px ${theme.bordePrincipal}40,
                    inset 0 1px 0 rgba(255,255,255,0.1)
                `;
                e.currentTarget.style.borderColor = theme.bordePrincipal;
            }}
        >
            {/* Barra decorativa superior con efecto de brillo animado */}
            <div style={topBarStyles}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    animation: 'shimmer 3s infinite'
                }}></div>
            </div>
            
            <div style={{ padding: '2rem', overflowX: 'auto' }}>
                <table style={defaultTableStyles}>
                    <thead>
                        <tr style={{ 
                            background: `linear-gradient(180deg, ${theme.fondoEncabezado} 0%, ${theme.fondoEncabezado}dd 100%)`,
                            boxShadow: `0 4px 12px ${theme.bordePrincipal}30`
                        }}>
                            {headers.map((header, index) => (
                                <th key={index} style={{
                                    ...thStyles, 
                                    ...(header.style || {}),
                                    borderRight: index < headers.length - 1 ? `2px solid ${theme.bordePrincipal}60` : 'none',
                                    borderTopLeftRadius: index === 0 ? '12px' : '0',
                                    borderTopRightRadius: index === headers.length - 1 ? '12px' : '0'
                                }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '10px',
                                        position: 'relative'
                                    }}>
                                        {/* Icono decorativo más grande */}
                                        <div style={{
                                            width: '6px',
                                            height: '24px',
                                            background: `linear-gradient(180deg, ${theme.primario}, ${theme.terminalVerde})`,
                                            borderRadius: '6px',
                                            boxShadow: `0 0 10px ${theme.primario}80, 0 0 20px ${theme.primario}40`,
                                            marginRight: '6px'
                                        }}></div>
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
                                        ? `linear-gradient(90deg, ${theme.fondoContenedor}40 0%, ${theme.fondoContenedor}80 50%, ${theme.fondoContenedor}40 100%)`
                                        : `linear-gradient(90deg, ${theme.fondoElemento}20 0%, ${theme.fondoElemento}60 50%, ${theme.fondoElemento}20 100%)`,
                                    borderBottom: index === data.length - 1 ? 'none' : `2px solid ${theme.bordePrincipal}80`,
                                    borderBottomLeftRadius: index === data.length - 1 ? '12px' : '0',
                                    borderBottomRightRadius: index === data.length - 1 ? '12px' : '0'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = `
                                        linear-gradient(90deg, 
                                            ${theme.primario}15 0%, 
                                            ${theme.fondoHover} 50%, 
                                            ${theme.primario}15 100%
                                        )
                                    `;
                                    e.currentTarget.style.transform = 'translateX(12px) scale(1.02)';
                                    e.currentTarget.style.boxShadow = `
                                        -6px 0 0 0 ${theme.primario}, 
                                        0 6px 30px ${theme.bordePrincipal}40,
                                        inset 0 0 20px ${theme.primario}10
                                    `;
                                    e.currentTarget.style.borderRadius = '12px';
                                    e.currentTarget.style.zIndex = '10';
                                    e.currentTarget.style.borderBottom = `2px solid ${theme.primario}80`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = index % 2 === 0 
                                        ? `linear-gradient(90deg, ${theme.fondoContenedor}40 0%, ${theme.fondoContenedor}80 50%, ${theme.fondoContenedor}40 100%)`
                                        : `linear-gradient(90deg, ${theme.fondoElemento}20 0%, ${theme.fondoElemento}60 50%, ${theme.fondoElemento}20 100%)`;
                                    e.currentTarget.style.transform = 'translateX(0) scale(1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.borderRadius = '0';
                                    e.currentTarget.style.zIndex = '1';
                                    e.currentTarget.style.borderBottom = index === data.length - 1 ? 'none' : `2px solid ${theme.bordePrincipal}80`;
                                }}
                            >
                                {React.Children.map(renderRow(item, tdStyles), (child, cellIndex) => {
                                    if (React.isValidElement(child) && child.type === 'td') {
                                        return React.cloneElement(child, {
                                            style: {
                                                ...child.props.style,
                                                borderRight: cellIndex === headers.length - 1 ? 'none' : child.props.style?.borderRight || tdStyles.borderRight,
                                                borderBottomLeftRadius: index === data.length - 1 && cellIndex === 0 ? '12px' : '0',
                                                borderBottomRightRadius: index === data.length - 1 && cellIndex === headers.length - 1 ? '12px' : '0'
                                            }
                                        });
                                    }
                                    return child;
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Barra inferior decorativa */}
            <div style={{
                height: '4px',
                background: `linear-gradient(90deg, 
                    transparent 0%, 
                    ${theme.primario}80 50%, 
                    transparent 100%
                )`,
                opacity: 0.6,
                boxShadow: `0 0 10px ${theme.primario}60`
            }}></div>

            {/* Agregar keyframes para la animación shimmer */}
            <style>{`
                @keyframes shimmer {
                    0% { left: -100%; }
                    100% { left: 200%; }
                }
            `}</style>
        </div>
    );
};

export default CustomTable;