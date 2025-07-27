import React, { useState, useEffect } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';

const ServiciosPendientesCobrar = ({ file }) => {
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
                const response = await fetch('http://localhost:5000/api/analytics_pendientes_cobrar', {
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
                <p>Cargando servicios pendientes por cobrar...</p>
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
            servicios_retraso: acc.servicios_retraso + (datosMes.servicios_retraso || 0),
            max_dias_retraso: Math.max(acc.max_dias_retraso, datosMes.max_dias_retraso || 0),
            fecha_mas_antigua: datosMes.fecha_mas_antigua && datosMes.fecha_mas_antigua < acc.fecha_mas_antigua ? datosMes.fecha_mas_antigua : acc.fecha_mas_antigua
        };
    }, {
        total_servicios: 0,
        servicios_retraso: 0,
        max_dias_retraso: 0,
        fecha_mas_antigua: '9999-12-31'
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

    return (
        <div style={{ marginTop: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.textoPrincipal }}>
                💸 Servicios Pendientes por Cobrar
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

            {/* Tarjetas de KPIs */}
            <div style={{
                display: 'flex',
                gap: '2rem',
                margin: '1.5rem 0',
                flexWrap: 'wrap',
                justifyContent: 'flex-start',
            }}>
                <div style={{
                    background: theme.fondoContenedor,
                    border: `2px solid ${theme.textoInfo}`,
                    borderRadius: '16px',
                    padding: '1.2rem 2.2rem',
                    minWidth: 180,
                    textAlign: 'center',
                    boxShadow: theme.sombraComponente,
                    color: theme.textoPrincipal
                }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: theme.textoInfo, marginBottom: 4 }}>Total Servicios</div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: theme.textoInfo }}>{datosSeleccionados.total_servicios}</div>
                </div>
                <div style={{
                    background: theme.fondoContenedor,
                    border: `2px solid ${theme.textoAdvertencia}`,
                    borderRadius: '16px',
                    padding: '1.2rem 2.2rem',
                    minWidth: 180,
                    textAlign: 'center',
                    boxShadow: theme.sombraComponente,
                    color: theme.textoAdvertencia
                }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: theme.textoAdvertencia, marginBottom: 4 }}>Con +30 días de retraso</div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: theme.textoAdvertencia }}>{datosSeleccionados.servicios_retraso}</div>
                </div>
                <div style={{
                    background: theme.fondoContenedor,
                    border: `2px solid ${theme.terminalRojo}`,
                    borderRadius: '16px',
                    padding: '1.2rem 2.2rem',
                    minWidth: 180,
                    textAlign: 'center',
                    boxShadow: theme.sombraComponente,
                    color: theme.terminalRojo
                }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: theme.terminalRojo, marginBottom: 4 }}>Días Máximos de Retraso</div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: theme.terminalRojo }}>{datosSeleccionados.max_dias_retraso}</div>
                </div>
                <div style={{
                    background: theme.fondoContenedor,
                    border: `2px solid ${theme.textoInfo}`,
                    borderRadius: '16px',
                    padding: '1.2rem 2.2rem',
                    minWidth: 180,
                    textAlign: 'center',
                    boxShadow: theme.sombraComponente,
                    color: theme.textoInfo
                }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: theme.textoInfo, marginBottom: 4 }}>Servicio más antiguo</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: theme.textoInfo }}>{datosSeleccionados.fecha_mas_antigua}</div>
                </div>
            </div>

            {/* Tabla de detalle */}
            {detalleFiltrado && detalleFiltrado.length > 0 ? (
                <div style={{ 
                    padding: '1rem', 
                    border: `1px solid ${theme.bordePrincipal}`, 
                    borderRadius: '8px', 
                    backgroundColor: theme.fondoContenedor,
                    maxWidth: '900px',
                    width: '100%',
                    margin: '0 auto'
                }}>
                    <h3 style={{ margin: '0 0 1rem 0', color: theme.textoPrincipal }}>Detalle de Servicios Pendientes por Cobrar</h3>
                    
                    {/* Debug info */}
                    {/* The debug info block is now moved outside the table */}
                    
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
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.bordePrincipal}` }}>Servicio Realizado</th>
                                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.bordePrincipal}`, minWidth: '100px' }}>Días de Retraso</th>
                                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.bordePrincipal}`, minWidth: '220px' }}>Mensaje</th>
                                </tr>
                            </thead>
                            <tbody>
                                {detalleFiltrado
                                    .map((servicio, index) => (
                                    <tr key={index} style={{ 
                                        backgroundColor: servicio.dias_de_retraso > 30 ? theme.terminalRojo + '10' : 'inherit' 
                                    }}>
                                        <td style={{ padding: '12px', borderBottom: `1px solid ${theme.bordePrincipal}` }}>{servicio.fecha}</td>
                                        <td style={{ padding: '12px', borderBottom: `1px solid ${theme.bordePrincipal}` }}>{servicio.estado}</td>
                                        <td style={{ padding: '12px', borderBottom: `1px solid ${theme.bordePrincipal}` }}>{servicio.servicio_realizado}</td>
                                        <td style={{ padding: '12px', borderBottom: `1px solid ${theme.bordePrincipal}`, textAlign: 'center', fontWeight: servicio.dias_de_retraso > 30 ? 'bold' : 'normal', color: servicio.dias_de_retraso > 30 ? theme.textoError : 'inherit' }}>
                                            {servicio.dias_de_retraso}
                                        </td>
                                        <td style={{ padding: '12px', borderBottom: `1px solid ${theme.bordePrincipal}`, textAlign: 'center', color: servicio.dias_de_retraso > 30 ? theme.textoError : theme.textoInfo, fontWeight: servicio.dias_de_retraso > 30 ? 'bold' : 'normal' }}>
                                            {servicio.mensaje}
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
                            No hay servicios pendientes por cobrar para el mes de <strong>{mesSeleccionado}</strong>.
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ padding: '1rem', backgroundColor: theme.fondoContenedor, border: `1px solid ${theme.bordePrincipal}`, borderRadius: '8px', color: theme.textoInfo, marginTop: '1rem' }}>
                    No hay servicios pendientes por cobrar en el rango de fechas seleccionado.
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
                    No hay servicios pendientes por cobrar para el mes de <strong>{mesSeleccionado}</strong>.
                </div>
            )}
        </div>
    );
};

export default ServiciosPendientesCobrar; 