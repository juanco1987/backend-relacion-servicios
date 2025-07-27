import React, { useState, useEffect } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';

const ServiciosPendientesEfectivo = ({ file }) => {
    const { theme } = useTheme();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mesSeleccionado, setMesSeleccionado] = useState('Total Global');

    useEffect(() => {
        if (!file) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('http://localhost:5000/api/analytics_pendientes_efectivo', {
                    method: 'POST',
                    body: formData,
                });

                const result = await response.json();

                if (result.success) {
                    setData(result);
                } else {
                    setError(result.error || 'Error al procesar los datos');
                }
            } catch (err) {
                setError('Error de conexión con el servidor');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [file]);

    if (loading) {
        return (
            <div style={{ 
                padding: '1rem', 
                border: `1px solid ${theme.bordePrincipal}`, 
                borderRadius: '8px', 
                margin: '1rem 0',
                background: theme.fondoContenedor,
                color: theme.textoPrincipal
            }}>
                <p>Cargando estadísticas de servicios pendientes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ 
                padding: '1rem', 
                backgroundColor: theme.terminalRojo + '20', 
                border: `1px solid ${theme.terminalRojo}`, 
                borderRadius: '8px', 
                margin: '1rem 0',
                color: theme.terminalRojo
            }}>
                <strong>Error:</strong> {error}
            </div>
        );
    }

    if (!data) {
        return null;
    }

    const { resumen, detalle } = data;

    // Filtrar meses válidos y ordenarlos
    const mesesOrdenados = Object.keys(resumen || {})
        .filter(mes => {
            if (!mes) return false;
            const normalizado = mes.trim().toLowerCase();
            return normalizado &&
                normalizado !== 'null' &&
                normalizado !== 'undefined' &&
                normalizado !== 'invalid date' &&
                !/^nat$/i.test(normalizado);
        })
        .sort((a, b) => {
            const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            const añoA = a.split(' ')[1];
            const añoB = b.split(' ')[1];
            const mesA = meses.indexOf(a.split(' ')[0]);
            const mesB = meses.indexOf(b.split(' ')[0]);
            if (añoA !== añoB) return añoA - añoB;
            return mesA - mesB;
        });

    // Calcular total global
    const totalGlobal = mesesOrdenados.reduce((acc, mes) => {
        const datosMes = resumen[mes] || {};
        return {
            total_servicios: acc.total_servicios + (datosMes.total_servicios || 0),
            total_valor: acc.total_valor + (datosMes.total_valor || 0),
            dias_sin_relacionar: Math.max(acc.dias_sin_relacionar, datosMes.dias_sin_relacionar || 0),
            tiene_pendientes: acc.tiene_pendientes || datosMes.tiene_pendientes || false,
            advertencia: datosMes.tiene_pendientes ? datosMes.advertencia : acc.advertencia
        };
    }, {
        total_servicios: 0,
        total_valor: 0,
        dias_sin_relacionar: 0,
        tiene_pendientes: false,
        advertencia: "✅ Todos los servicios en efectivo están al día"
    });

    // Determinar datos a mostrar
    const datosSeleccionados = mesSeleccionado === 'Total Global' 
        ? totalGlobal 
        : resumen[mesSeleccionado] || {};

    // Filtrar los datos del detalle según el mes seleccionado
    const detalleFiltrado = detalle ? detalle.filter(servicio => {
        if (mesSeleccionado === 'Total Global') return true;
        
        const fechaServicio = new Date(servicio.fecha);
        if (isNaN(fechaServicio.getTime())) return false;
        
        // Convertir a formato YYYY-MM como en el backend
        const año = fechaServicio.getFullYear();
        const mes = String(fechaServicio.getMonth() + 1).padStart(2, '0');
        const mesFormatoBackend = `${año}-${mes}`;
        
        return mesFormatoBackend === mesSeleccionado;
    }) : [];

    const formatCurrency = (value) => {
        const number = Number(value || 0);
        return `$${number.toLocaleString('es-ES', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })}`;
    };

    const getStatusBadge = (dias, esAntiguo) => {
        let color = theme.terminalVerde; // verde
        if (esAntiguo) {
            color = theme.terminalRojo; // rojo
        } else if (dias > 7) {
            color = theme.terminalAmarillo; // naranja
        }
        
        return (
            <span style={{
                backgroundColor: color,
                color: theme.textoPrincipal,
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold'
            }}>
                {dias} días
            </span>
        );
    };

    return (
        <div style={{ marginTop: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.textoPrincipal }}>
                💰 Servicios en Efectivo Pendientes
            </h2>

            {/* Selector de mes */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel sx={{ color: theme.textoSecundario }}>Seleccionar Mes</InputLabel>
                    <Select
                        value={mesSeleccionado}
                        onChange={(e) => setMesSeleccionado(e.target.value)}
                        sx={{
                            color: theme.textoPrincipal,
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.bordePrincipal,
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.bordeHover,
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.bordeFocus,
                            },
                        }}
                    >
                        <MenuItem value="Total Global">Total Global</MenuItem>
                        {mesesOrdenados.map((mes) => (
                            <MenuItem key={mes} value={mes}>{mes}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Alertas */}
            <div style={{ 
                padding: '1rem', 
                backgroundColor: datosSeleccionados.tiene_pendientes ? theme.terminalAmarillo + '10' : theme.terminalVerde + '10', 
                border: `1px solid ${datosSeleccionados.tiene_pendientes ? theme.terminalAmarillo : theme.terminalVerde}`, 
                borderRadius: '8px', 
                marginBottom: '1rem',
                color: datosSeleccionados.tiene_pendientes ? theme.terminalAmarillo : theme.terminalVerde
            }}>
                <strong>{datosSeleccionados.tiene_pendientes ? '⚠️ ADVERTENCIA:' : '✅ ÉXITO:'}</strong> {datosSeleccionados.advertencia}
            </div>

            {/* Tarjetas de resumen */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem', 
                marginBottom: '2rem' 
            }}>
                <div style={{ 
                    padding: '1rem', 
                    border: `1px solid ${theme.bordePrincipal}`, 
                    borderRadius: '8px', 
                    backgroundColor: theme.fondoContenedor
                }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: theme.textoSecundario }}>Total Servicios</h4>
                    <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold', color: theme.textoPrincipal }}>
                        {datosSeleccionados.total_servicios}
                    </p>
                </div>

                <div style={{ 
                    padding: '1rem', 
                    border: `1px solid ${theme.bordePrincipal}`, 
                    borderRadius: '8px', 
                    backgroundColor: theme.fondoContenedor
                }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: theme.textoSecundario }}>Total ABRECAR</h4>
                    <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold', color: theme.textoPrincipal }}>
                        {formatCurrency(datosSeleccionados.total_valor)}
                    </p>
                </div>

                <div style={{ 
                    padding: '1rem', 
                    border: `1px solid ${theme.bordePrincipal}`, 
                    borderRadius: '8px', 
                    backgroundColor: theme.fondoContenedor
                }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: theme.textoSecundario }}>Días Máximos Sin Relacionar</h4>
                    <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold', color: theme.terminalRojo }}>
                        {datosSeleccionados.dias_sin_relacionar}
                    </p>
                </div>

                <div style={{ 
                    padding: '1rem', 
                    border: `1px solid ${theme.bordePrincipal}`, 
                    borderRadius: '8px', 
                    backgroundColor: theme.fondoContenedor
                }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: theme.textoSecundario }}>Estado</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.5rem' }}>
                            {datosSeleccionados.tiene_pendientes ? '⚠️' : '✅'}
                        </span>
                        <span style={{ fontWeight: 'bold' }}>
                            {datosSeleccionados.tiene_pendientes ? 'Pendiente' : 'Al día'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabla de detalle */}
            {detalleFiltrado && detalleFiltrado.length > 0 && (
                <div style={{ 
                    padding: '1rem', 
                    border: `1px solid ${theme.bordePrincipal}`, 
                    borderRadius: '8px', 
                    backgroundColor: theme.fondoContenedor,
                    maxWidth: '1400px',
                    width: '100%',
                    margin: '0 auto'
                }}>
                    <h3 style={{ margin: '0 0 1rem 0' }}>Detalle de Servicios Pendientes</h3>
                    
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ 
                            width: '100%', 
                            borderCollapse: 'collapse',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            overflow: 'hidden'
                        }}>
                            <thead>
                                <tr style={{ backgroundColor: theme.fondoContenedor }}>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.bordePrincipal}` }}>Fecha</th>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.bordePrincipal}` }}>Estado</th>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.bordePrincipal}` }}>Servicio</th>
                                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: `1px solid ${theme.bordePrincipal}` }}>Subtotal</th>
                                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: `1px solid ${theme.bordePrincipal}` }}>IVA</th>
                                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: `1px solid ${theme.bordePrincipal}` }}>Total ABRECAR</th>
                                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.bordePrincipal}`, minWidth: '100px' }}>Días de Retraso</th>
                                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.bordePrincipal}` }}>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {detalleFiltrado
                                    .map((servicio, index) => (
                                    <tr key={index} style={{ 
                                        backgroundColor: servicio.es_antiguo ? theme.terminalRojo + '10' : 'inherit' 
                                    }}>
                                        <td style={{ padding: '12px', borderBottom: `1px solid ${theme.bordePrincipal}` }}>{servicio.fecha}</td>
                                        <td style={{ padding: '12px', borderBottom: `1px solid ${theme.bordePrincipal}` }}>{servicio.estado}</td>
                                        <td style={{ padding: '12px', borderBottom: `1px solid ${theme.bordePrincipal}` }}>{servicio.servicio_realizado}</td>
                                        <td style={{ padding: '12px', borderBottom: `1px solid ${theme.bordePrincipal}`, textAlign: 'right' }}>
                                            {formatCurrency(servicio.subtotal)}
                                        </td>
                                        <td style={{ padding: '12px', borderBottom: `1px solid ${theme.bordePrincipal}`, textAlign: 'right' }}>
                                            {formatCurrency(servicio.iva)}
                                        </td>
                                        <td style={{ padding: '12px', borderBottom: `1px solid ${theme.bordePrincipal}`, textAlign: 'right', fontWeight: 'bold' }}>
                                            {formatCurrency(servicio.total_abrecar)}
                                        </td>
                                        <td style={{ padding: '12px', borderBottom: `1px solid ${theme.bordePrincipal}`, textAlign: 'center' }}>
                                            {getStatusBadge(servicio.dias_sin_relacionar, servicio.es_antiguo)}
                                        </td>
                                        <td style={{ padding: '12px', borderBottom: `1px solid ${theme.bordePrincipal}`, textAlign: 'center' }}>
                                            {servicio.es_antiguo ? (
                                                <span style={{
                                                    backgroundColor: theme.terminalRojo,
                                                    color: theme.textoPrincipal,
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    Urgente
                                                </span>
                                            ) : servicio.dias_sin_relacionar > 7 ? (
                                                <span style={{
                                                    backgroundColor: theme.terminalAmarillo,
                                                    color: theme.textoPrincipal,
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    Atención
                                                </span>
                                            ) : (
                                                <span style={{
                                                    backgroundColor: theme.terminalVerde,
                                                    color: theme.textoPrincipal,
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    Normal
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Mensaje cuando no hay datos filtrados */}
                    {detalleFiltrado.length === 0 && mesSeleccionado !== 'Total Global' && (
                        <div style={{ 
                            padding: '1rem', 
                            backgroundColor: theme.fondoContenedor, 
                            border: `1px solid ${theme.bordePrincipal}`, 
                            borderRadius: '8px', 
                            color: theme.textoInfo, 
                            marginTop: '1rem',
                            textAlign: 'center'
                        }}>
                            No hay servicios pendientes para el mes de <strong>{mesSeleccionado}</strong>.
                        </div>
                    )}
                </div>
            )}
            
            {/* Mensaje cuando no hay datos en absoluto */}
            {(!detalle || detalle.length === 0) && (
                <div style={{ 
                    padding: '1rem', 
                    backgroundColor: theme.fondoContenedor, 
                    border: `1px solid ${theme.bordePrincipal}`, 
                    borderRadius: '8px', 
                    color: theme.textoInfo, 
                    marginTop: '1rem',
                    textAlign: 'center'
                }}>
                    No hay servicios pendientes disponibles.
                </div>
            )}
            
            {/* Mensaje cuando no hay datos filtrados para el mes seleccionado */}
            {detalleFiltrado.length === 0 && mesSeleccionado !== 'Total Global' && detalle && detalle.length > 0 && (
                <div style={{ 
                    padding: '1rem', 
                    backgroundColor: theme.fondoContenedor, 
                    border: `1px solid ${theme.bordePrincipal}`, 
                    borderRadius: '8px', 
                    color: theme.textoInfo, 
                    marginTop: '1rem',
                    textAlign: 'center'
                }}>
                    No hay servicios pendientes para el mes de <strong>{mesSeleccionado}</strong>.
                </div>
            )}
        </div>
    );
};

export default ServiciosPendientesEfectivo; 