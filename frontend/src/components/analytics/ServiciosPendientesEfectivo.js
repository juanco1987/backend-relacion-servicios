import React, { useState, useEffect } from 'react';
import { Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import { getCustomSelectSx, getCustomMenuProps, getCustomLabelSx } from '../../utils/selectStyles';
import { generateMonthsUntilNow, formatMonth } from '../../utils/dateUtils';
import KpiCard from '../common/KpiCard';
import CustomTable from '../common/CustomTable';
import { formatCurrency, formatInteger } from '../../utils/numberFormatters';
import { API_CONFIG } from '../../config/appConfig';

const API_BASE = API_CONFIG.BASE_URL;

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

  const mesesOrdenados = generateMonthsUntilNow();

  const totalGlobal = mesesOrdenados.reduce((acc, mesKey) => {
    const datosMes = resumen[mesKey] || {};
    const serviciosNuevos = datosMes.total_servicios || 0;
    const valorNuevo = datosMes.total_valor || 0;
    const diasNuevos = datosMes.dias_sin_relacionar || 0;
    
    const mensajeActual = acc.advertencia;
    const mensajeNuevo = datosMes.advertencia;
    const usarMensajeNuevo = datosMes.tiene_pendientes && 
      (!acc.tiene_pendientes || diasNuevos > acc.dias_sin_relacionar);

    return {
      total_servicios: acc.total_servicios + serviciosNuevos,
      total_valor: acc.total_valor + valorNuevo,
      dias_sin_relacionar: Math.max(acc.dias_sin_relacionar, diasNuevos),
      tiene_pendientes: acc.tiene_pendientes || datosMes.tiene_pendientes,
      advertencia: usarMensajeNuevo ? mensajeNuevo : mensajeActual
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
    : resumen[mesSeleccionado] || {
      total_servicios: 0,
      total_valor: 0,
      dias_sin_relacionar: 0,
      tiene_pendientes: false,
      advertencia: "✅ ¡Excelente! No hay servicios pendientes por relacionar para este mes"
    };

  const detalleFiltrado = detalle ? detalle.filter(servicio => {
    if (mesSeleccionado === 'Total Global') return true;
    const [año, mes] = servicio.fecha.split('-');
    const mesAñoCalculado = `${año}-${mes}`;
    return mesAñoCalculado === mesSeleccionado;
  }) : [];

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

  const getStatusLabel = (servicio) => {
    if (servicio.es_antiguo) {
      return (
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
      );
    } else if (servicio.dias_sin_relacionar > 7) {
      return (
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
      );
    } else {
      return (
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
      );
    }
  };

  // Definir headers para CustomTable
  const tableHeaders = [
    { label: 'Fecha' },
    { label: 'Estado' },
    { label: 'Servicio' },
    { label: 'Subtotal', style: { textAlign: 'right' } },
    { label: 'IVA', style: { textAlign: 'right' } },
    { label: 'Total ABRECAR', style: { textAlign: 'right' } },
    { label: 'Días de Retraso', style: { textAlign: 'center', minWidth: '100px' } },
    { label: 'Estado', style: { textAlign: 'center' } }
  ];

  // Función para renderizar cada fila
  const renderRow = (servicio, tdStyles) => (
    <>
      <td style={tdStyles}>{servicio.fecha}</td>
      <td style={tdStyles}>{servicio.estado}</td>
      <td style={tdStyles}>{servicio.servicio_realizado}</td>
      <td style={{ ...tdStyles, textAlign: 'right' }}>
        {formatCurrency(servicio.subtotal)}
      </td>
      <td style={{ ...tdStyles, textAlign: 'right' }}>
        {formatCurrency(servicio.iva)}
      </td>
      <td style={{ ...tdStyles, textAlign: 'right', fontWeight: 'bold' }}>
        {formatCurrency(servicio.total_abrecar)}
      </td>
      <td style={{ ...tdStyles, textAlign: 'center' }}>
        {getStatusBadge(servicio.dias_sin_relacionar, servicio.es_antiguo)}
      </td>
      <td style={{ ...tdStyles, textAlign: 'center' }}>
        {getStatusLabel(servicio)}
      </td>
    </>
  );

  return (
    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
      <h2 style={{ display: 'inline-block', alignItems: 'center', gap: '8px', color: theme.textoPrincipal }}>
        💰 Servicios en Efectivo Pendientes
      </h2>

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
                {formatMonth(mesKey)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

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

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '2rem'
      }}>
        <KpiCard color={theme.terminalOliva} variant='elevated'>
          <div style={{ color: theme.terminalOliva, fontWeight: 'bold', fontSize: '28px' }}>
            {formatInteger(datosSeleccionados.total_servicios)}
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

      {detalleFiltrado && detalleFiltrado.length > 0 && (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: theme.textoPrincipal, textAlign: 'center' }}>
            Detalle de Servicios Pendientes
          </h3>
          <CustomTable
            headers={tableHeaders}
            data={detalleFiltrado}
            renderRow={renderRow}
            wrapperStyles={{ maxWidth: '1400px' }}
          />
        </div>
      )}

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

      {detalleFiltrado.length === 0 && mesSeleccionado !== 'Total Global' && detalle && detalle.length > 0 && (
        <div style={{
          padding: '1rem',
          backgroundColor: theme.fondoContenedor,
          border: `1px solid ${theme.bordePrincipal}`,
          borderRadius: '8px',
          color: theme.terminalVerde,
          marginTop: '1rem',
          textAlign: 'center'
        }}>
          ✅ ¡Excelente! No hay servicios pendientes para el mes de <strong>{formatMonth(mesSeleccionado)}</strong>.
        </div>
      )}
    </div>
  );
};

export default ServiciosPendientesEfectivo;