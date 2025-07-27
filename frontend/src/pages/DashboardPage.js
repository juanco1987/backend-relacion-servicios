import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import Analytics from '../components/analytics/Analytics';
import { STAGGER_VARIANTS, STAGGER_ITEM_VARIANTS } from '../config/animations';

function DashboardPage({ excelData }) {
  const { theme } = useTheme();

  return (
    <motion.div
      variants={STAGGER_VARIANTS}
      initial="hidden"
      animate="visible"
    >
      {/* Componente Analytics - Sin tarjeta contenedora */}
      <motion.div variants={STAGGER_ITEM_VARIANTS}>
        <Analytics excelData={excelData} workMode={0} />
      </motion.div>

      {/* Información adicional del sistema */}
      <motion.div variants={STAGGER_ITEM_VARIANTS}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              background: theme.fondoContenedor,
              borderRadius: '20px',
              boxShadow: theme.sombraContenedor,
              p: 3,
              height: '100%'
            }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: theme.textoPrincipal,
                  fontWeight: 600,
                  mb: 2
                }}
              >
                🚀 Accesos Rápidos
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: theme.textoSecundario,
                  mb: 2
                }}
              >
                • Generar Reportes PDF
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: theme.textoSecundario,
                  mb: 2
                }}
              >
                • Ver Servicios Pendientes
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: theme.textoSecundario
                }}
              >
                • Análisis Detallado
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              background: theme.fondoContenedor,
              borderRadius: '20px',
              boxShadow: theme.sombraContenedor,
              p: 3,
              height: '100%'
            }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: theme.textoPrincipal,
                  fontWeight: 600,
                  mb: 2
                }}
              >
                ℹ️ Estado del Sistema
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: theme.textoSecundario,
                  mb: 2
                }}
              >
                ✅ Sistema operativo
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: theme.textoSecundario,
                  mb: 2
                }}
              >
                ✅ Backend conectado
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: theme.textoSecundario
                }}
              >
                ✅ Base de datos activa
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </motion.div>
    </motion.div>
  );
}

export default DashboardPage; 