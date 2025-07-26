import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Button,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  AttachMoney, 
  Schedule, 
  CheckCircle,
  Analytics as AnalyticsIcon,
  Refresh,
  Download
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { ANIMATIONS } from '../config/animations';
import analyticsService from '../services/analyticsService';
import { createLogEntry } from '../config/logMessages';

const Analytics = ({ excelData, workMode = 0 }) => {
  const { theme } = useTheme();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mesSeleccionado, setMesSeleccionado] = useState(null);
  const [meses, setMeses] = useState([]);

  // Colores para los gráficos
  const chartColors = {
    servicios: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'],
    pendientes: ['#ff6b6b', '#ffa726', '#ffd54f', '#81c784'],
    ingresos: ['#4caf50', '#2196f3', '#ff9800', '#9c27b0']
  };

  // Simular datos de ejemplo (después se reemplazará con datos reales)
  const mockData = {
    serviciosPorMes: [
      { mes: 'Ene', servicios: 12, ingresos: 45000, pendientes: 3 },
      { mes: 'Feb', servicios: 15, ingresos: 52000, pendientes: 2 },
      { mes: 'Mar', servicios: 18, ingresos: 61000, pendientes: 4 },
      { mes: 'Abr', servicios: 14, ingresos: 48000, pendientes: 1 },
      { mes: 'May', servicios: 20, ingresos: 68000, pendientes: 5 },
      { mes: 'Jun', servicios: 16, ingresos: 55000, pendientes: 2 }
    ],
    serviciosPorCategoria: [
      { categoria: 'Mantenimientos', cantidad: 45, porcentaje: 35 },
      { categoria: 'Puertas Vidrio', cantidad: 28, porcentaje: 22 },
      { categoria: 'Automatismos', cantidad: 32, porcentaje: 25 },
      { categoria: 'Cerrajería', cantidad: 25, porcentaje: 18 }
    ],
    estadoServicios: [
      { estado: 'Completados', cantidad: 95, color: '#4caf50' },
      { estado: 'Pendientes', cantidad: 15, color: '#ff9800' },
      { estado: 'Cotizados', cantidad: 8, color: '#2196f3' }
    ]
  };

  useEffect(() => {
    if (excelData) {
      processExcelData(excelData);
    } else {
      setAnalyticsData(null);
      setMesSeleccionado(null);
      setMeses([]);
    }
  }, [excelData]);

  const processExcelData = async (data) => {
    if (!data) {
      setAnalyticsData(null);
      setMesSeleccionado(null);
      setMeses([]);
      return;
    }
    setIsLoading(true);
    try {
      // Llamada real al backend
      const formData = new FormData();
      formData.append('file', data);
      formData.append('fecha_inicio', new Date().toISOString().split('T')[0]);
      formData.append('fecha_fin', new Date().toISOString().split('T')[0]);
      formData.append('work_mode', workMode);
      const response = await fetch('http://localhost:5000/api/analytics', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result && result.resumen) {
        setAnalyticsData(result.resumen);
        // Al procesar los datos del backend, filtra los meses inválidos
        const mesesOrdenados = Object.keys(result.resumen)
          .filter(mes => mes && mes !== 'NaT' && mes !== 'Invalid date' && mes !== null && mes !== undefined)
          .sort();
        setMeses(mesesOrdenados);
        setMesSeleccionado(mesesOrdenados[mesesOrdenados.length - 1] || null);
      } else {
        setAnalyticsData(null);
        setMesSeleccionado(null);
        setMeses([]);
      }
    } catch (error) {
      setAnalyticsData(null);
      setMesSeleccionado(null);
      setMeses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Preparar datos para la gráfica con los nuevos campos
  const dataGrafica = meses.map(mes => ({
    mes,
    efectivo: Number(analyticsData?.[mes]?.efectivo_total ?? 0),
    transferencia: Number(analyticsData?.[mes]?.transferencia_total ?? 0),
    total: Number(analyticsData?.[mes]?.total_general ?? 0),
    servicios: Number(analyticsData?.[mes]?.cantidad_general ?? 0),
    efectivo_cantidad: Number(analyticsData?.[mes]?.efectivo_cantidad ?? 0),
    transferencia_cantidad: Number(analyticsData?.[mes]?.transferencia_cantidad ?? 0)
  }));

  // Calcular el total global sumando todos los meses, incluyendo cantidades
  const totalGlobal = dataGrafica.reduce(
    (acc, curr) => ({
      efectivo: acc.efectivo + curr.efectivo,
      transferencia: acc.transferencia + curr.transferencia,
      total: acc.total + curr.total,
      servicios: acc.servicios + curr.servicios,
      efectivo_cantidad: (acc.efectivo_cantidad || 0) + (curr.efectivo_cantidad || 0),
      transferencia_cantidad: (acc.transferencia_cantidad || 0) + (curr.transferencia_cantidad || 0)
    }),
    { efectivo: 0, transferencia: 0, total: 0, servicios: 0, efectivo_cantidad: 0, transferencia_cantidad: 0 }
  );

  // Agregar 'Total Global' como opción extra en el menú de meses
  const mesesConTotal = [...meses, 'Total Global'];

  // KPIs del mes seleccionado o del total global
  const kpi =
    mesSeleccionado === 'Total Global'
      ? {
          efectivo_total: totalGlobal.efectivo,
          transferencia_total: totalGlobal.transferencia,
          total_general: totalGlobal.total,
          cantidad_general: totalGlobal.servicios,
          efectivo_cantidad: totalGlobal.efectivo_cantidad,
          transferencia_cantidad: totalGlobal.transferencia_cantidad
        }
      : mesSeleccionado && analyticsData
      ? analyticsData[mesSeleccionado]
      : null;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '400px', color: theme.textoSecundario }}>
        <CircularProgress size={60} sx={{ color: theme.primario, mb: 2 }} />
        <Typography variant="h6">Procesando datos Excel...</Typography>
        <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
          Analizando servicios y generando estadísticas
        </Typography>
      </Box>
    );
  }

  if (!analyticsData || meses.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', color: theme.textoSecundario }}>
        <Alert severity="info" sx={{ maxWidth: 400 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>No hay datos para analizar</Typography>
          <Typography variant="body2">
            Carga un archivo Excel y procesa los datos para ver el análisis completo.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Tooltip personalizado para formatear valores con símbolo de pesos y separador de miles colombiano
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ background: '#fff', border: '1px solid #ccc', borderRadius: 2, p: 2 }}>
          <Typography variant="subtitle2">{label}</Typography>
          {payload.map((entry, i) => (
            <Typography key={i} variant="body2" sx={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' && (entry.name === 'Efectivo' || entry.name === 'Transferencia' || entry.name === 'Total General')
                ? `$${entry.value.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`
                : entry.value}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <Box sx={{ width: '100%', background: theme.fondoContenedor, borderRadius: '28px', boxShadow: theme.sombraContenedor, p: { xs: 3, md: 4 }, mb: 4 }}>
        {/* Header del Analytics */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <motion.div whileHover={{ rotate: 5, scale: 1.1 }} transition={{ duration: 0.2 }}>
              <AnalyticsIcon sx={{ fontSize: 40, color: theme.primario, filter: theme.modo === 'claro' ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))' }} />
            </motion.div>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.textoPrincipal, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                Análisis de Servicios YA RELACIONADO
              </Typography>
              <Typography variant="body1" sx={{ color: theme.textoSecundario, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                Dashboard de ingresos y cantidades por mes
              </Typography>
            </Box>
          </Box>
          {/* Selector de mes */}
          <Box>
            <FormControl sx={{ minWidth: 180, mb: 2 }} size="small">
              <InputLabel id="mes-label">Mes</InputLabel>
              <Select
                labelId="mes-label"
                value={mesSeleccionado || ''}
                label="Mes"
                onChange={e => setMesSeleccionado(e.target.value)}
              >
                {mesesConTotal.map(mes => (
                  <MenuItem key={mes} value={mes}>
                    {mes}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* KPIs del mes seleccionado */}
        {kpi && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: theme.gradientes.botonInactivo, borderRadius: '20px', boxShadow: theme.sombraTarjeta, border: `1px solid ${theme.bordePrincipal}`, transition: 'all 0.3s ease' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ background: `linear-gradient(135deg, ${theme.primario}, ${theme.secundario})`, borderRadius: '12px', p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AttachMoney sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.textoPrincipal, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                        ${Number(kpi.total_general ?? 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.textoSecundario, fontSize: { xs: '0.8rem', md: '0.9rem' } }}>
                        Ingresos (Total General)
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: theme.gradientes.botonInactivo, borderRadius: '20px', boxShadow: theme.sombraTarjeta, border: `1px solid ${theme.bordePrincipal}`, transition: 'all 0.3s ease' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ background: `linear-gradient(135deg, #1976d2, #1565c0)`, borderRadius: '12px', p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.textoPrincipal, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                        {Number(kpi.efectivo_cantidad ?? 0)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.textoSecundario, fontSize: { xs: '0.8rem', md: '0.9rem' } }}>
                        Servicios EFECTIVO
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: theme.gradientes.botonInactivo, borderRadius: '20px', boxShadow: theme.sombraTarjeta, border: `1px solid ${theme.bordePrincipal}`, transition: 'all 0.3s ease' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ background: `linear-gradient(135deg, #ff9800, #ffb74d)`, borderRadius: '12px', p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Schedule sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.textoPrincipal, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                        {Number(kpi.transferencia_cantidad ?? 0)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.textoSecundario, fontSize: { xs: '0.8rem', md: '0.9rem' } }}>
                        Servicios TRANSFERENCIA
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: theme.gradientes.botonInactivo, borderRadius: '20px', boxShadow: theme.sombraTarjeta, border: `1px solid ${theme.bordePrincipal}`, transition: 'all 0.3s ease' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ background: `linear-gradient(135deg, #4caf50, #66bb6a)`, borderRadius: '12px', p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.textoPrincipal, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                        {Number(kpi.cantidad_general ?? 0)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.textoSecundario, fontSize: { xs: '0.8rem', md: '0.9rem' } }}>
                        Total Servicios
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Gráfica de todos los meses */}
        <Box sx={{ width: '100%', height: 350, mt: 2 }}>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={dataGrafica} onClick={e => {
              if (e && e.activeLabel) setMesSeleccionado(e.activeLabel);
            }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.bordePrincipal} />
              <XAxis dataKey="mes" stroke={theme.textoSecundario} fontSize={12} />
              <YAxis stroke={theme.textoSecundario} fontSize={12} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="efectivo" fill="#4caf50" name="Efectivo" radius={[4, 4, 0, 0]} />
              <Bar dataKey="transferencia" fill="#2196f3" name="Transferencia" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total" fill="#ff9800" name="Total General" radius={[4, 4, 0, 0]} />
              <Bar dataKey="servicios" fill="#9c27b0" name="Servicios" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </motion.div>
  );
};

export default Analytics; 