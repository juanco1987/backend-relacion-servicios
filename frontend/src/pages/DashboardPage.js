import React, { useState } from 'react';
import { Box, Typography, Grid, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import Analytics from '../components/analytics/Analytics';
import EnhancedAnalyticsDashboard from '../components/analytics/EnhancedAnalyticsDashboard';
import { STAGGER_VARIANTS, STAGGER_ITEM_VARIANTS } from '../config/animations';

function DashboardPage({ excelData }) {
  const { theme } = useTheme();
  const [showFullDashboard, setShowFullDashboard] = useState(false);

  const handleStartAnalysis = () => {
    if (excelData) {
      setShowFullDashboard(true);
    }
  };

  const handleBackToOverview = () => {
    setShowFullDashboard(false);
  };

  if (showFullDashboard && excelData) {
    return (
      <motion.div
        variants={STAGGER_VARIANTS}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={STAGGER_ITEM_VARIANTS}>
          <Box sx={{ mb: 3 }}>
            <Button
              onClick={handleBackToOverview}
              variant="outlined"
              sx={{
                borderRadius: '20px',
                borderColor: theme.bordePrincipal,
                color: theme.textoPrincipal,
                '&:hover': {
                  borderColor: theme.bordeHover,
                  backgroundColor: theme.fondoContenedor
                }
              }}
            >
              ← Volver al Resumen
            </Button>
          </Box>
          
          <EnhancedAnalyticsDashboard 
            file={excelData}
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
        <Analytics excelData={excelData} workMode={0} />
      </motion.div>

      {/* Botón para acceder al Dashboard Completo */}
      {excelData && (
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
            <Button
              onClick={handleStartAnalysis}
              variant="contained"
              sx={{
                borderRadius: '25px',
                backgroundColor: theme.textoInfo,
                color: 'white',
                px: 3,
                py: 1.5,
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: theme.textoAdvertencia
                }
              }}
            >
              Ver Dashboard Completo
            </Button>
          </Box>
        </motion.div>
      )}
    </motion.div>
  );
}

export default DashboardPage; 