import React from 'react';
import { motion } from 'framer-motion';
import Analytics from '../components/analytics/Analytics';
import EnhancedAnalyticsDashboard from '../components/analytics/EnhancedAnalyticsDashboard';
import { STAGGER_VARIANTS, STAGGER_ITEM_VARIANTS } from '../config/animations';

function DashboardPage({ excelData, analyticsFile, onAnalyticsFileChange, onClearAnalyticsFile, currentRoute, onRequestOpenUploader }) {
  const fileForAnalytics = analyticsFile || excelData;

  // Determinar qué vista mostrar basado en la ruta
  const getViewFromRoute = () => {
    if (!currentRoute) return 'general';
    
    if (currentRoute === '/dashboard' || currentRoute === '/') {
      return 'general';
    }
    
    if (currentRoute.includes('/dashboard/pendientes/cobrar')) {
      return 'pendientes-cobrar';
    }
    
    if (currentRoute.includes('/dashboard/pendientes/efectivo')) {
      return 'pendientes-efectivo';
    }
    
    // Extraer la vista de la ruta: /dashboard/general -> 'general'
    const routeParts = currentRoute.split('/');
    if (routeParts.length >= 3) {
      return routeParts[2]; // 'general', 'clientes', 'servicios', 'pendientes'
    }
    
    return 'general';
  };

  const selectedView = getViewFromRoute();

  // Si es una ruta de dashboard completo, mostrar EnhancedAnalyticsDashboard
  if (currentRoute && currentRoute.startsWith('/dashboard/') && currentRoute !== '/dashboard') {
    return (
      <motion.div
        variants={STAGGER_VARIANTS}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={STAGGER_ITEM_VARIANTS}>
          <EnhancedAnalyticsDashboard 
            file={fileForAnalytics}
            fechaInicio="2024-01-01"
            fechaFin="2024-12-31"
            defaultView={selectedView}
            onRequestOpenUploader={onRequestOpenUploader}
          />
        </motion.div>
      </motion.div>
    );
  }

  // Si es /dashboard o /, mostrar el resumen (Analytics)
  return (
    <motion.div
      variants={STAGGER_VARIANTS}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={STAGGER_ITEM_VARIANTS}>
        <Analytics 
          excelData={fileForAnalytics} 
          workMode={0} 
          onFileChange={onAnalyticsFileChange} 
          onClearFile={onClearAnalyticsFile} 
        />
      </motion.div>
    </motion.div>
  );
}

export default DashboardPage; 