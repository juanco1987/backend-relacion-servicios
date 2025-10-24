import React, { useState, useEffect } from 'react';
import { Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import { getCustomSelectSx, getCustomMenuProps, getCustomLabelSx } from '../../utils/selectStyles';
import { generateMonthsUntilNow, formatMonth } from '../../utils/dateUtils';
import KpiCard from '../common/KpiCard';
import CustomTable from '../common/CustomTable';
import { API_CONFIG } from '../../config/appConfig';

const API_BASE = API_CONFIG.BASE_URL;

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
                const response = await fetch(`${API_BASE}/api/analytics_pendientes_cobrar`, {
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

    const mesesOrdenados = generateMonthsUntilNow();

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

    const datosSeleccionados = mesSeleccionado === 'Total Global'
        ? totalGlobal
        : resumen[mesSeleccionado] || {
            total_servicios: 0,
            servicios_retraso: 0,
            max_dias_retraso: 0,
            fecha_mas_antigua: '9999-12-31'
        };

    const detalleFiltrado = detalle ? detalle.filter(servicio => {
        if (mesSeleccionado === 'Total Global') return true;
        const [año, mes] = servicio.fecha.split('-');
        return `${año}-${mes}` === mesSeleccionado;
    }) : [];

    // Definir headers para CustomTable
    const tableHeaders = [
        { label: 'Fecha' },
        { label: 'Estado' },
        { label: 'Servicio Realizado' },
        { label: 'Días de Retraso', style: { textAlign: 'center', minWidth: '100px' } },
        { label: 'Mensaje', style: { textAlign: 'center', minWidth: '220px' } }
    ];

    // Función para renderizar cada fila
    const renderRow = (servicio, tdStyles) => (
        <>
            <td style={tdStyles}>{servicio.fecha}</td>
            <td style={tdStyles}>{servicio.estado}</td>
            <td style={tdStyles}>{servicio.servicio_realizado}</td>
            <td style={{
                ...tdStyles,
                textAlign: 'center',
                fontWeight: servicio.dias_de_retraso > 30 ? 'bold' : 'normal',
                color: servicio.dias_de_retraso > 30 ? theme.textoError : 'inherit'
            }}>
                {servicio.dias_de_retraso}
            </td>
            <td style={{
                ...tdStyles,
                textAlign: 'center',
                color: servicio.dias_de_retraso > 30 ? theme.textoError : theme.textoInfo,
                fontWeight: servicio.dias_de_retraso > 30 ? 'bold' : 'normal'
            }}>
                {servicio.mensaje}
            </td>
        </>
    );

    return (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <h2 style={{ display: 'inline-block', alignItems: 'center', gap: '8px', color: theme.textoPrincipal }}>
                💸 Servicios Pendientes por Cobrar
            </h2>

            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                    <InputLabel id="mes-selector-label" sx={getCustomLabelSx(theme)}>
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
                                {formatMonth(mesKey)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

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

            {detalleFiltrado && detalleFiltrado.length > 0 ? (
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <h3 style={{ margin: '0 0 1rem 0', color: theme.textoPrincipal }}>
                        Detalle de Servicios Pendientes por Cobrar
                    </h3>
                    <CustomTable
                        headers={tableHeaders}
                        data={detalleFiltrado}
                        renderRow={renderRow}
                        wrapperStyles={{ maxWidth: '900px' }}
                    />
                </div>
            ) : (
                <div style={{ 
                    padding: '1rem', 
                    backgroundColor: theme.fondoContenedor, 
                    border: `1px solid ${theme.bordePrincipal}`, 
                    borderRadius: '8px', 
                    color: theme.terminalVerde, 
                    marginTop: '1rem',
                    textAlign: 'center'
                }}>
                    ✅ ¡Excelente! No hay servicios pendientes por cobrar para {mesSeleccionado === 'Total Global' ? 'ningún mes' : `el mes de ${formatMonth(mesSeleccionado)}`}.
                </div>
            )}
        </div>
    );
};

export default ServiciosPendientesCobrar;