import React, { useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import CustomButton from '../components/common/CustomButton';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import Analytics from '../components/analytics/Analytics';
import EnhancedAnalyticsDashboard from '../components/analytics/EnhancedAnalyticsDashboard';
import { STAGGER_VARIANTS, STAGGER_ITEM_VARIANTS } from '../config/animations';

function DashboardPage({ excelData, analyticsFile, onAnalyticsFileChange, onClearAnalyticsFile }) {
  const { theme } = useTheme();
  const [showFullDashboard, setShowFullDashboard] = useState(false);

  const fileForAnalytics = analyticsFile || excelData;

  const handleStartAnalysis = () => {
    if (fileForAnalytics) {
      setShowFullDashboard(true);
    }
  };

  const handleBackToOverview = () => {
    setShowFullDashboard(false);
  };

  if (showFullDashboard && fileForAnalytics) {
    return (
      <motion.div
        variants={STAGGER_VARIANTS}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={STAGGER_ITEM_VARIANTS}>
          <Box sx={{ mb: 3 }}>
            <CustomButton
              onClick={handleBackToOverview}
              variant="outlined"
              sx={{
                borderColor: theme.gradientes.botonProcesar,
                color: theme.gradientes.botonProcesar,
                '&:hover': {
                  borderColor: theme.gradientes.botonProcesar,
                  opacity: 0.9
                }
              }}
            >
              ← Volver al Resumen
            </CustomButton>
          </Box>
          
          <EnhancedAnalyticsDashboard 
            file={fileForAnalytics}
            fechaInicio="2024-01-01"
            fechaFin="2024-12-31"
          />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={STAGGER_VARIANTS}
      initial="hidden"
      animate="visible"
    >
      {/* Dashboard Original de Analytics */}
      <motion.div variants={STAGGER_ITEM_VARIANTS}>
                  <Analytics excelData={fileForAnalytics} workMode={0} onFileChange={onAnalyticsFileChange} onClearFile={onClearAnalyticsFile} />
      </motion.div>

      {/* Botón para acceder al Dashboard Completo */}
      {fileForAnalytics && (
        <motion.div variants={STAGGER_ITEM_VARIANTS}>
          <Box sx={{ 
            background: theme.fondoContenedor,
            borderRadius: '20px',
            boxShadow: theme.sombraContenedor,
            p: 3,
            mb: 4,
            marginTop: 3,
            textAlign: 'center'
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: theme.textoPrincipal,
                fontWeight: 600,
                mb: 2
              }}
            >
              🚀 ¿Quieres ver el Dashboard Completo?
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.textoSecundario,
                mb: 3
              }}
            >
              Accede a análisis detallados por vendedores, clientes, servicios y más
            </Typography>
            <CustomButton
              onClick={handleStartAnalysis}
              variant="contained"
              color="info"
            >
              Ver Dashboard Completo
            </CustomButton>
          </Box>
        </motion.div>
      )}
    </motion.div>
  );
}

export default DashboardPage; 