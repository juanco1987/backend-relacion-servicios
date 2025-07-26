import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

const ServiciosPendientesCobrar = ({ file, fechaInicio, fechaFin }) => {
    const { theme } = useTheme();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!file) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('fecha_inicio', fechaInicio);
            formData.append('fecha_fin', fechaFin);

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
    }, [file, fechaInicio, fechaFin]);

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

    const { detalle } = data;

    // KPIs
    const totalServicios = detalle.length;
    const serviciosRetraso = detalle.filter(s => s.dias_de_retraso > 30).length;
    const maxDiasRetraso = detalle.length > 0 ? Math.max(...detalle.map(s => s.dias_de_retraso)) : 0;
    const fechaMasAntigua = detalle.length > 0 ? detalle.reduce((min, s) => (s.fecha < min ? s.fecha : min), detalle[0].fecha) : 'N/A';

    return (
        <div style={{ marginTop: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.textoPrincipal }}>
                💸 Servicios Pendientes por Cobrar
            </h2>

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
                    <div style={{ fontSize: 32, fontWeight: 900, color: theme.textoInfo }}>{totalServicios}</div>
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
                     <div style={{ fontSize: 32, fontWeight: 900, color: theme.textoAdvertencia }}>{serviciosRetraso}</div>
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
                     <div style={{ fontSize: 32, fontWeight: 900, color: theme.terminalRojo }}>{maxDiasRetraso}</div>
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
                     <div style={{ fontSize: 20, fontWeight: 900, color: theme.textoInfo }}>{fechaMasAntigua}</div>
                </div>
            </div>

            {/* Tabla de detalle */}
            {detalle.length > 0 ? (
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
                                {detalle.map((servicio, index) => (
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
                </div>
            ) : (
                                 <div style={{ padding: '1rem', backgroundColor: theme.fondoContenedor, border: `1px solid ${theme.bordePrincipal}`, borderRadius: '8px', color: theme.textoInfo, marginTop: '1rem' }}>
                    No hay servicios pendientes por cobrar en el rango de fechas seleccionado.
                </div>
            )}
        </div>
    );
};

export default ServiciosPendientesCobrar; 