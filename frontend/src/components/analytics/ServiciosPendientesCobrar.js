import React, { useState, useEffect } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import { getCustomSelectSx, getCustomMenuProps, getCustomLabelSx } from '../../utils/selectStyles';
import { formatearMesAnio } from '../../utils/dateFormatters';
import KpiCard from '../common/KpiCard';

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

    // === Obtener keys del resumen y ordenarlas cronológicamente (esperando formato YYYY-MM) ===
    const mesesOrdenados = Object.keys(resumen || {})
        .filter(key => {
            if (!key) return false;
            const normalizado = String(key).trim().toLowerCase();
            return normalizado &&
                normalizado !== 'null' &&
                normalizado !== 'undefined' &&
                normalizado !== 'invalid date' &&
                !/^nat$/i.test(normalizado);
        })
        .sort((a, b) => {
            // Intentamos parsear "YYYY-MM"
            const pa = a.split('-');
            const pb = b.split('-');
            const yearA = parseInt(pa[0], 10);
            const monthA = parseInt(pa[1], 10);
            const yearB = parseInt(pb[0], 10);
            const monthB = parseInt(pb[1], 10);

            if (!isNaN(yearA) && !isNaN(yearB) && yearA !== yearB) return yearA - yearB;
            if (!isNaN(monthA) && !isNaN(monthB)) return monthA - monthB;
            // Fallback al orden alfabético estable si no son YYYY-MM
            return String(a).localeCompare(String(b));
        });

    // Calcular total global sobre las keys crudas (YYYY-MM)
    const totalGlobal = mesesOrdenados.reduce((acc, mesKey) => {
        const datosMes = resumen[mesKey] || {};
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

    // === Datos seleccionados: ahora mesSeleccionado guarda la key cruda (YYYY-MM) o 'Total Global' ===
    const datosSeleccionados = mesSeleccionado === 'Total Global'
        ? totalGlobal
        : resumen[mesSeleccionado] || {};

    // Filtrar detalle: comparamos con la key YYYY-MM
    const detalleFiltrado = detalle ? detalle.filter(servicio => {
        if (mesSeleccionado === 'Total Global') return true;

        const fechaServicio = new Date(servicio.fecha);
        if (isNaN(fechaServicio.getTime())) return false;

        const año = fechaServicio.getFullYear();
        const mes = String(fechaServicio.getMonth() + 1).padStart(2, '0');
        const mesFormatoBackend = `${año}-${mes}`;

        return mesFormatoBackend === mesSeleccionado;
    }) : [];

    return (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <h2 style={{ display: 'inline-block', alignItems: 'center', gap: '8px', color: theme.textoPrincipal }}>
                💸 Servicios Pendientes por Cobrar
            </h2>

            {/* Selector de mes: value = key cruda (YYYY-MM), label = mes bonito */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                    <InputLabel
                        id="mes-selector-label"
                        sx={getCustomLabelSx(theme)}
                    >
                        Seleccionar Mes
                    </InputLabel>
                    <Select
                        labelId="mes-selector-label"
                        value={mesSeleccionado}
                        onChange={(e) => setMesSeleccionado(e.target.value)}
                        label="Seleccionar Mes"
                        sx={getCustomSelectSx(theme)}
                        MenuProps={getCustomMenuProps(theme)}
                    >
                        <MenuItem value="Total Global">Total Global</MenuItem>
                        {mesesOrdenados.map((mesKey) => (
                            <MenuItem key={mesKey} value={mesKey}>
                                {formatearMesAnio(mesKey)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Tarjetas de KPIs usando KpiCard */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                margin: '1.5rem 0',
            }}>
                <KpiCard color={theme.terminalOliva} variant='elevated'>
                    <div style={{ color: theme.terminalOliva, fontWeight: 'bold', fontSize: '28px' }}>
                        {datosSeleccionados.total_servicios}
                    </div>
                    <div style={{ color: theme.textoSecundario, fontSize: '12px', marginTop: '4px' }}>
                        Total Servicios
                    </div>
                </KpiCard>

                <KpiCard color={theme.terminalRosa} variant='elevated'>
                    <div style={{ color: theme.terminalRosa, fontWeight: 'bold', fontSize: '28px' }}>
                        {datosSeleccionados.servicios_retraso}
                    </div>
                    <div style={{ color: theme.textoSecundario, fontSize: '12px', marginTop: '4px' }}>
                        Con +30 días de retraso
                    </div>
                </KpiCard>

                <KpiCard color={theme.terminalRojo} variant='elevated'>
                    <div style={{ color: theme.terminalRojo, fontWeight: 'bold', fontSize: '28px' }}>
                        {datosSeleccionados.max_dias_retraso}
                    </div>
                    <div style={{ color: theme.textoSecundario, fontSize: '12px', marginTop: '4px' }}>
                        Días Máximos de Retraso
                    </div>
                </KpiCard>

                <KpiCard color={theme.textoInfo} variant='elevated'>
                    <div style={{ color: theme.textoInfo, fontWeight: 'bold', fontSize: '16px' }}>
                        {datosSeleccionados.fecha_mas_antigua !== '9999-12-31' 
                            ? datosSeleccionados.fecha_mas_antigua 
                            : 'N/A'}
                    </div>
                    <div style={{ color: theme.textoSecundario, fontSize: '12px', marginTop: '4px' }}>
                        Servicio más antiguo
                    </div>
                </KpiCard>
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
                                {detalleFiltrado.map((servicio, index) => (
                                    <tr key={index} style={{ backgroundColor: servicio.dias_de_retraso > 30 ? theme.terminalRojo + '10' : 'inherit' }}>
                                        <td style={{ padding: '12px', borderBottom: `1px solid ${theme.bordePrincipal}` }}>{servicio.fecha}</td>
                                        <td style={{ padding: '12px', borderBottom: `1px solid ${theme.bordePrincipal}` }}>{servicio.estado}</td>
                                        <td style={{ padding: '12px', borderBottom: `1px solid ${theme.bordePrincipal}` }}>{servicio.servicio_realizado}</td>
                                        <td style={{ padding: '12px', borderBottom: `1px solid ${theme.bordePrincipal}`, textAlign: 'center', fontWeight: servicio.dias_de_retraso > 30 ? 'bold' : 'normal', color: servicio.dias_de_retraso > 30 ? theme.textoError : 'inherit' }}>{servicio.dias_de_retraso}</td>
                                        <td style={{ padding: '12px', borderBottom: `1px solid ${theme.bordePrincipal}`, textAlign: 'center', color: servicio.dias_de_retraso > 30 ? theme.textoError : theme.textoInfo, fontWeight: servicio.dias_de_retraso > 30 ? 'bold' : 'normal' }}>{servicio.mensaje}</td>
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