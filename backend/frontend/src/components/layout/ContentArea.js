import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { STAGGER_VARIANTS, STAGGER_ITEM_VARIANTS } from '../../config/animations';
import UnifiedWorkflowCard from '../UnifiedWorkflowCard';
import Analytics from '../analytics/Analytics';
import DashboardPage from '../../pages/DashboardPage';
import { useTheme } from '../../context/ThemeContext';

function ContentArea({ 
  currentRoute,
  excelData,
  analyticsFile,
  fechaInicio,
  fechaFin,
  note,
  imagenes,
  onFileChange,
  onAnalyticsFileChange,
  onFechaInicioChange,
  onFechaFinChange,
  onNoteChange,
  onImageChange,
  onProcessData,
  onGeneratePDF,
  processing,
  animationState,
  onClearAnalyticsFile,
}) {
  const { theme } = useTheme();

  // Debug log para excelData
  useEffect(() => {
    console.log('ContentArea excelData:', excelData);
  }, [excelData]);

  // Debug log para handlers
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

  // Determinar el modo de trabajo basado en la ruta
  const getWorkMode = (route) => {
    switch(route) {
      case '/reportes/servicios':
        return 0; // Relación de Servicios
      case '/reportes/pendientes':
        return 1; // Pendientes de Pago
      default:
        return 0;
    }
  };

  const workMode = getWorkMode(currentRoute);
  
  // Renderizar contenido específico según la ruta
  const renderRouteContent = () => {
    switch(currentRoute) {
      case '/':
      case '/dashboard':
        return (
          <DashboardPage 
            excelData={excelData} 
            analyticsFile={analyticsFile} 
            onAnalyticsFileChange={onAnalyticsFileChange} 
            onClearAnalyticsFile={onClearAnalyticsFile}
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

      {/* Contenido específico según la ruta */}
      <motion.div variants={STAGGER_ITEM_VARIANTS}>
        {renderRouteContent()}
      </motion.div>
    </motion.div>
  );
}

export default ContentArea; 