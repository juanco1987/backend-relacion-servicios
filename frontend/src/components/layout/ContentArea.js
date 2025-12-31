import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { STAGGER_VARIANTS, STAGGER_ITEM_VARIANTS } from '../../config/animations';
import UnifiedWorkflowCard from '../UnifiedWorkflowCard';
import Analytics from '../analytics/Analytics';
import DashboardPage from '../../pages/DashboardPage';
import UnifiedGastoWorkflow from '../GastosWorkFlowCard/UnifiedGastoWorkflow';
import { useTheme } from '../../context/ThemeContext';

function ContentArea({ 
  currentRoute,
  excelData,
  analyticsFile,
  onNavigate,
  fechaInicio,
  fechaFin,
  note,
  imagenes,
  gastoData, // ✅ NUEVO: datos del gasto
  onFileChange,
  onAnalyticsFileChange,
  onFechaInicioChange,
  onFechaFinChange,
  onNoteChange,
  onImageChange,
  onProcessData,
  onGeneratePDF,
  onGastoChange, // ✅ NUEVO: handler para cambios en gasto
  processing,
  animationState,
  onClearAnalyticsFile,
}) {
  const { theme } = useTheme();

  useEffect(() => {
    console.log('ContentArea excelData:', excelData);
  }, [excelData]);

  useEffect(() => {
    console.log('ContentArea handlers:', {
      onFileChange: !!onFileChange,
      onFechaInicioChange: !!onFechaInicioChange,
      onFechaFinChange: !!onFechaFinChange,
      onNoteChange: !!onNoteChange,
      onProcessData: !!onProcessData,
      onGeneratePDF: !!onGeneratePDF
    });
  }, [onFileChange, onFechaInicioChange, onFechaFinChange, onNoteChange, onProcessData, onGeneratePDF]);

  const getWorkMode = (route) => {
    switch(route) {
      case '/reportes/servicios':
        return 0;
      case '/reportes/pendientes':
        return 1;
      default:
        return 0;
    }
  };

  const workMode = getWorkMode(currentRoute);
  
  const renderRouteContent = () => {
    switch(currentRoute) {
      case '/':
      case '/dashboard':
      case '/dashboard/general':
      case '/dashboard/clientes':
      case '/dashboard/servicios':
      case '/dashboard/pendientes':
      case '/dashboard/pendientes/cobrar':
      case '/dashboard/pendientes/efectivo':
        return (
          <DashboardPage 
            excelData={excelData} 
            analyticsFile={analyticsFile} 
            onAnalyticsFileChange={onAnalyticsFileChange} 
            onClearAnalyticsFile={onClearAnalyticsFile}
            currentRoute={currentRoute}
            onRequestOpenUploader={onNavigate}
          />
        );
      
      case '/reportes/servicios':
      case '/reportes/pendientes':
        return (
          <UnifiedWorkflowCard
            archivoExcel={excelData}
            fechaInicio={fechaInicio}
            fechaFin={fechaFin}
            notas={note}
            imagenes={imagenes}
            onFileChange={onFileChange}
            onFechaInicioChange={onFechaInicioChange}
            onFechaFinChange={onFechaFinChange}
            onNoteChange={onNoteChange}
            onImageChange={onImageChange}
            onProcessData={onProcessData}
            onGeneratePDF={onGeneratePDF}
            processing={processing}
            animationState={animationState}
            workMode={workMode}
          />
        );
      
      case '/analytics':
        return (
          <Analytics 
            excelData={analyticsFile}
            workMode={workMode}
            onFileChange={onAnalyticsFileChange}
            onClearFile={onClearAnalyticsFile}
          />
        );
      
      // ✅ NUEVO: Caso para registrar gasto
      case '/registrar-gasto':
      return (
        <UnifiedGastoWorkflow
          gastoData={gastoData}
          onGastoChange={onGastoChange}
          imagenes={imagenes}
          onImageChange={onImageChange}
          processing={processing}
          onGeneratePDF={onGeneratePDF}
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
      <motion.div variants={STAGGER_ITEM_VARIANTS}>
        {renderRouteContent()}
      </motion.div>
    </motion.div>
  );
}

export default ContentArea;