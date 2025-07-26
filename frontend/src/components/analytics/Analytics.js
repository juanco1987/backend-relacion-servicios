import React, { useState, useEffect } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import AnalyticsResumen from './AnalyticsResumen';
import KpiCard from '../KpiCard';

// Componente Tooltip personalizado
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{
        background: 'rgba(0, 0, 0, 0.8)',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '10px',
        color: 'white'
      }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          {label}
        </Typography>
        {payload.map((entry, index) => {
          if (entry.name === 'precio') return null; // Excluir 'precio'
          return (
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
              {entry.name}: ${entry.value.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
            </Typography>
          );
        })}
      </Box>
    );
  }
  return null;
};

function Analytics({ excelData, workMode }) {
  const { theme } = useTheme();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [mesSeleccionado, setMesSeleccionado] = useState('Total Global');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!excelData) return;
    
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('file', excelData);
        
        const response = await fetch('http://localhost:5000/api/analytics', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Error al obtener analytics');
        }
        
        const data = await response.json();
        
        // Limpiar datos eliminando el campo 'precio'
        const cleanAnalyticsData = { ...data.resumen };
        Object.keys(cleanAnalyticsData).forEach(mes => {
          if (cleanAnalyticsData[mes] && cleanAnalyticsData[mes].precio) {
            delete cleanAnalyticsData[mes].precio;
          }
        });
        
        setAnalyticsData(cleanAnalyticsData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [excelData]);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 200,
        color: theme.textoPrincipal 
      }}>
        <Typography>Cargando analytics...</Typography>
      </Box>
    );
  }

  if (!analyticsData) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 200,
        color: theme.textoSecundario 
      }}>
        <Typography>No hay datos de analytics disponibles</Typography>
      </Box>
    );
  }

  // Preparar datos para el gráfico (excluyendo meses inválidos)
  const dataGrafica = Object.entries(analyticsData)
    .filter(([mes]) => {
      if (!mes) return false;
      const normalizado = mes.trim().toLowerCase();
      return normalizado &&
        normalizado !== 'null' &&
        normalizado !== 'undefined' &&
        normalizado !== 'invalid date' &&
        !/^nat$/i.test(normalizado);
    })
    .map(([mes, datos]) => ({
      mes,
      Efectivo: Number(datos?.efectivo_total || 0),
      Transferencia: Number(datos?.transferencia_total || 0),
      'Total General': Number(datos?.total_general || 0),
      efectivo_cantidad: Number(datos?.efectivo_cantidad || 0),
      transferencia_cantidad: Number(datos?.transferencia_cantidad || 0)
    }));

  // Calcular totales globales
  const totalGlobal = dataGrafica.reduce((acc, item) => ({
    efectivo_total: acc.efectivo_total + item.Efectivo,
    transferencia_total: acc.transferencia_total + item.Transferencia,
    total_general: acc.total_general + item['Total General'],
    efectivo_cantidad: acc.efectivo_cantidad + item.efectivo_cantidad,
    transferencia_cantidad: acc.transferencia_cantidad + item.transferencia_cantidad
  }), {
    efectivo_total: 0,
    transferencia_total: 0,
    total_general: 0,
    efectivo_cantidad: 0,
    transferencia_cantidad: 0
  });

  // Obtener datos del mes seleccionado o total global
  const datosSeleccionados = mesSeleccionado === 'Total Global' 
    ? totalGlobal 
    : analyticsData[mesSeleccionado] || {};

  // Preparar KPIs
  const kpi = {
    efectivo_total: Number(datosSeleccionados?.efectivo_total || 0),
    transferencia_total: Number(datosSeleccionados?.transferencia_total || 0),
    total_general: Number(datosSeleccionados?.total_general || 0),
    efectivo_cantidad: Number(datosSeleccionados?.efectivo_cantidad || 0),
    transferencia_cantidad: Number(datosSeleccionados?.transferencia_cantidad || 0)
  };

  // Filtrar meses válidos (excluir NaT, null, undefined, vacíos, variantes)
  const mesesOrdenados = Object.keys(analyticsData)
    .filter(mes => {
      if (!mes) return false;
      const normalizado = mes.trim().toLowerCase();
      return normalizado &&
        normalizado !== 'null' &&
        normalizado !== 'undefined' &&
        normalizado !== 'invalid date' &&
        !/^nat$/i.test(normalizado); // elimina cualquier variante de 'NaT'
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

  return (
    <Box sx={{ 
      width: '100%', 
      background: theme.fondoContenedor,
      borderRadius: '28px',
      boxShadow: theme.sombraContenedor,
      p: { xs: 3, md: 4 },
      mb: 4
    }}>
      <Typography variant="h5" sx={{ 
        color: theme.textoPrincipal, 
        fontWeight: 'bold', 
        mb: 3,
        textAlign: 'center'
      }}>
        📊 Analytics - Análisis de Datos
      </Typography>

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

      {/* KPIs de montos */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
        gap: 3, 
        mb: 4 
      }}>
        <KpiCard
          title="Total Efectivo"
          value={`$${kpi.efectivo_total.toLocaleString('es-CO')}`}
          subtitle={`${kpi.efectivo_cantidad} servicios en efectivo`}
          color={theme.terminalVerde}
        />
        <KpiCard
          title="Total Transferencia"
          value={`$${kpi.transferencia_total.toLocaleString('es-CO')}`}
          subtitle={`${kpi.transferencia_cantidad} servicios por transferencia`}
          color={theme.textoInfo}
        />
        <KpiCard
          title="Total General"
          value={`$${kpi.total_general.toLocaleString('es-CO')}`}
          subtitle={`${kpi.efectivo_cantidad + kpi.transferencia_cantidad} servicios totales`}
          color={theme.primario}
        />
      </Box>

      {/* Gráfico */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ 
          color: theme.textoPrincipal, 
          fontWeight: 'bold', 
          mb: 2,
          textAlign: 'center'
        }}>
          Gráfico de Ingresos por Mes
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dataGrafica}>
            <XAxis 
              dataKey="mes" 
              tick={{ fill: theme.textoPrincipal }}
              axisLine={{ stroke: theme.bordePrincipal }}
            />
            <YAxis 
              tick={{ fill: theme.textoPrincipal }}
              axisLine={{ stroke: theme.bordePrincipal }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="Efectivo" fill={theme.terminalVerde} />
            <Bar dataKey="Transferencia" fill={theme.textoInfo} />
            <Bar dataKey="Total General" fill={theme.primario} />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Resumen detallado */}
      <Box>
        <Typography variant="h6" sx={{ 
          color: theme.textoPrincipal, 
          fontWeight: 'bold', 
          mb: 2,
          textAlign: 'center'
        }}>
          Resumen Detallado
        </Typography>
        <AnalyticsResumen resumen={analyticsData} />
      </Box>
    </Box>
  );
}

export default Analytics; 