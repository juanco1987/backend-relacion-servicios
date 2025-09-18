import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import CustomButton from '../../common/CustomButton';
import { motion } from 'framer-motion';
import { useTheme } from '../../../context/ThemeContext';
import { ANIMATIONS } from '../../../config/animations';
import excelIcon from '../../../assets/document_microsoft_excel.png';
import engraneIcon from '../../../assets/engrane.png';

function NoDataState({ onFileChange }) {
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
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        <Box
          component="img"
          src={excelIcon}
          alt="Excel Analytics"
          sx={{ 
            width: { xs: 60, md: 80 }, 
            height: { xs: 60, md: 80 },
            mb: 3,
            filter: theme.modo === 'oscuro' ? 'invert(1)' : 'none',
            opacity: 0.8
          }}
        />
        
        <Typography variant="h4" sx={{
          color: theme.textoPrincipal,
          fontWeight: 'bold',
          mb: 2,
          fontSize: { xs: '1.8rem', md: '2.2rem' }
        }}>
          📊 Analytics Dashboard
        </Typography>
        
        <Typography variant="h6" sx={{
          color: theme.textoSecundario,
          mb: 4,
          lineHeight: 1.6,
          maxWidth: 600
        }}>
          Para visualizar tus estadísticas y análisis financieros, 
          carga tu archivo Excel con los datos de Analytics
        </Typography>

        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 4,
          p: 3,
          borderRadius: '16px',
          background: theme.fondoOverlay,
          border: `2px dashed ${theme.bordePrincipal}`,
          maxWidth: 400,
          width: '100%'
        }}>
          <Box
            component="img"
            src={engraneIcon}
            alt="Configuración"
            sx={{ 
              width: 24, 
              height: 24,
              mr: 2,
              filter: theme.modo === 'oscuro' ? 'invert(1)' : 'none'
            }}
          />
          <Typography variant="body1" sx={{
            color: theme.textoPrincipal,
            fontWeight: 500
          }}>
            Formato soportado: .xlsx, .xls
          </Typography>
        </Box>

        {/* Campo de carga */}
        <Box sx={{ width: '100%', maxWidth: 500, mb: 3 }}>          
          <motion.div
            whileHover={ANIMATIONS.formFieldHover}
            whileTap={{ scale: 0.98 }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', justifyContent: 'center' }}>
              <CustomButton
                variant="outlined"
                component="label"
                size="large"
                sx={{
                  background: theme.fondoOverlay,
                  color: theme.textoPrincipal,
                  borderColor: theme.bordePrincipal,
                  borderRadius: '25px',
                  px: 4,
                  py: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  borderWidth: '2px',
                  minWidth: '200px',
                  height: '50px',
                  boxShadow: theme.sombraContenedor,
                  '&:hover': {
                    background: theme.fondoHover,
                    borderColor: theme.bordeHover,
                    transform: 'translateY(-2px)',
                    boxShadow: theme.sombraHover,
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '&:focus': {
                    borderColor: theme.bordeHover,
                    borderWidth: '2px',
                  }
                }}
              >
                📁 Seleccionar Archivo Excel
                <input
                  type="file"
                  hidden
                  accept=".xlsx,.xls"
                  onChange={onFileChange}
                />
              </CustomButton>
            </Box>
          </motion.div>
        </Box>

        <Typography variant="body2" sx={{
          color: theme.textoSecundario,
          fontStyle: 'italic'
        }}>
          Una vez cargado, podrás ver gráficos, KPIs y resúmenes detallados
        </Typography>
      </Paper>
    </motion.div>
  );
}

export default NoDataState;