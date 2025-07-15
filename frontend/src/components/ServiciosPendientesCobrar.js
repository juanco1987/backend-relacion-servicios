import React, { useState, useEffect } from 'react';

const ServiciosPendientesCobrar = ({ file, fechaInicio, fechaFin }) => {
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
            <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', margin: '1rem 0' }}>
                <p>Cargando servicios pendientes por cobrar...</p>
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

    const { detalle } = data;

    // KPIs
    const totalServicios = detalle.length;
    const serviciosRetraso = detalle.filter(s => s.dias_de_retraso > 30).length;
    const maxDiasRetraso = detalle.length > 0 ? Math.max(...detalle.map(s => s.dias_de_retraso)) : 0;
    const fechaMasAntigua = detalle.length > 0 ? detalle.reduce((min, s) => (s.fecha < min ? s.fecha : min), detalle[0].fecha) : 'N/A';

    return (
        <div style={{ marginTop: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1976d2' }}>
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
                    background: '#e3f2fd',
                    border: '2px solid #1976d2',
                    borderRadius: '16px',
                    padding: '1.2rem 2.2rem',
                    minWidth: 180,
                    textAlign: 'center',
                    boxShadow: '0 2px 8px #1976d233',
                }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1976d2', marginBottom: 4 }}>Total Servicios</div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: '#1976d2' }}>{totalServicios}</div>
                </div>
                <div style={{
                    background: '#fff3e0',
                    border: '2px solid #ff9800',
                    borderRadius: '16px',
                    padding: '1.2rem 2.2rem',
                    minWidth: 180,
                    textAlign: 'center',
                    boxShadow: '0 2px 8px #ff980033',
                }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#ff9800', marginBottom: 4 }}>Con +30 días de retraso</div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: '#ff9800' }}>{serviciosRetraso}</div>
                </div>
                <div style={{
                    background: '#ffebee',
                    border: '2px solid #f44336',
                    borderRadius: '16px',
                    padding: '1.2rem 2.2rem',
                    minWidth: 180,
                    textAlign: 'center',
                    boxShadow: '0 2px 8px #f4433622',
                }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#f44336', marginBottom: 4 }}>Días Máximos de Retraso</div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: '#f44336' }}>{maxDiasRetraso}</div>
                </div>
                <div style={{
                    background: '#e8f5e9',
                    border: '2px solid #388e3c',
                    borderRadius: '16px',
                    padding: '1.2rem 2.2rem',
                    minWidth: 180,
                    textAlign: 'center',
                    boxShadow: '0 2px 8px #388e3c22',
                }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#388e3c', marginBottom: 4 }}>Servicio más antiguo</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#388e3c' }}>{fechaMasAntigua}</div>
                </div>
            </div>

            {/* Tabla de detalle */}
            {detalle.length > 0 ? (
                <div style={{ 
                    padding: '1rem', 
                    border: '1px solid #ddd', 
                    borderRadius: '8px', 
                    backgroundColor: '#f5f5f5',
                    maxWidth: '900px',
                    width: '100%',
                    margin: '0 auto'
                }}>
                    <h3 style={{ margin: '0 0 1rem 0' }}>Detalle de Servicios Pendientes por Cobrar</h3>
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
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Servicio Realizado</th>
                                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd', minWidth: '100px' }}>Días de Retraso</th>
                                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd', minWidth: '220px' }}>Mensaje</th>
                                </tr>
                            </thead>
                            <tbody>
                                {detalle.map((servicio, index) => (
                                    <tr key={index} style={{ 
                                        backgroundColor: servicio.dias_de_retraso > 30 ? 'rgba(244, 67, 54, 0.1)' : 'inherit' 
                                    }}>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{servicio.fecha}</td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{servicio.estado}</td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{servicio.servicio_realizado}</td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'center', fontWeight: servicio.dias_de_retraso > 30 ? 'bold' : 'normal', color: servicio.dias_de_retraso > 30 ? '#f44336' : 'inherit' }}>
                                            {servicio.dias_de_retraso}
                                        </td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'center', color: servicio.dias_de_retraso > 30 ? '#f44336' : '#1976d2', fontWeight: servicio.dias_de_retraso > 30 ? 'bold' : 'normal' }}>
                                            {servicio.mensaje}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div style={{ padding: '1rem', backgroundColor: '#e3f2fd', border: '1px solid #90caf9', borderRadius: '8px', color: '#1976d2', marginTop: '1rem' }}>
                    No hay servicios pendientes por cobrar en el rango de fechas seleccionado.
                </div>
            )}
        </div>
    );
};

export default ServiciosPendientesCobrar; 