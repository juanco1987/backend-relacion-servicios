import React, { useState, useEffect } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel,
  TextField, Button, Paper, CircularProgress, Chip, Grow } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { ANIMATIONS } from '../../config/animations';
import AnalyticsResumen from './AnalyticsResumen';
import KpiCard from '../KpiCard';
import { getCustomSelectSx, getCustomMenuProps, getCustomLabelSx } from '../../utils/selectStyles';
// Iconos 
import excelIcon from '../../assets/document_microsoft_excel.png';
import engraneIcon from '../../assets/engrane.png';

function Analytics({ excelData, workMode, onFileChange, onClearFile }) { 
  const { theme } = useTheme();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [mesSeleccionado, setMesSeleccionado] = useState('Total Global');
  const [loading, setLoading] = useState(false);
  const [analyticsFile, setAnalyticsFile] = useState(null);
  const [pendientesData, setPendientesData] = useState({ 
    total_pendientes_relacionar: 0, 
    total_pendientes_cobrar: 0,
    pendientes_por_mes: {}
  });
  const [inputKey, setInputKey] = useState(0); // Key dinámica para regenerar el input

  // MODIFICADA: Manejar carga de archivo específico para Analytics
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Analytics file selected:', file.name);
      setAnalyticsFile(file);
      
      // NUEVA LÍNEA: Propagar al componente padre
      if (onFileChange) {
        console.log('Propagando archivo desde Analytics al padre:', file.name);
        onFileChange(file);
      }
      
      // Resetear datos anteriores cuando se carga nuevo archivo
      setAnalyticsData(null);
      setPendientesData({ 
        total_pendientes_relacionar: 0, 
        total_pendientes_cobrar: 0,
        pendientes_por_mes: {}
      });
    }
  };

  // NUEVA FUNCIÓN: Limpiar archivo y regenerar input
  const handleClearFile = () => {
    console.log('handleClearFile ejecutado');
    if (onClearFile) {
      console.log('Llamando onClearFile del padre');
      onClearFile();
    }
    setAnalyticsFile(null);
    setAnalyticsData(null);
    setPendientesData({ 
      total_pendientes_relacionar: 0, 
      total_pendientes_cobrar: 0,
      pendientes_por_mes: {}
    });
    setMesSeleccionado('Total Global');
    // Regenerar el input con nueva key
    setInputKey(prev => prev + 1);
  };

  // Debug: mostrar estado actual
  console.log('Analytics render - analyticsFile:', analyticsFile, 'excelData:', excelData);

  // NUEVO COMPONENTE: Sección de control de archivo que siempre está visible
  const FileControlSection = () => (
    <Box sx={{
      mb: 3,
      p: 2,
      background: theme.fondoOverlay,
      borderRadius: '16px',
      border: `1px solid ${theme.bordePrincipal}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: { xs: 'column', sm: 'row' },
      gap: 2
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          component="img"
          src={excelIcon}
          alt="Excel"
          sx={{ 
            width: 32, 
            height: 32,
            filter: theme.modo === 'oscuro' ? 'invert(1)' : 'none'
          }}
        />
        <Box>
          <Typography variant="body1" sx={{ 
            color: theme.textoPrincipal, 
            fontWeight: 600
          }}>
            {(analyticsFile || excelData)?.name || 'Sin archivo seleccionado'}
          </Typography>
          <Typography variant="body2" sx={{ 
            color: theme.textoSecundario
          }}>
            Archivo para análisis de datos
          </Typography>
        </Box>
      </Box>
      
      <Button
        variant="outlined"
        component="label"
        size="small"
        sx={{
          background: theme.fondoOverlay,
          color: theme.textoPrincipal,
          borderColor: theme.bordePrincipal,
          borderRadius: '25px',
          px: 3,
          py: 1.5,
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'none',
          transition: 'all 0.3s ease',
          borderWidth: '1.5px',
          minWidth: '140px',
          boxShadow: theme.sombraContenedor,
          '&:hover': {
            background: theme.fondoHover,
            borderColor: theme.bordeHover,
            transform: 'translateY(-1px)',
            boxShadow: theme.sombraHover,
          }
        }}
      >
        📁 Seleccionar Archivo
        <input
          key={inputKey}
          type="file"
          hidden
          accept=".xlsx,.xls"
          onChange={handleFileChange}
        />
      </Button>
    </Box>
  );

  // Componente para mostrar cuando no hay archivo cargado - Usando tu estilo
  const NoDataState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Paper
        elevation={0}
        sx={{
          background: theme.fondoContenedor,
          borderRadius: '28px',
          boxShadow: theme.sombraContenedor,
          p: { xs: 3, md: 4 },
          overflow: 'hidden',
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        <Box
          component="img"
          src={excelIcon}
          alt="Excel Analytics"
          sx={{ 
            width: { xs: 60, md: 80 }, 
            height: { xs: 60, md: 80 },
            mb: 3,
            filter: theme.modo === 'oscuro' ? 'invert(1)' : 'none',
            opacity: 0.8
          }}
        />
        
        <Typography variant="h4" sx={{
          color: theme.textoPrincipal,
          fontWeight: 'bold',
          mb: 2,
          fontSize: { xs: '1.8rem', md: '2.2rem' }
        }}>
          📊 Analytics Dashboard
        </Typography>
        
        <Typography variant="h6" sx={{
          color: theme.textoSecundario,
          mb: 4,
          lineHeight: 1.6,
          maxWidth: 600
        }}>
          Para visualizar tus estadísticas y análisis financieros, 
          carga tu archivo Excel con los datos de Analytics
        </Typography>

        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 4,
          p: 3,
          borderRadius: '16px',
          background: theme.fondoOverlay,
          border: `2px dashed ${theme.bordePrincipal}`,
          maxWidth: 400,
          width: '100%'
        }}>
          <Box
            component="img"
            src={engraneIcon}
            alt="Configuración"
            sx={{ 
              width: 24, 
              height: 24,
              mr: 2,
              filter: theme.modo === 'oscuro' ? 'invert(1)' : 'none'
            }}
          />
          <Typography variant="body1" sx={{
            color: theme.textoPrincipal,
            fontWeight: 500
          }}>
            Formato soportado: .xlsx, .xls
          </Typography>
        </Box>

        {/* Campo de carga usando exactamente tu estilo */}
        <Box sx={{ width: '100%', maxWidth: 500, mb: 3 }}>          
          <motion.div
            whileHover={ANIMATIONS.formFieldHover}
            whileTap={{ scale: 0.98 }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', justifyContent: 'center' }}>
              <Button
                variant="outlined"
                component="label"
                size="large"
                sx={{
                  background: theme.fondoOverlay,
                  color: theme.textoPrincipal,
                  borderColor: theme.bordePrincipal,
                  borderRadius: '25px',
                  px: 4,
                  py: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  borderWidth: '2px',
                  minWidth: '200px',
                  height: '50px',
                  boxShadow: theme.sombraContenedor,
                  '&:hover': {
                    background: theme.fondoHover,
                    borderColor: theme.bordeHover,
                    transform: 'translateY(-2px)',
                    boxShadow: theme.sombraHover,
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '&:focus': {
                    borderColor: theme.bordeHover,
                    borderWidth: '2px',
                  }
                }}
              >
                📁 Seleccionar Archivo Excel
                <input
                  type="file"
                  hidden
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                />
              </Button>
            </Box>
          </motion.div>
        </Box>

        <Typography variant="body2" sx={{
          color: theme.textoSecundario,
          fontStyle: 'italic'
        }}>
          Una vez cargado, podrás ver gráficos, KPIs y resúmenes detallados
        </Typography>
      </Paper>
    </motion.div>
  );

  // Componente Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{
          background: theme.fondoContenedor,
          border: `1px solid ${theme.bordePrincipal}`,
          borderRadius: '19px',
          padding: '10px',
          color: theme.textoPrincipal
        }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            {label}
          </Typography>
          {payload.map((entry, index) => {
            if (entry.name === 'precio') return null;
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

  useEffect(() => {
    // Usar el archivo específico de Analytics si está disponible, sino usar excelData como fallback
    const fileToUse = analyticsFile || excelData;
    
    if (!fileToUse) {
      setAnalyticsData(null);
      setPendientesData({ 
        total_pendientes_relacionar: 0, 
        total_pendientes_cobrar: 0,
        pendientes_por_mes: {}
      });
      return;
    }
    
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('file', fileToUse);
        
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
        setPendientesData({
          total_pendientes_relacionar: data.total_pendientes_relacionar || 0,
          total_pendientes_cobrar: data.total_pendientes_cobrar || 0,
          pendientes_por_mes: data.pendientes_por_mes || {}
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setAnalyticsData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [analyticsFile, excelData]);

  // Estado de carga - usando tu estilo
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper
          elevation={0}
          sx={{
            background: theme.fondoContenedor,
            borderRadius: '28px',
            boxShadow: theme.sombraContenedor,
            p: { xs: 3, md: 4 },
            overflow: 'hidden',
            minHeight: '50vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {/* Mostrar control de archivo incluso durante la carga */}
          <FileControlSection />
          
          <CircularProgress 
            sx={{ 
              color: theme.terminalVerdeNeon,
              mb: 3
            }} 
            size={60}
          />
          <Typography variant="h6" sx={{ 
            fontWeight: 'bold',
            color: theme.textoPrincipal,
            mb: 1
          }}>
            Procesando datos...
          </Typography>
          <Typography variant="body2" sx={{ 
            color: theme.textoSecundario,
            textAlign: 'center'
          }}>
            Analizando tu archivo Excel para generar estadísticas
          </Typography>
        </Paper>
      </motion.div>
    );
  }

  // Estado sin datos
  if (!analyticsFile && !excelData) {
    return <NoDataState />;
  }

  if (!analyticsData) {
    return <NoDataState />;
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
  .sort(([mesA], [mesB]) => {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const añoA = mesA.split(' ')[1];
    const añoB = mesB.split(' ')[1];
    const mesIndexA = meses.indexOf(mesA.split(' ')[0]);
    const mesIndexB = meses.indexOf(mesB.split(' ')[0]);
    
    if (añoA !== añoB) return añoA - añoB;
    return mesIndexA - mesIndexB;
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

  // Obtener datos de pendientes según el mes seleccionado
  const pendientesSeleccionados = mesSeleccionado === 'Total Global'
    ? {
        total_pendientes_relacionar: pendientesData.total_pendientes_relacionar,
        total_pendientes_cobrar: pendientesData.total_pendientes_cobrar
      }
    : pendientesData.pendientes_por_mes[mesSeleccionado] || { total_pendientes_relacionar: 0, total_pendientes_cobrar: 0 };

  // Funciones para mostrar mensajes reconfortantes
  const getPendientesRelacionarDisplay = () => {
    const cantidad = pendientesSeleccionados.total_pendientes_relacionar || 0;
    if (cantidad === 0) {
      return {
        value: "¡Excelente!",
        subtitle: "Estás al día en la relación de servicios",
        color: theme.terminalVerde
      };
    }
    return {
      value: cantidad.toString(),
      subtitle: "servicios por relacionar",
      color: theme.terminalRojo
    };
  };

  const getPendientesCobrarDisplay = () => {
    const cantidad = pendientesSeleccionados.total_pendientes_cobrar || 0;
    if (cantidad === 0) {
      return {
        value: "¡Excelente!",
        subtitle: "Estás al día en el cobro de pendientes",
        color: theme.terminalVerde
      };
    }
    return {
      value: cantidad.toString(),
      subtitle: "servicios por cobrar",
      color: theme.terminalAmarillo
    };
  };

  // Preparar KPIs
  const kpi = {
    efectivo_total: Number(datosSeleccionados?.efectivo_total || 0),
    transferencia_total: Number(datosSeleccionados?.transferencia_total || 0),
    total_general: Number(datosSeleccionados?.total_general || 0),
    efectivo_cantidad: Number(datosSeleccionados?.efectivo_cantidad || 0),
    transferencia_cantidad: Number(datosSeleccionados?.transferencia_cantidad || 0)
  };

  // Filtrar meses válidos
  const mesesOrdenados = Object.keys(analyticsData)
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Paper
        elevation={0}
        sx={{
          background: theme.fondoContenedor,
          borderRadius: '28px',
          boxShadow: theme.sombraContenedor,
          p: { xs: 3, md: 4 },
          mb: 4,
          overflow: 'hidden'
        }}
      >
        {/* Header con estado del archivo */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 4,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}>
          <Typography variant="h5" sx={{ 
            color: theme.textoPrincipal, 
            fontWeight: 'bold',
            textAlign: { xs: 'center', sm: 'left' }
          }}>
            📊 Analytics - Análisis de Datos
          </Typography>
          
          <Grow in={true} timeout={300}>
            <Chip
              label={`Archivo: ${(analyticsFile || excelData)?.name || 'Sin archivo'}`}
              color="success"
              variant="outlined"
              sx={{
                background: theme.terminalVerde,
                color: '#fff',
                fontWeight: 600,
                letterSpacing: 0.5,
                border: `2px solid ${theme.terminalVerde}`,
                transition: 'all 0.3s ease',
                maxWidth: 300,
                '& .MuiChip-label': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }
              }}
            />
          </Grow>
        </Box>

        {/* NUEVO: Sección de control de archivo siempre visible */}
        <FileControlSection />

        {/* Selector de mes */}
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
              sx={{
                ...getCustomSelectSx(theme),
                '& .MuiSelect-select': {
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }
              }}
              MenuProps={getCustomMenuProps(theme)}
            >
              <MenuItem value="Total Global">Total Global</MenuItem>
              {mesesOrdenados.map((mes) => (
                <MenuItem key={mes} value={mes}>
                  {mes}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* KPIs de montos - Manteniendo el layout original */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
          gap: 3, 
          mb: 4 
        }}>
          <KpiCard
            title="Total Efectivo"
            value={`${kpi.efectivo_total.toLocaleString('es-CO')}`}
            subtitle={`${kpi.efectivo_cantidad} servicios en efectivo`}
            color={theme.terminalVerde}
          />
          <KpiCard
            title="Total Transferencia"
            value={`${kpi.transferencia_total.toLocaleString('es-CO')}`}
            subtitle={`${kpi.transferencia_cantidad} servicios por transferencia`}
            color={theme.textoInfo}
          />
          <KpiCard
            title="Total General"
            value={`${kpi.total_general.toLocaleString('es-CO')}`}
            subtitle={`${kpi.efectivo_cantidad + kpi.transferencia_cantidad} servicios totales`}
            color={theme.terminalVerdeNeon}
          />
        </Box>

        {/* KPIs de pendientes - Segunda fila con el mismo tamaño */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
          gap: 3, 
          mb: 4 
        }}>
          <KpiCard
            title="Pendientes Relacionar"
            value={getPendientesRelacionarDisplay().value}
            subtitle={getPendientesRelacionarDisplay().subtitle}
            color={getPendientesRelacionarDisplay().color}
          />
          <KpiCard
            title="Pendientes Cobrar"
            value={getPendientesCobrarDisplay().value}
            subtitle={getPendientesCobrarDisplay().subtitle}
            color={getPendientesCobrarDisplay().color}
          />
          {/* Espaciador invisible para mantener la consistencia */}
          <Box />
        </Box>

        {/* Gráfico */}
        <Paper sx={{
          background: theme.fondoOverlay,
          borderRadius: '25px',
          padding: '24px',
          boxShadow: theme.sombraComponente,
          border: `1px solid ${theme.bordePrincipal}`,
          mb: 4
        }}>
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
              <Bar dataKey="Total General" fill={theme.terminalVerdeNeon} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Resumen detallado */}
        <AnalyticsResumen resumen={analyticsData} pendientes={pendientesData} />
      </Paper>
    </motion.div>
  );
}

export default Analytics;