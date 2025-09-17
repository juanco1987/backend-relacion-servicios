import React, { useState, useEffect } from 'react';
import { Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import { getCustomSelectSx, getCustomMenuProps, getCustomLabelSx } from '../../utils/selectStyles';
import { formatearMesAnio } from '../../utils/dateFormatters';
import KpiCard from '../common/KpiCard';

const ServiciosPendientesEfectivo = ({ file }) => {
  const { theme } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mesSeleccionado, setMesSeleccionado] = useState('Total Global');
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!file) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch(`${API_BASE}/api/analytics_pendientes_efectivo`, {
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

  if (!data) return null;

  const { resumen, detalle } = data;

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
      const [yearA, monthA] = a.split('-').map(Number);
      const [yearB, monthB] = b.split('-').map(Number);
      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });

  const totalGlobal = mesesOrdenados.reduce((acc, mesKey) => {
    const datosMes = resumen[mesKey] || {};
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

  const datosSeleccionados = mesSeleccionado === 'Total Global'
    ? totalGlobal
    : resumen[mesSeleccionado] || {};

  const detalleFiltrado = detalle ? detalle.filter(servicio => {
    if (mesSeleccionado === 'Total Global') return true;
    const fechaServicio = new Date(servicio.fecha);
    if (isNaN(fechaServicio.getTime())) return false;
    const año = fechaServicio.getFullYear();
    const mes = String(fechaServicio.getMonth() + 1).padStart(2, '0');
    return `${año}-${mes}` === mesSeleccionado;
  }) : [];

  const formatCurrency = (value) =>
    `$${Number(value || 0).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const getStatusBadge = (dias, esAntiguo) => {
    let color = theme.terminalVerde;
    if (esAntiguo) color = theme.terminalRojo;
    else if (dias > 7) color = theme.terminalAmarillo;

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
    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
      <h2 style={{ display: 'inline-block', alignItems: 'center', gap: '8px', color: theme.textoPrincipal }}>
        💰 Servicios en Efectivo Pendientes
      </h2>

      {/* Selector de mes */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <InputLabel id="mes-selector-label" sx={getCustomLabelSx(theme)}>Seleccionar Mes</InputLabel>
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

      {/* Tarjetas de resumen usando KpiCard */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '2rem'
      }}>
        <KpiCard color={theme.terminalOliva} variant='elevated'>
          <div style={{ color: theme.terminalOliva, fontWeight: 'bold', fontSize: '28px' }}>
            {datosSeleccionados.total_servicios}
          </div>
          <div style={{ color: theme.textoSecundario, fontSize: '12px', marginTop: '4px' }}>
            Total Servicios
          </div>
        </KpiCard>

        <KpiCard color={theme.terminalVerde} variant='elevated'>
          <div style={{ color: theme.terminalVerde, fontWeight: 'bold', fontSize: '20px' }}>
            {formatCurrency(datosSeleccionados.total_valor)}
          </div>
          <div style={{ color: theme.textoSecundario, fontSize: '12px', marginTop: '4px' }}>
            Total ABRECAR
          </div>
        </KpiCard>

        <KpiCard color={theme.terminalRojo} variant='elevated'>
          <div style={{ color: theme.terminalRojo, fontWeight: 'bold', fontSize: '28px' }}>
            {datosSeleccionados.dias_sin_relacionar}
          </div>
          <div style={{ color: theme.textoSecundario, fontSize: '12px', marginTop: '4px' }}>
            Días Máximos Sin Relacionar
          </div>
        </KpiCard>

        <KpiCard color={datosSeleccionados.tiene_pendientes ? theme.terminalAmarillo : theme.terminalVerde} variant='elevated'>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            justifyContent: 'center',
            color: datosSeleccionados.tiene_pendientes ? theme.terminalAmarillo : theme.terminalVerde,
            fontWeight: 'bold',
            fontSize: '18px'
          }}>
            <span style={{ fontSize: '24px' }}>
              {datosSeleccionados.tiene_pendientes ? '⚠️' : '✅'}
            </span>
            {datosSeleccionados.tiene_pendientes ? 'Pendiente' : 'Al día'}
          </div>
          <div style={{ color: theme.textoSecundario, fontSize: '12px', marginTop: '4px' }}>
            Estado
          </div>
        </KpiCard>
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
          <h3 style={{ margin: '0 0 1rem 0', color: theme.textoPrincipal, textAlign: 'center' }}> Detalle de Servicios Pendientes</h3>

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
                {detalleFiltrado.map((servicio, index) => (
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

      {/* Mensaje cuando no hay datos filtrados */}
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
          No hay servicios pendientes para el mes de <strong>{formatearMesAnio(mesSeleccionado)}</strong>.
        </div>
      )}
    </div>
  );
};

export default ServiciosPendientesEfectivo;