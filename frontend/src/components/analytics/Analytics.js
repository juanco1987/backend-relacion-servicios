import React, { useState } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel,
  Paper, Chip, Grow } from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { getCustomSelectSx, getCustomMenuProps, getCustomLabelSx } from '../../utils/selectStyles';

// Componentes modularizados
import {
  FileControlSection,
  NoDataState,
  LoadingState,
  KpiSection,
  AnalyticsChart
} from './components';

// Hook personalizado
import { useAnalyticsData } from '../../hooks';

// Componente externo
import AnalyticsResumen from './AnalyticsResumen';

function Analytics({ excelData, workMode, onFileChange, onClearFile }) { 
  const { theme } = useTheme();
  const [mesSeleccionado, setMesSeleccionado] = useState('Total Global');
  const [analyticsFile, setAnalyticsFile] = useState(null);
  const [inputKey, setInputKey] = useState(0);

  // Hook personalizado para manejo de datos
  const {
    analyticsData,
    loading,
    pendientesData,
    filterValidMonths,
    prepareChartData,
    calculateGlobalTotals
  } = useAnalyticsData(analyticsFile, excelData);

  // Handlers
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Analytics file selected:', file.name);
      setAnalyticsFile(file);
      
      if (onFileChange) {
        console.log('Propagando archivo desde Analytics al padre:', file.name);
        onFileChange(file);
      }
      
      setMesSeleccionado('Total Global');
    }
  };

  const handleClearFile = () => {
    console.log('handleClearFile ejecutado');
    if (onClearFile) {
      console.log('Llamando onClearFile del padre');
      onClearFile();
    }
    setAnalyticsFile(null);
    setMesSeleccionado('Total Global');
    setInputKey(prev => prev + 1);
  };

  // Estados condicionales
  if (loading) {
    return (
      <LoadingState
        analyticsFile={analyticsFile}
        excelData={excelData}
        onFileChange={handleFileChange}
        inputKey={inputKey}
      />
    );
  }

  if (!analyticsFile && !excelData) {
    return <NoDataState onFileChange={handleFileChange} />;
  }

  if (!analyticsData) {
    return <NoDataState onFileChange={handleFileChange} />;
  }

  // Procesamiento de datos
  const dataGrafica = prepareChartData(analyticsData);
  const totalGlobal = calculateGlobalTotals(dataGrafica);
  const mesesOrdenados = filterValidMonths(analyticsData);

  const datosSeleccionados = mesSeleccionado === 'Total Global' 
    ? totalGlobal 
    : analyticsData[mesSeleccionado] || {};

  const pendientesSeleccionados = mesSeleccionado === 'Total Global'
    ? {
        total_pendientes_relacionar: pendientesData.total_pendientes_relacionar,
        total_pendientes_cobrar: pendientesData.total_pendientes_cobrar
      }
    : pendientesData.pendientes_por_mes[mesSeleccionado] || { 
        total_pendientes_relacionar: 0, 
        total_pendientes_cobrar: 0 
      };

  const kpi = {
    efectivo_total: Number(datosSeleccionados?.efectivo_total || 0),
    transferencia_total: Number(datosSeleccionados?.transferencia_total || 0),
    total_general: Number(datosSeleccionados?.total_general || 0),
    efectivo_cantidad: Number(datosSeleccionados?.efectivo_cantidad || 0),
    transferencia_cantidad: Number(datosSeleccionados?.transferencia_cantidad || 0)
  };

  // Render principal
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
        {/* Header */}
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

        {/* Control de archivo */}
        <FileControlSection
          analyticsFile={analyticsFile}
          excelData={excelData}
          onFileChange={handleFileChange}
          inputKey={inputKey}
        />

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

        {/* KPIs */}
        <KpiSection 
          kpi={kpi} 
          pendientesSeleccionados={pendientesSeleccionados} 
        />

        {/* Gráfico */}
        <AnalyticsChart dataGrafica={dataGrafica} />

        {/* Resumen detallado */}
        <AnalyticsResumen 
          resumen={analyticsData} 
          pendientes={pendientesData} 
        />
      </Paper>
    </motion.div>
  );
}

export default Analytics;