import React from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '../../../context/ThemeContext';
import FileControlSection from './FileControlSection';

function LoadingState({ 
  analyticsFile, 
  excelData, 
  onFileChange, 
  inputKey 
}) {
  const { theme } = useTheme();

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
        <FileControlSection
          analyticsFile={analyticsFile}
          excelData={excelData}
          onFileChange={onFileChange}
          inputKey={inputKey}
        />
        
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

export default LoadingState;