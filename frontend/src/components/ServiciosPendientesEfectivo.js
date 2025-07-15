import React, { useState, useEffect } from 'react';

const ServiciosPendientesEfectivo = ({ file, fechaInicio, fechaFin }) => {
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
    }, [file, fechaInicio, fechaFin]);

    if (loading) {
        return (
            <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', margin: '1rem 0' }}>
                <p>Cargando estadísticas de servicios pendientes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ 
                padding: '1rem', 
                backgroundColor: '#ffebee', 
                border: '1px solid #f44336', 
                borderRadius: '8px', 
                margin: '1rem 0',
                color: '#d32f2f'
            }}>
                <strong>Error:</strong> {error}
            </div>
        );
    }

    if (!data) {
        return null;
    }

    const { resumen, detalle } = data;

    const formatCurrency = (value) => {
        const number = Number(value || 0);
        return `$${number.toLocaleString('es-ES', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })}`;
    };

    const getStatusBadge = (dias, esAntiguo) => {
        let color = '#4caf50'; // verde
        if (esAntiguo) {
            color = '#f44336'; // rojo
        } else if (dias > 7) {
            color = '#ff9800'; // naranja
        }
        
        return (
            <span style={{
                backgroundColor: color,
                color: 'white',
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
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1976d2' }}>
                💰 Servicios en Efectivo Pendientes
            </h2>

            {/* Alertas */}
            <div style={{ 
                padding: '1rem', 
                backgroundColor: resumen.tiene_pendientes ? '#fff3e0' : '#e8f5e9', 
                border: `1px solid ${resumen.tiene_pendientes ? '#ff9800' : '#4caf50'}`, 
                borderRadius: '8px', 
                marginBottom: '1rem',
                color: resumen.tiene_pendientes ? '#e65100' : '#2e7d32'
            }}>
                <strong>{resumen.tiene_pendientes ? '⚠️ ADVERTENCIA:' : '✅ ÉXITO:'}</strong> {resumen.advertencia}
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
                    border: '1px solid #ddd', 
                    borderRadius: '8px', 
                    backgroundColor: '#f5f5f5' 
                }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Total Servicios</h4>
                    <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold' }}>
                        {resumen.total_servicios}
                    </p>
                </div>

                <div style={{ 
                    padding: '1rem', 
                    border: '1px solid #ddd', 
                    borderRadius: '8px', 
                    backgroundColor: '#f5f5f5' 
                }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Total ABRECAR</h4>
                    <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold', color: '#1976d2' }}>
                        {formatCurrency(resumen.total_valor)}
                    </p>
                </div>

                <div style={{ 
                    padding: '1rem', 
                    border: '1px solid #ddd', 
                    borderRadius: '8px', 
                    backgroundColor: '#f5f5f5' 
                }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Días Máximos Sin Relacionar</h4>
                    <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold', color: '#f44336' }}>
                        {resumen.dias_sin_relacionar}
                    </p>
                </div>

                <div style={{ 
                    padding: '1rem', 
                    border: '1px solid #ddd', 
                    borderRadius: '8px', 
                    backgroundColor: '#f5f5f5' 
                }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Estado</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.5rem' }}>
                            {resumen.tiene_pendientes ? '⚠️' : '✅'}
                        </span>
                        <span style={{ fontWeight: 'bold' }}>
                            {resumen.tiene_pendientes ? 'Pendiente' : 'Al día'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabla de detalle */}
            {detalle.length > 0 && (
                <div style={{ 
                    padding: '1rem', 
                    border: '1px solid #ddd', 
                    borderRadius: '8px', 
                    backgroundColor: '#f5f5f5',
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
                                <tr style={{ backgroundColor: '#f0f0f0' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Fecha</th>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Estado</th>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Servicio</th>
                                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Subtotal</th>
                                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>IVA</th>
                                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Total ABRECAR</th>
                                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd', minWidth: '100px' }}>Días de Retraso</th>
                                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {detalle.map((servicio, index) => (
                                    <tr key={index} style={{ 
                                        backgroundColor: servicio.es_antiguo ? 'rgba(244, 67, 54, 0.1)' : 'inherit' 
                                    }}>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{servicio.fecha}</td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{servicio.estado}</td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{servicio.servicio_realizado}</td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                                            {formatCurrency(servicio.subtotal)}
                                        </td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                                            {formatCurrency(servicio.iva)}
                                        </td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'right', fontWeight: 'bold' }}>
                                            {formatCurrency(servicio.total_abrecar)}
                                        </td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                                            {getStatusBadge(servicio.dias_sin_relacionar, servicio.es_antiguo)}
                                        </td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                                            {servicio.es_antiguo ? (
                                                <span style={{
                                                    backgroundColor: '#f44336',
                                                    color: 'white',
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    Urgente
                                                </span>
                                            ) : servicio.dias_sin_relacionar > 7 ? (
                                                <span style={{
                                                    backgroundColor: '#ff9800',
                                                    color: 'white',
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    Atención
                                                </span>
                                            ) : (
                                                <span style={{
                                                    backgroundColor: '#4caf50',
                                                    color: 'white',
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
                </div>
            )}
        </div>
    );
};

export default ServiciosPendientesEfectivo; 