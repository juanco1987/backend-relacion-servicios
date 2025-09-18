import React from 'react';
import { Box, Typography } from '@mui/material';
import CustomButton from '../../common/CustomButton';
import { useTheme } from '../../../context/ThemeContext';
import excelIcon from '../../../assets/document_microsoft_excel.png';

function FileControlSection({ 
  analyticsFile, 
  excelData, 
  onFileChange, 
  inputKey 
}) {
  const { theme } = useTheme();

  return (
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
      
      <CustomButton
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
          onChange={onFileChange}
        />
      </CustomButton>
    </Box>
  );
}

export default FileControlSection;