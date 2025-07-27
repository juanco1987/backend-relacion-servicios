import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { STAGGER_VARIANTS, STAGGER_ITEM_VARIANTS } from '../../config/animations';
import ExcelUploader from '../forms/ExcelUploader';
import DateRangeSelector from '../forms/DateRangeSelector';
import NotesCard from '../forms/NotesCard';
import ActionCenterCard from './ActionCenterCard';
import ServiciosPendientesEfectivo from '../analytics/ServiciosPendientesEfectivo';
import ServiciosPendientesCobrar from '../analytics/ServiciosPendientesCobrar';
import Analytics from '../analytics/Analytics';
import DashboardPage from '../../pages/DashboardPage';
import ProcessingConsole from '../common/ProcessingConsole';
import { useTheme } from '../../context/ThemeContext';

function ContentArea({ 
  currentRoute,
  excelData,
  fechaInicio,
  fechaFin,
  note,
  logs,
  onFileChange,
  onFechaInicioChange,
  onFechaFinChange,
  onNoteChange,
  addLog,
  clearLogs,
  onProcessData,
  processing,
  animationState,
  setAnimationState,
  showSuccess,
  showError,
  setShowSuccess,
  setShowError,

}) {
  const { theme } = useTheme();

  // Determinar el modo de trabajo basado en la ruta
  const getWorkMode = (route) => {
    switch(route) {
      case '/reportes/servicios':
        return 0; // Relación de Servicios
      case '/reportes/pendientes':
        return 1; // Pendientes de Pago
      case '/analytics/efectivo':
        return 2; // Servicios Pendientes en Efectivo
      case '/analytics/cobrar':
        return 3; // Servicios Pendientes por Cobrar
      default:
        return 0;
    }
  };

  const workMode = getWorkMode(currentRoute);

  // Verificar si estamos en el Dashboard o en Analytics
  const isDashboard = currentRoute === '/' || currentRoute === '/dashboard';
  const isAnalytics = currentRoute === '/analytics/efectivo' || currentRoute === '/analytics/cobrar';
  const shouldShowFormComponents = !isDashboard && !isAnalytics;

  // Renderizar contenido específico según la ruta
  const renderRouteContent = () => {
    switch(currentRoute) {
      case '/':
      case '/dashboard':
        return (
          <DashboardPage excelData={excelData} />
        );
      
      case '/reportes/servicios':
      case '/reportes/pendientes':
        return (
          <>
            <ActionCenterCard
              archivoExcel={excelData}
              fechaInicio={fechaInicio}
              fechaFin={fechaFin}
              notas={note}
              workMode={workMode}
              onProcessData={onProcessData}
              processing={processing}
              animationState={animationState}
              setAnimationState={setAnimationState}
              showSuccess={showSuccess}
              showError={showError}
              setShowSuccess={setShowSuccess}
              setShowError={setShowError}
              addLog={addLog}
            />
          </>
        );
      
      case '/analytics/efectivo':
        return (
          <ServiciosPendientesEfectivo 
            file={excelData} 
            fechaInicio={fechaInicio ? fechaInicio.format('YYYY-MM-DD') : ''}
            fechaFin={fechaFin ? fechaFin.format('YYYY-MM-DD') : ''}
          />
        );
      
      case '/analytics/cobrar':
        return (
          <ServiciosPendientesCobrar 
            file={excelData} 
            fechaInicio={fechaInicio ? fechaInicio.format('YYYY-MM-DD') : ''}
            fechaFin={fechaFin ? fechaFin.format('YYYY-MM-DD') : ''}
          />
        );
      
      default:
        return (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: 400,
            color: theme.textoSecundario,
            fontSize: '1.2rem'
          }}>
            Selecciona una opción del menú para comenzar
          </Box>
        );
    }
  };

  return (
    <motion.div
      variants={STAGGER_VARIANTS}
      initial="hidden"
      animate="visible"
    >
      {/* Solo mostrar componentes de formulario si NO estamos en el Dashboard */}
      {shouldShowFormComponents && (
        <>
          {/* Selector de archivo Excel */}
          <motion.div variants={STAGGER_ITEM_VARIANTS}>
            <Box sx={{ width: '100%', mb: 1 }}>
              <ExcelUploader onFileChange={onFileChange} addLog={addLog} workMode={workMode} />
            </Box>
          </motion.div>

          {/* Fila de Rango de Fechas y Notas */}
          <motion.div variants={STAGGER_ITEM_VARIANTS}>
            <Box sx={{ width: '100%', display: 'flex', gap: 3, mb: 4 }}>
              <Box
                sx={{
                  flex: 1,
                  background: theme.fondoContenedor,
                  borderRadius: '28px',
                  boxShadow: theme.sombraContenedor,
                  p: { xs: 3, md: 4 },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minHeight: 220,
                }}
              >
                <DateRangeSelector
                  fechaInicio={fechaInicio}
                  fechaFin={fechaFin}
                  onFechaInicioChange={onFechaInicioChange}
                  onFechaFinChange={onFechaFinChange}
                  addLog={addLog}
                />
              </Box>
              <Box
                sx={{
                  flex: 1,
                  background: theme.fondoContenedor,
                  borderRadius: '28px',
                  boxShadow: theme.sombraContenedor,
                  p: { xs: 3, md: 4 },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minHeight: 220,
                }}
              >
                <NotesCard value={note} onChange={onNoteChange} addLog={addLog} />
              </Box>
            </Box>
          </motion.div>
        </>
      )}

      {/* Contenido específico según la ruta */}
      <motion.div variants={STAGGER_ITEM_VARIANTS}>
        {renderRouteContent()}
      </motion.div>

      {/* Solo mostrar consola de procesamiento si NO estamos en el Dashboard */}
      {shouldShowFormComponents && (
        <motion.div variants={STAGGER_ITEM_VARIANTS}>
          <Box sx={{ width: '100%' }}>
            <ProcessingConsole logs={logs} onClearLogs={clearLogs} />
          </Box>
        </motion.div>
      )}
    </motion.div>
  );
}

export default ContentArea; 